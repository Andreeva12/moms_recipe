// pages/delivery.page.js
import { BasePage } from './base.page';

export class DeliveryPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Доставка' });

    this.titleInputs = page.locator('label:has-text("Заголовок") + input');
    this.colorSelects = page.locator('label:has-text("Цвет") + select');
    this.priceInputs = page.locator('label:has-text("Цена") + input');

    this.mapContainer = page.locator('.leaflet-container');
    this.addZoneButton = page.locator('button:has(i[data-name="plus"])').first();
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
  }

  async goto() {
    await super.goto('/delivery');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.titleInputs.first().waitFor({ state: 'visible', timeout: 15000 });
  }
}
