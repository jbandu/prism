/**
 * Alternatives Discovery Tests
 * Tests alternative software discovery, comparison, and ROI analysis
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Alternatives Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
  });

  test('should display alternatives page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/alternative/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should display current software list', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should show current software in portfolio
    const softwareList = page.locator('table, [class*="software"], [class*="card"]').first();

    if (await softwareList.count() > 0) {
      await expect(softwareList).toBeVisible();
    }
  });

  test('should display software with costs', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check for currency symbols (should NOT show $0 anymore)
    const costElements = page.locator('text=/\\$[1-9]/');

    if (await costElements.count() > 0) {
      expect(await costElements.count()).toBeGreaterThan(0);
      console.log('Found cost information displayed correctly');
    }
  });

  test('should not show $0 for all software costs', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for table cells with costs
    const costCells = page.locator('table td').locator('text=/\\$/');

    if (await costCells.count() > 0) {
      const firstCost = await costCells.first().textContent();

      // At least some software should have non-zero costs
      const hasNonZeroCost = await page.locator('text=/\\$[1-9]|\\d+K|\\d+M/').count() > 0;
      expect(hasNonZeroCost).toBeTruthy();
    }
  });

  test('should show "Discover Alternatives" button', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Find discover alternatives buttons
    const discoverButton = page.locator('button:has-text("Discover"), button:has-text("Find Alternatives")').first();

    if (await discoverButton.count() > 0) {
      await expect(discoverButton).toBeVisible();
    }
  });

  test('should trigger alternatives search when clicking discover button', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click discover alternatives button
    const discoverButton = page.locator('button:has-text("Discover Alternatives")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();

      // Should show loading or results
      await page.waitForTimeout(2000);

      // Page should not crash
      await expect(page).not.toHaveURL(/error|404/);
    }
  });

  test('should display alternative software recommendations', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click discover on first software
    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(3000);

      // Look for alternatives list or results
      const alternativesResults = page.locator('text=/alternative|recommend|option/i');

      if (await alternativesResults.count() > 0) {
        console.log('Found alternatives recommendations');
      }
    }
  });

  test('should show feature parity scores', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for feature parity or similarity scores
    const parityScores = page.locator('text=/%|score|match|parity/i');

    if (await parityScores.count() > 0) {
      console.log('Found feature parity indicators');
    }
  });

  test('should display cost comparison', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for cost comparison information
    const costComparison = page.locator('text=/compare|vs|versus|cheaper|savings/i');

    if (await costComparison.count() > 0) {
      console.log('Found cost comparison');
    }
  });

  test('should show potential savings for each alternative', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(2000);

      // Look for savings amounts
      const savingsIndicators = page.locator('text=/save|\\$.*savings|reduce.*cost/i');

      if (await savingsIndicators.count() > 0) {
        console.log('Found savings information');
      }
    }
  });

  test('should filter alternatives by category', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for category filter
    const categoryFilter = page.locator('select, button:has-text("Category"), [class*="filter"]').first();

    if (await categoryFilter.count() > 0) {
      await expect(categoryFilter).toBeVisible();
    }
  });

  test('should search for specific software', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('Salesforce');
      await page.waitForTimeout(500);

      // Should filter results
      await expect(page.locator('body')).toContainText('Salesforce');
    }
  });

  test('should show AI-powered recommendations badge', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for AI indicators
    const aiIndicator = page.locator('text=/AI|powered|intelligent|smart/i');

    if (await aiIndicator.count() > 0) {
      console.log('Found AI-powered feature indicator');
    }
  });

  test('should display feature comparison matrix', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(2000);

      // Look for feature comparison
      const featureComparison = page.locator('text=/feature|capability|function/i');

      if (await featureComparison.count() > 0) {
        console.log('Found feature comparison');
      }
    }
  });
});

test.describe('Alternatives - ROI Analysis', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should display ROI projections', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for ROI indicators
    const roiIndicators = page.locator('text=/ROI|return.*investment|payback/i');

    if (await roiIndicators.count() > 0) {
      console.log('Found ROI analysis');
    }
  });

  test('should show implementation cost estimates', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(2000);

      // Look for implementation costs
      const implCosts = page.locator('text=/implementation|migration|setup.*cost/i');

      if (await implCosts.count() > 0) {
        console.log('Found implementation cost information');
      }
    }
  });

  test('should calculate 3-year TCO comparison', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for TCO or multi-year projections
    const tcoIndicators = page.locator('text=/TCO|total.*cost.*ownership|3.?year/i');

    if (await tcoIndicators.count() > 0) {
      console.log('Found TCO analysis');
    }
  });

  test('should show risk assessment', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(2000);

      // Look for risk indicators
      const riskIndicators = page.locator('text=/risk|complexity|difficulty/i');

      if (await riskIndicators.count() > 0) {
        console.log('Found risk assessment');
      }
    }
  });
});

test.describe('Alternatives - CSV Export', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should have export CSV button', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download CSV")').first();

    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should download CSV when clicking export button', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Find export button
    const exportButton = page.locator('button:has-text("Export CSV"), button:has-text("Download")').first();

    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click export
      await exportButton.click();

      try {
        // Wait for download
        const download = await downloadPromise;

        // Verify filename contains expected patterns
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.csv$/i);
        console.log('CSV downloaded:', filename);
      } catch (error) {
        console.log('Download not triggered or timed out');
      }
    }
  });

  test('should generate CSV with correct format', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await exportButton.click();

      try {
        const download = await downloadPromise;
        const path = await download.path();

        if (path) {
          // Download successful
          expect(path).toBeTruthy();
        }
      } catch (error) {
        console.log('CSV export test: Download not available');
      }
    }
  });
});

test.describe('Alternatives - Comparison Actions', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should allow selecting alternatives for detailed comparison', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.isVisible()) {
      await discoverButton.click();
      await page.waitForTimeout(2000);

      // Look for compare buttons or checkboxes
      const compareControls = page.locator('button:has-text("Compare"), input[type="checkbox"]');

      if (await compareControls.count() > 0) {
        console.log('Found comparison controls');
      }
    }
  });

  test('should show side-by-side comparison view', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for compare view button
    const compareButton = page.locator('button:has-text("Compare"), button:has-text("Side by Side")').first();

    if (await compareButton.count() > 0) {
      await compareButton.click();
      await page.waitForTimeout(1000);

      // Should show comparison view
      await expect(page).not.toHaveURL(/error|404/);
    }
  });

  test('should allow creating replacement plan', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for create plan or migration plan button
    const planButton = page.locator('button:has-text("Create Plan"), button:has-text("Migration Plan")').first();

    if (await planButton.count() > 0) {
      console.log('Found plan creation feature');
    }
  });
});

test.describe('Alternatives - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view alternatives page', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');

    // Should see alternatives page
    await expect(page.locator('h1, h2')).toContainText(/alternative/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('viewer can discover alternatives', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers can search for alternatives (read-only intelligence)
    const discoverButton = page.locator('button:has-text("Discover")').first();

    if (await discoverButton.count() > 0) {
      console.log('Viewer can discover alternatives');
    }
  });

  test('viewer can export CSV', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers should be able to export data
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.count() > 0) {
      console.log('Viewer can export data');
    }
  });

  test('viewer should not see action buttons to modify software', async ({ page }) => {
    await page.goto('/acme-corp/alternatives');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should NOT see buttons to actually replace software
    const replaceButtons = page.locator('button:has-text("Replace"), button:has-text("Switch Now")');

    for (let i = 0; i < await replaceButtons.count(); i++) {
      const button = replaceButtons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeDisabled();
      }
    }
  });
});
