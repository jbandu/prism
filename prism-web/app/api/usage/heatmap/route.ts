import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

/**
 * GET - Retrieve heatmap data for visualization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const softwareId = searchParams.get('softwareId');
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate'); // YYYY-MM-DD
    const granularity = searchParams.get('granularity') || 'daily'; // daily, hourly

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Default to last 90 days if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    let query;
    if (softwareId) {
      // Get heatmap for specific software
      if (granularity === 'hourly') {
        query = await sql`
          SELECT
            log_date,
            log_hour,
            active_users,
            total_sessions,
            total_duration_minutes,
            activity_score,
            cost_allocation
          FROM software_usage_logs
          WHERE software_id = ${softwareId}
            AND log_date >= ${start.toISOString().split('T')[0]}
            AND log_date <= ${end.toISOString().split('T')[0]}
            AND log_hour IS NOT NULL
          ORDER BY log_date ASC, log_hour ASC
        `;
      } else {
        query = await sql`
          SELECT
            log_date,
            SUM(active_users) as active_users,
            SUM(total_sessions) as total_sessions,
            SUM(total_duration_minutes) as total_duration_minutes,
            AVG(activity_score) as activity_score,
            SUM(cost_allocation) as cost_allocation
          FROM software_usage_logs
          WHERE software_id = ${softwareId}
            AND log_date >= ${start.toISOString().split('T')[0]}
            AND log_date <= ${end.toISOString().split('T')[0]}
          GROUP BY log_date
          ORDER BY log_date ASC
        `;
      }
    } else {
      // Get aggregated heatmap for all company software
      query = await sql`
        SELECT
          sul.log_date,
          s.software_name,
          s.vendor_name,
          SUM(sul.active_users) as active_users,
          SUM(sul.total_sessions) as total_sessions,
          AVG(sul.activity_score) as activity_score
        FROM software_usage_logs sul
        JOIN software s ON sul.software_id = s.id
        WHERE sul.company_id = ${companyId}
          AND sul.log_date >= ${start.toISOString().split('T')[0]}
          AND sul.log_date <= ${end.toISOString().split('T')[0]}
        GROUP BY sul.log_date, s.software_name, s.vendor_name
        ORDER BY sul.log_date ASC, s.software_name ASC
      `;
    }

    // Transform data for heatmap visualization
    const heatmapData = transformToHeatmapFormat(query.rows, granularity);

    return NextResponse.json({
      success: true,
      data: {
        heatmap: heatmapData,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          granularity
        },
        stats: calculateHeatmapStats(query.rows)
      }
    });

  } catch (error) {
    console.error('Failed to fetch heatmap data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch heatmap data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Transform data to heatmap format
 */
function transformToHeatmapFormat(rows: any[], granularity: string) {
  if (granularity === 'hourly') {
    // Group by day and hour
    const heatmap: any = {};

    rows.forEach(row => {
      const date = row.log_date;
      if (!heatmap[date]) {
        heatmap[date] = {};
      }
      heatmap[date][row.log_hour] = {
        activity_score: parseFloat(row.activity_score || '0'),
        active_users: row.active_users,
        total_sessions: row.total_sessions,
        duration: row.total_duration_minutes
      };
    });

    // Convert to array format for visualization
    return Object.keys(heatmap).map(date => ({
      date,
      hours: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        ...heatmap[date][hour] || { activity_score: 0, active_users: 0, total_sessions: 0, duration: 0 }
      }))
    }));

  } else {
    // Daily format
    return rows.map(row => ({
      date: row.log_date,
      day_of_week: new Date(row.log_date).getDay(), // 0-6
      activity_score: parseFloat(row.activity_score || '0'),
      active_users: row.active_users,
      total_sessions: row.total_sessions,
      duration: row.total_duration_minutes,
      cost: parseFloat(row.cost_allocation || '0'),
      software_name: row.software_name,
      vendor_name: row.vendor_name
    }));
  }
}

/**
 * Calculate stats from heatmap data
 */
function calculateHeatmapStats(rows: any[]) {
  if (rows.length === 0) {
    return {
      total_days: 0,
      avg_activity_score: 0,
      peak_activity_score: 0,
      peak_date: null,
      total_active_users: 0,
      total_sessions: 0
    };
  }

  const activityScores = rows.map(r => parseFloat(r.activity_score || '0'));
  const peakIndex = activityScores.indexOf(Math.max(...activityScores));

  return {
    total_days: rows.length,
    avg_activity_score: Math.round(activityScores.reduce((a, b) => a + b, 0) / activityScores.length),
    peak_activity_score: Math.round(activityScores[peakIndex]),
    peak_date: rows[peakIndex]?.log_date,
    total_active_users: rows.reduce((sum, r) => sum + (r.active_users || 0), 0),
    total_sessions: rows.reduce((sum, r) => sum + (r.total_sessions || 0), 0)
  };
}
