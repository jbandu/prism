/**
 * Portfolio Overlap Analysis Engine
 * Detects redundant features across a company's software portfolio
 */

import { neon } from '@neondatabase/serverless';
import { extractFeaturesFromSoftware, saveFeaturesToDatabase } from './feature-extractor';
import { generateConsolidationRecommendations } from './recommendation-engine-ollama'; // ✅ Using LOCAL GPU
import { ProgressTracker } from './progress-tracker';

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
export async function analyzePortfolioOverlaps(
  companyId: string,
  progressTracker?: ProgressTracker,
  selectedSoftwareIds?: string[]
): Promise<AnalysisResult> {
  console.log(`\n🔍 Starting portfolio overlap analysis for company ${companyId}...\n`);

  progressTracker?.updateProgress('Loading Software', 5, 'Loading software portfolio...');
  progressTracker?.addActivity('📦 Querying database for active software products', 'info');

  // Step 1: Get all software for this company (optionally filtered by selection)
  const companySoftware = selectedSoftwareIds && selectedSoftwareIds.length > 0
    ? await sql`
        SELECT
          id,
          software_name,
          vendor_name,
          total_annual_cost as annual_cost,
          category
        FROM software_assets
        WHERE company_id = ${companyId}
        AND contract_status = 'active'
        AND id = ANY(${selectedSoftwareIds})
      `
    : await sql`
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

  if (selectedSoftwareIds && selectedSoftwareIds.length > 0) {
    console.log(`📦 Found ${companySoftware.length} selected software products (filtered from ${selectedSoftwareIds.length} requested)`);
    progressTracker?.addActivity(`✅ Analyzing ${companySoftware.length} selected products`, 'success');
  } else {
    console.log(`📦 Found ${companySoftware.length} active software products`);
    progressTracker?.addActivity(`✅ Found ${companySoftware.length} active software products`, 'success');
  }

  if (companySoftware.length < 2) {
    console.log('⚠️  Need at least 2 software products for overlap analysis');
    progressTracker?.complete(0, 0);
    return {
      overlaps: [],
      comparisonMatrix: [],
      recommendations: [],
      totalRedundancyCost: 0,
      analysisDate: new Date(),
    };
  }

  progressTracker?.updateProgress(
    'Processing Software',
    10,
    `Analyzing ${companySoftware.length} software products...`,
    { totalSoftware: companySoftware.length }
  );
  progressTracker?.addActivity('📊 Loading feature tags for all software products', 'info');

  // Step 2: Build software features map (using category-based analysis for now)
  const softwareFeatures = new Map<string, SoftwareWithFeatures>();

  console.log(`\n📊 Processing software products...`);

  // Load features for all software
  const softwareIds = companySoftware.map(s => s.id);
  const featuresResult = await sql`
    SELECT
      software_id,
      feature_name,
      feature_category_id,
      fc.category_name
    FROM software_features_mapping sfm
    LEFT JOIN feature_categories fc ON fc.id = sfm.feature_category_id
    WHERE software_id = ANY(${softwareIds})
  `;

  progressTracker?.addActivity(`📋 Loaded ${featuresResult.length} feature mappings from database`, 'info');

  // Group features by software_id
  const featuresBySoftware = new Map<string, any[]>();
  for (const feature of featuresResult) {
    if (!featuresBySoftware.has(feature.software_id)) {
      featuresBySoftware.set(feature.software_id, []);
    }
    featuresBySoftware.get(feature.software_id)!.push({
      feature_name: feature.feature_name,
      category_name: feature.category_name || 'Uncategorized',
      description: feature.feature_name
    });
  }

  let softwareWithoutFeatures = 0;

  for (let idx = 0; idx < companySoftware.length; idx++) {
    const software = companySoftware[idx];

    // Check for cancellation
    if (progressTracker?.isCancelled()) {
      console.log('⚠️  Analysis cancelled by user');
      progressTracker.cancel();
      throw new Error('Analysis cancelled by user');
    }

    // Get actual features from database
    let features = featuresBySoftware.get(software.id) || [];

    // If no features tagged, fall back to category-based (legacy behavior)
    if (features.length === 0) {
      softwareWithoutFeatures++;
      features = [{
        feature_name: software.category,
        category_name: software.category,
        description: `${software.category} functionality`,
      }];
    }

    softwareFeatures.set(software.id, {
      id: software.id,
      software_name: software.software_name,
      vendor_name: software.vendor_name,
      annual_cost: parseFloat(software.annual_cost || 0),
      category: software.category,
      features: features,
    });

    // Update progress every few items
    if (idx % 5 === 0 || idx === companySoftware.length - 1) {
      const progress = 10 + ((idx + 1) / companySoftware.length) * 20;
      progressTracker?.updateProgress(
        'Processing Software',
        progress,
        `Processed ${idx + 1} of ${companySoftware.length} software products...`,
        { processedSoftware: idx + 1 }
      );
    }

    // Log individual software processing
    if (features.length > 0) {
      progressTracker?.addActivity(`✓ ${software.software_name}: ${features.length} features tagged`, 'info');
    }
  }

  if (softwareWithoutFeatures > 0) {
    console.log(`  ⚠️  ${softwareWithoutFeatures} software products have no tagged features (using category-based matching)`);
    console.log(`  💡 Tip: Use "Extract Features" or manually tag features for better accuracy`);
    progressTracker?.addActivity(`⚠️ ${softwareWithoutFeatures} products have no features (using category fallback)`, 'warning');
  }

  console.log(`  ✅ Processed ${softwareFeatures.size} software products`);
  progressTracker?.addActivity(`✅ Completed processing ${softwareFeatures.size} software products`, 'success');

  // Step 3: Compare all pairs and build comparison matrix
  const comparisonMatrix: OverlapResult[] = [];
  const softwareArray = Array.from(softwareFeatures.values());
  const totalComparisons = (softwareArray.length * (softwareArray.length - 1)) / 2;

  console.log(`\n🔬 Analyzing overlaps between ${softwareFeatures.size} products...`);
  progressTracker?.updateProgress('Analyzing Overlaps', 35, 'Comparing software for redundancies...');
  progressTracker?.addActivity(`🔬 Starting pairwise comparison (${totalComparisons} comparisons)`, 'info');
  let comparisonsCompleted = 0;

  for (let i = 0; i < softwareArray.length; i++) {
    // Check for cancellation
    if (progressTracker?.isCancelled()) {
      console.log('⚠️  Analysis cancelled by user');
      progressTracker.cancel();
      throw new Error('Analysis cancelled by user');
    }

    for (let j = i + 1; j < softwareArray.length; j++) {
      const sw1 = softwareArray[i];
      const sw2 = softwareArray[j];

      const sharedFeatures = findSharedFeatures(sw1.features, sw2.features);
      const totalFeatures = Math.max(sw1.features.length, sw2.features.length);
      const overlapPercentage = (sharedFeatures.length / totalFeatures) * 100;

      comparisonsCompleted++;

      // Update progress for comparisons
      if (comparisonsCompleted % 10 === 0 || comparisonsCompleted === totalComparisons) {
        const progress = 35 + (comparisonsCompleted / totalComparisons) * 40;
        progressTracker?.updateProgress(
          'Analyzing Overlaps',
          progress,
          `Compared ${comparisonsCompleted} of ${totalComparisons} software pairs...`
        );
      }

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

        const logMessage = `🔗 ${sw1.software_name} ↔ ${sw2.software_name}: ${overlapPercentage.toFixed(1)}% overlap ($${costImplication.toFixed(0)} redundancy)`;
        console.log(`  ${logMessage}`);
        progressTracker?.addActivity(logMessage, 'warning');
      }
    }
  }

  progressTracker?.updateProgress(
    'Categorizing Overlaps',
    80,
    'Grouping overlaps by category...',
    { overlapsFound: comparisonMatrix.length }
  );
  progressTracker?.addActivity(`📊 Found ${comparisonMatrix.length} significant overlaps`, 'success');

  // Step 4: Group overlaps by category
  const categoryOverlaps = await groupOverlapsByCategory(softwareFeatures, companyId);
  progressTracker?.addActivity(`📁 Grouped into ${categoryOverlaps.length} category overlaps`, 'info');

  progressTracker?.updateProgress('Saving Results', 85, 'Saving analysis results...');
  progressTracker?.addActivity('💾 Saving comparison matrix to database', 'info');

  // Step 5: Save results to database (optional - may fail if tables don't exist)
  try {
    await saveComparisonMatrix(companyId, comparisonMatrix);
    await saveCategoryOverlaps(companyId, categoryOverlaps);
    console.log(`  💾 Results saved to database`);
    progressTracker?.addActivity('✅ Results saved to database successfully', 'success');
  } catch (error) {
    console.log(`  ⚠️  Could not save to database (tables may not exist): ${error instanceof Error ? error.message : 'Unknown error'}`);
    progressTracker?.addActivity('⚠️ Database save skipped (tables may not exist)', 'warning');
    // Continue anyway - results can still be returned to client
  }

  progressTracker?.updateProgress('Generating Recommendations', 90, 'Creating consolidation recommendations...');
  progressTracker?.addActivity('🤖 Generating AI-powered consolidation recommendations', 'info');

  // Step 6: Generate consolidation recommendations
  console.log(`\n🎯 Generating consolidation recommendations...`);
  let recommendations: any[] = [];
  try {
    recommendations = await generateConsolidationRecommendations(
      companyId,
      comparisonMatrix,
      softwareFeatures
    );
    progressTracker?.addActivity(`💡 Generated ${recommendations.length} consolidation opportunities`, 'success');
  } catch (error) {
    console.log(`  ⚠️  Could not generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    progressTracker?.addActivity('⚠️ Recommendation generation failed', 'error');
    recommendations = [];
  }

  const totalRedundancyCost = comparisonMatrix.reduce((sum, m) => sum + m.costImplication, 0);

  console.log(`\n✅ Analysis complete!`);
  console.log(`   📊 Total redundancy cost: $${totalRedundancyCost.toFixed(0)}`);
  console.log(`   🔗 ${comparisonMatrix.length} significant overlaps detected`);
  console.log(`   💡 ${recommendations.length} consolidation opportunities identified\n`);

  // Prepare results object
  const results = {
    overlaps: categoryOverlaps,
    comparisonMatrix,
    recommendations,
    totalRedundancyCost,
    analysisDate: new Date(),
  };

  // Mark analysis as complete and store results
  progressTracker?.complete(comparisonMatrix.length, totalRedundancyCost, results);

  return results;
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
