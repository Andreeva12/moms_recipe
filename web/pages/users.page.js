// pages/users.page.js
import { BasePage } from './base.page';

export class UsersPage extends BasePage {
  constructor(page) {
    super(page);

    this.heading = page.locator('h1.content-header-title', { hasText: 'Пользователи' });
    this.searchInput = page.locator('input[placeholder="Введите email"]');
    this.searchButton = page.locator('.input-group-text.cursor-pointer');
    this.table = page.locator('table.invoice-list-table');
    this.tableRows = this.table.locator('tbody tr');
  }

  async goto() {
    await super.goto('/users');
  }

  async waitForLoad() {
    await this.waitForPageLoad(this.heading);
    await this.table.waitFor({ state: 'visible', timeout: 30000 });
  }

  async filterByEmail(email) {
    await this.searchInput.fill(email);
    await this.searchButton.click();
  }

  async goToAddUser() {
    await this.page.goto('/add-user', { waitUntil: 'networkidle' });
  }

  roleCheckbox(roleName) {
    return this.page.locator(`label:has-text("${roleName}")`).locator('xpath=preceding-sibling::input[1]');
  }

  async fillUserForm({ email, password, role }) {
    if (email !== undefined) await this.page.locator('input[type="email"]').fill(email);
    if (password !== undefined) await this.page.locator('input[type="password"]').fill(password);
    if (role) await this.roleCheckbox(role).check();
  }

  async saveAndClose() {
    await this.page.getByRole('button', { name: 'Сохранить и закрыть' }).click();
  }

  async getEditHrefByEmail(email) {
    await this.filterByEmail(email);
    const row = this.tableRows.filter({ hasText: email });
    const link = row.locator('a', { hasText: email });
    return link.getAttribute('href');
  }

  async deleteUserByHref(editHref) {
    await this.page.goto(editHref, { waitUntil: 'networkidle' });
    await this.page.getByRole('button', { name: 'Удалить' }).click();
    const confirmDelete = this.page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await confirmDelete.waitFor({ state: 'visible', timeout: 10000 });
    await confirmDelete.click();
  }
}
