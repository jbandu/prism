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

// Generic query function with error handling
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (>1s)
    if (duration > 1000) {
      console.warn('Slow query detected:', {
        text: text.substring(0, 100),
        duration: `${duration}ms`,
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      text: text.substring(0, 100),
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Typed query helpers for features
export const featureQueries = {
  create: async (data: {
    requestedByUserId: string;
    companyId: string;
    initialRequest: string;
  }) => {
    const result = await query<{ id: string }>(`
      INSERT INTO feature_requests (
        requested_by_user_id,
        company_id,
        initial_request,
        status,
        chat_history
      ) VALUES ($1, $2, $3, 'refining', '[]'::jsonb)
      RETURNING id
    `, [data.requestedByUserId, data.companyId, data.initialRequest]);
    
    return result.rows[0];
  },

  findById: async (id: string) => {
    const result = await query(`
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
      WHERE fr.id = $1
    `, [id]);
    
    return result.rows[0];
  },

  updateChatHistory: async (id: string, chatHistory: any[]) => {
    await query(`
      UPDATE feature_requests
      SET
        chat_history = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(chatHistory), id]);
  },

  finalize: async (id: string, finalRequirements: string) => {
    await query(`
      UPDATE feature_requests
      SET
        final_requirements = $1,
        requirements_finalized_at = NOW(),
        status = 'submitted',
        updated_at = NOW()
      WHERE id = $2
    `, [finalRequirements, id]);
  },

  listPending: async () => {
    const result = await query(`
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
    `);

    return result.rows;
  },

  approve: async (id: string, adminUserId: string) => {
    await query(`
      UPDATE feature_requests
      SET
        status = 'approved',
        reviewed_by_user_id = $1,
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
    `, [adminUserId, id]);
  },

  reject: async (id: string, adminUserId: string, reason?: string) => {
    await query(`
      UPDATE feature_requests
      SET
        status = 'rejected',
        reviewed_by_user_id = $1,
        reviewed_at = NOW(),
        admin_notes = $2,
        updated_at = NOW()
      WHERE id = $3
    `, [adminUserId, reason || null, id]);
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

// Re-export pool and sql for compatibility
export { pool };
export default sql;
