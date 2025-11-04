import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration(filePath: string, name: string) {
  console.log(`\n🔄 Running migration: ${name}...`);

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Execute the SQL
    // Note: Neon doesn't support multiple statements at once, so we need to split them
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    console.log(`✅ Successfully ran migration: ${name}`);
    return { success: true, name };
  } catch (error) {
    console.error(`❌ Failed to run migration: ${name}`);
    console.error(error);
    return { success: false, name, error };
  }
}

async function main() {
  console.log('🚀 Running all pending migrations...\n');

  const migrationsDir = path.join(process.cwd(), 'migrations');

  const migrations = [
    {
      file: path.join(migrationsDir, 'create-alternatives-tables.sql'),
      name: 'Alternatives Tables (Feature #2)'
    },
    {
      file: path.join(migrationsDir, 'create-contracts-tables.sql'),
      name: 'Contracts Tables (Feature #3)'
    },
    {
      file: path.join(migrationsDir, 'create-usage-analytics-tables.sql'),
      name: 'Usage Analytics Tables (Feature #4)'
    }
  ];

  const results = [];

  for (const migration of migrations) {
    const result = await runMigration(migration.file, migration.name);
    results.push(result);
  }

  console.log('\n📊 Migration Summary:');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  console.log('='.repeat(50));
  console.log(`Total: ${results.length} | Success: ${successful} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some migrations failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  }
}

main();
