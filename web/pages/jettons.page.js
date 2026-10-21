// pages/jettons.page.js
import { BasePage } from './base.page';

export class JettonsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Жетоны' });
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
    this.emptyMessage = page.locator('.p-4.text-center', { hasText: 'Ничего не найдено' });
  }

  async goto() {
    await super.goto('/jettons');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.page.waitForLoadState('networkidle');
  }

  getRowsByRewardKey(key) {
    return this.tableRows.filter({ hasText: key });
  }

  // в системе может быть активен только один розыгрыш одновременно, поэтому
  // ЛЮБОЙ заказ, закрытый другим тестом, пока наш розыгрыш активен, тоже
  // попадёт под этот же ключ — фильтровать нужно по id заказа, а не по ключу
  getRowsByOrderId(orderId) {
    return this.tableRows.filter({ hasText: new RegExp(`\\b${orderId}\\b`) });
  }
}
