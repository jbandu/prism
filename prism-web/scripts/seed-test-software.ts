/**
 * Seed Test Software Data
 * Creates software products for the test company (Acme Corp) for E2E tests
 */
import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.DATABASE_URL!);

const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000099';

const TEST_SOFTWARE = [
  {
    software_name: 'Salesforce',
    vendor_name: 'Salesforce',
    category: 'CRM',
    annual_cost: 120000,
    license_count: 250,
    status: 'active',
  },
  {
    software_name: 'Slack',
    vendor_name: 'Slack Technologies',
    category: 'Communication',
    annual_cost: 48000,
    license_count: 500,
    status: 'active',
  },
  {
    software_name: 'Microsoft Teams',
    vendor_name: 'Microsoft',
    category: 'Communication',
    annual_cost: 36000,
    license_count: 500,
    status: 'active',
  },
  {
    software_name: 'Zoom',
    vendor_name: 'Zoom Video Communications',
    category: 'Video Conferencing',
    annual_cost: 24000,
    license_count: 500,
    status: 'active',
  },
  {
    software_name: 'HubSpot',
    vendor_name: 'HubSpot',
    category: 'CRM',
    annual_cost: 72000,
    license_count: 150,
    status: 'active',
  },
  {
    software_name: 'Jira',
    vendor_name: 'Atlassian',
    category: 'Project Management',
    annual_cost: 30000,
    license_count: 300,
    status: 'active',
  },
  {
    software_name: 'Asana',
    vendor_name: 'Asana',
    category: 'Project Management',
    annual_cost: 28000,
    license_count: 250,
    status: 'active',
  },
  {
    software_name: 'Monday.com',
    vendor_name: 'monday.com',
    category: 'Project Management',
    annual_cost: 32000,
    license_count: 200,
    status: 'active',
  },
  {
    software_name: 'Tableau',
    vendor_name: 'Salesforce (Tableau)',
    category: 'Analytics',
    annual_cost: 60000,
    license_count: 100,
    status: 'active',
  },
  {
    software_name: 'Power BI',
    vendor_name: 'Microsoft',
    category: 'Analytics',
    annual_cost: 42000,
    license_count: 150,
    status: 'active',
  },
];

async function seedTestSoftware() {
  console.log('🌱 Seeding test software data...\n');

  // Check if company exists
  const companies = await sql`
    SELECT id, company_name FROM companies WHERE id = ${TEST_COMPANY_ID}
  `;

  if (companies.length === 0) {
    console.error('❌ Test company not found!');
    process.exit(1);
  }

  console.log(`✅ Found test company: ${companies[0].company_name}`);

  // Delete existing test software
  const existing = await sql`
    SELECT COUNT(*) as count FROM software WHERE company_id = ${TEST_COMPANY_ID}
  `;

  if (existing[0].count > 0) {
    console.log(`\n🗑️  Deleting ${existing[0].count} existing software records...`);
    await sql`DELETE FROM software WHERE company_id = ${TEST_COMPANY_ID}`;
  }

  // Insert test software
  console.log('\n📦 Creating test software:\n');

  for (const software of TEST_SOFTWARE) {
    const id = uuidv4();

    await sql`
      INSERT INTO software (
        id,
        company_id,
        software_name,
        vendor_name,
        category,
        annual_cost,
        license_count,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${id},
        ${TEST_COMPANY_ID},
        ${software.software_name},
        ${software.vendor_name},
        ${software.category},
        ${software.annual_cost},
        ${software.license_count},
        ${software.status},
        NOW(),
        NOW()
      )
    `;

    console.log(`  ✅ ${software.software_name} by ${software.vendor_name} ($${software.annual_cost.toLocaleString()}/year)`);
  }

  // Verify
  const count = await sql`
    SELECT COUNT(*) as count FROM software WHERE company_id = ${TEST_COMPANY_ID}
  `;

  console.log(`\n✅ Successfully seeded ${count[0].count} software products!`);
  console.log('\n📊 Categories created:');

  const categories = await sql`
    SELECT category, COUNT(*) as count
    FROM software
    WHERE company_id = ${TEST_COMPANY_ID}
    GROUP BY category
    ORDER BY count DESC
  `;

  categories.forEach(cat => {
    console.log(`  - ${cat.category}: ${cat.count} products`);
  });

  console.log('\n💰 Total annual cost:',
    TEST_SOFTWARE.reduce((sum, s) => sum + s.annual_cost, 0).toLocaleString(), 'USD');
}

seedTestSoftware()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
