import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET - Retrieve usage insights
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const softwareId = searchParams.get('softwareId');
    const periodType = searchParams.get('periodType') || 'monthly'; // daily, weekly, monthly

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    let insights;

    if (softwareId) {
      // Get insights for specific software
      insights = await sql`
        SELECT
          ui.*,
          s.software_name,
          s.vendor_name,
          s.annual_cost,
          s.license_count
        FROM usage_insights ui
        JOIN software s ON ui.software_id = s.id
        WHERE ui.software_id = ${softwareId}
          AND ui.period_type = ${periodType}
        ORDER BY ui.period_start DESC
        LIMIT 12
      `;
    } else {
      // Get insights for all company software
      insights = await sql`
        SELECT
          ui.*,
          s.software_name,
          s.vendor_name,
          s.annual_cost,
          s.license_count
        FROM usage_insights ui
        JOIN software s ON ui.software_id = s.id
        WHERE ui.company_id = ${companyId}
          AND ui.period_type = ${periodType}
        ORDER BY ui.period_start DESC, s.software_name ASC
        LIMIT 100
      `;
    }

    // Calculate summary metrics
    const summary = calculateInsightsSummary(insights.rows);

    return NextResponse.json({
      success: true,
      data: {
        insights: insights.rows,
        summary
      }
    });

  } catch (error) {
    console.error('Failed to fetch usage insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch usage insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Compute usage insights for a period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { softwareId, periodStart, periodEnd, periodType } = body;

    if (!softwareId || !periodStart || !periodEnd || !periodType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get software details
    const software = await sql`
      SELECT * FROM software WHERE id = ${softwareId} LIMIT 1
    `;

    if (software.rows.length === 0) {
      return NextResponse.json(
        { error: 'Software not found' },
        { status: 404 }
      );
    }

    const softwareData = software.rows[0];

    // Get usage logs for the period
    const usageLogs = await sql`
      SELECT * FROM software_usage_logs
      WHERE software_id = ${softwareId}
        AND log_date >= ${periodStart}
        AND log_date <= ${periodEnd}
      ORDER BY log_date ASC
    `;

    if (usageLogs.rows.length === 0) {
      return NextResponse.json(
        { error: 'No usage data found for this period' },
        { status: 404 }
      );
    }

    // Compute insights
    const insights = await computeUsageInsights(softwareData, usageLogs.rows, periodStart, periodEnd, periodType);

    // Save to database
    await sql`
      INSERT INTO usage_insights (
        company_id,
        software_id,
        period_start,
        period_end,
        period_type,
        avg_daily_users,
        peak_users,
        peak_date,
        total_sessions,
        avg_session_duration_minutes,
        license_utilization_rate,
        unused_licenses,
        wasted_cost,
        usage_trend,
        trend_percentage,
        most_active_day,
        most_active_hour,
        least_active_day,
        activity_distribution,
        cost_per_active_user,
        cost_per_session,
        ai_recommendations,
        waste_opportunities
      ) VALUES (
        ${softwareData.company_id},
        ${softwareId},
        ${periodStart},
        ${periodEnd},
        ${periodType},
        ${insights.avg_daily_users},
        ${insights.peak_users},
        ${insights.peak_date},
        ${insights.total_sessions},
        ${insights.avg_session_duration_minutes},
        ${insights.license_utilization_rate},
        ${insights.unused_licenses},
        ${insights.wasted_cost},
        ${insights.usage_trend},
        ${insights.trend_percentage},
        ${insights.most_active_day},
        ${insights.most_active_hour},
        ${insights.least_active_day},
        ${JSON.stringify(insights.activity_distribution)},
        ${insights.cost_per_active_user},
        ${insights.cost_per_session},
        ${JSON.stringify(insights.ai_recommendations)},
        ${JSON.stringify(insights.waste_opportunities)}
      )
      ON CONFLICT (software_id, period_start, period_type)
      DO UPDATE SET
        avg_daily_users = EXCLUDED.avg_daily_users,
        peak_users = EXCLUDED.peak_users,
        computed_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Usage insights computed successfully',
      data: insights
    });

  } catch (error) {
    console.error('Failed to compute insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Compute usage insights from logs
 */
async function computeUsageInsights(
  software: any,
  logs: any[],
  periodStart: string,
  periodEnd: string,
  periodType: string
) {
  const totalDays = logs.length;
  const totalUsers = logs.reduce((sum, log) => sum + (log.active_users || 0), 0);
  const avgDailyUsers = totalDays > 0 ? totalUsers / totalDays : 0;

  const peakLog = logs.reduce((max, log) =>
    (log.active_users || 0) > (max.active_users || 0) ? log : max
  , logs[0]);

  const totalSessions = logs.reduce((sum, log) => sum + (log.total_sessions || 0), 0);
  const totalDuration = logs.reduce((sum, log) => sum + (log.total_duration_minutes || 0), 0);
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Calculate utilization
  const licenseCount = software.license_count || 0;
  const utilizationRate = licenseCount > 0 ? (avgDailyUsers / licenseCount) * 100 : 0;
  const unusedLicenses = Math.max(0, licenseCount - Math.ceil(avgDailyUsers));

  // Calculate wasted cost
  const annualCost = parseFloat(software.annual_cost || '0');
  const dailyCost = annualCost / 365;
  const costPerLicense = licenseCount > 0 ? dailyCost / licenseCount : 0;
  const wastedCost = unusedLicenses * costPerLicense * totalDays;

  // Activity distribution by day of week
  const activityByDay: any = {};
  logs.forEach(log => {
    const dayOfWeek = new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'long' });
    activityByDay[dayOfWeek] = (activityByDay[dayOfWeek] || 0) + (log.active_users || 0);
  });

  const dayNames = Object.keys(activityByDay);
  const mostActiveDay = dayNames.reduce((max, day) =>
    activityByDay[day] > activityByDay[max] ? day : max
  , dayNames[0]);
  const leastActiveDay = dayNames.reduce((min, day) =>
    activityByDay[day] < activityByDay[min] ? day : min
  , dayNames[0]);

  // Generate AI recommendations
  const aiRecommendations: string[] = [];
  const wasteOpportunities: any[] = [];

  if (utilizationRate < 50) {
    aiRecommendations.push(`Only ${utilizationRate.toFixed(0)}% of licenses are being used. Consider reducing license count.`);
    wasteOpportunities.push({
      type: 'underutilized_licenses',
      potential_savings: wastedCost,
      recommendation: `Remove ${unusedLicenses} unused licenses`
    });
  }

  if (utilizationRate > 90) {
    aiRecommendations.push(`License utilization is ${utilizationRate.toFixed(0)}%. May need additional licenses soon.`);
  }

  const costPerActiveUser = avgDailyUsers > 0 ? dailyCost / avgDailyUsers : 0;
  const costPerSession = totalSessions > 0 ? (dailyCost * totalDays) / totalSessions : 0;

  return {
    avg_daily_users: Math.round(avgDailyUsers * 100) / 100,
    peak_users: peakLog?.active_users || 0,
    peak_date: peakLog?.log_date || null,
    total_sessions: totalSessions,
    avg_session_duration_minutes: Math.round(avgSessionDuration * 100) / 100,
    license_utilization_rate: Math.round(utilizationRate * 100) / 100,
    unused_licenses: unusedLicenses,
    wasted_cost: Math.round(wastedCost * 100) / 100,
    usage_trend: 'stable', // TODO: Calculate from historical data
    trend_percentage: 0,
    most_active_day: mostActiveDay || null,
    most_active_hour: null, // TODO: Calculate from hourly data
    least_active_day: leastActiveDay || null,
    activity_distribution: activityByDay,
    cost_per_active_user: Math.round(costPerActiveUser * 100) / 100,
    cost_per_session: Math.round(costPerSession * 100) / 100,
    ai_recommendations: aiRecommendations,
    waste_opportunities: wasteOpportunities
  };
}

/**
 * Calculate summary metrics from insights
 */
function calculateInsightsSummary(insights: any[]) {
  if (insights.length === 0) {
    return {
      total_software: 0,
      avg_utilization: 0,
      total_wasted_cost: 0,
      total_unused_licenses: 0
    };
  }

  const totalWaste = insights.reduce((sum, i) => sum + parseFloat(i.wasted_cost || '0'), 0);
  const totalUnused = insights.reduce((sum, i) => sum + (i.unused_licenses || 0), 0);
  const avgUtil = insights.reduce((sum, i) => sum + parseFloat(i.license_utilization_rate || '0'), 0) / insights.length;

  return {
    total_software: insights.length,
    avg_utilization: Math.round(avgUtil * 100) / 100,
    total_wasted_cost: Math.round(totalWaste * 100) / 100,
    total_unused_licenses: totalUnused
  };
}
