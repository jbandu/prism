/**
 * Leaderboard API
 * GET - Retrieve company rankings and leaderboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ScoringService } from '@/lib/gamification/scoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || 'current'; // current, monthly, quarterly, annual
    const limit = parseInt(searchParams.get('limit') || '50');

    // Determine date range
    const today = new Date();
    let periodStart: string;
    let periodEnd: string;

    switch (period) {
      case 'current':
      case 'monthly':
        periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        periodStart = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        break;
      case 'annual':
        periodStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      default:
        periodStart = searchParams.get('periodStart') || '';
        periodEnd = searchParams.get('periodEnd') || '';
    }

    // Get leaderboard data
    const leaderboard = await sql`
      SELECT
        cs.*,
        c.company_name,
        c.industry,
        c.employee_count,
        c.logo_url
      FROM company_scores cs
      JOIN companies c ON c.id = cs.company_id
      WHERE cs.period_start = ${periodStart}::DATE
        AND cs.period_end = ${periodEnd}::DATE
      ORDER BY cs.overall_rank ASC
      LIMIT ${limit}
    `;

    // Get user's company data if specified
    let userCompany = null;
    if (companyId) {
      const userResult = await sql`
        SELECT
          cs.*,
          c.company_name,
          c.industry,
          c.employee_count,
          c.logo_url
        FROM company_scores cs
        JOIN companies c ON c.id = cs.company_id
        WHERE cs.company_id = ${companyId}
          AND cs.period_start = ${periodStart}::DATE
          AND cs.period_end = ${periodEnd}::DATE
      `;

      if (userResult.length > 0) {
        userCompany = userResult[0];
      }
    }

    // Calculate summary stats
    const totalCompanies = leaderboard.length;
    const totalSavings = leaderboard.reduce((sum, row) => sum + parseFloat(row.total_savings || 0), 0);
    const avgEfficiency = totalCompanies > 0
      ? leaderboard.reduce((sum, row) => sum + parseInt(row.efficiency_score || 0), 0) / totalCompanies
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard,
        userCompany,
        summary: {
          totalCompanies,
          totalSavings,
          avgEfficiency: Math.round(avgEfficiency),
          periodStart,
          periodEnd
        }
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get leaderboard data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, periodStart, periodEnd } = body;

    if (action === 'calculate_rankings') {
      // Recalculate all rankings
      await ScoringService.calculateRankings(periodStart, periodEnd);

      return NextResponse.json({
        success: true,
        message: 'Rankings calculated successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}
