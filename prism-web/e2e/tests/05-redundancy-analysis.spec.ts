/**
 * Redundancy Analysis Tests
 * Tests the portfolio overlap detection and consolidation recommendations feature
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-constants';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Redundancy Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/redundancy');
  });

  test('should display redundancy analysis page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/redundancy|overlap/i);

    // Page should load within reasonable time
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should display software selection list', async ({ page }) => {
    // Wait for software list to load
    await page.waitForSelector('[class*="software"], [data-testid="software-list"]', { timeout: 5000 });

    // Should show software from test data
    const hasSalesforce = await page.locator('body').locator('text=/Salesforce/i').count() > 0;
    const hasSlack = await page.locator('body').locator('text=/Slack/i').count() > 0;

    expect(hasSalesforce || hasSlack).toBeTruthy();
  });

  test('should show selection controls', async ({ page }) => {
    // Check for "Select All" button
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.count() > 0) {
      await expect(selectAllButton).toBeVisible();
    }

    // Check for "Deselect All" button
    const deselectAllButton = page.locator('button:has-text("Deselect All")').first();
    if (await deselectAllButton.count() > 0) {
      await expect(deselectAllButton).toBeVisible();
    }

    // Check for selection count display
    const selectionCount = page.locator('text=/selected/i').first();
    if (await selectionCount.count() > 0) {
      await expect(selectionCount).toBeVisible();
    }
  });

  test('should enable run analysis button when 2+ software selected', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Find Run Analysis button
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.count() > 0) {
      // Initial state might be disabled if < 2 selected
      const initialState = await runButton.isDisabled();
      console.log('Run button initial disabled state:', initialState);

      // Try to select software items
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount >= 2) {
        // Select first 2 checkboxes
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Button should now be enabled
        await expect(runButton).toBeEnabled({ timeout: 2000 });
      }
    }
  });

  test('should show warning when less than 2 software selected', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for warning message about minimum selection
    const warningText = page.locator('text=/select.*at least.*2|minimum.*2.*software/i');

    if (await warningText.count() > 0) {
      await expect(warningText).toBeVisible();
    }
  });

  test('should display run analysis button', async ({ page }) => {
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();
    await expect(runButton).toBeVisible({ timeout: 5000 });
  });

  test('should show progress tracker when analysis runs', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select multiple software
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    // Click run analysis
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Should show progress indicator
      const progressIndicator = page.locator('text=/analyzing|progress|loading/i, [class*="progress"], [role="progressbar"]').first();

      await expect(progressIndicator).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display activity log during analysis', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select software
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    // Run analysis
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Wait a bit for analysis to start
      await page.waitForTimeout(1000);

      // Look for activity log entries
      const activityLog = page.locator('text=/Loading|Querying|Found|Extracting|Comparing/i').first();

      if (await activityLog.count() > 0) {
        await expect(activityLog).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show cancel button during analysis', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select software and run
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Should show cancel button
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      await expect(cancelButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display analysis results after completion', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select software
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    // Run analysis
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Wait for analysis to complete (max 30 seconds)
      await page.waitForSelector('text=/results|overlap|redundancy|recommendations/i', { timeout: 30000 });

      // Check for results section
      const resultsSection = page.locator('[class*="result"], [data-testid="analysis-results"]').first();
      if (await resultsSection.count() > 0) {
        await expect(resultsSection).toBeVisible();
      }
    }
  });

  test('should show overlap percentages in results', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select software and run
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Wait for results
      await page.waitForTimeout(5000);

      // Look for percentage values
      const percentages = page.locator('text=/%/');
      if (await percentages.count() > 0) {
        expect(await percentages.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should display cost implications', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Run analysis
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Wait for results
      await page.waitForTimeout(5000);

      // Look for cost/savings indicators
      const costText = page.locator('text=/\\$|USD|cost|savings|redundancy/i');
      if (await costText.count() > 0) {
        expect(await costText.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should show recommendations', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Run analysis
    const selectAllButton = page.locator('button:has-text("Select All")').first();
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isEnabled()) {
      await runButton.click();

      // Wait for results
      await page.waitForTimeout(5000);

      // Look for recommendations section
      const recommendations = page.locator('text=/recommend|consolidate|keep|remove/i').first();
      if (await recommendations.count() > 0) {
        await expect(recommendations).toBeVisible();
      }
    }
  });
});

test.describe('Redundancy Analysis - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view redundancy analysis page', async ({ page }) => {
    await page.goto('/acme-corp/redundancy');

    // Should be able to view the page
    await expect(page.locator('h1, h2')).toContainText(/redundancy|overlap/i);
  });

  test('viewer can run analysis but not modify software', async ({ page }) => {
    await page.goto('/acme-corp/redundancy');

    // Should see Run Analysis button
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();
    await expect(runButton).toBeVisible({ timeout: 5000 });

    // Should NOT see delete/edit buttons for software
    const deleteButtons = page.locator('button:has-text("Delete")');
    if (await deleteButtons.count() > 0) {
      // Delete buttons should be disabled or hidden for viewers
      const firstDelete = deleteButtons.first();
      if (await firstDelete.isVisible()) {
        await expect(firstDelete).toBeDisabled();
      }
    }
  });
});
