/**
 * Seed Test Data for Redundancy Analysis
 * Creates a test company with multiple software products that have overlapping features
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

const TEST_COMPANY_ID = 'demo-company-001';
const TEST_COMPANY_SLUG = 'demo-corp';

// Software with intentional feature overlaps for redundancy testing
const testSoftwareWithFeatures = [
  {
    software: {
      name: 'Asana',
      vendor: 'Asana',
      category: 'Project Management',
      annual_cost: 48000,
      license_count: 100,
      status: 'Active',
    },
    features: [
      'Task Management',
      'Subtasks',
      'Task Dependencies',
      'Task Comments',
      'Due Dates',
      'Calendar View',
      'Timeline View',
      'Board View',
      'List View',
      'Project Templates',
      'Workflow Automation',
      'Custom Fields',
      'File Attachments',
      'Team Collaboration',
      'Email Integration',
      'Mobile Apps',
      'Reporting & Dashboards',
    ],
  },
  {
    software: {
      name: 'Monday.com',
      vendor: 'monday.com',
      category: 'Project Management',
      annual_cost: 60000,
      license_count: 120,
      status: 'Active',
    },
    features: [
      'Task Management', // OVERLAP with Asana
      'Subtasks', // OVERLAP with Asana
      'Task Dependencies', // OVERLAP with Asana
      'Kanban Boards',
      'Gantt Charts',
      'Calendar View', // OVERLAP with Asana
      'Timeline View', // OVERLAP with Asana
      'Form Builder',
      'Workflow Automation', // OVERLAP with Asana
      'Custom Dashboards',
      'Time Tracking',
      'Budget Tracking',
      'Resource Management',
      'File Storage',
      'Team Collaboration', // OVERLAP with Asana
      'Mobile Apps', // OVERLAP with Asana
    ],
  },
  {
    software: {
      name: 'Jira',
      vendor: 'Atlassian',
      category: 'Project Management',
      annual_cost: 55000,
      license_count: 150,
      status: 'Active',
    },
    features: [
      'Issue Tracking',
      'Sprint Planning',
      'Backlog Management',
      'Agile Boards',
      'Kanban Boards',
      'Scrum Boards',
      'Roadmaps',
      'Custom Workflows',
      'Custom Fields', // OVERLAP with Asana
      'Task Management', // OVERLAP with Asana, Monday
      'Workflow Automation', // OVERLAP with Asana, Monday
      'Time Tracking', // OVERLAP with Monday
      'Mobile Apps', // OVERLAP with Asana, Monday
    ],
  },
  {
    software: {
      name: 'Slack',
      vendor: 'Slack Technologies',
      category: 'Communication',
      annual_cost: 36000,
      license_count: 200,
      status: 'Active',
    },
    features: [
      'Team Chat',
      'Direct Messages',
      'Channels',
      'Video Calls',
      'Screen Sharing',
      'File Sharing',
      'Search',
      'Workflow Builder',
      'Workflow Automation', // OVERLAP with PM tools
      'Mobile Apps', // OVERLAP
      'Notifications',
    ],
  },
  {
    software: {
      name: 'Microsoft Teams',
      vendor: 'Microsoft',
      category: 'Communication',
      annual_cost: 42000,
      license_count: 200,
      status: 'Active',
    },
    features: [
      'Team Chat', // OVERLAP with Slack
      'Direct Messages', // OVERLAP with Slack
      'Channels', // OVERLAP with Slack
      'Video Calls', // OVERLAP with Slack, Zoom
      'Screen Sharing', // OVERLAP with Slack, Zoom
      'File Sharing', // OVERLAP with Slack
      'Calendar Integration',
      'Task Management', // OVERLAP with PM tools
      'Mobile Apps', // OVERLAP
      'Notifications', // OVERLAP with Slack
    ],
  },
  {
    software: {
      name: 'Zoom',
      vendor: 'Zoom Video Communications',
      category: 'Video Conferencing',
      annual_cost: 25000,
      license_count: 180,
      status: 'Active',
    },
    features: [
      'Video Meetings',
      'Video Calls', // OVERLAP with Slack, Teams
      'Screen Sharing', // OVERLAP with Slack, Teams
      'Recording',
      'Breakout Rooms',
      'Chat',
      'Webinars',
      'Calendar Integration',
      'Mobile Apps', // OVERLAP
    ],
  },
  {
    software: {
      name: 'Tableau',
      vendor: 'Tableau Software',
      category: 'Business Intelligence',
      annual_cost: 72000,
      license_count: 50,
      status: 'Active',
    },
    features: [
      'Data Visualization',
      'Dashboards',
      'Custom Reports',
      'Data Connections',
      'Collaboration',
      'Reporting & Analytics',
      'Mobile Apps', // OVERLAP
    ],
  },
  {
    software: {
      name: 'Power BI',
      vendor: 'Microsoft',
      category: 'Business Intelligence',
      annual_cost: 45000,
      license_count: 60,
      status: 'Active',
    },
    features: [
      'Data Visualization', // OVERLAP with Tableau
      'Dashboards', // OVERLAP with Tableau
      'Custom Reports', // OVERLAP with Tableau
      'Data Connections', // OVERLAP with Tableau
      'Collaboration', // OVERLAP with Tableau
      'Reporting & Analytics', // OVERLAP with Tableau
      'Mobile Apps', // OVERLAP
      'AI Insights',
    ],
  },
];

async function createTestCompany() {
  console.log('\n🏢 Creating test company...');

  await sql`
    INSERT INTO companies (
      id, slug, company_name, industry, employee_count,
      primary_contact_name, primary_contact_email, contract_status,
      created_at, updated_at
    ) VALUES (
      ${TEST_COMPANY_ID},
      ${TEST_COMPANY_SLUG},
      'Demo Corporation',
      'Technology',
      500,
      'Demo Admin',
      'admin@democorp.test',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      updated_at = NOW()
  `;

  console.log('  ✅ Test company created');
}

async function getOrCreateFeatureCategory(categoryName: string): Promise<string> {
  // Map common feature names to their categories
  const categoryMapping: Record<string, string> = {
    'Task Management': 'Task Management',
    'Subtasks': 'Task Management',
    'Task Dependencies': 'Task Management',
    'Task Comments': 'Task Management',
    'Due Dates': 'Calendar & Scheduling',
    'Calendar View': 'Calendar & Scheduling',
    'Calendar Integration': 'Calendar & Scheduling',
    'Timeline View': 'Project Planning',
    'Gantt Charts': 'Project Planning',
    'Roadmaps': 'Project Planning',
    'Sprint Planning': 'Project Planning',
    'Board View': 'Task Management',
    'List View': 'Task Management',
    'Kanban Boards': 'Task Management',
    'Agile Boards': 'Task Management',
    'Scrum Boards': 'Task Management',
    'Project Templates': 'Templates',
    'Workflow Automation': 'Workflow Automation',
    'Custom Workflows': 'Workflow Automation',
    'Custom Fields': 'Customization',
    'Form Builder': 'Customization',
    'File Attachments': 'Document Management',
    'File Storage': 'Document Management',
    'File Sharing': 'Document Management',
    'Recording': 'Document Management',
    'Team Collaboration': 'Collaboration',
    'Collaboration': 'Collaboration',
    'Channels': 'Collaboration',
    'Breakout Rooms': 'Collaboration',
    'Email Integration': 'Integration Hub',
    'Data Connections': 'Integration Hub',
    'Mobile Apps': 'Mobile Access',
    'Reporting & Dashboards': 'Reporting & Analytics',
    'Custom Dashboards': 'Reporting & Analytics',
    'Dashboards': 'Reporting & Analytics',
    'Custom Reports': 'Reporting & Analytics',
    'Reporting & Analytics': 'Reporting & Analytics',
    'Data Visualization': 'Reporting & Analytics',
    'AI Insights': 'Reporting & Analytics',
    'Team Chat': 'Communication',
    'Direct Messages': 'Communication',
    'Video Calls': 'Communication',
    'Video Meetings': 'Communication',
    'Chat': 'Communication',
    'Webinars': 'Communication',
    'Screen Sharing': 'Collaboration',
    'Search': 'Search & Filter',
    'Workflow Builder': 'Workflow Automation',
    'Notifications': 'Notifications',
    'Time Tracking': 'Time Tracking',
    'Budget Tracking': 'Budget & Finance',
    'Resource Management': 'Resource Management',
    'Issue Tracking': 'Task Management',
    'Backlog Management': 'Task Management',
  };

  const mappedCategory = categoryMapping[categoryName] || 'Other';

  const result = await sql`
    INSERT INTO feature_categories (category_name)
    VALUES (${mappedCategory})
    ON CONFLICT (category_name) DO UPDATE SET category_name = EXCLUDED.category_name
    RETURNING id
  `;

  return result[0].id;
}

async function seedSoftwareWithFeatures() {
  console.log('\n💻 Seeding software products with features...\n');

  for (const item of testSoftwareWithFeatures) {
    console.log(`📦 Processing: ${item.software.name}`);

    // Insert software
    const softwareResult = await sql`
      INSERT INTO software (
        company_id, software_name, vendor_name, category,
        annual_cost, license_count, status,
        contract_start_date, contract_end_date,
        created_at, updated_at
      ) VALUES (
        ${TEST_COMPANY_ID},
        ${item.software.name},
        ${item.software.vendor},
        ${item.software.category},
        ${item.software.annual_cost},
        ${item.software.license_count},
        ${item.software.status},
        NOW() - INTERVAL '6 months',
        NOW() + INTERVAL '6 months',
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, software_name)
      DO UPDATE SET
        annual_cost = EXCLUDED.annual_cost,
        updated_at = NOW()
      RETURNING id
    `;

    const softwareId = softwareResult[0].id;

    // Add features
    let featureCount = 0;
    for (const featureName of item.features) {
      try {
        const categoryId = await getOrCreateFeatureCategory(featureName);

        await sql`
          INSERT INTO software_features_mapping (
            software_id,
            feature_category_id,
            feature_name
          ) VALUES (
            ${softwareId},
            ${categoryId},
            ${featureName}
          )
          ON CONFLICT (software_id, feature_name) DO NOTHING
        `;

        featureCount++;
      } catch (error) {
        console.error(`    ⚠️  Failed to add feature "${featureName}":`, error);
      }
    }

    console.log(`  ✅ Added ${featureCount} features`);
  }

  console.log(`\n✅ Successfully seeded ${testSoftwareWithFeatures.length} software products!\n`);
}

async function printSummary() {
  const softwareCount = await sql`
    SELECT COUNT(*) as count FROM software WHERE company_id = ${TEST_COMPANY_ID}
  `;

  const featureCount = await sql`
    SELECT COUNT(*) as count
    FROM software_features_mapping sfm
    JOIN software s ON sfm.software_id = s.id
    WHERE s.company_id = ${TEST_COMPANY_ID}
  `;

  console.log('\n📊 Summary:');
  console.log(`  Company ID: ${TEST_COMPANY_ID}`);
  console.log(`  Company Slug: ${TEST_COMPANY_SLUG}`);
  console.log(`  Software Products: ${softwareCount[0].count}`);
  console.log(`  Total Features: ${featureCount[0].count}`);
  console.log('\n🎯 Next Steps:');
  console.log(`  1. Login to your application`);
  console.log(`  2. Navigate to: /${TEST_COMPANY_SLUG}/redundancy`);
  console.log(`  3. Click "Run Analysis" or "Re-analyze Portfolio"`);
  console.log(`  4. View the redundancy analysis results!\n`);
}

async function seedRedundancyTestData() {
  console.log('\n🌱 Seeding Redundancy Analysis Test Data...\n');

  try {
    await createTestCompany();
    await seedSoftwareWithFeatures();
    await printSummary();

    console.log('✅ Redundancy test data seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedRedundancyTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedRedundancyTestData };
