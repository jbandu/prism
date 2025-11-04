import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration(sql: any, filePath: string, name: string) {
  console.log(`\n🔄 Running migration: ${name}...`);

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Execute the SQL
    await sql(sqlContent);

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

  // Initialize Neon client
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL or DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(connectionString);

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
    const result = await runMigration(sql, migration.file, migration.name);
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
