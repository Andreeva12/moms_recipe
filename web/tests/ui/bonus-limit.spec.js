import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';

test.describe('Лимит мамкоинов не более 19', () => {
  let loginPage;
  let ordersPage;
  let addOrderPage;

  const customerId = '32831';
  const customerPhone = '+996555666777';

  async function getBalanceFromTable(page) {
    await page.goto('/customers', { waitUntil: 'networkidle' });
    await page.locator('table.invoice-list-table').waitFor({ state: 'visible', timeout: 30000 });

    await page.locator('input[type="number"]').first().fill(customerId);

    const filterButton = page.getByRole('button', { name: 'Фильтровать' });
    await expect(filterButton).toBeEnabled({ timeout: 15000 });
    await filterButton.click();

    const row = page.locator(`tr:has-text("${customerId}")`);
    await expect(row).toBeVisible();

    const balanceCell = row.locator('td').nth(6);
    const balanceText = await balanceCell.textContent();

    return parseInt(balanceText, 10);
  }

  // UI-селект статуса в модалке редактирования заказа откатывает выбор
  // назад ещё до сохранения (баг фронтенда админки), поэтому статус
  // проставляется напрямую через тот же API, что использует сама админка
  async function setOrderStatusViaApi(page, orderId, status) {
    const token = await page.evaluate(() => localStorage.getItem('token'));

    const getRes = await page.request.get(`https://sandbox-api.momsrecipes.fun/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    const order = (await getRes.json()).data;

    order.status = status;
    order._method = 'PUT';

    const putRes = await page.request.post(`https://sandbox-api.momsrecipes.fun/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      data: order
    });

    expect(putRes.ok()).toBeTruthy();
  }

  //
  async function deleteOrdersByPhone(page, phone) {
    const ordersPage = new OrdersPage(page);

    await page.goto('/orders', { waitUntil: 'domcontentloaded' });

    if (ordersPage.waitForLoad) {
      await ordersPage.waitForLoad();
    }

    // важно: фильтр "Новый" не показывает заказы в статусе "Закрыт", а этот
    // тест переводит заказ именно в "Закрыт" — нужна вкладка "Все", иначе
    // заказ (и начисленный по нему бонус) остаются навсегда неудалёнными
    const allStatusButton = ordersPage.statusButtons
      .filter({ hasText: /Все\s*\(\d+\)/ })
      .first();

    if (await allStatusButton.isVisible().catch(() => false)) {
      await allStatusButton.click();
      await page.waitForTimeout(1000);
    }

    let safetyCounter = 0;

    while (safetyCounter < 20) {
      const rows = ordersPage.tableRows.filter({ hasText: phone });
      const count = await rows.count();

      if (count === 0) break;

      const row = rows.first();

      const deleteButton = row.locator(
        'button:has-text("Удалить"), button[title*="Удал"], .feather-trash, .fa-trash, button[data-bs-toggle="modal"]'
      ).first();

      await deleteButton.click();

      const confirmDelete = page.locator(
        '.modal .btn-danger:has-text("Удалить навсегда")'
      );

      await expect(confirmDelete).toBeVisible();
      await confirmDelete.click();

      await page.locator('.modal.show').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      await page.waitForTimeout(1000);

      await page.reload({ waitUntil: 'domcontentloaded' });

      if (ordersPage.waitForLoad) {
        await ordersPage.waitForLoad();
      }

      safetyCounter++;
    }
  }

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    await expect(page.locator('h1:has-text("Главная")')).toBeVisible();
  });

  test('Нельзя накопить более 19 мамкоинов', async ({ page }) => {
    test.setTimeout(120000);

    let currentBalance = await getBalanceFromTable(page);
    expect(currentBalance).toBe(0);

    try {
      await page.goto('/add-order');
      addOrderPage = new AddOrderPage(page);
      await addOrderPage.waitForLoad();

      await addOrderPage.selectCustomer(customerPhone);
      await addOrderPage.selectBranch('TEST');
      await addOrderPage.selectDelivery('Обычный заказ');
      await addOrderPage.selectPayment('Наличные');
      await addOrderPage.selectStatus('Новый');
      await addOrderPage.fillDeliveryCost('0');
      await addOrderPage.fillComment('Тест лимита');
      await addOrderPage.fillServiceComment('autotest');

      const productInput = page.locator('input[placeholder*="товара"]').first();
      await productInput.fill('МАНТЫ');

      await page.locator('.vs__dropdown-menu li', {
        hasText: 'МАНТЫ С МЯСОМ'
      }).first().click();

      const quantityInput = addOrderPage.productQuantityInput;
      await quantityInput.fill('33');

      await addOrderPage.addProductButton.click();

      await addOrderPage.selectDeliveryDate();
      await addOrderPage.save();

      await page.waitForURL(/\/edit-order\/\d+/);

      const orderId = page.url().match(/\/edit-order\/(\d+)/)[1];
      await setOrderStatusViaApi(page, orderId, 'Closed');

      const newBalance = await getBalanceFromTable(page);
      console.log('Balance after order:', newBalance);

      expect(newBalance).toBeLessThanOrEqual(19);
    } finally {
      // уборка выполняется независимо от исхода теста выше — иначе падение
      // на последней проверке (как уже случилось: заказ 139548 остался
      // неудалённым и накопленный бонус блокировал вообще все последующие
      // прогоны, т.к. precondition-проверка выше ожидает баланс 0) оставит
      // заказ и начисленный по нему бонус в sandbox навсегда
      await deleteOrdersByPhone(page, customerPhone);
    }
  });
});