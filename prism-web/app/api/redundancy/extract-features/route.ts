/**
 * Feature Extraction API
 * Extract features from software descriptions using pattern matching or AI
 * POST - Extract features for a company's software portfolio
 * GET - Preview features for a single software
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { extractFeaturesFromDescription } from '@/lib/redundancy/description-feature-extractor';
import { getCompanyById, getCompanyBySlug } from '@/lib/db-utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Resolve company slug or UUID to UUID
 */
async function resolveCompanyId(companyIdOrSlug: string): Promise<string> {
  // Check if it's already a UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(companyIdOrSlug)) {
    // Verify the UUID exists
    const company = await getCompanyById(companyIdOrSlug);
    if (!company) {
      throw new Error(`Company not found with ID: ${companyIdOrSlug}`);
    }
    return companyIdOrSlug;
  }

  // It's a slug, look up the company
  const company = await getCompanyBySlug(companyIdOrSlug);

  if (!company) {
    throw new Error(`Company not found with slug: ${companyIdOrSlug}`);
  }

  return company.id;
}

interface ExtractFeaturesRequest {
  companyId: string;
  softwareIds?: string[]; // Optional: extract for specific software only
  minConfidence?: number; // Minimum confidence threshold (0-1)
  overwriteExisting?: boolean; // Whether to overwrite existing features
  method?: 'description' | 'ai'; // Extraction method
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractFeaturesRequest = await request.json();
    const {
      companyId,
      softwareIds,
      minConfidence = 0.6,
      overwriteExisting = false,
      method = 'description'
    } = body;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Resolve slug to UUID if needed
    const resolvedCompanyId = await resolveCompanyId(companyId);

    // Fetch software products from software_assets table
    // We'll extract features based on software_name, vendor_name, and category
    let softwareQuery;
    if (softwareIds && softwareIds.length > 0) {
      softwareQuery = sql`
        SELECT
          id,
          software_name,
          vendor_name,
          category,
          COALESCE(software_name || ' ' || vendor_name, software_name) as description
        FROM software_assets
        WHERE company_id = ${resolvedCompanyId}
          AND contract_status = 'active'
          AND id = ANY(${softwareIds})
      `;
    } else {
      softwareQuery = sql`
        SELECT
          id,
          software_name,
          vendor_name,
          category,
          COALESCE(software_name || ' ' || vendor_name, software_name) as description
        FROM software_assets
        WHERE company_id = ${resolvedCompanyId}
          AND contract_status = 'active'
      `;
    }

    const softwareList = await softwareQuery;

    if (softwareList.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No software with descriptions found',
        data: {
          processed: 0,
          featuresAdded: 0,
          results: []
        }
      });
    }

    console.log(`\n🔍 Extracting features for ${softwareList.length} software products using ${method} method`);

    // Process each software and extract features
    const results = [];
    let totalFeaturesAdded = 0;

    for (const software of softwareList) {
      try {
        // Extract features from description (AI method would go here in future)
        const extractedFeatures = extractFeaturesFromDescription(
          software.description,
          software.category,
          software.software_name
        );

        // Filter by confidence threshold
        const filteredFeatures = extractedFeatures.filter(
          f => f.confidence >= minConfidence
        );

        if (filteredFeatures.length === 0) {
          results.push({
            software_id: software.id,
            software_name: software.software_name,
            status: 'no_features',
            features_count: 0
          });
          continue;
        }

        // Get existing features if not overwriting
        let existingFeatures: string[] = [];
        if (!overwriteExisting) {
          const existing = await sql`
            SELECT feature_name
            FROM software_features_mapping
            WHERE software_id = ${software.id}
          `;
          existingFeatures = existing.map((r: any) => r.feature_name.toLowerCase());
        }

        // Insert features into database
        let addedCount = 0;
        for (const feature of filteredFeatures) {
          // Skip if already exists and not overwriting
          if (!overwriteExisting && existingFeatures.includes(feature.feature_name.toLowerCase())) {
            continue;
          }

          try {
            await sql`
              INSERT INTO software_features_mapping
                (software_id, feature_name, feature_category_id)
              VALUES
                (${software.id}, ${feature.feature_name}, NULL)
              ON CONFLICT (software_id, feature_name)
              DO NOTHING
            `;
            addedCount++;
          } catch (error) {
            console.error(`Failed to add feature ${feature.feature_name}:`, error);
          }
        }

        totalFeaturesAdded += addedCount;

        results.push({
          software_id: software.id,
          software_name: software.software_name,
          status: 'success',
          features_extracted: filteredFeatures.length,
          features_added: addedCount,
          features: filteredFeatures.map(f => ({
            name: f.feature_name,
            confidence: f.confidence,
            source: f.source
          }))
        });

        console.log(`  ✅ ${software.software_name}: Added ${addedCount} features`);

      } catch (error) {
        console.error(`Failed to process software ${software.id}:`, error);
        results.push({
          software_id: software.id,
          software_name: software.software_name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`\n✅ Feature extraction complete: ${totalFeaturesAdded} features added\n`);

    return NextResponse.json({
      success: true,
      message: `Processed ${softwareList.length} software products, added ${totalFeaturesAdded} features`,
      data: {
        processed: softwareList.length,
        featuresAdded: totalFeaturesAdded,
        results
      }
    });

  } catch (error) {
    console.error('❌ Feature extraction failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract features',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const softwareId = searchParams.get('softwareId');

    if (!companyId || !softwareId) {
      return NextResponse.json(
        { success: false, error: 'Company ID and Software ID are required' },
        { status: 400 }
      );
    }

    // Get software (create description from name and vendor)
    const software = await sql`
      SELECT
        id,
        software_name,
        vendor_name,
        category,
        COALESCE(software_name || ' ' || vendor_name, software_name) as description
      FROM software_assets
      WHERE id = ${softwareId} AND company_id = ${companyId}
    `;

    if (software.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Software not found' },
        { status: 404 }
      );
    }

    const sw = software[0];

    // Extract features from software name, vendor, and category
    const features = extractFeaturesFromDescription(
      sw.description,
      sw.category,
      sw.software_name
    );

    return NextResponse.json({
      success: true,
      data: {
        software_name: sw.software_name,
        has_description: true,
        description_length: sw.description.length,
        features: features.map(f => ({
          name: f.feature_name,
          confidence: f.confidence,
          source: f.source
        }))
      }
    });

  } catch (error) {
    console.error('Feature extraction preview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to preview features' },
      { status: 500 }
    );
  }
}
