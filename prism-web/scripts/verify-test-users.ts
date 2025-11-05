/**
 * Verify Test Users Can Authenticate
 * Checks if test users exist and can authenticate with their passwords
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

const TEST_USERS = {
  admin: {
    email: 'test-admin@prism.test',
    password: 'TestAdmin123!',
  },
  manager: {
    email: 'test-manager@acmecorp.test',
    password: 'TestManager123!',
  },
  viewer: {
    email: 'test-viewer@acmecorp.test',
    password: 'TestViewer123!',
  },
};

async function verifyTestUsers() {
  console.log('🔍 Verifying test users can authenticate...\n');

  for (const [role, testUser] of Object.entries(TEST_USERS)) {
    console.log(`Checking ${role}: ${testUser.email}`);

    const users = await sql`
      SELECT id, email, password_hash, is_active, role, company_id
      FROM users
      WHERE email = ${testUser.email}
    `;

    if (users.length === 0) {
      console.log(`  ❌ User NOT FOUND in database\n`);
      continue;
    }

    const user = users[0];
    console.log(`  ✅ User found in database`);
    console.log(`     ID: ${user.id}`);
    console.log(`     Role: ${user.role}`);
    console.log(`     Active: ${user.is_active}`);
    console.log(`     Company ID: ${user.company_id || 'none'}`);
    console.log(`     Password hash: ${user.password_hash?.substring(0, 20)}...`);

    // Verify password
    if (!user.password_hash) {
      console.log(`  ❌ No password hash stored!\n`);
      continue;
    }

    const passwordMatch = await bcrypt.compare(testUser.password, user.password_hash);
    if (passwordMatch) {
      console.log(`  ✅ Password "${testUser.password}" matches hash`);
    } else {
      console.log(`  ❌ Password "${testUser.password}" does NOT match hash`);
    }

    // Check if user can authenticate
    if (!user.is_active) {
      console.log(`  ⚠️  User is INACTIVE - login will fail`);
    }

    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📋 Summary:');
  console.log('If all users show ✅ for "User found" and "Password matches",');
  console.log('and is_active = true, then authentication SHOULD work.\n');
}

verifyTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
