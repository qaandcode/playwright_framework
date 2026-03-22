import { test, expect } from '../../fixtures';

test.describe('Authentication @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('login page renders correctly', async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name="email"], #email')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"], #password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('invalid credentials show error @regression', async ({ loginPage }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.assertErrorVisible();
  });

  test('authenticated user can access dashboard @regression', async ({ authenticatedPage }) => {
    if (!process.env.TEST_USER_EMAIL) {
      test.skip(true, 'TEST_USER_EMAIL not set — cannot test authenticated flow');
      return;
    }
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage.locator('h1, [data-testid="dashboard-heading"]')).toBeVisible();
  });
});
