/**
 * Smoke Tests - Fast critical path validation
 * These tests run quickly (~1 minute) to catch major issues
 * Run on every push to verify deployment health
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-constants';
import path from 'path';

test.describe('Smoke Tests - Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // Fill credentials
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Verify page loaded
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Smoke Tests - Critical Pages', () => {
  // Use admin authentication for page checks
  test.use({ storageState: path.join(__dirname, '../.auth/admin.json') });

  const CRITICAL_PAGES = [
    { path: '/admin/dashboard', name: 'Admin Dashboard' },
    { path: '/acme-corp/dashboard', name: 'Company Dashboard' },
    { path: '/acme-corp/software', name: 'Software List' },
    { path: '/acme-corp/redundancy', name: 'Redundancy Analysis' },
    { path: '/acme-corp/alternatives', name: 'Alternatives' },
    { path: '/acme-corp/contracts', name: 'Contracts' },
  ];

  for (const pageInfo of CRITICAL_PAGES) {
    test(`${pageInfo.name} should load without errors`, async ({ page }) => {
      // Navigate to page
      const response = await page.goto(pageInfo.path);

      // Should not be a server error
      expect(response?.status()).toBeLessThan(500);

      // Should not redirect to error page
      expect(page.url()).not.toContain('/error');
      expect(page.url()).not.toContain('/404');

      // Page should have content (at least a heading)
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });

      // No critical JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));

      // Wait a moment for any JS errors to surface
      await page.waitForTimeout(500);

      // Check for critical errors (allow non-critical console warnings)
      const criticalErrors = errors.filter(e =>
        e.includes('ReferenceError') ||
        e.includes('TypeError: Cannot read') ||
        e.includes('is not a function')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Smoke Tests - API Health', () => {
  test.use({ storageState: path.join(__dirname, '../.auth/admin.json') });

  test('API endpoints should respond', async ({ page }) => {
    // Check critical API endpoints
    const apiChecks = [
      { url: '/api/auth/session', name: 'Auth Session' },
      { url: '/api/companies/acme-corp', name: 'Company API' },
    ];

    for (const api of apiChecks) {
      const response = await page.request.get(api.url);

      // Should not be 500 error
      expect(response.status(), `${api.name} should not return 500`).toBeLessThan(500);

      // Should return JSON (if 200)
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
      }
    }
  });
});

test.describe('Smoke Tests - Navigation', () => {
  test.use({ storageState: path.join(__dirname, '../.auth/manager.json') });

  test('sidebar navigation should be functional', async ({ page }) => {
    await page.goto('/acme-corp/dashboard');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check if sidebar exists
    const sidebar = page.locator('nav, [role="navigation"], aside').first();

    if (await sidebar.isVisible()) {
      // Click a navigation link (Software)
      const softwareLink = page.locator('a[href*="software"]').first();

      if (await softwareLink.isVisible()) {
        await softwareLink.click();

        // Should navigate to software page
        await page.waitForURL(/\/software/, { timeout: 5000 });

        // Page should load
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
    }
  });
});
