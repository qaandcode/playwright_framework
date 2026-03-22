import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private readonly heading      = '[data-testid="dashboard-heading"], h1';
  private readonly navMenu      = '[data-testid="nav-menu"], nav';
  private readonly userAvatar   = '[data-testid="user-avatar"], [aria-label="User menu"]';
  private readonly logoutButton = '[data-testid="logout-button"], [aria-label="Logout"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/dashboard');
  }

  async assertLoaded(): Promise<void> {
    await this.assertVisible(this.heading);
    await this.assertVisible(this.navMenu);
  }

  async logout(): Promise<void> {
    await this.click(this.userAvatar);
    await this.click(this.logoutButton);
    await this.waitForNavigation(/login/);
  }
}
