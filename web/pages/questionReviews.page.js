// pages/questionReviews.page.js
export class QuestionReviewsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1.content-header-title', { hasText: 'Контрольные вопросы' });
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr[id^="list-question-reviews-"]');
    this.firstRowTitleLink = this.tableRows.first().locator('td:nth-child(3) a');
  }

  async goto(retries = 3) {
  for (let i = 0; i < retries; i++) {
   try {
      await this.page.goto('/question-reviews', { timeout: 60000 });
  return;
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

  async clickFirstQuestion() {
    await this.firstRowTitleLink.click();
  }
}