/**
 * Authentication Setup for E2E Tests
 * Creates authenticated browser states for different user roles
 */
import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-constants';
import path from 'path';
import { mkdir } from 'fs/promises';

const authDir = path.join(__dirname, '../.auth');

// Ensure auth directory exists
setup.beforeAll(async () => {
  try {
    await mkdir(authDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
});

const adminFile = path.join(authDir, 'admin.json');
const managerFile = path.join(authDir, 'manager.json');
const viewerFile = path.join(authDir, 'viewer.json');

/**
 * Authenticate as Admin
 */
setup('authenticate as admin', async ({ page }) => {
  console.log('Authenticating as admin...');

  await page.goto('/login');

  // Fill in admin credentials
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

  // Verify we're authenticated
  await expect(page.locator('h1, h2')).toContainText(/PRISM Platform Overview/i, { timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: adminFile });

  console.log('✅ Admin authentication saved');
});

/**
 * Authenticate as Company Manager
 */
setup('authenticate as company manager', async ({ page }) => {
  console.log('Authenticating as company manager...');

  await page.goto('/login');

  // Fill in manager credentials
  await page.fill('input[name="email"]', TEST_USERS.companyManager.email);
  await page.fill('input[name="password"]', TEST_USERS.companyManager.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to company dashboard
  await page.waitForURL(/\/.*\/dashboard/, { timeout: 15000 });

  // Verify we're authenticated
  await expect(page.locator('h1, h2')).toContainText(/PRISM Platform Overview/i, { timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: managerFile });

  console.log('✅ Company manager authentication saved');
});

/**
 * Authenticate as Viewer
 */
setup('authenticate as viewer', async ({ page }) => {
  console.log('Authenticating as viewer...');

  await page.goto('/login');

  // Fill in viewer credentials
  await page.fill('input[name="email"]', TEST_USERS.viewer.email);
  await page.fill('input[name="password"]', TEST_USERS.viewer.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to company dashboard
  await page.waitForURL(/\/.*\/dashboard/, { timeout: 15000 });

  // Verify we're authenticated
  await expect(page.locator('h1, h2')).toContainText(/PRISM Platform Overview/i, { timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: viewerFile });

  console.log('✅ Viewer authentication saved');
});
