/**
 * Vendor Risk Analysis System
 * Analyzes vendor health, acquisition risk, pricing volatility, and market position
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface VendorRiskAnalysis {
  vendor_name: string;
  overall_risk_score: number; // 0-100 (higher = riskier)
  risk_level: 'low' | 'medium' | 'high' | 'critical';

  risk_factors: {
    financial_health: {
      score: number;
      rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      indicators: string[];
    };
    acquisition_risk: {
      score: number;
      likelihood: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
      potential_acquirers: string[];
      impact_if_acquired: string;
    };
    market_position: {
      score: number;
      position: 'leader' | 'challenger' | 'follower' | 'niche';
      market_share_trend: 'growing' | 'stable' | 'declining';
      competitors: string[];
    };
    pricing_volatility: {
      score: number;
      trend: 'stable' | 'increasing' | 'decreasing' | 'volatile';
      recent_changes: string[];
    };
    support_quality: {
      score: number;
      rating: 'excellent' | 'good' | 'average' | 'poor';
      indicators: string[];
    };
    security_track_record: {
      score: number;
      rating: 'excellent' | 'good' | 'fair' | 'poor';
      recent_incidents: string[];
    };
  };

  recommendations: string[];
  mitigation_strategies: string[];
  monitoring_priorities: string[];

  last_analyzed: string;
}

export async function analyzeVendorRisk(
  vendorName: string,
  softwareName: string,
  companyContext?: string
): Promise<VendorRiskAnalysis> {
  const prompt = `Analyze the vendor risk for this software vendor:

**Vendor:** ${vendorName}
**Software:** ${softwareName}
**Company Context:** ${companyContext || 'Enterprise SaaS'}

Perform a comprehensive vendor risk analysis covering:

1. **Financial Health** - Public financial data, funding rounds, profitability
2. **Acquisition Risk** - Likelihood of being acquired and impact
3. **Market Position** - Market share, competitive position, trends
4. **Pricing Volatility** - Historical pricing changes, predictability
5. **Support Quality** - Customer satisfaction, response times, reliability
6. **Security Track Record** - Breaches, compliance, certifications

Provide analysis in this JSON format:
{
  "vendor_name": "${vendorName}",
  "overall_risk_score": number (0-100, higher = riskier),
  "risk_level": "low" | "medium" | "high" | "critical",
  "risk_factors": {
    "financial_health": {
      "score": number (0-100),
      "rating": "excellent" | "good" | "fair" | "poor" | "critical",
      "indicators": ["array of specific indicators"]
    },
    "acquisition_risk": {
      "score": number (0-100),
      "likelihood": "very_low" | "low" | "moderate" | "high" | "very_high",
      "potential_acquirers": ["array of potential acquirers"],
      "impact_if_acquired": "description of impact"
    },
    "market_position": {
      "score": number (0-100),
      "position": "leader" | "challenger" | "follower" | "niche",
      "market_share_trend": "growing" | "stable" | "declining",
      "competitors": ["array of main competitors"]
    },
    "pricing_volatility": {
      "score": number (0-100),
      "trend": "stable" | "increasing" | "decreasing" | "volatile",
      "recent_changes": ["array of recent pricing changes"]
    },
    "support_quality": {
      "score": number (0-100),
      "rating": "excellent" | "good" | "average" | "poor",
      "indicators": ["array of quality indicators"]
    },
    "security_track_record": {
      "score": number (0-100),
      "rating": "excellent" | "good" | "fair" | "poor",
      "recent_incidents": ["array of security incidents"]
    }
  },
  "recommendations": ["array of specific recommendations"],
  "mitigation_strategies": ["array of risk mitigation strategies"],
  "monitoring_priorities": ["array of things to monitor"],
  "last_analyzed": "ISO 8601 timestamp"
}

Base your analysis on publicly available information about the vendor.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse vendor risk analysis');
    }

    const analysis: VendorRiskAnalysis = JSON.parse(jsonMatch[0]);
    analysis.last_analyzed = new Date().toISOString();

    return analysis;
  } catch (error) {
    console.error('Vendor risk analysis error:', error);
    throw error;
  }
}

export function calculatePortfolioRisk(vendorRisks: VendorRiskAnalysis[]): {
  average_risk_score: number;
  high_risk_vendors: number;
  total_vendors: number;
  risk_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  top_risks: Array<{
    vendor: string;
    score: number;
    level: string;
  }>;
} {
  const totalScore = vendorRisks.reduce((sum, v) => sum + v.overall_risk_score, 0);
  const avgScore = vendorRisks.length > 0 ? totalScore / vendorRisks.length : 0;

  const distribution = {
    critical: vendorRisks.filter(v => v.risk_level === 'critical').length,
    high: vendorRisks.filter(v => v.risk_level === 'high').length,
    medium: vendorRisks.filter(v => v.risk_level === 'medium').length,
    low: vendorRisks.filter(v => v.risk_level === 'low').length,
  };

  const topRisks = vendorRisks
    .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
    .slice(0, 5)
    .map(v => ({
      vendor: v.vendor_name,
      score: v.overall_risk_score,
      level: v.risk_level,
    }));

  return {
    average_risk_score: Math.round(avgScore),
    high_risk_vendors: distribution.critical + distribution.high,
    total_vendors: vendorRisks.length,
    risk_distribution: distribution,
    top_risks: topRisks,
  };
}
