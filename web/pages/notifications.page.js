// pages/notifications.page.js
export class NotificationsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Рассылка' });

    // Вкладки
    this.formTab = page.locator('button[data-bs-target="#form"]');
    this.logTab = page.locator('button[data-bs-target="#log"]');

    // Форма создания рассылки
    this.titleInput = page.locator('label:has-text("Заголовок") + input').first();
    this.contentTextarea = page.locator('label:has-text("Содержание") + textarea').first();

    // Чекбокс "Отправить всем" — ВКЛЮЧЁН по умолчанию! Пока он включён,
    // поле "Покупатели" (таргетинг по конкретным получателям) недоступно
    this.sendToAllCheckbox = page
      .locator('.form-check', { hasText: 'Отправить всем' })
      .locator('input[type="checkbox"]');

    // Таргетинг по конкретным покупателям (доступно только когда
    // "Отправить всем" выключен)
    this.buyersSearchInput = page.locator('input[placeholder="Введите телефон"]');
    this.buyersDropdown = page.locator('ul.vs__dropdown-menu');

    this.submitButton = page.locator('button[type="submit"]:has-text("Отправить")');

    // Элементы валидации
    this.errorToast = page.locator('.toastify.notify-error', { hasText: 'Форма содержит ошибки' });

    // invalid-feedback
    // содержит текст "Поле обязательно для заполнения"
    this.titleInvalidFeedback = page.locator('.invalid-feedback:has-text("Поле обязательно для заполнения")').first();
    this.contentInvalidFeedback = page.locator('.invalid-feedback:has-text("Поле обязательно для заполнения")').last();

    // Вкладка Логи
    this.logTable = page.locator('table.invoice-list-table');
    this.logRows = this.logTable.locator('tbody tr');
  }

  async goto() {
    // без networkidle — на этой странице фонового поллинга, из-за которого
    // networkidle никогда не наступает (проверено эмпирически)
    await this.page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
    await this.sendToAllCheckbox.waitFor({ state: 'visible', timeout: 15000 });
  }

  async switchToForm() {
    await this.formTab.click();
    // форма активна
    await this.titleInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  async switchToLog() {
    await this.logTab.click();
    // таблица логов монтируется заметно медленнее прочих списков в админке
    // (реальный, немаленький объём данных рассылок) — эмпирически проверено,
    // что рендер иногда занимает больше 15с, из-за чего короткий таймаут
    // периодически ловил ложный таймаут в CI
    await this.logTable.waitFor({ state: 'visible', timeout: 30000 });
    // одну строку
    await this.logRows.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  async fillForm(title, content) {
    if (title !== undefined) await this.titleInput.fill(title);
    if (content !== undefined) await this.contentTextarea.fill(content);
  }

  // безопасность: выключает "Отправить всем" и выбирает единственного
  // тестового получателя по телефону — используется перед любой отправкой
  // формы, чтобы исключить рассылку на реальных покупателей
  async targetOnlyTestRecipient(phone) {
    if (await this.sendToAllCheckbox.isChecked()) {
      await this.sendToAllCheckbox.uncheck();
    }
    await this.buyersSearchInput.fill(phone);
    await this.buyersDropdown.waitFor({ state: 'visible', timeout: 15000 });
    await this.buyersDropdown.locator('.vs__dropdown-option').first().click();
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async isSendToAllChecked() {
    return await this.sendToAllCheckbox.isChecked();
  }

  async toggleSendToAll() {
    await this.sendToAllCheckbox.click();
  }

  async getTitleInvalidFeedbackText() {
    if (await this.titleInvalidFeedback.isVisible()) {
      return await this.titleInvalidFeedback.textContent();
    }
    return null;
  }

  async getContentInvalidFeedbackText() {
    if (await this.contentInvalidFeedback.isVisible()) {
      return await this.contentInvalidFeedback.textContent();
    }
    return null;
  }

  async isErrorToastVisible() {
    return await this.errorToast.isVisible().catch(() => false);
  }

  async getLogRowsCount() {
    return await this.logRows.count();
  }
}
