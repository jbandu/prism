/**
 * Test Data Seeding Script for E2E Tests
 * Seeds database with test users, companies, and software data
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

// Test data constants
export const TEST_USERS = {
  admin: {
    id: 'test-admin-001',
    email: 'test-admin@prism.test',
    password: 'TestAdmin123!',
    full_name: 'Test Admin',
    role: 'admin',
  },
  companyManager: {
    id: 'test-manager-001',
    email: 'test-manager@acmecorp.test',
    password: 'TestManager123!',
    full_name: 'John Manager',
    role: 'company_manager',
    company_id: 'test-company-acme',
  },
  viewer: {
    id: 'test-viewer-001',
    email: 'test-viewer@acmecorp.test',
    password: 'TestViewer123!',
    full_name: 'Jane Viewer',
    role: 'viewer',
    company_id: 'test-company-acme',
  },
};

export const TEST_COMPANIES = [
  {
    id: 'test-company-acme',
    slug: 'acme-corp',
    company_name: 'Acme Corporation',
    industry: 'Technology',
    employee_count: 500,
    primary_contact_name: 'John Manager',
    primary_contact_email: 'test-manager@acmecorp.test',
    contract_status: 'active',
  },
  {
    id: 'test-company-techstart',
    slug: 'techstart',
    company_name: 'TechStart Inc',
    industry: 'SaaS',
    employee_count: 150,
    primary_contact_name: 'Sarah Johnson',
    primary_contact_email: 'sarah@techstart.test',
    contract_status: 'active',
  },
  {
    id: 'test-company-prospect',
    slug: 'prospect-co',
    company_name: 'Prospect Company',
    industry: 'Finance',
    employee_count: 1000,
    primary_contact_name: 'Bob Smith',
    primary_contact_email: 'bob@prospect.test',
    contract_status: 'prospect',
  },
];

export const TEST_SOFTWARE = [
  {
    id: 'test-software-001',
    company_id: 'test-company-acme',
    software_name: 'Salesforce',
    vendor_name: 'Salesforce Inc',
    category: 'CRM',
    annual_cost: 120000,
    license_count: 100,
    active_users: 75,
    status: 'Active',
  },
  {
    id: 'test-software-002',
    company_id: 'test-company-acme',
    software_name: 'Slack',
    vendor_name: 'Slack Technologies',
    category: 'Communication',
    annual_cost: 24000,
    license_count: 200,
    active_users: 180,
    status: 'Active',
  },
  {
    id: 'test-software-003',
    company_id: 'test-company-acme',
    software_name: 'Zoom',
    vendor_name: 'Zoom Video Communications',
    category: 'Video Conferencing',
    annual_cost: 18000,
    license_count: 150,
    active_users: 60,
    status: 'Active',
  },
];

/**
 * Clean up existing test data
 */
export async function cleanupTestData() {
  console.log('🧹 Cleaning up existing test data...');

  try {
    // Delete in order of foreign key dependencies
    await sql`DELETE FROM usage_analytics WHERE software_id LIKE 'test-%'`;
    await sql`DELETE FROM alternatives WHERE software_id LIKE 'test-%'`;
    await sql`DELETE FROM software WHERE id LIKE 'test-%' OR company_id LIKE 'test-%'`;
    await sql`DELETE FROM users WHERE id LIKE 'test-%'`;
    await sql`DELETE FROM companies WHERE id LIKE 'test-%'`;

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Seed test companies
 */
async function seedCompanies() {
  console.log('🏢 Seeding test companies...');

  for (const company of TEST_COMPANIES) {
    await sql`
      INSERT INTO companies (
        id, slug, company_name, industry, employee_count,
        primary_contact_name, primary_contact_email, contract_status,
        created_at, updated_at
      ) VALUES (
        ${company.id},
        ${company.slug},
        ${company.company_name},
        ${company.industry},
        ${company.employee_count},
        ${company.primary_contact_name},
        ${company.primary_contact_email},
        ${company.contract_status},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        updated_at = NOW()
    `;
  }

  console.log(`  ✓ Created ${TEST_COMPANIES.length} companies`);
}

/**
 * Seed test users
 */
async function seedUsers() {
  console.log('👥 Seeding test users...');

  for (const [key, user] of Object.entries(TEST_USERS)) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const companyId = 'company_id' in user ? user.company_id : null;

    await sql`
      INSERT INTO users (
        id, email, password_hash, full_name, role,
        company_id, is_active, created_at, updated_at
      ) VALUES (
        ${user.id},
        ${user.email},
        ${passwordHash},
        ${user.full_name},
        ${user.role},
        ${companyId},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `;
  }

  console.log(`  ✓ Created ${Object.keys(TEST_USERS).length} users`);
}

/**
 * Seed test software
 */
async function seedSoftware() {
  console.log('💻 Seeding test software...');

  for (const software of TEST_SOFTWARE) {
    await sql`
      INSERT INTO software (
        id, company_id, software_name, vendor_name, category,
        annual_cost, license_count, status,
        contract_start_date, contract_end_date,
        created_at, updated_at
      ) VALUES (
        ${software.id},
        ${software.company_id},
        ${software.software_name},
        ${software.vendor_name},
        ${software.category},
        ${software.annual_cost},
        ${software.license_count},
        ${software.status},
        NOW() - INTERVAL '6 months',
        NOW() + INTERVAL '6 months',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        software_name = EXCLUDED.software_name,
        updated_at = NOW()
    `;

    // Add usage analytics
    await sql`
      INSERT INTO usage_analytics (
        id, software_id, reporting_period,
        active_users, total_licenses, utilization_percentage,
        wasted_licenses, waste_cost, created_at
      ) VALUES (
        ${`usage-${software.id}`},
        ${software.id},
        NOW(),
        ${software.active_users},
        ${software.license_count},
        ${(software.active_users / software.license_count * 100).toFixed(2)},
        ${software.license_count - software.active_users},
        ${((software.license_count - software.active_users) / software.license_count * software.annual_cost).toFixed(2)},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        active_users = EXCLUDED.active_users,
        utilization_percentage = EXCLUDED.utilization_percentage
    `;
  }

  console.log(`  ✓ Created ${TEST_SOFTWARE.length} software entries`);
}

/**
 * Main seed function
 */
export async function seedTestData() {
  console.log('\n🌱 Starting test data seeding...\n');

  try {
    await cleanupTestData();
    await seedCompanies();
    await seedUsers();
    await seedSoftware();

    console.log('\n✅ Test data seeding completed successfully!\n');
    console.log('📋 Test credentials:');
    console.log('  Admin:');
    console.log(`    Email: ${TEST_USERS.admin.email}`);
    console.log(`    Password: ${TEST_USERS.admin.password}`);
    console.log('  Company Manager:');
    console.log(`    Email: ${TEST_USERS.companyManager.email}`);
    console.log(`    Password: ${TEST_USERS.companyManager.password}`);
    console.log('  Viewer:');
    console.log(`    Email: ${TEST_USERS.viewer.email}`);
    console.log(`    Password: ${TEST_USERS.viewer.password}\n`);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
