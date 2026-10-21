// tests/ui/settings.spec.js
// smoke-тест: страница огромная (798 полей, 10 форм с живым конфигом),
// поэтому проверяем только что всё загружается и рендерится без ошибок,
// без покрытия каждого поля и без клика по "Сохранить"
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { SettingsPage } from '../../pages/settings.page.js';

test.describe('Настройки', () => {
  let loginPage;
  let settingsPage;

  test('Страница загружается без ошибок в консоли', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    loginPage = new LoginPage(page);
    settingsPage = new SettingsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await settingsPage.goto();
    await settingsPage.waitForLoad();

    await expect(settingsPage.heading).toBeVisible({ timeout: 15000 });
    expect(errors, `Ошибки в консоли: ${errors.join('; ')}`).toHaveLength(0);
  });

  test.describe('после логина', () => {
    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      settingsPage = new SettingsPage(page);

      await loginPage.goto();
      await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
      await settingsPage.goto();
      await settingsPage.waitForLoad();
    });

    test('Все разделы настроек присутствуют на странице', async ({ page }) => {
      // это <button role="tab">, явный role переопределяет доступную роль
      for (const name of settingsPage.sectionNames) {
        await expect(page.getByRole('tab', { name }).first()).toBeVisible();
      }
    });

    test('Изображения в разделах загружаются корректно (без битых картинок)', async ({ page }) => {
      const count = await settingsPage.images.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const img = settingsPage.images.nth(i);
        const isLoaded = await img.evaluate((el) => el.complete && el.naturalWidth > 0);
        expect(isLoaded, `Изображение №${i} не загрузилось`).toBeTruthy();
      }
    });

    test('Кнопка "Сохранить" присутствует на странице', async () => {
      await expect(settingsPage.saveButton).toBeVisible();
    });
  });
});
