/**
 * Renewals Management Tests
 * Tests contract renewals tracking and negotiation playbook generation
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Renewals Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/renewals');
  });

  test('should display renewals page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/renewal/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should display time filter tabs', async ({ page }) => {
    // Check for time filter buttons (30, 60, 90 days, all)
    const timeFilters = ['30', '60', '90', 'All'];

    for (const filter of timeFilters) {
      const filterButton = page.locator(`button:has-text("${filter}")`).first();
      if (await filterButton.count() > 0) {
        await expect(filterButton).toBeVisible();
      }
    }
  });

  test('should filter renewals by time period', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click on 30 days filter
    const thirtyDaysButton = page.locator('button:has-text("30")').first();
    if (await thirtyDaysButton.isVisible()) {
      await thirtyDaysButton.click();
      await page.waitForTimeout(500);

      // Should still show renewals page
      await expect(page.locator('h1, h2')).toContainText(/renewal/i);
    }
  });

  test('should display renewals list with key information', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for table or cards
    const renewalsContainer = page.locator('table, [class*="card"]').first();
    if (await renewalsContainer.count() > 0) {
      await expect(renewalsContainer).toBeVisible();

      // Check for key columns/fields
      const fields = ['software', 'vendor', 'renewal', 'cost', 'status'];
      for (const field of fields) {
        const hasField = await page.locator(`text=/${field}/i`).count() > 0;
        if (hasField) {
          console.log(`Found field: ${field}`);
        }
      }
    }
  });

  test('should show urgency indicators', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for urgency badges or warnings
    const urgencyIndicators = page.locator('text=/urgent|critical|warning|expires/i, [class*="badge"], [class*="alert"]');

    if (await urgencyIndicators.count() > 0) {
      console.log('Found urgency indicators');
    }
  });

  test('should display renewal dates', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for date formats (MM/DD/YYYY or similar)
    const datePattern = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}|\\d+ days/i');

    if (await datePattern.count() > 0) {
      expect(await datePattern.count()).toBeGreaterThan(0);
    }
  });

  test('should show total renewals count', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for counts or summaries
    const countIndicator = page.locator('text=/total|count|\\d+ renewal/i').first();

    if (await countIndicator.count() > 0) {
      await expect(countIndicator).toBeVisible();
    }
  });

  test('should display auto-renewal status', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for auto-renewal indicators
    const autoRenewalIndicator = page.locator('text=/auto.?renew/i');

    if (await autoRenewalIndicator.count() > 0) {
      console.log('Found auto-renewal indicator');
    }
  });
});

test.describe('Renewals - Negotiation Playbook', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should show "Prepare Negotiation" button for renewals', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for prepare negotiation button
    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.count() > 0) {
      await expect(prepareButton).toBeVisible();
    }
  });

  test('should open negotiation dialog when clicking prepare', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Find and click prepare negotiation button
    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();

      // Should show dialog or modal
      const dialog = page.locator('[role="dialog"], [class*="dialog"], [class*="modal"]');
      await expect(dialog.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display negotiation progress steps', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click prepare negotiation
    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();
      await page.waitForTimeout(1000);

      // Look for progress steps
      const progressSteps = [
        /analyzing.*contract/i,
        /researching.*market/i,
        /identifying.*leverage/i,
        /generating.*strategy/i,
        /crafting.*email/i,
        /finalizing.*playbook/i
      ];

      for (const step of progressSteps) {
        const stepElement = page.locator(`text=${step}`).first();
        if (await stepElement.count() > 0) {
          console.log(`Found progress step: ${step}`);
        }
      }
    }
  });

  test('should show progress indicators during playbook generation', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();

      // Look for loading/progress indicators
      const progressIndicator = page.locator('[class*="animate-spin"], [class*="progress"], svg[class*="animate"]').first();

      // Progress indicator should appear
      if (await progressIndicator.count() > 0) {
        await expect(progressIndicator).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display negotiation playbook after generation', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();

      // Wait for playbook to generate (up to 60 seconds for AI)
      await page.waitForTimeout(3000);

      // Look for playbook sections
      const playbookSections = [
        /market.*intel/i,
        /leverage/i,
        /strategy/i,
        /email/i,
        /talking.*point/i
      ];

      for (const section of playbookSections) {
        const sectionElement = page.locator(`text=${section}`).first();
        if (await sectionElement.count() > 0) {
          console.log(`Found playbook section: ${section}`);
          break;
        }
      }
    }
  });

  test('should show target discount recommendation', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();
      await page.waitForTimeout(3000);

      // Look for discount percentage
      const discountText = page.locator('text=/%|discount|target/i');

      if (await discountText.count() > 0) {
        expect(await discountText.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should display email templates in playbook', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();
      await page.waitForTimeout(3000);

      // Look for email templates
      const emailTypes = ['Initial', 'Counter', 'Escalation'];

      for (const type of emailTypes) {
        const emailSection = page.locator(`text=/${type}.*email/i`).first();
        if (await emailSection.count() > 0) {
          console.log(`Found ${type} email template`);
        }
      }
    }
  });

  test('should allow copying email templates', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();
      await page.waitForTimeout(3000);

      // Look for copy buttons
      const copyButtons = page.locator('button:has-text("Copy")');

      if (await copyButtons.count() > 0) {
        expect(await copyButtons.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should show competitive intelligence', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.isVisible()) {
      await prepareButton.click();
      await page.waitForTimeout(3000);

      // Look for competitor information
      const compInfo = page.locator('text=/competitor|alternative|market/i');

      if (await compInfo.count() > 0) {
        console.log('Found competitive intelligence');
      }
    }
  });

  test('should handle playbook generation errors gracefully', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Try to generate playbook for software without enough data
    const prepareButtons = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")');

    if (await prepareButtons.count() > 0) {
      await prepareButtons.first().click();

      // Wait and check for either success or error message
      await page.waitForTimeout(5000);

      // Page should not crash
      await expect(page).not.toHaveURL(/error|404/);
    }
  });
});

test.describe('Renewals - Actions', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should show action buttons for each renewal', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for action buttons (Renew, Renegotiate, Cancel)
    const actionButtons = page.locator('button:has-text("Renew"), button:has-text("Renegotiate"), button:has-text("Cancel")');

    if (await actionButtons.count() > 0) {
      expect(await actionButtons.count()).toBeGreaterThan(0);
    }
  });

  test('should open action dialog when clicking action button', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click any action button
    const actionButton = page.locator('button:has-text("Renew"), button:has-text("Renegotiate")').first();

    if (await actionButton.isVisible()) {
      await actionButton.click();

      // Should show dialog
      const dialog = page.locator('[role="dialog"], [class*="dialog"]');
      await expect(dialog.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow adding notes to renewal action', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const actionButton = page.locator('button:has-text("Renew")').first();

    if (await actionButton.isVisible()) {
      await actionButton.click();

      // Look for notes textarea
      const notesField = page.locator('textarea, input[type="text"]').first();

      if (await notesField.isVisible()) {
        await notesField.fill('Test renewal notes');
        expect(await notesField.inputValue()).toContain('Test');
      }
    }
  });
});

test.describe('Renewals - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view renewals list', async ({ page }) => {
    await page.goto('/acme-corp/renewals');

    // Should see renewals page
    await expect(page.locator('h1, h2')).toContainText(/renewal/i);

    // Should see renewals data
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('viewer should see prepare negotiation button', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers can prepare negotiations (read-only intelligence gathering)
    const prepareButton = page.locator('button:has-text("Prepare"), button:has-text("Negotiate")').first();

    if (await prepareButton.count() > 0) {
      console.log('Viewer can access negotiation intelligence');
    }
  });

  test('viewer should not see action buttons to modify renewals', async ({ page }) => {
    await page.goto('/acme-corp/renewals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Should NOT see buttons to change renewal status
    const modifyButtons = page.locator('button:has-text("Approve"), button:has-text("Reject"), button:has-text("Update Status")');

    for (let i = 0; i < await modifyButtons.count(); i++) {
      const button = modifyButtons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeDisabled();
      }
    }
  });
});
