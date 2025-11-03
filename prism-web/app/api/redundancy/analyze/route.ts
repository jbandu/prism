/**
 * API Route: Analyze Portfolio for Redundancies
 * POST /api/redundancy/analyze
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePortfolioOverlaps } from '@/lib/redundancy/overlap-analyzer';

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

    // Run the analysis
    const results = await analyzePortfolioOverlaps(companyId);

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

    // Get cached analysis results
    const results = await analyzePortfolioOverlaps(companyId);

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
