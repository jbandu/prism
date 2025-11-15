/**
 * API Route: Get Software Categories for Redundancy Analysis
 * GET /api/redundancy/categories?companyId={id}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
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

    // Get category breakdown with software counts and total costs
    const categories = await sql`
      SELECT
        category,
        COUNT(*) as software_count,
        SUM(COALESCE(total_annual_cost, 0)) as total_cost,
        AVG(COALESCE(total_annual_cost, 0)) as avg_cost,
        ARRAY_AGG(
          DISTINCT vendor_name ORDER BY vendor_name
        ) FILTER (WHERE vendor_name IS NOT NULL) as vendors
      FROM software
      WHERE company_id = ${companyId}
        AND contract_status = 'active'
        AND deleted_at IS NULL
      GROUP BY category
      ORDER BY COUNT(*) DESC, category ASC
    `;

    // Get analysis status for each category
    const categorySummaries = await sql`
      SELECT
        category,
        total_software_count,
        redundant_pairs_count,
        total_potential_savings,
        last_analyzed_at,
        analysis_status
      FROM category_redundancy_summary
      WHERE company_id = ${companyId}
    `;

    // Merge the data
    const summaryMap = new Map(
      categorySummaries.map((s: any) => [s.category, s])
    );

    const enrichedCategories = categories.map((cat: any) => {
      const summary = summaryMap.get(cat.category);
      return {
        category: cat.category,
        softwareCount: parseInt(cat.software_count),
        totalCost: parseFloat(cat.total_cost || 0),
        avgCost: parseFloat(cat.avg_cost || 0),
        vendors: cat.vendors || [],
        vendorCount: (cat.vendors || []).length,
        // Analysis status
        lastAnalyzedAt: summary?.last_analyzed_at || null,
        analysisStatus: summary?.analysis_status || 'pending',
        redundantPairs: parseInt(summary?.redundant_pairs_count || 0),
        potentialSavings: parseFloat(summary?.total_potential_savings || 0),
      };
    });

    // Get total stats
    const totalStats = await sql`
      SELECT
        COUNT(*) as total_software,
        SUM(COALESCE(total_annual_cost, 0)) as total_cost,
        COUNT(DISTINCT category) as total_categories
      FROM software
      WHERE company_id = ${companyId}
        AND contract_status = 'active'
        AND deleted_at IS NULL
    `;

    return NextResponse.json({
      success: true,
      categories: enrichedCategories,
      summary: {
        totalSoftware: parseInt(totalStats[0]?.total_software || 0),
        totalCost: parseFloat(totalStats[0]?.total_cost || 0),
        totalCategories: parseInt(totalStats[0]?.total_categories || 0),
      },
    });
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
