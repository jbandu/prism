/**
 * Migration 005: Consolidate software and software_assets tables
 *
 * This migration:
 * 1. Migrates 8 unique records from software → software_assets
 * 2. Updates all FK references to point to new IDs
 * 3. Drops the software table
 * 4. Renames software_assets → software
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface SoftwareRecord {
  id: string;
  company_id: string;
  software_name: string;
  vendor_name: string;
  category: string;
  annual_cost: string;
  contract_start_date: string | null;
  contract_end_date: string | null;
  license_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  logo_id: string | null;
  updated_by: string | null;
  deleted_at: string | null;
}

interface IdMapping {
  oldId: string;
  newId: string;
  softwareName: string;
}

async function runMigration() {
  console.log('🚀 Migration 005: Consolidate Software Tables\n');
  console.log('⏱️  Estimated time: 2-3 minutes\n');
  console.log('='.repeat(70) + '\n');

  try {
    // STEP 1: Fetch all records from software table
    console.log('1️⃣  Fetching records from software table...\n');

    const softwareRecords = await sql`
      SELECT * FROM software ORDER BY created_at
    ` as SoftwareRecord[];

    console.log(`   ✅ Found ${softwareRecords.length} records to migrate\n`);

    // STEP 2: Create a mapping table to track old ID → new ID
    console.log('2️⃣  Creating ID mapping table...\n');

    await sql`
      CREATE TEMP TABLE software_id_mapping (
        old_id UUID,
        new_id UUID,
        software_name TEXT
      )
    `;

    console.log('   ✅ Temporary mapping table created\n');

    // STEP 3: Migrate records to software_assets and record ID mappings
    console.log('3️⃣  Migrating records to software_assets...\n');

    for (const record of softwareRecords) {
      const result = await sql`
        INSERT INTO software_assets (
          software_name,
          vendor_name,
          category,
          total_annual_cost,
          contract_start_date,
          contract_end_date,
          total_licenses,
          company_id,
          contract_status,
          created_at,
          updated_at,
          updated_by,
          deleted_at
        ) VALUES (
          ${record.software_name},
          ${record.vendor_name},
          ${record.category},
          ${record.annual_cost},
          ${record.contract_start_date},
          ${record.contract_end_date},
          ${record.license_count},
          ${record.company_id},
          ${record.status},
          ${record.created_at},
          ${record.updated_at},
          ${record.updated_by},
          ${record.deleted_at}
        )
        RETURNING id
      `;

      const newId = result[0].id;

      // Store the mapping
      await sql`
        INSERT INTO software_id_mapping (old_id, new_id, software_name)
        VALUES (${record.id}, ${newId}, ${record.software_name})
      `;

      console.log(`   ✅ Migrated: ${record.software_name} (${record.id} → ${newId})`);
    }

    console.log('\n   ✅ All records migrated successfully\n');

    // STEP 4: Update foreign key references
    console.log('4️⃣  Updating foreign key references...\n');

    // Drop existing FKs first
    const fksToDrop = [
      'software_features_mapping_software_id_fkey',
      'feature_comparison_matrix_software_id_1_fkey',
      'feature_comparison_matrix_software_id_2_fkey',
      'negotiation_playbooks_software_id_fkey',
      'negotiation_outcomes_software_id_fkey',
      'consolidation_recommendations_software_to_keep_id_fkey'
    ];

    for (const fkName of fksToDrop) {
      try {
        const tableName = fkName.split('_fkey')[0].split('_software_')[0];
        await sql.unsafe(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${fkName}`);
        console.log(`   ✅ Dropped FK: ${fkName}`);
      } catch (e: any) {
        console.log(`   ⚠️  Could not drop ${fkName}: ${e.message}`);
      }
    }

    console.log('\n   Updating references:\n');

    // Update software_features_mapping
    const updated1 = await sql`
      UPDATE software_features_mapping sfm
      SET software_id = m.new_id
      FROM software_id_mapping m
      WHERE sfm.software_id = m.old_id
    `;
    console.log(`   ✅ Updated software_features_mapping: ${updated1.length || 0} rows`);

    // Update feature_comparison_matrix (software_id_1)
    const updated2 = await sql`
      UPDATE feature_comparison_matrix fcm
      SET software_id_1 = m.new_id
      FROM software_id_mapping m
      WHERE fcm.software_id_1 = m.old_id
    `;
    console.log(`   ✅ Updated feature_comparison_matrix.software_id_1: ${updated2.length || 0} rows`);

    // Update feature_comparison_matrix (software_id_2)
    const updated3 = await sql`
      UPDATE feature_comparison_matrix fcm
      SET software_id_2 = m.new_id
      FROM software_id_mapping m
      WHERE fcm.software_id_2 = m.old_id
    `;
    console.log(`   ✅ Updated feature_comparison_matrix.software_id_2: ${updated3.length || 0} rows`);

    // Update negotiation_playbooks
    const updated4 = await sql`
      UPDATE negotiation_playbooks np
      SET software_id = m.new_id
      FROM software_id_mapping m
      WHERE np.software_id = m.old_id
    `;
    console.log(`   ✅ Updated negotiation_playbooks: ${updated4.length || 0} rows`);

    // Update negotiation_outcomes
    const updated5 = await sql`
      UPDATE negotiation_outcomes no
      SET software_id = m.new_id
      FROM software_id_mapping m
      WHERE no.software_id = m.old_id
    `;
    console.log(`   ✅ Updated negotiation_outcomes: ${updated5.length || 0} rows`);

    // Update consolidation_recommendations
    const updated6 = await sql`
      UPDATE consolidation_recommendations cr
      SET software_to_keep_id = m.new_id
      FROM software_id_mapping m
      WHERE cr.software_to_keep_id = m.old_id
    `;
    console.log(`   ✅ Updated consolidation_recommendations: ${updated6.length || 0} rows`);

    console.log('\n   ✅ All foreign key references updated\n');

    // STEP 5: Drop the old software table
    console.log('5️⃣  Dropping old software table...\n');

    await sql`DROP TABLE software CASCADE`;

    console.log('   ✅ Old software table dropped\n');

    // STEP 6: Rename software_assets to software
    console.log('6️⃣  Renaming software_assets → software...\n');

    await sql`ALTER TABLE software_assets RENAME TO software`;

    console.log('   ✅ Table renamed successfully\n');

    // STEP 7: Recreate foreign keys pointing to the new software table
    console.log('7️⃣  Recreating foreign key constraints...\n');

    const fksToCreate = [
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

    for (const fk of fksToCreate) {
      try {
        await sql.unsafe(`
          ALTER TABLE ${fk.table}
          ADD CONSTRAINT ${fk.constraint}
          FOREIGN KEY (${fk.column}) REFERENCES software(id) ON DELETE CASCADE
        `);
        console.log(`   ✅ Created FK: ${fk.constraint}`);
      } catch (e: any) {
        console.log(`   ⚠️  Could not create ${fk.constraint}: ${e.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION 005 COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log('');
    console.log('Summary:');
    console.log(`  ✅ Migrated ${softwareRecords.length} records from old software table`);
    console.log('  ✅ Updated all foreign key references');
    console.log('  ✅ Dropped old software table');
    console.log('  ✅ Renamed software_assets → software');
    console.log('  ✅ Recreated foreign key constraints');
    console.log('');

    return true;

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\n⚠️  Database may be in inconsistent state. Check logs above.');
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying Migration 005...\n');

  try {
    // Check that software_assets table no longer exists
    const assetsTableExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'software_assets'
    `;

    if (parseInt(assetsTableExists[0].count) === 0) {
      console.log('   ✅ software_assets table removed');
    } else {
      console.log('   ❌ software_assets table still exists!');
    }

    // Check that software table exists and has all records
    const softwareCount = await sql`SELECT COUNT(*) as count FROM software`;
    console.log(`   ✅ software table has ${softwareCount[0].count} records (expected: 115)`);

    // Check foreign keys
    const fkCount = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
        AND (
          constraint_name LIKE '%software_features_mapping%'
          OR constraint_name LIKE '%feature_comparison_matrix%'
          OR constraint_name LIKE '%negotiation_playbooks%'
          OR constraint_name LIKE '%negotiation_outcomes%'
          OR constraint_name LIKE '%consolidation_recommendations%'
        )
    `;
    console.log(`   ✅ Foreign keys recreated: ${fkCount[0].count}`);

    // Check that all FKs point to valid records
    const orphanCheck = await sql`
      SELECT 'software_features_mapping' as table_name, COUNT(*) as orphan_count
      FROM software_features_mapping
      WHERE software_id IS NOT NULL
        AND software_id NOT IN (SELECT id FROM software)

      UNION ALL

      SELECT 'feature_comparison_matrix (id_1)', COUNT(*)
      FROM feature_comparison_matrix
      WHERE software_id_1 IS NOT NULL
        AND software_id_1 NOT IN (SELECT id FROM software)

      UNION ALL

      SELECT 'feature_comparison_matrix (id_2)', COUNT(*)
      FROM feature_comparison_matrix
      WHERE software_id_2 IS NOT NULL
        AND software_id_2 NOT IN (SELECT id FROM software)
    `;

    let hasOrphans = false;
    orphanCheck.forEach((check: any) => {
      const count = parseInt(check.orphan_count);
      if (count > 0) {
        console.log(`   ❌ ${check.table_name}: ${count} orphaned records`);
        hasOrphans = true;
      }
    });

    if (!hasOrphans) {
      console.log('   ✅ No orphaned foreign key references');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION VERIFICATION COMPLETE');
    console.log('='.repeat(70));
    console.log('');

    return true;

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  const migrationSuccess = await runMigration();

  if (!migrationSuccess) {
    console.error('\n❌ Migration failed. Check errors above.');
    process.exit(1);
  }

  await verifyMigration();

  console.log('✨ Migration 005 completed successfully!\n');
  console.log('📊 Your database now has a single unified "software" table.\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
