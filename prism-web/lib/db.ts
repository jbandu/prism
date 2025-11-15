// lib/db.ts
import { Pool, neon } from '@neondatabase/serverless';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export sql for backwards compatibility with existing code
export const sql = neon(process.env.DATABASE_URL || "");

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
      error: error.message,
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
    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];
    let paramIndex = 2;

    if (data?.buildStartedAt) {
      updates.push(`build_started_at = $${paramIndex++}`);
      params.push(data.buildStartedAt);
    }
    if (data?.buildCompletedAt) {
      updates.push(`build_completed_at = $${paramIndex++}`);
      params.push(data.buildCompletedAt);
    }
    if (data?.buildLogs) {
      updates.push(`build_logs = $${paramIndex++}`);
      params.push(data.buildLogs);
    }
    if (data?.buildError) {
      updates.push(`build_error = $${paramIndex++}`);
      params.push(data.buildError);
    }
    if (data?.githubIssueUrl) {
      updates.push(`github_issue_url = $${paramIndex++}`);
      params.push(data.githubIssueUrl);
    }
    if (data?.githubPrUrl) {
      updates.push(`github_pr_url = $${paramIndex++}`);
      params.push(data.githubPrUrl);
    }
    if (data?.vercelPreviewUrl) {
      updates.push(`vercel_preview_url = $${paramIndex++}`);
      params.push(data.vercelPreviewUrl);
    }

    params.push(id);

    await query(`
      UPDATE feature_requests 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, params);
  },
};

export default pool;
