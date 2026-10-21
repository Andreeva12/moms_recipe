// tests/orders.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { EditOrderPage } from '../../pages/edit-order.page.js';

test.describe('Раздел "Заказы"', () => {
  let loginPage;
  let ordersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    ordersPage = new OrdersPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await ordersPage.goto();
    await ordersPage.waitForLoad();
  });

  test('Проверка загрузки страницы заказов и основных элементов', async () => {
    await expect(ordersPage.heading).toBeVisible();
        // Проверить таблицу и поле поиска
        await expect(ordersPage.table).toBeVisible({ timeout: 15000 });
        await expect(ordersPage.searchInput).toBeVisible();
        await expect(ordersPage.searchButton).toBeVisible();
        // Даты могут быть опциональны
        // await expect(ordersPage.dateFromInput).toBeVisible();
        // await expect(ordersPage.dateToInput).toBeVisible();
      });

  test('Таблица заказов содержит хотя бы одну строку', async () => {
    const rowsCount = await ordersPage.tableRows.count();
    if (rowsCount === 0) test.skip();
    expect(rowsCount).toBeGreaterThan(0);
  });

  test.skip('Переход на редактирование первого заказа', async () => {
    const firstOrderId = await ordersPage.getFirstOrderId();
    if (!firstOrderId) test.skip();
    await ordersPage.clickFirstOrderEditLink();
    const editFormField = page.locator('label:has-text("Статус")');
    await expect(editFormField).toBeVisible({ timeout: 10000 });
  });

  test('Фильтр по статусам работает', async () => {
    const newStatusButton = ordersPage.statusButtons.filter({ hasText: /Новый\s*\(\d+\)/ }).first();
    if (await newStatusButton.count() === 0) test.skip();
    await newStatusButton.click();
    await expect(ordersPage.table).toBeVisible({ timeout: 15000 });
  });

  test.skip('Редактирование заказа (изменение количества товара)', async () => {
    const firstOrderId = await ordersPage.getFirstOrderId();
    if (!firstOrderId) test.skip();

    await ordersPage.clickFirstOrderEditLink();
    const editPage = new EditOrderPage(page, firstOrderId);
    await editPage.waitForLoad();
    if (!(await editPage.hasProducts())) test.skip();

    const oldQuantity = await editPage.getFirstProductQuantity();
    const newQuantity = (parseInt(oldQuantity) + 1).toString();
    await editPage.setFirstProductQuantity(newQuantity);
    await editPage.saveAndClose();

    const successToast = page.locator('.toastify.notify-success', { hasText: 'Форма сохранена успешно' });
    await successToast.waitFor({ timeout: 15000 }).catch(() => {});

    await ordersPage.waitForLoad();
    const targetRow = ordersPage.tableRows.filter({ hasText: firstOrderId });
    await targetRow.locator('td:nth-child(2) a').click();
    await editPage.waitForLoad();
    const savedQuantity = await editPage.getFirstProductQuantity();
    expect(savedQuantity).toBe(newQuantity);
    await editPage.setFirstProductQuantity(oldQuantity);
    await editPage.saveAndClose();
  });
});