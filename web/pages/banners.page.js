// pages/banners.page.js
import { BasePage } from './base.page';

export class BannersPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Баннеры' });
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
    this.emptyMessage = page.locator('.p-4.text-center', { hasText: 'Ничего не найдено' });
  }

  async goto() {
    await super.goto('/banners');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.page.waitForLoadState('networkidle');
  }
}
