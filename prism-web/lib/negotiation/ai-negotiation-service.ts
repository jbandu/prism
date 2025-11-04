/**
 * AI Negotiation Service
 * Generates intelligent negotiation strategies using AI analysis
 */

export interface SoftwareNegotiationData {
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: number;
  license_count: number;
  active_users: number;
  utilization_rate: number;
  contract_start_date: string;
  renewal_date: string;
  contract_length_years: number;
  total_spent_to_date: number;
  payment_history: 'excellent' | 'good' | 'fair';
}

export interface NegotiationPlaybook {
  // Market Intelligence
  market_average_price: number;
  market_discount_range_min: number;
  market_discount_range_max: number;
  competitor_alternatives: Array<{
    name: string;
    price_comparison: string;
    features_comparison: string;
  }>;
  pricing_trends: string;

  // Your Leverage Points
  utilization_rate: number;
  unused_licenses: number;
  contract_length_years: number;
  total_spent_to_date: number;
  payment_history_score: number;

  // Negotiation Strategy
  recommended_target_discount: number;
  confidence_level: 'high' | 'medium' | 'low';
  leverage_points: string[];
  risks: string[];
  talking_points: string[];

  // Email Templates
  email_initial_outreach: string;
  email_counter_offer: string;
  email_final_push: string;
  email_alternative_threat: string;
}

/**
 * Generate negotiation playbook using AI analysis
 */
export async function generateNegotiationPlaybook(
  data: SoftwareNegotiationData
): Promise<NegotiationPlaybook> {

  const unused_licenses = data.license_count - data.active_users;
  const waste_cost = (unused_licenses / data.license_count) * data.annual_cost;

  // Calculate leverage score (0-100)
  const utilizationScore = data.utilization_rate;
  const loyaltyScore = Math.min(data.contract_length_years * 15, 30);
  const paymentScore = data.payment_history === 'excellent' ? 30 : data.payment_history === 'good' ? 20 : 10;
  const leverageScore = utilizationScore * 0.4 + loyaltyScore + paymentScore;

  // AI Prompt for OpenAI
  const prompt = `You are a SaaS procurement expert helping negotiate better software contracts.

SOFTWARE DETAILS:
- Product: ${data.software_name} by ${data.vendor_name}
- Category: ${data.category}
- Current Cost: $${data.annual_cost.toLocaleString()}/year
- Licenses: ${data.license_count} total, ${data.active_users} active (${data.utilization_rate}% utilization)
- Contract: ${data.contract_length_years} years, renewing on ${data.renewal_date}
- Relationship: ${data.total_spent_to_date > 0 ? `$${data.total_spent_to_date.toLocaleString()} spent over ${data.contract_length_years} years` : 'New customer'}
- Payment History: ${data.payment_history}

YOUR LEVERAGE:
- ${unused_licenses} unused licenses ($${waste_cost.toLocaleString()} wasted annually)
- ${data.contract_length_years} year${data.contract_length_years > 1 ? 's' : ''} of loyalty
- ${data.payment_history} payment track record
- Leverage Score: ${leverageScore.toFixed(0)}/100

TASK: Generate a negotiation strategy with:
1. Market intelligence (typical pricing, discounts in this category)
2. Top 3 competitor alternatives with pricing
3. Realistic target discount percentage
4. 5 specific leverage points to use
5. 3 potential risks/objections from vendor
6. 5 tactical talking points
7. Four email templates (initial, counter-offer, final push, alternative threat)

Format as JSON with this structure:
{
  "market_average_price": number,
  "market_discount_range_min": number,
  "market_discount_range_max": number,
  "competitor_alternatives": [{"name": "", "price_comparison": "", "features_comparison": ""}],
  "pricing_trends": "",
  "recommended_target_discount": number,
  "confidence_level": "high|medium|low",
  "leverage_points": [""],
  "risks": [""],
  "talking_points": [""],
  "email_initial_outreach": "",
  "email_counter_offer": "",
  "email_final_push": "",
  "email_alternative_threat": ""
}`;

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️  OpenAI API key not configured, using fallback strategy');
      return generateFallbackPlaybook(data, unused_licenses, waste_cost, leverageScore);
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a SaaS procurement expert specializing in contract negotiations. Provide data-driven, actionable negotiation strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const playbook = JSON.parse(result.choices[0].message.content);

    // Add calculated fields
    return {
      ...playbook,
      utilization_rate: data.utilization_rate,
      unused_licenses,
      contract_length_years: data.contract_length_years,
      total_spent_to_date: data.total_spent_to_date,
      payment_history_score: paymentScore
    };

  } catch (error) {
    console.error('Error generating AI playbook:', error);
    // Fallback to rule-based playbook
    return generateFallbackPlaybook(data, unused_licenses, waste_cost, leverageScore);
  }
}

/**
 * Fallback playbook generator (rule-based, no AI required)
 */
function generateFallbackPlaybook(
  data: SoftwareNegotiationData,
  unused_licenses: number,
  waste_cost: number,
  leverageScore: number
): NegotiationPlaybook {

  // Determine target discount based on leverage
  const targetDiscount = leverageScore > 70 ? 25 : leverageScore > 50 ? 15 : 10;
  const confidenceLevel = leverageScore > 70 ? 'high' : leverageScore > 50 ? 'medium' : 'low';

  // Market intelligence (generic)
  const market_average = data.annual_cost * 0.9; // Assume 10% below current
  const alternatives = getAlternatives(data.category, data.software_name);

  return {
    market_average_price: market_average,
    market_discount_range_min: 10,
    market_discount_range_max: 30,
    competitor_alternatives: alternatives,
    pricing_trends: `${data.category} software typically offers 10-30% discounts for renewals, with higher discounts for multi-year commitments.`,

    utilization_rate: data.utilization_rate,
    unused_licenses,
    contract_length_years: data.contract_length_years,
    total_spent_to_date: data.total_spent_to_date,
    payment_history_score: data.payment_history === 'excellent' ? 90 : data.payment_history === 'good' ? 70 : 50,

    recommended_target_discount: targetDiscount,
    confidence_level: confidenceLevel as 'high' | 'medium' | 'low',

    leverage_points: [
      `${unused_licenses} unused licenses representing $${waste_cost.toLocaleString()} in wasted spend`,
      `${data.contract_length_years} year${data.contract_length_years > 1 ? 's' : ''} of partnership with ${data.payment_history} payment history`,
      `Current utilization at ${data.utilization_rate}% - willing to right-size licenses`,
      `Evaluating ${alternatives.length} competitive alternatives with lower pricing`,
      `Budget constraints requiring 15-25% cost reduction for renewal approval`
    ],

    risks: [
      `Vendor may resist discount due to ${data.payment_history} payment history`,
      `Low utilization (${data.utilization_rate}%) weakens negotiating position`,
      `Switching costs may limit credibility of alternative threats`
    ],

    talking_points: [
      `"We value our partnership but need to optimize our software portfolio costs"`,
      `"We're only utilizing ${data.utilization_rate}% of licenses - let's right-size this contract"`,
      `"We've identified ${alternatives.length} alternatives at 20-30% lower cost"`,
      `"A ${targetDiscount}% discount would secure a multi-year renewal commitment"`,
      `"Our budget has been reduced - we need your help to continue the partnership"`
    ],

    email_initial_outreach: generateEmailTemplate('initial', data, targetDiscount, alternatives),
    email_counter_offer: generateEmailTemplate('counter', data, targetDiscount, alternatives),
    email_final_push: generateEmailTemplate('final', data, targetDiscount, alternatives),
    email_alternative_threat: generateEmailTemplate('alternative', data, targetDiscount, alternatives)
  };
}

/**
 * Get competitive alternatives based on software category
 */
function getAlternatives(category: string, currentSoftware: string) {
  const alternativesByCategory: Record<string, Array<{name: string; price_comparison: string; features_comparison: string}>> = {
    'Project Management': [
      { name: 'Monday.com', price_comparison: '20-30% less for similar tier', features_comparison: 'Similar features, better automations' },
      { name: 'ClickUp', price_comparison: '40% less with unlimited users', features_comparison: 'More features, steeper learning curve' },
      { name: 'Asana', price_comparison: 'Comparable pricing', features_comparison: 'Simpler interface, fewer customizations' }
    ],
    'Communication': [
      { name: 'Microsoft Teams', price_comparison: 'Included in M365', features_comparison: 'Deep Office integration' },
      { name: 'Slack', price_comparison: 'Similar pricing', features_comparison: 'Better app ecosystem' },
      { name: 'Discord', price_comparison: '70% less', features_comparison: 'Gaming-focused but growing in business' }
    ],
    'CRM': [
      { name: 'HubSpot', price_comparison: '25% less for similar features', features_comparison: 'Better free tier, strong marketing tools' },
      { name: 'Pipedrive', price_comparison: '40% less', features_comparison: 'Simpler, sales-focused' },
      { name: 'Zoho CRM', price_comparison: '50% less', features_comparison: 'Feature-rich, complex setup' }
    ]
  };

  return alternativesByCategory[category] || [
    { name: 'Alternative A', price_comparison: '20-30% less', features_comparison: 'Comparable features' },
    { name: 'Alternative B', price_comparison: '40-50% less', features_comparison: 'Good for smaller teams' }
  ];
}

/**
 * Generate email templates
 */
function generateEmailTemplate(
  type: 'initial' | 'counter' | 'final' | 'alternative',
  data: SoftwareNegotiationData,
  targetDiscount: number,
  alternatives: any[]
): string {
  const templates = {
    initial: `Subject: ${data.software_name} Contract Renewal Discussion

Hi [Account Manager Name],

I hope this email finds you well. As our ${data.software_name} contract approaches renewal on ${data.renewal_date}, I wanted to reach out to discuss our partnership.

Over the past ${data.contract_length_years} year${data.contract_length_years > 1 ? 's' : ''}, we've invested $${data.total_spent_to_date.toLocaleString()} in ${data.vendor_name}, and we value the platform. However, as we optimize our software portfolio, I've identified some concerns:

• We're currently utilizing ${data.utilization_rate}% of our ${data.license_count} licenses
• ${data.license_count - data.active_users} unused licenses represent significant waste
• We're exploring alternatives that offer similar capabilities at 20-30% lower cost

I'd like to schedule a call to discuss:
1. Right-sizing our license count to match actual usage
2. Exploring pricing options that better align with our budget
3. Understanding what loyalty discounts are available for long-term customers

Are you available this week for a 30-minute call?

Best regards,
[Your Name]`,

    counter: `Subject: Re: ${data.software_name} Renewal Proposal

Hi [Account Manager Name],

Thank you for the renewal proposal. I appreciate you taking the time to prepare this.

However, the proposed pricing of $${data.annual_cost.toLocaleString()}/year doesn't align with our current budget constraints. Based on our analysis and competitive benchmarking, we need a ${targetDiscount}% reduction to move forward with renewal.

Here's our rationale:
• Current utilization is only ${data.utilization_rate}% - we're significantly over-licensed
• Market research shows ${alternatives[0].name} offers similar features at ${alternatives[0].price_comparison}
• Our ${data.contract_length_years}-year partnership warrants loyalty pricing

We're prepared to commit to a multi-year contract at $${(data.annual_cost * (1 - targetDiscount/100)).toLocaleString()}/year with right-sized licensing.

Can you review this with your team and get back to me by [date]?

Thanks,
[Your Name]`,

    final: `Subject: Final Decision on ${data.software_name} Renewal

Hi [Account Manager Name],

I wanted to follow up on our contract discussion as we're approaching our decision deadline.

To be direct: we need a ${targetDiscount}% discount to $${(data.annual_cost * (1 - targetDiscount/100)).toLocaleString()}/year to proceed with renewal. Without this adjustment, we'll need to move forward with [Alternative name] starting [date].

I genuinely want to continue our partnership - you've been a great partner. But I have budget constraints I must work within.

Can you make this work? I need confirmation by end of day [date] to avoid triggering our migration timeline.

Looking forward to your response.

Best,
[Your Name]`,

    alternative: `Subject: Exploring Alternatives to ${data.software_name}

Hi [Account Manager Name],

Following our discussions, I wanted to be transparent: we're actively evaluating ${alternatives[0].name} and ${alternatives[1]?.name || 'other alternatives'}.

Here's what we're seeing:
• ${alternatives[0].name}: ${alternatives[0].price_comparison} (${alternatives[0].features_comparison})
• ${alternatives[1]?.name || 'Alternative B'}: ${alternatives[1]?.price_comparison || '30-40% lower cost'}
• Migration timeline: 60-90 days

We prefer to stay with ${data.vendor_name} given our ${data.contract_length_years}-year relationship, but the cost difference is substantial ($${(data.annual_cost * 0.25).toLocaleString()}+ annually).

Is there any flexibility to match competitive pricing? Even a ${targetDiscount}% discount would make staying significantly easier to justify.

This is urgent - we need to make a decision by [date].

Thanks,
[Your Name]`
  };

  return templates[type];
}
