// tests/orders-create-with-new-promocode.spec.js
/*
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';
import { PromocodesPage } from '../../pages/promocodes.page.js';
import { PromocodeFormPage } from '../../pages/promocode-form.page.js';

test.describe('Создание заказа с новым промокодом', () => {
  let loginPage;
  let ordersPage;
  let promocodesPage;

  const customerPhone = '+99123455678910';
  const customerName = 'Auto Test';

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

    while (true) {
      const rows = ordersPage.tableRows.filter({ hasText: phone });
      const count = await rows.count();
      if (count === 0) break;

      const row = rows.first();
      const deleteButton = row.locator('button[data-bs-toggle="modal"]').last();
      await deleteButton.click();

      const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
      await expect(confirmDelete).toBeVisible();
      await confirmDelete.click();

      await page.waitForTimeout(2000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await ordersPage.waitForLoad();

      const newStatusAfter = ordersPage.statusButtons
        .filter({ hasText: /Новый\s*\(\d+\)/ })
        .first();
      if (await newStatusAfter.isVisible()) {
        await newStatusAfter.click();
        await page.waitForTimeout(2000);
      }

      const rowsAfter = ordersPage.tableRows.filter({ hasText: phone });
      const countAfter = await rowsAfter.count();
      expect(countAfter).toBe(0);
    }
  }

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    ordersPage = new OrdersPage(page);
    promocodesPage = new PromocodesPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await expect(page.locator('h1:has-text("Главная")')).toBeVisible({ timeout: 20000 });
  });

  test('Создание промокода, затем заказа, применение промокода при редактировании и проверка скидки', async ({ page }) => {
    test.setTimeout(180000);

    // 1. Удалить старые заказы  покупателя
    await deleteOrdersByPhone(page, customerPhone);

    // 2. Создать уникальный промокод (процентный)
    const timestamp = Date.now();
    const promocode = `TEST${timestamp}`;
    const titleRu = `Тестовый промокод ${timestamp}`;
    const titleKg = `Тесттик промокод ${timestamp}`;
    const percent = 30;
    const maxDiscount = 2000;

    await promocodesPage.goto();
    await promocodesPage.waitForLoad();
    await promocodesPage.addButton.click();

    const promocodeForm = new PromocodeFormPage(page);
    await promocodeForm.waitForLoad();

    await promocodeForm.fillGeneralInfo(titleRu, titleKg, promocode);
    await promocodeForm.selectPersonalization('Общий');
    await promocodeForm.selectCondition('Безусловный');
    await promocodeForm.selectRewardType('Процентная скидка');
    await promocodeForm.setPercentDiscount(percent);
    await promocodeForm.setMaxDiscountSum(maxDiscount);
    await promocodeForm.selectRestriction('Без ограничений');
    await promocodeForm.setStartDate();
    await promocodeForm.selectExpiryType('Количество дней после получения промокода');
    await promocodeForm.setExpiryDays(1);
    await promocodeForm.saveAndClose();

    // 3. Создать заказ
    await page.goto('/add-order', { waitUntil: 'domcontentloaded' });
    const addOrderHeading = page.locator('h1.content-header-title', { hasText: 'Добавить заказ' });
    await expect(addOrderHeading).toBeVisible({ timeout: 30000 });

    const addOrderPage = new AddOrderPage(page);
    await addOrderPage.waitForLoad();

    const address = 'Czumy';
    const comment = 'Тестовый заказ, созданный автотестом';
    const serviceComment = `Создано автотестом ${timestamp}`;
    const productName = 'МАНТЫ С МЯСОМ';
    const quantity = 5;

    await addOrderPage.selectCustomer(customerPhone);
    await addOrderPage.selectBranch('Тыналиева 36');
    await addOrderPage.selectDelivery('Обычный заказ');
    await addOrderPage.selectPayment('Наличные');
    await addOrderPage.selectStatus('Новый');
    await addOrderPage.fillDeliveryCost('0');
    await addOrderPage.fillAddress(address);
    await addOrderPage.fillPhone(customerPhone);
    await addOrderPage.fillName(customerName);
    await addOrderPage.fillComment(comment);
    await addOrderPage.fillServiceComment(serviceComment);
    await addOrderPage.addProduct(productName, quantity);
    await addOrderPage.selectDeliveryDate();

    // сумма заказа до применения промокода
    const orderSum = await addOrderPage.getOrderSum();
    console.log(`Сумма заказа до применения промокода: ${orderSum}`);

    // Сохранить заказ
    await addOrderPage.save();

    await page.waitForURL(/\/edit-order\/\d+/, { timeout: 30000 });

    // 4.  промокод в поле и актив.
    const promocodeInput = page.locator('label:has-text("Промокод") + input, label:has-text("Промокод") ~ input').first();
    const activateButton = page.locator('button:has-text("Активировать")').first();

    await promocodeInput.waitFor({ state: 'visible', timeout: 10000 });
    await promocodeInput.fill(promocode);
    await activateButton.click();

    await page.waitForTimeout(3000);

    const finalSum = await addOrderPage.getFinalSum();
    console.log(`Итоговая сумма после применения промокода: ${finalSum}`);

    //  сумма уменьшилась
    expect(finalSum).toBeLessThan(orderSum);

    await addOrderPage.save();

    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await ordersPage.waitForLoad();

    const newStatusButton = ordersPage.statusButtons
      .filter({ hasText: /Новый\s*\(\d+\)/ })
      .first();

    if (!(await newStatusButton.isVisible())) {
      test.skip('Нет заказов со статусом Новый');
      return;
    }
    await newStatusButton.click();

    await expect(ordersPage.tableRows.first()).toBeVisible({ timeout: 20000 });
    const orderRow = ordersPage.tableRows.filter({ hasText: customerPhone });
    await expect(orderRow.first()).toBeVisible({ timeout: 20000 });

    // 6. Удалить созданный заказ
    const deleteButton = orderRow.first().locator('button[data-bs-toggle="modal"]').last();
    await deleteButton.click();
    const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await expect(confirmDelete).toBeVisible();
    await confirmDelete.click();

    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ordersPage.waitForLoad();

    const newStatusAfter = ordersPage.statusButtons
      .filter({ hasText: /Новый\s*\(\d+\)/ })
      .first();
    if (await newStatusAfter.isVisible()) {
      await newStatusAfter.click();
      await page.waitForTimeout(2000);
    }

    await expect(ordersPage.tableRows.filter({ hasText: customerPhone })).toHaveCount(0, { timeout: 15000 });

    // 7. Удалить созданный промокод
    await promocodesPage.goto();
    await promocodesPage.waitForLoad();
    await promocodesPage.searchPromocode(promocode);
    await promocodesPage.waitForLoad();

    const promocodeRow = promocodesPage.tableRows.first();
    const deletePromoButton = promocodeRow.locator('button[data-bs-target*="delete"]');
    await deletePromoButton.click();
    const confirmDeletePromo = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await expect(confirmDeletePromo).toBeVisible();
    await confirmDeletePromo.click();
    await page.waitForTimeout(1000);
  });
});
*/