import { test, expect } from '../../fixtures';
import { DashboardPage } from '../../pages/dashboard.page';

/**
 * Dashboard E2E tests @regression
 * Covers navigation, search, and core dashboard widgets.
 * Adapt selectors and assertions to your actual app layout.
 */

test.describe('Dashboard @regression', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();
    await dashboard.assertDashboardLoaded();
  });

  test('page title is correct', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveTitle(/Dashboard|Home|App/);
  });

  test('navigation links are present', async () => {
    const links = await dashboard.getNavLinks();
    expect(links.length).toBeGreaterThan(0);
  });

  test('search returns results for valid query', async () => {
    await dashboard.search('test');
    // Adjust assertion to your app's search results container
    // await expect(authenticatedPage.locator('.search-results')).toBeVisible();
  });

  test('user avatar / profile menu is visible', async ({ authenticatedPage }) => {
    const avatar = authenticatedPage.locator('[data-testid="user-avatar"], .avatar, [aria-label="User menu"]');
    await expect(avatar).toBeVisible();
  });

  test('page layout matches snapshot @visual', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
