// app/api/features/finalize/route.ts

import { NextResponse } from 'next/server';
import { requireAuth, canAccessFeatureRequest } from '@/lib/auth';
import { featureQueries } from '@/lib/db';
import { synthesizeRequirements } from '@/lib/claude';
import { sendAdminNotification } from '@/lib/notifications';
import type { FinalizeFeatureRequestBody, FinalizeFeatureRequestResponse } from '@/types/features';

export async function POST(req: Request) {
  try {
    // Authenticate user
    const user = await requireAuth(req);
    
    // Parse request body
    const body: FinalizeFeatureRequestBody = await req.json();
    
    // Validate input
    if (!body.featureId) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    // Check access
    const hasAccess = await canAccessFeatureRequest(user.id, body.featureId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Feature request not found or access denied' },
        { status: 404 }
      );
    }

    // Get feature request
    const feature = await featureQueries.findById(body.featureId);
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    if (feature.status !== 'refining') {
      return NextResponse.json(
        { error: 'Feature request is no longer in refinement stage' },
        { status: 400 }
      );
    }

    // Synthesize final requirements using Claude
    const chatHistory = feature.chat_history || [];
    const synthesized = await synthesizeRequirements(
      feature.initial_request,
      chatHistory
    );

    // Format final requirements as markdown
    const finalRequirements = `# ${synthesized.summary}

## Requirements
${synthesized.requirements}

## Acceptance Criteria
${synthesized.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Technical Details
**Estimated Complexity:** ${synthesized.estimatedComplexity}

**Files Likely Modified:**
${synthesized.filesLikelyModified.map(f => `- ${f}`).join('\n')}

**Tags:** ${synthesized.tags.join(', ')}
`;

    // Update feature request
    await featureQueries.finalize(body.featureId, finalRequirements);

    // Update tags and complexity in database
    await featureQueries.updateMetadata(body.featureId, {
      tags: synthesized.tags,
      estimatedComplexity: synthesized.estimatedComplexity,
    });

    // Notify admins
    await sendAdminNotification({
      type: 'new_feature_request',
      featureId: body.featureId,
      requestedBy: user.full_name,
      company: user.company_name || 'Unknown',
      summary: synthesized.summary,
      complexity: synthesized.estimatedComplexity,
    });

    const response: FinalizeFeatureRequestResponse = {
      success: true,
      synthesizedRequirements: synthesized,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error finalizing feature request:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to finalize feature request' },
      { status: 500 }
    );
  }
}
