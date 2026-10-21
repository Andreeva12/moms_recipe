// pages/rewards.page.js
import { BasePage } from './base.page';

export class RewardsPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Розыгрыши' });
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
    this.emptyMessage = page.locator('.p-4.text-center', { hasText: 'Ничего не найдено' });
    this.addButton = page.getByRole('button', { name: 'Добавить' });
  }

  async goto() {
    await super.goto('/rewards');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.page.waitForLoadState('networkidle');
  }

  getRowByKey(key) {
    return this.tableRows.filter({ hasText: key });
  }

  getBulletClass(row) {
    return row.locator('.bullet').first().getAttribute('class');
  }

  // Форма "Добавить"/"Изменить" — одинаковая структура полей
  getModal() {
    const modal = this.page.locator('.modal.show').first();
    return {
      modal,
      dateStartInput: modal.locator('label:has-text("Дата начала") + div input, label:has-text("Дата начала") ~ div input').first(),
      dateEndInput: modal.locator('label:has-text("Дата окончания") + div input, label:has-text("Дата окончания") ~ div input').first(),
      keyInput: modal.locator('label:has-text("Ключ") + input').first(),
      priceInput: modal.locator('label:has-text("Цена") + input').first(),
      fileInput: modal.locator('input[type="file"]').first(),
      activeCheckbox: modal.locator('input[type="checkbox"]').first(),
      descRuTextarea: modal.locator('textarea').first(),
      descKgTextarea: modal.locator('textarea').last(),
      saveButton: modal.getByRole('button', { name: 'Сохранить' }),
      cancelButton: modal.getByRole('button', { name: 'Отмена' }),
    };
  }

  async openAddModal() {
    await this.addButton.click();
    const fields = this.getModal();
    await fields.modal.waitFor({ state: 'visible', timeout: 15000 });
    return fields;
  }

  async openEditModal(row, expectedKey) {
    await row.locator('button[aria-label="Редактировать"]').click();
    const fields = this.getModal();
    await fields.modal.waitFor({ state: 'visible', timeout: 15000 });
    // модалка становится visible раньше, чем Vue подгрузит реальные данные —
    // дожидаемся, пока поле "Ключ" покажет актуальное значение строки
    await this.waitForFieldValue(fields.keyInput, expectedKey);
    return fields;
  }

  async waitForFieldValue(locator, expectedValue, timeout = 15000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if ((await locator.inputValue()) === expectedValue) return;
      await this.page.waitForTimeout(300);
    }
    throw new Error(`Поле не загрузило ожидаемое значение "${expectedValue}" за ${timeout}мс`);
  }

  async fillRewardForm(fields, { dateStart, dateEnd, key, price, imagePath, active, descRu, descKg }) {
    if (dateStart) {
      await fields.dateStartInput.evaluate(el => el.removeAttribute('readonly'));
      await fields.dateStartInput.fill(dateStart, { force: true });
    }
    if (dateEnd) {
      await fields.dateEndInput.evaluate(el => el.removeAttribute('readonly'));
      await fields.dateEndInput.fill(dateEnd, { force: true });
    }
    if (key !== undefined) await fields.keyInput.fill(key);
    if (price !== undefined) await fields.priceInput.fill(price);
    if (imagePath) await fields.fileInput.setInputFiles(imagePath);
    if (active === true) await fields.activeCheckbox.check();
    if (active === false) await fields.activeCheckbox.uncheck();
    if (descRu !== undefined) await fields.descRuTextarea.fill(descRu);
    if (descKg !== undefined) await fields.descKgTextarea.fill(descKg);
  }

  async saveModal(fields) {
    await fields.saveButton.click();
    await this.page.locator('text=Форма сохранена успешно').waitFor({ timeout: 10000 });
    await fields.modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async deleteReward(row) {
    await row.locator('button[data-bs-target="#list-delete-modal"]').click();
    const confirmDelete = this.page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await confirmDelete.waitFor({ state: 'visible', timeout: 10000 });
    await confirmDelete.click();
    await this.page.locator('text=Пункт удален').waitFor({ timeout: 10000 });
  }
}
