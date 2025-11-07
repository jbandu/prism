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
 * Generate email templates with rich data
 */
function generateEmailTemplate(
  type: 'initial' | 'counter' | 'final' | 'alternative',
  data: SoftwareNegotiationData,
  targetDiscount: number,
  alternatives: any[]
): string {
  // Calculate key metrics
  const unused_licenses = data.license_count - data.active_users;
  const waste_cost = (unused_licenses / data.license_count) * data.annual_cost;
  const annual_cost_per_license = data.annual_cost / data.license_count;
  const target_cost = data.annual_cost * (1 - targetDiscount/100);
  const potential_savings = data.annual_cost - target_cost;
  const right_sized_cost = data.active_users * annual_cost_per_license;

  // Calculate dates
  const renewalDate = new Date(data.renewal_date);
  const daysToRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + 5);
  const formattedDeadline = responseDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const templates = {
    initial: `Subject: ${data.software_name} Renewal Strategy Discussion - Contract Analysis & Optimization

Hi [Account Manager Name],

I hope this message finds you well. As we approach our ${data.software_name} contract renewal on ${renewalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (${daysToRenewal} days), I wanted to initiate a strategic discussion about our partnership.

**Our Partnership Track Record:**
Over the past ${data.contract_length_years} year${data.contract_length_years > 1 ? 's' : ''}, we've invested $${data.total_spent_to_date.toLocaleString()} with ${data.vendor_name}. We've maintained ${data.payment_history} payment history and have been a reliable, long-term customer. We genuinely value the platform and the relationship we've built with your team.

**Current Utilization Analysis:**
However, our recent usage audit has revealed some significant optimization opportunities:

📊 **License Utilization:**
• Total Licenses: ${data.license_count}
• Active Users: ${data.active_users}
• Utilization Rate: ${data.utilization_rate.toFixed(1)}%
• Unused Licenses: ${unused_licenses} seats
• Annual Waste: $${waste_cost.toLocaleString()} (~${((waste_cost/data.annual_cost)*100).toFixed(1)}% of total spend)

💰 **Cost Analysis:**
• Current Annual Cost: $${data.annual_cost.toLocaleString()}
• Cost per License: $${annual_cost_per_license.toLocaleString()}
• Right-Sized Cost (${data.active_users} licenses): $${right_sized_cost.toLocaleString()}
• Potential Immediate Savings: $${(data.annual_cost - right_sized_cost).toLocaleString()}/year

**Market Context:**
In parallel, we're conducting due diligence on alternative solutions as part of our procurement process:
• ${alternatives[0].name}: ${alternatives[0].price_comparison} with ${alternatives[0].features_comparison}
• ${alternatives[1]?.name}: ${alternatives[1]?.price_comparison}
• Industry benchmarks suggest ${data.category} tools typically offer 15-30% renewal discounts for multi-year commitments

**What We'd Like to Discuss:**

1. **License Optimization:** Right-sizing from ${data.license_count} to ${data.active_users} active licenses
2. **Loyalty Pricing:** ${targetDiscount}% discount reflecting our ${data.contract_length_years}-year partnership and strong payment history
3. **Multi-Year Commitment:** We're open to a 2-3 year contract for better pricing
4. **Value-Add:** Any additional features, support tiers, or services you can include at no extra cost

**Proposed Target:**
$${target_cost.toLocaleString()}/year for ${data.active_users} licenses (${targetDiscount}% discount)
This represents fair value while maintaining our partnership.

Could we schedule a 45-minute call this week to discuss? I'd like to finalize this by ${formattedDeadline} to align with our fiscal planning.

Looking forward to a mutually beneficial outcome.

Best regards,
[Your Name]
[Your Title]
[Your Company]`,

    counter: `Subject: Re: ${data.software_name} Renewal Proposal - Counter-Proposal with Data

Hi [Account Manager Name],

Thank you for the renewal proposal. I've reviewed it carefully with our finance team, and while we appreciate your time on this, the proposed pricing doesn't align with our budget constraints and market benchmarks.

**Your Proposal:** $${data.annual_cost.toLocaleString()}/year
**Our Counter-Proposal:** $${target_cost.toLocaleString()}/year (${targetDiscount}% reduction)
**Rationale & Supporting Data:**

**1. Utilization Inefficiency (Strong Leverage):**
• We're paying for ${data.license_count} licenses but only using ${data.active_users} (${data.utilization_rate.toFixed(1)}%)
• This represents $${waste_cost.toLocaleString()}/year in wasted spend
• We're essentially subsidizing ${unused_licenses} unused seats
• Right-sizing alone would save us $${(data.annual_cost - right_sized_cost).toLocaleString()}/year

**2. Competitive Landscape (Market Context):**
We've completed detailed evaluations of alternatives:

${alternatives.map((alt, i) =>
  `• **${alt.name}:**
   - Pricing: ${alt.price_comparison}
   - Features: ${alt.features_comparison}
   - Migration Timeline: ${i === 0 ? '60-90 days' : '90-120 days'}
   - Annual Savings: ~$${((data.annual_cost * 0.25) + (i * 5000)).toLocaleString()}`
).join('\n\n')}

**3. Customer Value (Loyalty Argument):**
• ${data.contract_length_years}-year partnership worth $${data.total_spent_to_date.toLocaleString()}
• ${data.payment_history.charAt(0).toUpperCase() + data.payment_history.slice(1)} payment history - never missed a payment
• Minimal support tickets and low customer acquisition cost for you
• Strong reference customer and case study participant

**4. Budget Reality:**
Our software budget has been reduced by 18% this fiscal year. We need to demonstrate cost optimization across our entire stack. The CFO is reviewing every contract over $${(data.annual_cost * 0.5).toLocaleString()}.

**Our Commitment:**
In exchange for ${targetDiscount}% discount to $${target_cost.toLocaleString()}/year:
✅ 3-year contract commitment (guaranteed $${(target_cost * 3).toLocaleString()} revenue)
✅ Right-size to ${data.active_users} licenses immediately (cleaner metrics for you)
✅ Quarterly business reviews to optimize value
✅ Willing to be a reference customer and participate in case studies
✅ Open to annual escalator of 3-5% after year one

**Decision Timeline:**
I need your response by ${formattedDeadline}. After that date, I'll need to trigger our procurement process for alternatives, which will be difficult to reverse.

Can you escalate this to your regional VP or pricing committee? I'm confident we can find a win-win solution.

Best regards,
[Your Name]
[Your Title]
Direct: [Your Phone]`,

    final: `Subject: Final Decision Required - ${data.software_name} Renewal by ${formattedDeadline}

Hi [Account Manager Name],

I'm reaching out one last time regarding our ${data.software_name} renewal, as we've reached a critical decision point.

**Current Situation:**
• Contract Expiration: ${renewalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (${daysToRenewal} days)
• Your Last Offer: $${data.annual_cost.toLocaleString()}/year
• Our Target: $${target_cost.toLocaleString()}/year (${targetDiscount}% discount)
• Gap: $${potential_savings.toLocaleString()}/year

**Why This Matters:**
I've been asked by our CFO to make a final decision by **end of day ${formattedDeadline}**. Beyond that date, we will:
1. Execute our contract with ${alternatives[0].name} ($${((data.annual_cost * 0.75)).toLocaleString()}/year)
2. Begin 60-day migration timeline
3. Reallocate your budget to other strategic initiatives

**The Business Case You're Competing Against:**

**Option A: Renew with ${data.vendor_name} at $${target_cost.toLocaleString()}/year**
• 3-year commitment: $${(target_cost * 3).toLocaleString()}
• Minimal disruption
• Proven solution
• Our preferred option

**Option B: Switch to ${alternatives[0].name}**
• Year 1 Cost: $${((data.annual_cost * 0.75)).toLocaleString()} (${alternatives[0].price_comparison})
• 3-year savings: ~$${(potential_savings * 3).toLocaleString()}
• Migration cost: ~$${(data.annual_cost * 0.15).toLocaleString()} (one-time)
• Net 3-year savings: $${((potential_savings * 3) - (data.annual_cost * 0.15)).toLocaleString()}

**What I Need from You:**
A commitment to $${target_cost.toLocaleString()}/year by **${formattedDeadline} at 5pm EST**.

**My Commitment:**
If you can meet this price, I will:
• Execute a 3-year contract this week
• Provide a written testimonial
• Participate in a joint success story/case study
• Refer you to 2-3 other companies in our network

**Final Thought:**
I've genuinely enjoyed working with you and your team. ${data.vendor_name} has been a solid partner. I'm hoping we can make this work, but I need you to understand my constraints are real.

After ${formattedDeadline}, this window closes. The procurement wheels will start turning, and it will be very difficult to reverse.

Can you make this happen? I'm available for a call today or tomorrow if that helps.

Best regards,
[Your Name]
[Your Title]
Direct: [Your Phone]
Mobile: [Your Cell]`,

    alternative: `Subject: Competitive Evaluation Update - ${data.software_name} vs. Alternatives

Hi [Account Manager Name],

I wanted to give you a transparent update on where we are in our evaluation process, as I believe it's important for our partnership that you understand the competitive pressure we're facing.

**Current Evaluation Status:**
We've completed POCs with ${alternatives[0].name} and ${alternatives[1]?.name || 'two other alternatives'}, and I need to be honest with you about what we're seeing.

**Detailed Competitive Analysis:**

**${alternatives[0].name}:**
• **Pricing:** ${alternatives[0].price_comparison} ($${((data.annual_cost * 0.75)).toLocaleString()}/year vs. your $${data.annual_cost.toLocaleString()}/year)
• **Annual Savings:** $${((data.annual_cost * 0.25)).toLocaleString()}/year
• **3-Year Savings:** $${((data.annual_cost * 0.25) * 3).toLocaleString()}
• **Features:** ${alternatives[0].features_comparison}
• **Team Feedback:** 8/10 from end users in POC
• **Migration Effort:** Medium (60-90 days estimated)
• **Risk:** Low - proven platform with strong reviews

${alternatives[1] ? `**${alternatives[1].name}:**
• **Pricing:** ${alternatives[1].price_comparison}
• **Features:** ${alternatives[1].features_comparison}
• **Team Feedback:** 7/10 from end users
• **Migration Effort:** Medium-High (90-120 days)
` : ''}

**Cost Breakdown Comparison:**
Current ${data.software_name} spend:
• Annual: $${data.annual_cost.toLocaleString()}
• Per License: $${annual_cost_per_license.toLocaleString()}
• Waste (${unused_licenses} unused): $${waste_cost.toLocaleString()}/year
• Utilization: ${data.utilization_rate.toFixed(1)}%

${alternatives[0].name} projected spend:
• Annual: $${((data.annual_cost * 0.75)).toLocaleString()}
• Per License: $${((annual_cost_per_license * 0.75)).toLocaleString()}
• Right-sized from day 1: ${data.active_users} licenses
• Utilization: ~95%

**What This Means:**
The cost difference over 3 years is approximately **$${((potential_savings * 3)).toLocaleString()}**. That's significant budget that could be reallocated to other strategic initiatives.

**Why I'm Telling You This:**
Despite these numbers, we'd **prefer to stay with ${data.vendor_name}** because:
• ${data.contract_length_years}-year relationship and familiarity
• Migration always carries risk and disruption
• Your team has been responsive and supportive
• Integration with our existing workflows

**What Would Make Us Stay:**
If you could match or come close to competitive pricing at **$${target_cost.toLocaleString()}/year** (${targetDiscount}% discount), we would strongly prefer to renew rather than migrate.

**The Ask:**
Can you escalate this to your leadership team? I need an answer by ${formattedDeadline}. After that, I'll need to present my recommendation to our executive team, and the momentum will shift toward migration.

I'm hoping we can find a creative solution that works for both of us. Our ${data.contract_length_years}-year partnership is worth preserving if we can bridge this gap.

Available for a call anytime this week.

Best regards,
[Your Name]
[Your Title]
Email: [Your Email]
Direct: [Your Phone]

P.S. - Our CFO specifically asked me to document the cost-benefit analysis. I'd much rather fill that report with reasons we're staying with ${data.vendor_name} than reasons we're switching. Help me make that case.`
  };

  return templates[type];
}
