// tests/products.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ProductsPage } from '../../pages/products.page.js';

test.describe('Раздел "Товары"', () => {
  let loginPage;
  let productsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await productsPage.goto();
    await productsPage.waitForLoad();
  });

  test('Открытие формы добавления товара и отмена', async ({ page }) => {
    await productsPage.addButton.waitFor({ state: 'visible', timeout: 15000 });
    await productsPage.addButton.click();

    // добавление товара открывает модалку, а не отдельную страницу
    const modal = page.locator('.modal.show', { has: page.locator('h5.modal-title:has-text("Добавить")') });
    await expect(modal).toBeVisible({ timeout: 15000 });

    const cancelButton = modal.getByRole('button', { name: 'Отмена' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(modal).toBeHidden({ timeout: 10000 });
    await expect(productsPage.table).toBeVisible({ timeout: 10000 });
  });

  test('Поиск существующего товара по заголовку', async () => {
    await productsPage.filterByTitle('тест');

    const row = productsPage.tableRows.filter({ hasText: 'тест' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });

  test('Валидация обязательных полей при создании', async ({ page }) => {
    await productsPage.addButton.click();

    const modal = page.locator('.modal.show', { has: page.locator('h5.modal-title:has-text("Добавить")') });
    await expect(modal).toBeVisible({ timeout: 15000 });

    // пустая форма
    await modal.locator('button:has-text("Сохранить")').click();

    const errorToast = page.locator('.toastify.notify-error', { hasText: 'Форма содержит ошибки' });
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    const invalidFeedback = modal.locator('.invalid-feedback');
    await expect(invalidFeedback.first()).toBeVisible();
    expect(await invalidFeedback.count()).toBeGreaterThan(0);

    // модалка не закрывается, пока форма не валидна
    await expect(modal).toBeVisible();
  });
});