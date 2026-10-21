// pages/import.page.js
import { BasePage } from './base.page';

export class ImportPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Импорт' });
    this.intervalSelect = page.locator('label:has-text("Интервал запуска импорта") + select');
    this.productsCheckbox = page.locator('.form-check', { hasText: 'Товары' }).locator('input[type="checkbox"]');

    // намеренно не кликаем — меняет живое расписание/запускает реальный импорт
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    this.importButton = page.getByRole('button', { name: 'Импортировать' });
  }

  async goto() {
    await super.goto('/import');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.page.waitForLoadState('networkidle');
  }
}
