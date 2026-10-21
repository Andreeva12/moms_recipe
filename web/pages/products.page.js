// pages/products.page.js
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Товары' });
    this.addButton = page.locator('button:has-text("Добавить")').first();
    this.categorySelect = page.locator('.top-category select.form-select');
    this.searchInput = page.locator('input[placeholder="Введите заголовок"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
  }

  async filterByTitle(title) {
    await this.searchInput.fill(title);
    await this.searchButton.click();
  }

  async goto() {
    await super.goto('/products');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
  }

  async selectCategory(categoryName) {
    await this.categorySelect.selectOption({ label: categoryName });

    await this.page.waitForResponse(
      res => res.url().includes('/products') && res.status() === 200
    );
  }
}