import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContractAnalysisResult {
  // Extracted Key Terms
  contract_start_date: string | null;
  contract_end_date: string | null;
  renewal_date: string | null;
  notice_period_days: number | null;
  auto_renewal: boolean;
  cancellation_deadline: string | null;

  // Financial Terms
  contract_value: number | null;
  payment_frequency: string | null;
  payment_terms: string | null;
  price_increase_clause: string | null;
  price_increase_percentage: number | null;

  // Terms & Conditions
  termination_clause: string | null;
  early_termination_fee: number | null;
  refund_policy: string | null;
  liability_cap: number | null;
  data_retention_policy: string | null;

  // SLA
  sla_uptime_percentage: number | null;
  sla_response_time: string | null;
  sla_penalty_clause: string | null;

  // Other Important Terms
  intellectual_property_clause: string | null;
  confidentiality_clause: string | null;
  warranty_clause: string | null;
  indemnification_clause: string | null;
  dispute_resolution: string | null;
  governing_law: string | null;

  // Full Text & Summary
  full_text: string;
  ai_summary: string;
  key_highlights: string[];

  // Risk Alerts
  risk_alerts: RiskAlert[];
}

export interface RiskAlert {
  risk_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potential_cost_impact: number | null;
  action_required: boolean;
  action_deadline: string | null;
  action_description: string | null;
}

/**
 * Parse PDF contract file
 */
export async function parsePDFContract(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Analyze contract using AI
 */
export async function analyzeContract(
  contractText: string,
  vendorName: string,
  contractType: string = 'subscription'
): Promise<ContractAnalysisResult> {
  try {
    // Use GPT-4o-mini for cost-effective analysis
    const prompt = buildContractAnalysisPrompt(contractText, vendorName, contractType);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a legal contract analysis expert specializing in SaaS agreements.
Extract key terms, identify risks, and provide actionable insights.
Return valid JSON only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Low temperature for factual extraction
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Validate and structure the result
    return {
      contract_start_date: result.contract_start_date || null,
      contract_end_date: result.contract_end_date || null,
      renewal_date: result.renewal_date || null,
      notice_period_days: result.notice_period_days || null,
      auto_renewal: result.auto_renewal || false,
      cancellation_deadline: result.cancellation_deadline || null,

      contract_value: result.contract_value || null,
      payment_frequency: result.payment_frequency || null,
      payment_terms: result.payment_terms || null,
      price_increase_clause: result.price_increase_clause || null,
      price_increase_percentage: result.price_increase_percentage || null,

      termination_clause: result.termination_clause || null,
      early_termination_fee: result.early_termination_fee || null,
      refund_policy: result.refund_policy || null,
      liability_cap: result.liability_cap || null,
      data_retention_policy: result.data_retention_policy || null,

      sla_uptime_percentage: result.sla_uptime_percentage || null,
      sla_response_time: result.sla_response_time || null,
      sla_penalty_clause: result.sla_penalty_clause || null,

      intellectual_property_clause: result.intellectual_property_clause || null,
      confidentiality_clause: result.confidentiality_clause || null,
      warranty_clause: result.warranty_clause || null,
      indemnification_clause: result.indemnification_clause || null,
      dispute_resolution: result.dispute_resolution || null,
      governing_law: result.governing_law || null,

      full_text: contractText,
      ai_summary: result.ai_summary || 'Contract analysis completed.',
      key_highlights: result.key_highlights || [],

      risk_alerts: result.risk_alerts || []
    };

  } catch (error) {
    console.error('AI contract analysis failed:', error);

    // Return fallback analysis
    return getFallbackAnalysis(contractText, vendorName);
  }
}

/**
 * Build AI prompt for contract analysis
 */
function buildContractAnalysisPrompt(
  contractText: string,
  vendorName: string,
  contractType: string
): string {
  // Truncate contract text if too long (keep first 15,000 chars)
  const truncatedText = contractText.length > 15000
    ? contractText.substring(0, 15000) + '...[truncated]'
    : contractText;

  return `
Analyze this ${contractType} contract from ${vendorName}:

**CONTRACT TEXT:**
${truncatedText}

**YOUR TASK:**
Extract all key terms and identify risks. Return as JSON with this structure:

{
  "contract_start_date": "YYYY-MM-DD or null",
  "contract_end_date": "YYYY-MM-DD or null",
  "renewal_date": "YYYY-MM-DD or null",
  "notice_period_days": 30,
  "auto_renewal": true,
  "cancellation_deadline": "YYYY-MM-DD or null",

  "contract_value": 50000,
  "payment_frequency": "annually",
  "payment_terms": "net-30",
  "price_increase_clause": "Text of price increase clause",
  "price_increase_percentage": 5,

  "termination_clause": "Text of termination clause",
  "early_termination_fee": 10000,
  "refund_policy": "Text of refund policy",
  "liability_cap": 100000,
  "data_retention_policy": "Text of data retention policy",

  "sla_uptime_percentage": 99.9,
  "sla_response_time": "24 hours",
  "sla_penalty_clause": "Text of SLA penalty clause",

  "intellectual_property_clause": "Text",
  "confidentiality_clause": "Text",
  "warranty_clause": "Text",
  "indemnification_clause": "Text",
  "dispute_resolution": "arbitration",
  "governing_law": "State of California",

  "ai_summary": "2-3 sentence summary of the contract",
  "key_highlights": [
    "Most important term 1",
    "Most important term 2",
    "Most important term 3"
  ],

  "risk_alerts": [
    {
      "risk_type": "auto_renewal",
      "severity": "high",
      "title": "Auto-Renewal Clause Detected",
      "description": "Contract will automatically renew unless canceled 30 days in advance",
      "potential_cost_impact": 50000,
      "action_required": true,
      "action_deadline": "YYYY-MM-DD",
      "action_description": "Review renewal terms and set calendar reminder"
    }
  ]
}

**IMPORTANT INSTRUCTIONS:**
1. Extract dates in YYYY-MM-DD format
2. Extract monetary values as numbers (no currency symbols)
3. Extract percentages as numbers (e.g., 5 for 5%)
4. For clauses, extract verbatim text (up to 500 chars each)
5. Identify ALL risks - prioritize:
   - Auto-renewal clauses
   - Price increase clauses
   - High early termination fees
   - Limited liability caps
   - Unfavorable payment terms
   - Missing SLA guarantees
   - Data security concerns
6. Severity levels: critical (>$50K impact), high ($10K-$50K), medium ($1K-$10K), low (<$1K)
7. Return null for fields not found in contract
8. Be accurate - this is legal analysis

RETURN VALID JSON ONLY.
`;
}

/**
 * Fallback analysis when AI fails
 */
function getFallbackAnalysis(
  contractText: string,
  vendorName: string
): ContractAnalysisResult {
  // Basic pattern matching for critical terms
  const autoRenewalDetected = /auto[- ]?renew/i.test(contractText);
  const priceIncreaseDetected = /price\s+increase|rate\s+increase|pricing\s+change/i.test(contractText);

  const riskAlerts: RiskAlert[] = [];

  if (autoRenewalDetected) {
    riskAlerts.push({
      risk_type: 'auto_renewal',
      severity: 'high',
      title: 'Possible Auto-Renewal Clause',
      description: 'The contract text contains references to auto-renewal. Manual review recommended.',
      potential_cost_impact: null,
      action_required: true,
      action_deadline: null,
      action_description: 'Review contract for auto-renewal terms and cancellation procedures'
    });
  }

  if (priceIncreaseDetected) {
    riskAlerts.push({
      risk_type: 'price_increase',
      severity: 'medium',
      title: 'Possible Price Increase Clause',
      description: 'The contract text mentions price increases. Manual review recommended.',
      potential_cost_impact: null,
      action_required: true,
      action_deadline: null,
      action_description: 'Review contract for price increase terms and notice periods'
    });
  }

  return {
    contract_start_date: null,
    contract_end_date: null,
    renewal_date: null,
    notice_period_days: null,
    auto_renewal: autoRenewalDetected,
    cancellation_deadline: null,

    contract_value: null,
    payment_frequency: null,
    payment_terms: null,
    price_increase_clause: null,
    price_increase_percentage: null,

    termination_clause: null,
    early_termination_fee: null,
    refund_policy: null,
    liability_cap: null,
    data_retention_policy: null,

    sla_uptime_percentage: null,
    sla_response_time: null,
    sla_penalty_clause: null,

    intellectual_property_clause: null,
    confidentiality_clause: null,
    warranty_clause: null,
    indemnification_clause: null,
    dispute_resolution: null,
    governing_law: null,

    full_text: contractText,
    ai_summary: `Contract analysis completed with basic pattern matching. AI analysis unavailable. Please review manually.`,
    key_highlights: [
      'Full AI analysis unavailable - manual review recommended',
      autoRenewalDetected ? 'Possible auto-renewal clause detected' : 'No auto-renewal detected',
      priceIncreaseDetected ? 'Possible price increase clause detected' : 'No price increase clause detected'
    ],

    risk_alerts: riskAlerts
  };
}

/**
 * Generate contract reminders based on analysis
 */
export interface ContractReminder {
  reminder_type: string;
  reminder_date: string;
  days_before: number;
  title: string;
  message: string;
}

export function generateContractReminders(
  analysis: ContractAnalysisResult,
  contractName: string
): ContractReminder[] {
  const reminders: ContractReminder[] = [];
  const today = new Date();

  // Cancellation deadline reminder
  if (analysis.cancellation_deadline) {
    const deadlineDate = new Date(analysis.cancellation_deadline);

    // 30 days before
    const reminder30 = new Date(deadlineDate);
    reminder30.setDate(reminder30.getDate() - 30);
    if (reminder30 > today) {
      reminders.push({
        reminder_type: 'cancellation_deadline',
        reminder_date: reminder30.toISOString().split('T')[0],
        days_before: 30,
        title: `${contractName} - Cancellation Deadline Approaching`,
        message: `You have 30 days to cancel before auto-renewal. Deadline: ${analysis.cancellation_deadline}`
      });
    }

    // 7 days before
    const reminder7 = new Date(deadlineDate);
    reminder7.setDate(reminder7.getDate() - 7);
    if (reminder7 > today) {
      reminders.push({
        reminder_type: 'cancellation_deadline',
        reminder_date: reminder7.toISOString().split('T')[0],
        days_before: 7,
        title: `URGENT: ${contractName} - Cancellation Deadline in 7 Days`,
        message: `Last week to cancel before auto-renewal! Deadline: ${analysis.cancellation_deadline}`
      });
    }
  }

  // Renewal date reminder
  if (analysis.renewal_date) {
    const renewalDate = new Date(analysis.renewal_date);

    // 60 days before
    const reminder60 = new Date(renewalDate);
    reminder60.setDate(reminder60.getDate() - 60);
    if (reminder60 > today) {
      reminders.push({
        reminder_type: 'renewal_approaching',
        reminder_date: reminder60.toISOString().split('T')[0],
        days_before: 60,
        title: `${contractName} - Renewal in 2 Months`,
        message: `Time to review terms and negotiate. Renewal date: ${analysis.renewal_date}`
      });
    }
  }

  // Contract end date reminder
  if (analysis.contract_end_date) {
    const endDate = new Date(analysis.contract_end_date);

    // 90 days before
    const reminder90 = new Date(endDate);
    reminder90.setDate(reminder90.getDate() - 90);
    if (reminder90 > today) {
      reminders.push({
        reminder_type: 'term_ending',
        reminder_date: reminder90.toISOString().split('T')[0],
        days_before: 90,
        title: `${contractName} - Contract Ending in 3 Months`,
        message: `Contract term ends on ${analysis.contract_end_date}. Time to plan next steps.`
      });
    }
  }

  return reminders;
}

/**
 * Compare two contracts
 */
export interface ContractComparison {
  cost_comparison: {
    contract1_value: number | null;
    contract2_value: number | null;
    difference: number | null;
    cheaper_contract: string;
  };
  terms_comparison: {
    contract1_length_days: number | null;
    contract2_length_days: number | null;
    contract1_auto_renewal: boolean;
    contract2_auto_renewal: boolean;
    contract1_notice_days: number | null;
    contract2_notice_days: number | null;
  };
  key_differences: string[];
  recommendation: string;
}

export function compareContracts(
  contract1: ContractAnalysisResult,
  contract1Name: string,
  contract2: ContractAnalysisResult,
  contract2Name: string
): ContractComparison {
  const keyDifferences: string[] = [];

  // Cost comparison
  const costDiff = (contract1.contract_value || 0) - (contract2.contract_value || 0);
  const cheaperContract = costDiff > 0 ? contract2Name : contract1Name;

  if (contract1.contract_value && contract2.contract_value) {
    const percentDiff = Math.abs((costDiff / contract1.contract_value) * 100);
    if (percentDiff > 10) {
      keyDifferences.push(`${cheaperContract} is ${percentDiff.toFixed(0)}% cheaper`);
    }
  }

  // Auto-renewal comparison
  if (contract1.auto_renewal !== contract2.auto_renewal) {
    const noAutoRenewal = contract1.auto_renewal ? contract2Name : contract1Name;
    keyDifferences.push(`${noAutoRenewal} does not have auto-renewal`);
  }

  // Notice period comparison
  if (contract1.notice_period_days && contract2.notice_period_days) {
    const diff = Math.abs(contract1.notice_period_days - contract2.notice_period_days);
    if (diff > 30) {
      keyDifferences.push(`Notice periods differ by ${diff} days`);
    }
  }

  // SLA comparison
  if (contract1.sla_uptime_percentage && contract2.sla_uptime_percentage) {
    const slaDiff = Math.abs(contract1.sla_uptime_percentage - contract2.sla_uptime_percentage);
    if (slaDiff > 0.1) {
      const betterSLA = contract1.sla_uptime_percentage > contract2.sla_uptime_percentage
        ? contract1Name : contract2Name;
      keyDifferences.push(`${betterSLA} offers better SLA (${Math.max(contract1.sla_uptime_percentage, contract2.sla_uptime_percentage)}% uptime)`);
    }
  }

  // Liability comparison
  if (contract1.liability_cap && contract2.liability_cap) {
    const higherCap = contract1.liability_cap > contract2.liability_cap ? contract1Name : contract2Name;
    keyDifferences.push(`${higherCap} has higher liability cap`);
  }

  // Calculate contract lengths
  const getContractLength = (analysis: ContractAnalysisResult) => {
    if (analysis.contract_start_date && analysis.contract_end_date) {
      const start = new Date(analysis.contract_start_date);
      const end = new Date(analysis.contract_end_date);
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const contract1Length = getContractLength(contract1);
  const contract2Length = getContractLength(contract2);

  // Generate recommendation
  let recommendation = 'Both contracts have tradeoffs. ';
  if (costDiff < 0) {
    recommendation += `${contract1Name} is cheaper. `;
  } else if (costDiff > 0) {
    recommendation += `${contract2Name} is cheaper. `;
  }

  if (!contract1.auto_renewal && contract2.auto_renewal) {
    recommendation += `${contract1Name} offers more flexibility without auto-renewal. `;
  } else if (contract1.auto_renewal && !contract2.auto_renewal) {
    recommendation += `${contract2Name} offers more flexibility without auto-renewal. `;
  }

  recommendation += 'Review full terms before deciding.';

  return {
    cost_comparison: {
      contract1_value: contract1.contract_value,
      contract2_value: contract2.contract_value,
      difference: costDiff,
      cheaper_contract: cheaperContract
    },
    terms_comparison: {
      contract1_length_days: contract1Length,
      contract2_length_days: contract2Length,
      contract1_auto_renewal: contract1.auto_renewal,
      contract2_auto_renewal: contract2.auto_renewal,
      contract1_notice_days: contract1.notice_period_days,
      contract2_notice_days: contract2.notice_period_days
    },
    key_differences: keyDifferences,
    recommendation: recommendation
  };
}
