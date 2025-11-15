// Script to adjust BioRad software costs to total $49M
import { sql } from '../lib/db';

async function adjustBioRadCosts() {
  console.log('🔍 Analyzing BioRad Laboratories software costs...\n');

  // Get BioRad company
  const companies = await sql`
    SELECT id, company_name
    FROM companies
    WHERE company_name ILIKE '%biorad%' AND company_name NOT ILIKE '%test%'
  `;

  if (companies.length === 0) {
    console.error('❌ BioRad Laboratories not found');
    return;
  }

  const bioradCompanyId = companies[0].id;
  console.log(`✅ Found: ${companies[0].company_name} (${bioradCompanyId})\n`);

  // Get all software for BioRad
  const software = await sql`
    SELECT
      id,
      software_name,
      category,
      vendor_name,
      total_annual_cost,
      total_licenses
    FROM software
    WHERE company_id = ${bioradCompanyId}
    ORDER BY COALESCE(total_annual_cost, 0) DESC
  `;

  console.log(`📦 Found ${software.length} software applications\n`);

  // Calculate current total
  const currentTotal = software.reduce((sum: number, sw: any) =>
    sum + Number(sw.total_annual_cost || 0), 0
  );

  const targetTotal = 49_000_000; // $49M
  const currentTotalM = (currentTotal / 1_000_000).toFixed(2);
  const targetTotalM = (targetTotal / 1_000_000).toFixed(2);

  console.log(`💰 Current Total: $${currentTotalM}M`);
  console.log(`🎯 Target Total:  $${targetTotalM}M`);
  console.log(`📊 Difference:    $${((targetTotal - currentTotal) / 1_000_000).toFixed(2)}M\n`);

  if (currentTotal === 0) {
    console.error('❌ Current total is $0. Cannot adjust proportionally.');
    return;
  }

  // Calculate adjustment factor
  const adjustmentFactor = targetTotal / currentTotal;
  console.log(`🔧 Adjustment Factor: ${adjustmentFactor.toFixed(4)} (${((adjustmentFactor - 1) * 100).toFixed(2)}% increase)\n`);

  console.log('📝 Adjusting software costs...\n');

  let updatedCount = 0;
  let newTotal = 0;

  // Show preview of top 10 changes
  console.log('Top 10 Software Cost Changes:');
  console.log('─'.repeat(100));
  console.log(
    'Software'.padEnd(35) +
    'Current'.padStart(15) +
    '→'.padStart(5) +
    'New'.padStart(15) +
    'Diff'.padStart(15)
  );
  console.log('─'.repeat(100));

  for (let i = 0; i < Math.min(10, software.length); i++) {
    const sw = software[i];
    const currentCost = Number(sw.total_annual_cost || 0);
    const newCost = currentCost * adjustmentFactor;

    console.log(
      sw.software_name.substring(0, 34).padEnd(35) +
      `$${(currentCost / 1000).toFixed(1)}K`.padStart(15) +
      '→'.padStart(5) +
      `$${(newCost / 1000).toFixed(1)}K`.padStart(15) +
      `+$${((newCost - currentCost) / 1000).toFixed(1)}K`.padStart(15)
    );
  }
  console.log('─'.repeat(100));
  console.log(`... and ${software.length - 10} more\n`);

  // Update all software
  for (const sw of software) {
    const currentCost = Number(sw.total_annual_cost || 0);
    const newCost = currentCost * adjustmentFactor;

    if (currentCost > 0) {
      await sql`
        UPDATE software
        SET total_annual_cost = ${newCost}
        WHERE id = ${sw.id}
      `;
      updatedCount++;
      newTotal += newCost;
    }
  }

  console.log(`✅ Updated ${updatedCount} software applications\n`);

  // Verify new total
  const verification = await sql`
    SELECT
      SUM(COALESCE(total_annual_cost, 0)) as total
    FROM software
    WHERE company_id = ${bioradCompanyId}
  `;

  const verifiedTotal = Number(verification[0]?.total || 0);
  const verifiedTotalM = (verifiedTotal / 1_000_000).toFixed(2);

  console.log('🎉 Cost Adjustment Complete!\n');
  console.log(`Previous Total: $${currentTotalM}M`);
  console.log(`New Total:      $${verifiedTotalM}M`);
  console.log(`Target Total:   $${targetTotalM}M`);
  console.log(`Variance:       $${((verifiedTotal - targetTotal) / 1_000_000).toFixed(4)}M (${((verifiedTotal / targetTotal - 1) * 100).toFixed(3)}%)`);
}

adjustBioRadCosts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
