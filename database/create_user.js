#!/usr/bin/env node

/**
 * PRISM User Creation Utility
 *
 * Creates a new user in the database with a hashed password.
 *
 * Usage:
 *   node create_user.js <email> <password> <fullName> <role> [companyId]
 *
 * Examples:
 *   # Create admin user
 *   node create_user.js admin@example.com Password123! "John Doe" admin
 *
 *   # Create company manager
 *   node create_user.js manager@company.com Password123! "Jane Smith" company_manager biorad
 *
 *   # Create viewer
 *   node create_user.js viewer@company.com Password123! "Bob Jones" viewer coorstek
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('\nPlease set it in your .env file or run:');
  console.error('export DATABASE_URL="postgresql://user:pass@host/database"');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const [,, email, password, fullName, role, companyIdOrName] = process.argv;

if (!email || !password || !fullName || !role) {
  console.error('Usage: node create_user.js <email> <password> <fullName> <role> [companyId]');
  console.error('\nArguments:');
  console.error('  email       - User email address (must be unique)');
  console.error('  password    - User password (will be hashed)');
  console.error('  fullName    - User full name');
  console.error('  role        - User role: admin, company_manager, or viewer');
  console.error('  companyId   - Company ID or name (required for company_manager and viewer)');
  console.error('\nExamples:');
  console.error('  node create_user.js admin@example.com Pass123! "John Doe" admin');
  console.error('  node create_user.js user@bio-rad.com Pass123! "Jane Smith" company_manager biorad');
  process.exit(1);
}

// Validate role
const validRoles = ['admin', 'company_manager', 'viewer'];
if (!validRoles.includes(role)) {
  console.error(`❌ Error: Invalid role "${role}". Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Validate company requirement
if (role !== 'admin' && !companyIdOrName) {
  console.error(`❌ Error: companyId is required for role "${role}"`);
  process.exit(1);
}

if (role === 'admin' && companyIdOrName) {
  console.error('⚠️  Warning: Admins should not have a company_id. Ignoring provided companyId.');
}

async function createUser() {
  try {
    console.log('\n🔐 Creating user...\n');

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    let companyId = null;

    // Resolve company if needed
    if (role !== 'admin' && companyIdOrName) {
      // Try to find company by ID first
      let companies = await sql`
        SELECT company_id, company_name
        FROM companies
        WHERE company_id::text = ${companyIdOrName}
      `;

      // If not found, try by name
      if (companies.length === 0) {
        companies = await sql`
          SELECT company_id, company_name
          FROM companies
          WHERE LOWER(company_name) LIKE ${`%${companyIdOrName.toLowerCase()}%`}
        `;
      }

      if (companies.length === 0) {
        console.error(`❌ Error: Company "${companyIdOrName}" not found`);
        console.error('\nAvailable companies:');
        const allCompanies = await sql`SELECT company_id, company_name FROM companies`;
        allCompanies.forEach(c => {
          console.error(`  - ${c.company_name} (${c.company_id})`);
        });
        process.exit(1);
      }

      if (companies.length > 1) {
        console.error(`❌ Error: Multiple companies match "${companyIdOrName}":`);
        companies.forEach(c => {
          console.error(`  - ${c.company_name} (${c.company_id})`);
        });
        console.error('\nPlease use the exact company_id');
        process.exit(1);
      }

      companyId = companies[0].company_id;
      console.log(`✓ Found company: ${companies[0].company_name}`);
    }

    // Create the user
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role, company_id, is_active)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${role}, ${companyId}, true)
      RETURNING user_id, email, full_name, role, company_id, created_at
    `;

    const user = result[0];

    console.log('\n✅ User created successfully!\n');
    console.log('User Details:');
    console.log(`  ID:       ${user.user_id}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Name:     ${user.full_name}`);
    console.log(`  Role:     ${user.role}`);
    if (user.company_id) {
      const company = await sql`SELECT company_name FROM companies WHERE company_id = ${user.company_id}`;
      console.log(`  Company:  ${company[0].company_name}`);
    }
    console.log(`  Created:  ${user.created_at}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!\n');

  } catch (error) {
    if (error.message && error.message.includes('duplicate key')) {
      console.error(`\n❌ Error: User with email "${email}" already exists\n`);
    } else {
      console.error('\n❌ Error creating user:');
      console.error(error.message);
    }
    process.exit(1);
  }
}

createUser();
