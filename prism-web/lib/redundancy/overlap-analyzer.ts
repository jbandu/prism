/**
 * Portfolio Overlap Analysis Engine
 * Detects redundant features across a company's software portfolio
 */

import { neon } from '@neondatabase/serverless';
import { extractFeaturesFromSoftware, saveFeaturesToDatabase } from './feature-extractor';
import { generateConsolidationRecommendations } from './recommendation-engine';

const sql = neon(process.env.DATABASE_URL!);

export interface SoftwareWithFeatures {
  id: string;
  software_name: string;
  vendor_name: string;
  annual_cost: number;
  category: string;
  features: Array<{
    feature_name: string;
    category_name: string;
    description: string;
  }>;
}

export interface OverlapResult {
  software1: any;
  software2: any;
  sharedFeatures: string[];
  overlapPercentage: number;
  costImplication: number;
}

export interface CategoryOverlap {
  category: string;
  softwareList: string[];
  overlapCount: number;
  redundancyCost: number;
  features: string[];
}

export interface AnalysisResult {
  overlaps: CategoryOverlap[];
  comparisonMatrix: OverlapResult[];
  recommendations: any[];
  totalRedundancyCost: number;
  analysisDate: Date;
}

/**
 * Main function to analyze a company's portfolio for overlaps
 */
export async function analyzePortfolioOverlaps(companyId: string): Promise<AnalysisResult> {
  console.log(`\n🔍 Starting portfolio overlap analysis for company ${companyId}...\n`);

  // Step 1: Get all software for this company
  const companySoftware = await sql`
    SELECT
      id,
      software_name,
      vendor_name,
      total_annual_cost as annual_cost,
      category
    FROM software_assets
    WHERE company_id = ${companyId}
    AND contract_status = 'active'
  `;

  console.log(`📦 Found ${companySoftware.length} active software products`);

  if (companySoftware.length < 2) {
    console.log('⚠️  Need at least 2 software products for overlap analysis');
    return {
      overlaps: [],
      comparisonMatrix: [],
      recommendations: [],
      totalRedundancyCost: 0,
      analysisDate: new Date(),
    };
  }

  // Step 2: Get or extract features for each software
  const softwareFeatures = new Map<string, SoftwareWithFeatures>();

  for (const software of companySoftware) {
    console.log(`\n📊 Processing: ${software.software_name}`);

    // Check if features exist in catalog
    const catalogEntry = await sql`
      SELECT id FROM software_catalog WHERE software_name = ${software.software_name}
    `;

    if (catalogEntry.length === 0) {
      // Extract features using AI
      console.log(`  🤖 Extracting features using AI...`);
      try {
        const extracted = await extractFeaturesFromSoftware(
          software.software_name,
          software.vendor_name
        );
        await saveFeaturesToDatabase(extracted);
      } catch (error) {
        console.error(`  ❌ Failed to extract features: ${error}`);
        continue;
      }
    }

    // Get features from database (check both catalog and direct mapping)
    let features = await sql`
      SELECT sfm.feature_name, fc.category_name, '' as description
      FROM software_features_mapping sfm
      JOIN feature_categories fc ON sfm.feature_category_id = fc.id
      WHERE sfm.software_id = ${software.id}
      ORDER BY fc.category_name, sfm.feature_name
    `;

    // If no features in mapping, try catalog
    if (features.length === 0) {
      features = await sql`
        SELECT sf.feature_name, fc.category_name, sf.feature_description as description
        FROM software_features sf
        JOIN feature_categories fc ON sf.feature_category_id = fc.id
        JOIN software_catalog sc ON sf.software_catalog_id = sc.id
        WHERE sc.software_name = ${software.software_name}
        ORDER BY fc.category_name, sf.feature_name
      `;
    }

    console.log(`  ✅ Found ${features.length} features`);

    softwareFeatures.set(software.id, {
      id: software.id,
      software_name: software.software_name,
      vendor_name: software.vendor_name,
      annual_cost: parseFloat(software.annual_cost || 0),
      category: software.category,
      features: features.map(f => ({
        feature_name: f.feature_name,
        category_name: f.category_name,
        description: f.description || '',
      })),
    });
  }

  console.log(`\n🔬 Analyzing overlaps between ${softwareFeatures.size} products...`);

  // Step 3: Compare all pairs and build comparison matrix
  const comparisonMatrix: OverlapResult[] = [];

  const softwareArray = Array.from(softwareFeatures.values());

  for (let i = 0; i < softwareArray.length; i++) {
    for (let j = i + 1; j < softwareArray.length; j++) {
      const sw1 = softwareArray[i];
      const sw2 = softwareArray[j];

      const sharedFeatures = findSharedFeatures(sw1.features, sw2.features);
      const totalFeatures = Math.max(sw1.features.length, sw2.features.length);
      const overlapPercentage = (sharedFeatures.length / totalFeatures) * 100;

      if (overlapPercentage > 20) {
        // Significant overlap threshold
        const costImplication = calculateRedundancyCost(
          sw1.annual_cost,
          sw2.annual_cost,
          overlapPercentage
        );

        comparisonMatrix.push({
          software1: {
            id: sw1.id,
            software_name: sw1.software_name,
            vendor_name: sw1.vendor_name,
            annual_cost: sw1.annual_cost,
          },
          software2: {
            id: sw2.id,
            software_name: sw2.software_name,
            vendor_name: sw2.vendor_name,
            annual_cost: sw2.annual_cost,
          },
          sharedFeatures,
          overlapPercentage,
          costImplication,
        });

        console.log(
          `  🔗 ${sw1.software_name} ↔ ${sw2.software_name}: ${overlapPercentage.toFixed(1)}% overlap ($${costImplication.toFixed(0)} redundancy)`
        );
      }
    }
  }

  // Step 4: Group overlaps by category
  const categoryOverlaps = await groupOverlapsByCategory(softwareFeatures, companyId);

  // Step 5: Save results to database
  await saveComparisonMatrix(companyId, comparisonMatrix);
  await saveCategoryOverlaps(companyId, categoryOverlaps);

  // Step 6: Generate consolidation recommendations
  console.log(`\n🎯 Generating consolidation recommendations...`);
  const recommendations = await generateConsolidationRecommendations(
    companyId,
    comparisonMatrix,
    softwareFeatures
  );

  const totalRedundancyCost = comparisonMatrix.reduce((sum, m) => sum + m.costImplication, 0);

  console.log(`\n✅ Analysis complete!`);
  console.log(`   📊 Total redundancy cost: $${totalRedundancyCost.toFixed(0)}`);
  console.log(`   🔗 ${comparisonMatrix.length} significant overlaps detected`);
  console.log(`   💡 ${recommendations.length} consolidation opportunities identified\n`);

  return {
    overlaps: categoryOverlaps,
    comparisonMatrix,
    recommendations,
    totalRedundancyCost,
    analysisDate: new Date(),
  };
}

/**
 * Find shared features between two software products
 */
function findSharedFeatures(
  features1: Array<{ feature_name: string; category_name: string }>,
  features2: Array<{ feature_name: string; category_name: string }>
): string[] {
  const featureSet1 = new Set(
    features1.map(f => `${f.category_name}:${f.feature_name.toLowerCase()}`)
  );
  const featureSet2 = new Set(
    features2.map(f => `${f.category_name}:${f.feature_name.toLowerCase()}`)
  );

  const shared: string[] = [];
  Array.from(featureSet1).forEach(feature => {
    if (featureSet2.has(feature)) {
      const [, featureName] = feature.split(':');
      shared.push(featureName);
    }
  });

  return shared;
}

/**
 * Calculate the cost of redundancy between two software products
 */
function calculateRedundancyCost(
  cost1: number,
  cost2: number,
  overlapPercent: number
): number {
  // Cost of redundancy = (overlap% * smaller software cost)
  const smallerCost = Math.min(cost1, cost2);
  return (overlapPercent / 100) * smallerCost;
}

/**
 * Group overlaps by feature category
 */
async function groupOverlapsByCategory(
  softwareFeatures: Map<string, SoftwareWithFeatures>,
  companyId: string
): Promise<CategoryOverlap[]> {
  const categoryMap = new Map<string, Set<string>>();
  const categoryFeatures = new Map<string, Set<string>>();

  // Build category map
  Array.from(softwareFeatures.values()).forEach(software => {
    software.features.forEach(feature => {
      if (!categoryMap.has(feature.category_name)) {
        categoryMap.set(feature.category_name, new Set());
        categoryFeatures.set(feature.category_name, new Set());
      }

      categoryMap.get(feature.category_name)!.add(software.software_name);
      categoryFeatures.get(feature.category_name)!.add(feature.feature_name);
    });
  });

  const overlaps: CategoryOverlap[] = [];

  Array.from(categoryMap.entries()).forEach(([category, softwareSet]) => {
    if (softwareSet.size > 1) {
      // Multiple software have this category
      const softwareList = Array.from(softwareSet);

      // Calculate redundancy cost
      const softwareInCategory = Array.from(softwareFeatures.values()).filter(sw =>
        sw.features.some(f => f.category_name === category)
      );

      const totalCost = softwareInCategory.reduce((sum, sw) => sum + sw.annual_cost, 0);
      const redundancyCost = totalCost * 0.3; // Estimate 30% redundancy

      overlaps.push({
        category,
        softwareList,
        overlapCount: softwareSet.size,
        redundancyCost,
        features: Array.from(categoryFeatures.get(category) || []),
      });
    }
  });

  return overlaps.sort((a, b) => b.redundancyCost - a.redundancyCost);
}

/**
 * Save comparison matrix to database
 */
async function saveComparisonMatrix(
  companyId: string,
  matrix: OverlapResult[]
): Promise<void> {
  // Clear existing matrix
  await sql`
    DELETE FROM feature_comparison_matrix WHERE company_id = ${companyId}
  `;

  // Insert new matrix
  for (const item of matrix) {
    await sql`
      INSERT INTO feature_comparison_matrix (
        company_id,
        software_id_1,
        software_id_2,
        overlap_percentage,
        shared_features_count,
        total_features_compared,
        shared_features,
        cost_implication
      ) VALUES (
        ${companyId},
        ${item.software1.id},
        ${item.software2.id},
        ${item.overlapPercentage},
        ${item.sharedFeatures.length},
        ${Math.max(item.sharedFeatures.length, 1)},
        ${JSON.stringify(item.sharedFeatures)},
        ${item.costImplication}
      )
      ON CONFLICT (company_id, software_id_1, software_id_2) DO UPDATE SET
        overlap_percentage = EXCLUDED.overlap_percentage,
        shared_features_count = EXCLUDED.shared_features_count,
        shared_features = EXCLUDED.shared_features,
        cost_implication = EXCLUDED.cost_implication
    `;
  }
}

/**
 * Save category overlaps to database
 */
async function saveCategoryOverlaps(
  companyId: string,
  overlaps: CategoryOverlap[]
): Promise<void> {
  // Clear existing overlaps
  await sql`
    DELETE FROM feature_overlaps WHERE company_id = ${companyId}
  `;

  // Insert new overlaps
  for (const overlap of overlaps) {
    const category = await sql`
      SELECT id FROM feature_categories WHERE category_name = ${overlap.category}
    `;

    if (category.length > 0) {
      await sql`
        INSERT INTO feature_overlaps (
          company_id,
          feature_category_id,
          software_ids,
          overlap_count,
          redundancy_cost,
          priority
        ) VALUES (
          ${companyId},
          ${category[0].id},
          ARRAY[]::UUID[],
          ${overlap.overlapCount},
          ${overlap.redundancyCost},
          ${overlap.redundancyCost > 50000 ? 'high' : overlap.redundancyCost > 20000 ? 'medium' : 'low'}
        )
      `;
    }
  }
}
