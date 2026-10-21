import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { OrdersPage } from '../../pages/orders.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';

test.describe.skip('Бонус 0 + создание заказа (E2E)', () => {
  let loginPage;
  let ordersPage;
  let addOrderPage;

  const customerId = '34975';
  const customerPhone = '+99153371979';

  async function getBonus(page) {
    await page.goto('/customers');

    const idInput = page.locator('input[type="number"]').first();
    await idInput.fill(customerId);

    await page.getByRole('button', { name: 'Фильтровать' }).click();

    const row = page.locator('tr', { hasText: customerId });
    await row.first().click();
    await row.locator('.feather-edit').first().click();

    const modal = page.locator('#customer-edit-modal-206, [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 15000 });

    const bonusInput = modal
      .locator('label:has-text("Бонус")')
      .locator('xpath=ancestor::div[contains(@class,"mb-1")]//input')
      .first();

    const value = await bonusInput.inputValue();

    await modal.getByRole('button', { name: 'Отмена' }).click();
    await expect(modal).toBeHidden();

    return Number(value || 0);
  }

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_LOGIN,
      process.env.ADMIN_PASSWORD
    );

    await expect(page.locator('h1:has-text("Главная")')).toBeVisible();
  });

  test.skip('Бонус = 0 → создание заказа → проверка → начисление → удаление', async ({ page }) => {
    test.setTimeout(120000);

    // =========================
    // 1. бонус до
    // =========================
    const initialBonus = await getBonus(page);
    expect(initialBonus).toBe(0);

    // =========================
    // 2. заказ
    // =========================
    await page.goto('/add-order', { waitUntil: 'domcontentloaded' });

    addOrderPage = new AddOrderPage(page);
    await addOrderPage.waitForLoad();

    await addOrderPage.selectCustomer(customerPhone);
    await addOrderPage.selectBranch('TEST');
    await addOrderPage.selectDelivery('Обычный заказ');
    await addOrderPage.selectPayment('Наличные');
    await addOrderPage.selectStatus('Новый');
    await addOrderPage.fillDeliveryCost('0');
    await addOrderPage.fillComment('E2E test');
    await addOrderPage.fillServiceComment('autotest');

    const productInput = page.locator('input[placeholder*="товара"]').first();
    await productInput.click();
    await productInput.fill('МАНТЫ');

    // FIX dropdown
    const dropdown = page.locator('.vs__dropdown-menu');
    await expect(dropdown.first()).toBeVisible({ timeout: 10000 });

    const productOption = dropdown.locator('li.vs__dropdown-option', {
      hasText: 'МАНТЫ С МЯСОМ'
    });

    await productOption.first().click();

    await page.getByRole('button', { name: 'Добавить' }).click();

    await addOrderPage.selectDeliveryDate();
    await addOrderPage.save();

    await page.waitForURL(/\/edit-order\/\d+/);

    // =========================
    // 3. проверка заказа
    // =========================
    await page.goto('/orders');
    ordersPage = new OrdersPage(page);

    await ordersPage.waitForLoad();

    const row = ordersPage.tableRows.filter({ hasText: customerPhone });
    await expect(row.first()).toBeVisible();

    // =========================
    // 4. выполнить заказ
    // =========================
    await page.goto('/orders?status=new');

    const orderRow = page.locator(`tr:has-text("${customerPhone}")`).first();

    await orderRow.locator('.feather-edit').click();

    const modal = page.locator('[role="dialog"], .modal.show').first();
    await expect(modal).toBeVisible();

    await modal.getByLabel('Статус').selectOption({ label: 'Выполнен' });

    await modal.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.locator('text=Форма сохранена')).toBeVisible();

    // =========================
    // 5. бонус
    // =========================
    await page.waitForTimeout(3000);

    const afterBonus = await getBonus(page);
    console.log('BONUS AFTER COMPLETE:', afterBonus);

    expect(afterBonus).toBeCloseTo(29.4, 1);

    // =========================
     // 5. УДАЛЕНИЕ (В конце )
        // =========================
        await page.goto('/orders');

        await ordersPage.waitForLoad();

        const deleteRow = ordersPage.tableRows.filter({
          hasText: customerPhone
        });

        await expect(deleteRow.first()).toBeVisible();

        // открыть delete modal
        await deleteRow.first()
          .locator('button[data-bs-toggle="modal"]')
          .first()
          .click();

        // именно кнопка в модалке
        const confirmDelete = page.locator('button.btn-danger:has-text("Удалить навсегда")');

        await expect(confirmDelete).toBeVisible({ timeout: 10000 });
        await confirmDelete.click();

        //  исчезновения строки
        // await expect(deleteRow.first()).toHaveCount(0, { timeout: 15000 });

    // =========================
    // 6. бонус снова
    // =========================
    await page.waitForTimeout(3000);

    const bonusAfterDelete = await getBonus(page);
    console.log('BONUS AFTER DELETE:', bonusAfterDelete);

    expect(bonusAfterDelete).toBe(0);
  });
});