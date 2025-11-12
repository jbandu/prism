/**
 * AI Provider Configuration Management
 * Fetches provider config from database and tracks usage
 */

import { sql } from '@/lib/db';
import { AIProvider, AIConfig } from './providers';

/**
 * Get AI provider configuration for a specific task type
 */
export async function getAIConfig(taskType: string): Promise<AIConfig> {
  try {
    const config = await sql`
      SELECT *
      FROM ai_provider_config
      WHERE task_type = ${taskType}
        AND enabled = true
      LIMIT 1
    `;

    if (config.length > 0) {
      return {
        provider: config[0].provider as AIProvider,
        model: config[0].model,
        temperature: parseFloat(config[0].temperature || '0'),
        max_tokens: config[0].max_tokens,
      };
    }

    // Default fallback
    return {
      provider: 'claude',
      temperature: 0,
      max_tokens: 4096,
    };
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
    // Fallback to Claude if database query fails
    return {
      provider: 'claude',
      temperature: 0,
      max_tokens: 4096,
    };
  }
}

/**
 * Log AI usage for tracking and cost monitoring
 */
export async function logAIUsage(params: {
  taskType: string;
  provider: AIProvider;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  latencyMs?: number;
  status?: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  companyId?: string;
  userId?: string;
}): Promise<void> {
  try {
    const totalTokens = (params.inputTokens || 0) + (params.outputTokens || 0);

    await sql`
      INSERT INTO ai_usage_logs (
        task_type,
        provider,
        model,
        input_tokens,
        output_tokens,
        total_tokens,
        estimated_cost,
        latency_ms,
        status,
        error_message,
        company_id,
        user_id,
        created_at
      ) VALUES (
        ${params.taskType},
        ${params.provider},
        ${params.model},
        ${params.inputTokens || 0},
        ${params.outputTokens || 0},
        ${totalTokens},
        ${params.estimatedCost || 0},
        ${params.latencyMs || null},
        ${params.status || 'success'},
        ${params.errorMessage || null},
        ${params.companyId || null},
        ${params.userId || null},
        NOW()
      )
    `;
  } catch (error) {
    // Don't throw - logging failure shouldn't break the main flow
    console.error('Failed to log AI usage:', error);
  }
}

/**
 * Get AI usage statistics
 */
export async function getAIUsageStats(params: {
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  provider?: AIProvider;
}) {
  try {
    let query = sql`
      SELECT
        provider,
        COUNT(*) as request_count,
        SUM(total_tokens) as total_tokens,
        SUM(estimated_cost) as total_cost,
        AVG(latency_ms) as avg_latency_ms,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
      FROM ai_usage_logs
      WHERE 1=1
    `;

    if (params.companyId) {
      query = sql`${query} AND company_id = ${params.companyId}`;
    }

    if (params.startDate) {
      query = sql`${query} AND created_at >= ${params.startDate.toISOString()}`;
    }

    if (params.endDate) {
      query = sql`${query} AND created_at <= ${params.endDate.toISOString()}`;
    }

    if (params.provider) {
      query = sql`${query} AND provider = ${params.provider}`;
    }

    query = sql`${query} GROUP BY provider ORDER BY total_cost DESC`;

    const stats = await query;

    return stats;
  } catch (error) {
    console.error('Failed to fetch AI usage stats:', error);
    return [];
  }
}
