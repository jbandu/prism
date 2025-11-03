/**
 * API Route: Get Consolidation Recommendations
 * GET /api/redundancy/recommendations
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecommendations } from '@/lib/redundancy/recommendation-engine';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || (session.user as any).companyId;
    const status = searchParams.get('status') || 'pending';

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get recommendations with full details
    const recommendations = await sql`
      SELECT
        cr.*,
        sw_keep.software_name as keep_name,
        sw_keep.vendor_name as keep_vendor,
        sw_keep.annual_cost as keep_cost
      FROM consolidation_recommendations cr
      JOIN software sw_keep ON cr.software_to_keep_id = sw_keep.id
      WHERE cr.company_id = ${companyId}
      AND cr.status = ${status}
      ORDER BY cr.annual_savings DESC
    `;

    // Get software to remove details
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const removeIds = rec.software_to_remove_ids || [];

        let softwareToRemove = [];
        if (removeIds.length > 0) {
          softwareToRemove = await sql`
            SELECT id, software_name, vendor_name, annual_cost
            FROM software
            WHERE id = ANY(${removeIds})
          `;
        }

        return {
          id: rec.id,
          software_to_keep: {
            id: rec.software_to_keep_id,
            software_name: rec.keep_name,
            vendor_name: rec.keep_vendor,
            annual_cost: parseFloat(rec.keep_cost || 0),
          },
          software_to_remove: softwareToRemove.map(sw => ({
            id: sw.id,
            software_name: sw.software_name,
            vendor_name: sw.vendor_name,
            annual_cost: parseFloat(sw.annual_cost || 0),
          })),
          annual_savings: parseFloat(rec.annual_savings || 0),
          features_covered: rec.features_covered || [],
          features_at_risk: rec.features_at_risk || [],
          migration_effort: rec.migration_effort,
          business_risk: rec.business_risk,
          recommendation_text: rec.recommendation_text,
          confidence_score: parseFloat(rec.confidence_score || 0),
          status: rec.status,
          created_at: rec.created_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRecommendations,
    });
  } catch (error) {
    console.error('❌ Failed to get recommendations:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, status } = await request.json();

    if (!recommendationId || !status) {
      return NextResponse.json(
        { error: 'Recommendation ID and status are required' },
        { status: 400 }
      );
    }

    // Update recommendation status
    await sql`
      UPDATE consolidation_recommendations
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${recommendationId}
    `;

    return NextResponse.json({
      success: true,
      message: `Recommendation ${status}`,
    });
  } catch (error) {
    console.error('❌ Failed to update recommendation:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recommendation',
      },
      { status: 500 }
    );
  }
}
