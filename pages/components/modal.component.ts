import { type Page, type Locator, expect } from '@playwright/test';

export class ModalComponent {
  private readonly root: Locator;
  private readonly closeBtn: Locator;
  private readonly confirmBtn: Locator;
  private readonly cancelBtn: Locator;
  private readonly title: Locator;

  constructor(page: Page, rootSelector = '[data-testid="modal"], [role="dialog"]') {
    this.root       = page.locator(rootSelector).first();
    this.closeBtn   = this.root.locator('[data-testid="modal-close"], [aria-label="Close"]');
    this.confirmBtn = this.root.locator('[data-testid="modal-confirm"], button:has-text("Confirm"), button:has-text("OK")');
    this.cancelBtn  = this.root.locator('[data-testid="modal-cancel"], button:has-text("Cancel")');
    this.title      = this.root.locator('[data-testid="modal-title"], h2, h3');
  }

  async assertVisible(): Promise<void>  { await expect(this.root).toBeVisible(); }
  async assertHidden(): Promise<void>   { await expect(this.root).toBeHidden(); }

  async getTitle(): Promise<string>     { return this.title.innerText(); }

  async close(): Promise<void>          { await this.closeBtn.click(); }
  async confirm(): Promise<void>        { await this.confirmBtn.click(); }
  async cancel(): Promise<void>         { await this.cancelBtn.click(); }

  async assertTitle(expected: string): Promise<void> {
    await expect(this.title).toContainText(expected);
  }
}
