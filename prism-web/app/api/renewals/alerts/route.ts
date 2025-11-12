import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET - Fetch upcoming renewals and check alert rules
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '90');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    // Find contracts renewing within the specified period
    const upcomingRenewals = await sql`
      SELECT
        c.*,
        s.software_name,
        s.vendor_name,
        s.annual_cost,
        (c.renewal_date - CURRENT_DATE) as days_until_renewal
      FROM contracts c
      LEFT JOIN software s ON c.software_id = s.id
      WHERE c.company_id = ${companyId}
        AND c.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${daysAhead} days'
        AND c.status != 'cancelled'
      ORDER BY c.renewal_date ASC
    `;

    // Categorize by urgency
    const critical = upcomingRenewals.filter(r => r.days_until_renewal <= 30);
    const warning = upcomingRenewals.filter(r => r.days_until_renewal > 30 && r.days_until_renewal <= 60);
    const info = upcomingRenewals.filter(r => r.days_until_renewal > 60);

    // Get alert preferences
    const alertPreferences = await sql`
      SELECT *
      FROM renewal_alert_preferences
      WHERE company_id = ${companyId}
      LIMIT 1
    `;

    const preferences = alertPreferences[0] || {
      critical_days: 30,
      warning_days: 60,
      info_days: 90,
      email_enabled: true,
      slack_enabled: false,
    };

    return NextResponse.json({
      success: true,
      data: {
        total_upcoming: upcomingRenewals.length,
        by_urgency: {
          critical: critical.length,
          warning: warning.length,
          info: info.length,
        },
        renewals: {
          critical,
          warning,
          info,
        },
        preferences,
      },
    });
  } catch (error) {
    console.error('Failed to fetch renewal alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch renewal alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create/update alert preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      critical_days = 30,
      warning_days = 60,
      info_days = 90,
      email_enabled = true,
      slack_enabled = false,
      slack_webhook_url,
      email_recipients,
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO renewal_alert_preferences (
        company_id,
        critical_days,
        warning_days,
        info_days,
        email_enabled,
        slack_enabled,
        slack_webhook_url,
        email_recipients,
        updated_at
      ) VALUES (
        ${companyId},
        ${critical_days},
        ${warning_days},
        ${info_days},
        ${email_enabled},
        ${slack_enabled},
        ${slack_webhook_url || null},
        ${JSON.stringify(email_recipients || [])},
        NOW()
      )
      ON CONFLICT (company_id)
      DO UPDATE SET
        critical_days = EXCLUDED.critical_days,
        warning_days = EXCLUDED.warning_days,
        info_days = EXCLUDED.info_days,
        email_enabled = EXCLUDED.email_enabled,
        slack_enabled = EXCLUDED.slack_enabled,
        slack_webhook_url = EXCLUDED.slack_webhook_url,
        email_recipients = EXCLUDED.email_recipients,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Failed to save alert preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save alert preferences' },
      { status: 500 }
    );
  }
}
