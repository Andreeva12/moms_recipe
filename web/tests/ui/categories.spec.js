// tests/ui/categories.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { CategoriesPage } from '../../pages/categories.page.js';

test.describe('Раздел "Категории товаров"', () => {
  let loginPage;
  let categoriesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    categoriesPage = new CategoriesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await categoriesPage.goto();
    await categoriesPage.waitForLoad();
  });

  test('Страница загружается и таблица категорий не пустая', async () => {
    await expect(categoriesPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await categoriesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующей категории по заголовку', async () => {
    await categoriesPage.filterByTitle('Завтраки');

    const row = categoriesPage.tableRows.filter({ hasText: 'Завтраки' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
