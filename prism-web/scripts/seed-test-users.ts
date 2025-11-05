/**
 * Seed Test Users for E2E Testing
 * Creates test users and test company in production database
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

// Test data from e2e/fixtures/test-constants.ts
// Using proper UUIDs for database compatibility
const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test-admin@prism.test',
    password: 'TestAdmin123!',
    full_name: 'Test Admin',
    role: 'admin',
  },
  companyManager: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'test-manager@acmecorp.test',
    password: 'TestManager123!',
    full_name: 'John Manager',
    role: 'client',
    company_id: '00000000-0000-0000-0000-000000000099',
  },
  viewer: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'test-viewer@acmecorp.test',
    password: 'TestViewer123!',
    full_name: 'Jane Viewer',
    role: 'viewer',
    company_id: '00000000-0000-0000-0000-000000000099',
  },
};

const TEST_COMPANY = {
  id: '00000000-0000-0000-0000-000000000099',
  slug: 'acme-corp',
  company_name: 'Acme Corporation (TEST)',
  industry: 'Technology',
  employee_count: 500,
  primary_contact_name: 'John Manager',
  primary_contact_email: 'test-manager@acmecorp.test',
  contract_status: 'active',
};

async function seedTestUsers() {
  console.log('🌱 Seeding test users for E2E testing...\n');

  try {
    // 1. Create test company
    console.log('📦 Creating test company...');
    const existingCompany = await sql`
      SELECT id FROM companies WHERE id = ${TEST_COMPANY.id}
    `;

    if (existingCompany.length === 0) {
      await sql`
        INSERT INTO companies (
          id,
          slug,
          company_name,
          industry,
          employee_count,
          primary_contact_name,
          primary_contact_email,
          contract_status
        ) VALUES (
          ${TEST_COMPANY.id},
          ${TEST_COMPANY.slug},
          ${TEST_COMPANY.company_name},
          ${TEST_COMPANY.industry},
          ${TEST_COMPANY.employee_count},
          ${TEST_COMPANY.primary_contact_name},
          ${TEST_COMPANY.primary_contact_email},
          ${TEST_COMPANY.contract_status}
        )
      `;
      console.log(`   ✅ Created company: ${TEST_COMPANY.company_name}\n`);
    } else {
      console.log(`   ℹ️  Company already exists: ${TEST_COMPANY.company_name}\n`);
    }

    // 2. Create test users
    console.log('👥 Creating test users...');

    for (const [role, user] of Object.entries(TEST_USERS)) {
      console.log(`   Creating ${role}: ${user.email}`);

      // Check if user exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;

      if (existingUser.length > 0) {
        console.log(`      ⚠️  User already exists, skipping`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      await sql`
        INSERT INTO users (
          id,
          email,
          password_hash,
          full_name,
          role,
          company_id
        ) VALUES (
          ${user.id},
          ${user.email},
          ${hashedPassword},
          ${user.full_name},
          ${user.role},
          ${user.company_id || null}
        )
      `;

      console.log(`      ✅ Created ${role}`);
    }

    console.log('\n📋 Test Users Summary:');
    console.log('='.repeat(70));
    console.log(`  Admin:           ${TEST_USERS.admin.email}`);
    console.log(`  Password:        ${TEST_USERS.admin.password}`);
    console.log('');
    console.log(`  Company Manager: ${TEST_USERS.companyManager.email}`);
    console.log(`  Password:        ${TEST_USERS.companyManager.password}`);
    console.log('');
    console.log(`  Viewer:          ${TEST_USERS.viewer.email}`);
    console.log(`  Password:        ${TEST_USERS.viewer.password}`);
    console.log('='.repeat(70));

    console.log('\n✅ Test users seeded successfully!');
    console.log('\n📝 Note: These users are for E2E testing only.');
    console.log('   They can be identified by the .test email domain.');

    // Verify users were created
    const allTestUsers = await sql`
      SELECT email, role, full_name
      FROM users
      WHERE email LIKE '%@%.test'
      ORDER BY role
    `;

    console.log('\n🔍 Verification - All test users in database:');
    allTestUsers.forEach(u => {
      console.log(`   ${u.role.padEnd(20)} ${u.email.padEnd(35)} ${u.full_name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    throw error;
  }
}

// Run the seeding
seedTestUsers()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
