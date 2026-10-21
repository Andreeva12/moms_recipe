// tests/ui/stores.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { StoresPage } from '../../pages/stores.page.js';

test.describe('Раздел "Филиалы"', () => {
  let loginPage;
  let storesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    storesPage = new StoresPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await storesPage.goto();
    await storesPage.waitForLoad();
  });

  test('Страница загружается и таблица филиалов не пустая', async () => {
    await expect(storesPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await storesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующего филиала по заголовку', async () => {
    await storesPage.filterByTitle('Орто-Сай');

    const row = storesPage.tableRows.filter({ hasText: 'Орто-Сай' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
