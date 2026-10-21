// pages/history-promocodes.page.js
import { BasePage } from './base.page';

export class HistoryPromocodesPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'История промокодов' });
    this.searchInput = page.locator('input[placeholder="Введите промокод"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');

    // намеренно не кликаем — инициирует скачивание файла
    this.exportButton = page.getByRole('button', { name: 'Экспортировать' });
  }

  async goto() {
    await super.goto('/history-promocodes');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByPromocode(code) {
    await this.searchInput.fill(code);
    await this.searchButton.click();
  }
}
