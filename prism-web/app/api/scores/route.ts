/**
 * Company Scores API
 * GET - Retrieve company scores and rankings
 * POST - Calculate scores for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ScoringService } from '@/lib/gamification/scoring-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || 'current';

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    // Determine date range
    const today = new Date();
    let periodStart: string;
    let periodEnd: string;

    switch (period) {
      case 'current':
        periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'previous':
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        periodStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0];
        periodEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        periodStart = searchParams.get('periodStart') || '';
        periodEnd = searchParams.get('periodEnd') || '';
    }

    // Get current score
    const currentScore = await sql`
      SELECT *
      FROM company_scores
      WHERE company_id = ${companyId}
        AND period_start = ${periodStart}::DATE
        AND period_end = ${periodEnd}::DATE
    `;

    if (currentScore.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No score data for this period'
      });
    }

    // Get historical scores (last 6 months)
    const historicalScores = await sql`
      SELECT *
      FROM company_scores
      WHERE company_id = ${companyId}
        AND period_end <= ${periodEnd}::DATE
      ORDER BY period_end DESC
      LIMIT 6
    `;

    // Calculate trends
    const scoreData = currentScore.rows[0];
    const trends = {
      efficiencyChange: scoreData.previous_rank ? scoreData.efficiency_score - scoreData.previous_rank : 0,
      rankChange: scoreData.rank_change || 0,
      savingsTrend: 'up' // TODO: Calculate from historical data
    };

    return NextResponse.json({
      success: true,
      data: {
        current: scoreData,
        historical: historicalScores.rows,
        trends
      }
    });
  } catch (error) {
    console.error('Get scores error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get scores'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, periodStart, periodEnd } = body;

    if (!companyId || !periodStart || !periodEnd) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: companyId, periodStart, periodEnd'
      }, { status: 400 });
    }

    // Calculate scores
    const metrics = await (ScoringService as any).getCompanyMetrics(companyId, periodStart, periodEnd);
    const scores = await ScoringService.calculateCompanyScores(companyId, periodStart, periodEnd);

    // Update score record
    await ScoringService.updateCompanyScore(companyId, periodStart, periodEnd, scores, metrics);

    // Award achievements
    await ScoringService.awardAchievements(companyId);

    return NextResponse.json({
      success: true,
      message: 'Scores calculated successfully',
      data: {
        scores,
        metrics
      }
    });
  } catch (error) {
    console.error('Calculate scores error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate scores'
    }, { status: 500 });
  }
}
