/**
 * Brand Logo Mapping
 * Pre-configured logos for famous companies and software
 * Provides instant logo resolution without API calls
 */

export interface BrandLogo {
  domain: string;
  logoUrl: string;
  aliases: string[]; // Alternative names/spellings
}

/**
 * Famous brand logo mappings
 * Key: normalized company name (lowercase, no spaces/special chars)
 */
export const FAMOUS_BRANDS: Record<string, BrandLogo> = {
  // Cloud Providers
  'aws': {
    domain: 'aws.amazon.com',
    logoUrl: 'https://logo.clearbit.com/aws.amazon.com',
    aliases: ['amazon web services', 'amazon aws', 'awss']
  },
  'azure': {
    domain: 'azure.microsoft.com',
    logoUrl: 'https://logo.clearbit.com/azure.microsoft.com',
    aliases: ['microsoft azure', 'ms azure']
  },
  'gcp': {
    domain: 'cloud.google.com',
    logoUrl: 'https://logo.clearbit.com/cloud.google.com',
    aliases: ['google cloud', 'google cloud platform', 'googlecloud']
  },
  'digitalocean': {
    domain: 'digitalocean.com',
    logoUrl: 'https://logo.clearbit.com/digitalocean.com',
    aliases: ['digital ocean']
  },
  'heroku': {
    domain: 'heroku.com',
    logoUrl: 'https://logo.clearbit.com/heroku.com',
    aliases: []
  },
  'vercel': {
    domain: 'vercel.com',
    logoUrl: 'https://logo.clearbit.com/vercel.com',
    aliases: []
  },
  'netlify': {
    domain: 'netlify.com',
    logoUrl: 'https://logo.clearbit.com/netlify.com',
    aliases: []
  },

  // Enterprise Software
  'sap': {
    domain: 'sap.com',
    logoUrl: 'https://logo.clearbit.com/sap.com',
    aliases: []
  },
  'oracle': {
    domain: 'oracle.com',
    logoUrl: 'https://logo.clearbit.com/oracle.com',
    aliases: []
  },
  'salesforce': {
    domain: 'salesforce.com',
    logoUrl: 'https://logo.clearbit.com/salesforce.com',
    aliases: ['sales force']
  },
  'workday': {
    domain: 'workday.com',
    logoUrl: 'https://logo.clearbit.com/workday.com',
    aliases: []
  },
  'servicenow': {
    domain: 'servicenow.com',
    logoUrl: 'https://logo.clearbit.com/servicenow.com',
    aliases: ['service now']
  },
  'adobe': {
    domain: 'adobe.com',
    logoUrl: 'https://logo.clearbit.com/adobe.com',
    aliases: []
  },
  'microsoft': {
    domain: 'microsoft.com',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    aliases: ['ms']
  },

  // Collaboration & Productivity
  'slack': {
    domain: 'slack.com',
    logoUrl: 'https://logo.clearbit.com/slack.com',
    aliases: []
  },
  'zoom': {
    domain: 'zoom.us',
    logoUrl: 'https://logo.clearbit.com/zoom.us',
    aliases: ['zoom.us']
  },
  'teams': {
    domain: 'microsoft.com',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    aliases: ['microsoft teams', 'ms teams']
  },
  'googlemeet': {
    domain: 'meet.google.com',
    logoUrl: 'https://logo.clearbit.com/google.com',
    aliases: ['google meet', 'meet']
  },
  'asana': {
    domain: 'asana.com',
    logoUrl: 'https://logo.clearbit.com/asana.com',
    aliases: []
  },
  'monday': {
    domain: 'monday.com',
    logoUrl: 'https://logo.clearbit.com/monday.com',
    aliases: ['mondaycom', 'monday.com']
  },
  'notion': {
    domain: 'notion.so',
    logoUrl: 'https://logo.clearbit.com/notion.so',
    aliases: ['notion.so']
  },
  'confluence': {
    domain: 'atlassian.com',
    logoUrl: 'https://logo.clearbit.com/atlassian.com',
    aliases: ['atlassian confluence']
  },
  'jira': {
    domain: 'atlassian.com',
    logoUrl: 'https://logo.clearbit.com/atlassian.com',
    aliases: ['atlassian jira']
  },
  'trello': {
    domain: 'trello.com',
    logoUrl: 'https://logo.clearbit.com/trello.com',
    aliases: []
  },

  // Development Tools
  'github': {
    domain: 'github.com',
    logoUrl: 'https://logo.clearbit.com/github.com',
    aliases: ['git hub']
  },
  'gitlab': {
    domain: 'gitlab.com',
    logoUrl: 'https://logo.clearbit.com/gitlab.com',
    aliases: ['git lab']
  },
  'bitbucket': {
    domain: 'bitbucket.org',
    logoUrl: 'https://logo.clearbit.com/bitbucket.org',
    aliases: ['bit bucket']
  },
  'docker': {
    domain: 'docker.com',
    logoUrl: 'https://logo.clearbit.com/docker.com',
    aliases: []
  },
  'jenkins': {
    domain: 'jenkins.io',
    logoUrl: 'https://logo.clearbit.com/jenkins.io',
    aliases: []
  },
  'circleci': {
    domain: 'circleci.com',
    logoUrl: 'https://logo.clearbit.com/circleci.com',
    aliases: ['circle ci']
  },
  'datadog': {
    domain: 'datadoghq.com',
    logoUrl: 'https://logo.clearbit.com/datadoghq.com',
    aliases: ['data dog']
  },
  'newrelic': {
    domain: 'newrelic.com',
    logoUrl: 'https://logo.clearbit.com/newrelic.com',
    aliases: ['new relic']
  },
  'splunk': {
    domain: 'splunk.com',
    logoUrl: 'https://logo.clearbit.com/splunk.com',
    aliases: []
  },

  // Communication
  'twilio': {
    domain: 'twilio.com',
    logoUrl: 'https://logo.clearbit.com/twilio.com',
    aliases: []
  },
  'sendgrid': {
    domain: 'sendgrid.com',
    logoUrl: 'https://logo.clearbit.com/sendgrid.com',
    aliases: ['send grid']
  },
  'mailchimp': {
    domain: 'mailchimp.com',
    logoUrl: 'https://logo.clearbit.com/mailchimp.com',
    aliases: ['mail chimp']
  },
  'intercom': {
    domain: 'intercom.com',
    logoUrl: 'https://logo.clearbit.com/intercom.com',
    aliases: []
  },
  'zendesk': {
    domain: 'zendesk.com',
    logoUrl: 'https://logo.clearbit.com/zendesk.com',
    aliases: ['zen desk']
  },

  // Analytics & Marketing
  'google analytics': {
    domain: 'analytics.google.com',
    logoUrl: 'https://logo.clearbit.com/google.com',
    aliases: ['googleanalytics', 'ga']
  },
  'mixpanel': {
    domain: 'mixpanel.com',
    logoUrl: 'https://logo.clearbit.com/mixpanel.com',
    aliases: ['mix panel']
  },
  'amplitude': {
    domain: 'amplitude.com',
    logoUrl: 'https://logo.clearbit.com/amplitude.com',
    aliases: []
  },
  'segment': {
    domain: 'segment.com',
    logoUrl: 'https://logo.clearbit.com/segment.com',
    aliases: []
  },
  'hubspot': {
    domain: 'hubspot.com',
    logoUrl: 'https://logo.clearbit.com/hubspot.com',
    aliases: ['hub spot']
  },
  'marketo': {
    domain: 'marketo.com',
    logoUrl: 'https://logo.clearbit.com/marketo.com',
    aliases: []
  },

  // Databases
  'mongodb': {
    domain: 'mongodb.com',
    logoUrl: 'https://logo.clearbit.com/mongodb.com',
    aliases: ['mongo', 'mongo db']
  },
  'postgresql': {
    domain: 'postgresql.org',
    logoUrl: 'https://logo.clearbit.com/postgresql.org',
    aliases: ['postgres', 'pg']
  },
  'mysql': {
    domain: 'mysql.com',
    logoUrl: 'https://logo.clearbit.com/mysql.com',
    aliases: []
  },
  'redis': {
    domain: 'redis.io',
    logoUrl: 'https://logo.clearbit.com/redis.io',
    aliases: []
  },
  'elasticsearch': {
    domain: 'elastic.co',
    logoUrl: 'https://logo.clearbit.com/elastic.co',
    aliases: ['elastic search', 'elastic']
  },
  'snowflake': {
    domain: 'snowflake.com',
    logoUrl: 'https://logo.clearbit.com/snowflake.com',
    aliases: []
  },
  'databricks': {
    domain: 'databricks.com',
    logoUrl: 'https://logo.clearbit.com/databricks.com',
    aliases: ['data bricks']
  },

  // Security
  'okta': {
    domain: 'okta.com',
    logoUrl: 'https://logo.clearbit.com/okta.com',
    aliases: []
  },
  'auth0': {
    domain: 'auth0.com',
    logoUrl: 'https://logo.clearbit.com/auth0.com',
    aliases: ['authzero']
  },
  'onelogin': {
    domain: 'onelogin.com',
    logoUrl: 'https://logo.clearbit.com/onelogin.com',
    aliases: ['one login']
  },
  'duo': {
    domain: 'duo.com',
    logoUrl: 'https://logo.clearbit.com/duo.com',
    aliases: ['duo security']
  },
  'crowdstrike': {
    domain: 'crowdstrike.com',
    logoUrl: 'https://logo.clearbit.com/crowdstrike.com',
    aliases: ['crowd strike']
  },
  'paloalto': {
    domain: 'paloaltonetworks.com',
    logoUrl: 'https://logo.clearbit.com/paloaltonetworks.com',
    aliases: ['palo alto', 'palo alto networks']
  },

  // Design
  'figma': {
    domain: 'figma.com',
    logoUrl: 'https://logo.clearbit.com/figma.com',
    aliases: []
  },
  'sketch': {
    domain: 'sketch.com',
    logoUrl: 'https://logo.clearbit.com/sketch.com',
    aliases: []
  },
  'invision': {
    domain: 'invisionapp.com',
    logoUrl: 'https://logo.clearbit.com/invisionapp.com',
    aliases: ['in vision']
  },
  'canva': {
    domain: 'canva.com',
    logoUrl: 'https://logo.clearbit.com/canva.com',
    aliases: []
  },

  // Payment & Finance
  'stripe': {
    domain: 'stripe.com',
    logoUrl: 'https://logo.clearbit.com/stripe.com',
    aliases: []
  },
  'paypal': {
    domain: 'paypal.com',
    logoUrl: 'https://logo.clearbit.com/paypal.com',
    aliases: ['pay pal']
  },
  'square': {
    domain: 'squareup.com',
    logoUrl: 'https://logo.clearbit.com/squareup.com',
    aliases: []
  },
  'braintree': {
    domain: 'braintreepayments.com',
    logoUrl: 'https://logo.clearbit.com/braintreepayments.com',
    aliases: ['brain tree']
  },
  'quickbooks': {
    domain: 'quickbooks.intuit.com',
    logoUrl: 'https://logo.clearbit.com/intuit.com',
    aliases: ['quick books', 'intuit quickbooks']
  },
  'xero': {
    domain: 'xero.com',
    logoUrl: 'https://logo.clearbit.com/xero.com',
    aliases: []
  },

  // Other Popular Tools
  'dropbox': {
    domain: 'dropbox.com',
    logoUrl: 'https://logo.clearbit.com/dropbox.com',
    aliases: ['drop box']
  },
  'box': {
    domain: 'box.com',
    logoUrl: 'https://logo.clearbit.com/box.com',
    aliases: []
  },
  'googledrive': {
    domain: 'drive.google.com',
    logoUrl: 'https://logo.clearbit.com/google.com',
    aliases: ['google drive', 'gdrive']
  },
  'onedrive': {
    domain: 'onedrive.live.com',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    aliases: ['one drive', 'microsoft onedrive']
  },
  'airtable': {
    domain: 'airtable.com',
    logoUrl: 'https://logo.clearbit.com/airtable.com',
    aliases: ['air table']
  },
  'zapier': {
    domain: 'zapier.com',
    logoUrl: 'https://logo.clearbit.com/zapier.com',
    aliases: []
  },
  'shopify': {
    domain: 'shopify.com',
    logoUrl: 'https://logo.clearbit.com/shopify.com',
    aliases: []
  },
  'wordpress': {
    domain: 'wordpress.com',
    logoUrl: 'https://logo.clearbit.com/wordpress.com',
    aliases: ['word press']
  },
  'wix': {
    domain: 'wix.com',
    logoUrl: 'https://logo.clearbit.com/wix.com',
    aliases: []
  },
  'tableau': {
    domain: 'tableau.com',
    logoUrl: 'https://logo.clearbit.com/tableau.com',
    aliases: []
  },
  'looker': {
    domain: 'looker.com',
    logoUrl: 'https://logo.clearbit.com/looker.com',
    aliases: []
  },
  'powerbi': {
    domain: 'powerbi.microsoft.com',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    aliases: ['power bi', 'microsoft power bi']
  }
};

/**
 * Normalize brand name for lookup
 * Converts to lowercase and removes spaces/special characters
 */
export function normalizeBrandName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Find brand logo by name or alias
 * Returns brand info if found, null otherwise
 */
export function findBrandLogo(name: string): BrandLogo | null {
  const normalized = normalizeBrandName(name);

  // Direct match
  if (FAMOUS_BRANDS[normalized]) {
    return FAMOUS_BRANDS[normalized];
  }

  // Check aliases
  for (const [key, brand] of Object.entries(FAMOUS_BRANDS)) {
    const aliasMatch = brand.aliases.some(alias =>
      normalizeBrandName(alias) === normalized
    );
    if (aliasMatch) {
      return brand;
    }
  }

  return null;
}

/**
 * Check if a name matches a famous brand (case-insensitive, fuzzy)
 */
export function isFamousBrand(name: string): boolean {
  return findBrandLogo(name) !== null;
}
