import Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface OrgExtractionInput {
  company_name: string;
  industry?: string;
  employee_count?: number;
  revenue?: number;
  software_list: {
    id: string;
    software_name: string;
    category?: string;
    annual_cost?: number;
  }[];
}

interface ExtractedPerson {
  full_name: string;
  title: string;
  department: string;
  level: string;
  reports_to?: string;
  decision_authority: string;
  budget_authority?: number;
  email?: string;
  responsibilities?: string[];
}

interface ExtractedStakeholder {
  software_name: string;
  person_name: string;
  role_type: string;
  role_level: string;
  responsibilities: string[];
  decision_weight: number;
  rationale: string;
}

interface OrgExtractionOutput {
  organizational_structure: {
    executives: ExtractedPerson[];
    directors: ExtractedPerson[];
    managers: ExtractedPerson[];
  };
  software_stakeholder_mapping: Array<{
    software_name: string;
    software_id: string;
    stakeholders: ExtractedStakeholder[];
  }>;
  decision_matrix: any;
  department_budgets: any[];
}

export async function extractOrgStructure(
  companyId: string
): Promise<OrgExtractionOutput> {
  // Get company data
  const companyResult = await sql`
    SELECT * FROM companies WHERE id = ${companyId}
  `;

  if (companyResult.length === 0) {
    throw new Error("Company not found");
  }

  const company = companyResult[0];

  // Get software list
  const software = await sql`
    SELECT
      id,
      software_name,
      category,
      annual_cost
    FROM software
    WHERE company_id = ${companyId}
      AND is_active = true
    ORDER BY annual_cost DESC NULLS LAST
  `;

  const input: OrgExtractionInput = {
    company_name: company.company_name,
    industry: company.industry || "Technology",
    employee_count: company.employee_count || 1000,
    revenue: undefined,
    software_list: software.map((s: any) => ({
      id: s.id,
      software_name: s.software_name,
      category: s.category,
      annual_cost: s.annual_cost,
    })),
  };

  const prompt = buildOrgExtractionPrompt(input);

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Parse response
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = textContent.text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
  }

  const orgData: OrgExtractionOutput = JSON.parse(jsonText);

  return orgData;
}

function buildOrgExtractionPrompt(input: OrgExtractionInput): string {
  const totalSpend = input.software_list.reduce(
    (sum, s) => sum + (s.annual_cost || 0),
    0
  );

  return `# ORGANIZATIONAL STRUCTURE EXTRACTION

You are analyzing a company's software portfolio to identify organizational structure and map stakeholders to software products.

## INPUT DATA
Company: ${input.company_name}
Industry: ${input.industry}
Employee Count: ${input.employee_count?.toLocaleString()}
Software Portfolio: ${input.software_list.length} products
Total Software Spend: $${totalSpend.toLocaleString()}

Top 10 Software Products:
${input.software_list
  .slice(0, 10)
  .map(
    (s, i) =>
      `${i + 1}. ${s.software_name} - ${s.category || "Uncategorized"} - $${(s.annual_cost || 0).toLocaleString()}/year`
  )
  .join("\n")}

## YOUR TASK

Create a realistic organizational structure for ${input.company_name} and map stakeholders to each software product.

### 1. ORGANIZATIONAL HIERARCHY

Create an org structure appropriate for ${input.industry} company with ${input.employee_count} employees:

**Executive Level (C-suite, VPs):**
- CEO
- CFO
- CIO or CTO (depending on industry)
- VP of IT/Infrastructure
- VP of Finance
- VP of Operations
- Other VPs relevant to ${input.industry}

**Director Level:**
- IT Director
- Finance Director
- Operations Director
- Procurement Director
- Security Director
- Data/Analytics Director (if applicable)

**Manager Level:**
- IT Manager (Infrastructure)
- IT Manager (Applications)
- IT Manager (Security)
- Finance Manager
- Procurement Manager
- Various business function managers

For each person:
- Use realistic names appropriate for the industry/geography
- Assign realistic job titles
- Map reporting relationships (who reports to whom)
- Set decision authority: Final, Approval, Influence, or None
- Set approximate budget authority based on title level

### 2. SOFTWARE STAKEHOLDER MAPPING

For EACH software product, identify stakeholders using these roles:

**Standard Roles:**
1. **executive_sponsor** - C-level or VP who owns this strategically
2. **business_owner** - Director/Manager who uses this for their function
3. **it_owner** - IT person managing technical implementation
4. **procurement_lead** - Manages vendor relationship
5. **finance_approver** - Approves budget
6. **security_reviewer** - Reviews security/compliance (if applicable)
7. **power_user** - Heavy users who influence decisions (optional)

**Mapping Rules:**
- CRM software (Salesforce, HubSpot) → owned by Sales VP/CRO
- Cloud infrastructure (AWS, Azure) → owned by CTO/CIO or VP Infrastructure
- ERP (SAP, Oracle) → owned by CFO or VP Finance
- HR systems (Workday, BambooHR) → owned by VP HR
- Analytics (Tableau, Power BI) → owned by VP Analytics or CFO
- Communication (Slack, Teams) → owned by CIO or VP Operations
- Security tools → owned by CISO or Security Director

For each stakeholder, provide:
- person_name
- role_type (one of the standard roles above)
- role_level: "primary" (key decision maker) or "secondary" (backup)
- responsibilities: Array of specific responsibilities
- decision_weight: 0.0-1.0 (how much influence they have)
- rationale: Why this person owns this role

### 3. OUTPUT FORMAT

Return ONLY valid JSON in this exact structure:

\`\`\`json
{
  "organizational_structure": {
    "executives": [
      {
        "full_name": "John Smith",
        "title": "Chief Information Officer",
        "department": "IT",
        "level": "Executive",
        "reports_to": "CEO",
        "decision_authority": "Final",
        "budget_authority": 10000000,
        "email": "jsmith@${input.company_name.toLowerCase().replace(/\s+/g, "")}.com"
      }
    ],
    "directors": [ /* similar structure */ ],
    "managers": [ /* similar structure */ ]
  },

  "software_stakeholder_mapping": [
    {
      "software_name": "${input.software_list[0]?.software_name || "Example Software"}",
      "software_id": "${input.software_list[0]?.id || "xxx"}",
      "stakeholders": [
        {
          "person_name": "John Smith",
          "role_type": "executive_sponsor",
          "role_level": "primary",
          "responsibilities": ["Final approval", "Strategic alignment"],
          "decision_weight": 1.0,
          "rationale": "As CIO, owns all IT infrastructure decisions"
        }
      ]
    }
  ],

  "decision_matrix": {
    "purchase_under_100k": {
      "decision_maker": "IT Director or Manager",
      "approvers": ["IT Director", "Finance Manager"]
    },
    "purchase_100k_to_500k": {
      "decision_maker": "VP or Director",
      "approvers": ["VP", "Finance Director", "CFO"]
    },
    "purchase_over_500k": {
      "decision_maker": "C-level",
      "approvers": ["CIO/CTO", "CFO", "CEO"]
    }
  },

  "department_budgets": [
    {
      "department": "IT",
      "head": "CIO name",
      "software_budget": 25000000
    }
  ]
}
\`\`\`

## IMPORTANT RULES

1. Use realistic names for ${input.industry} industry
2. Every software MUST have at least: executive_sponsor, business_owner, it_owner, procurement_lead
3. Map software logically (CRM→Sales, Cloud→IT, ERP→Finance)
4. Budget authority should match title (Managers: $50K, Directors: $250K, VPs: $1M+, C-level: unlimited)
5. Don't assign same person to too many software (max 10 per person for business_owner role)
6. Make sure reports_to creates a valid hierarchy tree
7. Return ONLY the JSON, no explanations before or after

Now generate the organizational structure and stakeholder mapping.`;
}

export async function saveOrgStructure(
  companyId: string,
  orgData: OrgExtractionOutput
): Promise<{
  people_created: number;
  stakeholders_created: number;
}> {
  // Combine all people
  const allPeople = [
    ...orgData.organizational_structure.executives,
    ...orgData.organizational_structure.directors,
    ...orgData.organizational_structure.managers,
  ];

  // Create a map of person name to ID for later reference
  const personNameToId: Map<string, string> = new Map();

  // First pass: Create all people (without reports_to)
  for (const person of allPeople) {
    const result = await sql`
      INSERT INTO people (
        company_id,
        full_name,
        email,
        title,
        department,
        level,
        decision_authority,
        budget_authority
      )
      VALUES (
        ${companyId},
        ${person.full_name},
        ${person.email || null},
        ${person.title},
        ${person.department},
        ${person.level},
        ${person.decision_authority},
        ${person.budget_authority || null}
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    if (result.length > 0) {
      personNameToId.set(person.full_name, result[0].id);
    }
  }

  // Second pass: Update reports_to relationships
  for (const person of allPeople) {
    if (person.reports_to) {
      const managerId = personNameToId.get(person.reports_to);
      const personId = personNameToId.get(person.full_name);

      if (managerId && personId) {
        await sql`
          UPDATE people
          SET reports_to_id = ${managerId}
          WHERE id = ${personId}
        `;
      }
    }
  }

  // Create stakeholder mappings
  let stakeholdersCreated = 0;

  for (const mapping of orgData.software_stakeholder_mapping) {
    for (const stakeholder of mapping.stakeholders) {
      const personId = personNameToId.get(stakeholder.person_name);

      if (!personId) {
        console.warn(
          `Person not found: ${stakeholder.person_name} for ${mapping.software_name}`
        );
        continue;
      }

      try {
        await sql`
          INSERT INTO software_stakeholders (
            software_asset_id,
            person_id,
            role_type,
            role_level,
            responsibilities,
            decision_weight
          )
          VALUES (
            ${mapping.software_id},
            ${personId},
            ${stakeholder.role_type},
            ${stakeholder.role_level},
            ${JSON.stringify(stakeholder.responsibilities)},
            ${stakeholder.decision_weight}
          )
          ON CONFLICT (software_asset_id, person_id, role_type) DO NOTHING
        `;
        stakeholdersCreated++;
      } catch (error) {
        console.error(
          `Error creating stakeholder for ${mapping.software_name}:`,
          error
        );
      }
    }
  }

  return {
    people_created: personNameToId.size,
    stakeholders_created: stakeholdersCreated,
  };
}
