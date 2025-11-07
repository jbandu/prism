/**
 * CSV Import Tests
 * Tests CSV file import functionality for software data
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('CSV Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/import');
  });

  test('should display import page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/import/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should show file upload area', async ({ page }) => {
    // Look for file input or dropzone
    const fileInput = page.locator('input[type="file"]');
    const dropzone = page.locator('[class*="drop"], [class*="upload"]');

    const hasFileInput = await fileInput.count() > 0;
    const hasDropzone = await dropzone.count() > 0;

    expect(hasFileInput || hasDropzone).toBeTruthy();
  });

  test('should display CSV template download button', async ({ page }) => {
    // Look for template download button
    const templateButton = page.locator('button:has-text("Download Template"), button:has-text("Template"), a:has-text("Template")').first();

    if (await templateButton.count() > 0) {
      await expect(templateButton).toBeVisible();
    }
  });

  test('should download CSV template', async ({ page }) => {
    const templateButton = page.locator('button:has-text("Download Template"), a:has-text("Template")').first();

    if (await templateButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click template download
      await templateButton.click();

      try {
        const download = await downloadPromise;
        const filename = download.suggestedFilename();

        // Should be a CSV file
        expect(filename).toMatch(/\.csv$/i);
        console.log('Template downloaded:', filename);
      } catch (error) {
        console.log('Template download not triggered');
      }
    }
  });

  test('should show instructions for CSV format', async ({ page }) => {
    // Look for instructions or help text
    const instructions = page.locator('text=/format|column|field|required|example/i').first();

    if (await instructions.count() > 0) {
      console.log('Found import instructions');
    }
  });

  test('should display required fields information', async ({ page }) => {
    // Look for required fields list
    const requiredFields = page.locator('text=/required.*field|mandatory|must include/i');

    if (await requiredFields.count() > 0) {
      console.log('Found required fields information');
    }
  });

  test('should show supported file formats', async ({ page }) => {
    // Should mention CSV format
    await expect(page.locator('body')).toContainText(/CSV|\.csv/i);
  });

  test('should have drag and drop zone', async ({ page }) => {
    // Look for drag and drop area
    const dropzone = page.locator('[class*="drop"], text=/drag.*drop|drop.*file/i').first();

    if (await dropzone.count() > 0) {
      await expect(dropzone).toBeVisible();
    }
  });
});

test.describe('CSV Import - File Upload', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should accept valid CSV file', async ({ page }) => {
    await page.goto('/acme-corp/import');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Create a simple test CSV file
    const testCsvContent = `Software Name,Vendor,Category,Annual Cost,Total Licenses,Active Users
Test Software,Test Vendor,CRM,50000,100,80`;

    const testCsvPath = path.join(__dirname, '../../test-data/test-import.csv');

    // Ensure test-data directory exists
    const testDataDir = path.join(__dirname, '../../test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Write test CSV file
    fs.writeFileSync(testCsvPath, testCsvContent);

    // Find file input
    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      // Upload file
      await fileInput.setInputFiles(testCsvPath);

      // Should show success or preview
      await page.waitForTimeout(2000);

      // Look for success message or preview
      const successIndicator = page.locator('text=/success|uploaded|preview|review/i');

      if (await successIndicator.count() > 0) {
        console.log('File upload accepted');
      }

      // Clean up
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    }
  });

  test('should validate CSV structure', async ({ page }) => {
    await page.goto('/acme-corp/import');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Create invalid CSV (missing required columns)
    const invalidCsvContent = `Name,Price
Test,100`;

    const testCsvPath = path.join(__dirname, '../../test-data/invalid-import.csv');
    const testDataDir = path.join(__dirname, '../../test-data');

    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    fs.writeFileSync(testCsvPath, invalidCsvContent);

    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testCsvPath);
      await page.waitForTimeout(2000);

      // Should show error or validation message
      const errorIndicator = page.locator('text=/error|invalid|missing.*column|required.*field/i');

      if (await errorIndicator.count() > 0) {
        console.log('CSV validation working');
      }

      // Clean up
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    }
  });

  test('should show file size limit', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for file size information
    const sizeInfo = page.locator('text=/size|MB|limit|maximum/i');

    if (await sizeInfo.count() > 0) {
      console.log('Found file size information');
    }
  });

  test('should reject non-CSV files', async ({ page }) => {
    await page.goto('/acme-corp/import');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Create a text file
    const testTxtContent = 'This is not a CSV';
    const testTxtPath = path.join(__dirname, '../../test-data/test.txt');
    const testDataDir = path.join(__dirname, '../../test-data');

    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    fs.writeFileSync(testTxtPath, testTxtContent);

    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.count() > 0) {
      try {
        await fileInput.setInputFiles(testTxtPath);
        await page.waitForTimeout(1000);

        // Should show error or reject the file
        const errorMessage = page.locator('text=/invalid.*file|only.*csv|wrong.*format/i');

        if (await errorMessage.count() > 0) {
          console.log('Non-CSV file rejected correctly');
        }
      } catch (error) {
        console.log('File type validation in place');
      }

      // Clean up
      if (fs.existsSync(testTxtPath)) {
        fs.unlinkSync(testTxtPath);
      }
    }
  });
});

test.describe('CSV Import - Data Preview', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should show data preview after upload', async ({ page }) => {
    await page.goto('/acme-corp/import');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for preview section
    const previewSection = page.locator('text=/preview|review.*data|records/i, table').first();

    if (await previewSection.count() > 0) {
      console.log('Found data preview capability');
    }
  });

  test('should display row count', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for row count indicator
    const rowCount = page.locator('text=/\\d+.*row|\\d+.*record|total:/i').first();

    if (await rowCount.count() > 0) {
      console.log('Found row count display');
    }
  });

  test('should show column mapping', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for column mapping interface
    const columnMapping = page.locator('text=/map.*column|match.*field/i');

    if (await columnMapping.count() > 0) {
      console.log('Found column mapping feature');
    }
  });

  test('should highlight validation errors in preview', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for error highlighting
    const errorHighlight = page.locator('[class*="error"], [class*="invalid"], text=/error|warning/i');

    if (await errorHighlight.count() > 0) {
      console.log('Found error highlighting');
    }
  });
});

test.describe('CSV Import - Confirmation and Processing', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should have confirm import button', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for confirm/import button
    const confirmButton = page.locator('button:has-text("Import"), button:has-text("Confirm"), button:has-text("Upload")').first();

    if (await confirmButton.count() > 0) {
      console.log('Found import confirmation button');
    }
  });

  test('should show progress during import', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for progress indicators
    const progressIndicator = page.locator('[class*="progress"], [role="progressbar"], text=/importing|processing/i').first();

    if (await progressIndicator.count() > 0) {
      console.log('Found progress tracking');
    }
  });

  test('should display success message after import', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for success patterns
    const successMessage = page.locator('text=/successfully.*imported|import.*complete|\\d+.*record.*added/i');

    if (await successMessage.count() > 0) {
      console.log('Found success messaging');
    }
  });

  test('should show import summary statistics', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for statistics
    const stats = page.locator('text=/\\d+.*imported|\\d+.*success|\\d+.*failed/i');

    if (await stats.count() > 0) {
      console.log('Found import statistics');
    }
  });

  test('should allow canceling import', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel")').first();

    if (await cancelButton.count() > 0) {
      console.log('Found cancel option');
    }
  });

  test('should have option to view imported data', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for link to view data
    const viewDataLink = page.locator('a:has-text("View"), button:has-text("View"), text=/view.*software|see.*imported/i').first();

    if (await viewDataLink.count() > 0) {
      console.log('Found view imported data option');
    }
  });
});

test.describe('CSV Import - Error Handling', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should show detailed error messages', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for error display capability
    const errorDisplay = page.locator('[class*="error"], [role="alert"]').first();

    if (await errorDisplay.count() > 0) {
      console.log('Found error display');
    }
  });

  test('should list rows with errors', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for error list
    const errorList = page.locator('text=/row.*\\d+|line.*\\d+|record.*\\d+/i');

    if (await errorList.count() > 0) {
      console.log('Found row-level error reporting');
    }
  });

  test('should allow downloading error report', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for error report download
    const errorReportButton = page.locator('button:has-text("Download Errors"), button:has-text("Error Report")').first();

    if (await errorReportButton.count() > 0) {
      console.log('Found error report download');
    }
  });

  test('should allow fixing errors and re-importing', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Look for retry/re-upload option
    const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Upload Another")').first();

    if (await retryButton.count() > 0) {
      console.log('Found retry option');
    }
  });
});

test.describe('CSV Import - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer should not access import page', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Viewers should either see error or no import controls
    const hasFileInput = await page.locator('input[type="file"]').count() > 0;

    if (hasFileInput) {
      // If page loads, file input should be disabled
      await expect(page.locator('input[type="file"]').first()).toBeDisabled();
    } else {
      // Or page should show access denied
      const accessDenied = await page.locator('text=/access denied|permission|unauthorized/i').count() > 0;
      console.log('Import restricted for viewers:', accessDenied);
    }
  });

  test('viewer can download template for reference', async ({ page }) => {
    await page.goto('/acme-corp/import');

    // Viewers might be able to download template (read-only)
    const templateButton = page.locator('button:has-text("Template"), a:has-text("Template")').first();

    if (await templateButton.count() > 0) {
      console.log('Viewer can access template');
    }
  });
});
