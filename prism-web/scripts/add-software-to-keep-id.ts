import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🔄 Adding software_to_keep_id column to consolidation_recommendations...\n');

  try {
    // Add the column
    await sql`
      ALTER TABLE consolidation_recommendations
      ADD COLUMN IF NOT EXISTS software_to_keep_id UUID REFERENCES software(id)
    `;

    console.log('✅ Column added successfully!');

    // Verify it was added
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consolidation_recommendations'
        AND column_name = 'software_to_keep_id'
    `;

    if (columns.length > 0) {
      console.log(`✅ Verified: software_to_keep_id column exists (${columns[0].data_type})`);
    } else {
      console.log('❌ Column not found after addition');
    }
  } catch (error: any) {
    console.error('❌ Failed to add column:', error.message);
    throw error;
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
