// pages/chats.page.js
export class ChatsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h5.chat-list-title:has-text("Покупатели")');
    this.searchInput = page.locator('input[placeholder="Поиск по телефону покупателя"]');
    this.chatItems = page.locator('ul.chat-users-list li');
  }

  async goto() {
    await this.page.goto('/chats');
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
  }

  async searchByPhone(phone) {
    await this.searchInput.fill(phone);
    await this.page.waitForTimeout(2000);
  }

  async getChatItemByPhone(phone) {
    return this.chatItems.filter({ hasText: phone }).first();
  }

  async selectChatByPhone(phone) {
    const chatItem = await this.getChatItemByPhone(phone);
    await chatItem.click();
    await this.page.locator('.chats .chat-content').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async getMessages() {
    return this.page.locator('.chats .chat-content');
  }
}