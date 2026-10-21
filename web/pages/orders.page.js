// pages/orders.page.js
export class OrdersPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Заказы' });
    this.addButton = page.locator('a.btn-add-record[href="/add-order"]');
    this.exportButton = page.locator('button:has-text("Экспорт")');
    this.dateFromInput = page.locator('input[type="date"]').first();
    this.dateToInput = page.locator('input[type="date"]').last();
    // индексация проверена вживую: 0-Показать, 1-Филиал, 2-Статус оплаты, 3-Корзина
    this.limitSelect = page.locator('select').nth(0);
    this.branchSelect = page.locator('select').nth(1);
    this.searchInput = page.locator('input[placeholder="Введите ID"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.paymentStatusSelect = page.locator('select').nth(2);
    this.trashedSelect = page.locator('select').nth(3);
    this.statusButtons = page.locator('.mt-2 button.btn-outline-primary');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr[id^="list-orders-"]');
    this.pagination = page.locator('ul.pagination');
  }

  async goto() {
    await this.page.goto('/orders', { waitUntil: 'networkidle', timeout: 60000 });
    if (this.page.url().includes('/login')) {
      throw new Error('Редирект на логин');
    }
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 60000 });
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async getFirstOrderId() {
    const count = await this.tableRows.count();
    if (count === 0) return null;
    const firstRow = this.tableRows.first();
    await firstRow.waitFor({ state: 'visible' });
    const idCell = firstRow.locator('td').first();
    return await idCell.textContent();
  }

  async clickFirstOrderEditLink() {
    const firstRow = this.tableRows.first();
    await firstRow.waitFor({ state: 'visible' });
    const editLink = firstRow.locator('td:nth-child(2) a');
    await editLink.click();
  }
}