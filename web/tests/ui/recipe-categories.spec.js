// tests/ui/recipe-categories.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { RecipeCategoriesPage } from '../../pages/recipe-categories.page.js';

test.describe('Раздел "Категории рецептов"', () => {
  let loginPage;
  let recipeCategoriesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    recipeCategoriesPage = new RecipeCategoriesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await recipeCategoriesPage.goto();
    await recipeCategoriesPage.waitForLoad();
  });

  test('Страница загружается и таблица категорий рецептов не пустая', async () => {
    await expect(recipeCategoriesPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await recipeCategoriesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующей категории рецепта по заголовку', async () => {
    await recipeCategoriesPage.filterByTitle('Пельмени');

    const row = recipeCategoriesPage.tableRows.filter({ hasText: 'Пельмени' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
