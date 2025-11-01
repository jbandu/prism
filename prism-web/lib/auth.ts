import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getUserByEmail, updateUserLastLogin, getCompanyById } from "./db-utils";
import type { User, UserRole } from "@/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  companySlug?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.is_active) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Update last login
        await updateUserLastLogin(user.id);

        // Get company slug if user has a company
        let companySlug: string | undefined;
        if (user.company_id) {
          const company = await getCompanyById(user.company_id);
          companySlug = company?.slug;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          companyId: user.company_id,
          companySlug: companySlug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
        token.companySlug = (user as any).companySlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
        (session.user as any).companySlug = token.companySlug;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper to check if user has access to a company
export function canAccessCompany(user: SessionUser, companyId: string): boolean {
  // Admins can access any company
  if (user.role === "admin") {
    return true;
  }

  // Company managers and viewers can only access their own company
  return user.companyId === companyId;
}

// Helper to check if user is admin
export function isAdmin(user: SessionUser): boolean {
  return user.role === "admin";
}

// Helper to check if user can modify resources
export function canModify(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "company_manager";
}
