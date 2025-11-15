import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const EvaluationSchema = z.object({
  companyId: z.string().uuid(),
  currentSoftwareId: z.string().uuid(),
  alternativeId: z.string().uuid(),

  // Current State
  currentAnnualCost: z.number().positive(),
  currentLicenseCount: z.number().int().nonnegative().optional(),
  currentUtilizationRate: z.number().min(0).max(100).optional(),

  // Alternative Projected State
  projectedAnnualCost: z.number().positive(),
  projectedLicenseCount: z.number().int().nonnegative().optional(),
  projectedUtilizationRate: z.number().min(0).max(100).optional(),

  // Financial Analysis
  annualSavings: z.number(),
  totalCostOfOwnership3yr: z.number(),
  breakEvenMonths: z.number().int(),
  roiPercentage: z.number(),

  // Hidden Costs
  trainingCost: z.number().nonnegative(),
  migrationCost: z.number().nonnegative(),
  integrationCost: z.number().nonnegative(),
  productivityLossCost: z.number().nonnegative(),
  totalHiddenCosts: z.number().nonnegative(),

  // Risk Assessment
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  riskFactors: z.array(z.string()),
  mitigationStrategies: z.array(z.string()),

  // Decision Support
  recommendation: z.enum(['highly_recommended', 'recommended', 'consider', 'not_recommended']),
  decisionRationale: z.string(),
  keyConsiderations: z.array(z.string()).optional(),

  // Status
  status: z.string().optional().default('under_review'),
  evaluatedBy: z.string().uuid().optional(),
});

type EvaluationData = z.infer<typeof EvaluationSchema>;

/**
 * POST - Create or update an alternative evaluation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = EvaluationSchema.parse(body);

    // Check if evaluation already exists
    const existing = await sql`
      SELECT id FROM alternative_evaluations
      WHERE company_id = ${data.companyId}
        AND current_software_id = ${data.currentSoftwareId}
        AND alternative_id = ${data.alternativeId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing evaluation
      await sql`
        UPDATE alternative_evaluations SET
          current_annual_cost = ${data.currentAnnualCost},
          current_license_count = ${data.currentLicenseCount || null},
          current_utilization_rate = ${data.currentUtilizationRate || null},
          projected_annual_cost = ${data.projectedAnnualCost},
          projected_license_count = ${data.projectedLicenseCount || null},
          projected_utilization_rate = ${data.projectedUtilizationRate || null},
          annual_savings = ${data.annualSavings},
          total_cost_of_ownership_3yr = ${data.totalCostOfOwnership3yr},
          break_even_months = ${data.breakEvenMonths},
          roi_percentage = ${data.roiPercentage},
          training_cost = ${data.trainingCost},
          migration_cost = ${data.migrationCost},
          integration_cost = ${data.integrationCost},
          productivity_loss_cost = ${data.productivityLossCost},
          total_hidden_costs = ${data.totalHiddenCosts},
          risk_level = ${data.riskLevel},
          risk_factors = ${JSON.stringify(data.riskFactors)},
          mitigation_strategies = ${JSON.stringify(data.mitigationStrategies)},
          recommendation = ${data.recommendation},
          decision_rationale = ${data.decisionRationale},
          key_considerations = ${JSON.stringify(data.keyConsiderations || [])},
          status = ${data.status || 'under_review'},
          evaluated_by = ${data.evaluatedBy || null},
          evaluated_at = NOW()
        WHERE id = ${existing[0].id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Evaluation updated successfully',
        evaluationId: existing[0].id
      });

    } else {
      // Create new evaluation
      const result = await sql`
        INSERT INTO alternative_evaluations (
          company_id,
          current_software_id,
          alternative_id,
          current_annual_cost,
          current_license_count,
          current_utilization_rate,
          projected_annual_cost,
          projected_license_count,
          projected_utilization_rate,
          annual_savings,
          total_cost_of_ownership_3yr,
          break_even_months,
          roi_percentage,
          training_cost,
          migration_cost,
          integration_cost,
          productivity_loss_cost,
          total_hidden_costs,
          risk_level,
          risk_factors,
          mitigation_strategies,
          recommendation,
          decision_rationale,
          key_considerations,
          status,
          evaluated_by
        ) VALUES (
          ${data.companyId},
          ${data.currentSoftwareId},
          ${data.alternativeId},
          ${data.currentAnnualCost},
          ${data.currentLicenseCount || null},
          ${data.currentUtilizationRate || null},
          ${data.projectedAnnualCost},
          ${data.projectedLicenseCount || null},
          ${data.projectedUtilizationRate || null},
          ${data.annualSavings},
          ${data.totalCostOfOwnership3yr},
          ${data.breakEvenMonths},
          ${data.roiPercentage},
          ${data.trainingCost},
          ${data.migrationCost},
          ${data.integrationCost},
          ${data.productivityLossCost},
          ${data.totalHiddenCosts},
          ${data.riskLevel},
          ${JSON.stringify(data.riskFactors)},
          ${JSON.stringify(data.mitigationStrategies)},
          ${data.recommendation},
          ${data.decisionRationale},
          ${JSON.stringify(data.keyConsiderations || [])},
          ${data.status || 'under_review'},
          ${data.evaluatedBy || null}
        )
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        message: 'Evaluation created successfully',
        evaluationId: result[0].id
      });
    }

  } catch (error) {
    console.error('Evaluation save error:', error);

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
      {
        error: 'Failed to save evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update evaluation status/decision
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { evaluationId, status, decision, decisionNotes } = body;

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'evaluationId is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateFields: Record<string, any> = {};

    if (status) {
      updateFields.status = status;
    }

    if (decision) {
      updateFields.decision = decision;
      updateFields.decision_date = new Date();
    }

    if (decisionNotes) {
      updateFields.decision_notes = decisionNotes;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Build the SET clause dynamically
    const setClauses = Object.keys(updateFields).map(key => {
      const value = updateFields[key];
      if (value instanceof Date) {
        return `${key} = NOW()`;
      }
      return `${key} = '${value.toString().replace(/'/g, "''")}'`; // Basic SQL escaping
    }).join(', ');

    // Execute update
    await sql(`
      UPDATE alternative_evaluations
      SET ${setClauses}
      WHERE id = '${evaluationId}'
    `);

    return NextResponse.json({
      success: true,
      message: 'Evaluation status updated'
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove an evaluation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const evaluationId = searchParams.get('evaluationId');

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'evaluationId is required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM alternative_evaluations
      WHERE id = ${evaluationId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Evaluation deleted successfully'
    });

  } catch (error) {
    console.error('Delete evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    );
  }
}
