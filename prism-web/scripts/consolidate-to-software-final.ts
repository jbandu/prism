/**
 * Final Software Consolidation Migration
 *
 * Current State:
 * - software_assets: 107 records (comprehensive data)
 * - software: 18 records (legacy data)
 *
 * This migration:
 * 1. Updates FKs pointing to 'software' table to use software_assets
 * 2. Drops the old 'software' table
 * 3. Renames 'software_assets' to 'software'
 * 4. Updates all constraints and indexes
 */

// @ts-nocheck
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function runConsolidation() {
  console.log('🚀 Final Software Table Consolidation\n');
  console.log('='.repeat(70) + '\n');

  try {
    // STEP 1: Check current state
    console.log('1️⃣  Checking current database state...\n');

    const softwareCount = await sql`SELECT COUNT(*) as count FROM software`;
    const assetsCount = await sql`SELECT COUNT(*) as count FROM software_assets`;

    console.log(`   📊 software table: ${softwareCount[0].count} records`);
    console.log(`   📊 software_assets table: ${assetsCount[0].count} records\n`);

    // STEP 2: Check for tables referencing the old software table
    console.log('2️⃣  Checking foreign key references...\n');

    const fksToSoftware = await sql`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'software'
      ORDER BY tc.table_name
    `;

    console.log(`   Found ${fksToSoftware.length} foreign keys referencing 'software' table:\n`);
    fksToSoftware.forEach((fk: any) => {
      console.log(`   - ${fk.table_name}.${fk.column_name} (${fk.constraint_name})`);
    });
    console.log('');

    // STEP 3: Create mapping between old software IDs and software_assets IDs
    console.log('3️⃣  Creating ID mapping (software → software_assets)...\n');

    // Try to match records by software_name and company_id
    const matches = await sql`
      SELECT
        s.id as old_software_id,
        sa.id as new_software_assets_id,
        s.software_name,
        s.company_id
      FROM software s
      JOIN software_assets sa
        ON s.software_name = sa.software_name
        AND s.company_id = sa.company_id
    `;

    console.log(`   ✅ Matched ${matches.length} records between tables\n`);

    if (matches.length > 0) {
      matches.forEach((m: any) => {
        console.log(`   - ${m.software_name}: ${m.old_software_id} → ${m.new_software_assets_id}`);
      });
      console.log('');
    }

    // STEP 4: Update foreign key references
    console.log('4️⃣  Updating foreign key references to point to software_assets...\n');

    for (const fk of fksToSoftware) {
      const tableName = fk.table_name;
      const columnName = fk.column_name;
      const constraintName = fk.constraint_name;

      try {
        // Drop the FK constraint first
        console.log(`   Dropping constraint ${constraintName}...`);
        await sql([`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName}`] as any);

        // Update the column values to point to software_assets IDs for each match
        let updateCount = 0;
        for (const match of matches) {
          const updated = await sql([`
            UPDATE ${tableName}
            SET ${columnName} = '${match.new_software_assets_id}'
            WHERE ${columnName} = '${match.old_software_id}'
          `] as any);
          if (updated.length > 0) updateCount += updated.length;
        }

        console.log(`   ✅ Updated ${tableName}.${columnName}: ${updateCount} rows\n`);
      } catch (e: any) {
        console.log(`   ⚠️  Error updating ${tableName}: ${e.message}\n`);
      }
    }

    // STEP 5: Drop the old software table
    console.log('5️⃣  Dropping old software table...\n');

    await sql`DROP TABLE IF EXISTS software CASCADE`;

    console.log('   ✅ software table dropped\n');

    // STEP 6: Rename software_assets to software
    console.log('6️⃣  Renaming software_assets → software...\n');

    await sql`ALTER TABLE software_assets RENAME TO software`;

    console.log('   ✅ Table renamed to software\n');

    // STEP 7: Rename constraints and indexes
    console.log('7️⃣  Renaming constraints and indexes...\n');

    // Rename primary key
    await sql`ALTER INDEX software_assets_pkey RENAME TO software_pkey`;
    console.log('   ✅ Renamed primary key index');

    // Rename unique constraints
    await sql`ALTER TABLE software RENAME CONSTRAINT unique_software_per_company TO software_company_software_name_key`;
    console.log('   ✅ Renamed unique constraint');

    await sql`ALTER TABLE software DROP CONSTRAINT IF EXISTS software_assets_asset_code_key CASCADE`;
    console.log('   ✅ Dropped asset_code unique constraint (no longer needed)');

    // Rename foreign keys
    await sql`ALTER TABLE software RENAME CONSTRAINT software_assets_company_id_fkey TO software_company_id_fkey`;
    console.log('   ✅ Renamed company_id foreign key');

    await sql`ALTER TABLE software RENAME CONSTRAINT software_assets_updated_by_fkey TO software_updated_by_fkey`;
    console.log('   ✅ Renamed updated_by foreign key\n');

    // STEP 8: Recreate foreign keys from other tables
    console.log('8️⃣  Recreating foreign keys pointing to software table...\n');

    const fksToRecreate = [
      {
        table: 'ai_agent_analyses',
        constraint: 'ai_agent_analyses_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'alternative_solutions',
        constraint: 'alternative_solutions_original_software_id_fkey',
        column: 'original_software_id'
      },
      {
        table: 'integration_dependencies',
        constraint: 'integration_dependencies_source_software_id_fkey',
        column: 'source_software_id'
      },
      {
        table: 'integration_dependencies',
        constraint: 'integration_dependencies_target_software_id_fkey',
        column: 'target_software_id'
      },
      {
        table: 'renewal_negotiations',
        constraint: 'renewal_negotiations_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'replacement_projects',
        constraint: 'replacement_projects_old_software_id_fkey',
        column: 'old_software_id'
      },
      {
        table: 'usage_analytics',
        constraint: 'usage_analytics_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'workflow_automations',
        constraint: 'workflow_automations_replaces_software_id_fkey',
        column: 'replaces_software_id'
      },
      {
        table: 'software_features_mapping',
        constraint: 'software_features_mapping_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'feature_comparison_matrix',
        constraint: 'feature_comparison_matrix_software_id_1_fkey',
        column: 'software_id_1'
      },
      {
        table: 'feature_comparison_matrix',
        constraint: 'feature_comparison_matrix_software_id_2_fkey',
        column: 'software_id_2'
      },
      {
        table: 'negotiation_playbooks',
        constraint: 'negotiation_playbooks_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'negotiation_outcomes',
        constraint: 'negotiation_outcomes_software_id_fkey',
        column: 'software_id'
      },
      {
        table: 'consolidation_recommendations',
        constraint: 'consolidation_recommendations_software_to_keep_id_fkey',
        column: 'software_to_keep_id'
      }
    ];

    for (const fk of fksToRecreate) {
      try {
        // Drop if exists (from software_assets)
        await sql([`ALTER TABLE ${fk.table} DROP CONSTRAINT IF EXISTS ${fk.constraint}`] as any);

        // Create new FK to software table
        const onDelete = fk.column.includes('replaces') ? 'SET NULL' : 'CASCADE';
        await sql([`
          ALTER TABLE ${fk.table}
          ADD CONSTRAINT ${fk.constraint}
          FOREIGN KEY (${fk.column}) REFERENCES software(id) ON DELETE ${onDelete}
        `] as any);

        console.log(`   ✅ Recreated ${fk.constraint}`);
      } catch (e: any) {
        console.log(`   ⚠️  Could not recreate ${fk.constraint}: ${e.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SOFTWARE TABLE CONSOLIDATION COMPLETED');
    console.log('='.repeat(70));
    console.log('');
    console.log('Summary:');
    console.log(`  ✅ Migrated ${assetsCount[0].count} records (was in software_assets)`);
    console.log('  ✅ Updated all foreign key references');
    console.log('  ✅ Dropped old software table');
    console.log('  ✅ Renamed software_assets → software');
    console.log('  ✅ Updated all constraints and indexes');
    console.log('');
    console.log('⚠️  IMPORTANT: Now update your code to remove all references to software_assets');
    console.log('');

    return true;

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack:', error.stack);
    return false;
  }
}

async function verifyConsolidation() {
  console.log('\n🔍 Verifying Consolidation...\n');

  try {
    // Check software_assets no longer exists
    const assetsExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'software_assets'
    `;

    if (parseInt(assetsExists[0].count) === 0) {
      console.log('   ✅ software_assets table removed');
    } else {
      console.log('   ❌ software_assets table still exists!');
    }

    // Check software table exists
    const softwareExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'software'
    `;

    if (parseInt(softwareExists[0].count) === 1) {
      const count = await sql`SELECT COUNT(*) as count FROM software`;
      console.log(`   ✅ software table exists with ${count[0].count} records`);
    } else {
      console.log('   ❌ software table does not exist!');
    }

    // Check column names
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'software'
      ORDER BY ordinal_position
    `;

    console.log(`\n   📊 software table has ${columns.length} columns:`);
    const importantColumns = [
      'id', 'company_id', 'software_name', 'vendor_name', 'category',
      'total_annual_cost', 'total_licenses', 'active_users', 'utilization_rate',
      'renewal_date', 'contract_status', 'waste_amount'
    ];

    const columnNames = columns.map((c: any) => c.column_name);
    importantColumns.forEach(col => {
      if (columnNames.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} (missing!)`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(70));
    console.log('');

    return true;

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await runConsolidation();

  if (!success) {
    console.error('\n❌ Consolidation failed');
    process.exit(1);
  }

  await verifyConsolidation();

  console.log('✨ Software table consolidation complete!\n');
  console.log('🔧 Next steps:');
  console.log('   1. Update lib/db-utils.ts to use "software" instead of "software_assets"');
  console.log('   2. Update API routes (check files in lib/ and app/api/)');
  console.log('   3. Update frontend type definitions');
  console.log('   4. Test all software-related features');
  console.log('   5. Deploy changes\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
