/**
 * Authentication Flow Tests
 * Tests login, logout, and role-based access
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/seed-test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login page with form', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page or show error
    await expect(page).toHaveURL(/\/login/);
  });

  test('should successfully login as admin', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Verify admin dashboard elements
    await expect(page.locator('h1')).toContainText(/dashboard|overview/i);
  });

  test('should successfully login as company manager', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_USERS.companyManager.email);
    await page.fill('input[name="password"]', TEST_USERS.companyManager.password);
    await page.click('button[type="submit"]');

    // Should redirect to company dashboard
    await expect(page).toHaveURL(/\/.*\/dashboard/, { timeout: 10000 });

    // Verify dashboard loaded
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i);
  });

  test('should successfully login as viewer', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_USERS.viewer.email);
    await page.fill('input[name="password"]', TEST_USERS.viewer.password);
    await page.click('button[type="submit"]');

    // Should redirect to company dashboard
    await expect(page).toHaveURL(/\/.*\/dashboard/, { timeout: 10000 });
  });

  test('should show validation for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Should show validation messages or stay on page
    await expect(page).toHaveURL(/\/login/);
  });
});
