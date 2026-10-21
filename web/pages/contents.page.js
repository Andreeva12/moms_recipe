// pages/contents.page.js
import { BasePage } from './base.page';

export class ContentsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Содержание' });
    this.searchInput = page.locator('input[placeholder="Введите ключ"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
  }

  async goto() {
    await super.goto('/contents');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByKey(key) {
    await this.searchInput.fill(key);
    await this.searchButton.click();
  }
}
