// lib/auth.ts
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
  company_id: string;
  company_name?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          // Query user from database
          const result = await sql`
            SELECT
              u.id,
              u.email,
              u.full_name,
              u.role,
              u.company_id,
              u.password_hash,
              c.company_name
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.email = ${credentials.email}
          `;

          const user = result[0];

          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            company_id: user.company_id,
            company_name: user.company_name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company_id = user.company_id;
        token.company_name = user.company_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.company_id = token.company_id as string;
        session.user.company_name = token.company_name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Get current user from session
export async function getCurrentUser(req: Request): Promise<User | null> {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }

    const result = await sql`
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.company_id,
        c.company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = ${session.user.email}
    `;

    return (result[0] as User) || null;
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
  const result = await sql`
    SELECT 1
    FROM feature_requests fr
    INNER JOIN users u ON fr.company_id = u.company_id
    WHERE fr.id = ${featureId} AND u.id = ${userId}
  `;

  return result.length > 0;
}

// Check if user is admin
export function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

// Check if user can access a company
export function canAccessCompany(user: any, companyId: string): boolean {
  // Admins can access all companies
  if (user?.role === 'admin') {
    return true;
  }

  // Regular users can only access their own company
  return user?.company_id === companyId;
}

// Check if user can modify data for a company
export function canModify(user: any, companyId: string): boolean {
  // Admins can modify all companies
  if (user?.role === 'admin') {
    return true;
  }

  // Regular users can only modify their own company's data
  return user?.company_id === companyId;
}
