import { type Page, type Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.logger = new Logger(this.constructor.name);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  async navigate(path: string): Promise<void> {
    this.logger.debug(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  async assertVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async assertNotVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async assertText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async assertUrl(urlOrPattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlOrPattern);
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  async click(selector: string): Promise<void> {
    this.logger.debug(`Click: ${selector}`);
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string): Promise<void> {
    this.logger.debug(`Fill: ${selector}`);
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  // ── Waits ──────────────────────────────────────────────────────────────────
  async waitForSelector(selector: string): Promise<Locator> {
    const loc = this.page.locator(selector);
    await loc.waitFor();
    return loc;
  }

  async waitForNavigation(urlOrPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlOrPattern);
  }

  // ── Screenshots ────────────────────────────────────────────────────────────
  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
