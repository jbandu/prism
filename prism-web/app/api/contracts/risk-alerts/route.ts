import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z, ZodError } from 'zod';

export const runtime = 'nodejs';

/**
 * GET - Retrieve risk alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const contractId = searchParams.get('contractId');
    const status = searchParams.get('status'); // active, acknowledged, resolved, dismissed
    const severity = searchParams.get('severity'); // critical, high, medium, low

    if (!companyId && !contractId) {
      return NextResponse.json(
        { error: 'companyId or contractId is required' },
        { status: 400 }
      );
    }

    let queryText = `
      SELECT
        cra.*,
        c.contract_name,
        c.vendor_name
      FROM contract_risk_alerts cra
      LEFT JOIN contracts c ON cra.contract_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (companyId) {
      queryText += ` AND cra.company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex++;
    }

    if (contractId) {
      queryText += ` AND cra.contract_id = $${paramIndex}`;
      params.push(contractId);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND cra.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      queryText += ` AND cra.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    queryText += `
      ORDER BY
        CASE cra.severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        cra.created_at DESC
    `;

    // Replace placeholders with actual values
    let finalQuery = queryText;
    params.forEach((param, idx) => {
      const escapedParam = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
      finalQuery = finalQuery.replace(`$${idx + 1}`, escapedParam);
    });

    const result = await sql(finalQuery);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to fetch risk alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk alerts' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update risk alert status
 */
const UpdateAlertSchema = z.object({
  alertId: z.string().uuid(),
  status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']),
  resolutionNotes: z.string().optional(),
  acknowledgedBy: z.string().uuid().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const data = UpdateAlertSchema.parse(body);

    const updates: any = {
      status: data.status,
    };

    if (data.status === 'acknowledged' && data.acknowledgedBy) {
      updates.acknowledged_by = data.acknowledgedBy;
      updates.acknowledged_at = new Date().toISOString();
    }

    if (data.status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      if (data.resolutionNotes) {
        updates.resolution_notes = data.resolutionNotes;
      }
    }

    // Build update query
    const setClause = Object.keys(updates)
      .map(key => {
        const value = updates[key];
        const escapedValue = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
        return `${key} = ${escapedValue}`;
      })
      .join(', ');

    const result = await sql(`
      UPDATE contract_risk_alerts
      SET ${setClause}
      WHERE id = '${data.alertId}'
      RETURNING *
    `);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Risk alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Risk alert updated successfully',
      data: result[0]
    });

  } catch (error) {
    console.error('Update risk alert error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update risk alert' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a risk alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM contract_risk_alerts
      WHERE id = ${alertId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Risk alert deleted successfully'
    });

  } catch (error) {
    console.error('Delete risk alert error:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk alert' },
      { status: 500 }
    );
  }
}
