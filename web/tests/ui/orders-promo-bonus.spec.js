import { test, expect } from '@playwright/test';

// Временно пропущен, т.к. нужно создать промокод
test.describe.skip('Промокод + бонус (5% кешбек) — ВРЕМЕННО ПРОПУЩЕН', () => {
  test('заглушка', async ({ page }) => {
    expect(true).toBe(true);
  });
});
//import { test, expect } from '@playwright/test';
//import { LoginPage } from '../../pages/login.page.js';
//import { OrdersPage } from '../../pages/orders.page.js';
//import { AddOrderPage } from '../../pages/add-order.page.js';
//
//test.describe.skip('Промокод + бонус (5% )', () => {
//  let loginPage;
//  let ordersPage;
//  let addOrderPage;
//
//  const customerId = '34975';
//  const customerPhone = '+99153371979';
//  const promoCode = 'тест1_безусловный';
//
//  async function getBonus(page) {
//    await page.goto('/customers');
//
//    const idInput = page.locator('input[type="number"]').first();
//    await idInput.fill(customerId);
//
//    await page.getByRole('button', { name: 'Фильтровать' }).click();
//
//    const row = page.locator('tr', { hasText: customerId });
//    await row.first().click();
//    await row.locator('.feather-edit').first().click();
//
//    const modal = page.locator('[role="dialog"]').first();
//    await expect(modal).toBeVisible({ timeout: 15000 });
//
//    const bonusInput = modal
//      .locator('label:has-text("Бонус")')
//      .locator('xpath=ancestor::div[contains(@class,"mb-1")]//input')
//      .first();
//
//    const value = await bonusInput.inputValue();
//
//    await modal.getByRole('button', { name: 'Отмена' }).click();
//    await expect(modal).toBeHidden();
//
//    return Number(value || 0);
//  }
//
//  test.describe.skip(async ({ page }) => {
//    loginPage = new LoginPage(page);
//
//    await loginPage.goto();
//    await loginPage.login(
//      process.env.ADMIN_LOGIN,
//      process.env.ADMIN_PASSWORD
//    );
//
//    await expect(page.locator('h1:has-text("Главная")')).toBeVisible();
//  });
//
//  test.skip('Промокод + бонус (5% )', async ({ page }) => {
//    test.setTimeout(120000);
//
//    // 1. бонус до
//    const initialBonus = await getBonus(page);
//    expect(initialBonus).toBe(0);
//
//    // 2. создать заказ
//    await page.goto('/add-order', { waitUntil: 'domcontentloaded' });
//
//    addOrderPage = new AddOrderPage(page);
//    await addOrderPage.waitForLoad();
//
//    await addOrderPage.selectCustomer(customerPhone);
//    await addOrderPage.selectBranch('TEST');
//    await addOrderPage.selectDelivery('Обычный заказ');
//    await addOrderPage.selectPayment('Наличные');
//    await addOrderPage.selectStatus('Новый');
//    await addOrderPage.fillDeliveryCost('0');
//    await addOrderPage.fillComment('E2E test');
//    await addOrderPage.fillServiceComment('autotest');
//
//    const productInput = page.locator('input[placeholder*="товара"]').first();
//    await productInput.fill('МАНТЫ');
//
//    const dropdown = page.locator('.vs__dropdown-menu');
//    await expect(dropdown.first()).toBeVisible({ timeout: 10000 });
//
//    await dropdown.locator('li.vs__dropdown-option', {
//      hasText: 'МАНТЫ С МЯСОМ'
//    }).first().click();
//
//    await page.getByRole('button', { name: 'Добавить' }).click();
//
//    await addOrderPage.selectDeliveryDate();
//    await addOrderPage.save();
//
//    await page.waitForURL(/\/edit-order\/\d+/);
//
//    // 3. промокод
//    const promoInput = page.locator('input[placeholder="Введите промокод"]');
//    await expect(promoInput).toBeVisible();
//
//    await promoInput.fill(promoCode);
//
//    const applyBtn = page.locator('button:has-text("Применить")');
//    await expect(applyBtn).toBeVisible();
//    await applyBtn.click();
//
//    // 4. открыть заказ в редактировании
//    await page.goto('/orders?status=new');
//
//    const orderRow = page.locator(`tr:has-text("${customerPhone}")`).first();
//    await expect(orderRow).toBeVisible();
//
//    await orderRow.locator('.feather-edit').click();
//
//    const modal = page.locator('[role="dialog"], .modal.show').first();
//    await expect(modal).toBeVisible();
//
//    // 5. СТАТУС ВЫПОЛНЕН
//    await modal.getByLabel('Статус')
//      .selectOption({ label: 'Выполнен' });
//
//  const getText = async (value) => {
//    return modal.locator('span, td').filter({
//      hasText: new RegExp(`${value}\\s?с`)
//    });
//  };
//
//  //await expect(await getText(980)).toBeVisible();
//  await expect(await getText(931)).toBeVisible();
//  await expect(await getText(-49)).toBeVisible();
//
//   // =========================
//   // СОХРАНИТЬ
//   // =========================
//   await modal.getByRole('button', { name: 'Сохранить' }).click();
//
//   await expect(page.locator('text=Форма сохранена')).toBeVisible();
//
//    // 9. бонус проверка
//    const afterBonus = await getBonus(page);
//    console.log('BONUS AFTER COMPLETE:', afterBonus);
//
//    expect(afterBonus).toBe(0);
//
//    // 10. удаление
//    ordersPage = new OrdersPage(page);
//
//    await page.goto('/orders');
//    await ordersPage.waitForLoad();
//
//    const deleteRow = ordersPage.tableRows.filter({
//      hasText: customerPhone
//    });
//
//    await deleteRow.first().locator('button[data-bs-toggle="modal"]').click();
//
//    const confirmDelete = page.locator(
//      'button.btn-danger:has-text("Удалить навсегда")'
//    );
//
//    await confirmDelete.click();
//
//    await page.waitForTimeout(2000);
//  });
//});