import { test, expect } from '../../fixtures';

/**
 * Smoke suite — critical path checks, < 5 minutes.
 * Tagged @smoke so CI can run this as a PR gate.
 *
 * These tests verify the app is alive and core flows work.
 * They run on every push and pull request.
 */

test.describe('Smoke — App availability @smoke', () => {
  test('homepage loads and returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('login page is accessible', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.assertLoginPageLoaded();
  });

  test('authenticated user lands on dashboard', async ({ authenticatedPage, dashboardPage }) => {
    const dashboard = new (await import('../../pages/dashboard.page')).DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.assertDashboardLoaded();
  });

  test('unauthenticated user redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Smoke — Authentication @smoke', () => {
  test('valid credentials allow login', async ({ page, loginPage }) => {
    const { env } = await import('../../utils/env');
    await loginPage.goto();
    await loginPage.loginAndWaitForRedirect(env.userEmail, env.userPassword);
  });

  test('invalid credentials show error', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.assertErrorVisible();
  });
});
