/**
 * DEV API: Seed Redundancy Test Data
 * POST /api/dev/seed-redundancy
 *
 * Creates test software with overlapping features for redundancy analysis testing
 */

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Software with intentional feature overlaps
const TEST_SOFTWARE = [
  {
    name: 'Asana',
    vendor: 'Asana',
    category: 'Project Management',
    annual_cost: 48000,
    license_count: 100,
    features: [
      'Task Management', 'Subtasks', 'Task Dependencies', 'Due Dates',
      'Calendar View', 'Timeline View', 'Board View', 'Project Templates',
      'Workflow Automation', 'Custom Fields', 'File Attachments',
      'Team Collaboration', 'Mobile Apps', 'Reporting & Dashboards',
    ],
  },
  {
    name: 'Monday.com',
    vendor: 'monday.com',
    category: 'Project Management',
    annual_cost: 60000,
    license_count: 120,
    features: [
      'Task Management', 'Subtasks', 'Task Dependencies', 'Kanban Boards',
      'Gantt Charts', 'Calendar View', 'Timeline View', 'Workflow Automation',
      'Time Tracking', 'Resource Management', 'Team Collaboration', 'Mobile Apps',
    ],
  },
  {
    name: 'Jira',
    vendor: 'Atlassian',
    category: 'Project Management',
    annual_cost: 55000,
    license_count: 150,
    features: [
      'Issue Tracking', 'Sprint Planning', 'Kanban Boards', 'Roadmaps',
      'Custom Workflows', 'Custom Fields', 'Task Management',
      'Workflow Automation', 'Time Tracking', 'Mobile Apps',
    ],
  },
  {
    name: 'Slack',
    vendor: 'Slack Technologies',
    category: 'Communication',
    annual_cost: 36000,
    license_count: 200,
    features: [
      'Team Chat', 'Direct Messages', 'Channels', 'Video Calls',
      'Screen Sharing', 'File Sharing', 'Workflow Automation', 'Mobile Apps',
    ],
  },
  {
    name: 'Microsoft Teams',
    vendor: 'Microsoft',
    category: 'Communication',
    annual_cost: 42000,
    license_count: 200,
    features: [
      'Team Chat', 'Direct Messages', 'Channels', 'Video Calls',
      'Screen Sharing', 'File Sharing', 'Calendar Integration',
      'Task Management', 'Mobile Apps',
    ],
  },
  {
    name: 'Zoom',
    vendor: 'Zoom Video Communications',
    category: 'Video Conferencing',
    annual_cost: 25000,
    license_count: 180,
    features: [
      'Video Meetings', 'Video Calls', 'Screen Sharing',
      'Recording', 'Breakout Rooms', 'Calendar Integration', 'Mobile Apps',
    ],
  },
  {
    name: 'Tableau',
    vendor: 'Tableau Software',
    category: 'Business Intelligence',
    annual_cost: 72000,
    license_count: 50,
    features: [
      'Data Visualization', 'Dashboards', 'Custom Reports',
      'Data Connections', 'Collaboration', 'Mobile Apps',
    ],
  },
  {
    name: 'Power BI',
    vendor: 'Microsoft',
    category: 'Business Intelligence',
    annual_cost: 45000,
    license_count: 60,
    features: [
      'Data Visualization', 'Dashboards', 'Custom Reports',
      'Data Connections', 'Collaboration', 'AI Insights', 'Mobile Apps',
    ],
  },
];

const FEATURE_CATEGORY_MAP: Record<string, string> = {
  'Task Management': 'Task Management',
  'Subtasks': 'Task Management',
  'Task Dependencies': 'Task Management',
  'Due Dates': 'Calendar & Scheduling',
  'Calendar View': 'Calendar & Scheduling',
  'Calendar Integration': 'Calendar & Scheduling',
  'Timeline View': 'Project Planning',
  'Gantt Charts': 'Project Planning',
  'Roadmaps': 'Project Planning',
  'Sprint Planning': 'Project Planning',
  'Board View': 'Task Management',
  'Kanban Boards': 'Task Management',
  'Project Templates': 'Templates',
  'Workflow Automation': 'Workflow Automation',
  'Custom Workflows': 'Workflow Automation',
  'Custom Fields': 'Customization',
  'File Attachments': 'Document Management',
  'File Sharing': 'Document Management',
  'Recording': 'Document Management',
  'Team Collaboration': 'Collaboration',
  'Collaboration': 'Collaboration',
  'Channels': 'Collaboration',
  'Breakout Rooms': 'Collaboration',
  'Screen Sharing': 'Collaboration',
  'Mobile Apps': 'Mobile Access',
  'Reporting & Dashboards': 'Reporting & Analytics',
  'Dashboards': 'Reporting & Analytics',
  'Custom Reports': 'Reporting & Analytics',
  'Data Visualization': 'Reporting & Analytics',
  'AI Insights': 'Reporting & Analytics',
  'Team Chat': 'Communication',
  'Direct Messages': 'Communication',
  'Video Calls': 'Communication',
  'Video Meetings': 'Communication',
  'Data Connections': 'Integration Hub',
  'Time Tracking': 'Time Tracking',
  'Resource Management': 'Resource Management',
  'Issue Tracking': 'Task Management',
};

async function getOrCreateFeatureCategory(categoryName: string): Promise<string> {
  const mappedCategory = FEATURE_CATEGORY_MAP[categoryName] || 'Other';

  const result = await sql`
    INSERT INTO feature_categories (category_name)
    VALUES (${mappedCategory})
    ON CONFLICT (category_name) DO UPDATE SET category_name = EXCLUDED.category_name
    RETURNING id
  `;

  return result[0].id;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    console.log(`\n🌱 Seeding redundancy test data for company: ${companyId}\n`);

    let totalSoftware = 0;
    let totalFeatures = 0;

    for (const item of TEST_SOFTWARE) {
      console.log(`📦 Processing: ${item.name}`);

      // Insert software
      const softwareResult = await sql`
        INSERT INTO software (
          company_id, software_name, vendor_name, category,
          annual_cost, license_count, status,
          contract_start_date, contract_end_date,
          created_at, updated_at
        ) VALUES (
          ${companyId},
          ${item.name},
          ${item.vendor},
          ${item.category},
          ${item.annual_cost},
          ${item.license_count},
          'Active',
          NOW() - INTERVAL '6 months',
          NOW() + INTERVAL '6 months',
          NOW(),
          NOW()
        )
        ON CONFLICT (company_id, software_name)
        DO UPDATE SET
          annual_cost = EXCLUDED.annual_cost,
          license_count = EXCLUDED.license_count,
          updated_at = NOW()
        RETURNING id
      `;

      const softwareId = softwareResult[0].id;
      totalSoftware++;

      // Add features
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

          totalFeatures++;
        } catch (error) {
          console.error(`  ⚠️  Failed to add feature "${featureName}":`, error);
        }
      }

      console.log(`  ✅ Added ${item.features.length} features`);
    }

    console.log(`\n✅ Successfully seeded ${totalSoftware} software products with ${totalFeatures} features!\n`);

    return NextResponse.json({
      success: true,
      message: `Seeded ${totalSoftware} software products with ${totalFeatures} total features`,
      data: {
        softwareCount: totalSoftware,
        featureCount: totalFeatures,
        products: TEST_SOFTWARE.map(s => s.name),
      },
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Seeding failed',
      },
      { status: 500 }
    );
  }
}
