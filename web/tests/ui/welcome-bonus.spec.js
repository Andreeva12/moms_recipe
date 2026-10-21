// Приветственные бонусы новому покупателю
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

test.describe('Приветственные бонусы', () => {
  test('Новому покупателю начисляется 100 бонусов', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_LOGIN,
      process.env.ADMIN_PASSWORD
    );

    // Уникальный телефон
    const newPhone = `+991${Date.now().toString().slice(-8)}`;

    //  покупатели
    await page.goto('/customers');

    //  форма создания
    await page.getByRole('button', { name: 'Добавить' }).click();

    const createModal = page
      .locator('.modal-content')
      .filter({ has: page.locator('h5.modal-title:has-text("Добавить")') });

    await expect(createModal).toBeVisible();

    // Заполнить форму
    await createModal
      .locator('label:has-text("Телефон") + input')
      .fill(newPhone);

    await createModal
      .locator('label:has-text("Имя") + input')
      .fill('Test Welcome');

    await createModal
      .locator('label:has-text("Email") + input')
      .fill(`${newPhone}@test.com`);

    await createModal
      .locator('label:has-text("Пароль") + input')
      .fill('12345678');

    //
    await createModal
      .getByRole('button', { name: 'Сохранить' })
      .click();

    await expect(
      page.locator('text=Форма сохранена успешно')
    ).toBeVisible({ timeout: 10000 });

    //
    await page.reload();

    await page.reload();

    //
    await page.waitForLoadState('networkidle');

    //  фильтр
    await page.locator('label:has-text("Телефон") + input').fill(newPhone);

    await page.getByRole('button', { name: 'Фильтровать' }).click();

    const row = page.locator('tr', { hasText: newPhone });
    await expect(row.first()).toBeVisible({ timeout: 10000 });

    //  карточка
    await row.locator('.feather-edit').first().click();

    const customerModal = page.locator('[role="dialog"]').first();

    await expect(customerModal).toBeVisible();

    // модалка становится visible раньше, чем Vue подгрузит данные
    // покупателя в форму — дожидаемся реальной загрузки перед чтением бонуса
    const phoneInModal = customerModal
      .locator('label:has-text("Телефон") + input')
      .first();
    await expect(phoneInModal).toHaveValue(newPhone, { timeout: 15000 });

    // Проверить бонусы
    const bonusInput = customerModal
      .locator('label:has-text("Бонус") + input')
      .first();

    const bonusValue = await bonusInput.inputValue();

    console.log('Бонус клиента:', bonusValue);

    expect(Number(bonusValue)).toBe(100);
    // закрыть модалку
    if (await customerModal.isVisible()) {
      await customerModal
        .getByRole('button', { name: 'Отмена' })
        .click();

      await expect(customerModal).toBeHidden();
    }

    // 6. УДАЛЕНИЕ пользователя
    await row.locator('.feather-trash').first().click();

    // подтверждение удаления
    const confirmModal = page.locator('.modal-content:has-text("Удалить")');
    await expect(confirmModal).toBeVisible();

    await confirmModal
      .getByRole('button', { name: 'Удалить навсегда' })
      .click();

    await expect(page.locator('text=Пункт удален')).toBeVisible();
  });
});