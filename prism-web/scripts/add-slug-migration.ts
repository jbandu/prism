/**
 * Run database migration to add slug column to companies table
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('\n📊 Running database migration to add slug column...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/add-slug-to-companies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Executing migration SQL...\n');

    // Execute the migration
    await sql(migrationSQL);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('Changes:');
    console.log('  • Added slug column to companies table');
    console.log('  • Generated slugs for existing companies');
    console.log('  • Created unique index on slug column');
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
