/**
 * Run database migration 005: Create software_assets table
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('\n📊 Running database migration 005: Create software_assets table...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/005_create_software_assets_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Executing migration SQL...\n');

    // Execute the entire SQL file at once
    // Neon serverless can handle multiple statements in one query
    await sql(migrationSQL);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('Created:');
    console.log('  • software_assets table');
    console.log('  • Constraints for business rules');
    console.log('  • Indexes for performance');
    console.log('  • Triggers for auto-calculation of utilization_rate and days_to_renewal');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Migration complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
