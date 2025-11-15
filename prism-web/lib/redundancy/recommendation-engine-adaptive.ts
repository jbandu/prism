/**
 * Adaptive Recommendation Engine
 * Automatically uses Ollama locally or falls back to simpler recommendations on Vercel
 */

import { neon } from '@neondatabase/serverless';
import type { SoftwareWithFeatures, OverlapResult } from './overlap-analyzer';

const sql = neon(process.env.DATABASE_URL!);

export interface ConsolidationRecommendation {
  id: string;
  software_to_keep: {
    id: string;
    software_name: string;
    vendor_name: string;
    annual_cost: number;
  };
  software_to_remove: Array<{
    id: string;
    software_name: string;
    vendor_name: string;
    annual_cost: number;
  }>;
  annual_savings: number;
  features_covered: string[];
  features_at_risk: string[];
  migration_effort: 'low' | 'medium' | 'high';
  business_risk: 'low' | 'medium' | 'high';
  recommendation_text: string;
  confidence_score: number;
}

// Detect if Ollama is available (local development)
async function isOllamaAvailable(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DISABLE_OLLAMA === 'true') {
    return false;
  }

  try {
    const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/tags';
    const response = await fetch(OLLAMA_API, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate recommendations using Ollama (local)
 */
async function generateWithOllama(
  overlap: OverlapResult,
  sw1: SoftwareWithFeatures,
  sw2: SoftwareWithFeatures
): Promise<ConsolidationRecommendation | null> {
  const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
  const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

  const prompt = `You are a SaaS consolidation expert. Analyze these two overlapping software products and recommend which one to keep.

Software 1: ${sw1.software_name} by ${sw1.vendor_name}
- Annual Cost: $${sw1.annual_cost.toFixed(0)}
- Features (${sw1.features.length}): ${sw1.features.slice(0, 10).map(f => f.feature_name).join(', ')}${sw1.features.length > 10 ? '...' : ''}

Software 2: ${sw2.software_name} by ${sw2.vendor_name}
- Annual Cost: $${sw2.annual_cost.toFixed(0)}
- Features (${sw2.features.length}): ${sw2.features.slice(0, 10).map(f => f.feature_name).join(', ')}${sw2.features.length > 10 ? '...' : ''}

Overlap: ${overlap.overlapPercentage.toFixed(1)}%
Shared Features: ${overlap.sharedFeatures.join(', ')}

Provide a recommendation in this JSON format:
{
  "keep_software": 1 or 2,
  "reasoning": "Brief explanation (2-3 sentences)",
  "features_covered": ["feature1", "feature2"],
  "features_at_risk": ["feature1", "feature2"],
  "migration_effort": "low" | "medium" | "high",
  "business_risk": "low" | "medium" | "high",
  "confidence_score": 0.0 to 1.0
}

Return ONLY valid JSON:`;

  try {
    const response = await fetch(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1024,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const result = await response.json();
    const responseText = result.response || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const aiRec = JSON.parse(jsonMatch[0]);
    const keeper = aiRec.keep_software === 1 ? sw1 : sw2;
    const removed = aiRec.keep_software === 1 ? sw2 : sw1;

    return {
      id: '',
      software_to_keep: {
        id: keeper.id,
        software_name: keeper.software_name,
        vendor_name: keeper.vendor_name,
        annual_cost: keeper.annual_cost,
      },
      software_to_remove: [{
        id: removed.id,
        software_name: removed.software_name,
        vendor_name: removed.vendor_name,
        annual_cost: removed.annual_cost,
      }],
      annual_savings: removed.annual_cost,
      features_covered: aiRec.features_covered || overlap.sharedFeatures,
      features_at_risk: aiRec.features_at_risk || [],
      migration_effort: aiRec.migration_effort || 'medium',
      business_risk: aiRec.business_risk || 'medium',
      recommendation_text: aiRec.reasoning,
      confidence_score: aiRec.confidence_score || 0.75,
    };
  } catch (error) {
    console.error('Ollama recommendation failed:', error);
    return null;
  }
}

/**
 * Generate recommendations using rule-based logic (fallback for Vercel)
 */
function generateRuleBased(
  overlap: OverlapResult,
  sw1: SoftwareWithFeatures,
  sw2: SoftwareWithFeatures
): ConsolidationRecommendation {
  // Simple rule: Keep the one with more features, or lower cost if features are equal
  let keeper: SoftwareWithFeatures;
  let removed: SoftwareWithFeatures;
  let reasoning: string;

  if (sw1.features.length > sw2.features.length) {
    keeper = sw1;
    removed = sw2;
    reasoning = `${keeper.software_name} has more comprehensive features (${keeper.features.length} vs ${removed.features.length}). Consolidating to the more feature-rich solution will reduce complexity.`;
  } else if (sw2.features.length > sw1.features.length) {
    keeper = sw2;
    removed = sw1;
    reasoning = `${keeper.software_name} has more comprehensive features (${keeper.features.length} vs ${removed.features.length}). Consolidating to the more feature-rich solution will reduce complexity.`;
  } else if (sw1.annual_cost < sw2.annual_cost) {
    keeper = sw1;
    removed = sw2;
    reasoning = `${keeper.software_name} is more cost-effective ($${keeper.annual_cost} vs $${removed.annual_cost}) with similar feature coverage.`;
  } else {
    keeper = sw2;
    removed = sw1;
    reasoning = `${keeper.software_name} is more cost-effective ($${keeper.annual_cost} vs $${removed.annual_cost}) with similar feature coverage.`;
  }

  return {
    id: '',
    software_to_keep: {
      id: keeper.id,
      software_name: keeper.software_name,
      vendor_name: keeper.vendor_name,
      annual_cost: keeper.annual_cost,
    },
    software_to_remove: [{
      id: removed.id,
      software_name: removed.software_name,
      vendor_name: removed.vendor_name,
      annual_cost: removed.annual_cost,
    }],
    annual_savings: removed.annual_cost,
    features_covered: overlap.sharedFeatures,
    features_at_risk: [],
    migration_effort: 'medium',
    business_risk: 'medium',
    recommendation_text: reasoning,
    confidence_score: 0.6, // Lower confidence for rule-based
  };
}

/**
 * Generate consolidation recommendations (adaptive)
 */
export async function generateConsolidationRecommendations(
  companyId: string,
  comparisonMatrix: OverlapResult[],
  softwareFeatures: Map<string, SoftwareWithFeatures>
): Promise<ConsolidationRecommendation[]> {
  const ollamaAvailable = await isOllamaAvailable();

  console.log(`\n🤖 Generating consolidation recommendations...`);
  console.log(`   Mode: ${ollamaAvailable ? 'Ollama (LOCAL GPU)' : 'Rule-based (Vercel)'}`);
  console.log(`   Cost: $0.00`);

  const recommendations: ConsolidationRecommendation[] = [];

  // Clear existing recommendations
  await sql`
    DELETE FROM consolidation_recommendations WHERE company_id = ${companyId}
  `;

  // Group overlaps by high redundancy (>60%)
  const highOverlaps = comparisonMatrix.filter(m => m.overlapPercentage > 60);
  console.log(`  📋 Found ${highOverlaps.length} high-overlap pairs to analyze`);

  for (const overlap of highOverlaps) {
    try {
      const sw1 = softwareFeatures.get(overlap.software1.id);
      const sw2 = softwareFeatures.get(overlap.software2.id);

      if (!sw1 || !sw2) continue;

      let recommendation: ConsolidationRecommendation | null = null;

      if (ollamaAvailable) {
        // Try Ollama first
        recommendation = await generateWithOllama(overlap, sw1, sw2);
      }

      // Fallback to rule-based if Ollama failed or not available
      if (!recommendation) {
        recommendation = generateRuleBased(overlap, sw1, sw2);
      }

      recommendations.push(recommendation);

      // Save to database
      await saveRecommendation(companyId, recommendation);

    } catch (error) {
      console.error(`Failed to generate recommendation:`, error);
    }
  }

  console.log(`  ✅ Generated ${recommendations.length} consolidation recommendations`);
  return recommendations;
}

/**
 * Save recommendation to database
 */
async function saveRecommendation(
  companyId: string,
  recommendation: ConsolidationRecommendation
): Promise<void> {
  const removeIds = recommendation.software_to_remove.map(s => s.id);

  const result = await sql`
    INSERT INTO consolidation_recommendations (
      company_id,
      software_to_keep_id,
      software_to_remove_ids,
      annual_savings,
      features_covered,
      features_at_risk,
      migration_effort,
      business_risk,
      recommendation_text,
      confidence_score
    ) VALUES (
      ${companyId},
      ${recommendation.software_to_keep.id},
      ${removeIds},
      ${recommendation.annual_savings},
      ${JSON.stringify(recommendation.features_covered)},
      ${JSON.stringify(recommendation.features_at_risk)},
      ${recommendation.migration_effort},
      ${recommendation.business_risk},
      ${recommendation.recommendation_text},
      ${recommendation.confidence_score}
    )
    RETURNING id
  `;

  recommendation.id = result[0].id;
}

/**
 * Get recommendations for a company
 */
export async function getRecommendations(
  companyId: string,
  status: string = 'pending'
): Promise<ConsolidationRecommendation[]> {
  const results = await sql`
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

  return results.map(r => ({
    id: r.id,
    software_to_keep: {
      id: r.software_to_keep_id,
      software_name: r.keep_name,
      vendor_name: r.keep_vendor,
      annual_cost: parseFloat(r.keep_cost),
    },
    software_to_remove: [],
    annual_savings: parseFloat(r.annual_savings),
    features_covered: r.features_covered,
    features_at_risk: r.features_at_risk,
    migration_effort: r.migration_effort,
    business_risk: r.business_risk,
    recommendation_text: r.recommendation_text,
    confidence_score: parseFloat(r.confidence_score),
  }));
}
