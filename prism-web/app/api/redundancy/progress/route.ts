/**
 * API Route: Get Redundancy Analysis Progress
 * GET /api/redundancy/progress?companyId=xxx
 * Returns real-time progress updates using Server-Sent Events
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProgressTracker } from '@/lib/redundancy/progress-tracker';
import { getCompanyById, getCompanyBySlug } from '@/lib/db-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Resolve company slug or UUID to UUID
 */
async function resolveCompanyId(companyIdOrSlug: string): Promise<string> {
  // Check if it's already a UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(companyIdOrSlug)) {
    // Verify the UUID exists
    const company = await getCompanyById(companyIdOrSlug);
    if (!company) {
      throw new Error(`Company not found with ID: ${companyIdOrSlug}`);
    }
    return companyIdOrSlug;
  }

  // It's a slug, look up the company
  const company = await getCompanyBySlug(companyIdOrSlug);

  if (!company) {
    throw new Error(`Company not found with slug: ${companyIdOrSlug}`);
  }

  return company.id;
}

// GET - Poll for progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return new Response(JSON.stringify({ error: 'Company ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    const progress = ProgressTracker.getProgress(resolvedCompanyId);

    if (!progress) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No analysis in progress',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: progress,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting progress:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE - Cancel analysis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return new Response(JSON.stringify({ error: 'Company ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    ProgressTracker.requestCancellation(resolvedCompanyId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cancellation requested',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error cancelling analysis:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
