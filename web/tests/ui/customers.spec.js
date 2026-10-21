// tests/customers.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { CustomersPage } from '../../pages/customers.page.js';
import { CustomerEditModal } from '../../pages/customer-edit.page.js';

test.describe('Раздел "Покупатели"', () => {
  let loginPage;
  let customersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    customersPage = new CustomersPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await customersPage.goto();
    await customersPage.waitForLoad();
  });

  test('Поиск существующего покупателя по имени', async () => {
    const customerName = 'Auto Test';
    await customersPage.filterByName(customerName);
    const row = await customersPage.getRowByName(customerName);
    await expect(row).toBeVisible({ timeout: 15000 });
  });

  test('Поиск существующего покупателя по телефону', async () => {
    const customerPhone = '+99123455678910';
    await customersPage.filterByPhone(customerPhone);
    const row = await customersPage.getRowByPhone(customerPhone);
    await expect(row).toBeVisible({ timeout: 15000 });
  });

  test('Редактирование email и адреса покупателя', async ({ page }) => {
    // одноразовый тестовый покупатель — не трогаем реальных/общих фикстур
    const newPhone = `+991${Date.now().toString().slice(-8)}`;
    const newEmail = `${newPhone.slice(1)}@edit-test.com`;
    const newAddress = `Тестовый адрес ${Date.now()}`;

    await page.getByRole('button', { name: 'Добавить' }).click();
    const createModal = page
      .locator('.modal-content')
      .filter({ has: page.locator('h5.modal-title:has-text("Добавить")') });
    await expect(createModal).toBeVisible();

    await createModal.locator('label:has-text("Телефон") + input').fill(newPhone);
    await createModal.locator('label:has-text("Имя") + input').fill('Edit Test');
    await createModal.locator('label:has-text("Email") + input').fill(`${newPhone}@test.com`);
    await createModal.locator('label:has-text("Пароль") + input').fill('12345678');
    await createModal.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.locator('text=Форма сохранена успешно')).toBeVisible({ timeout: 10000 });

    await customersPage.filterByPhone(newPhone);
    const row = await customersPage.getRowByPhone(newPhone);
    await expect(row).toBeVisible({ timeout: 15000 });

    await customersPage.clickEditCustomer(0);
    const editModal = new CustomerEditModal(page);
    await expect(editModal.phoneInput).toHaveValue(newPhone, { timeout: 15000 });

    await editModal.editContactInfo({ email: newEmail, address: newAddress });

    // перепроверяем, что изменения реально сохранились
    await customersPage.clickEditCustomer(0);
    await expect(editModal.phoneInput).toHaveValue(newPhone, { timeout: 15000 });
    await expect(editModal.emailInput).toHaveValue(newEmail);
    await expect(editModal.addressInput).toHaveValue(newAddress);
    await editModal.close();

    // уборка
    await row.locator('.feather-trash').first().click();
    const confirmModal = page.locator('.modal-content:has-text("Удалить")');
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole('button', { name: 'Удалить навсегда' }).click();
    await expect(page.locator('text=Пункт удален')).toBeVisible();
  });
});