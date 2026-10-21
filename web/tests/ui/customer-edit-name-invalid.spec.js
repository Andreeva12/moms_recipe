import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

test.describe('имя не должно принимать смайлы', () => {
  const customerId = '32831';

  test('Попытка сохранить имя со смайликом', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. логин
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    // 2. открыть клиентов
    await page.goto('/customers');

    const searchInput = page.locator('input[type="number"]').first();
    await searchInput.fill(customerId);

    await page.getByRole('button', { name: 'Фильтровать' }).click();

    const row = page.locator('tr', { hasText: customerId }).first();
    await expect(row).toBeVisible();

    await row.locator('.feather-edit').first().click();

    // 3. модалка (ОДНА переменная!)
    const modal = page.locator('[id^="customer-edit-modal"], [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 15000 });



    //  ПОЛЕ "ИМЯ"
    const nameInput = modal.locator(
      'label:has-text("Имя") + input, label:has-text("Имя") ~ input'
    ).first();

    await expect(nameInput).toBeVisible();

    const oldName = await nameInput.inputValue();
    console.log('OLD NAME:', oldName);

    const invalidName = oldName + '😀';

    // ввод
    await nameInput.click();
    await nameInput.press('Control+A');
    await nameInput.type(invalidName, { delay: 50 });

    await nameInput.press('Tab');

    // сохранить
    await modal.getByRole('button', { name: /сохранить/i }).click();

    // ошибка
    await expect(
      page.locator('text=/ошиб|валид|invalid|символ|emoji/i').first()
    ).toBeVisible({ timeout: 7000 });

    // 8. закрыть модалку
    const closeBtn = modal.locator('button.btn-close, button[aria-label="Закрыть"]');

    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
    } else {
      await page.keyboard.press('Escape');
    }

    await expect(modal).toBeHidden({ timeout: 5000 });
  });
});