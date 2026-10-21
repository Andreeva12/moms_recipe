// tests/orders-date-regression.spec.js
/*
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';

test.describe('Regression тесты для раздела "Заказы"', () => {
  let loginPage;
  let ordersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    ordersPage = new OrdersPage(page);

    await loginPage.goto();
      await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
      await page.waitForTimeout(2000);

    await ordersPage.goto();

    await ordersPage.dateFromInput.waitFor({ state: 'visible', timeout: 30000 });

    if (page.url().includes('/login')) {
      await page.screenshot({ path: 'orders-redirect-to-login.png' });
      throw new Error('Редирект на страницу логина вместо /orders');
    }

    await ordersPage.heading.waitFor({ state: 'visible', timeout: 45000 });
  });

  test('Поле "Дата от" не позволяет ввести дату вручную (дефект)', async ({ page }) => {
    const dateFromInput = ordersPage.dateFromInput;
    await dateFromInput.waitFor({ state: 'visible', timeout: 15000 });

    await dateFromInput.clear();
    const initialValue = await dateFromInput.inputValue();

    await dateFromInput.click();
    await page.keyboard.type('02.02.2026');
    await page.waitForLoadState('networkidle')

    const newValue = await dateFromInput.inputValue();

    expect(newValue).toBe(initialValue);
  });
});
*/