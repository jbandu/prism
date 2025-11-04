/**
 * API Route: Track Negotiation Outcomes
 * POST /api/negotiation/outcomes
 * GET /api/negotiation/outcomes?companyId=uuid
 *
 * Track actual savings achieved from negotiations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, canAccessCompany, canModify } from '@/lib/auth';
import { neon } from '@/lib/db';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST - Record negotiation outcome
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      playbook_id,
      software_id,
      company_id,
      original_annual_cost,
      negotiated_annual_cost,
      negotiation_tactics_used,
      vendor_response,
      final_terms,
      negotiation_duration_days,
      success_rating,
      notes,
      new_renewal_date,
      new_contract_length_years,
      new_payment_terms
    } = body;

    // Validate required fields
    if (!software_id || !company_id || !original_annual_cost || !negotiated_annual_cost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check access
    if (!canAccessCompany(session.user as any, company_id)) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 }
      );
    }

    if (!canModify(session.user as any)) {
      return NextResponse.json(
        { error: 'Forbidden - Modification not allowed' },
        { status: 403 }
      );
    }

    // Calculate savings
    const annual_savings = original_annual_cost - negotiated_annual_cost;
    const discount_achieved = Math.round((annual_savings / original_annual_cost) * 100);

    console.log(`\n💰 Recording negotiation outcome:`);
    console.log(`   Original: $${original_annual_cost.toLocaleString()}`);
    console.log(`   Negotiated: $${negotiated_annual_cost.toLocaleString()}`);
    console.log(`   Savings: $${annual_savings.toLocaleString()} (${discount_achieved}%)`);

    // Save outcome
    const outcome = await sql`
      INSERT INTO negotiation_outcomes (
        playbook_id,
        company_id,
        software_id,
        original_annual_cost,
        negotiated_annual_cost,
        annual_savings,
        discount_achieved,
        negotiation_tactics_used,
        vendor_response,
        final_terms,
        negotiation_duration_days,
        success_rating,
        notes,
        new_renewal_date,
        new_contract_length_years,
        new_payment_terms,
        recorded_by
      )
      VALUES (
        ${playbook_id || null},
        ${company_id},
        ${software_id},
        ${original_annual_cost},
        ${negotiated_annual_cost},
        ${annual_savings},
        ${discount_achieved},
        ${negotiation_tactics_used ? JSON.stringify(negotiation_tactics_used) : null},
        ${vendor_response || null},
        ${final_terms ? JSON.stringify(final_terms) : null},
        ${negotiation_duration_days || null},
        ${success_rating || null},
        ${notes || null},
        ${new_renewal_date || null},
        ${new_contract_length_years || null},
        ${new_payment_terms || null},
        ${(session.user as any).id || null}
      )
      RETURNING *
    `;

    // Update software with new cost if provided
    if (negotiated_annual_cost) {
      await sql`
        UPDATE software
        SET
          annual_cost = ${negotiated_annual_cost},
          contract_end_date = ${new_renewal_date || sql`contract_end_date`},
          updated_at = NOW()
        WHERE id = ${software_id}
      `;
    }

    // Update playbook status
    if (playbook_id) {
      await sql`
        UPDATE negotiation_playbooks
        SET
          status = 'completed',
          negotiation_completed_at = NOW()
        WHERE id = ${playbook_id}
      `;
    }

    console.log('✅ Outcome recorded successfully');

    return NextResponse.json({
      success: true,
      data: outcome[0],
      message: `Negotiation outcome recorded. You saved $${annual_savings.toLocaleString()}/year!`
    });

  } catch (error) {
    console.error('❌ Failed to record negotiation outcome:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record outcome'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get negotiation outcomes for company
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Check access
    if (!canAccessCompany(session.user as any, companyId)) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 }
      );
    }

    // Get all outcomes for company
    const outcomes = await sql`
      SELECT
        o.*,
        s.software_name,
        s.vendor_name,
        s.category
      FROM negotiation_outcomes o
      JOIN software s ON o.software_id = s.id
      WHERE o.company_id = ${companyId}
      ORDER BY o.achieved_at DESC
    `;

    // Calculate aggregate metrics
    const totalSavings = outcomes.reduce((sum, o) => sum + parseFloat(o.annual_savings as any), 0);
    const avgDiscount = outcomes.length > 0
      ? outcomes.reduce((sum, o) => sum + o.discount_achieved, 0) / outcomes.length
      : 0;
    const avgSuccessRating = outcomes.length > 0
      ? outcomes.reduce((sum, o) => sum + (o.success_rating || 0), 0) / outcomes.length
      : 0;

    return NextResponse.json({
      success: true,
      data: outcomes,
      metrics: {
        total_negotiations: outcomes.length,
        total_annual_savings: totalSavings,
        average_discount: Math.round(avgDiscount),
        average_success_rating: avgSuccessRating.toFixed(1)
      }
    });

  } catch (error) {
    console.error('❌ Failed to get negotiation outcomes:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get outcomes'
      },
      { status: 500 }
    );
  }
}
