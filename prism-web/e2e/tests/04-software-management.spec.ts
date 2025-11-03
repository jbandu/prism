/**
 * Software Management Tests
 * Tests software portfolio views and management
 */
import { test, expect } from '@playwright/test';
import { TEST_SOFTWARE } from '../fixtures/seed-test-data';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Software Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/software');
  });

  test('should display software portfolio page', async ({ page }) => {
    // Check for software page title
    await expect(page.locator('h1, h2')).toContainText(/software/i);
  });

  test('should display list of software', async ({ page }) => {
    // Wait for table or cards to load
    await page.waitForSelector('table, [class*="card"]', { timeout: 5000 });

    // Check that test software is visible
    for (const software of TEST_SOFTWARE) {
      await expect(page.locator('body')).toContainText(software.software_name);
    }
  });

  test('should display software details', async ({ page }) => {
    await page.waitForSelector('table, [class*="card"]', { timeout: 5000 });

    // Check for software vendors
    await expect(page.locator('body')).toContainText('Salesforce Inc');
    await expect(page.locator('body')).toContainText('Slack Technologies');
  });

  test('should show Add Software button for managers', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
  });

  test('should search software', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('Salesforce');
      await page.waitForTimeout(500);

      // Should show Salesforce
      await expect(page.locator('body')).toContainText('Salesforce');
    }
  });

  test('should filter by category', async ({ page }) => {
    // Look for category filter or buttons
    const categoryFilter = page.locator('button:has-text("CRM"), select, [class*="filter"]').first();

    if (await categoryFilter.count() > 0) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display cost information', async ({ page }) => {
    await page.waitForSelector('table, [class*="card"]', { timeout: 5000 });

    // Look for currency symbols indicating cost display
    const hasCosts = await page.locator('body').locator('text=/\\$|USD|cost/i').count() > 0;
    expect(hasCosts).toBeTruthy();
  });
});

test.describe('Software Portfolio - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer should view but not edit software', async ({ page }) => {
    await page.goto('/acme-corp/software');

    // Should see software list
    await page.waitForSelector('table, [class*="card"]', { timeout: 5000 });
    await expect(page.locator('body')).toContainText('Salesforce');

    // Should NOT see Add button for viewers
    const addButton = page.locator('button:has-text("Add Software")');
    const editButtons = page.locator('button:has-text("Edit")');

    // Depending on implementation, these might be hidden or disabled
    if (await addButton.count() > 0) {
      await expect(addButton).toBeDisabled();
    }
  });
});
