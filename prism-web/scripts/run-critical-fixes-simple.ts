/**
 * Simplified Critical Fixes - Neon Compatible
 * Just the essential fixes without procedural blocks
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function runFixes() {
  console.log('🚀 Running Critical Schema Fixes (Simplified)\n');

  try {
    // Add missing indexes that weren't created
    console.log('📇 Creating remaining indexes...\n');

    const indexes = [
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_company_id ON activity_log(company_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_agent_analyses_software_id ON ai_agent_analyses(software_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_reports_company_id ON client_reports(company_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alternative_solutions_original_software_id ON alternative_solutions(original_software_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_software_company_status ON software(company_id, contract_status)`,
    ];

    for (const idx of indexes) {
      try {
        await sql(idx);
        console.log(`  ✅ Created index`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          console.log(`  ⚠️  Index already exists`);
        } else {
          console.log(`  ❌ Error: ${e.message}`);
        }
      }
    }

    // Add audit columns (simple approach)
    console.log('\n📊 Adding audit columns...\n');

    const auditColumns = [
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_by UUID`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
      `ALTER TABLE software ADD COLUMN IF NOT EXISTS updated_by UUID`,
      `ALTER TABLE software ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
      `ALTER TABLE software_assets ADD COLUMN IF NOT EXISTS updated_by UUID`,
      `ALTER TABLE software_assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
      `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_by UUID`,
    ];

    for (const col of auditColumns) {
      try {
        await sql(col);
        console.log(`  ✅ Added column`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          console.log(`  ⚠️  Column already exists`);
        } else {
          console.log(`  ❌ Error: ${e.message}`);
        }
      }
    }

    // Add foreign keys for audit columns
    console.log('\n🔗 Adding audit foreign keys...\n');

    const fks = [
      `ALTER TABLE companies ADD CONSTRAINT companies_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`,
      `ALTER TABLE software ADD CONSTRAINT software_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`,
      `ALTER TABLE software_assets ADD CONSTRAINT software_assets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`,
      `ALTER TABLE contracts ADD CONSTRAINT contracts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`,
    ];

    for (const fk of fks) {
      try {
        await sql(fk);
        console.log(`  ✅ Added foreign key`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          console.log(`  ⚠️  FK already exists`);
        } else {
          console.log(`  ❌ Error: ${e.message}`);
        }
      }
    }

    // Add indexes for soft delete columns
    console.log('\n📇 Adding soft delete indexes...\n');

    const softDeleteIndexes = [
      `CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL`,
      `CREATE INDEX IF NOT EXISTS idx_software_deleted_at ON software(deleted_at) WHERE deleted_at IS NULL`,
      `CREATE INDEX IF NOT EXISTS idx_software_assets_deleted_at ON software_assets(deleted_at) WHERE deleted_at IS NULL`,
      `CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL`,
    ];

    for (const idx of softDeleteIndexes) {
      try {
        await sql(idx);
        console.log(`  ✅ Created soft delete index`);
      } catch (e: any) {
        console.log(`  ⚠️  ${e.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ CRITICAL FIXES COMPLETED');
    console.log('='.repeat(60));
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  }

  return true;
}

async function finalVerification() {
  console.log('\n🔍 Final Verification...\n');

  // Check everything
  const fkCount = await sql`
    SELECT COUNT(*) as count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema = 'public'
      AND constraint_name LIKE '%activity_log%'
      OR constraint_name LIKE '%ai_agent%'
      OR constraint_name LIKE '%client_reports%'
      OR constraint_name LIKE '%alternative%'
  `;

  const indexCount = await sql`
    SELECT COUNT(*) as count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND (indexname LIKE 'idx_activity%'
      OR indexname LIKE 'idx_ai_agent%'
      OR indexname LIKE 'idx_client%'
      OR indexname LIKE 'idx_alternative%'
      OR indexname LIKE 'idx_software%')
  `;

  const auditCount = await sql`
    SELECT COUNT(*) as count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (column_name = 'updated_by' OR column_name = 'deleted_at')
      AND table_name IN ('companies', 'software', 'software_assets', 'users', 'contracts')
  `;

  console.log(`  ✅ Foreign Keys: ${fkCount[0].count}`);
  console.log(`  ✅ Indexes: ${indexCount[0].count}`);
  console.log(`  ✅ Audit Columns: ${auditCount[0].count}`);
  console.log('');
  console.log('🎉 Database schema optimized!\n');
}

runFixes().then(() => finalVerification());
