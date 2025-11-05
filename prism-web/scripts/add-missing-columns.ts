/**
 * Add Missing Columns to consolidation_recommendations
 * Migrates from old schema to new schema
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to consolidation_recommendations...\n');

  try {
    // Add features_covered column
    console.log('Adding features_covered...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS features_covered JSONB
    `;

    // Add features_at_risk column
    console.log('Adding features_at_risk...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS features_at_risk JSONB
    `;

    // Add migration_effort column
    console.log('Adding migration_effort...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS migration_effort VARCHAR(20)
    `;

    // Add business_risk column
    console.log('Adding business_risk...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS business_risk VARCHAR(20)
    `;

    // Add recommendation_text column
    console.log('Adding recommendation_text...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS recommendation_text TEXT
    `;

    // Add confidence_score column
    console.log('Adding confidence_score...');
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2)
    `;

    console.log('\n✅ All columns added successfully!\n');

    // Verify
    const allColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consolidation_recommendations'
      ORDER BY ordinal_position
    `;

    console.log('📋 Updated schema:');
    console.log('='.repeat(70));
    allColumns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(35)} ${col.data_type}`);
    });
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

addMissingColumns()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
