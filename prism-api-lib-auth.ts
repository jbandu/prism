// lib/auth.ts
import { getServerSession } from 'next-auth';
import { query } from './db';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
  company_id: string;
  company_name?: string;
}

// Get current user from session
export async function getCurrentUser(req: Request): Promise<User | null> {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }

    const result = await query<User>(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.company_id,
        c.company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = $1
    `, [session.user.email]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth(req: Request): Promise<User> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

// Require admin role
export async function requireAdmin(req: Request): Promise<User> {
  const user = await requireAuth(req);
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return user;
}

// Check if user can access feature request
export async function canAccessFeatureRequest(
  userId: string,
  featureId: string
): Promise<boolean> {
  const result = await query(`
    SELECT 1
    FROM feature_requests fr
    INNER JOIN users u ON fr.company_id = u.company_id
    WHERE fr.id = $1 AND u.id = $2
  `, [featureId, userId]);

  return result.rowCount > 0;
}
