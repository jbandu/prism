/**
 * API Route: Analyze Portfolio for Redundancies
 * POST /api/redundancy/analyze
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePortfolioOverlaps } from '@/lib/redundancy/overlap-analyzer';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Resolve company slug or UUID to UUID
 */
async function resolveCompanyId(companyIdOrSlug: string): Promise<string> {
  // Check if it's already a UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(companyIdOrSlug)) {
    return companyIdOrSlug;
  }

  // It's a slug, look up the UUID
  const result = await sql`
    SELECT id FROM companies WHERE slug = ${companyIdOrSlug}
  `;

  if (result.length === 0) {
    throw new Error(`Company not found with slug: ${companyIdOrSlug}`);
  }

  return result[0].id;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting redundancy analysis for company: ${companyId}`);

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Run the analysis
    const results = await analyzePortfolioOverlaps(resolvedCompanyId);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Analysis complete. Found ${results.overlaps.length} category overlaps and $${results.totalRedundancyCost.toFixed(0)} in redundancy costs.`,
    });
  } catch (error) {
    console.error('❌ Redundancy analysis failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
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
