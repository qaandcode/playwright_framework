import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DataTableComponent — reusable abstraction for any data table in the app.
 * Handles sorting, filtering, pagination, and row interactions.
 */
export class DataTableComponent {
  private readonly table: Locator;
  private readonly rows: Locator;
  private readonly headers: Locator;
  private readonly pagination: Locator;
  private readonly searchInput: Locator;

  constructor(
    private readonly page: Page,
    private readonly tableSelector = 'table'
  ) {
    this.table = page.locator(tableSelector);
    this.rows = page.locator(`${tableSelector} tbody tr`);
    this.headers = page.locator(`${tableSelector} thead th`);
    this.pagination = page.locator('[data-testid="pagination"], .pagination');
    this.searchInput = page.locator('[data-testid="table-search"], input[placeholder*="Search"]');
  }

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.headers.all();
    return Promise.all(headers.map(h => h.innerText()));
  }

  async getCellValue(row: number, column: number): Promise<string> {
    return this.page.locator(`${this.tableSelector} tbody tr:nth-child(${row}) td:nth-child(${column})`).innerText();
  }

  async getRowData(row: number): Promise<string[]> {
    const cells = await this.page.locator(`${this.tableSelector} tbody tr:nth-child(${row}) td`).all();
    return Promise.all(cells.map(c => c.innerText()));
  }

  async getAllRowData(): Promise<string[][]> {
    const rowCount = await this.getRowCount();
    const data: string[][] = [];
    for (let i = 1; i <= rowCount; i++) {
      data.push(await this.getRowData(i));
    }
    return data;
  }

  async clickRow(row: number) {
    await this.rows.nth(row - 1).click();
  }

  async clickActionInRow(row: number, actionLabel: string) {
    const rowLocator = this.rows.nth(row - 1);
    await rowLocator.locator(`button:has-text("${actionLabel}"), [aria-label="${actionLabel}"]`).click();
  }

  async sortByColumn(headerText: string) {
    await this.headers.filter({ hasText: headerText }).click();
  }

  async searchTable(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForResponse(r => r.status() === 200);
  }

  async goToNextPage() {
    await this.pagination.locator('[aria-label="Next page"], button:has-text("Next")').click();
  }

  async goToPreviousPage() {
    await this.pagination.locator('[aria-label="Previous page"], button:has-text("Previous")').click();
  }

  async goToPage(pageNumber: number) {
    await this.pagination.locator(`button:has-text("${pageNumber}")`).click();
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertRowCount(expected: number) {
    await expect(this.rows).toHaveCount(expected);
  }

  async assertCellContains(row: number, column: number, text: string) {
    const cell = this.page.locator(`${this.tableSelector} tbody tr:nth-child(${row}) td:nth-child(${column})`);
    await expect(cell).toContainText(text);
  }

  async assertColumnExists(headerText: string) {
    await expect(this.headers.filter({ hasText: headerText })).toBeVisible();
  }

  async assertEmpty() {
    await expect(this.rows).toHaveCount(0);
  }
}
