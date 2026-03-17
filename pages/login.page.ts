import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LoginPage — covers the sign-in screen.
 * Swap selectors to match your app; logic stays unchanged.
 */
export class LoginPage extends BasePage {
  // ── Selectors ───────────────────────────────────────────────────────────────
  private readonly emailInput = '[data-testid="email"], input[name="email"], #email';
  private readonly passwordInput = '[data-testid="password"], input[name="password"], #password';
  private readonly submitButton = '[data-testid="login-btn"], button[type="submit"]';
  private readonly errorMessage = '[data-testid="error-msg"], .error-message, [role="alert"]';
  private readonly forgotPasswordLink = 'a[href*="forgot"], [data-testid="forgot-password"]';

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    this.logger.info(`Logging in as: ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async loginAndWaitForRedirect(email: string, password: string, redirectPath = '/dashboard') {
    await this.login(email, password);
    await this.page.waitForURL(`**${redirectPath}`, { timeout: 15_000 });
  }

  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.isVisible(this.errorMessage);
    if (!isVisible) return null;
    return this.page.locator(this.errorMessage).innerText();
  }

  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertLoginPageLoaded() {
    await this.assertVisible(this.emailInput);
    await this.assertVisible(this.passwordInput);
    await this.assertVisible(this.submitButton);
  }

  async assertErrorVisible(message?: string) {
    await this.assertVisible(this.errorMessage);
    if (message) await this.assertText(this.errorMessage, message);
  }
}
