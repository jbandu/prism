// app/api/admin/features/build/route.ts

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAdmin } from '@/lib/auth';
import { featureQueries, query } from '@/lib/db';
import { generateImplementationInstructions } from '@/lib/claude';
import { 
  createFeatureIssue, 
  createPullRequest, 
  checkPRStatus,
  mergePullRequest,
  addIssueComment,
} from '@/lib/github';
import { getPreviewUrl, triggerProductionDeployment } from '@/lib/vercel';
import { sendInterventionEmail, sendUserNotification } from '@/lib/notifications';
import type { BuildFeatureBody, BuildFeatureResponse } from '@/types/features';

const execAsync = promisify(exec);

export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
  let featureData: any = null;
  let issueNumber: number | null = null;
  let attemptId: string | null = null;
  let body: BuildFeatureBody | null = null;

  try {
    // Require admin authentication
    await requireAdmin(req);

    // Parse request body
    body = await req.json();

    // Validate input
    if (!body || !body.requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get feature request
    featureData = await featureQueries.findById(body.requestId);
    
    if (!featureData) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (featureData.status !== 'approved') {
      return NextResponse.json(
        { error: 'Feature request is not approved' },
        { status: 400 }
      );
    }

    // Parse synthesized requirements
    const requirementsMatch = featureData.final_requirements.match(/## Requirements\n([\s\S]*?)\n##/);
    const requirements = requirementsMatch ? requirementsMatch[1] : featureData.final_requirements;
    
    const filesMatch = featureData.final_requirements.match(/\*\*Files Likely Modified:\*\*\n([\s\S]*?)\n/);
    const filesText = filesMatch ? filesMatch[1] : '';
    const filesLikelyModified = filesText
      .split('\n')
      .filter((line: string) => line.startsWith('- '))
      .map((line: string) => line.substring(2).trim());

    const complexityMatch = featureData.final_requirements.match(/\*\*Estimated Complexity:\*\* (\w+)/);
    const complexity = complexityMatch ? complexityMatch[1] : 'simple';

    const tagsMatch = featureData.final_requirements.match(/\*\*Tags:\*\* (.+)/);
    const tags = tagsMatch ? tagsMatch[1].split(', ') : [];

    // Update status to building
    await featureQueries.updateBuildStatus(body.requestId, 'building', {
      buildStartedAt: new Date(),
    });

    // Create build attempt
    const attemptResult = await query<{ id: string }>(`
      INSERT INTO build_attempts (
        feature_request_id,
        attempt_number,
        status
      ) VALUES ($1, 1, 'running')
      RETURNING id
    `, [body.requestId]);
    
    attemptId = attemptResult.rows[0].id;

    console.log('🚀 Starting autonomous build for feature:', body.requestId);

    // STEP 1: Create GitHub issue
    console.log('📝 Creating GitHub issue...');
    const issue = await createFeatureIssue({
      featureId: body.requestId,
      title: featureData.initial_request.substring(0, 100),
      requestedBy: featureData.requested_by_name,
      company: featureData.company_name,
      initialRequest: featureData.initial_request,
      finalRequirements: featureData.final_requirements,
      estimatedComplexity: complexity,
      tags,
    });

    issueNumber = issue.number;

    await featureQueries.updateBuildStatus(body.requestId, 'building', {
      githubIssueUrl: issue.htmlUrl,
    });

    console.log('✅ GitHub issue created:', issue.htmlUrl);

    // STEP 2: Generate implementation instructions
    console.log('🤖 Generating implementation instructions...');
    const instructions = await generateImplementationInstructions(
      requirements,
      filesLikelyModified
    );

    // STEP 3: Run Claude Code to generate code
    console.log('💻 Running Claude Code...');
    const branchName = `feature/auto-${body.requestId.substring(0, 8)}`;
    
    const buildResult = await runClaudeCode({
      instructions,
      branchName,
      featureId: body.requestId,
      attemptId,
    });

    if (!buildResult.success) {
      throw new Error(buildResult.error || 'Claude Code execution failed');
    }

    console.log('✅ Code generated successfully');

    // STEP 4: Create Pull Request
    console.log('📬 Creating pull request...');
    const pr = await createPullRequest({
      branch: branchName,
      title: `feat: ${featureData.initial_request.substring(0, 100)}`,
      body: `## Autonomous Feature Implementation

**Feature ID:** ${body.requestId}
**Requested by:** ${featureData.requested_by_name} (${featureData.company_name})

### Requirements
${requirements}

### Files Modified
${buildResult.filesModified.map(f => `- ${f}`).join('\n')}

### Implementation
This feature was implemented automatically by Claude Code.

### Testing
- [ ] Manual testing required
- [ ] Automated tests passing

Closes #${issue.number}
`,
      issueNumber: issue.number,
    });

    await featureQueries.updateBuildStatus(body.requestId, 'building', {
      githubPrUrl: pr.htmlUrl,
    });

    console.log('✅ Pull request created:', pr.htmlUrl);

    // STEP 5: Wait for Vercel preview deployment
    console.log('🚀 Waiting for Vercel preview deployment...');
    const previewUrl = await getPreviewUrl(branchName);

    if (previewUrl) {
      await featureQueries.updateBuildStatus(body.requestId, 'testing', {
        vercelPreviewUrl: previewUrl,
      });
      console.log('✅ Preview deployed:', previewUrl);
    }

    // STEP 6: Wait for CI checks to complete
    console.log('🧪 Waiting for tests...');
    const checksResult = await waitForChecks(pr.number, 180000); // 3 minutes

    if (checksResult.state !== 'success') {
      throw new Error(`Tests failed: ${checksResult.checksPassed}/${checksResult.checksRun} checks passed`);
    }

    console.log('✅ All tests passed');

    // STEP 7: Auto-merge PR
    console.log('🔀 Merging pull request...');
    await mergePullRequest(pr.number);
    
    console.log('✅ Pull request merged');

    // STEP 8: Trigger production deployment
    console.log('🌐 Deploying to production...');
    // Vercel auto-deploys on merge to main, just wait for it
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s for deployment

    // STEP 9: Mark as deployed
    await featureQueries.updateBuildStatus(body.requestId, 'deployed', {
      buildCompletedAt: new Date(),
      buildLogs: buildResult.logs,
    });

    await query(`
      UPDATE build_attempts
      SET 
        status = 'success',
        completed_at = NOW(),
        files_modified = $1,
        stdout = $2,
        preview_url = $3
      WHERE id = $4
    `, [
      buildResult.filesModified,
      buildResult.logs,
      previewUrl,
      attemptId,
    ]);

    console.log('✅ Feature deployed successfully!');

    // Add success comment to issue
    await addIssueComment(
      issue.number,
      `✅ **Feature deployed successfully!**\n\nPreview: ${previewUrl}\nPR: ${pr.htmlUrl}\n\nThis feature is now live in production.`
    );

    // Notify user
    await sendUserNotification({
      userId: featureData.requested_by_user_id,
      type: 'feature_deployed',
      subject: '🎉 Your feature is live!',
      message: `Your feature "${featureData.initial_request}" has been deployed and is now live in production!`,
      featureId: body.requestId,
      previewUrl: previewUrl || undefined,
    });

    const response: BuildFeatureResponse = {
      success: true,
      buildId: attemptId,
      previewUrl: previewUrl || undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Build failed:', error);

    // Determine which stage failed
    const stage = !issueNumber ? 'github_issue' :
                  !attemptId ? 'build_attempt' :
                  'code_generation';

    // Update feature status to failed
    if (featureData && body) {
      await featureQueries.updateBuildStatus(body.requestId, 'failed', {
        buildCompletedAt: new Date(),
        buildError: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Update build attempt
    if (attemptId) {
      await query(`
        UPDATE build_attempts
        SET
          status = 'failed',
          completed_at = NOW(),
          error_message = $1,
          intervention_required = TRUE
        WHERE id = $2
      `, [error instanceof Error ? error.message : 'Unknown error', attemptId]);
    }

    // Send intervention email
    if (body) {
      await sendInterventionEmail({
        featureId: body.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: error instanceof Error ? error.stack : undefined,
        stage,
      });
    }

    const response: BuildFeatureResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Helper: Run Claude Code
async function runClaudeCode(data: {
  instructions: string;
  branchName: string;
  featureId: string;
  attemptId: string;
}): Promise<{
  success: boolean;
  error?: string;
  logs?: string;
  filesModified: string[];
}> {
  try {
    // Write instructions to temp file
    const instructionsPath = `/tmp/feature-${data.featureId}.md`;
    const fs = require('fs');
    fs.writeFileSync(instructionsPath, data.instructions);

    // Run Claude Code CLI
    const command = `
      cd /path/to/prism &&
      git checkout -b ${data.branchName} &&
      claude-code --file ${instructionsPath} --yes &&
      git add . &&
      git commit -m "feat: Autonomous implementation of feature ${data.featureId}" &&
      git push origin ${data.branchName}
    `;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Parse git diff to get files modified
    const { stdout: diffStdout } = await execAsync(
      `cd /path/to/prism && git diff --name-only main...${data.branchName}`
    );

    const filesModified = diffStdout.trim().split('\n').filter(f => f.length > 0);

    return {
      success: true,
      logs: stdout + '\n' + stderr,
      filesModified,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unknown error',
      logs: (error?.stdout || '') + '\n' + (error?.stderr || ''),
      filesModified: [],
    };
  }
}

// Helper: Wait for PR checks to complete
async function waitForChecks(
  prNumber: number,
  maxWaitMs: number
): Promise<{ state: 'success' | 'failure' | 'pending'; checksRun: number; checksPassed: number }> {
  const startTime = Date.now();
  const pollInterval = 10000; // 10 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkPRStatus(prNumber);

    if (status.state === 'success' || status.state === 'failure') {
      return status;
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Timeout waiting for CI checks');
}
