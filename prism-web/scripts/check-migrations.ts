// Script to check which migrations have been applied
import { sql } from '../lib/db';

async function checkMigrations() {
  console.log('🔍 Checking applied migrations...\n');

  const tablesToCheck = [
    'software_alternatives',
    'alternative_evaluations',
    'software_peer_reviews',
    'software_switches',
    'contracts',
    'contract_renewals',
    'ai_enhancement_queue',
    'gamification_achievements',
    'user_achievements',
    'negotiation_strategies',
    'vendor_risk_assessments',
    'software_usage_logs',
    'usage_analytics',
    'renewal_alerts',
    'savings_simulations',
    'software_relationships',
    'category_redundancy_summary',
    'software_stakeholders',
    'role_definitions',
  ];

  const existingTables: string[] = [];
  const missingTables: string[] = [];

  for (const table of tablesToCheck) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        ) as exists
      `;

      if (result[0].exists) {
        existingTables.push(table);
        console.log(`✅ ${table}`);
      } else {
        missingTables.push(table);
        console.log(`❌ ${table} - MISSING`);
      }
    } catch (error) {
      console.error(`Error checking ${table}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Existing tables: ${existingTables.length}`);
  console.log(`   ❌ Missing tables: ${missingTables.length}`);

  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing tables:`);
    missingTables.forEach(t => console.log(`   - ${t}`));
  }

  process.exit(0);
}

checkMigrations().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
