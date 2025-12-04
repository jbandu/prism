/**
 * Database Loader Script for Bio-Rad Software Data
 *
 * This script loads the prepared software data into the PostgreSQL database.
 * Run with: DATABASE_URL="your_connection_string" node db_loader.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.log('Usage: DATABASE_URL="postgresql://..." node db_loader.js');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function getCompanies() {
  const result = await sql`SELECT id, company_name, slug FROM companies ORDER BY company_name`;
  return result;
}

async function getOrCreateBioRadCompany() {
  // First check if Bio-Rad exists
  let result = await sql`
    SELECT id, company_name FROM companies
    WHERE company_name ILIKE '%bio-rad%' OR company_name ILIKE '%biorad%'
  `;

  if (result.length > 0) {
    console.log(`Found existing company: ${result[0].company_name} (${result[0].id})`);
    return result[0].id;
  }

  // Create Bio-Rad company
  console.log('Creating Bio-Rad Laboratories company...');
  result = await sql`
    INSERT INTO companies (company_name, slug, industry, employee_count)
    VALUES ('Bio-Rad Laboratories', 'bio-rad', 'Life Sciences', 8000)
    RETURNING id, company_name
  `;

  console.log(`Created company: ${result[0].company_name} (${result[0].id})`);
  return result[0].id;
}

async function loadSoftwareData(companyId, softwareData) {
  let imported = 0;
  let updated = 0;
  let errors = [];

  for (const item of softwareData) {
    try {
      // Upsert software record
      const result = await sql`
        INSERT INTO software (
          company_id,
          software_name,
          vendor_name,
          category,
          product_description,
          total_annual_cost,
          total_licenses,
          active_users,
          utilization_rate,
          license_type,
          renewal_date,
          contract_status
        ) VALUES (
          ${companyId},
          ${item.software_name},
          ${item.vendor_name},
          ${item.category},
          ${item.product_description || null},
          ${item.total_annual_cost},
          ${item.total_licenses},
          ${item.active_users},
          ${item.total_licenses > 0 ? (item.active_users / item.total_licenses * 100) : 0},
          ${item.license_type},
          ${item.renewal_date},
          'active'
        )
        ON CONFLICT (company_id, software_name, vendor_name)
        DO UPDATE SET
          category = EXCLUDED.category,
          product_description = COALESCE(EXCLUDED.product_description, software.product_description),
          total_annual_cost = EXCLUDED.total_annual_cost,
          total_licenses = EXCLUDED.total_licenses,
          active_users = EXCLUDED.active_users,
          utilization_rate = EXCLUDED.utilization_rate,
          license_type = EXCLUDED.license_type,
          renewal_date = EXCLUDED.renewal_date,
          updated_at = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      if (result[0]?.inserted) {
        imported++;
      } else {
        updated++;
      }

      process.stdout.write(`\rProcessed: ${imported + updated}/${softwareData.length}`);
    } catch (error) {
      errors.push({ software: item.software_name, error: error.message });
    }
  }

  console.log('\n');
  return { imported, updated, errors };
}

async function main() {
  try {
    console.log('=== Bio-Rad Software Data Loader ===\n');

    // List existing companies
    console.log('Existing companies in database:');
    const companies = await getCompanies();
    if (companies.length === 0) {
      console.log('  (none)');
    } else {
      companies.forEach(c => console.log(`  - ${c.company_name} (${c.slug})`));
    }
    console.log('');

    // Get or create Bio-Rad company
    const companyId = await getOrCreateBioRadCompany();
    console.log(`Using company ID: ${companyId}\n`);

    // Read prepared data
    const dataPath = path.join(__dirname, 'biorad_software_import_ready.json');
    console.log(`Reading data from: ${dataPath}`);
    const softwareData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`Found ${softwareData.length} software entries to load\n`);

    // Load data
    console.log('Loading software data...');
    const { imported, updated, errors } = await loadSoftwareData(companyId, softwareData);

    // Print summary
    console.log('=== Summary ===');
    console.log(`New records inserted: ${imported}`);
    console.log(`Records updated: ${updated}`);
    console.log(`Total processed: ${imported + updated}`);

    if (errors.length > 0) {
      console.log(`\nErrors (${errors.length}):`);
      errors.forEach(e => console.log(`  - ${e.software}: ${e.error}`));
    }

    // Verify count
    const countResult = await sql`
      SELECT COUNT(*) as count FROM software
      WHERE company_id = ${companyId} AND deleted_at IS NULL
    `;
    console.log(`\nTotal software in database for Bio-Rad: ${countResult[0].count}`);

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
