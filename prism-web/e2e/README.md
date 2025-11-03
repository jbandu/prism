# E2E Regression Testing with Playwright

Comprehensive end-to-end testing suite for PRISM SaaS Management Platform.

## Overview

This test suite provides automated regression testing for critical user flows:

- **Authentication**: Login, logout, role-based access
- **Admin Dashboard**: Company management, navigation
- **Company Dashboard**: Metrics, navigation, views
- **Software Management**: Portfolio viewing, CRUD operations

## Prerequisites

- Node.js 20+
- PostgreSQL database (test environment)
- Environment variables configured

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.test.local` in `prism-web/` directory:

```env
DATABASE_URL=postgresql://user:password@host/test_db
NEXTAUTH_SECRET=your-test-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Seed Test Data

```bash
npm run test:seed
```

This creates:
- 3 test users (admin, manager, viewer)
- 3 test companies
- 3 test software entries

**Test Credentials:**
- Admin: `test-admin@prism.test` / `TestAdmin123!`
- Manager: `test-manager@acmecorp.test` / `TestManager123!`
- Viewer: `test-viewer@acmecorp.test` / `TestViewer123!`

### 4. Run Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View test report
npm run test:report
```

## Test Structure

```
e2e/
├── fixtures/
│   ├── seed-test-data.ts    # Test data seeding
│   └── auth.setup.ts         # Authentication helpers
├── tests/
│   ├── 01-auth.spec.ts              # Authentication flows
│   ├── 02-admin-companies.spec.ts   # Admin company management
│   ├── 03-company-dashboard.spec.ts # Company dashboard
│   └── 04-software-management.spec.ts # Software portfolio
└── README.md
```

## Test Data

### Users
- **Admin**: Full system access
- **Company Manager**: Manage company data, CRUD operations
- **Viewer**: Read-only access

### Companies
- **Acme Corporation**: Active company with software
- **TechStart Inc**: Active company
- **Prospect Company**: Prospect status

### Software
- Salesforce (CRM) - $120K/year, 75% utilization
- Slack (Communication) - $24K/year, 90% utilization
- Zoom (Video) - $18K/year, 40% utilization

## Running in CI/CD

Tests automatically run on:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

See `.github/workflows/e2e-tests.yml` for configuration.

## Writing New Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Using Authentication

```typescript
import path from 'path';

// Use admin auth
test.use({ storageState: path.join(__dirname, '../.auth/admin.json') });

test('admin only test', async ({ page }) => {
  // Test runs as authenticated admin
});
```

## Cleanup

Remove test data after testing:

```bash
npm run test:cleanup
```

## Troubleshooting

### Tests Failing?

1. **Check test data**: Run `npm run test:seed`
2. **Check environment**: Verify `.env.test.local` is configured
3. **Check database**: Ensure test database is accessible
4. **Check server**: App should be running on `http://localhost:3000`

### Debugging Tips

```bash
# Run specific test file
npx playwright test tests/01-auth.spec.ts

# Run specific test by name
npx playwright test -g "should successfully login"

# Show browser during test
npx playwright test --headed

# Generate trace
npx playwright test --trace on
```

### View Test Artifacts

After test failure:
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: Import to [trace.playwright.dev](https://trace.playwright.dev)

## Browser Configuration

Tests run on:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

Configure in `playwright.config.ts`.

## Best Practices

1. **Independent Tests**: Each test should work standalone
2. **Clean State**: Use test data that's isolated
3. **Explicit Waits**: Use `waitForSelector` or `waitForURL`
4. **Descriptive Names**: Test names should explain what's tested
5. **Page Objects**: Consider using page object pattern for complex pages

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For issues or questions about E2E tests:
1. Check this README
2. Review test output and artifacts
3. Check GitHub Actions logs
4. Contact the development team
