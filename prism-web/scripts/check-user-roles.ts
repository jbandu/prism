import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function checkRoles() {
  const constraint = await sql`
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conname = 'users_role_check'
  `;

  console.log('Role constraint:', constraint[0]?.definition);

  // Also check current roles in use
  const existingRoles = await sql`
    SELECT DISTINCT role FROM users
  `;

  console.log('\nExisting roles in database:');
  existingRoles.forEach(r => console.log('  -', r.role));
}

checkRoles().then(() => process.exit(0)).catch(console.error);
