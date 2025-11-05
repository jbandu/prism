import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function activateTestUsers() {
  console.log('🔓 Activating test users...\n');

  const result = await sql`
    UPDATE users
    SET is_active = true
    WHERE email LIKE '%@%.test'
    RETURNING email, is_active
  `;

  console.log('✅ Activated users:');
  result.forEach(u => console.log(`   ${u.email} - is_active: ${u.is_active}`));

  console.log('\n✅ Test users are now active and can log in!');
}

activateTestUsers().then(() => process.exit(0)).catch(console.error);
