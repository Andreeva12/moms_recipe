export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(locator) {
    await locator.waitFor({ state: 'visible', timeout: 30000 });
  }

  async click(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  async select(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }
}