import { test, expect } from '../../fixtures';

test.describe('Visual Regression @visual', () => {
  test('login page matches snapshot', async ({ page }) => {
    await page.goto('/login');
    // Wait for fonts/images to settle
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,   // allow 2% pixel difference
    });
  });

  test('home page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
