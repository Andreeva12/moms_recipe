// тест на проверку логов изменений
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

test.describe('UI: Логирование изменений товара', () => {
  let loginPage;
  const productName = 'тест';
  const productId = '3924';

  test('При обновлении цены товара в логах появляется запись', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);

    // 1
    await page.goto('/products');

    const searchInput = page.locator('input[placeholder="Введите заголовок"]');
    await searchInput.fill(productName);
    await page.keyboard.press('Enter');

    const productRow = page.locator(`tr:has-text("${productId}")`).first();
    await expect(productRow).toBeVisible({ timeout: 10000 });

    // 2 открыть модалку
    await productRow.locator('.feather-edit').click();

    const modal = page.locator('.modal.show');
    await expect(modal).toBeVisible({ timeout: 15000 });

    // дождаться, пока Vue реально подгрузит данные товара в форму (модалка
    // становится visible раньше, чем поля заполняются значениями)
    const titleInput = modal
      .locator('label:has-text("Заголовок") + input, label:has-text("Заголовок") ~ input')
      .first();
    await expect(titleInput).toHaveValue(productName, { timeout: 15000 });

    // инпут
    const textInputs = modal.locator('input[type="text"]');

    await expect.poll(async () => {
      return await textInputs.count();
    }).toBeGreaterThan(0);

    const count = await textInputs.count();

    let priceInput = null;

    for (let i = 0; i < count; i++) {
      const input = textInputs.nth(i);
      const value = await input.inputValue();

      if (value && /^[0-9]+(\.[0-9]+)?$/.test(value.trim())) {
        priceInput = input;
        break;
      }
    }

    if (!priceInput) {
      throw new Error('Price input not found');
    }

    const oldPrice = await priceInput.inputValue();
    console.log('Старая цена:', oldPrice);

    // важно: newPrice должен гарантированно отличаться от oldPrice — иначе
    // изменений нет, diff в логах не появляется и тест падает (так уже
    // было с захардкоженным '947', который совпал с текущей ценой)
    const newPrice = String(Number(oldPrice) + 1);

    await priceInput.click();
    await priceInput.press('Control+A');
    await priceInput.press('Backspace');
    await priceInput.type(newPrice);

    await page.keyboard.press('Tab');

    await expect(priceInput).toHaveValue(newPrice);

    // сохранить
    await modal.locator('button:has-text("Сохранить")').click();

    await expect(
      page.locator('text=Форма сохранена успешно')
    ).toBeVisible({ timeout: 10000 });

    // 7 logs
    await page.goto('/activity');

    const logEntry = page
      .locator(`div:has-text("(ID: ${productId})")`)
      .first();

    await expect(logEntry).toBeVisible({ timeout: 10000 });

    const logText = await logEntry.innerText();

    expect(logText).toContain('price:');
    expect(logText).toContain(`→ ${newPrice}`);

    // 8 restore
    await page.goto('/products');

    await searchInput.fill(productName);
    await page.keyboard.press('Enter');

    await productRow.locator('.feather-edit').click();

    const modal2 = page.locator('.modal.show');
    await expect(modal2).toBeVisible({ timeout: 15000 });

    const titleInput2 = modal2
      .locator('label:has-text("Заголовок") + input, label:has-text("Заголовок") ~ input')
      .first();
    await expect(titleInput2).toHaveValue(productName, { timeout: 15000 });

    const textInputs2 = modal2.locator('input[type="text"]');

    const count2 = await textInputs2.count();

    let restoreInput = null;

    for (let i = 0; i < count2; i++) {
      const input = textInputs2.nth(i);
      const value = await input.inputValue();

      if (value && /^[0-9]+(\.[0-9]+)?$/.test(value.trim())) {
        restoreInput = input;
        break;
      }
    }

    if (!restoreInput) {
      throw new Error('Restore input not found');
    }

    await restoreInput.click();
    await restoreInput.press('Control+A');
    await restoreInput.press('Backspace');
    await restoreInput.type(oldPrice);

    await modal2.locator('button:has-text("Сохранить")').click();

    await page.locator('text=Форма сохранена успешно').waitFor({ timeout: 5000 });
  });
});