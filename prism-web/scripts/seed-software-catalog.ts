/**
 * Seed Common Enterprise Software to Catalog
 * Pre-populates software_catalog with common enterprise tools and their features
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const commonSoftware = [
  {
    name: 'Asana',
    vendor: 'Asana',
    category: 'Project Management',
    features: [
      { name: 'Task Management', category: 'Task Management' },
      { name: 'Subtasks', category: 'Task Management' },
      { name: 'Task Dependencies', category: 'Task Management' },
      { name: 'Task Comments', category: 'Task Management' },
      { name: 'Due Dates', category: 'Calendar & Scheduling' },
      { name: 'Calendar View', category: 'Calendar & Scheduling' },
      { name: 'Timeline View', category: 'Project Planning' },
      { name: 'Board View', category: 'Task Management' },
      { name: 'List View', category: 'Task Management' },
      { name: 'Project Templates', category: 'Templates' },
      { name: 'Workflow Automation', category: 'Workflow Automation' },
      { name: 'Custom Fields', category: 'Customization' },
      { name: 'File Attachments', category: 'Document Management' },
      { name: 'Team Collaboration', category: 'Collaboration' },
      { name: 'Comments & Mentions', category: 'Communication' },
      { name: 'Email Integration', category: 'Integration Hub' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
      { name: 'Search & Filter', category: 'Search & Filter' },
      { name: 'Reporting & Dashboards', category: 'Reporting & Analytics' },
    ],
  },
  {
    name: 'Monday.com',
    vendor: 'monday.com',
    category: 'Project Management',
    features: [
      { name: 'Task Management', category: 'Task Management' },
      { name: 'Subtasks', category: 'Task Management' },
      { name: 'Task Dependencies', category: 'Task Management' },
      { name: 'Kanban Boards', category: 'Task Management' },
      { name: 'Gantt Charts', category: 'Project Planning' },
      { name: 'Calendar View', category: 'Calendar & Scheduling' },
      { name: 'Timeline View', category: 'Project Planning' },
      { name: 'Form Builder', category: 'Customization' },
      { name: 'Workflow Automation', category: 'Workflow Automation' },
      { name: 'Custom Dashboards', category: 'Reporting & Analytics' },
      { name: 'Time Tracking', category: 'Time Tracking' },
      { name: 'Budget Tracking', category: 'Budget & Finance' },
      { name: 'Resource Management', category: 'Resource Management' },
      { name: 'File Storage', category: 'Document Management' },
      { name: 'Team Collaboration', category: 'Collaboration' },
      { name: 'Integrations', category: 'Integration Hub' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
      { name: 'Notifications', category: 'Notifications' },
    ],
  },
  {
    name: 'Jira',
    vendor: 'Atlassian',
    category: 'Project Management',
    features: [
      { name: 'Issue Tracking', category: 'Task Management' },
      { name: 'Sprint Planning', category: 'Project Planning' },
      { name: 'Backlog Management', category: 'Task Management' },
      { name: 'Agile Boards', category: 'Task Management' },
      { name: 'Kanban Boards', category: 'Task Management' },
      { name: 'Scrum Boards', category: 'Task Management' },
      { name: 'Roadmaps', category: 'Project Planning' },
      { name: 'Custom Workflows', category: 'Workflow Automation' },
      { name: 'Custom Fields', category: 'Customization' },
      { name: 'JQL Search', category: 'Search & Filter' },
      { name: 'Reports & Dashboards', category: 'Reporting & Analytics' },
      { name: 'Time Tracking', category: 'Time Tracking' },
      { name: 'Release Management', category: 'Project Planning' },
      { name: 'Version Control Integration', category: 'Integration Hub' },
      { name: 'API Access', category: 'Integration Hub' },
      { name: 'Automation Rules', category: 'Workflow Automation' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
    ],
  },
  {
    name: 'Salesforce',
    vendor: 'Salesforce',
    category: 'CRM',
    features: [
      { name: 'Contact Management', category: 'CRM Features' },
      { name: 'Lead Management', category: 'CRM Features' },
      { name: 'Opportunity Tracking', category: 'CRM Features' },
      { name: 'Pipeline Management', category: 'CRM Features' },
      { name: 'Email Integration', category: 'Communication' },
      { name: 'Calendar Integration', category: 'Calendar & Scheduling' },
      { name: 'Task Management', category: 'Task Management' },
      { name: 'Workflow Automation', category: 'Workflow Automation' },
      { name: 'Custom Objects', category: 'Customization' },
      { name: 'Reports & Dashboards', category: 'Reporting & Analytics' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
      { name: 'API Access', category: 'Integration Hub' },
      { name: 'File Storage', category: 'Document Management' },
    ],
  },
  {
    name: 'Slack',
    vendor: 'Slack Technologies',
    category: 'Communication',
    features: [
      { name: 'Team Chat', category: 'Communication' },
      { name: 'Direct Messages', category: 'Communication' },
      { name: 'Channels', category: 'Collaboration' },
      { name: 'Video Calls', category: 'Communication' },
      { name: 'Screen Sharing', category: 'Collaboration' },
      { name: 'File Sharing', category: 'Document Management' },
      { name: 'Search', category: 'Search & Filter' },
      { name: 'Integrations', category: 'Integration Hub' },
      { name: 'Workflow Builder', category: 'Workflow Automation' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
      { name: 'Notifications', category: 'Notifications' },
    ],
  },
  {
    name: 'Zoom',
    vendor: 'Zoom Video Communications',
    category: 'Video Conferencing',
    features: [
      { name: 'Video Meetings', category: 'Communication' },
      { name: 'Screen Sharing', category: 'Collaboration' },
      { name: 'Recording', category: 'Document Management' },
      { name: 'Breakout Rooms', category: 'Collaboration' },
      { name: 'Chat', category: 'Communication' },
      { name: 'Webinars', category: 'Communication' },
      { name: 'Calendar Integration', category: 'Calendar & Scheduling' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
    ],
  },
  {
    name: 'Tableau',
    vendor: 'Tableau Software',
    category: 'Business Intelligence',
    features: [
      { name: 'Data Visualization', category: 'Reporting & Analytics' },
      { name: 'Dashboards', category: 'Reporting & Analytics' },
      { name: 'Custom Reports', category: 'Reporting & Analytics' },
      { name: 'Data Connections', category: 'Integration Hub' },
      { name: 'Collaboration', category: 'Collaboration' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
    ],
  },
  {
    name: 'Power BI',
    vendor: 'Microsoft',
    category: 'Business Intelligence',
    features: [
      { name: 'Data Visualization', category: 'Reporting & Analytics' },
      { name: 'Dashboards', category: 'Reporting & Analytics' },
      { name: 'Custom Reports', category: 'Reporting & Analytics' },
      { name: 'Data Connections', category: 'Integration Hub' },
      { name: 'Collaboration', category: 'Collaboration' },
      { name: 'Mobile Apps', category: 'Mobile Access' },
      { name: 'AI Insights', category: 'Reporting & Analytics' },
    ],
  },
];

async function seedSoftwareCatalog() {
  console.log('\n🌱 Seeding software catalog with common enterprise tools...\n');

  for (const software of commonSoftware) {
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
    for (const feature of software.features) {
      // Get category ID
      const category = await sql`
        SELECT id FROM feature_categories WHERE category_name = ${feature.category} LIMIT 1
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
            ${feature.name},
            true,
            false
          )
          ON CONFLICT (software_catalog_id, feature_name) DO NOTHING
        `;
      }
    }

    console.log(`  ✅ Added ${software.features.length} features`);
  }

  console.log(`\n✅ Successfully seeded ${commonSoftware.length} software products!\n`);
}

// Run if called directly
if (require.main === module) {
  seedSoftwareCatalog()
    .then(() => {
      console.log('🎉 Seed complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedSoftwareCatalog };
