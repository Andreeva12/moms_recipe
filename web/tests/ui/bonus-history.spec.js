// tests/ui/bonus-history.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { BonusHistoryPage } from '../../pages/bonus-history.page.js';

test.describe('История кэшбэка', () => {
  let loginPage;
  let bonusHistoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bonusHistoryPage = new BonusHistoryPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await bonusHistoryPage.goto();
    await bonusHistoryPage.waitForLoad();
  });

  test('Страница загружается и журнал кэшбэка не пустой', async () => {
    await expect(bonusHistoryPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await bonusHistoryPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Сводные метрики отображаются', async () => {
    await expect(bonusHistoryPage.avgAmountCard).toBeVisible();
    await expect(bonusHistoryPage.avgPercentCard).toBeVisible();
    await expect(bonusHistoryPage.savedTotalCard).toBeVisible();
  });

  test('Кнопка "Экспортировать" присутствует на странице', async () => {
    await expect(bonusHistoryPage.exportButton).toBeVisible();
  });
});
