import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET - Retrieve contracts for a company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const contractId = searchParams.get('contractId');
    const includeRiskAlerts = searchParams.get('includeRiskAlerts') === 'true';

    if (!companyId && !contractId) {
      return NextResponse.json(
        { error: 'companyId or contractId is required' },
        { status: 400 }
      );
    }

    if (contractId) {
      // Get specific contract with details
      const contractResult = await sql`
        SELECT
          c.*,
          s.software_name,
          s.vendor_name as software_vendor_name
        FROM contracts c
        LEFT JOIN software s ON c.software_id = s.id
        WHERE c.id = ${contractId}
        LIMIT 1
      `;

      if (contractResult.length === 0) {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      const contract = contractResult[0];

      // Get risk alerts
      const alertsResult = await sql`
        SELECT * FROM contract_risk_alerts
        WHERE contract_id = ${contractId}
        ORDER BY
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          created_at DESC
      `;

      // Get reminders
      const remindersResult = await sql`
        SELECT * FROM contract_reminders
        WHERE contract_id = ${contractId}
        ORDER BY reminder_date ASC
      `;

      return NextResponse.json({
        success: true,
        data: {
          contract: contract,
          risk_alerts: alertsResult,
          reminders: remindersResult
        }
      });

    } else {
      // Get all contracts for company
      const contractsResult = await sql`
        SELECT
          c.*,
          s.software_name,
          s.vendor_name as software_vendor_name,
          (
            SELECT COUNT(*) FROM contract_risk_alerts
            WHERE contract_id = c.id AND status = 'active'
          ) as active_alerts_count,
          (
            SELECT COUNT(*) FROM contract_risk_alerts
            WHERE contract_id = c.id AND status = 'active' AND severity IN ('critical', 'high')
          ) as critical_alerts_count
        FROM contracts c
        LEFT JOIN software s ON c.software_id = s.id
        WHERE c.company_id = ${companyId}
        ORDER BY c.created_at DESC
      `;

      let contracts = contractsResult;

      // Optionally include risk alerts for each contract
      if (includeRiskAlerts) {
        contracts = await Promise.all(
          contracts.map(async (contract) => {
            const alerts = await sql`
              SELECT * FROM contract_risk_alerts
              WHERE contract_id = ${contract.id} AND status = 'active'
              ORDER BY
                CASE severity
                  WHEN 'critical' THEN 1
                  WHEN 'high' THEN 2
                  WHEN 'medium' THEN 3
                  WHEN 'low' THEN 4
                END
              LIMIT 5
            `;

            return {
              ...contract,
              risk_alerts: alerts
            };
          })
        );
      }

      return NextResponse.json({
        success: true,
        data: contracts
      });
    }

  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contracts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a contract
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'contractId is required' },
        { status: 400 }
      );
    }

    // Delete contract (cascades to risk_alerts and reminders)
    await sql`
      DELETE FROM contracts
      WHERE id = ${contractId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('Delete contract error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}
