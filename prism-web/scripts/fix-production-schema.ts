/**
 * Fix Production Database Schema
 * Adds missing columns to consolidation_recommendations table
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function fixProductionSchema() {
  console.log('🔧 Checking production database schema...\n');

  try {
    // Check if software_to_remove_ids column exists
    const columnCheck = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consolidation_recommendations'
      AND column_name = 'software_to_remove_ids'
    `;

    if (columnCheck.length === 0) {
      console.log('❌ Column software_to_remove_ids is missing');
      console.log('✅ Adding software_to_remove_ids column...\n');

      await sql`
        ALTER TABLE consolidation_recommendations
        ADD COLUMN IF NOT EXISTS software_to_remove_ids UUID[]
      `;

      console.log('✅ Column added successfully!\n');
    } else {
      console.log('✅ Column software_to_remove_ids already exists\n');
    }

    // Verify the fix
    const allColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'consolidation_recommendations'
      ORDER BY ordinal_position
    `;

    console.log('📋 Current consolidation_recommendations schema:');
    console.log('='.repeat(70));
    allColumns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('='.repeat(70));
    console.log('\n✅ Schema fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  }
}

// Run the fix
fixProductionSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
