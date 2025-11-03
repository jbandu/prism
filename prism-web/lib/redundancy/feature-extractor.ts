/**
 * AI-Powered Feature Extraction Engine
 * Extracts features from software products using Claude
 */

import Anthropic from '@anthropic-ai/sdk';
import { neon } from '@neondatabase/serverless';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sql = neon(process.env.DATABASE_URL!);

export interface ExtractedFeature {
  feature_name: string;
  category: string;
  description: string;
  is_core: boolean;
  requires_premium: boolean;
}

export interface ExtractedFeatures {
  softwareName: string;
  vendor: string;
  features: ExtractedFeature[];
  totalCount: number;
  extractionDate: Date;
  source: string;
  confidenceScore: number;
}

/**
 * Extract features from a software product using Claude AI
 */
export async function extractFeaturesFromSoftware(
  softwareName: string,
  vendor: string,
  description?: string
): Promise<ExtractedFeatures> {
  console.log(`🔍 Extracting features for ${softwareName} by ${vendor}...`);

  // Check cache first
  const cached = await checkFeatureCache(softwareName);
  if (cached) {
    console.log(`✅ Using cached features for ${softwareName}`);
    return cached;
  }

  const prompt = `You are a software feature extraction expert. Analyze this software product and extract ALL features it offers.

Software: ${softwareName}
Vendor: ${vendor}
${description ? `Description: ${description}` : ''}

Extract features in this JSON format:
{
  "core_features": [
    {
      "feature_name": "Task Management",
      "category": "Task Management",
      "description": "Create, assign, and track tasks with due dates and priorities",
      "is_core": true,
      "requires_premium": false
    }
  ],
  "total_count": 45
}

Available Categories (use EXACTLY these names):
- Task Management
- Calendar & Scheduling
- Communication
- Document Management
- Reporting & Analytics
- Collaboration
- Workflow Automation
- Time Tracking
- Resource Management
- Budget & Finance
- CRM Features
- Project Planning
- Integration Hub
- Mobile Access
- Security & Permissions
- Customization
- Data Import/Export
- Search & Filter
- Notifications
- Templates

Instructions:
1. Be comprehensive - include ALL features you know about this product
2. Use the exact category names from the list above
3. Mark is_core as false for add-ons or premium-only features
4. Mark requires_premium as true for features that need paid upgrades
5. Provide clear, concise descriptions
6. Return ONLY valid JSON, no additional text

Return the JSON now:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const extracted = JSON.parse(jsonMatch[0]);

    const result: ExtractedFeatures = {
      softwareName,
      vendor,
      features: extracted.core_features || [],
      totalCount: extracted.total_count || extracted.core_features?.length || 0,
      extractionDate: new Date(),
      source: 'ai_extraction',
      confidenceScore: 0.85,
    };

    console.log(`✅ Extracted ${result.totalCount} features for ${softwareName}`);

    // Cache the results
    await cacheFeatureExtraction(result);

    return result;
  } catch (error) {
    console.error(`❌ Feature extraction failed for ${softwareName}:`, error);
    throw error;
  }
}

/**
 * Check if features are already cached
 */
async function checkFeatureCache(softwareName: string): Promise<ExtractedFeatures | null> {
  try {
    const cached = await sql`
      SELECT software_name, extracted_features, feature_count, analysis_date, source, confidence_score
      FROM feature_analysis_cache
      WHERE software_name = ${softwareName}
      AND analysis_date > NOW() - INTERVAL '30 days'
      LIMIT 1
    `;

    if (cached.length > 0) {
      const row = cached[0];
      return {
        softwareName: row.software_name,
        vendor: '', // Not stored in cache
        features: row.extracted_features as ExtractedFeature[],
        totalCount: row.feature_count,
        extractionDate: new Date(row.analysis_date),
        source: row.source,
        confidenceScore: parseFloat(row.confidence_score),
      };
    }

    return null;
  } catch (error) {
    console.error('Cache check failed:', error);
    return null;
  }
}

/**
 * Cache feature extraction results
 */
async function cacheFeatureExtraction(extracted: ExtractedFeatures): Promise<void> {
  try {
    await sql`
      INSERT INTO feature_analysis_cache (
        software_name,
        extracted_features,
        feature_count,
        source,
        confidence_score
      ) VALUES (
        ${extracted.softwareName},
        ${JSON.stringify(extracted.features)},
        ${extracted.totalCount},
        ${extracted.source},
        ${extracted.confidenceScore}
      )
      ON CONFLICT (software_name) DO UPDATE SET
        extracted_features = EXCLUDED.extracted_features,
        feature_count = EXCLUDED.feature_count,
        analysis_date = NOW(),
        confidence_score = EXCLUDED.confidence_score
    `;
  } catch (error) {
    console.error('Failed to cache feature extraction:', error);
  }
}

/**
 * Save extracted features to the database
 */
export async function saveFeaturesToDatabase(extracted: ExtractedFeatures): Promise<string> {
  console.log(`💾 Saving features for ${extracted.softwareName} to database...`);

  try {
    // Get or create software in catalog
    let software = await sql`
      SELECT id FROM software_catalog WHERE software_name = ${extracted.softwareName}
    `;

    let softwareId: string;

    if (software.length === 0) {
      // Create new entry
      const newSoftware = await sql`
        INSERT INTO software_catalog (software_name, vendor_name, total_features_count)
        VALUES (${extracted.softwareName}, ${extracted.vendor}, ${extracted.totalCount})
        RETURNING id
      `;
      softwareId = newSoftware[0].id;
    } else {
      softwareId = software[0].id;

      // Update feature count
      await sql`
        UPDATE software_catalog
        SET total_features_count = ${extracted.totalCount},
            last_updated = NOW()
        WHERE id = ${softwareId}
      `;
    }

    // Insert features
    for (const feature of extracted.features) {
      // Get category ID
      const category = await sql`
        SELECT id FROM feature_categories WHERE category_name = ${feature.category}
      `;

      if (category.length > 0) {
        await sql`
          INSERT INTO software_features (
            software_catalog_id,
            feature_category_id,
            feature_name,
            feature_description,
            is_core_feature,
            requires_premium
          ) VALUES (
            ${softwareId},
            ${category[0].id},
            ${feature.feature_name},
            ${feature.description},
            ${feature.is_core},
            ${feature.requires_premium}
          )
          ON CONFLICT (software_catalog_id, feature_name) DO UPDATE SET
            feature_description = EXCLUDED.feature_description,
            is_core_feature = EXCLUDED.is_core_feature,
            requires_premium = EXCLUDED.requires_premium
        `;
      } else {
        console.warn(`Category not found: ${feature.category}`);
      }
    }

    console.log(`✅ Saved ${extracted.features.length} features for ${extracted.softwareName}`);
    return softwareId;
  } catch (error) {
    console.error(`❌ Failed to save features for ${extracted.softwareName}:`, error);
    throw error;
  }
}

/**
 * Batch extract features for multiple software products
 */
export async function batchExtractFeatures(
  softwareList: Array<{ name: string; vendor: string; description?: string }>
): Promise<ExtractedFeatures[]> {
  console.log(`🚀 Batch extracting features for ${softwareList.length} products...`);

  const results: ExtractedFeatures[] = [];

  for (const software of softwareList) {
    try {
      const extracted = await extractFeaturesFromSoftware(
        software.name,
        software.vendor,
        software.description
      );
      await saveFeaturesToDatabase(extracted);
      results.push(extracted);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to extract features for ${software.name}:`, error);
    }
  }

  console.log(`✅ Batch extraction complete: ${results.length}/${softwareList.length} successful`);
  return results;
}
