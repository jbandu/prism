/**
 * Expanded Software Catalog - 50+ Enterprise Tools
 * Seeds comprehensive software catalog with popular enterprise tools
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const enterpriseSoftware = [
  // Project Management (10)
  {
    name: 'Asana',
    vendor: 'Asana',
    category: 'Project Management',
    features: [
      'Task Management', 'Subtasks', 'Task Dependencies', 'Timeline View',
      'Board View', 'Calendar View', 'Custom Fields', 'Automation',
      'Portfolios', 'Workload Management', 'Time Tracking', 'Reporting'
    ]
  },
  {
    name: 'Monday.com',
    vendor: 'monday.com',
    category: 'Project Management',
    features: [
      'Task Management', 'Kanban Boards', 'Gantt Charts', 'Automation',
      'Time Tracking', 'Resource Management', 'Forms', 'Dashboards'
    ]
  },
  {
    name: 'Jira',
    vendor: 'Atlassian',
    category: 'Project Management',
    features: [
      'Issue Tracking', 'Sprint Planning', 'Agile Boards', 'Backlog Management',
      'Roadmaps', 'Automation', 'Time Tracking', 'Reports'
    ]
  },
  {
    name: 'ClickUp',
    vendor: 'ClickUp',
    category: 'Project Management',
    features: [
      'Task Management', 'Goals', 'Docs', 'Whiteboards', 'Time Tracking',
      'Automation', 'Custom Fields', 'Dashboards', 'Mind Maps'
    ]
  },
  {
    name: 'Trello',
    vendor: 'Atlassian',
    category: 'Project Management',
    features: [
      'Kanban Boards', 'Cards', 'Lists', 'Power-Ups', 'Automation',
      'Calendar View', 'Timeline View', 'Board Templates'
    ]
  },
  {
    name: 'Wrike',
    vendor: 'Wrike',
    category: 'Project Management',
    features: [
      'Task Management', 'Gantt Charts', 'Kanban Boards', 'Time Tracking',
      'Resource Management', 'Proofing', 'Custom Workflows', 'Reports'
    ]
  },
  {
    name: 'Smartsheet',
    vendor: 'Smartsheet',
    category: 'Project Management',
    features: [
      'Grid View', 'Gantt Charts', 'Card View', 'Calendar', 'Forms',
      'Automation', 'Dashboards', 'Resource Management', 'Reporting'
    ]
  },
  {
    name: 'Basecamp',
    vendor: 'Basecamp',
    category: 'Project Management',
    features: [
      'To-Do Lists', 'Message Boards', 'Schedules', 'Docs', 'File Storage',
      'Real-time Chat', 'Automatic Check-ins', 'Hill Charts'
    ]
  },
  {
    name: 'Notion',
    vendor: 'Notion Labs',
    category: 'Project Management',
    features: [
      'Wiki', 'Docs', 'Tasks', 'Databases', 'Calendar', 'Board View',
      'Timeline', 'Templates', 'AI Writing', 'Collaboration'
    ]
  },
  {
    name: 'Linear',
    vendor: 'Linear',
    category: 'Project Management',
    features: [
      'Issue Tracking', 'Sprint Planning', 'Roadmaps', 'Cycles',
      'Git Integration', 'Automation', 'Views', 'Keyboard Shortcuts'
    ]
  },

  // CRM (10)
  {
    name: 'Salesforce',
    vendor: 'Salesforce',
    category: 'CRM',
    features: [
      'Contact Management', 'Lead Management', 'Opportunity Tracking',
      'Sales Pipeline', 'Forecasting', 'Reports', 'Dashboards', 'Automation'
    ]
  },
  {
    name: 'HubSpot',
    vendor: 'HubSpot',
    category: 'CRM',
    features: [
      'Contact Management', 'Deal Pipeline', 'Email Tracking', 'Meeting Scheduler',
      'Live Chat', 'Forms', 'Marketing Automation', 'Reports'
    ]
  },
  {
    name: 'Pipedrive',
    vendor: 'Pipedrive',
    category: 'CRM',
    features: [
      'Pipeline Management', 'Contact Management', 'Email Integration',
      'Activity Tracking', 'Reporting', 'Mobile App', 'Automation', 'AI Sales Assistant'
    ]
  },
  {
    name: 'Zoho CRM',
    vendor: 'Zoho',
    category: 'CRM',
    features: [
      'Lead Management', 'Contact Management', 'Deal Management', 'Workflow Automation',
      'Email Integration', 'Social Media Integration', 'Analytics', 'AI Assistant'
    ]
  },
  {
    name: 'Microsoft Dynamics 365',
    vendor: 'Microsoft',
    category: 'CRM',
    features: [
      'Sales Automation', 'Customer Service', 'Marketing Automation', 'Field Service',
      'Project Service', 'AI Insights', 'Integration with Office 365'
    ]
  },
  {
    name: 'Freshsales',
    vendor: 'Freshworks',
    category: 'CRM',
    features: [
      'Contact Management', 'Deal Management', 'Email Tracking', 'Phone',
      'Chat', 'AI-based Lead Scoring', 'Reports', 'Mobile App'
    ]
  },
  {
    name: 'Copper',
    vendor: 'Copper',
    category: 'CRM',
    features: [
      'Contact Management', 'Pipeline Management', 'Gmail Integration',
      'Task Management', 'Reporting', 'Mobile App', 'Automation'
    ]
  },
  {
    name: 'Close',
    vendor: 'Close',
    category: 'CRM',
    features: [
      'Built-in Calling', 'Email', 'SMS', 'Pipeline Management',
      'Contact Management', 'Reporting', 'Power Dialer', 'Predictive Dialer'
    ]
  },
  {
    name: 'Insightly',
    vendor: 'Insightly',
    category: 'CRM',
    features: [
      'Contact Management', 'Project Management', 'Pipeline Management',
      'Email Tracking', 'Workflow Automation', 'Reports', 'Mobile App'
    ]
  },
  {
    name: 'ActiveCampaign',
    vendor: 'ActiveCampaign',
    category: 'CRM',
    features: [
      'Email Marketing', 'Marketing Automation', 'CRM', 'Sales Automation',
      'Messaging', 'Landing Pages', 'Forms', 'Reports'
    ]
  },

  // Communication (8)
  {
    name: 'Slack',
    vendor: 'Slack Technologies',
    category: 'Communication',
    features: [
      'Channels', 'Direct Messages', 'Video Calls', 'Screen Sharing',
      'File Sharing', 'Integrations', 'Search', 'Workflow Builder'
    ]
  },
  {
    name: 'Microsoft Teams',
    vendor: 'Microsoft',
    category: 'Communication',
    features: [
      'Chat', 'Video Meetings', 'File Collaboration', 'Channels',
      'Integration with Office 365', 'Apps', 'Live Events', 'Phone System'
    ]
  },
  {
    name: 'Zoom',
    vendor: 'Zoom Video Communications',
    category: 'Communication',
    features: [
      'Video Meetings', 'Webinars', 'Phone', 'Chat', 'Rooms',
      'Screen Sharing', 'Recording', 'Virtual Backgrounds', 'Breakout Rooms'
    ]
  },
  {
    name: 'Google Meet',
    vendor: 'Google',
    category: 'Communication',
    features: [
      'Video Meetings', 'Screen Sharing', 'Recording', 'Live Captions',
      'Breakout Rooms', 'Polls', 'Q&A', 'Hand Raising'
    ]
  },
  {
    name: 'Discord',
    vendor: 'Discord',
    category: 'Communication',
    features: [
      'Text Channels', 'Voice Channels', 'Video Calls', 'Screen Sharing',
      'Roles', 'Permissions', 'Bots', 'Stage Channels', 'Forums'
    ]
  },
  {
    name: 'Webex',
    vendor: 'Cisco',
    category: 'Communication',
    features: [
      'Video Meetings', 'Webinars', 'Messaging', 'Calling', 'Whiteboard',
      'File Sharing', 'Recording', 'Breakout Sessions'
    ]
  },
  {
    name: 'RingCentral',
    vendor: 'RingCentral',
    category: 'Communication',
    features: [
      'Phone System', 'Video Meetings', 'Team Messaging', 'Contact Center',
      'Fax', 'SMS', 'Analytics', 'Integrations'
    ]
  },
  {
    name: 'GoToMeeting',
    vendor: 'GoTo',
    category: 'Communication',
    features: [
      'Video Conferencing', 'Screen Sharing', 'Recording', 'Drawing Tools',
      'Mobile Apps', 'Dial-in Audio', 'Personal Meeting Rooms'
    ]
  },

  // Analytics & BI (7)
  {
    name: 'Tableau',
    vendor: 'Tableau Software',
    category: 'Business Intelligence',
    features: [
      'Data Visualization', 'Interactive Dashboards', 'Data Connections',
      'Calculated Fields', 'Collaboration', 'Mobile', 'AI Analytics'
    ]
  },
  {
    name: 'Power BI',
    vendor: 'Microsoft',
    category: 'Business Intelligence',
    features: [
      'Data Visualization', 'Dashboards', 'Reports', 'Data Modeling',
      'AI Insights', 'Mobile', 'Integration with Excel', 'Real-time Streaming'
    ]
  },
  {
    name: 'Looker',
    vendor: 'Google',
    category: 'Business Intelligence',
    features: [
      'Data Exploration', 'Dashboards', 'Reports', 'Data Modeling',
      'Embedded Analytics', 'API', 'Alerts', 'Scheduling'
    ]
  },
  {
    name: 'Domo',
    vendor: 'Domo',
    category: 'Business Intelligence',
    features: [
      'Dashboards', 'Data Visualization', 'Data Integration', 'Collaboration',
      'Mobile', 'Alerts', 'Predictive Analytics', 'App Marketplace'
    ]
  },
  {
    name: 'Qlik Sense',
    vendor: 'Qlik',
    category: 'Business Intelligence',
    features: [
      'Data Visualization', 'Associative Analytics', 'Self-Service',
      'Collaboration', 'Mobile', 'AI Insights', 'Alerting'
    ]
  },
  {
    name: 'Sisense',
    vendor: 'Sisense',
    category: 'Business Intelligence',
    features: [
      'Data Visualization', 'Embedded Analytics', 'Data Preparation',
      'AI Analytics', 'Alerts', 'Mobile', 'White-label'
    ]
  },
  {
    name: 'Metabase',
    vendor: 'Metabase',
    category: 'Business Intelligence',
    features: [
      'SQL Query Builder', 'Dashboards', 'Visualizations', 'Alerts',
      'Embedded Analytics', 'Open Source', 'Self-hosted'
    ]
  },

  // Developer Tools (8)
  {
    name: 'GitHub',
    vendor: 'GitHub',
    category: 'Developer Tools',
    features: [
      'Git Repositories', 'Pull Requests', 'Issues', 'Actions (CI/CD)',
      'Projects', 'Wikis', 'Code Review', 'Copilot', 'Security Scanning'
    ]
  },
  {
    name: 'GitLab',
    vendor: 'GitLab',
    category: 'Developer Tools',
    features: [
      'Git Repositories', 'CI/CD', 'Issue Tracking', 'Code Review',
      'Container Registry', 'Security Scanning', 'Wiki', 'Planning'
    ]
  },
  {
    name: 'Bitbucket',
    vendor: 'Atlassian',
    category: 'Developer Tools',
    features: [
      'Git Repositories', 'Pull Requests', 'Pipelines (CI/CD)', 'Code Review',
      'Branch Permissions', 'Jira Integration', 'Deployment'
    ]
  },
  {
    name: 'Datadog',
    vendor: 'Datadog',
    category: 'Developer Tools',
    features: [
      'APM', 'Infrastructure Monitoring', 'Log Management', 'Synthetics',
      'Real User Monitoring', 'Security Monitoring', 'Dashboards', 'Alerts'
    ]
  },
  {
    name: 'New Relic',
    vendor: 'New Relic',
    category: 'Developer Tools',
    features: [
      'APM', 'Infrastructure Monitoring', 'Browser Monitoring', 'Mobile Monitoring',
      'Synthetics', 'Logs', 'Alerts', 'Dashboards'
    ]
  },
  {
    name: 'Sentry',
    vendor: 'Sentry',
    category: 'Developer Tools',
    features: [
      'Error Tracking', 'Performance Monitoring', 'Release Health',
      'Stack Traces', 'Breadcrumbs', 'Alerts', 'Integrations'
    ]
  },
  {
    name: 'Postman',
    vendor: 'Postman',
    category: 'Developer Tools',
    features: [
      'API Testing', 'API Documentation', 'Mock Servers', 'Monitoring',
      'Collaboration', 'Environments', 'Collections', 'Automation'
    ]
  },
  {
    name: 'Jenkins',
    vendor: 'Jenkins',
    category: 'Developer Tools',
    features: [
      'CI/CD', 'Pipelines', 'Plugins', 'Distributed Builds',
      'Security', 'Notifications', 'Open Source'
    ]
  },

  // HR & Recruitment (7)
  {
    name: 'BambooHR',
    vendor: 'BambooHR',
    category: 'HR',
    features: [
      'Employee Database', 'Time Off Tracking', 'Performance Management',
      'Applicant Tracking', 'Onboarding', 'Reports', 'Mobile App'
    ]
  },
  {
    name: 'Workday',
    vendor: 'Workday',
    category: 'HR',
    features: [
      'HCM', 'Payroll', 'Recruiting', 'Time Tracking', 'Performance Management',
      'Learning', 'Analytics', 'Mobile'
    ]
  },
  {
    name: 'Greenhouse',
    vendor: 'Greenhouse',
    category: 'HR',
    features: [
      'Applicant Tracking', 'Interview Scheduling', 'Scorecards',
      'Onboarding', 'Analytics', 'Integrations', 'DEI Tools'
    ]
  },
  {
    name: 'Lever',
    vendor: 'Lever',
    category: 'HR',
    features: [
      'Applicant Tracking', 'CRM', 'Interview Scheduling', 'Analytics',
      'Onboarding', 'Diversity Sourcing', 'Automation'
    ]
  },
  {
    name: 'Gusto',
    vendor: 'Gusto',
    category: 'HR',
    features: [
      'Payroll', 'Benefits Administration', 'Time Tracking', 'Hiring',
      'Onboarding', 'Compliance', 'Reports'
    ]
  },
  {
    name: 'Rippling',
    vendor: 'Rippling',
    category: 'HR',
    features: [
      'HRIS', 'Payroll', 'Benefits', 'IT Management', 'Time Tracking',
      'Recruiting', 'Learning', 'Analytics'
    ]
  },
  {
    name: 'Lattice',
    vendor: 'Lattice',
    category: 'HR',
    features: [
      'Performance Management', 'Goals (OKRs)', '1-on-1s', 'Reviews',
      'Engagement Surveys', 'Career Development', 'Analytics'
    ]
  },
];

async function seedExpandedCatalog() {
  console.log('\n🌱 Seeding Expanded Software Catalog (50+ Enterprise Tools)...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const software of enterpriseSoftware) {
    try {
      console.log(`📦 Processing: ${software.name}`);

      // Insert or update software in catalog
      const result = await sql`
        INSERT INTO software_catalog (software_name, vendor_name, category, total_features_count)
        VALUES (${software.name}, ${software.vendor}, ${software.category}, ${software.features.length})
        ON CONFLICT (software_name) DO UPDATE SET
          vendor_name = EXCLUDED.vendor_name,
          category = EXCLUDED.category,
          total_features_count = EXCLUDED.total_features_count,
          last_updated = NOW()
        RETURNING id
      `;

      const softwareId = result[0].id;

      // Insert features
      let featureCount = 0;
      for (const featureName of software.features) {
        // Categorize feature (simple categorization)
        let categoryName = 'General Features';

        if (featureName.includes('Task') || featureName.includes('Issue')) categoryName = 'Task Management';
        else if (featureName.includes('Report') || featureName.includes('Dashboard') || featureName.includes('Analytics')) categoryName = 'Reporting & Analytics';
        else if (featureName.includes('Automation') || featureName.includes('Workflow')) categoryName = 'Workflow Automation';
        else if (featureName.includes('Integration')) categoryName = 'Integration Hub';
        else if (featureName.includes('Mobile') || featureName.includes('App')) categoryName = 'Mobile Access';
        else if (featureName.includes('Chat') || featureName.includes('Message') || featureName.includes('Communication')) categoryName = 'Communication';
        else if (featureName.includes('Video') || featureName.includes('Meeting') || featureName.includes('Call')) categoryName = 'Communication';
        else if (featureName.includes('Time') || featureName.includes('Track')) categoryName = 'Time Tracking';
        else if (featureName.includes('Calendar') || featureName.includes('Schedule')) categoryName = 'Calendar & Scheduling';
        else if (featureName.includes('File') || featureName.includes('Document') || featureName.includes('Storage')) categoryName = 'Document Management';

        // Get category ID
        const category = await sql`
          SELECT id FROM feature_categories WHERE category_name = ${categoryName} LIMIT 1
        `;

        if (category.length > 0) {
          await sql`
            INSERT INTO software_features (
              software_catalog_id,
              feature_category_id,
              feature_name,
              is_core_feature,
              requires_premium
            ) VALUES (
              ${softwareId},
              ${category[0].id},
              ${featureName},
              true,
              false
            )
            ON CONFLICT (software_catalog_id, feature_name) DO NOTHING
          `;
          featureCount++;
        }
      }

      console.log(`  ✅ Added ${featureCount} features`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n✅ Successfully seeded ${successCount} software products!`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} products failed to seed`);
  }
  console.log('');
}

// Run if called directly
if (require.main === module) {
  seedExpandedCatalog()
    .then(() => {
      console.log('🎉 Expanded catalog seed complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedExpandedCatalog };
