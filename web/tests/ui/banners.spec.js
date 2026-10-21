// tests/ui/banners.spec.js
// раздел сейчас пуст в sandbox — проверяем, что страница валидно
// рендерится в любом состоянии (есть строки или корректное "не найдено"),
// а не подгонку под текущее отсутствие данных
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { BannersPage } from '../../pages/banners.page.js';

test.describe('Раздел "Баннеры"', () => {
  let loginPage;
  let bannersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    bannersPage = new BannersPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await bannersPage.goto();
    await bannersPage.waitForLoad();
  });

  test('Страница загружается корректно (со строками или пустым состоянием)', async () => {
    await expect(bannersPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await bannersPage.tableRows.count();
    const emptyVisible = await bannersPage.emptyMessage.isVisible().catch(() => false);

    expect(rowCount > 0 || emptyVisible).toBeTruthy();
  });
});
