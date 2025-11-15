/**
 * Health Check Endpoint
 *
 * Provides system health status for monitoring and load balancing.
 * Used by orchestrators, load balancers, and monitoring tools.
 *
 * GET /api/health - Basic health check
 * Returns 200 OK if service is healthy
 * Returns 503 Service Unavailable if unhealthy
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth();

    const responseTime = Date.now() - startTime;

    // Determine overall health
    const isHealthy = dbHealth.healthy;

    const healthStatus = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbHealth.healthy ? 'healthy' : 'unhealthy',
          latency: dbHealth.latencyMs ? `${dbHealth.latencyMs}ms` : undefined,
          error: dbHealth.error,
        },
      },
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    };

    return NextResponse.json(healthStatus, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Status': isHealthy ? 'healthy' : 'degraded',
      },
    });
  } catch (error: any) {
    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
        version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Status': 'unhealthy',
        },
      }
    );
  }
}
