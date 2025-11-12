import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  enhanceCompanyPortfolio,
  enhanceSoftware,
  getEnhancementSchedule,
} from '@/lib/enhancement/agent';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large portfolios

/**
 * POST - Manually trigger enhancement for a company or specific software
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, softwareId, fields } = body;

    if (!companyId && !softwareId) {
      return NextResponse.json(
        { error: 'Either companyId or softwareId is required' },
        { status: 400 }
      );
    }

    // Single software enhancement
    if (softwareId) {
      console.log(`Manual enhancement triggered for software ${softwareId}`);

      const result = await enhanceSoftware(softwareId, fields);

      return NextResponse.json({
        success: result.success,
        data: result,
        message: result.success
          ? `Enhanced ${result.fields_enhanced.length} fields`
          : `Enhancement failed: ${result.error}`,
      });
    }

    // Full company portfolio enhancement
    if (companyId) {
      console.log(`Manual enhancement triggered for company ${companyId}`);

      const result = await enhanceCompanyPortfolio(companyId, { fields_to_enhance: fields });

      return NextResponse.json({
        success: true,
        data: result,
        message: `Enhanced ${result.enhanced}/${result.total_software} software in ${(result.duration_ms / 1000).toFixed(1)}s`,
      });
    }
  } catch (error) {
    console.error('Enhancement run error:', error);
    return NextResponse.json(
      {
        error: 'Enhancement failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get enhancement history for a company
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const { sql } = await import('@/lib/db');

    // Get enhancement runs
    const runs = await sql`
      SELECT *
      FROM enhancement_runs
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    // Get schedule configuration
    const schedule = await getEnhancementSchedule(companyId);

    return NextResponse.json({
      success: true,
      data: {
        runs,
        schedule,
        total_runs: runs.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch enhancement history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
