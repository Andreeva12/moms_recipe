// pages/login.page.js
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button:has-text("Войти")');
  }

  async goto() {
    await super.goto('/login');
  }

  async login(email, password) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);

    await Promise.all([
      this.page.waitForURL('**/'),
      this.loginButton.click()
    ]);
  }
}