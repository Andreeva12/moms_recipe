// tests/ui/groups.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { GroupsPage } from '../../pages/groups.page.js';

test.describe('Раздел "Разделы товаров"', () => {
  let loginPage;
  let groupsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    groupsPage = new GroupsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await groupsPage.goto();
    await groupsPage.waitForLoad();
  });

  test('Страница загружается и таблица разделов не пустая', async () => {
    await expect(groupsPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await groupsPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующего раздела по заголовку', async () => {
    await groupsPage.filterByTitle('МЕСЯЦ РАМАЗАН');

    const row = groupsPage.tableRows.filter({ hasText: 'МЕСЯЦ РАМАЗАН' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
