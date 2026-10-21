// tests/ui/delivery.spec.js
// read-only: страница управляет живыми зонами доставки и ценами по
// филиалам, поэтому тесты только читают и проверяют отображение, без Save
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { DeliveryPage } from '../../pages/delivery.page.js';

test.describe('Доставка', () => {
  let loginPage;
  let deliveryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    deliveryPage = new DeliveryPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await deliveryPage.goto();
    await deliveryPage.waitForLoad();
  });

  test('Страница загружается и показывает зоны доставки', async () => {
    await expect(deliveryPage.heading).toBeVisible({ timeout: 15000 });

    const zoneCount = await deliveryPage.titleInputs.count();
    expect(zoneCount).toBeGreaterThan(0);

    const firstTitle = await deliveryPage.titleInputs.first().inputValue();
    expect(firstTitle.length).toBeGreaterThan(0);
  });

  test('У каждой зоны корректная цена и совпадающее количество полей', async () => {
    const titleCount = await deliveryPage.titleInputs.count();
    const colorCount = await deliveryPage.colorSelects.count();
    const priceCount = await deliveryPage.priceInputs.count();

    expect(titleCount).toBe(colorCount);
    expect(titleCount).toBe(priceCount);

    for (let i = 0; i < priceCount; i++) {
      const price = Number(await deliveryPage.priceInputs.nth(i).inputValue());
      expect(price).toBeGreaterThanOrEqual(0);
    }
  });

  test('Карта зон доставки отображается', async () => {
    await expect(deliveryPage.mapContainer).toBeVisible({ timeout: 15000 });
  });

  test('Кнопки добавления зоны и "Сохранить" присутствуют на странице', async () => {
    await expect(deliveryPage.addZoneButton).toBeVisible();
    await expect(deliveryPage.saveButton).toBeVisible();
  });
});
