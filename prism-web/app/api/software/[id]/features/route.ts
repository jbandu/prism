/**
 * Software Features API
 * Manage features for specific software products
 * GET - Retrieve features for a software
 * POST - Add features to a software
 * DELETE - Remove features from a software
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const softwareId = params.id;

    if (!softwareId) {
      return NextResponse.json(
        { success: false, error: 'Software ID is required' },
        { status: 400 }
      );
    }

    // Get all features for this software
    const features = await sql`
      SELECT
        sfm.*,
        fc.category_name,
        fc.description as category_description,
        fc.icon
      FROM software_features_mapping sfm
      LEFT JOIN feature_categories fc ON fc.id = sfm.feature_category_id
      WHERE sfm.software_id = ${softwareId}
      ORDER BY fc.category_name, sfm.feature_name
    `;

    // Get available categories
    const categories = await sql`
      SELECT * FROM feature_categories
      ORDER BY category_name
    `;

    return NextResponse.json({
      success: true,
      data: {
        features,
        categories
      }
    });
  } catch (error) {
    console.error('Get features error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get features' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const softwareId = params.id;
    const body = await request.json();
    const { features } = body;

    if (!softwareId || !features || !Array.isArray(features)) {
      return NextResponse.json(
        { success: false, error: 'Software ID and features array are required' },
        { status: 400 }
      );
    }

    // Add features (will skip duplicates due to UNIQUE constraint)
    const results = [];
    for (const feature of features) {
      const { feature_name, feature_category_id } = feature;

      if (!feature_name) {
        continue;
      }

      try {
        await sql`
          INSERT INTO software_features_mapping
            (software_id, feature_category_id, feature_name)
          VALUES
            (${softwareId}, ${feature_category_id || null}, ${feature_name})
          ON CONFLICT (software_id, feature_name)
          DO NOTHING
        `;
        results.push({ feature_name, status: 'added' });
      } catch (error) {
        results.push({ feature_name, status: 'error', error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.filter(r => r.status === 'added').length} features`,
      data: results
    });
  } catch (error) {
    console.error('Add features error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add features' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const softwareId = params.id;
    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get('featureId');
    const featureName = searchParams.get('featureName');

    if (!softwareId || (!featureId && !featureName)) {
      return NextResponse.json(
        { success: false, error: 'Software ID and featureId or featureName are required' },
        { status: 400 }
      );
    }

    // Delete feature
    if (featureId) {
      await sql`
        DELETE FROM software_features_mapping
        WHERE id = ${featureId} AND software_id = ${softwareId}
      `;
    } else if (featureName) {
      await sql`
        DELETE FROM software_features_mapping
        WHERE software_id = ${softwareId} AND feature_name = ${featureName}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Feature removed successfully'
    });
  } catch (error) {
    console.error('Delete feature error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feature' },
      { status: 500 }
    );
  }
}
