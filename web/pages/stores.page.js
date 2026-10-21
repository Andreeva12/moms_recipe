// pages/stores.page.js
import { BasePage } from './base.page';

export class StoresPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Филиалы' });
    this.searchInput = page.locator('input[placeholder="Введите заголовок"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
  }

  async goto() {
    await super.goto('/stores');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByTitle(title) {
    await this.searchInput.fill(title);
    await this.searchButton.click();
  }
}
