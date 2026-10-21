// pages/dashboard.page.js
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1:has-text("Главная")');

    // Карточка статистики
    this.statsCard = page.locator('.card-statistics');
    this.metricValues = this.statsCard.locator('.fw-bolder');
    this.metricLabels = this.statsCard.locator('.card-text.font-small-3');

    // Виджет "Активные пользователи"
    this.activeUsersCard = page.locator('.card:has(h4:has-text("Активные пользователи"))');
    this.dateFromInput = this.activeUsersCard.locator('input.flatpickr-input').first();
    this.dateToInput = this.activeUsersCard.locator('input.flatpickr-input').last();
    this.searchButton = this.activeUsersCard.locator('button:has-text("Найти")');
    this.activeUsersTable = this.activeUsersCard.locator('table.table');

    // Виджет "Последние начисленные бонусы"
    this.bonusesCard = page.locator('.card:has(h4:has-text("Последние начисленные бонусы"))');
    this.bonusesTable = this.bonusesCard.locator('table.table');
    this.bonusesRows = this.bonusesTable.locator('tbody tr');

    // График "Заказы пользователей"
    this.ordersChartCard = page.locator('.earnings-card');
    this.ordersChartTitle = this.ordersChartCard.locator('.card-title:has-text("Заказы пользователей")');
    this.ordersChartContainer = page.locator('#customers-orders-chart');
    this.ordersChartLegend = page.locator('.apexcharts-legend');

    // Боковое меню
    this.sidebarMenu = page.locator('ul.navigation-main');
    this.activeMenuItem = page.locator('li.nav-item.active');

    // Верхняя панель
    this.userEmail = page.locator('.user-name:has-text("qa@mr.kg")');
    this.userAvatar = page.locator('.dropdown-user-link');
    this.logoutButton = page.locator('button.dropdown-item:has-text("Выйти")');
    this.notificationIcons = page.locator('li.dropdown-notification, li.dropdown-cart');
  }

  async waitForLoad() {
    await this.heading.waitFor({ state: 'visible', timeout: 10000 });
    
    await this.metricValues.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('Метрики не появились, но продолжаем...');
    });
  }

  async openUserMenu() {
    await this.userAvatar.click();
    await this.page.waitForTimeout(500);
  }

  async getMetricValues() {
    return await this.metricValues.allTextContents();
  }

  async getMetricLabels() {
    return await this.metricLabels.allTextContents();
  }
}