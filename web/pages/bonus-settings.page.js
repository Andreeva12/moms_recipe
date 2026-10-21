// pages/bonus-settings.page.js
import { BasePage } from './base.page';

export class BonusSettingsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Настройки кэшбэка' });

    this.categorySelect = page.locator('.v-select.vs--multiple').first();
    this.categoryTags = this.categorySelect.locator('.vs__selected');

    this.cashPercentInput = page
      .locator('label:has-text("% наличный способ оплаты") + input, label:has-text("% наличный способ оплаты") ~ input')
      .first();
    this.cashlessPercentInput = page
      .locator('label:has-text("% безналичный способ оплаты") + input, label:has-text("% безналичный способ оплаты") ~ input')
      .first();

    // :text-is() — точное совпадение, иначе "%" зацепил бы и лейблы способов оплаты выше
    this.fromInputs = page.locator('label:text-is("От") + input, label:text-is("От") ~ input');
    this.toInputs = page.locator('label:text-is("До") + input, label:text-is("До") ~ input');
    this.percentTierInputs = page.locator('label:text-is("%") + input, label:text-is("%") ~ input');

    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
  }

  async goto() {
    await super.goto('/bonus-settings');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    // заголовок и лейблы рендерятся сразу, а реальные значения (теги
    // категорий, % ставки, тиры) подгружаются отдельным запросом позже
    await this.categoryTags.first().waitFor({ state: 'visible', timeout: 15000 });
  }
}
