/**
 * Check Test Data in Database
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000099';

async function checkTestData() {
  console.log('🔍 Checking test data in production database...\n');

  // Check test company
  const companies = await sql`
    SELECT id, company_name, slug
    FROM companies
    WHERE id = ${TEST_COMPANY_ID}
  `;
  console.log('📦 Test Company (acme-corp):');
  if (companies.length > 0) {
    console.log(`  ✅ Found: ${companies[0].company_name} (slug: ${companies[0].slug})`);
  } else {
    console.log(`  ❌ NOT FOUND - company with ID ${TEST_COMPANY_ID}`);
  }

  // Check software for test company
  const software = await sql`
    SELECT id, software_name, vendor_name, category
    FROM software
    WHERE company_id = ${TEST_COMPANY_ID}
    LIMIT 10
  `;
  console.log(`\n💿 Software for Test Company:`);
  if (software.length > 0) {
    console.log(`  ✅ Found ${software.length} software:`);
    software.forEach(s => {
      console.log(`     - ${s.software_name} by ${s.vendor_name} (${s.category || 'no category'})`);
    });
  } else {
    console.log(`  ❌ NO SOFTWARE FOUND for test company`);
  }

  // Check contracts for test company
  const contracts = await sql`
    SELECT contract_id, contract_name, vendor_id, status
    FROM contracts
    WHERE company_id = ${TEST_COMPANY_ID}
    LIMIT 5
  `;
  console.log(`\n📄 Contracts for Test Company:`);
  if (contracts.length > 0) {
    console.log(`  ✅ Found ${contracts.length} contracts:`);
    contracts.forEach(c => {
      console.log(`     - ${c.contract_name} (${c.status}) - vendor: ${c.vendor_id}`);
    });
  } else {
    console.log(`  ❌ NO CONTRACTS FOUND for test company`);
  }

  // Check locations
  const locations = await sql`
    SELECT id, location_name, city, country
    FROM locations
    WHERE company_id = ${TEST_COMPANY_ID}
    LIMIT 5
  `;
  console.log(`\n📍 Locations for Test Company:`);
  if (locations.length > 0) {
    console.log(`  ✅ Found ${locations.length} locations:`);
    locations.forEach(l => {
      console.log(`     - ${l.location_name} (${l.city}, ${l.country})`);
    });
  } else {
    console.log(`  ❌ NO LOCATIONS FOUND for test company`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Summary:');
  console.log('If any of the above show ❌, the E2E tests will fail because');
  console.log('they expect to find this data in the database.\n');
}

checkTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
