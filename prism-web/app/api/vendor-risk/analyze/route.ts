import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { analyzeVendorRisk, calculatePortfolioRisk } from '@/lib/vendor-risk/risk-analyzer';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST - Analyze vendor risk for specific software
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { softwareId, companyId } = body;

    if (!softwareId) {
      return NextResponse.json({ error: 'softwareId required' }, { status: 400 });
    }

    // Get software details
    const software = await sql`
      SELECT *
      FROM software
      WHERE id = ${softwareId}
      LIMIT 1
    `;

    if (software.length === 0) {
      return NextResponse.json({ error: 'Software not found' }, { status: 404 });
    }

    const sw = software[0];

    // Check if we have recent analysis (< 30 days old)
    const cachedAnalysis = await sql`
      SELECT *
      FROM vendor_risk_assessments
      WHERE vendor_name = ${sw.vendor_name}
        AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (cachedAnalysis.length > 0) {
      console.log(`Using cached risk analysis for ${sw.vendor_name}`);
      return NextResponse.json({
        success: true,
        data: cachedAnalysis[0].analysis_data,
        cached: true,
      });
    }

    // Perform fresh analysis
    console.log(`Performing fresh vendor risk analysis for ${sw.vendor_name}`);

    const analysis = await analyzeVendorRisk(
      sw.vendor_name,
      sw.software_name,
      companyId ? `Company ID: ${companyId}` : undefined
    );

    // Save to database
    await sql`
      INSERT INTO vendor_risk_assessments (
        vendor_name,
        software_name,
        overall_risk_score,
        risk_level,
        analysis_data,
        created_at
      ) VALUES (
        ${sw.vendor_name},
        ${sw.software_name},
        ${analysis.overall_risk_score},
        ${analysis.risk_level},
        ${JSON.stringify(analysis)},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: false,
    });
  } catch (error) {
    console.error('Vendor risk analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze vendor risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get portfolio-wide vendor risk analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    // Get all software for company
    const software = await sql`
      SELECT DISTINCT vendor_name, software_name
      FROM software
      WHERE company_id = ${companyId}
        AND status = 'active'
    `;

    // Get risk assessments for these vendors
    const vendorNames = software.map(s => s.vendor_name);

    if (vendorNames.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          vendor_risks: [],
          portfolio_summary: {
            average_risk_score: 0,
            high_risk_vendors: 0,
            total_vendors: 0,
            risk_distribution: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
            top_risks: [],
          },
        },
      });
    }

    const riskAssessments = await sql`
      SELECT DISTINCT ON (vendor_name)
        *
      FROM vendor_risk_assessments
      WHERE vendor_name = ANY(${vendorNames})
      ORDER BY vendor_name, created_at DESC
    `;

    // Calculate portfolio summary
    const vendorRisks = riskAssessments.map(r => r.analysis_data);
    const portfolioSummary = calculatePortfolioRisk(vendorRisks);

    return NextResponse.json({
      success: true,
      data: {
        vendor_risks: riskAssessments,
        portfolio_summary: portfolioSummary,
        vendors_needing_analysis: software.length - riskAssessments.length,
      },
    });
  } catch (error) {
    console.error('Portfolio risk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to get portfolio risk analysis' },
      { status: 500 }
    );
  }
}
