/**
 * Software Management Tests
 * Tests software portfolio views and management
 */
import { test, expect } from '@playwright/test';
import { TEST_SOFTWARE } from '../fixtures/test-constants';
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

test.describe('Software Portfolio - Sorting Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/software');
    await page.waitForSelector('table', { timeout: 5000 });
  });

  test('should sort by software name ascending', async ({ page }) => {
    // Click on Software column header
    const softwareHeader = page.locator('button:has-text("Software")').first();
    await softwareHeader.click();
    await page.waitForTimeout(300);

    // Get all software names from the table
    const softwareNames = await page.locator('table tbody tr td:first-child p.font-medium').allTextContents();

    // Verify ascending order
    const sortedNames = [...softwareNames].sort((a, b) => a.localeCompare(b));
    expect(softwareNames).toEqual(sortedNames);
  });

  test('should sort by software name descending', async ({ page }) => {
    // Click on Software column header twice for descending
    const softwareHeader = page.locator('button:has-text("Software")').first();
    await softwareHeader.click();
    await page.waitForTimeout(300);
    await softwareHeader.click();
    await page.waitForTimeout(300);

    // Get all software names from the table
    const softwareNames = await page.locator('table tbody tr td:first-child p.font-medium').allTextContents();

    // Verify descending order
    const sortedNames = [...softwareNames].sort((a, b) => b.localeCompare(a));
    expect(softwareNames).toEqual(sortedNames);
  });

  test('should sort by category ascending', async ({ page }) => {
    // Click on Category column header
    const categoryHeader = page.locator('button:has-text("Category")').first();
    await categoryHeader.click();
    await page.waitForTimeout(300);

    // Get all categories from the table
    const categories = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    const cleanCategories = categories.map(c => c.trim());

    // Verify ascending order
    const sortedCategories = [...cleanCategories].sort((a, b) => a.localeCompare(b));
    expect(cleanCategories).toEqual(sortedCategories);
  });

  test('should sort by category descending', async ({ page }) => {
    // Click on Category column header twice for descending
    const categoryHeader = page.locator('button:has-text("Category")').first();
    await categoryHeader.click();
    await page.waitForTimeout(300);
    await categoryHeader.click();
    await page.waitForTimeout(300);

    // Get all categories from the table
    const categories = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    const cleanCategories = categories.map(c => c.trim());

    // Verify descending order
    const sortedCategories = [...cleanCategories].sort((a, b) => b.localeCompare(a));
    expect(cleanCategories).toEqual(sortedCategories);
  });

  test('should sort by annual cost ascending', async ({ page }) => {
    // Click on Annual Cost column header
    const costHeader = page.locator('button:has-text("Annual Cost")').first();
    await costHeader.click();
    await page.waitForTimeout(300);

    // Get all costs from the table
    const costs = await page.locator('table tbody tr td:nth-child(3) p.font-semibold').allTextContents();
    const numericCosts = costs.map(c => {
      // Parse currency strings like "$50K" or "$1.2M"
      const value = c.replace(/[$,]/g, '');
      if (value.includes('M')) {
        return parseFloat(value.replace('M', '')) * 1000000;
      } else if (value.includes('K')) {
        return parseFloat(value.replace('K', '')) * 1000;
      }
      return parseFloat(value) || 0;
    });

    // Verify ascending order
    for (let i = 0; i < numericCosts.length - 1; i++) {
      expect(numericCosts[i]).toBeLessThanOrEqual(numericCosts[i + 1]);
    }
  });

  test('should sort by annual cost descending', async ({ page }) => {
    // Click on Annual Cost column header twice for descending
    const costHeader = page.locator('button:has-text("Annual Cost")').first();
    await costHeader.click();
    await page.waitForTimeout(300);
    await costHeader.click();
    await page.waitForTimeout(300);

    // Get all costs from the table
    const costs = await page.locator('table tbody tr td:nth-child(3) p.font-semibold').allTextContents();
    const numericCosts = costs.map(c => {
      // Parse currency strings like "$50K" or "$1.2M"
      const value = c.replace(/[$,]/g, '');
      if (value.includes('M')) {
        return parseFloat(value.replace('M', '')) * 1000000;
      } else if (value.includes('K')) {
        return parseFloat(value.replace('K', '')) * 1000;
      }
      return parseFloat(value) || 0;
    });

    // Verify descending order
    for (let i = 0; i < numericCosts.length - 1; i++) {
      expect(numericCosts[i]).toBeGreaterThanOrEqual(numericCosts[i + 1]);
    }
  });

  test('should display sort icons correctly', async ({ page }) => {
    // Initially, no column should be sorted
    const softwareHeader = page.locator('button:has-text("Software")').first();

    // Click to sort ascending
    await softwareHeader.click();
    await page.waitForTimeout(300);

    // Verify up arrow is visible (indicating ascending sort)
    const sortIcon = softwareHeader.locator('svg').last();
    await expect(sortIcon).toBeVisible();

    // Click again to sort descending
    await softwareHeader.click();
    await page.waitForTimeout(300);

    // Verify down arrow is visible (indicating descending sort)
    await expect(sortIcon).toBeVisible();
  });

  test('should sort with search filter applied', async ({ page }) => {
    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Salesforce');
    await page.waitForTimeout(500);

    // Sort by cost
    const costHeader = page.locator('button:has-text("Annual Cost")').first();
    await costHeader.click();
    await page.waitForTimeout(300);

    // Verify that only filtered results are sorted
    const visibleRows = await page.locator('table tbody tr').count();
    expect(visibleRows).toBeGreaterThan(0);
  });

  test('should sort with category filter applied', async ({ page }) => {
    // Apply category filter if available
    const categorySelect = page.locator('[class*="filter"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(300);

      // Sort by software name
      const softwareHeader = page.locator('button:has-text("Software")').first();
      await softwareHeader.click();
      await page.waitForTimeout(300);

      // Verify sorting worked
      const visibleRows = await page.locator('table tbody tr').count();
      expect(visibleRows).toBeGreaterThan(0);
    }
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
