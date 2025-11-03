/**
 * Authentication setup for E2E tests
 * Creates authenticated browser contexts for different user roles
 */
import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './seed-test-data';
import path from 'path';

const authDir = path.join(__dirname, '../../.auth');

// Admin authentication
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForURL('/admin/dashboard', { timeout: 10000 });

  // Save authenticated state
  await page.context().storageState({ path: path.join(authDir, 'admin.json') });
});

// Company Manager authentication
setup('authenticate as company manager', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USERS.companyManager.email);
  await page.fill('input[name="password"]', TEST_USERS.companyManager.password);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForURL(/\/.*\/dashboard/, { timeout: 10000 });

  // Save authenticated state
  await page.context().storageState({ path: path.join(authDir, 'manager.json') });
});

// Viewer authentication
setup('authenticate as viewer', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USERS.viewer.email);
  await page.fill('input[name="password"]', TEST_USERS.viewer.password);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForURL(/\/.*\/dashboard/, { timeout: 10000 });

  // Save authenticated state
  await page.context().storageState({ path: path.join(authDir, 'viewer.json') });
});
