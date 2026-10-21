//// pages/promocode-form.page.js
export class PromocodeFormPage {
  constructor(page) {
    this.page = page;

    this.headingAdd = page.locator(
      'h1.content-header-title',
      { hasText: 'Добавить промокод' }
    );

    this.headingEdit = page.locator(
      'h1.content-header-title',
      { hasText: /Редактировать промокод/ }
    );

    this.titleRuInput = page.locator(
      'label:has-text("Заголовок [ru]") + input'
    ).first();

    this.titleKgInput = page.locator(
      'label:has-text("Заголовок [kg]") + input'
    ).first();

    this.personalizationSelect = page.locator(
      'label:has-text("Персонализация") + select'
    ).first();

    this.conditionSelect = page.locator(
      'label:has-text("Условия применения") + select'
    ).first();

    this.rewardTypeSelect = page.locator(
      'label:has-text("Вид вознаграждения") + select'
    ).first();

    this.restrictionSelect = page.locator(
      'label:has-text("Ограничения по товарам") + select'
    ).first();

    this.expiryTypeSelect = page.locator(
      'label:has-text("Срок действия") + select'
    ).first();

    this.expiryDateInput = page.locator(
      'label:has-text("Дата") + input'
    ).first();

    this.expiryDaysInput = page.locator(
      'label:has-text("Дни") + input'
    ).first();

    this.codeInput = page.locator(
      'label:has-text("Промокод") + input'
    ).first();

    this.saveButton = page.locator(
      'button:has-text("Сохранить")'
    ).first();

    this.saveAndCloseButton = page.locator(
      'button:has-text("Сохранить и закрыть")'
    );

    this.cancelButton = page.locator(
      'button:has-text("Отмена")'
    );
  }

  async waitForLoad() {
    await Promise.race([
      this.headingAdd.waitFor({
        state: 'visible',
        timeout: 30000
      }),
      this.headingEdit.waitFor({
        state: 'visible',
        timeout: 30000
      })
    ]);

    await this.titleRuInput.waitFor({
      state: 'visible',
      timeout: 10000
    });
  }

  async fillGeneralInfo(titleRu, titleKg, code) {
    if (titleRu !== undefined) {
      await this.titleRuInput.fill(titleRu);
    }

    if (titleKg !== undefined) {
      await this.titleKgInput.fill(titleKg);
    }

    if (code !== undefined) {
      await this.codeInput.fill(code);
    }
  }

  async selectPersonalization(value) {
    await this.personalizationSelect.selectOption({
      label: value
    });
  }

  async selectCondition(value) {
    await this.conditionSelect.selectOption({
      label: value
    });
  }

  async selectRewardType(value) {
    await this.rewardTypeSelect.selectOption({
      label: value
    });
  }

  async selectRestriction(value) {
    await this.restrictionSelect.selectOption({
      label: value
    });
  }

  async setStartDate() {
    const calendarIcon = this.page
      .locator('.date-input-wrapper .calendar-icon')
      .first();

    await calendarIcon.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await calendarIcon.click();

    const calendar = this.page.locator(
      '.flatpickr-calendar.open'
    );

    await calendar.waitFor({
      state: 'visible',
      timeout: 5000
    });

    const today = calendar.locator(
      '.flatpickr-day.today'
    );

    await today.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await today.click();

    await this.page.keyboard.press('Escape');
  }

  async selectExpiryType(option) {
    await this.expiryTypeSelect.selectOption({
      label: option
    });

    await this.page.waitForTimeout(1000);
  }

  async setExpiryDays(days) {
    await this.expiryDaysInput.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await this.expiryDaysInput.fill(
      String(days)
    );
  }

  async setFixedDiscountSum(sum) {
    const sumInput = this.page.locator(
      'label:has-text("Сумма") + input'
    ).first();

    await sumInput.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await sumInput.fill(String(sum));
  }

  async setPercentDiscount(percent) {
    const percentInput = this.page.locator(
      'label:has-text("Процент") + input'
    ).first();

    await percentInput.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await percentInput.fill(String(percent));
  }

  async setMaxDiscountSum(maxSum) {
    const maxInput = this.page.locator(
      'label:has-text("Макс. сумма") + input, label:has-text("Максимальная сумма") + input'
    ).first();

    await maxInput.waitFor({
      state: 'visible',
      timeout: 5000
    });

    await maxInput.fill(String(maxSum));
  }

  async save() {
    await this.saveButton.click();
  }

  async saveAndClose() {
    await this.saveAndCloseButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}