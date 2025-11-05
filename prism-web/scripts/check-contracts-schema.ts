/**
 * Check Contracts Table Schema
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkSchema() {
  console.log('Checking contracts table schema...\n');

  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'contracts'
    ORDER BY ordinal_position
  `;

  console.log('Contracts table columns:');
  columns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
  });

  // Check if software_id exists
  const hasSoftwareId = columns.some(col => col.column_name === 'software_id');
  console.log(`\n❓ Has software_id column: ${hasSoftwareId}`);

  // Check what foreign key columns exist
  console.log('\n🔗 Foreign key columns:');
  columns
    .filter(col => col.column_name.endsWith('_id'))
    .forEach(col => console.log(`  - ${col.column_name}`));
}

checkSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
