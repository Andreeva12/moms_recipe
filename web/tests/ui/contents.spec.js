// tests/ui/contents.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ContentsPage } from '../../pages/contents.page.js';

test.describe('Раздел "Содержание"', () => {
  let loginPage;
  let contentsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    contentsPage = new ContentsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await contentsPage.goto();
    await contentsPage.waitForLoad();
  });

  test('Страница загружается и список содержания не пустой', async () => {
    await expect(contentsPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await contentsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующей записи по ключу', async () => {
    await contentsPage.filterByKey('privacy');

    const row = contentsPage.tableRows.filter({ hasText: 'privacy' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
