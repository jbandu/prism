import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration(filePath: string, name: string) {
  console.log(`\n🔄 Running migration: ${name}...`);

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Execute the SQL
    // Note: We need to execute this as raw SQL since it contains multiple statements
    await sql(sqlContent);

    console.log(`✅ Successfully ran migration: ${name}`);
    return { success: true, name };
  } catch (error) {
    console.error(`❌ Failed to run migration: ${name}`);
    console.error(error);
    return { success: false, name, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({
        success: false,
        message: 'Some migrations failed',
        results
      }, { status: 500 });
    } else {
      console.log('\n🎉 All migrations completed successfully!');
      return NextResponse.json({
        success: true,
        message: 'All migrations completed successfully',
        results
      });
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
