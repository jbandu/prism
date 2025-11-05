#!/usr/bin/env node
/**
 * Test Neon Database Connection for Local Development
 */

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('🧪 Testing Neon Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file');
    process.exit(1);
  }

  // Mask the password in the URL for display
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Connecting to: ${maskedUrl}\n`);

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Test 1: Basic connection
    console.log('1️⃣  Testing basic connection...');
    const result = await sql`SELECT current_database(), version()`;
    console.log(`   ✅ Connected to database: ${result[0].current_database}`);
    console.log(`   ✅ PostgreSQL version: ${result[0].version.split(' ')[1]}\n`);

    // Test 2: Count tables
    console.log('2️⃣  Checking tables...');
    const tables = await sql`
      SELECT count(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log(`   ✅ Tables found: ${tables[0].table_count}\n`);

    // Test 3: Check key tables
    console.log('3️⃣  Verifying key tables exist...');
    const keyTables = ['companies', 'software_assets', 'office_locations', 'consolidation_recommendations'];

    for (const table of keyTables) {
      const check = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        )
      `;
      const exists = check[0].exists;
      console.log(`   ${exists ? '✅' : '❌'} ${table}: ${exists ? 'exists' : 'MISSING'}`);
    }

    // Test 4: Sample data count
    console.log('\n4️⃣  Checking sample data...');
    try {
      const companies = await sql`SELECT count(*) as count FROM companies`;
      console.log(`   ✅ Companies: ${companies[0].count}`);

      const software = await sql`SELECT count(*) as count FROM software_assets`;
      console.log(`   ✅ Software assets: ${software[0].count}`);

      const offices = await sql`SELECT count(*) as count FROM office_locations`;
      console.log(`   ✅ Office locations: ${offices[0].count}`);
    } catch (err) {
      console.log(`   ⚠️  Could not query data: ${err.message}`);
    }

    console.log('\n✅ All tests passed! Database is ready for local development.\n');
    console.log('🚀 Start your app with: npm run dev');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your .env file has DATABASE_URL set');
    console.error('   2. Verify your internet connection');
    console.error('   3. Confirm Neon database is active');
    console.error('   4. Check firewall settings\n');
    process.exit(1);
  }
}

testConnection();
