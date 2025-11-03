/**
 * Run database migration for redundancy system
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
  console.log('\n📊 Running database migration for redundancy system...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/003_feature_overlap_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        await sql(statement);
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('Created tables:');
    console.log('  • software_catalog');
    console.log('  • feature_categories (with 20 standard categories)');
    console.log('  • software_features');
    console.log('  • feature_overlaps');
    console.log('  • feature_comparison_matrix');
    console.log('  • consolidation_recommendations');
    console.log('  • feature_analysis_cache');
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
