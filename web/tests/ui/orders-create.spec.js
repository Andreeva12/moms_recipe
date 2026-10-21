// tests/orders-create.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';

test.describe('Создание заказа', () => {
  let loginPage;
  let ordersPage;
  let addOrderPage;

  const customerPhone = '+99149134722';
  const customerName = 'Test Welcome';

  async function deleteOrdersByPhone(page, phone) {
    const ordersPage = new OrdersPage(page);
    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await ordersPage.waitForLoad();

    const newStatusButton = ordersPage.statusButtons
      .filter({ hasText: /Новый\s*\(\d+\)/ })
      .first();

    if (await newStatusButton.isVisible()) {
      await newStatusButton.click();
      await page.waitForTimeout(2000);
    }

    // Удаляем все заказы с указанным номером
    while (true) {
      const rows = ordersPage.tableRows.filter({ hasText: phone });
      const count = await rows.count();
      if (count === 0) break;

      const row = rows.first();
      const deleteButton = row.locator('button[data-bs-toggle="modal"]');
      await deleteButton.click();

      const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
      await expect(confirmDelete).toBeVisible();
      await confirmDelete.click();

      // Даём время на обработку запроса
      await page.waitForTimeout(2000);

      // Перезагружаем страницу, чтобы получить актуальное состояние
      await page.reload({ waitUntil: 'domcontentloaded' });
      await ordersPage.waitForLoad();

      // Снова применяем фильтр "Новый", если он есть
      const newStatusAfter = ordersPage.statusButtons
        .filter({ hasText: /Новый\s*\(\d+\)/ })
        .first();
      if (await newStatusAfter.isVisible()) {
        await newStatusAfter.click();
        await page.waitForTimeout(2000);
      }

      // Проверяем, что строк с этим номером больше нет
      const rowsAfter = ordersPage.tableRows.filter({ hasText: phone });
      const countAfter = await rowsAfter.count();
      expect(countAfter).toBe(0);
    }
  }

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    ordersPage = new OrdersPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    // дождаться загрузки главной страницы
    await expect(page.locator('h1:has-text("Главная")')).toBeVisible({ timeout: 20000 });
  });

  test('Создание нового заказа с тестовыми данными', async ({ page }) => {
    test.setTimeout(90000);

    // Удалить предыдущие заказы с этим номером
    await deleteOrdersByPhone(page, customerPhone);

    // Перейти на страницу создания заказа
    await page.goto('/add-order', { waitUntil: 'domcontentloaded' });

    const addOrderHeading = page.locator('h1.content-header-title', { hasText: 'Добавить заказ' });
    await expect(addOrderHeading).toBeVisible({ timeout: 30000 });

    addOrderPage = new AddOrderPage(page);
    await addOrderPage.waitForLoad();

    const address = 'Czumy';
    const comment = 'Тестовый заказ, созданный автотестом';
    const serviceComment = `Создано автотестом ${Date.now()}`;
    const productName = 'МАНТЫ С МЯСОМ';
    const quantity = 3;

    await addOrderPage.selectCustomer(customerPhone);
    await addOrderPage.selectBranch('TEST');
    await addOrderPage.selectDelivery('Обычный заказ');
    await addOrderPage.selectPayment('Наличные');
    await addOrderPage.selectStatus('Новый');
    await addOrderPage.fillDeliveryCost('0');
    // await addOrderPage.fillAddress(address);
    // await addOrderPage.fillPhone(customerPhone);
    // await addOrderPage.fillName(customerName);
    await addOrderPage.fillComment(comment);
    await addOrderPage.fillServiceComment(serviceComment);
    await addOrderPage.addProduct(productName, quantity);
    await addOrderPage.selectDeliveryDate();

    // Сохраняем заказ
    await addOrderPage.save();

    // Ждём редирект на страницу редактирования (подтверждение создания)
    await page.waitForURL(/\/edit-order\/\d+/, { timeout: 30000 });

    // Переходим на страницу заказов
    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await ordersPage.waitForLoad();

    // Фильтр по статусу "Новый"
    const newStatusButton = ordersPage.statusButtons
      .filter({ hasText: /Новый\s*\(\d+\)/ })
      .first();

    if (!(await newStatusButton.isVisible())) {
      test.skip('Нет заказов со статусом Новый');
      return;
    }

    await newStatusButton.click();

    // Ждём, когда в таблице появится хотя бы одна строка
    await expect(ordersPage.tableRows.first()).toBeVisible({ timeout: 20000 });

    // Ищем строку с нашим телефоном
    const orderRow = ordersPage.tableRows.filter({ hasText: customerPhone });
    await expect(orderRow.first()).toBeVisible({ timeout: 20000 });

    // Удаляем созданный заказ
    const deleteButton = orderRow.first().locator('button[data-bs-toggle="modal"]');
    await deleteButton.click();

    const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await expect(confirmDelete).toBeVisible();
    await confirmDelete.click();

    // Даём время на обработку
    await page.waitForTimeout(2000);

    // Перезагружаем страницу, чтобы проверить, что заказ действительно удалён
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ordersPage.waitForLoad();

    // Снова применяем фильтр "Новый"
    const newStatusAfter = ordersPage.statusButtons
      .filter({ hasText: /Новый\s*\(\d+\)/ })
      .first();
    if (await newStatusAfter.isVisible()) {
      await newStatusAfter.click();
      await page.waitForTimeout(2000);
    }

    // Проверяем, что строки с нашим номером больше нет
    await expect(ordersPage.tableRows.filter({ hasText: customerPhone })).toHaveCount(0, { timeout: 15000 });
  });
});