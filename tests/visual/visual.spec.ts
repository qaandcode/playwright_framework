import { test, expect } from '../../fixtures';

/**
 * Visual regression tests @visual
 * Compares screenshots against stored baselines.
 *
 * First run: generates baseline screenshots automatically.
 * Subsequent runs: diffs against those baselines.
 *
 * To update baselines: npx playwright test --project=visual --update-snapshots
 */

test.describe('Visual Regression @visual', () => {

  test('login page layout', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('dashboard layout — full page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(authenticatedPage).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('dashboard layout — above fold', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveScreenshot('dashboard-above-fold.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    });
  });

  test('navigation component', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    const nav = authenticatedPage.locator('nav, [role="navigation"]').first();
    await expect(nav).toHaveScreenshot('navigation.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('mobile — login page (375px)', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login-mobile.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
    await context.close();
  });
});
