/**
 * API Route: Get Analysis Progress
 * GET /api/redundancy/progress - Get current analysis progress
 * DELETE /api/redundancy/progress - Cancel ongoing analysis
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProgressTracker } from '@/lib/redundancy/progress-tracker';
import { getCompanyById, getCompanyBySlug } from '@/lib/db-utils';

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

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Get progress from tracker
    const progress = ProgressTracker.getProgress(resolvedCompanyId);

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'No analysis in progress',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('❌ Failed to get progress:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get progress',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Request cancellation
    ProgressTracker.requestCancellation(resolvedCompanyId);

    return NextResponse.json({
      success: true,
      message: 'Cancellation requested',
    });
  } catch (error) {
    console.error('❌ Failed to cancel analysis:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel analysis',
      },
      { status: 500 }
    );
  }
}
