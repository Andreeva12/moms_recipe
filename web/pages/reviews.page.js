// pages/reviews.page.js
export class ReviewsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Отзывы' });
    this.typeButtons = page.locator('.d-flex.mb-2 button.btn-outline-primary');
    this.totalReviewsCard = page.locator('.row .col-4').nth(0).locator('h2');
    this.positivePercentCard = page.locator('.row .col-4').nth(1).locator('h2');
    this.negativePercentCard = page.locator('.row .col-4').nth(2).locator('h2');
    this.ratingSelect = page.locator('label:has-text("Оценка") + select, label:has-text("Оценка") ~ select').first();
    this.questionSelect = page.locator('label:has-text("Вопрос") + select, label:has-text("Вопрос") ~ select').first();
    this.dateFromInput = page.locator('input.flatpickr-input').first();
    this.dateToInput = page.locator('input.flatpickr-input').last();
    this.exportButton = page.locator('button:has-text("Экспортировать")');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr[id^="list-reviews-"]');
    this.firstRowRating = this.tableRows.first().locator('td:nth-child(7)');
  }

  async goto(retries = 2) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.goto('/reviews', { timeout: 60000 });
        break;
      } catch (e) {
        if (i === retries - 1) throw e;
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 30000 });
    await this.table.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  }

  async selectRating(rating) {
    await this.ratingSelect.selectOption({ value: rating });
    await this.page.waitForTimeout(1000);
  }

  async getSelectedRating() {
    return await this.ratingSelect.inputValue();
  }

  async getFirstRowRatingIcon() {
    const icon = this.firstRowRating.locator('svg').first();
    const classAttr = await icon.getAttribute('class');
    if (classAttr && classAttr.includes('thumbs-up')) return 'up';
    if (classAttr && classAttr.includes('thumbs-down')) return 'down';
    return 'unknown';
  }

  async hasNegativeReviews() {
    await this.selectRating('negative');
    const count = await this.tableRows.count();
    return count > 0;
  }
}