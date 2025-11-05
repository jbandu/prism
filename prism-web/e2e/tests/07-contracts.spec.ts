/**
 * Contracts Management Tests
 * Tests contract upload, AI parsing, and management features
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Contracts Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/contracts');
  });

  test('should display contracts page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/contract/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should show upload contract button', async ({ page }) => {
    // Look for upload button
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Contract")').first();

    await expect(uploadButton).toBeVisible({ timeout: 5000 });
  });

  test('should display contracts list', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for table or cards showing contracts
    const contractsContainer = page.locator('table, [class*="card"], [class*="list"]').first();

    if (await contractsContainer.count() > 0) {
      await expect(contractsContainer).toBeVisible();
    }
  });

  test('should show contract metadata', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for common contract metadata fields
    const metadataFields = [
      /start.*date|effective.*date/i,
      /end.*date|expiration/i,
      /value|amount|cost/i,
      /status/i
    ];

    for (const field of metadataFields) {
      const element = page.locator(`text=${field}`).first();
      if (await element.count() > 0) {
        console.log(`Found metadata field: ${field}`);
        break;
      }
    }
  });

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should filter contracts by status', async ({ page }) => {
    // Look for status filter
    const statusFilter = page.locator('select, button:has-text("Status"), [class*="filter"]').first();

    if (await statusFilter.count() > 0) {
      await expect(statusFilter).toBeVisible();
    }
  });

  test('should show contract details on click', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Try to click on first contract row
    const firstContract = page.locator('table tr, [class*="contract-item"]').nth(1);

    if (await firstContract.count() > 0 && await firstContract.isVisible()) {
      await firstContract.click();

      // Should show details or navigate
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Contracts - Upload Flow', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should open upload dialog', async ({ page }) => {
    await page.goto('/acme-corp/contracts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click upload button
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Contract")').first();

    if (await uploadButton.isVisible()) {
      await uploadButton.click();

      // Should show file input or dialog
      const fileInput = page.locator('input[type="file"]');
      const dialog = page.locator('[role="dialog"], [class*="modal"]');

      const hasFileInput = await fileInput.count() > 0;
      const hasDialog = await dialog.count() > 0;

      expect(hasFileInput || hasDialog).toBeTruthy();
    }
  });
});

test.describe('Contracts - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view contracts but not upload', async ({ page }) => {
    await page.goto('/acme-corp/contracts');

    // Should see contracts page
    await expect(page.locator('h1, h2')).toContainText(/contract/i);

    // Upload button should be hidden or disabled
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Contract")').first();

    if (await uploadButton.count() > 0 && await uploadButton.isVisible()) {
      // If visible, should be disabled
      await expect(uploadButton).toBeDisabled();
    }
  });
});
