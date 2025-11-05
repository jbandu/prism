/**
 * AI-Powered Feature Enrichment System
 * Uses Ollama (local LLM) to extract detailed features from software products
 * Cost: $0.00 per software (local inference)
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Ollama API configuration
const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// Comprehensive feature taxonomy for SaaS products
export const SAAS_FEATURE_TAXONOMY = {
  // Communication & Collaboration
  communication: [
    'Instant messaging',
    'Video conferencing',
    'Audio calls',
    'Screen sharing',
    'File sharing',
    'Channels/Rooms',
    'Direct messaging',
    'Group chat',
    'Voice messages',
    'Threaded conversations',
    'Mentions/Notifications',
    'Status indicators',
    'Emoji reactions',
    'GIFs and stickers',
  ],

  // Project Management
  projectManagement: [
    'Task management',
    'Kanban boards',
    'Gantt charts',
    'Sprint planning',
    'Backlog management',
    'Time tracking',
    'Resource allocation',
    'Milestone tracking',
    'Dependencies',
    'Custom workflows',
    'Project templates',
    'Burndown charts',
    'Velocity tracking',
  ],

  // Document & Content
  documents: [
    'Document creation',
    'Document editing',
    'Real-time collaboration',
    'Version history',
    'Comments',
    'PDF export',
    'Templates',
    'Rich text editing',
    'Markdown support',
    'Document search',
    'Folder organization',
    'Document sharing',
    'Access permissions',
  ],

  // Integrations
  integrations: [
    'REST API',
    'Webhooks',
    'Third-party integrations',
    'SSO/SAML',
    'OAuth',
    'Zapier integration',
    'Slack integration',
    'Microsoft Teams integration',
    'Google Workspace integration',
    'Salesforce integration',
    'Custom integrations',
    'API rate limiting',
  ],

  // Security & Compliance
  security: [
    'Two-factor authentication',
    'Single sign-on (SSO)',
    'SAML',
    'Role-based access control',
    'Audit logs',
    'Data encryption',
    'GDPR compliance',
    'SOC 2 compliance',
    'HIPAA compliance',
    'IP whitelisting',
    'Session management',
    'Password policies',
  ],

  // Analytics & Reporting
  analytics: [
    'Custom dashboards',
    'Report builder',
    'Data visualization',
    'Export to Excel/CSV',
    'Scheduled reports',
    'KPI tracking',
    'Real-time analytics',
    'Custom metrics',
    'Filtering and segmentation',
    'Trend analysis',
    'Comparative analysis',
  ],

  // Automation
  automation: [
    'Workflow automation',
    'Scheduled tasks',
    'Triggers and actions',
    'Rule engine',
    'Auto-assignment',
    'Notifications',
    'Reminders',
    'Recurring tasks',
    'Batch operations',
    'Email automation',
  ],

  // Mobile & Desktop
  platforms: [
    'iOS app',
    'Android app',
    'Desktop app (Windows)',
    'Desktop app (Mac)',
    'Web app',
    'Offline mode',
    'Push notifications',
    'Mobile-responsive',
    'Cross-device sync',
  ],

  // Customer Management
  crm: [
    'Contact management',
    'Lead tracking',
    'Opportunity management',
    'Sales pipeline',
    'Email campaigns',
    'Marketing automation',
    'Customer segmentation',
    'Deal tracking',
    'Activity tracking',
    'Quote management',
  ],

  // Finance & Accounting
  finance: [
    'Invoicing',
    'Expense tracking',
    'Receipt scanning',
    'Purchase orders',
    'Financial reporting',
    'Budget management',
    'Tax management',
    'Multi-currency',
    'Payment processing',
    'Bank reconciliation',
  ],

  // Data Management
  data: [
    'Import/Export',
    'Data backup',
    'Data archiving',
    'Data migration',
    'Bulk operations',
    'Data validation',
    'Data deduplication',
    'Data enrichment',
    'Data retention policies',
  ],
};

// Known software feature mappings (manually curated for accuracy)
export const KNOWN_SOFTWARE_FEATURES: Record<string, string[]> = {
  'Slack': [
    'Instant messaging',
    'Channels/Rooms',
    'Direct messaging',
    'File sharing',
    'Video conferencing',
    'Audio calls',
    'Screen sharing',
    'Threaded conversations',
    'Mentions/Notifications',
    'Emoji reactions',
    'Third-party integrations',
    'REST API',
    'Webhooks',
    'iOS app',
    'Android app',
    'Desktop app (Windows)',
    'Desktop app (Mac)',
    'Web app',
    'SSO/SAML',
    'Two-factor authentication',
    'Custom workflows',
    'Workflow automation',
    'Search',
  ],

  'Microsoft Teams': [
    'Instant messaging',
    'Video conferencing',
    'Audio calls',
    'Screen sharing',
    'Channels/Rooms',
    'Direct messaging',
    'File sharing',
    'Threaded conversations',
    'Mentions/Notifications',
    'Emoji reactions',
    'Document collaboration',
    'Microsoft Office integration',
    'SharePoint integration',
    'OneDrive integration',
    'iOS app',
    'Android app',
    'Desktop app (Windows)',
    'Desktop app (Mac)',
    'Web app',
    'SSO/SAML',
    'Two-factor authentication',
    'Meeting recording',
    'Live captions',
  ],

  'Zoom': [
    'Video conferencing',
    'Audio calls',
    'Screen sharing',
    'Meeting recording',
    'Breakout rooms',
    'Virtual backgrounds',
    'Webinars',
    'Live streaming',
    'Chat during meetings',
    'Whiteboard',
    'Polls and surveys',
    'iOS app',
    'Android app',
    'Desktop app (Windows)',
    'Desktop app (Mac)',
    'Web app',
    'SSO/SAML',
    'Waiting room',
    'Meeting transcription',
  ],

  'Asana': [
    'Task management',
    'Project management',
    'Kanban boards',
    'List view',
    'Calendar view',
    'Timeline view',
    'Dependencies',
    'Milestones',
    'Custom fields',
    'Task assignments',
    'Due dates',
    'Comments',
    'File attachments',
    'Project templates',
    'Workload management',
    'Portfolios',
    'Goals',
    'iOS app',
    'Android app',
    'Web app',
    'Third-party integrations',
    'REST API',
  ],

  'Monday.com': [
    'Task management',
    'Project management',
    'Kanban boards',
    'Gantt charts',
    'Timeline view',
    'Calendar view',
    'Custom workflows',
    'Automation',
    'Integrations',
    'Dashboards',
    'Custom fields',
    'File sharing',
    'Comments',
    'Notifications',
    'Project templates',
    'Time tracking',
    'Resource management',
    'iOS app',
    'Android app',
    'Web app',
    'REST API',
  ],

  'Jira': [
    'Issue tracking',
    'Agile boards',
    'Scrum boards',
    'Kanban boards',
    'Backlog management',
    'Sprint planning',
    'Burndown charts',
    'Custom workflows',
    'JQL (search)',
    'Custom fields',
    'Roadmaps',
    'Reports',
    'Automation rules',
    'Integrations',
    'REST API',
    'iOS app',
    'Android app',
    'Web app',
  ],

  'Salesforce': [
    'CRM',
    'Contact management',
    'Lead tracking',
    'Opportunity management',
    'Sales pipeline',
    'Account management',
    'Email integration',
    'Reports and dashboards',
    'Workflow automation',
    'Custom objects',
    'AppExchange',
    'Mobile app',
    'Marketing automation',
    'Customer service',
    'Analytics',
  ],
};

interface SoftwareFeatureExtraction {
  software_id: string;
  software_name: string;
  features: string[];
  confidence: number;
  method: 'known' | 'ai' | 'category' | 'manual';
}

/**
 * Call Ollama to extract features from software description
 */
async function extractFeaturesWithAI(
  softwareName: string,
  vendorName: string,
  category: string | null
): Promise<string[]> {
  const prompt = `You are a SaaS software expert. Extract a comprehensive list of features for this software product.

Software: ${softwareName} by ${vendorName}
Category: ${category || 'Unknown'}

List ALL key features this software typically provides. Include:
- Communication features (chat, video, etc.)
- Collaboration features (file sharing, co-editing, etc.)
- Project management features (tasks, boards, etc.)
- Integration capabilities
- Security features
- Mobile/platform availability
- Automation features
- Reporting/analytics

Return ONLY a JSON array of feature names, nothing else:
["feature1", "feature2", "feature3", ...]

Examples:
- For Slack: ["Instant messaging", "Video calls", "File sharing", "Channels", "Integrations", "Mobile apps"]
- For Asana: ["Task management", "Project boards", "Timeline view", "Dependencies", "Custom fields"]

Now extract features for ${softwareName}:`;

  try {
    const response = await fetch(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 512,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.response || '';

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const features = JSON.parse(jsonMatch[0]);
      return features.filter((f: string) => f && f.length > 3);
    }

    return [];
  } catch (error) {
    console.error(`AI feature extraction failed for ${softwareName}:`, error);
    return [];
  }
}

/**
 * Get features for a software product using multiple methods
 */
async function getEnrichedFeatures(
  softwareName: string,
  vendorName: string,
  category: string | null
): Promise<SoftwareFeatureExtraction> {
  // Method 1: Check if we have known features (manually curated)
  const knownKey = Object.keys(KNOWN_SOFTWARE_FEATURES).find(
    key => key.toLowerCase() === softwareName.toLowerCase()
  );

  if (knownKey) {
    console.log(`  ✅ Using known features for ${softwareName}`);
    return {
      software_id: '',
      software_name: softwareName,
      features: KNOWN_SOFTWARE_FEATURES[knownKey],
      confidence: 0.95,
      method: 'known',
    };
  }

  // Method 2: Use AI (Ollama) to extract features
  console.log(`  🤖 Using AI to extract features for ${softwareName}...`);
  const aiFeatures = await extractFeaturesWithAI(softwareName, vendorName, category);

  if (aiFeatures.length > 0) {
    return {
      software_id: '',
      software_name: softwareName,
      features: aiFeatures,
      confidence: 0.8,
      method: 'ai',
    };
  }

  // Method 3: Fallback to category-based features
  if (category) {
    const categoryKey = category.toLowerCase().replace(/\s+/g, '') as keyof typeof SAAS_FEATURE_TAXONOMY;
    if (SAAS_FEATURE_TAXONOMY[categoryKey]) {
      const categoryFeatures = SAAS_FEATURE_TAXONOMY[categoryKey];
      console.log(`  📦 Using category features for ${softwareName} (${category})`);
      return {
        software_id: '',
        software_name: softwareName,
        features: categoryFeatures.slice(0, 10), // Limit to 10
        confidence: 0.5,
        method: 'category',
      };
    }
  }

  // Method 4: Generic features
  return {
    software_id: '',
    software_name: softwareName,
    features: ['Software functionality'],
    confidence: 0.3,
    method: 'category',
  };
}

/**
 * Enrich features for all software in a company's portfolio
 */
export async function enrichPortfolioFeatures(
  companyId: string,
  options: {
    overwriteExisting?: boolean;
    selectedSoftwareIds?: string[];
  } = {}
): Promise<{
  processed: number;
  featuresAdded: number;
  results: Array<{
    software_name: string;
    features_count: number;
    method: string;
    confidence: number;
  }>;
}> {
  console.log(`\n🔍 Starting AI feature enrichment for company ${companyId}...`);
  console.log(`   Using: ${OLLAMA_MODEL} (local GPU)`);
  console.log(`   Cost: $0.00\n`);

  // Get software list
  const softwareQuery = options.selectedSoftwareIds && options.selectedSoftwareIds.length > 0
    ? sql`
        SELECT id, software_name, vendor_name, category
        FROM software_assets
        WHERE company_id = ${companyId}
        AND contract_status = 'active'
        AND id = ANY(${options.selectedSoftwareIds})
      `
    : sql`
        SELECT id, software_name, vendor_name, category
        FROM software_assets
        WHERE company_id = ${companyId}
        AND contract_status = 'active'
      `;

  const softwareList = await softwareQuery;
  console.log(`📦 Found ${softwareList.length} software products to enrich\n`);

  const results = [];
  let totalFeaturesAdded = 0;

  for (const software of softwareList) {
    try {
      // Get enriched features
      const enrichment = await getEnrichedFeatures(
        software.software_name,
        software.vendor_name,
        software.category
      );

      // Check existing features
      const existing = await sql`
        SELECT feature_name
        FROM software_features_mapping
        WHERE software_id = ${software.id}
      `;

      const existingFeatures = new Set(
        existing.map((r: any) => r.feature_name.toLowerCase())
      );

      // Insert new features
      let addedCount = 0;
      for (const feature of enrichment.features) {
        const featureLower = feature.toLowerCase();

        if (options.overwriteExisting || !existingFeatures.has(featureLower)) {
          try {
            await sql`
              INSERT INTO software_features_mapping
                (software_id, feature_name, feature_category_id)
              VALUES
                (${software.id}, ${feature}, NULL)
              ON CONFLICT (software_id, feature_name)
              DO NOTHING
            `;
            addedCount++;
          } catch (error) {
            // Ignore duplicates
          }
        }
      }

      totalFeaturesAdded += addedCount;

      results.push({
        software_name: software.software_name,
        features_count: addedCount,
        method: enrichment.method,
        confidence: enrichment.confidence,
      });

      console.log(
        `  ✅ ${software.software_name}: Added ${addedCount} features (${enrichment.method})`
      );
    } catch (error) {
      console.error(`  ❌ Failed to enrich ${software.software_name}:`, error);
      results.push({
        software_name: software.software_name,
        features_count: 0,
        method: 'error',
        confidence: 0,
      });
    }
  }

  console.log(`\n✅ Feature enrichment complete!`);
  console.log(`   Processed: ${softwareList.length} software products`);
  console.log(`   Added: ${totalFeaturesAdded} features`);
  console.log(`   Cost: $0.00 (local GPU)\n`);

  return {
    processed: softwareList.length,
    featuresAdded: totalFeaturesAdded,
    results,
  };
}
