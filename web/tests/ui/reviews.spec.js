// tests/reviews.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ReviewsPage } from '../../pages/reviews.page.js';

test.describe('Раздел "Отзывы"', () => {
  let loginPage;
  let reviewsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    reviewsPage = new ReviewsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await expect(page.locator('h1')).toBeVisible({ timeout: 20000 });

    //  повторные попытки перехода
    let attempts = 3;
    while (attempts > 0) {
      try {
        await reviewsPage.goto();
        await reviewsPage.waitForLoad();
        break;
      } catch (e) {
        attempts--;
        if (attempts === 0) throw e;
        console.log('Retry loading reviews page, attempts left:', attempts);
        await expect(page.locator('h1')).toBeVisible({ timeout: 20000 });
      }
    }
  });

  test('Проверка загрузки страницы и наличия статистики', async () => {
    await expect(reviewsPage.heading).toBeVisible();
    await expect(reviewsPage.totalReviewsCard).toBeVisible();
    await expect(reviewsPage.positivePercentCard).toBeVisible();
    await expect(reviewsPage.negativePercentCard).toBeVisible();
    await expect(reviewsPage.exportButton).toBeVisible();
  });

  test('Фильтр по положительным отзывам', async () => {
    await reviewsPage.selectRating('positive');
    const selected = await reviewsPage.getSelectedRating();
    expect(selected).toBe('positive');

    const rowsCount = await reviewsPage.tableRows.count();
    if (rowsCount === 0) {
      test.skip('Нет положительных отзывов для проверки');
      return;
    }

    await expect.poll(async () => {
      return await reviewsPage.getFirstRowRatingIcon();
    }, { timeout: 10000 }).toBe('up');
  });

  test('Фильтр по отрицательным отзывам', async () => {
    // Проверка отрицательные отзывы
    const hasNegative = await reviewsPage.hasNegativeReviews();
    if (!hasNegative) {
      test.skip('Нет отрицательных отзывов для проверки');
      return;
    }

    await reviewsPage.selectRating('negative');
    const selected = await reviewsPage.getSelectedRating();
    expect(selected).toBe('negative');

    const rowsCount = await reviewsPage.tableRows.count();
    expect(rowsCount).toBeGreaterThan(0);

    await expect.poll(async () => {
      return await reviewsPage.getFirstRowRatingIcon();
    }, { timeout: 10000 }).toBe('down');
  });
});