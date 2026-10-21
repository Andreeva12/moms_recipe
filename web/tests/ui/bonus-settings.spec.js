// tests/ui/bonus-settings.spec.js
// read-only: страница управляет живым конфигом кэшбэка для всего приложения,
// поэтому тесты только читают и проверяют отображаемые значения, без Save
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { BonusSettingsPage } from '../../pages/bonus-settings.page.js';

test.describe('Настройки кэшбэка', () => {
  let loginPage;
  let bonusSettingsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bonusSettingsPage = new BonusSettingsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await bonusSettingsPage.goto();
    await bonusSettingsPage.waitForLoad();
  });

  test('Страница загружается и показывает текущие настройки кэшбэка', async () => {
    await expect(bonusSettingsPage.heading).toBeVisible({ timeout: 15000 });

    const tagCount = await bonusSettingsPage.categoryTags.count();
    expect(tagCount).toBeGreaterThan(0);

    await expect(bonusSettingsPage.cashPercentInput).toHaveValue(/^\d+(\.\d+)?$/);
    await expect(bonusSettingsPage.cashlessPercentInput).toHaveValue(/^\d+(\.\d+)?$/);
  });

  test('Тиры кэшбэка по сумме отображаются для наличных и безналичных', async () => {
    const fromCount = await bonusSettingsPage.fromInputs.count();
    const toCount = await bonusSettingsPage.toInputs.count();
    const percentCount = await bonusSettingsPage.percentTierInputs.count();

    expect(fromCount).toBeGreaterThanOrEqual(2);
    expect(fromCount).toBe(toCount);
    expect(fromCount).toBe(percentCount);

    // тиры идут парами блоков (Наличные / Безналичные) — строк должно быть поровну
    expect(fromCount % 2).toBe(0);

    for (let i = 0; i < fromCount; i++) {
      const from = Number(await bonusSettingsPage.fromInputs.nth(i).inputValue());
      const to = Number(await bonusSettingsPage.toInputs.nth(i).inputValue());
      expect(to).toBeGreaterThan(from);
    }
  });

  test('Кнопка "Сохранить" присутствует на странице', async () => {
    await expect(bonusSettingsPage.saveButton).toBeVisible();
  });
});
