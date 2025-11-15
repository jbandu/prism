// lib/db.ts
// FIXED: Removed Pool to prevent connection leaks in serverless environment
// FIXED: Added singleton pattern for Neon serverless driver
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Singleton pattern to prevent multiple connections in serverless
declare global {
  var _neonSql: NeonQueryFunction<false, false> | undefined;
}

const getNeonSql = (): NeonQueryFunction<false, false> => {
  if (!global._neonSql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    global._neonSql = neon(process.env.DATABASE_URL);
  }
  return global._neonSql;
};

// Export sql for use throughout the application
export const sql = getNeonSql();

// Typed query helpers for features
export const featureQueries = {
  create: async (data: {
    requestedByUserId: string;
    companyId: string;
    initialRequest: string;
  }) => {
    const result = await sql`
      INSERT INTO feature_requests (
        requested_by_user_id,
        company_id,
        initial_request,
        status,
        chat_history
      ) VALUES (${data.requestedByUserId}, ${data.companyId}, ${data.initialRequest}, 'refining', '[]'::jsonb)
      RETURNING id
    `;

    return result[0];
  },

  findById: async (id: string) => {
    const result = await sql`
      SELECT
        fr.*,
        u.full_name as requested_by_name,
        u.email as requested_by_email,
        c.company_name,
        admin.full_name as reviewed_by_name
      FROM feature_requests fr
      LEFT JOIN users u ON fr.requested_by_user_id = u.id
      LEFT JOIN companies c ON fr.company_id = c.id
      LEFT JOIN users admin ON fr.reviewed_by_user_id = admin.id
      WHERE fr.id = ${id}
    `;

    return result[0];
  },

  updateChatHistory: async (id: string, chatHistory: any[]) => {
    await sql`
      UPDATE feature_requests
      SET
        chat_history = ${JSON.stringify(chatHistory)},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  },

  finalize: async (id: string, finalRequirements: string) => {
    await sql`
      UPDATE feature_requests
      SET
        final_requirements = ${finalRequirements},
        requirements_finalized_at = NOW(),
        status = 'submitted',
        updated_at = NOW()
      WHERE id = ${id}
    `;
  },

  listPending: async () => {
    const result = await sql`
      SELECT
        fr.*,
        u.full_name as requested_by_name,
        u.email as requested_by_email,
        c.company_name,
        (
          SELECT COUNT(*)::int
          FROM feature_votes
          WHERE feature_request_id = fr.id AND vote_type = 'upvote'
        ) as upvotes
      FROM feature_requests fr
      LEFT JOIN users u ON fr.requested_by_user_id = u.id
      LEFT JOIN companies c ON fr.company_id = c.id
      WHERE fr.status = 'submitted'
      ORDER BY fr.created_at DESC
    `;

    return result;
  },

  approve: async (id: string, adminUserId: string) => {
    await sql`
      UPDATE feature_requests
      SET
        status = 'approved',
        reviewed_by_user_id = ${adminUserId},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  },

  reject: async (id: string, adminUserId: string, reason?: string) => {
    await sql`
      UPDATE feature_requests
      SET
        status = 'rejected',
        reviewed_by_user_id = ${adminUserId},
        reviewed_at = NOW(),
        admin_notes = ${reason || null},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  },

  // FIXED: SQL injection vulnerability
  // Before: Used string interpolation with ${updates.join(', ')} which could be exploited
  // After: Use safe Neon template tags with proper parameterization
  updateBuildStatus: async (
    id: string,
    status: string,
    data?: {
      buildStartedAt?: Date;
      buildCompletedAt?: Date;
      buildLogs?: string;
      buildError?: string;
      githubIssueUrl?: string;
      githubPrUrl?: string;
      vercelPreviewUrl?: string;
    }
  ) => {
    const {
      buildStartedAt,
      buildCompletedAt,
      buildLogs,
      buildError,
      githubIssueUrl,
      githubPrUrl,
      vercelPreviewUrl,
    } = data || {};

    // Use Neon's template tag syntax for safe parameterization
    await sql`
      UPDATE feature_requests
      SET
        status = ${status},
        build_started_at = COALESCE(${buildStartedAt || null}, build_started_at),
        build_completed_at = COALESCE(${buildCompletedAt || null}, build_completed_at),
        build_logs = COALESCE(${buildLogs || null}, build_logs),
        build_error = COALESCE(${buildError || null}, build_error),
        github_issue_url = COALESCE(${githubIssueUrl || null}, github_issue_url),
        github_pr_url = COALESCE(${githubPrUrl || null}, github_pr_url),
        vercel_preview_url = COALESCE(${vercelPreviewUrl || null}, vercel_preview_url),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  },
};

export interface Alternative {
  alternative_id: string;
  software_id: string;
  alternative_name: string;
  vendor_name: string;
  category: string;
  estimated_annual_cost: number;
  feature_match_score: number;
  feature_comparison: any;
  migration_complexity: string;
  migration_cost: number;
  potential_savings: number;
  recommendation_score: number;
  pros: string[];
  cons: string[];
  analysis_date: Date;
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await sql`SELECT 1 as health_check`;
    const latencyMs = Date.now() - start;

    return {
      healthy: true,
      latencyMs,
    };
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

// Export sql as default for backwards compatibility
export default sql;
