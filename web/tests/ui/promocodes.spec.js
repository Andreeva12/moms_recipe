// tests/promocodes.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { PromocodesPage } from '../../pages/promocodes.page.js';
import { PromocodeFormPage } from '../../pages/promocode-form.page.js';

test.describe('Раздел "Промокоды"', () => {
  let loginPage;
  let promocodesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    promocodesPage = new PromocodesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await promocodesPage.goto();
    await promocodesPage.waitForLoad();
  });

  test('Загрузка страницы списка промокодов', async () => {
    await expect(promocodesPage.heading).toBeVisible();
    await expect(promocodesPage.addButton).toBeVisible();
    await expect(promocodesPage.searchInput).toBeVisible();
    await expect(promocodesPage.searchButton).toBeVisible();
    await expect(promocodesPage.table).toBeVisible();
  });

  test('Создание нового промокода', async ({ page }) => {
    const timestamp = Date.now();
    const promocode = `TEST${timestamp}`;
    const titleRu = `Тестовый промокод ${timestamp}`;
    const titleKg = `Тесттик промокод ${timestamp}`;

    await promocodesPage.addButton.click();
    const formPage = new PromocodeFormPage(page);
    await formPage.waitForLoad();

    await formPage.fillGeneralInfo(titleRu, titleKg, promocode);
    await formPage.selectPersonalization('Общий');
    await formPage.selectCondition('Безусловный');
    await formPage.selectRewardType('Фиксированная скидка');
    await formPage.setFixedDiscountSum(100);
    await formPage.selectRestriction('Без ограничений');
    await formPage.setStartDate();
    await formPage.selectExpiryType('Количество дней после получения промокода');
    await formPage.setExpiryDays(1);
    await formPage.saveAndClose();

    await promocodesPage.waitForLoad();
    await promocodesPage.searchPromocode(promocode);
    await promocodesPage.waitForLoad();

    const rows = promocodesPage.tableRows;
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(promocode);

    const deleteButton = rows.first().locator('button[data-bs-target*="delete"]');
    await deleteButton.click();
    const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await expect(confirmDelete).toBeVisible();
    await confirmDelete.click();
    await page.waitForTimeout(1000);
  });

  test('Поиск существующего промокода по коду', async () => {
    await promocodesPage.searchPromocode('тест12_безусловный');

    const row = promocodesPage.tableRows.filter({ hasText: 'тест12_безусловный' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });

  test('Фильтр по статусу работает', async () => {
    await promocodesPage.statusSelect.selectOption('true');
    await promocodesPage.waitForLoad();
    await expect(promocodesPage.table).toBeVisible();

    await promocodesPage.statusSelect.selectOption('false');
    await promocodesPage.waitForLoad();
    await expect(promocodesPage.table).toBeVisible();
  });

  test('Валидация обязательных полей при создании', async ({ page }) => {
    await promocodesPage.addButton.click();
    const formPage = new PromocodeFormPage(page);
    await formPage.waitForLoad();

    await formPage.save();

    const errorToast = page.locator('.toastify.notify-error');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });
});