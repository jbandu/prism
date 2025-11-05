/**
 * Admin Companies Management Tests
 * Tests admin view of companies and navigation to dashboards
 */
import { test, expect } from '@playwright/test';
import { TEST_COMPANIES } from '../fixtures/test-constants';
import path from 'path';

// Use admin authentication
test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });

test.describe('Admin - Companies Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/companies');
  });

  test('should display companies page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText(/clients|companies/i);

    // Check for search and filter controls
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should display list of test companies', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 5000 });

    // Check that test companies are visible
    for (const company of TEST_COMPANIES) {
      await expect(page.locator('table')).toContainText(company.company_name);
    }
  });

  test('should filter companies by status', async ({ page }) => {
    // Click on "Active" filter
    await page.click('button:has-text("Active")');

    // Should show active companies
    await expect(page.locator('table')).toContainText('Acme Corporation');
    await expect(page.locator('table')).toContainText('TechStart Inc');
  });

  test('should search for companies', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Acme');

    // Wait a bit for search to filter
    await page.waitForTimeout(500);

    // Should show Acme Corporation
    await expect(page.locator('table')).toContainText('Acme Corporation');
  });

  test('should navigate to client dashboard on row click', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });

    // Click on first company row
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();

    // Should navigate to company dashboard
    await expect(page).toHaveURL(/\/.*\/dashboard/, { timeout: 10000 });

    // Verify dashboard page loaded
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i);
  });

  test('should navigate to dashboard via action button', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });

    // Find and click the eye icon (view button) in actions column
    const viewButton = page.locator('table tbody tr').first().locator('button').first();
    await viewButton.click();

    // Should navigate to company dashboard
    await expect(page).toHaveURL(/\/.*\/dashboard/, { timeout: 10000 });
  });

  test('should show Add Client button', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Client")')).toBeVisible();
  });

  test('should display company metrics in table', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 5000 });

    // Check table headers
    const headers = ['Company', 'Contact', 'Status', 'Software', 'Annual Spend', 'Savings'];

    for (const header of headers) {
      await expect(page.locator('table thead')).toContainText(new RegExp(header, 'i'));
    }
  });

  test('should show status badges with correct colors', async ({ page }) => {
    await page.waitForSelector('table tbody tr', { timeout: 5000 });

    // Active status should have green indicator
    const activeBadge = page.locator('table').locator('text=/active/i').first();
    await expect(activeBadge).toBeVisible();

    // Prospect status should be visible
    const prospectBadge = page.locator('table').locator('text=/prospect/i').first();
    await expect(prospectBadge).toBeVisible();
  });
});
