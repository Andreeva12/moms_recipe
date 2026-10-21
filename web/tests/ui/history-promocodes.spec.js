// tests/ui/history-promocodes.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { HistoryPromocodesPage } from '../../pages/history-promocodes.page.js';

test.describe('История промокодов', () => {
  let loginPage;
  let historyPromocodesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    historyPromocodesPage = new HistoryPromocodesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await historyPromocodesPage.goto();
    await historyPromocodesPage.waitForLoad();
  });

  test('Страница загружается и журнал промокодов не пустой', async () => {
    await expect(historyPromocodesPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await historyPromocodesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующего промокода', async () => {
    await historyPromocodesPage.filterByPromocode('тест2_на сумму-и-выше');

    const row = historyPromocodesPage.tableRows.filter({ hasText: 'тест2' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });

  test('Кнопка "Экспортировать" присутствует на странице', async () => {
    await expect(historyPromocodesPage.exportButton).toBeVisible();
  });
});
