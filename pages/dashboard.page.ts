import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * DashboardPage — the main authenticated landing page.
 * Extend with your app's specific widgets/metrics as needed.
 */
export class DashboardPage extends BasePage {
  private readonly welcomeHeading = 'h1, [data-testid="welcome-heading"]';
  private readonly userAvatar = '[data-testid="user-avatar"], .avatar, [aria-label="User menu"]';
  private readonly logoutButton = '[data-testid="logout"], button:has-text("Logout"), button:has-text("Sign out")';
  private readonly navLinks = 'nav a, [role="navigation"] a';
  private readonly notificationBell = '[data-testid="notifications"], [aria-label="Notifications"]';
  private readonly searchInput = '[data-testid="global-search"], input[placeholder*="Search"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/dashboard');
  }

  async logout() {
    this.logger.info('Logging out');
    await this.click(this.userAvatar);
    await this.click(this.logoutButton);
    await this.page.waitForURL('**/login', { timeout: 10_000 });
  }

  async search(query: string) {
    await this.fill(this.searchInput, query);
    await this.pressKey('Enter');
  }

  async getWelcomeText(): Promise<string> {
    return this.page.locator(this.welcomeHeading).innerText();
  }

  async getNavLinks(): Promise<string[]> {
    const links = await this.page.locator(this.navLinks).all();
    return Promise.all(links.map(l => l.innerText()));
  }

  async assertDashboardLoaded() {
    await this.assertUrl(/\/dashboard/);
    await this.assertVisible(this.welcomeHeading);
    await this.assertVisible(this.userAvatar);
  }

  async assertWelcomeMessage(userName: string) {
    await this.assertText(this.welcomeHeading, userName);
  }
}
