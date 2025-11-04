import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface SoftwareForMatching {
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: number;
  license_count: number;
  active_users: number;
  features?: string[];
  use_cases?: string[];
}

export interface AlternativeMatch {
  alternative_software_name: string;
  alternative_vendor_name: string;
  alternative_category: string;

  // Feature Match Analysis
  feature_match_score: number;
  shared_features: string[];
  unique_features_original: string[];
  unique_features_alternative: string[];
  missing_critical_features: string[];

  // Pricing Comparison
  pricing_model: string;
  estimated_cost_difference_percentage: number;
  cost_comparison_details: {
    estimated_annual_cost: number;
    pricing_structure: string;
    free_tier_available: boolean;
  };

  // Migration Analysis
  migration_difficulty: 'easy' | 'moderate' | 'complex' | 'very_complex';
  migration_time_estimate: string;
  migration_cost_estimate: number;
  data_migration_complexity: string;
  integration_challenges: string[];

  // Market Intelligence
  market_position: string;
  user_rating: number;
  total_users: number;
  company_size_fit: string;

  // AI Analysis
  recommendation_confidence: 'high' | 'medium' | 'low';
  ai_summary: string;
  pros: string[];
  cons: string[];
}

/**
 * Find software alternatives using AI + market data
 */
export async function findAlternatives(
  software: SoftwareForMatching,
  maxResults: number = 5
): Promise<AlternativeMatch[]> {
  try {
    // Use GPT-4o-mini for fast, cost-effective analysis
    const prompt = buildAlternativesPrompt(software);

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a SaaS procurement expert who helps companies find better software alternatives.
Analyze the provided software and recommend ${maxResults} viable alternatives.
Consider: features, pricing, migration complexity, market position, and ROI potential.
Return valid JSON only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    if (!result.alternatives || !Array.isArray(result.alternatives)) {
      console.warn('AI returned invalid format, using fallback');
      return getFallbackAlternatives(software, maxResults);
    }

    // Enrich AI results with calculated fields
    return result.alternatives.map((alt: any) => enrichAlternative(alt, software));

  } catch (error) {
    console.error('AI alternatives matching failed:', error);
    return getFallbackAlternatives(software, maxResults);
  }
}

/**
 * Build AI prompt for alternatives discovery
 */
function buildAlternativesPrompt(software: SoftwareForMatching): string {
  return `
Find ${5} alternative software products for:

**Current Software:**
- Name: ${software.software_name}
- Vendor: ${software.vendor_name}
- Category: ${software.category}
- Current Annual Cost: $${software.annual_cost.toLocaleString()}
- License Count: ${software.license_count}
- Active Users: ${software.active_users}

**Your Task:**
For each alternative, provide:

1. **Basic Info**: Name, vendor, category
2. **Feature Match Score** (0-100): How well features align
3. **Shared Features**: List of common features
4. **Unique Features (Original)**: Features only in ${software.software_name}
5. **Unique Features (Alternative)**: Features only in the alternative
6. **Missing Critical Features**: Must-have features the alternative lacks
7. **Pricing Model**: Subscription type, pricing structure
8. **Estimated Cost Difference %**: +/- percentage vs current cost
9. **Cost Details**: Estimated annual cost, free tier availability
10. **Migration Difficulty**: easy/moderate/complex/very_complex
11. **Migration Time Estimate**: e.g., "2-4 weeks", "3-6 months"
12. **Migration Cost Estimate**: Dollar amount for migration
13. **Data Migration Complexity**: Level of data transfer difficulty
14. **Integration Challenges**: List of potential integration issues
15. **Market Position**: Market leader/challenger/niche/emerging
16. **User Rating**: 0-5 stars
17. **Total Users**: Approximate user base
18. **Company Size Fit**: startup/SMB/mid-market/enterprise
19. **Recommendation Confidence**: high/medium/low
20. **AI Summary**: 2-3 sentence recommendation
21. **Pros**: 3-5 key advantages
22. **Cons**: 3-5 key disadvantages

Return as JSON:
{
  "alternatives": [
    {
      "alternative_software_name": "...",
      "alternative_vendor_name": "...",
      "alternative_category": "...",
      "feature_match_score": 85,
      "shared_features": ["...", "..."],
      "unique_features_original": ["...", "..."],
      "unique_features_alternative": ["...", "..."],
      "missing_critical_features": ["...", "..."],
      "pricing_model": "...",
      "estimated_cost_difference_percentage": -20,
      "cost_comparison_details": {
        "estimated_annual_cost": 12000,
        "pricing_structure": "per user/month",
        "free_tier_available": true
      },
      "migration_difficulty": "moderate",
      "migration_time_estimate": "4-6 weeks",
      "migration_cost_estimate": 5000,
      "data_migration_complexity": "moderate",
      "integration_challenges": ["...", "..."],
      "market_position": "market leader",
      "user_rating": 4.5,
      "total_users": 50000,
      "company_size_fit": "SMB to mid-market",
      "recommendation_confidence": "high",
      "ai_summary": "...",
      "pros": ["...", "...", "..."],
      "cons": ["...", "...", "..."]
    }
  ]
}
`;
}

/**
 * Enrich AI alternative with calculated fields
 */
function enrichAlternative(alt: any, original: SoftwareForMatching): AlternativeMatch {
  // Calculate migration cost based on complexity
  const migrationCostMultipliers = {
    easy: 0.05,
    moderate: 0.15,
    complex: 0.30,
    very_complex: 0.50
  };

  const baseMigrationCost = original.annual_cost *
    (migrationCostMultipliers[alt.migration_difficulty as keyof typeof migrationCostMultipliers] || 0.15);

  return {
    ...alt,
    migration_cost_estimate: alt.migration_cost_estimate || Math.round(baseMigrationCost),
    // Ensure all required fields exist
    shared_features: alt.shared_features || [],
    unique_features_original: alt.unique_features_original || [],
    unique_features_alternative: alt.unique_features_alternative || [],
    missing_critical_features: alt.missing_critical_features || [],
    integration_challenges: alt.integration_challenges || [],
    pros: alt.pros || [],
    cons: alt.cons || [],
  };
}

/**
 * Fallback alternatives when AI fails
 */
function getFallbackAlternatives(
  software: SoftwareForMatching,
  maxResults: number
): AlternativeMatch[] {
  // Category-based fallback mappings
  const categoryAlternatives: Record<string, Array<{name: string, vendor: string}>> = {
    'CRM': [
      { name: 'HubSpot CRM', vendor: 'HubSpot' },
      { name: 'Pipedrive', vendor: 'Pipedrive' },
      { name: 'Zoho CRM', vendor: 'Zoho' },
      { name: 'Freshsales', vendor: 'Freshworks' },
    ],
    'Communication': [
      { name: 'Microsoft Teams', vendor: 'Microsoft' },
      { name: 'Slack', vendor: 'Salesforce' },
      { name: 'Discord', vendor: 'Discord Inc.' },
      { name: 'Zoom', vendor: 'Zoom Video Communications' },
    ],
    'Project Management': [
      { name: 'Asana', vendor: 'Asana' },
      { name: 'Monday.com', vendor: 'monday.com' },
      { name: 'ClickUp', vendor: 'ClickUp' },
      { name: 'Jira', vendor: 'Atlassian' },
    ],
    'Productivity': [
      { name: 'Notion', vendor: 'Notion Labs' },
      { name: 'Airtable', vendor: 'Airtable' },
      { name: 'Coda', vendor: 'Coda' },
      { name: 'ClickUp', vendor: 'ClickUp' },
    ],
    'Marketing': [
      { name: 'Mailchimp', vendor: 'Intuit' },
      { name: 'ActiveCampaign', vendor: 'ActiveCampaign' },
      { name: 'ConvertKit', vendor: 'ConvertKit' },
      { name: 'Sendinblue', vendor: 'Brevo' },
    ],
  };

  const alternatives = categoryAlternatives[software.category] || [
    { name: 'Alternative A', vendor: 'Vendor A' },
    { name: 'Alternative B', vendor: 'Vendor B' },
  ];

  return alternatives.slice(0, maxResults).map((alt, idx) => ({
    alternative_software_name: alt.name,
    alternative_vendor_name: alt.vendor,
    alternative_category: software.category,

    feature_match_score: 75 - (idx * 5),
    shared_features: ['Core functionality', 'Cloud-based', 'Mobile apps', 'API access'],
    unique_features_original: ['Enterprise SSO', 'Advanced analytics'],
    unique_features_alternative: ['Better UI', 'Lower price point'],
    missing_critical_features: [],

    pricing_model: 'Per user/month subscription',
    estimated_cost_difference_percentage: -15 - (idx * 5),
    cost_comparison_details: {
      estimated_annual_cost: Math.round(software.annual_cost * (0.85 - idx * 0.05)),
      pricing_structure: 'Per user/month',
      free_tier_available: idx < 2,
    },

    migration_difficulty: idx === 0 ? 'easy' : idx === 1 ? 'moderate' : 'complex',
    migration_time_estimate: idx === 0 ? '2-4 weeks' : idx === 1 ? '1-2 months' : '3-4 months',
    migration_cost_estimate: Math.round(software.annual_cost * (0.1 + idx * 0.05)),
    data_migration_complexity: idx === 0 ? 'Low' : 'Moderate',
    integration_challenges: ['API migration required', 'User training needed'],

    market_position: idx === 0 ? 'Market leader' : 'Strong challenger',
    user_rating: 4.5 - (idx * 0.2),
    total_users: 100000 - (idx * 20000),
    company_size_fit: 'SMB to Enterprise',

    recommendation_confidence: idx === 0 ? 'high' : 'medium',
    ai_summary: `${alt.name} offers similar functionality with potentially lower costs and modern interface.`,
    pros: [
      'Lower pricing',
      'Modern user interface',
      'Strong customer support',
      'Active development'
    ],
    cons: [
      'Smaller user base',
      'Fewer integrations',
      'Learning curve for team'
    ],
  }));
}

/**
 * Calculate ROI for switching to an alternative
 */
export interface ROIAnalysis {
  // Costs
  current_annual_cost: number;
  projected_annual_cost: number;
  migration_cost: number;
  training_cost: number;
  integration_cost: number;
  productivity_loss_cost: number;
  total_hidden_costs: number;

  // Savings
  annual_savings: number;
  three_year_savings: number;

  // ROI Metrics
  break_even_months: number;
  roi_percentage: number;
  total_cost_of_ownership_3yr: number;

  // Risk Assessment
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  mitigation_strategies: string[];
}

export function calculateAlternativeROI(
  currentCost: number,
  alternative: AlternativeMatch,
  licenseCount: number
): ROIAnalysis {
  // Calculate projected cost
  const projectedAnnualCost = alternative.cost_comparison_details.estimated_annual_cost;

  // Calculate hidden costs
  const trainingCost = licenseCount * 100; // $100 per user training
  const integrationCost = alternative.migration_difficulty === 'easy' ? 2000 :
                         alternative.migration_difficulty === 'moderate' ? 5000 :
                         alternative.migration_difficulty === 'complex' ? 10000 : 20000;
  const productivityLossCost = currentCost * 0.05; // 5% productivity hit during migration
  const totalHiddenCosts = alternative.migration_cost_estimate + trainingCost + integrationCost + productivityLossCost;

  // Calculate savings
  const annualSavings = currentCost - projectedAnnualCost;
  const threeYearSavings = (annualSavings * 3) - totalHiddenCosts;

  // Calculate ROI metrics
  const breakEvenMonths = totalHiddenCosts / (annualSavings / 12);
  const roiPercentage = (threeYearSavings / (currentCost * 3)) * 100;
  const totalCostOfOwnership3yr = (projectedAnnualCost * 3) + totalHiddenCosts;

  // Assess risk level
  const riskFactors: string[] = [];
  let riskScore = 0;

  if (alternative.migration_difficulty === 'complex' || alternative.migration_difficulty === 'very_complex') {
    riskFactors.push('High migration complexity');
    riskScore += 2;
  }

  if (alternative.feature_match_score < 80) {
    riskFactors.push('Feature gaps exist');
    riskScore += 1;
  }

  if (alternative.missing_critical_features.length > 0) {
    riskFactors.push(`Missing ${alternative.missing_critical_features.length} critical features`);
    riskScore += 2;
  }

  if (alternative.user_rating < 4.0) {
    riskFactors.push('Below average user ratings');
    riskScore += 1;
  }

  if (breakEvenMonths > 24) {
    riskFactors.push('Long break-even period');
    riskScore += 1;
  }

  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    riskScore === 0 ? 'low' :
    riskScore <= 2 ? 'medium' :
    riskScore <= 4 ? 'high' : 'critical';

  // Mitigation strategies
  const mitigationStrategies: string[] = [];

  if (alternative.migration_difficulty !== 'easy') {
    mitigationStrategies.push('Engage professional migration services');
    mitigationStrategies.push('Run pilot program with small team first');
  }

  if (alternative.missing_critical_features.length > 0) {
    mitigationStrategies.push('Verify workarounds for missing features');
    mitigationStrategies.push('Request roadmap commitment from vendor');
  }

  if (riskScore > 3) {
    mitigationStrategies.push('Consider phased migration approach');
    mitigationStrategies.push('Negotiate extended trial period');
  }

  return {
    current_annual_cost: currentCost,
    projected_annual_cost: projectedAnnualCost,
    migration_cost: alternative.migration_cost_estimate,
    training_cost: trainingCost,
    integration_cost: integrationCost,
    productivity_loss_cost: productivityLossCost,
    total_hidden_costs: totalHiddenCosts,

    annual_savings: annualSavings,
    three_year_savings: threeYearSavings,

    break_even_months: Math.round(breakEvenMonths),
    roi_percentage: Math.round(roiPercentage),
    total_cost_of_ownership_3yr: totalCostOfOwnership3yr,

    risk_level: riskLevel,
    risk_factors: riskFactors,
    mitigation_strategies: mitigationStrategies,
  };
}
