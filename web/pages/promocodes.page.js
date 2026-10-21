// pages/promocodes.page.js
export class PromocodesPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Промокоды' });
    this.addButton = page.locator('a[href="/add-promocode"]');
    this.searchInput = page.locator('input[placeholder="Введите промокод"]');
    this.searchButton = page.locator('.top-search button');
    this.limitSelect = page.locator('select:right-of(:text("Показать"))').first();
    this.statusSelect = page.locator('select').nth(1);
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
  }

  async goto() {
    await this.page.goto('/promocodes');
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
    await this.table.waitFor({ state: 'visible', timeout: 15000 });
  }

  async searchPromocode(code) {
    await this.searchInput.fill(code);
    await this.searchButton.click();
  }

  async getFirstPromocodeId() {
    const count = await this.tableRows.count();
    if (count === 0) return null;
    const firstRow = this.tableRows.first();
    const idCell = firstRow.locator('td').first();
    return await idCell.textContent();
  }

  async clickEditPromocode(code) {
    const row = this.tableRows.filter({ hasText: code });
    const editLink = row.locator('a[href*="/edit-promocode/"]');
    await editLink.click();
  }

  async deletePromocode(code) {
    const row = this.tableRows.filter({ hasText: code });
    const deleteButton = row.locator('button[data-bs-target*="delete"]');
    await deleteButton.click();
    await this.page.locator('.modal-footer .btn-danger').click();
  }
}