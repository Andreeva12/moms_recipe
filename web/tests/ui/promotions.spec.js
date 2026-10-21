// tests/ui/promotions.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { PromotionsPage } from '../../pages/promotions.page.js';

test.describe('Раздел "Сторис"', () => {
  let loginPage;
  let promotionsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    promotionsPage = new PromotionsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await promotionsPage.goto();
    await promotionsPage.waitForLoad();
  });

  test('Страница загружается и таблица сторис не пустая', async () => {
    await expect(promotionsPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await promotionsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующей сторис по заголовку', async () => {
    await promotionsPage.filterByTitle('тест5');

    const row = promotionsPage.tableRows.filter({ hasText: 'тест5' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
