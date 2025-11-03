# PRISM E2E Testing Guide

## Quick Start

### Setup (One-time)

1. **Navigate to the web app directory:**
   ```bash
   cd prism-web
   ```

2. **Create test environment file:**
   ```bash
   cp .env.example .env.test.local
   ```

3. **Edit `.env.test.local` with your test database:**
   ```env
   DATABASE_URL=postgresql://user:password@host/test_db
   NEXTAUTH_SECRET=test-secret-key-minimum-32-characters
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Seed test data:**
   ```bash
   npm run test:seed
   ```

### Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run in browser (see what's happening)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug

# View latest test report
npm run test:report
```

## Test Credentials

After seeding, use these credentials:

**Admin (Full Access):**
- Email: `test-admin@prism.test`
- Password: `TestAdmin123!`

**Company Manager (Manage Company):**
- Email: `test-manager@acmecorp.test`
- Password: `TestManager123!`

**Viewer (Read-Only):**
- Email: `test-viewer@acmecorp.test`
- Password: `TestViewer123!`

## What's Tested

✅ **Authentication**
- Login/logout flows
- Invalid credentials handling
- Role-based redirects

✅ **Admin Features**
- Company list and filtering
- Search functionality
- Direct navigation to client dashboards

✅ **Company Dashboard**
- Metrics display
- Navigation between sections
- User menu

✅ **Software Management**
- Portfolio viewing
- Software details
- Role-based permissions

## CI/CD Integration

Tests run automatically on:
- ✓ Push to `main`, `develop`, or `claude/**` branches
- ✓ Pull requests to `main` or `develop`
- ✓ Manual workflow trigger

View results: GitHub Actions → E2E Regression Tests

## Cleanup

Remove test data:
```bash
npm run test:cleanup
```

## Troubleshooting

### Tests fail with "Target closed" or timeout

**Solution:** Make sure the dev server is running:
```bash
npm run dev
```
Tests will start the server automatically, but if it's already running, they'll use it.

### "Database connection failed"

**Solution:** Check your `.env.test.local` file:
- Verify DATABASE_URL is correct
- Ensure test database exists
- Check network connectivity

### "Authentication failed"

**Solution:** Re-seed test data:
```bash
npm run test:cleanup
npm run test:seed
```

### View detailed error info

```bash
# Run specific failing test
npx playwright test tests/01-auth.spec.ts

# Show browser to see what's happening
npx playwright test --headed tests/01-auth.spec.ts

# Debug step-by-step
npx playwright test --debug tests/01-auth.spec.ts
```

## GitHub Actions Secrets

For CI/CD to work, add these secrets in your GitHub repo:

**Settings → Secrets and variables → Actions**

Required secrets:
- `TEST_DATABASE_URL` - Your test database connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth

## Best Practices

1. **Always seed before testing:**
   ```bash
   npm run test:seed && npm run test:e2e
   ```

2. **Use UI mode for development:**
   ```bash
   npm run test:e2e:ui
   ```

3. **Run specific tests during development:**
   ```bash
   npx playwright test tests/01-auth.spec.ts
   ```

4. **Check reports after failures:**
   ```bash
   npm run test:report
   ```

5. **Clean up after testing:**
   ```bash
   npm run test:cleanup
   ```

## Adding New Tests

See `prism-web/e2e/README.md` for detailed guide on writing tests.

Quick example:
```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/some-page');
  await expect(page.locator('h1')).toContainText('Expected');
});
```

## Resources

- Full E2E Documentation: `prism-web/e2e/README.md`
- Playwright Docs: https://playwright.dev
- Test Files: `prism-web/e2e/tests/`
- Fixtures: `prism-web/e2e/fixtures/`

## Support

Questions? Issues?
1. Check this guide
2. Review `prism-web/e2e/README.md`
3. Check test reports and artifacts
4. Review GitHub Actions logs
