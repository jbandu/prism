/**
 * AI-Powered Consolidation Recommendation Engine (LOCAL OLLAMA VERSION)
 * Generates smart recommendations for software consolidation using local GPU
 * Cost: $0 per recommendation (vs $0.01+ with Claude API)
 */

import { neon } from '@neondatabase/serverless';
import type { SoftwareWithFeatures, OverlapResult } from './overlap-analyzer';

const sql = neon(process.env.DATABASE_URL!);

// Ollama API configuration
const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

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
  llm_provider: string; // NEW: Track which LLM generated this
}

/**
 * Call local Ollama API for recommendation generation
 */
async function callOllama(prompt: string): Promise<string> {
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
  return result.response || '';
}

/**
 * Generate consolidation recommendations using Local Ollama
 */
export async function generateConsolidationRecommendations(
  companyId: string,
  comparisonMatrix: OverlapResult[],
  softwareFeatures: Map<string, SoftwareWithFeatures>
): Promise<ConsolidationRecommendation[]> {
  console.log(`\n🤖 Generating LOCAL GPU consolidation recommendations...`);
  console.log(`   Using: ${OLLAMA_MODEL} on Ollama`);
  console.log(`   Cost: $0.00 (local inference)`);

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
      const recommendation = await generateRecommendationForPair(
        overlap,
        softwareFeatures
      );

      if (recommendation) {
        recommendations.push(recommendation);

        // Save to database
        await saveRecommendation(companyId, recommendation);
      }
    } catch (error) {
      console.error(`Failed to generate recommendation:`, error);
    }
  }

  console.log(`  ✅ Generated ${recommendations.length} consolidation recommendations`);
  console.log(`  💰 Total cost: $0.00 (local GPU)`);

  return recommendations;
}

/**
 * Generate a consolidation recommendation for a pair of overlapping software
 */
async function generateRecommendationForPair(
  overlap: OverlapResult,
  softwareFeatures: Map<string, SoftwareWithFeatures>
): Promise<ConsolidationRecommendation | null> {
  const sw1 = softwareFeatures.get(overlap.software1.id);
  const sw2 = softwareFeatures.get(overlap.software2.id);

  if (!sw1 || !sw2) return null;

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
  "reasoning": "Brief explanation of why to keep this one (2-3 sentences)",
  "features_covered": ["feature1", "feature2"],
  "features_at_risk": ["feature1", "feature2"],
  "migration_effort": "low" | "medium" | "high",
  "business_risk": "low" | "medium" | "high",
  "confidence_score": 0.0 to 1.0
}

Consider:
- Which has more comprehensive features
- Cost-effectiveness
- Market position and reliability
- Integration capabilities
- Migration complexity

Return ONLY valid JSON:`;

  try {
    const responseText = await callOllama(prompt);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('No valid JSON in Ollama recommendation response');
      return null;
    }

    const aiRec = JSON.parse(jsonMatch[0]);

    const keeper = aiRec.keep_software === 1 ? sw1 : sw2;
    const removed = aiRec.keep_software === 1 ? sw2 : sw1;

    const annualSavings = removed.annual_cost;

    const recommendation: ConsolidationRecommendation = {
      id: '', // Will be set when saved
      software_to_keep: {
        id: keeper.id,
        software_name: keeper.software_name,
        vendor_name: keeper.vendor_name,
        annual_cost: keeper.annual_cost,
      },
      software_to_remove: [
        {
          id: removed.id,
          software_name: removed.software_name,
          vendor_name: removed.vendor_name,
          annual_cost: removed.annual_cost,
        },
      ],
      annual_savings: annualSavings,
      features_covered: aiRec.features_covered || overlap.sharedFeatures,
      features_at_risk: aiRec.features_at_risk || [],
      migration_effort: aiRec.migration_effort || 'medium',
      business_risk: aiRec.business_risk || 'medium',
      recommendation_text: aiRec.reasoning,
      confidence_score: aiRec.confidence_score || 0.75,
      llm_provider: `ollama/${OLLAMA_MODEL}`, // Track which LLM was used
    };

    return recommendation;
  } catch (error) {
    console.error('Ollama recommendation generation failed:', error);
    console.error('   Make sure Ollama is running: ollama serve');
    return null;
  }
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
    software_to_remove: [], // Would need to join to get full details
    annual_savings: parseFloat(r.annual_savings),
    features_covered: r.features_covered,
    features_at_risk: r.features_at_risk,
    migration_effort: r.migration_effort,
    business_risk: r.business_risk,
    recommendation_text: r.recommendation_text,
    confidence_score: parseFloat(r.confidence_score),
    llm_provider: `ollama/${OLLAMA_MODEL}`,
  }));
}

/**
 * Get LLM provider info for display
 */
export function getLLMInfo() {
  return {
    provider: 'Ollama (Local GPU)',
    model: OLLAMA_MODEL,
    cost: '$0.00',
    location: 'Local',
  };
}
