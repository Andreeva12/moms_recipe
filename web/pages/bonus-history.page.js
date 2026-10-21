// pages/bonus-history.page.js
import { BasePage } from './base.page';

export class BonusHistoryPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'История кэшбэка' });
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');

    // сводные карточки метрик над таблицей
    this.avgAmountCard = page.locator('text=Средняя сумма кэшбэка на одного покупателя');
    this.avgPercentCard = page.locator('text=Средний % кэшбэка на одного покупателя');
    this.savedTotalCard = page.locator('text=Сэкономлено покупателями');

    // намеренно не кликаем — инициирует скачивание файла
    this.exportButton = page.getByRole('button', { name: 'Экспортировать' });
  }

  async goto() {
    await super.goto('/bonus-history');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }
}
