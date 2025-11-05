import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

async function verifyTables() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔍 Verifying database tables...\n');

  // Check office_locations table
  try {
    const officeLocations = await sql`
      SELECT COUNT(*) as count
      FROM office_locations
    `;
    console.log('✅ office_locations table exists');
    console.log(`   Found ${officeLocations[0].count} office location records\n`);

    // Check columns
    const officeColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'office_locations'
      ORDER BY ordinal_position
    `;
    console.log('   Columns:');
    officeColumns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error: any) {
    console.error('❌ office_locations table check failed:', error.message);
  }

  console.log('\n');

  // Check consolidation_recommendations table
  try {
    const recommendations = await sql`
      SELECT COUNT(*) as count
      FROM consolidation_recommendations
    `;
    console.log('✅ consolidation_recommendations table exists');
    console.log(`   Found ${recommendations[0].count} recommendation records\n`);

    // Check for software_to_keep_id column specifically
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consolidation_recommendations'
        AND column_name = 'software_to_keep_id'
    `;

    if (columns.length > 0) {
      console.log('✅ software_to_keep_id column exists');
      console.log(`   Type: ${columns[0].data_type}\n`);
    } else {
      console.log('❌ software_to_keep_id column NOT found\n');
    }
  } catch (error: any) {
    console.error('❌ consolidation_recommendations table check failed:', error.message);
  }

  console.log('✅ Verification complete!');
}

verifyTables().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
