/**
 * Test Data Seeding Script for E2E Tests
 * Seeds database with test users, companies, and software data
 *
 * NOTE: Only import from this file when running seed/cleanup scripts.
 * For test constants, import from './test-constants' to avoid requiring DATABASE_URL.
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { TEST_USERS, TEST_COMPANIES, TEST_SOFTWARE } from './test-constants';

// Re-export constants for backward compatibility
export { TEST_USERS, TEST_COMPANIES, TEST_SOFTWARE };

// Lazy initialization of database connection
let sql: ReturnType<typeof neon> | null = null;

function getDbConnection() {
  if (!sql) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(DATABASE_URL);
  }
  return sql;
}

/**
 * Clean up existing test data
 */
export async function cleanupTestData() {
  console.log('🧹 Cleaning up existing test data...');

  try {
    const db = getDbConnection();
    // Delete in order of foreign key dependencies
    await db`DELETE FROM usage_analytics WHERE software_id LIKE 'test-%'`;
    await db`DELETE FROM alternatives WHERE software_id LIKE 'test-%'`;
    await db`DELETE FROM software WHERE id LIKE 'test-%' OR company_id LIKE 'test-%'`;
    await db`DELETE FROM users WHERE id LIKE 'test-%'`;
    await db`DELETE FROM companies WHERE id LIKE 'test-%'`;

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
  const db = getDbConnection();

  for (const company of TEST_COMPANIES) {
    await db`
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
  const db = getDbConnection();

  for (const [key, user] of Object.entries(TEST_USERS)) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const companyId = 'company_id' in user ? user.company_id : null;

    await db`
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
  const db = getDbConnection();

  for (const software of TEST_SOFTWARE) {
    await db`
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
    await db`
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
  const command = process.argv[2];

  if (command === 'cleanup') {
    cleanupTestData()
      .then(() => {
        console.log('\n✅ Cleanup complete!\n');
        process.exit(0);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    seedTestData()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}
