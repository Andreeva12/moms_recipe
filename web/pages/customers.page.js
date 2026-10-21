// pages/customers.page.js
export class CustomersPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Покупатели' });
    this.nameInput = page.locator('label:has-text("ФИО") + input, label:has-text("ФИО") ~ input').first();
    this.phoneEmailInput = page.locator('label:has-text("Телефон или email") + input, label:has-text("Телефон или email") ~ input').first();
    this.filterButton = page.locator('button:has-text("Фильтровать")');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr[id^="list-customers-"]');
  }

  async goto() {
    await this.page.goto('/customers', { waitUntil: 'networkidle' });
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByName(name) {
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nameInput.fill(name);
    await Promise.all([
      this.page.waitForResponse(res => res.url().includes('/customers') && res.status() === 200, { timeout: 15000 }),
      this.filterButton.click()
    ]);
  }

  async filterByPhone(phone) {
    await this.phoneEmailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.phoneEmailInput.fill(phone);
    await Promise.all([
      this.page.waitForResponse(res => res.url().includes('/customers') && res.status() === 200, { timeout: 15000 }),
      this.filterButton.click()
    ]);
  }

  async getRowByName(name) {
    return this.tableRows.filter({ hasText: name });
  }

  async getRowByPhone(phone) {
    return this.tableRows.filter({ hasText: phone });
  }

  async clickEditCustomer(index = 0) {
    const row = this.tableRows.nth(index);
    // id модалки динамический (customer-edit-modal-<id>), а не статичный
    const editButton = row.locator('.feather-edit');
    await editButton.click();
    await this.page.locator('[id^="customer-edit-modal"]').waitFor({ state: 'visible', timeout: 15000 });
  }
}