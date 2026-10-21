import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

test.describe('QR-код', () => {
  const customerId = '32831';
  const newBonus = 150;
  const oldBonus = 0;
  const reason = 'QR-код';

  test('QR-код', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    // 1. Открыть карточку покупателя
    await page.goto('/customers');
    await page.locator('input[type="number"]').first().fill(customerId);
    await page.getByRole('button', { name: 'Фильтровать' }).click();
    const row = page.locator('tr', { hasText: customerId });
    await row.first().click();
    await row.locator('.feather-edit').first().click();

    let modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // кнопка QR
    const qrTab = modal.locator('button[data-bs-target="#qr"]');

    await expect(qrTab).toBeVisible();
    await expect(qrTab).toBeEnabled();

    await qrTab.click();
    // проверить QR
    const qrImage = modal.locator('.customer-editor img');

    await expect(qrImage).toBeVisible();

    const src = await qrImage.getAttribute('src');

    expect(src).toMatch(/^data:image\/png;base64,/);

    console.log('QR код');
    });
    });