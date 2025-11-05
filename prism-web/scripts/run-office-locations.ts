import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '..', '.env') });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const migrationPath = join(__dirname, '..', '..', 'database', 'migrations', '003_office_locations.sql');
  const migration = readFileSync(migrationPath, 'utf-8');

  // Split into individual statements
  const statements = migration
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log('🔄 Running office_locations migration...');
  console.log(`   Found ${statements.length} statements\n`);

  for (const statement of statements) {
    try {
      await sql(statement);
      console.log('✅ Executed statement');
    } catch (error: any) {
      if (error.code === '42P07' || error.message?.includes('already exists')) {
        console.log('⚠️  Already exists, skipping');
      } else {
        console.error('❌ Error:', error.message);
        throw error;
      }
    }
  }

  console.log('\n✅ Office locations migration complete!');
}

main().catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});
