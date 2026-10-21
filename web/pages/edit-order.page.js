// pages/edit-order.page.js
export class EditOrderPage {
  constructor(page, orderId) {
    this.page = page;
    this.orderId = orderId;

    this.heading = page.locator('h1.content-header-title', { hasText: `Редактировать заказ #${orderId}` }).or(page.locator('.modal h5.modal-title'));

    this.customerField = page.locator('label:has-text("Покупатель") + input, label:has-text("Покупатель") ~ input').first();
    this.branchSelect = page.locator('label:has-text("Филиал")').locator('..').locator('.v-select').first();
    this.deliverySelect = page.locator('label:has-text("Доставка") + select, label:has-text("Доставка") ~ select').first();
    this.deliveryTimeInput = page.locator('label:has-text("Время доставки") + input, label:has-text("Время доставки") ~ input').first();
    this.paymentSelect = page.locator('label:has-text("Оплата")').locator('..').locator('.v-select').first();
    this.statusSelect = page.locator('label:has-text("Статус") + select, label:has-text("Статус") ~ select').first();
    this.deliveryCostInput = page.locator('label:has-text("Стоимость доставки") + input, label:has-text("Стоимость доставки") ~ input').first();
    this.addressInput = page.locator('label:has-text("Адрес") + input, label:has-text("Адрес") ~ input').first();
    this.phoneInput = page.locator('label:has-text("Телефон") + input, label:has-text("Телефон") ~ input').first();
    this.nameInput = page.locator('label:has-text("Имя") + input, label:has-text("Имя") ~ input').first();
    this.commentTextarea = page.locator('label:has-text("Комментарии") + textarea, label:has-text("Комментарии") ~ textarea').first();
    this.serviceCommentTextarea = page.locator('label:has-text("Служебные комментарии") + textarea, label:has-text("Служебные комментарии") ~ textarea').first();

    this.cartRows = page.locator('table.table tbody tr').filter({ has: page.locator('td:has-text("шт")') });

    this.saveButton = page.locator('button:has-text("Сохранить")').first();
    this.saveAndCloseButton = page.locator('button:has-text("Сохранить и закрыть")');
    this.cancelButton = page.locator('button:has-text("Отмена")');
    this.deleteButton = page.locator('button.btn-danger:has-text("Удалить")');
  }

  async waitForLoad() {
    await this.commentTextarea.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
      return this.statusSelect.waitFor({ state: 'visible', timeout: 10000 });
    });
  }

  async hasProducts() {
    const count = await this.cartRows.count();
    return count > 0;
  }

  async getFirstProductQuantity() {
    await this.cartRows.first().waitFor({ state: 'visible', timeout: 10000 });
    const quantityInput = this.cartRows.first().locator('input[type="text"]').first();
    await quantityInput.waitFor({ state: 'visible', timeout: 5000 });
    return await quantityInput.inputValue();
  }

  async setFirstProductQuantity(newQuantity) {
    const quantityInput = this.cartRows.first().locator('input[type="text"]').first();
    await quantityInput.waitFor({ state: 'visible', timeout: 5000 });
    await quantityInput.fill(String(newQuantity));
  }

  async addComment(comment) {
    await this.commentTextarea.fill(comment);
  }

  async getComment() {
    return await this.commentTextarea.inputValue();
  }

  async addServiceComment(comment) {
    await this.serviceCommentTextarea.fill(comment);
  }

  async getServiceComment() {
    return await this.serviceCommentTextarea.inputValue();
  }

  async changeStatus(statusText) {
    await this.statusSelect.selectOption({ label: statusText });
  }

  async getStatus() {
    return await this.statusSelect.locator('option:checked').textContent();
  }

  async setDeliveryCost(value) {
    await this.deliveryCostInput.fill(String(value));
  }

  async getDeliveryCost() {
    return await this.deliveryCostInput.inputValue();
  }

  async save() {
    await this.saveButton.click();
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }

  async deleteOrder() {
    await this.deleteButton.click();
  }
}