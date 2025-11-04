/**
 * Description-Based Feature Extractor
 * Extracts features from software descriptions using pattern matching and NLP
 */

export interface ExtractedFeature {
  feature_name: string;
  confidence: number; // 0-1
  source: 'description' | 'category' | 'inferred';
}

// Common feature keywords and patterns
const FEATURE_PATTERNS = {
  collaboration: /collaborat(e|ion|ive)|team work|shared workspace|co-?authoring/i,
  reporting: /report(ing|s)?|analytics|dashboard|insights|metrics|kpi/i,
  integration: /integrat(e|ion|ions)|api|webhook|connect|sync/i,
  automation: /automat(e|ion|ed)|workflow|trigger|schedule/i,
  security: /security|encrypt|authentication|sso|2fa|compliance|gdpr/i,
  mobile: /mobile|ios|android|app/i,
  cloud: /cloud|saas|hosted|online/i,
  storage: /storage|document|file|backup/i,
  communication: /chat|messaging|email|notification|alert/i,
  customization: /custom(ize|ization)|configure|personalize|theme/i,
  search: /search|find|query|filter/i,
  export: /export|download|pdf|csv|excel/i,
  import: /import|upload|bulk/i,
  versioning: /version|history|audit|changelog/i,
  permissions: /permission|role|access control|rbac/i,
  templates: /template|preset|boilerplate/i,
  scheduling: /schedul(e|ing)|calendar|appointment|booking/i,
  payments: /payment|billing|invoice|subscription/i,
  crm: /crm|customer|contact|lead/i,
  projectManagement: /project|task|milestone|kanban|agile/i,
};

// Category-specific features
const CATEGORY_FEATURES: Record<string, string[]> = {
  'Collaboration': ['Real-time collaboration', 'Team workspaces', 'File sharing', 'Comments'],
  'Project Management': ['Task management', 'Gantt charts', 'Sprint planning', 'Time tracking'],
  'Communication': ['Instant messaging', 'Video conferencing', 'Screen sharing', 'Channels'],
  'CRM': ['Contact management', 'Sales pipeline', 'Lead tracking', 'Email campaigns'],
  'Analytics': ['Data visualization', 'Custom reports', 'Dashboards', 'KPI tracking'],
  'Marketing': ['Email campaigns', 'Social media', 'SEO tools', 'Analytics'],
  'HR': ['Employee database', 'Time off tracking', 'Payroll', 'Performance reviews'],
  'Accounting': ['Invoicing', 'Expense tracking', 'Financial reports', 'Tax management'],
  'Design': ['Vector editing', 'Prototyping', 'Templates', 'Asset library'],
  'Development': ['Code editor', 'Version control', 'CI/CD', 'Debugging'],
  'Security': ['Access control', 'Encryption', 'Audit logs', 'Compliance'],
  'Storage': ['File storage', 'Version control', 'Sharing', 'Backup'],
};

/**
 * Extract features from a software description
 */
export function extractFeaturesFromDescription(
  description: string,
  category: string | null = null,
  softwareName: string | null = null
): ExtractedFeature[] {
  const features: ExtractedFeature[] = [];
  const descriptionLower = description.toLowerCase();

  // Extract pattern-based features
  for (const [featureName, pattern] of Object.entries(FEATURE_PATTERNS)) {
    if (pattern.test(descriptionLower)) {
      features.push({
        feature_name: formatFeatureName(featureName),
        confidence: 0.8,
        source: 'description'
      });
    }
  }

  // Add category-specific features
  if (category && CATEGORY_FEATURES[category]) {
    const categoryFeatures = CATEGORY_FEATURES[category];
    categoryFeatures.forEach(feature => {
      // Only add if not already present
      if (!features.find(f => f.feature_name.toLowerCase() === feature.toLowerCase())) {
        features.push({
          feature_name: feature,
          confidence: 0.6,
          source: 'category'
        });
      }
    });
  }

  // Extract specific action words as features
  const actionWords = extractActionWords(description);
  actionWords.forEach(action => {
    if (!features.find(f => f.feature_name.toLowerCase() === action.toLowerCase())) {
      features.push({
        feature_name: action,
        confidence: 0.5,
        source: 'inferred'
      });
    }
  });

  // Remove duplicates and sort by confidence
  const uniqueFeatures = deduplicateFeatures(features);
  return uniqueFeatures.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract action words that could be features
 */
function extractActionWords(description: string): string[] {
  const actionPatterns = [
    /\b(create|manage|track|monitor|analyze|generate|automate|sync|share|collaborate|export|import|customize|integrate|schedule|send|receive|update|delete|edit|view|search|filter|sort|organize|archive)\w*\b/gi
  ];

  const actions = new Set<string>();
  actionPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const formatted = formatFeatureName(match);
        if (formatted.length > 3) { // Skip very short words
          actions.add(formatted);
        }
      });
    }
  });

  return Array.from(actions).slice(0, 10); // Limit to 10 action features
}

/**
 * Format feature name for display
 */
function formatFeatureName(name: string): string {
  // Convert camelCase to Title Case
  const formatted = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  return formatted;
}

/**
 * Remove duplicate features
 */
function deduplicateFeatures(features: ExtractedFeature[]): ExtractedFeature[] {
  const seen = new Map<string, ExtractedFeature>();

  features.forEach(feature => {
    const key = feature.feature_name.toLowerCase();
    const existing = seen.get(key);

    if (!existing || feature.confidence > existing.confidence) {
      seen.set(key, feature);
    }
  });

  return Array.from(seen.values());
}

/**
 * Batch extract features for multiple software products
 */
export function extractFeaturesFromSoftwareList(
  softwareList: Array<{
    id: string;
    software_name: string;
    description?: string;
    category?: string;
  }>
): Map<string, ExtractedFeature[]> {
  const results = new Map<string, ExtractedFeature[]>();

  softwareList.forEach(software => {
    if (software.description && software.description.length > 20) {
      const features = extractFeaturesFromDescription(
        software.description,
        software.category || null,
        software.software_name
      );

      if (features.length > 0) {
        results.set(software.id, features);
      }
    }
  });

  return results;
}
