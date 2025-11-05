import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const columns = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'consolidation_recommendations'
    ORDER BY ordinal_position
  `;

  console.log('consolidation_recommendations columns:');
  columns.forEach((col: any) => console.log(`- ${col.column_name}: ${col.data_type}`));
}

main();
