import { type Page, type Locator, expect } from '@playwright/test';

/**
 * ModalComponent — wraps any dialog/modal in the app.
 */
export class ModalComponent {
  private readonly modal: Locator;

  constructor(
    private readonly page: Page,
    private readonly modalSelector = '[role="dialog"], .modal, [data-testid="modal"]'
  ) {
    this.modal = page.locator(modalSelector).first();
  }

  async waitForOpen(timeout = 10_000) {
    await this.modal.waitFor({ state: 'visible', timeout });
  }

  async waitForClose(timeout = 10_000) {
    await this.modal.waitFor({ state: 'hidden', timeout });
  }

  async getTitle(): Promise<string> {
    return this.modal.locator('h1, h2, h3, [data-testid="modal-title"]').innerText();
  }

  async clickConfirm() {
    await this.modal.locator('button:has-text("Confirm"), button:has-text("OK"), button:has-text("Yes"), [data-testid="confirm-btn"]').click();
  }

  async clickCancel() {
    await this.modal.locator('button:has-text("Cancel"), button:has-text("No"), [data-testid="cancel-btn"]').click();
  }

  async clickClose() {
    await this.modal.locator('[aria-label="Close"], button:has-text("Close"), .modal-close').click();
  }

  async dismissWithEscape() {
    await this.page.keyboard.press('Escape');
  }

  async assertOpen() {
    await expect(this.modal).toBeVisible();
  }

  async assertClosed() {
    await expect(this.modal).toBeHidden();
  }

  async assertTitle(text: string | RegExp) {
    await expect(this.modal.locator('h1, h2, h3, [data-testid="modal-title"]')).toContainText(text);
  }
}
