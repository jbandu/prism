/**
 * Readiness Check Endpoint
 *
 * Indicates whether the service is ready to accept traffic.
 * Used by Kubernetes, load balancers, and orchestration systems.
 *
 * GET /api/ready - Readiness probe
 * Returns 200 OK if service is ready
 * Returns 503 Service Unavailable if not ready
 *
 * Difference from /api/health:
 * - Health: Is the service running at all?
 * - Ready: Is the service ready to handle requests?
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if database is ready
    const dbHealth = await checkDatabaseHealth();

    // Service is ready only if all critical dependencies are healthy
    const isReady = dbHealth.healthy;

    if (isReady) {
      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'ready',
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'not ready',
          },
          error: dbHealth.error,
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
