// tests/ui/import.spec.js
// read-only: "Сохранить" меняет живое расписание импорта, "Импортировать"
// запускает реальный импорт данных — обе кнопки только проверяются на
// наличие, ни одна не нажимается
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ImportPage } from '../../pages/import.page.js';

test.describe('Раздел "Импорт"', () => {
  let loginPage;
  let importPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    importPage = new ImportPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await importPage.goto();
    await importPage.waitForLoad();
  });

  test('Страница загружается и показывает текущий интервал импорта', async () => {
    await expect(importPage.heading).toBeVisible({ timeout: 15000 });

    const intervalValue = await importPage.intervalSelect.inputValue();
    expect(intervalValue.length).toBeGreaterThan(0);
  });

  test('Чекбокс источника "Товары" присутствует на странице', async () => {
    await expect(importPage.productsCheckbox).toBeVisible();
  });

  test('Кнопки "Сохранить" и "Импортировать" присутствуют на странице', async () => {
    await expect(importPage.saveButton).toBeVisible();
    await expect(importPage.importButton).toBeVisible();
  });
});
