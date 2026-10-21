// tests/gift-in-order.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { CustomersPage } from '../../pages/customers.page.js';
import { CustomerEditModal } from '../../pages/customer-edit.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';
import { deleteOrdersByPhone } from '../../utils/orders.js';

test.describe.skip('Подарок в заказе (мамкоины)', () => {
  let loginPage;
  let customersPage;
  let ordersPage;

  const testPhone = '+99123455678910';
  const testName = 'Auto Test';

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    customersPage = new CustomersPage(page);
    ordersPage = new OrdersPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await deleteOrdersByPhone(page, testPhone);
  });

  test('Создание заказа с подарком за мамкоины', async ({ page }) => {
    await customersPage.goto();
    await customersPage.waitForLoad();
    await customersPage.filterByPhone(testPhone);
    const row = await customersPage.getRowByPhone(testPhone);
    await expect(row).toBeVisible({ timeout: 15000 });
    await customersPage.clickEditCustomer(0);

    const editModal = new CustomerEditModal(page);
    await editModal.waitForLoad();

    const chipsTab = page.locator('button[role="tab"]:has-text("Фишки")');
    if (await chipsTab.count() > 0) {
      await chipsTab.click();
      await page.waitForTimeout(1000);
    }
    await editModal.adjustChips('+10', 'Автотест: добавление мамкоинов');
    await editModal.close();

    await page.goto('/add-order');
    const addOrderPage = new AddOrderPage(page);
    await addOrderPage.waitForLoad();

    await addOrderPage.selectCustomer(testPhone);
    await addOrderPage.selectBranch('Тыналиева 36');
    await addOrderPage.selectDelivery('Обычный заказ');
    await addOrderPage.selectPayment('Наличные');
    await addOrderPage.selectStatus('Новый');
    await addOrderPage.fillDeliveryCost('0');
    await addOrderPage.fillAddress('Czumy');
    await addOrderPage.fillPhone(testPhone);
    await addOrderPage.fillName(testName);
    await addOrderPage.fillComment('Тестовый заказ с подарком');
    await addOrderPage.fillServiceComment(`Автотест ${Date.now()}`);
    await addOrderPage.selectDeliveryDate();
    await addOrderPage.addProduct('МАНТЫ С МЯСОМ', 2);

    const giftBlock = page.locator('text=У клиента есть подарок').first();
    await expect(giftBlock).toBeVisible({ timeout: 10000 });
    const giftSelect = page.locator('.v-select:has(input[placeholder*="Выберите подарок"])').first();
    await giftSelect.click();
    const giftOption = page.locator('.vs__dropdown-option').first();
    await giftOption.waitFor({ state: 'visible', timeout: 5000 });
    await giftOption.click();

    await addOrderPage.save();
    await page.waitForURL(/\/edit-order\/\d+/, { timeout: 30000 });
    await expect(page.locator('table.table tbody tr', { hasText: 'Подарок' })).toBeVisible();

    await deleteOrdersByPhone(page, testPhone);
  });
});