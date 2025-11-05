import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const requiredColumns = [
  'features_covered',
  'features_at_risk',
  'migration_effort',
  'business_risk',
  'recommendation_text',
  'confidence_score'
];

async function checkColumns() {
  const allColumns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'consolidation_recommendations'
  `;

  const existingColumns = allColumns.map(c => c.column_name);

  console.log('\n📋 Required columns check:');
  requiredColumns.forEach(col => {
    const exists = existingColumns.includes(col);
    console.log(`  ${exists ? '✅' : '❌'} ${col}`);
  });
}

checkColumns().then(() => process.exit(0)).catch(console.error);
