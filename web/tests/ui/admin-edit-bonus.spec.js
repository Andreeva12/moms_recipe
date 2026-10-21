import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

test.describe.skip('Админ: редактирование бонусов с комментарием', () => {
  const customerId = '34971';
  const newBonus = 150;
  const reason = 'Тестовое изменение бонуса';

  test.skip('Изменить бонус и проверить историю', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    // 1. Открыть список клиентов
    await page.goto('/customers');

    await page.locator('input[type="number"]').first().fill(customerId);
    await page.getByRole('button', { name: 'Фильтровать' }).click();

    const row = page.locator('tr', { hasText: customerId });
    await expect(row.first()).toBeVisible();

    await row.first().click();
    await row.locator('.feather-edit').first().click();

    let modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // 2. Обновление бонуса
    const bonusInput = modal.locator(
      'label:has-text("Бонус") + input, label:has-text("Бонус") ~ input'
    ).first();

    const reasonInput = modal.locator(
      'label:has-text("Причина изменения бонусов") + input'
    ).first();

    await bonusInput.fill(String(newBonus));
    await reasonInput.fill(reason);

    await modal.getByRole('button', { name: 'Сохранить' }).click();

    // 3.  успешный toast
    await expect(page.locator('text=Форма сохранена успешно'))
      .toBeVisible({ timeout: 10000 });

    // 4.  закрытия модалки
    await expect(page.locator('[role="dialog"]'))
      .toHaveCount(0, { timeout: 10000 });

    // 5.  снова карточку
    await row.first().click();
    await row.locator('.feather-edit').first().click();

    modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // 6. История бонусов
    await modal.locator('button:has-text("История бонусов")').click();

    const historyTable = modal.locator('table tbody');
    await expect(historyTable).toBeVisible();

    const lastRow = historyTable.locator('tr', {
      hasText: reason
    }).first();

    await expect(lastRow).toBeVisible();

    console.log(await lastRow.innerText());

    await expect(lastRow.locator('td').nth(2))
      .toContainText('Изменение бонусов');

    await expect(lastRow.locator('td').nth(2))
      .toContainText(reason);

    await expect(lastRow.locator('td').nth(3))
      .toContainText(process.env.ADMIN_LOGIN);

    await expect(lastRow.locator('td').nth(4))
      .toHaveText('0');

    await expect(lastRow.locator('td').nth(5))
      .toHaveText(String(newBonus));

    // 7. Закрытие
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden({ timeout: 10000 });

    // 8. Восстановление бонуса
    await row.first().click();
    await row.locator('.feather-edit').first().click();

    modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    await modal.locator('button:has-text("Параметры")').click();

    const bonusInputRestore = modal.locator(
      'label:has-text("Бонус") + input, label:has-text("Бонус") ~ input'
    ).first();

    await bonusInputRestore.fill('0');

    await modal.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.locator('text=Форма сохранена успешно'))
      .toBeVisible({ timeout: 10000 });
  });
});