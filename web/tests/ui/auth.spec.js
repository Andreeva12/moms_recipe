import { test, expect } from '@playwright/test';

test('Успешный вход в админку', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.ADMIN_LOGIN);
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);
  await page.click('button:has-text("Войти")');
  await expect(page).toHaveURL('/', { timeout: 15000 });
  await expect(page.locator('h1:has-text("Главная")')).toBeVisible({ timeout: 10000 });
});

test('Вход с неверным паролем', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.ADMIN_LOGIN);
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button:has-text("Войти")');

  // появления тоста с ошибкой (он быстро исчезает)
  const errorToast = page.locator('.toastify.notify-error:has-text("Неверный логин или пароль")');
  await expect(errorToast).toBeVisible({ timeout: 5000 });
  //  на странице логина
  await expect(page).toHaveURL('/login');
});

test('Вход с пустыми полями', async ({ page }) => {
  await page.goto('/login');
  await page.click('button:has-text("Войти")');

  const errorToast = page.locator('.toastify.notify-error:has-text("Форма содержит ошибки")');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  await expect(page).toHaveURL('/login');
});

test('Выход из системы', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', process.env.ADMIN_LOGIN);
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);
  await page.click('button:has-text("Войти")');
  await expect(page.locator('h1:has-text("Главная")')).toBeVisible({ timeout: 10000 });

  // открыть выпадающее меню пользователя (клик по email в шапке)
  await page.locator(`text=${process.env.ADMIN_LOGIN}`).first().click();

  const logoutButton = page.locator('button:has-text("Выйти")');
  await expect(logoutButton).toBeVisible({ timeout: 5000 });
  await logoutButton.click();

  await expect(page).toHaveURL('/login', { timeout: 10000 });
  // защищённая страница снова требует логина
  await page.goto('/');
  await expect(page).toHaveURL('/login', { timeout: 10000 });
});
