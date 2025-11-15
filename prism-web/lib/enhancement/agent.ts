/**
 * Weekly Data Enhancement Agent
 * Automatically enriches software data for all clients on a weekly schedule
 */

import { sql } from '@/lib/db';
import { callAI, AIProvider } from '../ai/providers';
import { getAIConfig, logAIUsage } from '../ai/config';

export interface EnhancementResult {
  software_id: string;
  software_name: string;
  fields_enhanced: string[];
  before: Record<string, any>;
  after: Record<string, any>;
  confidence_score: number;
  success: boolean;
  error?: string;
}

export interface EnhancementConfig {
  enabled: boolean;
  fields_to_enhance: string[];
  ai_provider?: AIProvider;
  run_day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  run_hour: number; // 0-23
  last_run?: Date;
  next_run?: Date;
}

/**
 * Run enhancement for a single software
 */
export async function enhanceSoftware(
  softwareId: string,
  fieldsToEnhance: string[] = ['description', 'category', 'key_features', 'use_cases', 'integration_capabilities']
): Promise<EnhancementResult> {
  const startTime = Date.now();

  try {
    // Get software details
    const software = await sql`
      SELECT *
      FROM software
      WHERE id = ${softwareId}
      LIMIT 1
    `;

    if (software.length === 0) {
      throw new Error('Software not found');
    }

    const sw = software[0];

    // Build enhancement prompt
    const prompt = `Enrich this software data with accurate, comprehensive information:

**Software:** ${sw.software_name}
**Vendor:** ${sw.vendor_name}
**Current Data:**
${Object.entries(sw)
  .filter(([key]) => fieldsToEnhance.includes(key))
  .map(([key, value]) => `- ${key}: ${value || '(empty)'}`)
  .join('\n')}

Provide enhanced data in this JSON format:
{
  "description": "Comprehensive 2-3 sentence description",
  "category": "Primary category (Project Management, CRM, Communication, etc.)",
  "key_features": ["Feature 1", "Feature 2", "Feature 3", ...],
  "use_cases": ["Use case 1", "Use case 2", "Use case 3", ...],
  "integration_capabilities": ["Integration 1", "Integration 2", ...],
  "target_company_size": "Startup | SMB | Mid-Market | Enterprise",
  "deployment_model": "Cloud | On-Premise | Hybrid",
  "pricing_model": "Per User | Per Month | Usage-Based | Flat Fee",
  "support_channels": ["Email", "Phone", "Chat", "Forum", ...],
  "compliance_certifications": ["SOC 2", "GDPR", "HIPAA", ...],
  "api_available": true/false,
  "mobile_apps": true/false,
  "free_trial_available": true/false,
  "confidence_score": 0.0-1.0
}

Only include fields that you can confidently enhance. If unsure, omit the field.`;

    // Get AI config for enrichment task
    const aiConfig = await getAIConfig('bulk_feature_enrichment');
    const aiStartTime = Date.now();

    const response = await callAI(prompt, aiConfig);

    const aiLatency = Date.now() - aiStartTime;

    // Log AI usage
    await logAIUsage({
      taskType: 'bulk_feature_enrichment',
      provider: response.provider,
      model: response.model,
      inputTokens: Math.floor((prompt.length / 4) * 1.3), // Estimate
      outputTokens: Math.floor((response.content.length / 4) * 1.3),
      estimatedCost: response.cost_estimate,
      latencyMs: aiLatency,
      companyId: sw.company_id,
    });

    // Extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const enhancedData = JSON.parse(jsonMatch[0]);
    const confidenceScore = enhancedData.confidence_score || 0.8;

    // Capture before state
    const before: Record<string, any> = {};
    fieldsToEnhance.forEach(field => {
      before[field] = sw[field];
    });

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(enhancedData).forEach(([key, value]) => {
      if (key !== 'confidence_score' && fieldsToEnhance.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        // Convert arrays to JSON strings for storage
        values.push(Array.isArray(value) ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (updates.length > 0) {
      // Add last_enhanced timestamp
      updates.push(`last_enhanced = NOW()`);

      // Execute update using direct SQL call with parameters
      const queryText = `
        UPDATE software
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;
      values.push(softwareId);

      await sql(queryText, values);
    }

    const totalTime = Date.now() - startTime;

    return {
      software_id: softwareId,
      software_name: sw.software_name,
      fields_enhanced: Object.keys(enhancedData).filter(k => k !== 'confidence_score'),
      before,
      after: enhancedData,
      confidence_score: confidenceScore,
      success: true,
    };
  } catch (error) {
    console.error(`Enhancement failed for ${softwareId}:`, error);
    return {
      software_id: softwareId,
      software_name: 'Unknown',
      fields_enhanced: [],
      before: {},
      after: {},
      confidence_score: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run enhancement for all software in a company
 */
export async function enhanceCompanyPortfolio(
  companyId: string,
  config?: Partial<EnhancementConfig>
): Promise<{
  company_id: string;
  total_software: number;
  enhanced: number;
  failed: number;
  results: EnhancementResult[];
  duration_ms: number;
}> {
  const startTime = Date.now();

  try {
    // Get enhancement configuration
    const configResult = await sql`
      SELECT *
      FROM enhancement_schedules
      WHERE company_id = ${companyId}
      LIMIT 1
    `;

    const enhancementConfig = configResult[0] || {
      fields_to_enhance: ['description', 'category', 'key_features', 'use_cases'],
    };

    const fieldsToEnhance = config?.fields_to_enhance || enhancementConfig.fields_to_enhance;

    // Get all active software for this company
    const software = await sql`
      SELECT id, software_name
      FROM software
      WHERE company_id = ${companyId}
        AND status = 'active'
      ORDER BY software_name
    `;

    console.log(`Enhancing ${software.length} software for company ${companyId}`);

    const results: EnhancementResult[] = [];

    // Process in batches of 5 to avoid overwhelming the AI API
    const batchSize = 5;
    for (let i = 0; i < software.length; i += batchSize) {
      const batch = software.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(sw => enhanceSoftware(sw.id, fieldsToEnhance))
      );

      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < software.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const enhanced = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const duration = Date.now() - startTime;

    // Log enhancement run
    await sql`
      INSERT INTO enhancement_runs (
        company_id,
        total_software,
        enhanced_count,
        failed_count,
        duration_ms,
        results,
        created_at
      ) VALUES (
        ${companyId},
        ${software.length},
        ${enhanced},
        ${failed},
        ${duration},
        ${JSON.stringify(results)},
        NOW()
      )
    `;

    // Update last_run timestamp
    await sql`
      UPDATE enhancement_schedules
      SET last_run = NOW(),
          next_run = NOW() + INTERVAL '7 days'
      WHERE company_id = ${companyId}
    `;

    return {
      company_id: companyId,
      total_software: software.length,
      enhanced,
      failed,
      results,
      duration_ms: duration,
    };
  } catch (error) {
    console.error(`Portfolio enhancement failed for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Run enhancement for all companies with active schedules
 */
export async function runScheduledEnhancements(): Promise<{
  total_companies: number;
  successful: number;
  failed: number;
  results: any[];
}> {
  console.log('Running scheduled enhancements...');

  try {
    // Get companies that need enhancement
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    const schedules = await sql`
      SELECT *
      FROM enhancement_schedules
      WHERE enabled = true
        AND (
          next_run IS NULL
          OR next_run <= NOW()
          OR (run_day_of_week = ${dayOfWeek} AND run_hour = ${hour})
        )
    `;

    console.log(`Found ${schedules.length} companies to enhance`);

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const schedule of schedules) {
      try {
        const result = await enhanceCompanyPortfolio(schedule.company_id, {
          fields_to_enhance: schedule.fields_to_enhance,
        });

        results.push(result);
        successful++;

        console.log(
          `✓ Enhanced ${result.enhanced}/${result.total_software} software for company ${schedule.company_id}`
        );
      } catch (error) {
        failed++;
        console.error(`✗ Failed to enhance company ${schedule.company_id}:`, error);
        results.push({
          company_id: schedule.company_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Delay between companies to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      total_companies: schedules.length,
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('Scheduled enhancement run failed:', error);
    throw error;
  }
}

/**
 * Get enhancement schedule for a company
 */
export async function getEnhancementSchedule(companyId: string): Promise<EnhancementConfig | null> {
  const result = await sql`
    SELECT *
    FROM enhancement_schedules
    WHERE company_id = ${companyId}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0] as EnhancementConfig;
}

/**
 * Update enhancement schedule
 */
export async function updateEnhancementSchedule(
  companyId: string,
  config: Partial<EnhancementConfig>
): Promise<void> {
  await sql`
    INSERT INTO enhancement_schedules (
      company_id,
      enabled,
      fields_to_enhance,
      ai_provider,
      run_day_of_week,
      run_hour,
      next_run,
      updated_at
    ) VALUES (
      ${companyId},
      ${config.enabled ?? true},
      ${JSON.stringify(config.fields_to_enhance || ['description', 'category', 'key_features'])},
      ${config.ai_provider || 'gemini'},
      ${config.run_day_of_week ?? 1},
      ${config.run_hour ?? 2},
      NOW() + INTERVAL '7 days',
      NOW()
    )
    ON CONFLICT (company_id)
    DO UPDATE SET
      enabled = EXCLUDED.enabled,
      fields_to_enhance = EXCLUDED.fields_to_enhance,
      ai_provider = EXCLUDED.ai_provider,
      run_day_of_week = EXCLUDED.run_day_of_week,
      run_hour = EXCLUDED.run_hour,
      next_run = CASE
        WHEN EXCLUDED.enabled = true THEN NOW() + INTERVAL '7 days'
        ELSE NULL
      END,
      updated_at = NOW()
  `;
}
