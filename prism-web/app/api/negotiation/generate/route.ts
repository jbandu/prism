/**
 * API Route: Generate Negotiation Playbook
 * POST /api/negotiation/generate
 *
 * Generates AI-powered negotiation strategy for software renewal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, canAccessCompany } from '@/lib/auth';
import { generateNegotiationPlaybook } from '@/lib/negotiation/ai-negotiation-service';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { softwareId } = await request.json();

    if (!softwareId) {
      return NextResponse.json(
        { error: 'Software ID is required' },
        { status: 400 }
      );
    }

    console.log(`\n💼 Generating negotiation playbook for software: ${softwareId}`);

    // Get software details from software_assets view
    const softwareResult = await sql`
      SELECT
        sa.*,
        c.id as company_id,
        c.company_name
      FROM software_assets sa
      JOIN companies c ON sa.company_id = c.id
      WHERE sa.id = ${softwareId}
    `;

    if (softwareResult.length === 0) {
      return NextResponse.json(
        { error: 'Software not found' },
        { status: 404 }
      );
    }

    const software = softwareResult[0];

    // Check access
    if (!canAccessCompany(session.user as any, software.company_id)) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 }
      );
    }

    // Calculate contract length and total spent
    const contractStart = new Date(software.contract_start_date);
    const contractEnd = new Date(software.contract_end_date || software.renewal_date);
    const contractLengthYears = Math.max(
      (contractEnd.getTime() - contractStart.getTime()) / (365 * 24 * 60 * 60 * 1000),
      1
    );

    const annualCost = parseFloat(software.total_annual_cost) || 0;
    const totalSpent = annualCost * contractLengthYears;

    // Prepare data for AI analysis
    const negotiationData = {
      software_name: software.software_name,
      vendor_name: software.vendor_name,
      category: software.category,
      annual_cost: annualCost,
      license_count: software.total_licenses || 0,
      active_users: software.active_users || 0,
      utilization_rate: parseFloat(software.utilization_rate) || 0,
      contract_start_date: software.contract_start_date,
      renewal_date: software.renewal_date || software.contract_end_date,
      contract_length_years: contractLengthYears,
      total_spent_to_date: totalSpent,
      payment_history: 'good' as const // Could be enhanced with actual payment data
    };

    console.log('📊 Software data:', negotiationData);

    // Generate playbook using AI
    const playbook = await generateNegotiationPlaybook(negotiationData);

    console.log(`✅ Playbook generated with ${playbook.confidence_level} confidence`);

    // Save playbook to database
    const savedPlaybook = await sql`
      INSERT INTO negotiation_playbooks (
        company_id,
        software_id,
        market_average_price,
        market_discount_range_min,
        market_discount_range_max,
        competitor_alternatives,
        pricing_trends,
        utilization_rate,
        unused_licenses,
        contract_length_years,
        total_spent_to_date,
        payment_history_score,
        recommended_target_discount,
        confidence_level,
        leverage_points,
        risks,
        talking_points,
        email_initial_outreach,
        email_counter_offer,
        email_final_push,
        email_alternative_threat,
        generated_by,
        ai_model_version,
        status
      )
      VALUES (
        ${software.company_id},
        ${softwareId},
        ${playbook.market_average_price},
        ${playbook.market_discount_range_min},
        ${playbook.market_discount_range_max},
        ${JSON.stringify(playbook.competitor_alternatives)},
        ${playbook.pricing_trends},
        ${playbook.utilization_rate},
        ${playbook.unused_licenses},
        ${playbook.contract_length_years},
        ${playbook.total_spent_to_date},
        ${playbook.payment_history_score},
        ${playbook.recommended_target_discount},
        ${playbook.confidence_level},
        ${JSON.stringify(playbook.leverage_points)},
        ${JSON.stringify(playbook.risks)},
        ${JSON.stringify(playbook.talking_points)},
        ${playbook.email_initial_outreach},
        ${playbook.email_counter_offer},
        ${playbook.email_final_push},
        ${playbook.email_alternative_threat},
        ${(session.user as any).id || null},
        ${'gpt-4o-mini'},
        ${'draft'}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: {
        ...playbook,
        playbook_id: savedPlaybook[0].id,
        software_name: software.software_name,
        vendor_name: software.vendor_name,
        current_annual_cost: negotiationData.annual_cost,
        target_annual_cost: negotiationData.annual_cost * (1 - playbook.recommended_target_discount / 100),
        potential_savings: negotiationData.annual_cost * (playbook.recommended_target_discount / 100)
      },
      message: `Negotiation playbook generated with ${playbook.confidence_level} confidence`
    });

  } catch (error) {
    console.error('❌ Failed to generate negotiation playbook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate playbook'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/negotiation/generate?softwareId=uuid
 * Get existing playbook for software
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const softwareId = searchParams.get('softwareId');

    if (!softwareId) {
      return NextResponse.json(
        { error: 'Software ID is required' },
        { status: 400 }
      );
    }

    // Get most recent playbook
    const playbooks = await sql`
      SELECT
        p.*,
        sa.software_name,
        sa.vendor_name,
        sa.total_annual_cost as current_annual_cost
      FROM negotiation_playbooks p
      JOIN software_assets sa ON p.software_id = sa.id
      WHERE p.software_id = ${softwareId}
      ORDER BY p.generated_at DESC
      LIMIT 1
    `;

    if (playbooks.length === 0) {
      return NextResponse.json(
        { error: 'No playbook found' },
        { status: 404 }
      );
    }

    const playbook = playbooks[0];

    // Check access
    if (!canAccessCompany(session.user as any, playbook.company_id)) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...playbook,
        target_annual_cost: playbook.current_annual_cost * (1 - playbook.recommended_target_discount / 100),
        potential_savings: playbook.current_annual_cost * (playbook.recommended_target_discount / 100)
      }
    });

  } catch (error) {
    console.error('❌ Failed to get negotiation playbook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get playbook'
      },
      { status: 500 }
    );
  }
}
