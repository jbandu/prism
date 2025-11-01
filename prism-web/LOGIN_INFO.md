# PRISM Login Information

## Default Credentials

Your admin account was automatically created during database seeding.

### Admin Login
- **Email:** `jbandu@gmail.com`
- **Password:** `Password123!`
- **Role:** Admin (full access)

### Other Test Accounts

The following accounts are also available for testing:

#### BioRad Company Manager
- **Email:** `mhanif@bio-rad.com`
- **Password:** `Password123!`
- **Role:** Company Manager
- **Access:** BioRad Laboratories only

#### CoorsTek Company Manager
- **Email:** `ryan.reed@coorstek.com`
- **Password:** `Password123!`
- **Role:** Company Manager
- **Access:** CoorsTek only

---

## How Authentication Works

### 1. **Database-Based Authentication**
   - Uses NextAuth.js with credentials provider
   - Passwords are hashed using bcrypt (10 rounds)
   - Session managed via JWT tokens

### 2. **Password Storage**
   ```
   Plaintext Password → bcrypt hash → Stored in database
   "Password123!" → $2a$10$rJZhv0hs3M4... → users.password_hash
   ```

### 3. **Login Flow**
   ```
   1. User enters email + password
   2. System finds user by email
   3. bcrypt.compare(entered password, stored hash)
   4. If match → Create JWT session
   5. Session stored in cookie
   ```

### 4. **Role-Based Access Control**

   | Role | Can Access | Can Modify |
   |------|-----------|-----------|
   | **admin** | All companies | Everything |
   | **company_manager** | Own company only | Own company data |
   | **viewer** | Own company only | Nothing (read-only) |

---

## Changing Your Password

If you want to change the default password:

### Option 1: Reset via Database Script

```bash
cd ../database
node create_user.js jbandu@gmail.com YourNewPassword123! "Jayaprakash Bandu" admin
```

This will update your existing user with the new password.

### Option 2: Reset via SQL

```bash
# Generate a new hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourNewPassword', 10));"

# Copy the hash and run this SQL in Neon console:
UPDATE users
SET password_hash = 'paste-your-hash-here'
WHERE email = 'jbandu@gmail.com';
```

---

## Creating New Users

To create additional users:

```bash
cd ../database

# Create admin
node create_user.js admin@example.com SecurePass123! "Admin Name" admin

# Create company manager
node create_user.js manager@company.com SecurePass123! "Manager Name" company_manager biorad

# Create viewer
node create_user.js viewer@company.com SecurePass123! "Viewer Name" viewer coorstek
```

---

## Troubleshooting Login Issues

### "Invalid credentials" Error

**Check:**
1. Email is spelled correctly (case-sensitive)
2. Password is exactly: `Password123!` (case-sensitive)
3. User exists in database:
   ```bash
   node -e "
   const { neon } = require('@neondatabase/serverless');
   const sql = neon(process.env.DATABASE_URL);
   (async () => {
     const users = await sql\`SELECT email, role FROM users\`;
     console.log(users);
   })();
   "
   ```

### Session Issues

**Fix:**
1. Clear browser cookies
2. Check `NEXTAUTH_SECRET` is set in `.env`
3. Restart dev server: `npm run dev`

### Database Connection Issues

**Fix:**
1. Verify `DATABASE_URL` in `.env`
2. Test connection: `node test-db-connection.js`
3. Check internet connection

---

## Security Notes

⚠️ **Important:**

1. **Change default password** in production
2. Never commit `.env` file with real credentials
3. Use strong passwords (min 12 chars, mixed case, numbers, symbols)
4. Consider adding 2FA for production
5. Regularly rotate API keys and secrets

### Recommended Password Policy

For production users:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Not a common password

---

## Quick Login Test

Test authentication from command line:

```bash
node -e "
const bcrypt = require('bcryptjs');
const testPassword = 'Password123!';
const storedHash = '\$2a\$10\$rJZhv0hs3M4QhH8xNxJw3.vYxKGHJjR9QhVKzF6qV6p3xN8rBZG0a';

console.log('Testing password match:');
console.log('Password:', testPassword);
console.log('Match:', bcrypt.compareSync(testPassword, storedHash) ? '✅ YES' : '❌ NO');
"
```

---

## Need Help?

- Check NextAuth docs: https://next-auth.js.org
- Review authentication code: `lib/auth.ts`
- View user schema: `database/complete_schema.sql`

---

**Remember:** The default password is temporary. Change it after your first login!
