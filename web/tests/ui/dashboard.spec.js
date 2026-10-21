// tests/dashboard.spec.js
/*
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { DashboardPage } from '../../pages/dashboard.page.js';

test.describe.skip('Главная страница (Дашборд)', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await dashboardPage.waitForLoad();
  });

  test('Проверка наличия и отображения всех ключевых метрик', async () => {
    const metricValues = await dashboardPage.getMetricValues();
    expect(metricValues.length).toBe(6);
    const metricLabels = await dashboardPage.getMetricLabels();
    expect(metricLabels.length).toBe(6);

    for (const value of metricValues) {
      expect(value.trim()).not.toBe('');
    }

    const expectedLabels = [
      'Всего продаж',
      'Продаж в этом месяце',
      'Всего пользователей',
      'Пользователей в этом месяце',
      'Всего товаров',
      'Выручка за месяц'
    ];
    for (let i = 0; i < expectedLabels.length; i++) {
      expect(metricLabels[i].trim()).toBe(expectedLabels[i]);
    }
  });

  test('Проверка виджета "Активные пользователи"', async () => {
    await expect(dashboardPage.dateFromInput).toBeVisible();
    await expect(dashboardPage.dateToInput).toBeVisible();
    await expect(dashboardPage.searchButton).toBeVisible();
    await expect(dashboardPage.activeUsersTable).toBeVisible();
  });

  test('Проверка виджета "Последние начисленные бонусы"', async () => {
    await expect(dashboardPage.bonusesTable).toBeVisible();
    const rowsCount = await dashboardPage.bonusesRows.count();
    expect(rowsCount).toBeGreaterThan(0);
  });

  test('Проверка графика "Заказы пользователей"', async () => {
    await expect(dashboardPage.ordersChartTitle).toBeVisible();
    await expect(dashboardPage.ordersChartContainer).toBeVisible();
    await expect(dashboardPage.ordersChartLegend).toBeVisible();

    const legendItems = dashboardPage.ordersChartLegend.locator('.apexcharts-legend-series');
    await expect(legendItems).toHaveCount(3);
  });

  test('Проверка бокового меню и активного пункта', async () => {
    await expect(dashboardPage.sidebarMenu).toBeVisible();
    await expect(dashboardPage.activeMenuItem).toHaveText('Главная');
  });

  test('Проверка верхней панели (шапка)', async () => {
    await expect(dashboardPage.userEmail).toBeVisible();

    // меню пользователя
    await dashboardPage.openUserMenu();

    // кнопка "Выйти"
    await expect(dashboardPage.logoutButton).toBeVisible();

    const iconsCount = await dashboardPage.notificationIcons.count();
    expect(iconsCount).toBeGreaterThan(0);
  });
}); */