import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const runtime = 'nodejs';
export const maxDuration = 60;

interface SimulationRequest {
  companyId: string;
  scenario: 'consolidate' | 'switch' | 'eliminate';
  softwareIds: string[];
  targetSoftwareId?: string; // For consolidate/switch scenarios
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SimulationRequest = await request.json();
    const { companyId, scenario, softwareIds, targetSoftwareId, description } = body;

    if (!companyId || !scenario || !softwareIds || softwareIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch software details
    const software = await sql`
      SELECT *
      FROM software
      WHERE id = ANY(${softwareIds})
      AND company_id = ${companyId}
    `;

    if (software.length === 0) {
      return NextResponse.json(
        { error: 'No software found' },
        { status: 404 }
      );
    }

    let targetSoftware = null;
    if (targetSoftwareId) {
      const target = await sql`
        SELECT *
        FROM software_catalog
        WHERE id = ${targetSoftwareId}
        LIMIT 1
      `;
      targetSoftware = target[0];
    }

    // Calculate current costs
    const currentAnnualCost = software.reduce(
      (sum, sw) => sum + parseFloat(sw.annual_cost || '0'),
      0
    );
    const currentLicenseCount = software.reduce(
      (sum, sw) => sum + (sw.license_count || 0),
      0
    );

    // Build AI prompt based on scenario
    let prompt = '';

    if (scenario === 'consolidate' && targetSoftware) {
      prompt = `Analyze this software consolidation scenario:

**Current Software (to consolidate):**
${software.map(sw => `- ${sw.software_name} by ${sw.vendor_name}: $${parseFloat(sw.annual_cost || '0').toFixed(0)}/year, ${sw.license_count} licenses`).join('\n')}

**Target Software (consolidate into):**
- ${targetSoftware.software_name} by ${targetSoftware.vendor_name}

**User Context:** ${description || 'No additional context provided'}

**Current Total Cost:** $${currentAnnualCost.toFixed(0)}/year

Provide a detailed analysis in JSON format:
{
  "estimated_new_annual_cost": number,
  "annual_savings": number,
  "savings_percentage": number,
  "implementation_cost": number,
  "break_even_months": number,
  "feasibility_score": number (0-100),
  "risks": [
    {
      "risk": "string",
      "severity": "low" | "medium" | "high",
      "mitigation": "string"
    }
  ],
  "benefits": ["string"],
  "migration_steps": [
    {
      "step": "string",
      "duration": "string",
      "complexity": "low" | "medium" | "high"
    }
  ],
  "recommendation": "proceed" | "consider" | "not_recommended",
  "rationale": "string (2-3 sentences)"
}`;
    } else if (scenario === 'switch' && targetSoftware) {
      const primarySoftware = software[0];
      prompt = `Analyze switching from ${primarySoftware.software_name} to ${targetSoftware.software_name}:

**Current Software:**
- ${primarySoftware.software_name} by ${primarySoftware.vendor_name}
- Annual Cost: $${parseFloat(primarySoftware.annual_cost || '0').toFixed(0)}
- Licenses: ${primarySoftware.license_count}

**Target Software:**
- ${targetSoftware.software_name} by ${targetSoftware.vendor_name}

**User Context:** ${description || 'Standard switch analysis'}

Provide analysis in the same JSON format as above.`;
    } else if (scenario === 'eliminate') {
      prompt = `Analyze the impact of eliminating these software tools:

**Software to Eliminate:**
${software.map(sw => `- ${sw.software_name}: $${parseFloat(sw.annual_cost || '0').toFixed(0)}/year, ${sw.license_count} users`).join('\n')}

**User Context:** ${description || 'Considering elimination'}

Provide analysis focusing on:
- Immediate annual savings
- Features that would be lost
- Alternative ways to cover critical functions
- Impact on team productivity
- Recommended replacement tools (if needed)

Same JSON format as above.`;
    }

    // Call Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Calculate ROI metrics
    const roi_3_year =
      ((analysis.annual_savings * 3 - analysis.implementation_cost) /
        analysis.implementation_cost) *
      100;

    // Save simulation to database for tracking
    const simulation = await sql`
      INSERT INTO savings_simulations (
        company_id,
        scenario_type,
        software_ids,
        target_software_id,
        current_annual_cost,
        estimated_new_cost,
        annual_savings,
        implementation_cost,
        break_even_months,
        feasibility_score,
        recommendation,
        analysis_data,
        created_at
      ) VALUES (
        ${companyId},
        ${scenario},
        ${JSON.stringify(softwareIds)},
        ${targetSoftwareId || null},
        ${currentAnnualCost},
        ${analysis.estimated_new_annual_cost || 0},
        ${analysis.annual_savings || 0},
        ${analysis.implementation_cost || 0},
        ${analysis.break_even_months || null},
        ${analysis.feasibility_score || null},
        ${analysis.recommendation},
        ${JSON.stringify(analysis)},
        NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      data: {
        simulation_id: simulation[0].id,
        scenario,
        current_state: {
          software_count: software.length,
          annual_cost: currentAnnualCost,
          license_count: currentLicenseCount,
        },
        analysis: {
          ...analysis,
          roi_3_year,
        },
      },
    });
  } catch (error) {
    console.error('Savings simulation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to simulate savings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve past simulations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const simulations = await sql`
      SELECT *
      FROM savings_simulations
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      data: simulations,
    });
  } catch (error) {
    console.error('Failed to fetch simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}
