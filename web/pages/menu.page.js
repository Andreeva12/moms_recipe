export class MenuPage {
  constructor(page) {
    this.page = page;
    this.menuContainer = page.locator('#main-menu-navigation');
    this.hamburger = page.locator('.nav.navbar-nav.d-xl-none .nav-link.menu-toggle'); // уточнить
    // пункты меню
    this.menuItems = {
      home: page.locator('#main-menu-navigation > li.nav-item.active, #main-menu-navigation > li.nav-item:has(a[href="/"])'),
      orders: page.locator('#main-menu-navigation > li:nth-child(2) > a'),
      shop: page.locator('#main-menu-navigation > li:nth-child(3) > a'),
      marketing: page.locator('#main-menu-navigation > li:nth-child(4) > a'),
      statistics: page.locator('#main-menu-navigation > li:nth-child(5) > a'),
      logs: page.locator('#main-menu-navigation > li:nth-child(6) > a'),
      communications: page.locator('#main-menu-navigation > li:nth-child(7) > a'),
      settings: page.locator('#main-menu-navigation > li:nth-child(8) > a'),
    };
    // подменю для магазина
    this.shopSubmenu = page.locator('#main-menu-navigation > li:nth-child(3) ul.menu-content');
    this.shopSubmenuItems = page.locator('#main-menu-navigation > li:nth-child(3) ul.menu-content a');
  }

  async clickMenuItem(itemName) {
    await this.menuItems[itemName].click();
  }

  async getActiveMenuItem() {
    return page.locator('#main-menu-navigation > li.nav-item.active');
  }

  async isSubmenuVisible() {
    return this.shopSubmenu.isVisible();
  }

  async toggleShopSubmenu() {
    await this.menuItems.shop.click(); // клик по родителю открывает/закрывает подменю
  }

  async openHamburgerMenu() {
    await this.hamburger.click();
  }

  async isHamburgerVisible() {
    return this.hamburger.isVisible();
  }
}