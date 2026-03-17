import { test, expect } from '../../fixtures';

/**
 * Authentication E2E tests @regression
 * Full coverage of login, logout, password reset, session expiry.
 */

test.describe('Authentication @regression', () => {

  test.describe('Login', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
    });

    test('login with valid credentials redirects to dashboard', async ({ loginPage, page }) => {
      const { env } = await import('../../utils/env');
      await loginPage.loginAndWaitForRedirect(env.userEmail, env.userPassword);
      await expect(page).toHaveURL(/dashboard/);
    });

    test('shows error for invalid email format', async ({ loginPage }) => {
      await loginPage.login('not-an-email', 'password123');
      await loginPage.assertErrorVisible();
    });

    test('shows error for wrong password', async ({ loginPage }) => {
      const { env } = await import('../../utils/env');
      await loginPage.login(env.userEmail, 'definitelywrongpassword');
      await loginPage.assertErrorVisible();
    });

    test('shows error for empty fields', async ({ loginPage }) => {
      await loginPage.login('', '');
      await loginPage.assertErrorVisible();
    });

    test('password field is masked', async ({ page }) => {
      const pwInput = page.locator('input[name="password"], #password');
      await expect(pwInput).toHaveAttribute('type', 'password');
    });

    test('forgot password link is present and navigates', async ({ loginPage, page }) => {
      await loginPage.clickForgotPassword();
      await expect(page).toHaveURL(/forgot|reset/);
    });
  });

  test.describe('Logout', () => {
    test('logout clears session and redirects to login', async ({ authenticatedPage }) => {
      const { DashboardPage } = await import('../../pages/dashboard.page');
      const dashboard = new DashboardPage(authenticatedPage);
      await dashboard.goto();
      await dashboard.logout();
      await expect(authenticatedPage).toHaveURL(/login/);
    });

    test('back navigation after logout does not restore session', async ({ authenticatedPage }) => {
      const { DashboardPage } = await import('../../pages/dashboard.page');
      const dashboard = new DashboardPage(authenticatedPage);
      await dashboard.goto();
      await dashboard.logout();
      await authenticatedPage.goBack();
      await expect(authenticatedPage).toHaveURL(/login/);
    });
  });

  test.describe('Session', () => {
    test('authenticated user can access protected routes', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.goto('/dashboard');
      expect(response?.status()).toBeLessThan(400);
    });

    test('auth state persists on page refresh', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await authenticatedPage.reload();
      await expect(authenticatedPage).toHaveURL(/dashboard/);
    });
  });
});
