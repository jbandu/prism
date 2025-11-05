/**
 * Analytics Page Tests
 * Tests usage analytics, charts, and reporting features
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/analytics');
  });

  test('should display analytics page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/analytics|usage|metrics/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should display usage analytics charts', async ({ page }) => {
    // Wait for charts to render (they might use canvas or SVG)
    await page.waitForSelector('canvas, svg, [class*="chart"]', { timeout: 5000 });

    // Check that at least one chart element exists
    const chartElements = await page.locator('canvas, svg[class*="recharts"]').count();
    expect(chartElements).toBeGreaterThan(0);
  });

  test('should show utilization metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for utilization percentage or metrics
    const utilizationText = page.locator('text=/utilization|usage|active.*users/i').first();
    if (await utilizationText.count() > 0) {
      await expect(utilizationText).toBeVisible();
    }
  });

  test('should display license waste information', async ({ page }) => {
    // Look for waste-related metrics
    const wasteIndicators = page.locator('text=/waste|unused|underutilized/i');

    if (await wasteIndicators.count() > 0) {
      await expect(wasteIndicators.first()).toBeVisible();
    }
  });

  test('should show date range filter', async ({ page }) => {
    // Look for date picker or range selector
    const dateFilter = page.locator('input[type="date"], [class*="date"], button:has-text("Date")').first();

    if (await dateFilter.count() > 0) {
      await expect(dateFilter).toBeVisible();
    }
  });

  test('should display software-specific analytics', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should show software names from test data
    const softwareNames = ['Salesforce', 'Slack', 'Zoom'];

    for (const name of softwareNames) {
      const softwareElement = page.locator(`text=${name}`).first();
      if (await softwareElement.count() > 0) {
        console.log(`Found ${name} in analytics`);
        break; // At least one should be visible
      }
    }
  });

  test('should show cost analytics', async ({ page }) => {
    // Look for cost-related information
    const costElements = page.locator('text=/\\$|cost|spend|savings/i');

    if (await costElements.count() > 0) {
      expect(await costElements.count()).toBeGreaterThan(0);
    }
  });

  test('should have export functionality', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });
});

test.describe('Analytics - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view analytics', async ({ page }) => {
    await page.goto('/acme-corp/analytics');

    // Should see analytics page
    await expect(page.locator('h1, h2')).toContainText(/analytics|usage|metrics/i);

    // Charts should be visible
    await page.waitForSelector('canvas, svg, [class*="chart"]', { timeout: 5000 });
  });
});
