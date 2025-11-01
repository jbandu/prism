#!/usr/bin/env node
/**
 * Test Database Connection Script
 * Run with: node test-db-connection.js
 */

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
  }
}

loadEnv();

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL is not set in .env file");
    process.exit(1);
  }

  console.log("✓ DATABASE_URL is set");

  try {
    // Create connection
    const sql = neon(process.env.DATABASE_URL);

    // Test query - get companies
    console.log("\n📊 Testing query: SELECT * FROM companies...");
    const companies = await sql`SELECT * FROM companies LIMIT 5`;

    console.log(`✓ Successfully connected to database!`);
    console.log(`✓ Found ${companies.length} companies:\n`);

    companies.forEach(company => {
      console.log(`  - ${company.company_name} (${company.industry})`);
    });

    // Test query - get users count
    console.log("\n👥 Testing query: SELECT COUNT(*) FROM users...");
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✓ Found ${userCount[0].count} users in database`);

    // Test query - get software count
    console.log("\n📦 Testing query: SELECT COUNT(*) FROM software_assets...");
    const softwareCount = await sql`SELECT COUNT(*) as count FROM software_assets`;
    console.log(`✓ Found ${softwareCount[0].count} software assets in database`);

    console.log("\n✅ All database tests passed!");
    console.log("🚀 Your local app should work correctly with Neon database.\n");

  } catch (error) {
    console.error("\n❌ Database connection failed:");
    console.error(error.message);
    console.error("\nPlease check:");
    console.error("  1. DATABASE_URL is correct in .env file");
    console.error("  2. Your internet connection is active");
    console.error("  3. Neon database is accessible\n");
    process.exit(1);
  }
}

// Run test
testConnection();
