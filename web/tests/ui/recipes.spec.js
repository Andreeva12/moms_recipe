// tests/ui/recipes.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { RecipesPage } from '../../pages/recipes.page.js';

test.describe('Раздел "Рецепты"', () => {
  let loginPage;
  let recipesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    recipesPage = new RecipesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await recipesPage.goto();
    await recipesPage.waitForLoad();
  });

  test('Страница загружается и таблица рецептов не пустая', async () => {
    await expect(recipesPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await recipesPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующего рецепта по заголовку', async () => {
    await recipesPage.filterByTitle('Борек с картофелем');

    const row = recipesPage.tableRows.filter({ hasText: 'Борек с картофелем' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });
});
