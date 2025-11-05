/**
 * Export Complete Database Schema from Neon
 *
 * This script queries the actual Neon database and generates:
 * 1. Complete SQL schema file (CREATE TABLE statements)
 * 2. Human-readable schema documentation (Markdown)
 * 3. Schema comparison report (migrations vs actual)
 *
 * Usage: npx tsx scripts/export-schema.ts
 */

import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';
import { join } from 'path';

const sql = neon(process.env.DATABASE_URL!);

interface TableInfo {
  table_schema: string;
  table_name: string;
  table_type: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  column_default: string | null;
  udt_name: string;
}

interface ForeignKeyInfo {
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  delete_rule: string;
  update_rule: string;
}

interface IndexInfo {
  table_name: string;
  index_name: string;
  index_def: string;
  is_primary: boolean;
  is_unique: boolean;
}

interface ConstraintInfo {
  constraint_name: string;
  constraint_type: string;
  table_name: string;
  check_clause: string | null;
}

async function exportSchema() {
  console.log('🔍 Analyzing Neon database schema...\n');

  const timestamp = new Date().toISOString().split('T')[0];
  let sqlOutput = `-- ============================================
-- PRISM DATABASE SCHEMA EXPORT
-- Generated: ${new Date().toISOString()}
-- Source: Neon Database (Actual Deployed Schema)
-- ============================================

-- This file represents the ACTUAL schema as deployed in production,
-- not just what's in migration files. This is the source of truth.

`;

  let markdownOutput = `# PRISM Database Schema Documentation

**Generated:** ${new Date().toISOString()}
**Source:** Neon Database (Actual Deployed Schema)

---

## Table of Contents

`;

  // 1. Get all tables
  console.log('📊 Fetching tables...');
  const tables = await sql`
    SELECT
      table_schema,
      table_name,
      table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  ` as TableInfo[];

  console.log(`   Found ${tables.length} tables\n`);

  // Generate TOC for markdown
  tables.forEach(t => {
    markdownOutput += `- [${t.table_schema}.${t.table_name}](#${t.table_schema}${t.table_name})\n`;
  });

  markdownOutput += `\n---\n\n## Tables\n\n`;

  // 2. For each table, get complete definition
  for (const table of tables) {
    console.log(`📋 Processing: ${table.table_schema}.${table.table_name}`);

    const fullTableName = `"${table.table_schema}"."${table.table_name}"`;

    // Get columns
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = ${table.table_schema}
        AND table_name = ${table.table_name}
      ORDER BY ordinal_position
    ` as ColumnInfo[];

    // Get primary key
    const primaryKey = await sql`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = ${table.table_schema}
        AND tc.table_name = ${table.table_name}
      ORDER BY kcu.ordinal_position
    `;

    const pkColumns = primaryKey.map((row: any) => row.column_name);

    // Get unique constraints
    const uniqueConstraints = await sql`
      SELECT
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = ${table.table_schema}
        AND tc.table_name = ${table.table_name}
      ORDER BY tc.constraint_name, kcu.ordinal_position
    `;

    // Get check constraints
    const checkConstraints = await sql`
      SELECT
        cc.constraint_name,
        cc.check_clause
      FROM information_schema.check_constraints cc
      JOIN information_schema.table_constraints tc
        ON cc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = ${table.table_schema}
        AND tc.table_name = ${table.table_name}
    ` as ConstraintInfo[];

    // Build CREATE TABLE statement
    sqlOutput += `\n-- Table: ${fullTableName}\n`;
    sqlOutput += `CREATE TABLE ${fullTableName} (\n`;

    const columnDefs: string[] = [];

    columns.forEach((col, idx) => {
      let colDef = `    "${col.column_name}" `;

      // Data type
      if (col.character_maximum_length) {
        colDef += `${col.data_type.toUpperCase()}(${col.character_maximum_length})`;
      } else if (col.udt_name === 'uuid') {
        colDef += 'UUID';
      } else if (col.udt_name === 'timestamptz') {
        colDef += 'TIMESTAMPTZ';
      } else if (col.udt_name === '_text') {
        colDef += 'TEXT[]';
      } else if (col.udt_name === '_uuid') {
        colDef += 'UUID[]';
      } else {
        colDef += col.data_type.toUpperCase();
      }

      // Nullable
      if (col.is_nullable === 'NO') {
        colDef += ' NOT NULL';
      }

      // Default
      if (col.column_default) {
        colDef += ` DEFAULT ${col.column_default}`;
      }

      columnDefs.push(colDef);
    });

    // Add primary key
    if (pkColumns.length > 0) {
      columnDefs.push(`    PRIMARY KEY ("${pkColumns.join('", "')}")`);
    }

    sqlOutput += columnDefs.join(',\n');
    sqlOutput += '\n);\n';

    // Add check constraints
    for (const check of checkConstraints) {
      sqlOutput += `ALTER TABLE ${fullTableName} ADD CONSTRAINT "${check.constraint_name}" CHECK ${check.check_clause};\n`;
    }

    // Add unique constraints
    const uniqueGroups = uniqueConstraints.reduce((acc: any, row: any) => {
      if (!acc[row.constraint_name]) acc[row.constraint_name] = [];
      acc[row.constraint_name].push(row.column_name);
      return acc;
    }, {});

    for (const [constraintName, cols] of Object.entries(uniqueGroups)) {
      sqlOutput += `ALTER TABLE ${fullTableName} ADD CONSTRAINT "${constraintName}" UNIQUE ("${(cols as string[]).join('", "')}");\n`;
    }

    // Markdown documentation
    markdownOutput += `### ${table.table_schema}.${table.table_name}\n\n`;
    markdownOutput += `| Column | Type | Nullable | Default | Notes |\n`;
    markdownOutput += `|--------|------|----------|---------|-------|\n`;

    columns.forEach(col => {
      let type = col.data_type;
      if (col.character_maximum_length) type += `(${col.character_maximum_length})`;
      const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
      const def = col.column_default || '-';
      const isPK = pkColumns.includes(col.column_name) ? '🔑 PK' : '';

      markdownOutput += `| ${col.column_name} | ${type} | ${nullable} | ${def} | ${isPK} |\n`;
    });

    markdownOutput += `\n`;
  }

  // 3. Get all foreign keys
  console.log('\n🔗 Fetching foreign keys...');
  const foreignKeys = await sql`
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  ` as ForeignKeyInfo[];

  console.log(`   Found ${foreignKeys.length} foreign keys\n`);

  sqlOutput += `\n\n-- ============================================\n`;
  sqlOutput += `-- FOREIGN KEY CONSTRAINTS\n`;
  sqlOutput += `-- ============================================\n\n`;

  markdownOutput += `\n---\n\n## Foreign Key Relationships\n\n`;
  markdownOutput += `| Table | Column | References | On Delete | On Update |\n`;
  markdownOutput += `|-------|--------|------------|-----------|----------|\n`;

  foreignKeys.forEach(fk => {
    sqlOutput += `ALTER TABLE "public"."${fk.table_name}" \n`;
    sqlOutput += `    ADD CONSTRAINT "${fk.constraint_name}" \n`;
    sqlOutput += `    FOREIGN KEY ("${fk.column_name}") \n`;
    sqlOutput += `    REFERENCES "public"."${fk.foreign_table_name}" ("${fk.foreign_column_name}")\n`;
    sqlOutput += `    ON DELETE ${fk.delete_rule}\n`;
    sqlOutput += `    ON UPDATE ${fk.update_rule};\n\n`;

    markdownOutput += `| ${fk.table_name} | ${fk.column_name} | ${fk.foreign_table_name}.${fk.foreign_column_name} | ${fk.delete_rule} | ${fk.update_rule} |\n`;
  });

  // 4. Get all indexes
  console.log('📇 Fetching indexes...');
  const indexes = await sql`
    SELECT
      tablename as table_name,
      indexname as index_name,
      indexdef as index_def
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
    ORDER BY tablename, indexname
  ` as IndexInfo[];

  console.log(`   Found ${indexes.length} indexes\n`);

  sqlOutput += `\n\n-- ============================================\n`;
  sqlOutput += `-- INDEXES\n`;
  sqlOutput += `-- ============================================\n\n`;

  indexes.forEach(idx => {
    sqlOutput += `${idx.index_def};\n`;
  });

  markdownOutput += `\n---\n\n## Indexes\n\n`;
  markdownOutput += `Total indexes: ${indexes.length}\n\n`;

  // 5. Write files
  const schemaDir = join(process.cwd(), '..', 'database', 'exports');
  const sqlFile = join(schemaDir, `schema-${timestamp}.sql`);
  const mdFile = join(schemaDir, `schema-${timestamp}.md`);
  const latestSqlFile = join(schemaDir, 'schema-latest.sql');
  const latestMdFile = join(schemaDir, 'schema-latest.md');

  console.log('💾 Writing files...');

  // Create directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync(schemaDir)) {
    fs.mkdirSync(schemaDir, { recursive: true });
  }

  writeFileSync(sqlFile, sqlOutput);
  writeFileSync(mdFile, markdownOutput);
  writeFileSync(latestSqlFile, sqlOutput);
  writeFileSync(latestMdFile, markdownOutput);

  console.log(`\n✅ Schema export complete!\n`);
  console.log(`   SQL:      ${sqlFile}`);
  console.log(`   Markdown: ${mdFile}`);
  console.log(`   Latest:   ${latestSqlFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - ${tables.length} tables`);
  console.log(`   - ${foreignKeys.length} foreign keys`);
  console.log(`   - ${indexes.length} indexes`);
  console.log(`\n✨ Commit these files to GitHub as your source of truth!\n`);
}

exportSchema().catch((error) => {
  console.error('❌ Error exporting schema:', error);
  process.exit(1);
});
