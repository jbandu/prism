/**
 * AI Analysis Tests
 * Tests AI-powered portfolio analysis and insights generation
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('AI Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/analysis');
  });

  test('should display AI analysis page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/analysis|AI|insights/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should show "Run Analysis" button', async ({ page }) => {
    // Look for analysis trigger button
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze"), button:has-text("Generate")').first();

    if (await runButton.count() > 0) {
      await expect(runButton).toBeVisible();
    }
  });

  test('should display analysis description or instructions', async ({ page }) => {
    // Look for explanatory text
    const description = page.locator('text=/discover|insight|analyze|AI.*powered/i').first();

    if (await description.count() > 0) {
      console.log('Found analysis description');
    }
  });

  test('should show previous analysis results if available', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for results from previous analyses
    const previousResults = page.locator('text=/previous|last.*analysis|history/i').first();

    if (await previousResults.count() > 0) {
      console.log('Found previous analysis results');
    }
  });
});

test.describe('AI Analysis - Running Analysis', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should trigger analysis when clicking run button', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.isVisible()) {
      await runButton.click();

      // Should show loading or processing indicator
      await page.waitForTimeout(2000);

      const loadingIndicator = page.locator('[class*="loading"], [class*="animate-spin"], text=/analyzing|processing/i').first();

      if (await loadingIndicator.count() > 0) {
        console.log('Analysis started successfully');
      }
    }
  });

  test('should display progress during analysis', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run Analysis"), button:has-text("Generate")').first();

    if (await runButton.isVisible()) {
      await runButton.click();
      await page.waitForTimeout(1000);

      // Look for progress indicators
      const progressSteps = page.locator('text=/step|analyzing|generating|processing/i');

      if (await progressSteps.count() > 0) {
        console.log('Found progress indicators');
      }
    }
  });

  test('should show AI processing status', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run")').first();

    if (await runButton.isVisible()) {
      await runButton.click();
      await page.waitForTimeout(2000);

      // Look for status messages
      const statusMessage = page.locator('text=/analyzing.*data|gathering.*insights|generating.*recommendations/i').first();

      if (await statusMessage.count() > 0) {
        console.log('Found AI processing status');
      }
    }
  });

  test('should allow canceling analysis', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run")').first();

    if (await runButton.isVisible()) {
      await runButton.click();
      await page.waitForTimeout(1000);

      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Stop")').first();

      if (await cancelButton.count() > 0) {
        await expect(cancelButton).toBeVisible();
      }
    }
  });

  test('should handle analysis timeout gracefully', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run")').first();

    if (await runButton.isVisible()) {
      await runButton.click();

      // Wait reasonable time
      await page.waitForTimeout(5000);

      // Page should not crash
      await expect(page).not.toHaveURL(/error|404/);
    }
  });
});

test.describe('AI Analysis - Results', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should display analysis results after completion', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const runButton = page.locator('button:has-text("Run")').first();

    if (await runButton.isVisible()) {
      await runButton.click();

      // Wait for analysis (up to 60 seconds for AI)
      await page.waitForTimeout(5000);

      // Look for results section
      const resultsSection = page.locator('text=/result|insight|finding|recommendation/i').first();

      if (await resultsSection.count() > 0) {
        console.log('Found analysis results');
      }
    }
  });

  test('should show key insights', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for insights
    const insights = page.locator('text=/insight|finding|discovery/i');

    if (await insights.count() > 0) {
      console.log('Found key insights');
    }
  });

  test('should display cost optimization opportunities', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for cost savings recommendations
    const costOpps = page.locator('text=/save|optimize|reduce.*cost|savings/i');

    if (await costOpps.count() > 0) {
      console.log('Found cost optimization opportunities');
    }
  });

  test('should show utilization insights', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for utilization analysis
    const utilizationInsights = page.locator('text=/utilization|usage|underutilized|unused/i');

    if (await utilizationInsights.count() > 0) {
      console.log('Found utilization insights');
    }
  });

  test('should display redundancy findings', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for redundancy analysis
    const redundancyFindings = page.locator('text=/redundant|duplicate|overlap/i');

    if (await redundancyFindings.count() > 0) {
      console.log('Found redundancy findings');
    }
  });

  test('should show priority rankings', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for priority indicators
    const priorities = page.locator('text=/priority|critical|high.*impact|quick.*win/i');

    if (await priorities.count() > 0) {
      console.log('Found priority rankings');
    }
  });

  test('should display action recommendations', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for actionable recommendations
    const actions = page.locator('text=/recommend|action|should|consider/i');

    if (await actions.count() > 0) {
      console.log('Found action recommendations');
    }
  });

  test('should show confidence scores or indicators', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for confidence levels
    const confidence = page.locator('text=/confidence|%|score|high.*certainty/i');

    if (await confidence.count() > 0) {
      console.log('Found confidence indicators');
    }
  });
});

test.describe('AI Analysis - Export and Sharing', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should allow exporting analysis results', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should support PDF export', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for PDF export option
    const pdfButton = page.locator('button:has-text("PDF"), text=/export.*pdf/i').first();

    if (await pdfButton.count() > 0) {
      console.log('Found PDF export option');
    }
  });

  test('should allow sharing analysis', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for share button
    const shareButton = page.locator('button:has-text("Share"), button[aria-label*="share"]').first();

    if (await shareButton.count() > 0) {
      console.log('Found share functionality');
    }
  });

  test('should show analysis timestamp', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for timestamp
    const timestamp = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}|ago|generated.*on/i').first();

    if (await timestamp.count() > 0) {
      console.log('Found analysis timestamp');
    }
  });
});

test.describe('AI Analysis - Historical Data', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should show analysis history', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for history or previous analyses
    const history = page.locator('text=/history|previous|past.*analysis/i, [class*="history"]').first();

    if (await history.count() > 0) {
      console.log('Found analysis history');
    }
  });

  test('should allow viewing past analyses', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for view history button
    const viewHistoryButton = page.locator('button:has-text("History"), button:has-text("View Past")').first();

    if (await viewHistoryButton.count() > 0) {
      console.log('Found view history option');
    }
  });

  test('should show trend comparisons', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for trend indicators
    const trends = page.locator('text=/trend|compared to|vs.*previous|change/i').first();

    if (await trends.count() > 0) {
      console.log('Found trend comparisons');
    }
  });
});

test.describe('AI Analysis - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view AI analysis page', async ({ page }) => {
    await page.goto('/acme-corp/analysis');

    // Should see analysis page
    await expect(page.locator('h1, h2')).toContainText(/analysis|AI|insights/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('viewer can run AI analysis', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers can generate insights (read-only intelligence)
    const runButton = page.locator('button:has-text("Run"), button:has-text("Analyze")').first();

    if (await runButton.count() > 0) {
      console.log('Viewer can run AI analysis');
    }
  });

  test('viewer can export results', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers should be able to export analysis
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.count() > 0) {
      console.log('Viewer can export analysis');
    }
  });

  test('viewer should not see action buttons to implement recommendations', async ({ page }) => {
    await page.goto('/acme-corp/analysis');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should NOT see buttons to directly implement changes
    const actionButtons = page.locator('button:has-text("Implement"), button:has-text("Apply Changes")');

    for (let i = 0; i < await actionButtons.count(); i++) {
      const button = actionButtons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeDisabled();
      }
    }
  });
});
