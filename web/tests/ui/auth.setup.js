import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

setup('authenticate', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    process.env.ADMIN_LOGIN,
    process.env.ADMIN_PASSWORD
  );

  await page.context().storageState({
    path: 'storage/auth.json'
  });

});