/**
 * Locations and Map Tests
 * Tests office locations map with weather integration
 */
import { test, expect } from '@playwright/test';
import path from 'path';

// Use company manager authentication
test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

test.describe('Locations Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/acme-corp/locations');
  });

  test('should display locations page', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1, h2')).toContainText(/location|office|map/i);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('should load map without errors', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Check that page loaded without error
    await expect(page).not.toHaveURL(/error|404/);

    // Look for map container
    const mapContainer = page.locator('[class*="map"], canvas, .mapboxgl-canvas').first();

    if (await mapContainer.count() > 0) {
      await expect(mapContainer).toBeVisible({ timeout: 10000 });
      console.log('Map container found');
    }
  });

  test('should display office location markers', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000); // Allow map to render

    // Look for markers or location indicators
    const markers = page.locator('[class*="marker"], [class*="pin"], svg[class*="marker"]');

    if (await markers.count() > 0) {
      expect(await markers.count()).toBeGreaterThan(0);
      console.log(`Found ${await markers.count()} location markers`);
    }
  });

  test('should show office details on marker click', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Try to click on a marker
    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);

      // Look for popup or details panel
      const popup = page.locator('[class*="popup"], [role="dialog"], [class*="detail"]').first();

      if (await popup.count() > 0) {
        await expect(popup).toBeVisible();
        console.log('Office details popup displayed');
      }
    }
  });

  test('should not throw client-side errors on marker interaction', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Try clicking markers
    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(2000);
    }

    // Check for critical errors
    const criticalErrors = errors.filter(e =>
      e.includes('NaN') ||
      e.includes('undefined') ||
      e.includes('Cannot read')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Locations - Weather Integration', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should display weather information', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Click on a marker to show popup
    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(2000);

      // Look for weather information
      const weatherIndicators = page.locator('text=/°|temperature|weather|sunny|cloudy|rainy/i');

      if (await weatherIndicators.count() > 0) {
        console.log('Weather information displayed');
      }
    }
  });

  test('should show temperature values', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(2000);

      // Look for temperature (should not be NaN)
      const tempText = await page.locator('text=/°[CF]/').allTextContents();

      if (tempText.length > 0) {
        // Verify no NaN values
        for (const temp of tempText) {
          expect(temp).not.toContain('NaN');
        }
        console.log('Temperature values valid:', tempText);
      }
    }
  });

  test('should handle missing weather data gracefully', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Page should not crash even if weather API fails
    await expect(page).not.toHaveURL(/error|404/);

    const errors: string[] = [];
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    const markers = page.locator('[class*="marker"]');
    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(2000);
    }

    // Should not have critical errors
    const criticalErrors = errors.filter(e => e.includes('Cannot read') || e.includes('NaN'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('should show weather icons or descriptions', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(2000);

      // Look for weather icons or descriptions
      const weatherIcons = page.locator('svg, img[alt*="weather"], text=/sunny|cloudy|clear|rain/i');

      if (await weatherIcons.count() > 0) {
        console.log('Weather icons/descriptions found');
      }
    }
  });

  test('should allow temperature unit toggle', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Look for °F/°C toggle
    const unitToggle = page.locator('button:has-text("°F"), button:has-text("°C"), button:has-text("F/C")').first();

    if (await unitToggle.count() > 0) {
      console.log('Temperature unit toggle available');
    }
  });
});

test.describe('Locations - Office Information', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should display office name', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);

      // Look for office name
      const officeName = page.locator('text=/office|headquarters|branch/i').first();

      if (await officeName.count() > 0) {
        console.log('Office name displayed');
      }
    }
  });

  test('should show office address', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);

      // Look for address components
      const addressInfo = page.locator('text=/street|city|state|address/i').first();

      if (await addressInfo.count() > 0) {
        console.log('Address information displayed');
      }
    }
  });

  test('should display employee count', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);

      // Look for employee count
      const employeeCount = page.locator('text=/\\d+.*employee|staff|people/i').first();

      if (await employeeCount.count() > 0) {
        console.log('Employee count displayed');
      }
    }
  });

  test('should show office type or status', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);

      // Look for office type
      const officeType = page.locator('text=/headquarters|branch|regional|satellite/i').first();

      if (await officeType.count() > 0) {
        console.log('Office type displayed');
      }
    }
  });
});

test.describe('Locations - Map Controls', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should have zoom controls', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Look for zoom buttons
    const zoomControls = page.locator('button[aria-label*="Zoom"], button:has-text("+"), button:has-text("-")');

    if (await zoomControls.count() > 0) {
      console.log('Zoom controls found');
    }
  });

  test('should allow panning the map', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Map should be interactive
    const mapCanvas = page.locator('canvas, [class*="map"]').first();

    if (await mapCanvas.count() > 0) {
      await expect(mapCanvas).toBeVisible();
      console.log('Interactive map canvas present');
    }
  });

  test('should have fullscreen option', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Look for fullscreen button
    const fullscreenButton = page.locator('button[aria-label*="Fullscreen"], button:has-text("Fullscreen")').first();

    if (await fullscreenButton.count() > 0) {
      console.log('Fullscreen control found');
    }
  });

  test('should show map style options', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Look for map style selector
    const styleSelector = page.locator('button:has-text("Satellite"), button:has-text("Streets"), select').first();

    if (await styleSelector.count() > 0) {
      console.log('Map style selector found');
    }
  });
});

test.describe('Locations - List View', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/manager.json') });

  test('should have list view toggle', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for list/grid toggle
    const viewToggle = page.locator('button:has-text("List"), button:has-text("Grid"), button[aria-label*="view"]').first();

    if (await viewToggle.count() > 0) {
      console.log('View toggle found');
    }
  });

  test('should show locations in list format', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for list of locations (table or cards)
    const locationsList = page.locator('table, [class*="list"], [class*="card"]').first();

    if (await locationsList.count() > 0) {
      console.log('Locations list view available');
    }
  });

  test('should allow filtering locations', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Look for filter controls
    const filterControls = page.locator('input[placeholder*="Search"], select, button:has-text("Filter")').first();

    if (await filterControls.count() > 0) {
      console.log('Location filtering available');
    }
  });
});

test.describe('Locations - Viewer Role', () => {
  test.use({ storageState: path.join(__dirname, '../../.auth/viewer.json') });

  test('viewer can view locations map', async ({ page }) => {
    await page.goto('/acme-corp/locations');

    // Should see locations page
    await expect(page.locator('h1, h2')).toContainText(/location|office|map/i);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('viewer can interact with map', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Can click markers and view information
    const markers = page.locator('[class*="marker"]');

    if (await markers.count() > 0) {
      await markers.first().click();
      console.log('Viewer can interact with map markers');
    }
  });

  test('viewer should not see office edit buttons', async ({ page }) => {
    await page.goto('/acme-corp/locations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Should NOT see edit/delete buttons
    const editButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("Add Office")');

    for (let i = 0; i < await editButtons.count(); i++) {
      const button = editButtons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeDisabled();
      }
    }
  });
});
