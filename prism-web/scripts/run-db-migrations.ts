import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file in prism-web
dotenv.config({ path: path.join(__dirname, '..', '.env') });

function splitSqlStatements(sqlContent: string): string[] {
  // Remove comments and split by semicolon
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--')) // Remove SQL comments
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  return statements;
}

async function runMigration(sql: any, filePath: string, name: string) {
  console.log(`\n🔄 Running migration: ${name}...`);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${filePath}`);
      return { success: false, name, error: 'File not found' };
    }

    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Split into individual statements (Neon doesn't support multiple statements)
    const statements = splitSqlStatements(sqlContent);

    console.log(`   Found ${statements.length} SQL statements to execute`);

    // Execute each statement individually
    let executed = 0;
    for (const statement of statements) {
      try {
        await sql(statement);
        executed++;
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.message?.includes('already exists')) {
          console.log(`   ⚠️  Object already exists, skipping...`);
          executed++;
          continue;
        }
        throw error;
      }
    }

    console.log(`✅ Successfully ran migration: ${name} (${executed}/${statements.length} statements)`);
    return { success: true, name };
  } catch (error) {
    console.error(`❌ Failed to run migration: ${name}`);
    console.error(error);
    return { success: false, name, error };
  }
}

async function main() {
  console.log('🚀 Running database migrations...\n');

  // Initialize Neon client
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL or DATABASE_URL environment variable is not set');
    console.error('Please check your .env file');
    process.exit(1);
  }

  console.log('✓ Database connection configured');

  const sql = neon(connectionString);

  // Migrations directory is in the parent project root
  const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');

  const migrations = [
    {
      file: path.join(migrationsDir, '001_initial_schema.sql'),
      name: 'Initial Schema'
    },
    {
      file: path.join(migrationsDir, '002_easyjet_schema_expansion.sql'),
      name: 'EasyJet Schema Expansion'
    },
    {
      file: path.join(migrationsDir, '002_prism_savings_log.sql'),
      name: 'Prism Savings Log'
    },
    {
      file: path.join(migrationsDir, '003_feature_overlap_system.sql'),
      name: 'Feature Overlap System (includes consolidation_recommendations)'
    },
    {
      file: path.join(migrationsDir, '003_office_locations.sql'),
      name: 'Office Locations'
    }
  ];

  const results = [];

  for (const migration of migrations) {
    const result = await runMigration(sql, migration.file, migration.name);
    results.push(result);
  }

  console.log('\n📊 Migration Summary:');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | Success: ${successful} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some migrations failed. This might be OK if tables already exist.');
    console.log('Check the errors above for details.');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
  }

  process.exit(0);
}

main();
