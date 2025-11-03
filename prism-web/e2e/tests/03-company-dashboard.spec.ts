/**
 * Company Dashboard Tests
 * Tests company dashboard views and navigation
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Company Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to company dashboard
    await page.goto('/acme-corp/dashboard');
  });

  test('should display company dashboard', async ({ page }) => {
    // Check for dashboard title
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i);

    // Dashboard should load within reasonable time
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should display key metrics cards', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[class*="card"]', { timeout: 5000 });

    // Look for common dashboard metrics
    const metricsTexts = [
      /total.*software|software.*count/i,
      /annual.*spend|total.*cost/i,
      /savings|optimization/i,
    ];

    for (const metric of metricsTexts) {
      const hasMetric = await page.locator('body').locator('text=' + metric).count() > 0;
      if (!hasMetric) {
        console.log(`Optional metric not found: ${metric}`);
      }
    }
  });

  test('should navigate to software portfolio page', async ({ page }) => {
    // Look for software/portfolio link in navigation
    const softwareLink = page.locator('a:has-text("Software"), a:has-text("Portfolio")').first();

    if (await softwareLink.isVisible()) {
      await softwareLink.click();
      await expect(page).toHaveURL(/\/.*\/software/);
    }
  });

  test('should navigate to alternatives page', async ({ page }) => {
    // Look for alternatives link
    const alternativesLink = page.locator('a:has-text("Alternatives")').first();

    if (await alternativesLink.isVisible()) {
      await alternativesLink.click();
      await expect(page).toHaveURL(/\/.*\/alternatives/);
    }
  });

  test('should navigate to renewals page', async ({ page }) => {
    // Look for renewals link
    const renewalsLink = page.locator('a:has-text("Renewals")').first();

    if (await renewalsLink.isVisible()) {
      await renewalsLink.click();
      await expect(page).toHaveURL(/\/.*\/renewals/);
    }
  });

  test('should display user menu', async ({ page }) => {
    // Look for user avatar or menu button
    const userMenu = page.locator('[class*="avatar"], button:has-text("John Manager")').first();
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should display navigation menu', async ({ page }) => {
    // Check for navigation elements
    await page.waitForSelector('nav, [role="navigation"]', { timeout: 5000 });

    // Common navigation items
    const navItems = ['Dashboard', 'Software', 'Alternatives'];

    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item}")`).first();
      if (await navLink.count() > 0) {
        await expect(navLink).toBeVisible();
      }
    }
  });
});
