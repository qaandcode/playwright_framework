import { type Page, type Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import type { FormFields } from '../types';

/**
 * BasePage - all Page Object Models extend this class.
 * Provides shared navigation, waiting, assertion, and interaction helpers
 * so individual POMs stay lean and DRY.
 */
export abstract class BasePage {
  protected logger: Logger;

  constructor(protected readonly page: Page) {
    this.logger = new Logger(this.constructor.name);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async navigate(path = '') {
    this.logger.info(`Navigating to: ${path}`);
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  // ── Element helpers ─────────────────────────────────────────────────────────

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
    return this.page.getByRole(role, options);
  }

  getByText(text: string | RegExp) {
    return this.page.getByText(text);
  }

  getByLabel(label: string | RegExp) {
    return this.page.getByLabel(label);
  }

  getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  async waitForElement(selector: string, timeout = 15_000): Promise<Locator> {
    const el = this.page.locator(selector);
    await el.waitFor({ state: 'visible', timeout });
    return el;
  }

  async waitForElementHidden(selector: string, timeout = 10_000) {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible();
  }

  async isEnabled(selector: string): Promise<boolean> {
    return this.page.locator(selector).isEnabled();
  }

  // ── Interactions ────────────────────────────────────────────────────────────

  async click(selector: string) {
    this.logger.debug(`Click: ${selector}`);
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string) {
    this.logger.debug(`Fill "${selector}" with "${value}"`);
    await this.page.locator(selector).clear();
    await this.page.locator(selector).fill(value);
  }

  async select(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }

  async check(selector: string) {
    await this.page.locator(selector).check();
  }

  async uncheck(selector: string) {
    await this.page.locator(selector).uncheck();
  }

  async hover(selector: string) {
    await this.page.locator(selector).hover();
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Fill multiple form fields at once.
   * @param fields  { selector: value } map
   */
  async fillForm(fields: FormFields) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.fill(selector, String(value));
    }
  }

  /**
   * Upload a file via an <input type="file"> element.
   */
  async uploadFile(selector: string, filePath: string) {
    await this.page.locator(selector).setInputFiles(filePath);
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async assertHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async assertText(selector: string, text: string | RegExp) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async assertTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title);
  }

  async assertUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  async assertCount(selector: string, count: number) {
    await expect(this.page.locator(selector)).toHaveCount(count);
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForToast(message?: string | RegExp) {
    const toast = this.page.locator('[role="alert"], .toast, [data-testid="toast"]').first();
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    if (message) {
      await expect(toast).toContainText(message);
    }
    return toast;
  }

  async dismissModal() {
    await this.page.keyboard.press('Escape');
  }

  async getTableRows(tableSelector = 'table tbody tr'): Promise<Locator[]> {
    return this.page.locator(tableSelector).all();
  }

  async waitForApiResponse(urlPattern: string | RegExp) {
    return this.page.waitForResponse(urlPattern);
  }
}
