import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Selectors — update to match your app
  private readonly emailInput    = '#email, [data-testid="email-input"], input[name="email"]';
  private readonly passwordInput = '[data-testid="password-input"], input[name="password"], #password';
  private readonly submitButton  = '[data-testid="login-button"], button[type="submit"]';
  private readonly errorMessage  = '[data-testid="login-error"], .error-message, [role="alert"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in as ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async loginAndWait(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.waitForNavigation(/dashboard|home|\/app/);
  }

  async getErrorMessage(): Promise<string> {
    return this.page.locator(this.errorMessage).innerText();
  }

  async assertErrorVisible(): Promise<void> {
    await this.assertVisible(this.errorMessage);
  }
}
