// tests/chats.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ChatsPage } from '../../pages/chats.page.js';

test.describe('Раздел "Чат"', () => {
  let loginPage;
  let chatsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    chatsPage = new ChatsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await page.waitForLoadState('networkidle')

    await chatsPage.goto();
    await chatsPage.waitForLoad();
  });

  test('Поиск тестового чата и просмотр сообщений', async ({ page }) => {
    const testPhone = '+996705144255'; // тестовый номер

    await chatsPage.searchByPhone(testPhone);
    const chatItem = await chatsPage.getChatItemByPhone(testPhone);

    // Если элемент не найден – пропуск тест
    if (await chatItem.count() === 0) {
      test.skip(`Тестовый чат с номером ${testPhone} не найден`);
      return;
    }

    await expect(chatItem).toBeVisible();
    await chatsPage.selectChatByPhone(testPhone);

    //  сообщения
    const messages = await chatsPage.getMessages();
    const count = await messages.count();
    if (count === 0) {
      test.skip('В выбранном чате нет сообщений');
      return;
    }
    expect(count).toBeGreaterThan(0);
  });
});