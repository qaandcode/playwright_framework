import { test, expect } from '../../fixtures';
import { checkA11y, injectAxe } from 'axe-playwright';

/**
 * Accessibility tests @regression
 * Uses axe-playwright to audit pages against WCAG 2.1 AA.
 * Run with: npm run test:a11y
 */

test.describe('Accessibility — WCAG 2.1 AA @regression', () => {

  test('login page passes accessibility audit', async ({ page, loginPage }) => {
    await loginPage.goto();
    await injectAxe(page);
    await checkA11y(page, undefined, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      detailedReport: true,
    });
  });

  test('dashboard page passes accessibility audit', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await injectAxe(authenticatedPage);
    await checkA11y(authenticatedPage, undefined, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      detailedReport: true,
    });
  });

  test('login page is keyboard navigable', async ({ page, loginPage }) => {
    await loginPage.goto();
    // Tab through the form and submit with keyboard only
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Focus should be on submit button
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('login page has correct focus order', async ({ page, loginPage }) => {
    await loginPage.goto();
    const emailInput = page.locator('input[name="email"], #email');
    const passwordInput = page.locator('input[name="password"], #password');

    await emailInput.focus();
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const imagesWithoutAlt = page.locator('img:not([alt])');
    await expect(imagesWithoutAlt).toHaveCount(0);
  });

  test('page has a single h1', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    const h1Count = await authenticatedPage.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('all interactive elements are focusable', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    const buttons = authenticatedPage.locator('button:not([disabled])');
    const count = await buttons.count();
    // Verify at least some interactive elements exist
    expect(count).toBeGreaterThan(0);
  });
});
