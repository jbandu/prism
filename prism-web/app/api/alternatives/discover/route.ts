import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { findAlternatives, calculateAlternativeROI, type AlternativeMatch, type ROIAnalysis } from '@/lib/alternatives/ai-matching-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface DiscoverRequest {
  softwareId: string;
  maxResults?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverRequest = await request.json();
    const { softwareId, maxResults = 5 } = body;

    if (!softwareId) {
      return NextResponse.json(
        { error: 'softwareId is required' },
        { status: 400 }
      );
    }

    // Fetch software details
    const softwareResult = await sql`
      SELECT
        s.*,
        c.name as company_name
      FROM software s
      LEFT JOIN companies c ON s.company_id = c.id
      WHERE s.id = ${softwareId}
      LIMIT 1
    `;

    if (softwareResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Software not found' },
        { status: 404 }
      );
    }

    const software = softwareResult.rows[0];

    // Check if we have cached alternatives (less than 30 days old)
    const cachedAlternatives = await sql`
      SELECT *
      FROM software_alternatives
      WHERE original_software_name = ${software.software_name}
        AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY feature_match_score DESC
      LIMIT ${maxResults}
    `;

    let alternatives: AlternativeMatch[];

    if (cachedAlternatives.rows.length >= 3) {
      // Use cached alternatives
      console.log(`Using ${cachedAlternatives.rows.length} cached alternatives for ${software.software_name}`);

      alternatives = cachedAlternatives.rows.map(row => ({
        alternative_software_name: row.alternative_software_name,
        alternative_vendor_name: row.alternative_vendor_name,
        alternative_category: row.alternative_category,
        feature_match_score: parseFloat(row.feature_match_score || '0'),
        shared_features: row.shared_features || [],
        unique_features_original: row.unique_features_original || [],
        unique_features_alternative: row.unique_features_alternative || [],
        missing_critical_features: row.missing_critical_features || [],
        pricing_model: row.pricing_model,
        estimated_cost_difference_percentage: row.estimated_cost_difference_percentage,
        cost_comparison_details: row.cost_comparison_details || {},
        migration_difficulty: row.migration_difficulty,
        migration_time_estimate: row.migration_time_estimate,
        migration_cost_estimate: parseFloat(row.migration_cost_estimate || '0'),
        data_migration_complexity: row.data_migration_complexity,
        integration_challenges: row.integration_challenges || [],
        market_position: row.market_position,
        user_rating: parseFloat(row.user_rating || '0'),
        total_users: row.total_users,
        company_size_fit: row.company_size_fit,
        recommendation_confidence: row.recommendation_confidence,
        ai_summary: row.ai_summary,
        pros: row.pros || [],
        cons: row.cons || [],
      }));

    } else {
      // Generate new alternatives using AI
      console.log(`Generating fresh alternatives for ${software.software_name}`);

      alternatives = await findAlternatives({
        software_name: software.software_name,
        vendor_name: software.vendor_name,
        category: software.category,
        annual_cost: parseFloat(software.annual_cost || '0'),
        license_count: software.license_count || 0,
        active_users: software.active_users || 0,
      }, maxResults);

      // Save to database for caching
      for (const alt of alternatives) {
        try {
          await sql`
            INSERT INTO software_alternatives (
              original_software_id,
              original_software_name,
              original_vendor_name,
              category,
              alternative_software_name,
              alternative_vendor_name,
              alternative_category,
              feature_match_score,
              shared_features,
              unique_features_original,
              unique_features_alternative,
              missing_critical_features,
              pricing_model,
              estimated_cost_difference_percentage,
              cost_comparison_details,
              migration_difficulty,
              migration_time_estimate,
              migration_cost_estimate,
              data_migration_complexity,
              integration_challenges,
              market_position,
              user_rating,
              total_users,
              company_size_fit,
              recommendation_confidence,
              ai_summary,
              pros,
              cons,
              data_source
            ) VALUES (
              ${software.id},
              ${software.software_name},
              ${software.vendor_name},
              ${software.category},
              ${alt.alternative_software_name},
              ${alt.alternative_vendor_name},
              ${alt.alternative_category},
              ${alt.feature_match_score},
              ${JSON.stringify(alt.shared_features)},
              ${JSON.stringify(alt.unique_features_original)},
              ${JSON.stringify(alt.unique_features_alternative)},
              ${JSON.stringify(alt.missing_critical_features)},
              ${alt.pricing_model},
              ${alt.estimated_cost_difference_percentage},
              ${JSON.stringify(alt.cost_comparison_details)},
              ${alt.migration_difficulty},
              ${alt.migration_time_estimate},
              ${alt.migration_cost_estimate},
              ${alt.data_migration_complexity},
              ${JSON.stringify(alt.integration_challenges)},
              ${alt.market_position},
              ${alt.user_rating},
              ${alt.total_users},
              ${alt.company_size_fit},
              ${alt.recommendation_confidence},
              ${alt.ai_summary},
              ${JSON.stringify(alt.pros)},
              ${JSON.stringify(alt.cons)},
              'openai-gpt4o-mini'
            )
            ON CONFLICT (original_software_name, alternative_software_name)
            DO UPDATE SET
              feature_match_score = EXCLUDED.feature_match_score,
              shared_features = EXCLUDED.shared_features,
              last_updated = NOW()
          `;
        } catch (insertError) {
          console.error('Failed to cache alternative:', insertError);
          // Continue even if caching fails
        }
      }
    }

    // Calculate ROI for each alternative
    const alternativesWithROI = alternatives.map(alt => {
      const roi = calculateAlternativeROI(
        parseFloat(software.annual_cost || '0'),
        alt,
        software.license_count || 0
      );

      return {
        ...alt,
        roi
      };
    });

    // Sort by ROI percentage (highest first)
    alternativesWithROI.sort((a, b) => b.roi.roi_percentage - a.roi.roi_percentage);

    return NextResponse.json({
      success: true,
      data: {
        current_software: {
          id: software.id,
          software_name: software.software_name,
          vendor_name: software.vendor_name,
          category: software.category,
          annual_cost: parseFloat(software.annual_cost || '0'),
          license_count: software.license_count,
          active_users: software.active_users,
        },
        alternatives: alternativesWithROI,
        generated_at: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Alternatives discovery error:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover alternatives',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve existing evaluations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const softwareId = searchParams.get('softwareId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    let query;
    if (softwareId) {
      // Get evaluations for specific software
      query = await sql`
        SELECT
          ae.*,
          sa.alternative_software_name,
          sa.alternative_vendor_name,
          sa.feature_match_score,
          sa.ai_summary,
          sa.pros,
          sa.cons
        FROM alternative_evaluations ae
        LEFT JOIN software_alternatives sa ON ae.alternative_id = sa.id
        WHERE ae.company_id = ${companyId}
          AND ae.current_software_id = ${softwareId}
        ORDER BY ae.annual_savings DESC
      `;
    } else {
      // Get all evaluations for company
      query = await sql`
        SELECT
          ae.*,
          s.software_name as current_software_name,
          s.vendor_name as current_vendor_name,
          sa.alternative_software_name,
          sa.alternative_vendor_name,
          sa.feature_match_score
        FROM alternative_evaluations ae
        LEFT JOIN software s ON ae.current_software_id = s.id
        LEFT JOIN software_alternatives sa ON ae.alternative_id = sa.id
        WHERE ae.company_id = ${companyId}
        ORDER BY ae.annual_savings DESC
      `;
    }

    return NextResponse.json({
      success: true,
      data: query.rows
    });

  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
