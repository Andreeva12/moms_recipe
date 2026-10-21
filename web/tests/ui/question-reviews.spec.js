// tests/question-reviews.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { QuestionReviewsPage } from '../../pages/questionReviews.page.js';

test.describe('Раздел "Контрольные вопросы"', () => {
  let loginPage;
  let questionPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    questionPage = new QuestionReviewsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await page.waitForTimeout(2000);

    await questionPage.goto();
    await questionPage.waitForLoad();
  });

  test('Проверка загрузки страницы и клик по первому вопросу', async ({ page }) => {
    const rowsCount = await questionPage.tableRows.count();
    if (rowsCount === 0) {
      test.skip('Нет вопросов для проверки');
      return;
    }

    await questionPage.clickFirstQuestion();
    //  форма редактирования
    await expect(page.locator('button:has-text("Отмена")')).toBeVisible({ timeout: 15000 });

    const cancelButton = page.locator('button:has-text("Отмена")');
    await cancelButton.click();

    //   таблица вопросов
    await expect(questionPage.table).toBeVisible({ timeout: 10000 });
  });
});