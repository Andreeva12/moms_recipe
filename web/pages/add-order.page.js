// pages/add-order.page.js
export class AddOrderPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Добавить заказ' });

    this.customerSearch = page.locator('.v-select:has(input[placeholder*="телефон или email"])').first();
    this.customerInput = this.customerSearch.locator('input');

    this.deliveryTimeInput = page.locator('label:has-text("Время доставки") + input, label:has-text("Время доставки") ~ input').first();

    this.branchLabel = page.locator('label:has-text("Филиал")');
    this.branchContainer = this.branchLabel.locator('..').locator('.v-select');

    this.deliverySelect = page.locator('label:has-text("Доставка") + select, label:has-text("Доставка") ~ select').first();

    this.paymentLabel = page.locator('label:has-text("Оплата")');
    this.paymentContainer = this.paymentLabel.locator('..').locator('.v-select');

    this.statusSelect = page.locator('label:has-text("Статус") + select, label:has-text("Статус") ~ select').first();

    this.deliveryCostInput = page.locator('label:has-text("Стоимость доставки") + input, label:has-text("Стоимость доставки") ~ input').first();
    this.addressInput = page.locator('label:has-text("Адрес") + input, label:has-text("Адрес") ~ input').first();
    this.phoneInput = page.locator('label:has-text("Телефон") + input, label:has-text("Телефон") ~ input').first();
    this.nameInput = page.locator('label:has-text("Имя") + input, label:has-text("Имя") ~ input').first();
    this.commentTextarea = page.locator('label:has-text("Комментарии") + textarea, label:has-text("Комментарии") ~ textarea').first();
    this.serviceCommentTextarea = page.locator('label:has-text("Служебные комментарии") + textarea, label:has-text("Служебные комментарии") ~ textarea').first();

    this.promocodeInput = page.locator('label:has-text("Промокод") + input, label:has-text("Промокод") ~ input').first();
    this.activatePromocodeButton = page.locator('button:has-text("Активировать")').first();

    this.productSearch = page.locator('.v-select:has(input[placeholder*="название товара"])').first();
    this.productQuantityInput = page.locator('.row:has(button:has-text("Добавить")) .col-1 input[type="text"]').first();
    this.addProductButton = page.locator('button:has-text("Добавить")').first();

    this.saveButton = page.locator('button:has-text("Сохранить")').first();
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
  }

  async selectCustomer(phone) {
    await this.customerInput.clear();
    await this.customerInput.fill(phone);
    // Ждём появление выпадающего списка
    const dropdown = this.customerSearch.locator('ul.vs__dropdown-menu');
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });
    const firstOption = dropdown.locator('.vs__dropdown-option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 15000 });
    await firstOption.click();
  }

  async selectDeliveryDate() {
    // Ищем поле ввода даты по классу flatpickr-input
    const dateInput = this.page.locator('input.flatpickr-input').first();
    await dateInput.waitFor({ state: 'visible', timeout: 30000 });
    // Убираем атрибут readonly, если есть
    await dateInput.evaluate(el => el.removeAttribute('readonly'));
    // Заполняем завтрашнюю дату напрямую, без календаря
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const dateTime = `${year}-${month}-${day} 12:00`;
    await dateInput.fill(dateTime, { force: true });
  }

  async selectBranch(branchName) {
    await this.branchContainer.click();
    const dropdown = this.branchContainer.locator('ul.vs__dropdown-menu');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    const option = dropdown.locator('.vs__dropdown-option', { hasText: new RegExp(`^${branchName}$`) }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async selectDelivery(deliveryName) {
    await this.deliverySelect.selectOption({ label: deliveryName });
  }

  async selectPayment(paymentName) {
    await this.paymentContainer.click();
    // Увеличим таймаут ожидания появления dropdown
    const dropdown = this.paymentContainer.locator('ul.vs__dropdown-menu');
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });
    // Используем частичное совпадение и игнорируем регистр
    const option = dropdown.locator('.vs__dropdown-option', { hasText: new RegExp(paymentName, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async selectStatus(statusName) {
    await this.statusSelect.selectOption({ label: statusName });
  }

  async fillDeliveryCost(cost) {
    await this.deliveryCostInput.fill(cost);
  }

  async fillAddress(address) {
    await this.addressInput.fill(address);
  }

  async fillPhone(phone) {
    await this.phoneInput.fill(phone);
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async fillComment(comment) {
    await this.commentTextarea.fill(comment);
  }

  async fillServiceComment(comment) {
    await this.serviceCommentTextarea.fill(comment);
  }

  async addProduct(productName, quantity) {
    await this.productSearch.click();
    await this.productSearch.locator('input').fill(productName);
    const productDropdown = this.productSearch.locator('..').locator('ul.vs__dropdown-menu');
    await productDropdown.waitFor({ state: 'visible', timeout: 5000 });
    const firstOption = productDropdown.locator('.vs__dropdown-option').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstOption.click();

    await this.productQuantityInput.waitFor({ state: 'visible', timeout: 5000 });
    const isEditable = await this.productQuantityInput.isEditable();
    if (!isEditable) {
      throw new Error('Поле количества нередактируемо');
    }
    await this.productQuantityInput.fill(String(quantity));
    await this.addProductButton.click();
    await this.page.waitForTimeout(1000);
  }

  async save() {
    await this.saveButton.click();
  }
}