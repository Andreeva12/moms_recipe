// tests/ui/users.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { UsersPage } from '../../pages/users.page.js';

test.describe('Раздел "Пользователи"', () => {
  let loginPage;
  let usersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await usersPage.goto();
    await usersPage.waitForLoad();
  });

  test('Страница загружается и таблица пользователей не пустая', async () => {
    await expect(usersPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await usersPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Поиск существующего пользователя по email', async () => {
    await usersPage.filterByEmail('qa@mr.kg');

    const row = usersPage.tableRows.filter({ hasText: 'qa@mr.kg' });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
  });

  // Раньше снятие последней роли у пользователя молча сохранялось: он пропадал
  // из списка/поиска, а его email оставался занятым навсегда (запись была
  // видна только по прямой ссылке /edit-user/:id). Баг был описан и заведён
  // отдельным баг-репортом. На момент написания этого теста баг уже исправлен
  // на бэкенде: сохранение формы без единственной роли отклоняется валидацией
  // (422, "roles: Поле обязательно для заполнения"), запись не меняется.
  test('Нельзя сохранить пользователя без единственной роли — валидация блокирует сохранение', async ({ page }) => {
    const email = `autotest_role_validation_${Date.now()}@test.com`;
    let editHref;

    try {
      // 1. создать пользователя с ролью "Администратор"
      await usersPage.goToAddUser();
      await usersPage.fillUserForm({ email, password: 'TestPass12345', role: 'Администратор' });
      await usersPage.saveAndClose();
      await usersPage.waitForLoad();

      editHref = await usersPage.getEditHrefByEmail(email);
      const rowBefore = usersPage.tableRows.filter({ hasText: email });
      await expect(rowBefore).toBeVisible({ timeout: 10000 });

      // 2. снять единственную роль, не назначая другую, и попытаться сохранить
      await page.goto(editHref, { waitUntil: 'networkidle' });
      const adminCheckbox = usersPage.roleCheckbox('Администратор');
      await expect(adminCheckbox).toBeChecked({ timeout: 10000 });
      await adminCheckbox.uncheck();
      await usersPage.saveAndClose();

      // 3. форма отклонена валидацией, роль не снята
      const errorToast = page.locator('.toastify.notify-error');
      await expect(errorToast).toBeVisible({ timeout: 10000 });

      // 4. пользователь остаётся на месте и по-прежнему находится в списке
      await usersPage.goto();
      await usersPage.waitForLoad();
      await usersPage.filterByEmail(email);
      await expect(usersPage.tableRows.filter({ hasText: email })).toHaveCount(1, { timeout: 10000 });
    } finally {
      if (editHref) {
        await usersPage.deleteUserByHref(editHref);
      }
    }
  });
});
