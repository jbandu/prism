import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST - Generate sample usage data for testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, softwareId, days = 90 } = body;

    if (!companyId || !softwareId) {
      return NextResponse.json(
        { error: 'companyId and softwareId are required' },
        { status: 400 }
      );
    }

    console.log(`Generating ${days} days of usage data for software ${softwareId}`);

    // Get software details
    const software = await sql`
      SELECT * FROM software WHERE id = ${softwareId} LIMIT 1
    `;

    if (software.length === 0) {
      return NextResponse.json(
        { error: 'Software not found' },
        { status: 404 }
      );
    }

    const softwareData = software[0];
    const licenseCount = softwareData.license_count || 10;

    // Generate usage logs
    const today = new Date();
    const logsCreated = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Simulate realistic usage patterns
      // Weekdays have higher usage than weekends
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseUsage = isWeekend ? 0.3 : 0.7;

      // Add some randomness
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2

      // Calculate active users (60-90% of licenses on weekdays, 20-40% on weekends)
      const utilizationRate = baseUsage * randomFactor;
      const activeUsers = Math.max(1, Math.round(licenseCount * utilizationRate));

      // Calculate sessions (2-5 sessions per active user)
      const sessionsPerUser = 2 + Math.floor(Math.random() * 4);
      const totalSessions = activeUsers * sessionsPerUser;

      // Calculate duration (30-120 minutes per session)
      const avgSessionMinutes = 30 + Math.floor(Math.random() * 90);
      const totalDuration = totalSessions * avgSessionMinutes;

      // Calculate activity score (0-100)
      const activityScore = Math.min(100, Math.round(utilizationRate * 100));

      // Calculate cost allocation
      const annualCost = parseFloat(softwareData.annual_cost || '0');
      const dailyCost = annualCost / 365;

      try {
        await sql`
          INSERT INTO software_usage_logs (
            company_id,
            software_id,
            log_date,
            active_users,
            total_sessions,
            total_duration_minutes,
            activity_score,
            cost_allocation,
            data_source
          ) VALUES (
            ${companyId},
            ${softwareId},
            ${dateStr},
            ${activeUsers},
            ${totalSessions},
            ${totalDuration},
            ${activityScore},
            ${dailyCost},
            'generated'
          )
          ON CONFLICT (software_id, log_date, log_hour)
          DO NOTHING
        `;

        logsCreated.push({ date: dateStr, activeUsers, activityScore });
      } catch (error) {
        console.error(`Failed to insert log for ${dateStr}:`, error);
      }
    }

    // Generate usage insights for the period
    const periodStart = new Date(today);
    periodStart.setDate(periodStart.getDate() - days);
    const periodStartStr = periodStart.toISOString().split('T')[0];
    const periodEndStr = today.toISOString().split('T')[0];

    // Trigger insights computation
    await fetch(`${request.nextUrl.origin}/api/usage/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        softwareId,
        periodStart: periodStartStr,
        periodEnd: periodEndStr,
        periodType: 'monthly'
      })
    });

    return NextResponse.json({
      success: true,
      message: `Generated ${logsCreated.length} days of usage data`,
      data: {
        logs_created: logsCreated.length,
        period: {
          start: periodStartStr,
          end: periodEndStr
        },
        sample_logs: logsCreated.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Failed to generate usage data:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate usage data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
