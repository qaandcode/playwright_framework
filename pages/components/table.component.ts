import { type Page, type Locator, expect } from '@playwright/test';

export class TableComponent {
  private readonly root: Locator;

  constructor(page: Page, rootSelector = '[data-testid="data-table"], table') {
    this.root = page.locator(rootSelector).first();
  }

  async getRowCount(): Promise<number> {
    return this.root.locator('tbody tr').count();
  }

  async getCell(row: number, col: number): Promise<string> {
    return this.root.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`).innerText();
  }

  async getHeaderLabels(): Promise<string[]> {
    const headers = this.root.locator('thead th');
    const count = await headers.count();
    return Promise.all(Array.from({ length: count }, (_, i) => headers.nth(i).innerText()));
  }

  async clickRow(row: number): Promise<void> {
    await this.root.locator(`tbody tr:nth-child(${row})`).click();
  }

  async assertRowCount(expected: number): Promise<void> {
    await expect(this.root.locator('tbody tr')).toHaveCount(expected);
  }

  async assertVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async searchFor(searchSelector: string, text: string): Promise<void> {
    await this.root.page().locator(searchSelector).fill(text);
  }
}
