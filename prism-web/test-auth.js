#!/usr/bin/env node
/**
 * Test Authentication Flow
 * Tests if password hashing and comparison works correctly
 */

const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
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

async function testAuth() {
  console.log("🔐 Testing Authentication Flow\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Test credentials
  const testEmail = "jbandu@gmail.com";
  const testPassword = "Password123!";

  try {
    // 1. Get user from database
    console.log(`1. Fetching user: ${testEmail}`);
    const users = await sql`
      SELECT id, email, password_hash, full_name, role, is_active
      FROM users
      WHERE email = ${testEmail}
    `;

    if (users.length === 0) {
      console.error(`❌ User not found: ${testEmail}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`   ✓ User found: ${user.full_name} (${user.role})`);
    console.log(`   ✓ Active: ${user.is_active}`);

    // 2. Test password comparison
    console.log(`\n2. Testing password: "${testPassword}"`);
    const isValid = await bcrypt.compare(testPassword, user.password_hash);

    if (isValid) {
      console.log("   ✅ Password is CORRECT!");
    } else {
      console.log("   ❌ Password is INCORRECT");
      console.log("\n   Stored hash:", user.password_hash);
      process.exit(1);
    }

    // 3. Test wrong password
    console.log(`\n3. Testing wrong password: "WrongPassword"`);
    const isInvalid = await bcrypt.compare("WrongPassword", user.password_hash);
    if (!isInvalid) {
      console.log("   ✓ Wrong password correctly rejected");
    } else {
      console.log("   ❌ Wrong password was accepted (this is bad!)");
      process.exit(1);
    }

    // 4. Check NextAuth environment variables
    console.log("\n4. Checking NextAuth configuration:");
    if (process.env.NEXTAUTH_SECRET) {
      console.log("   ✓ NEXTAUTH_SECRET is set");
    } else {
      console.log("   ❌ NEXTAUTH_SECRET is NOT set");
    }

    if (process.env.NEXTAUTH_URL) {
      console.log(`   ✓ NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
    } else {
      console.log("   ⚠️  NEXTAUTH_URL is not set (will use default)");
    }

    console.log("\n✅ All authentication tests passed!");
    console.log("\n📝 You can now login with:");
    console.log(`   Email:    ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log("\n🚀 Start your app with: npm run dev");
    console.log("   Then visit: http://localhost:3000/login\n");

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error.message);
    process.exit(1);
  }
}

testAuth();
