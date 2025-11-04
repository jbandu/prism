/**
 * Bot Configuration API
 * GET/POST/PATCH - Manage bot settings for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM bot_configurations
      WHERE company_id = ${companyId}
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No bot configuration found'
      });
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Get bot config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get bot configuration'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      platform,
      slackWebhookUrl,
      slackChannelAlerts,
      slackChannelApprovals,
      teamsWebhookUrl,
      teamsChannelAlerts,
      teamsChannelApprovals,
      notifyRenewals = true,
      notifyBudgetAlerts = true,
      notifyNewSoftware = true,
      notifyContractRisks = true,
      notifyWasteDetection = true,
      notifyRedundancy = true,
      budgetAlertThreshold = 1000,
      wasteAlertThreshold = 500,
      renewalAlertDays = 60
    } = body;

    if (!companyId || !platform) {
      return NextResponse.json({
        success: false,
        error: 'Company ID and platform are required'
      }, { status: 400 });
    }

    // Check if config already exists
    const existing = await sql`
      SELECT id FROM bot_configurations
      WHERE company_id = ${companyId}
    `;

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Bot configuration already exists. Use PATCH to update.'
      }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO bot_configurations (
        company_id,
        platform,
        enabled,
        slack_webhook_url,
        slack_channel_alerts,
        slack_channel_approvals,
        teams_webhook_url,
        teams_channel_alerts,
        teams_channel_approvals,
        notify_renewals,
        notify_budget_alerts,
        notify_new_software,
        notify_contract_risks,
        notify_waste_detection,
        notify_redundancy,
        budget_alert_threshold,
        waste_alert_threshold,
        renewal_alert_days
      ) VALUES (
        ${companyId},
        ${platform},
        true,
        ${slackWebhookUrl || null},
        ${slackChannelAlerts || null},
        ${slackChannelApprovals || null},
        ${teamsWebhookUrl || null},
        ${teamsChannelAlerts || null},
        ${teamsChannelApprovals || null},
        ${notifyRenewals},
        ${notifyBudgetAlerts},
        ${notifyNewSoftware},
        ${notifyContractRisks},
        ${notifyWasteDetection},
        ${notifyRedundancy},
        ${budgetAlertThreshold},
        ${wasteAlertThreshold},
        ${renewalAlertDays}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Bot configuration created successfully'
    });
  } catch (error) {
    console.error('Create bot config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create bot configuration'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, ...updates } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fieldMapping: Record<string, string> = {
      platform: 'platform',
      enabled: 'enabled',
      slackWebhookUrl: 'slack_webhook_url',
      slackChannelAlerts: 'slack_channel_alerts',
      slackChannelApprovals: 'slack_channel_approvals',
      teamsWebhookUrl: 'teams_webhook_url',
      teamsChannelAlerts: 'teams_channel_alerts',
      teamsChannelApprovals: 'teams_channel_approvals',
      notifyRenewals: 'notify_renewals',
      notifyBudgetAlerts: 'notify_budget_alerts',
      notifyNewSoftware: 'notify_new_software',
      notifyContractRisks: 'notify_contract_risks',
      notifyWasteDetection: 'notify_waste_detection',
      notifyRedundancy: 'notify_redundancy',
      budgetAlertThreshold: 'budget_alert_threshold',
      wasteAlertThreshold: 'waste_alert_threshold',
      renewalAlertDays: 'renewal_alert_days'
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (key in updates) {
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    // Build parameterized values for each field
    const setClause = updateFields.map((field, idx) => {
      const value = values[idx];
      const escapedValue = typeof value === 'string'
        ? `'${value.replace(/'/g, "''")}'`
        : value;
      return field.replace(`$${idx + 1}`, escapedValue);
    }).join(', ');

    const result = await sql(`
      UPDATE bot_configurations
      SET ${setClause}, updated_at = NOW()
      WHERE company_id = '${companyId}'
      RETURNING *
    `);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Bot configuration not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Bot configuration updated successfully'
    });
  } catch (error) {
    console.error('Update bot config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update bot configuration'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 });
    }

    await sql`
      DELETE FROM bot_configurations
      WHERE company_id = ${companyId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Bot configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete bot config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete bot configuration'
    }, { status: 500 });
  }
}
