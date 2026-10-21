// pages/settings.page.js
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Редактировать настройки' });

    this.sectionNames = [
      'Статус заказа',
      'Способ оплаты',
      'Статус оплаты',
      'Настройки пушей',
      'Способ доставки',
      'Время доставки',
      'Лейблы',
      'Бонусы',
      'Мамкоины',
      'Дополнительно'
    ];

    this.images = page.locator('img');
    // намеренно не кликаем — 10 форм с живым конфигом приложения
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
  }

  async goto() {
    await super.goto('/settings');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    // раздел огромный (798 полей, картинки статусов подгружаются отдельно) —
    // ждём затихания сети, иначе изображения/вкладки читаются до отрисовки
    await this.page.waitForLoadState('networkidle');
  }
}
