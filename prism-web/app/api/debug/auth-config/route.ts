/**
 * Debug endpoint to check NextAuth configuration
 * DELETE THIS FILE after debugging!
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    databaseUrl: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
    vercelUrl: process.env.VERCEL_URL || 'NOT SET',
    vercelEnv: process.env.VERCEL_ENV || 'NOT SET',
  });
}
