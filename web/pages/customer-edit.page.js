// pages/customer-edit.page.js
export class CustomerEditModal {
  constructor(page) {
    this.page = page;
    // id модалки динамический (customer-edit-modal-<id>), а не статичный
    this.modal = page.locator('[id^="customer-edit-modal"]');
    this.saveButton = this.modal.locator('button:has-text("Сохранить")').first();
    this.cancelButton = this.modal.locator('button:has-text("Отмена")').first();

    this.phoneInput = this.modal.locator('label:has-text("Телефон") + input').first();
    this.nameInput = this.modal.locator('label:has-text("Имя") + input').first();
    this.emailInput = this.modal.locator('label:has-text("Email") + input').first();
    this.addressInput = this.modal.locator('label:has-text("Адрес") + input').first();
  }

  async waitForLoad() {
    await this.modal.waitFor({ state: 'visible', timeout: 30000 });
  }

  async getChipsBalance() {
    const balanceElement = this.modal.locator('.balance-block:has-text("Текущий баланс фишек") .balance-value').first();
    return await balanceElement.textContent();
  }

  async adjustChips(change, reason) {
    const chipsInput = this.modal.locator('label:has-text("Изменить фишки") + input').first();
    await chipsInput.fill(change);
    const reasonInput = this.modal.locator('label:has-text("Причина корректировки") + input').first();
    await reasonInput.fill(reason);
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async close() {
    await this.cancelButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async editContactInfo({ email, address }) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (address !== undefined) await this.addressInput.fill(address);
    await this.saveButton.click();
    await this.page.locator('text=Форма сохранена успешно').waitFor({ timeout: 10000 });
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}