/**
 * API Route: Analyze Portfolio for Redundancies
 * POST /api/redundancy/analyze
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePortfolioOverlaps } from '@/lib/redundancy/overlap-analyzer';
import { getCompanyById, getCompanyBySlug } from '@/lib/db-utils';
import { ProgressTracker } from '@/lib/redundancy/progress-tracker';
import { sql } from '@/lib/db';

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

  // It's a slug, look up the company (with fallback to name-based slug matching)
  const company = await getCompanyBySlug(companyIdOrSlug);

  if (!company) {
    throw new Error(`Company not found with slug: ${companyIdOrSlug}`);
  }

  return company.id;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, selectedSoftwareIds } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting redundancy analysis for company: ${companyId}`);
    if (selectedSoftwareIds && selectedSoftwareIds.length > 0) {
      console.log(`   📋 Analyzing ${selectedSoftwareIds.length} selected software products`);
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Get software count for progress tracking
    const softwareCountQuery = selectedSoftwareIds && selectedSoftwareIds.length > 0
      ? sql`
          SELECT COUNT(*) as count
          FROM software
          WHERE company_id = ${resolvedCompanyId}
          AND contract_status = 'active'
          AND id = ANY(${selectedSoftwareIds})
        `
      : sql`
          SELECT COUNT(*) as count
          FROM software
          WHERE company_id = ${resolvedCompanyId}
          AND contract_status = 'active'
        `;

    const softwareCount = await softwareCountQuery;
    const totalSoftware = parseInt(softwareCount[0]?.count || '0');

    // Check if analysis is already in progress
    const existingProgress = ProgressTracker.getProgress(resolvedCompanyId);
    if (existingProgress && existingProgress.status === 'running') {
      return NextResponse.json({
        success: true,
        message: 'Analysis already in progress',
        status: 'running',
      });
    }

    // Initialize progress tracker
    const tracker = new ProgressTracker(resolvedCompanyId, totalSoftware);

    // Run analysis asynchronously in the background
    // Don't await - return immediately so client can start polling
    analyzePortfolioOverlaps(resolvedCompanyId, tracker, selectedSoftwareIds)
      .then((results) => {
        console.log(`✅ Analysis completed for ${resolvedCompanyId}`);
        // Progress tracker already marked as complete in analyzePortfolioOverlaps
      })
      .catch((error) => {
        console.error(`❌ Analysis failed for ${resolvedCompanyId}:`, error);
        tracker.fail(error instanceof Error ? error.message : 'Analysis failed');
      });

    return NextResponse.json({
      success: true,
      message: 'Analysis started',
      status: 'running',
      totalSoftware,
    });
  } catch (error) {
    console.error('❌ Failed to start redundancy analysis:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start analysis',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company ID from query params or session
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || (session.user as any).companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Get cached analysis results
    const results = await analyzePortfolioOverlaps(resolvedCompanyId);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('❌ Failed to get redundancy analysis:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analysis',
      },
      { status: 500 }
    );
  }
}
