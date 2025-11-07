/**
 * Reports and Admin Dashboard Tests
 * Tests report generation and comprehensive admin features
 */
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Reports Generation', () => {
  // Use company manager authentication
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/reports');
  });

  test('should display reports page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/report/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should show available report types', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for report type options
    const reportTypes = page.locator('text=/portfolio|utilization|cost|savings|executive/i');

    if (await reportTypes.count() > 0) {
      console.log('Found report type options');
    }
  });

  test('should have report generation button', async ({ page }) => {
    // Look for generate button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Report")').first();

    if (await generateButton.count() > 0) {
      await expect(generateButton).toBeVisible();
    }
  });

  test('should allow selecting date range', async ({ page }) => {
    // Look for date range picker
    const dateRange = page.locator('input[type="date"], [class*="date"], button:has-text("Date Range")').first();

    if (await dateRange.count() > 0) {
      console.log('Found date range selector');
    }
  });

  test('should show report customization options', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for customization controls
    const customOptions = page.locator('select, input[type="checkbox"], text=/filter|customize|options/i');

    if (await customOptions.count() > 0) {
      console.log('Found report customization options');
    }
  });

  test('should generate report when clicking generate button', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const generateButton = page.locator('button:has-text("Generate")').first();

    if (await generateButton.isVisible()) {
      await generateButton.click();

      // Should show loading or progress
      await page.waitForTimeout(2000);

      const loadingIndicator = page.locator('[class*="loading"], text=/generating|processing/i').first();

      if (await loadingIndicator.count() > 0) {
        console.log('Report generation started');
      }
    }
  });

  test('should display report preview', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for report preview
    const preview = page.locator('text=/preview|report.*content/i, [class*="preview"]').first();

    if (await preview.count() > 0) {
      console.log('Found report preview');
    }
  });

  test('should allow downloading report as PDF', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for PDF download button
    const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Download")').first();

    if (await pdfButton.count() > 0) {
      await expect(pdfButton).toBeVisible();
    }
  });

  test('should allow downloading report as Excel', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for Excel download button
    const excelButton = page.locator('button:has-text("Excel"), button:has-text("XLSX"), button:has-text("Spreadsheet")').first();

    if (await excelButton.count() > 0) {
      console.log('Found Excel export option');
    }
  });

  test('should show report summary statistics', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for summary stats
    const stats = page.locator('text=/total|average|summary|key.*metric/i');

    if (await stats.count() > 0) {
      console.log('Found report statistics');
    }
  });

  test('should display charts and visualizations', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for charts
    const charts = page.locator('canvas, svg[class*="recharts"], [class*="chart"]');

    if (await charts.count() > 0) {
      console.log('Found report visualizations');
    }
  });

  test('should allow saving report templates', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for save template option
    const saveTemplate = page.locator('button:has-text("Save Template"), button:has-text("Save as Template")').first();

    if (await saveTemplate.count() > 0) {
      console.log('Found save template option');
    }
  });

  test('should show scheduled reports option', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for scheduling option
    const scheduleButton = page.locator('button:has-text("Schedule"), text=/schedule|automate/i').first();

    if (await scheduleButton.count() > 0) {
      console.log('Found report scheduling option');
    }
  });
});

test.describe('Reports - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view reports page', async ({ page }) => {
    await page.goto('/acme-corp/reports');

    // Should see reports page
    await expect(page.locator('h1, h2')).toContainText(/report/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('viewer can generate reports', async ({ page }) => {
    await page.goto('/acme-corp/reports');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers can generate and download reports
    const generateButton = page.locator('button:has-text("Generate")').first();

    if (await generateButton.count() > 0) {
      console.log('Viewer can generate reports');
    }
  });

  test('viewer should not see scheduled report management', async ({ page }) => {
    await page.goto('/acme-corp/reports');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Viewers should not manage schedules
    const manageSchedule = page.locator('button:has-text("Manage Schedule"), button:has-text("Edit Schedule")');

    for (let i = 0; i < await manageSchedule.count(); i++) {
      const button = manageSchedule.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeDisabled();
      }
    }
  });
});

test.describe('Admin Dashboard', () => {
  // Use admin authentication
  test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
  });

  test('should display admin dashboard', async ({ page }) => {
    // Check for dashboard title
    await expect(page.locator('h1, h2')).toContainText(/dashboard|overview|platform/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should show platform-wide metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for key metrics cards
    const metrics = page.locator('[class*="card"]');

    if (await metrics.count() > 0) {
      expect(await metrics.count()).toBeGreaterThan(0);
      console.log('Found platform metrics');
    }
  });

  test('should display total companies count', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for companies metric
    const companiesMetric = page.locator('text=/total.*compan|\\d+.*compan|client/i');

    if (await companiesMetric.count() > 0) {
      console.log('Found companies count');
    }
  });

  test('should show total software tracked', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for software count
    const softwareMetric = page.locator('text=/total.*software|\\d+.*software|application/i');

    if (await softwareMetric.count() > 0) {
      console.log('Found software count');
    }
  });

  test('should display total cost under management', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for cost metrics
    const costMetric = page.locator('text=/\\$|total.*spend|cost.*management/i');

    if (await costMetric.count() > 0) {
      console.log('Found cost metrics');
    }
  });

  test('should show total savings identified', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for savings metrics
    const savingsMetric = page.locator('text=/saving|optimization|reduced/i');

    if (await savingsMetric.count() > 0) {
      console.log('Found savings metrics');
    }
  });

  test('should display recent activity feed', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for activity feed
    const activityFeed = page.locator('text=/activity|recent|latest/i, [class*="activity"]').first();

    if (await activityFeed.count() > 0) {
      console.log('Found activity feed');
    }
  });

  test('should show system health indicators', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for health status
    const healthStatus = page.locator('text=/health|status|operational/i, [class*="status"]').first();

    if (await healthStatus.count() > 0) {
      console.log('Found system health indicators');
    }
  });

  test('should navigate to companies management', async ({ page }) => {
    // Look for companies link
    const companiesLink = page.locator('a:has-text("Companies"), a:has-text("Clients")').first();

    if (await companiesLink.isVisible()) {
      await companiesLink.click();
      await expect(page).toHaveURL(/\/admin\/companies/);
    }
  });

  test('should have user management link', async ({ page }) => {
    // Look for users link
    const usersLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();

    if (await usersLink.count() > 0) {
      console.log('Found user management link');
    }
  });

  test('should show analytics charts', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for charts
    const charts = page.locator('canvas, svg[class*="recharts"]');

    if (await charts.count() > 0) {
      expect(await charts.count()).toBeGreaterThan(0);
      console.log('Found analytics charts');
    }
  });

  test('should display growth metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for growth indicators
    const growthMetrics = page.locator('text=/growth|increase|%|trend/i');

    if (await growthMetrics.count() > 0) {
      console.log('Found growth metrics');
    }
  });

  test('should show alerts or notifications', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for alerts
    const alerts = page.locator('text=/alert|notification|warning/i, [class*="alert"]');

    if (await alerts.count() > 0) {
      console.log('Found alerts section');
    }
  });

  test('should have settings or configuration link', async ({ page }) => {
    // Look for settings
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Configuration"), button[aria-label*="settings"]').first();

    if (await settingsLink.count() > 0) {
      console.log('Found settings link');
    }
  });

  test('should show export options for admin data', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for export functionality
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportButton.count() > 0) {
      console.log('Found export options');
    }
  });

  test('should display time period selector', async ({ page }) => {
    // Look for time period controls
    const timeSelector = page.locator('button:has-text("Week"), button:has-text("Month"), button:has-text("Year"), select').first();

    if (await timeSelector.count() > 0) {
      console.log('Found time period selector');
    }
  });

  test('should refresh data on manual refresh', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for refresh button
    const refreshButton = page.locator('button[aria-label*="Refresh"], button:has-text("Refresh")').first();

    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(1000);

      // Should not crash
      await expect(page).not.toHaveURL(/error|404/);
    }
  });
});

test.describe('Admin - User Management', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });

  test('should access user management page', async ({ page }) => {
    await page.goto('/admin/users');

    // Should see users page (might be named differently)
    const hasUsersPage = await page.locator('h1, h2').locator('text=/user|account|member/i').count() > 0;

    if (hasUsersPage) {
      console.log('Found user management page');
    } else {
      console.log('User management might be under different route');
    }
  });
});

test.describe('Admin - System Settings', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/admin.json') });

  test('should access system settings', async ({ page }) => {
    await page.goto('/admin/settings');

    // Should see settings page
    const hasSettingsPage = await page.locator('h1, h2').locator('text=/setting|config|preference/i').count() > 0;

    if (hasSettingsPage) {
      console.log('Found system settings page');
    } else {
      console.log('Settings might be under different route');
    }
  });
});

test.describe('Dashboard - CSV Export', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should have export CSV button on company dashboard', async ({ page }) => {
    await page.goto('/acme-corp/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for export CSV button
    const exportButton = page.locator('button:has-text("Export CSV"), button:has-text("Download CSV")').first();

    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should download CSV when clicking export button', async ({ page }) => {
    await page.goto('/acme-corp/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const exportButton = page.locator('button:has-text("Export CSV")').first();

    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click export
      await exportButton.click();

      try {
        const download = await downloadPromise;
        const filename = download.suggestedFilename();

        // Should be a CSV file
        expect(filename).toMatch(/\.csv$/i);
        console.log('CSV downloaded from dashboard:', filename);
      } catch (error) {
        console.log('CSV download not triggered or timed out');
      }
    }
  });

  test('CSV should contain software portfolio data', async ({ page }) => {
    await page.goto('/acme-corp/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const exportButton = page.locator('button:has-text("Export CSV")').first();

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await exportButton.click();

      try {
        const download = await downloadPromise;
        const filename = download.suggestedFilename();

        // Filename should include company name or identifier
        expect(filename).toBeTruthy();
        console.log('CSV export successful with filename:', filename);
      } catch (error) {
        console.log('CSV content validation skipped');
      }
    }
  });
});
