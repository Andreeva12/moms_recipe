// tests/ui/rewards.spec.js
import path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { RewardsPage } from '../../pages/rewards.page.js';

const TEST_IMAGE_PATH = path.join(__dirname, '..', 'fixtures', 'test-reward-image.png');

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d} 00:00`;
}

test.describe('Раздел "Розыгрыши"', () => {
  let loginPage;
  let rewardsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    rewardsPage = new RewardsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await rewardsPage.goto();
    await rewardsPage.waitForLoad();
  });

  test('Страница загружается корректно (со строками или пустым состоянием)', async () => {
    await expect(rewardsPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await rewardsPage.tableRows.count();
    const emptyVisible = await rewardsPage.emptyMessage.isVisible().catch(() => false);

    expect(rowCount > 0 || emptyVisible).toBeTruthy();
  });

  test('Создание, редактирование, включение/выключение и удаление тестового розыгрыша', async ({ page }) => {
    const key = `autotest_reward_${Date.now()}`;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 3600 * 1000);
    // ключ мог смениться в ходе теста (шаг 4) — уборка всегда ищет по
    // последнему актуальному значению, а не по исходному
    let currentKey = key;

    try {
      // 1. Создание розыгрыша: даты, ключ, цена жетона, изображение, описание ru/kg
      const createFields = await rewardsPage.openAddModal();
      await rewardsPage.fillRewardForm(createFields, {
        dateStart: formatDateTime(today),
        dateEnd: formatDateTime(nextWeek),
        key,
        price: '10',
        imagePath: TEST_IMAGE_PATH,
        descRu: 'Автотест: тестовый розыгрыш (ru)',
        descKg: 'Автотест: тестовый розыгрыш (kg)',
      });
      await rewardsPage.saveModal(createFields);

      // 2. Проверка отображения в списке
      let row = rewardsPage.getRowByKey(key);
      await expect(row).toBeVisible({ timeout: 15000 });
      await expect(row).toContainText(today.getFullYear().toString());

      // новый розыгрыш создаётся выключенным по умолчанию
      expect(await rewardsPage.getBulletClass(row)).toContain('bullet-secondary');

      // 3. Редактирование + включение — проверяем состояние "включено"
      let editFields = await rewardsPage.openEditModal(row, key);
      await rewardsPage.fillRewardForm(editFields, { active: true });
      await rewardsPage.saveModal(editFields);

      await page.reload({ waitUntil: 'networkidle' });
      row = rewardsPage.getRowByKey(key);
      await expect(row).toBeVisible({ timeout: 15000 });
      expect(await rewardsPage.getBulletClass(row)).toContain('bullet-primary');

      // 4. Редактирование ключа + выключение — проверяем состояние "выключено"
      const updatedKey = `${key}_edited`;
      editFields = await rewardsPage.openEditModal(row, key);
      await rewardsPage.fillRewardForm(editFields, { key: updatedKey, active: false });
      await rewardsPage.saveModal(editFields);
      currentKey = updatedKey;

      await page.reload({ waitUntil: 'networkidle' });
      row = rewardsPage.getRowByKey(updatedKey);
      await expect(row).toBeVisible({ timeout: 15000 });
      expect(await rewardsPage.getBulletClass(row)).toContain('bullet-secondary');
    } finally {
      // уборка выполняется независимо от исхода теста выше — иначе падение
      // на любом промежуточном шаге оставит розыгрыш в sandbox навсегда
      await rewardsPage.goto();
      await rewardsPage.waitForLoad();
      const row = rewardsPage.getRowByKey(currentKey);
      if (await row.isVisible({ timeout: 10000 }).catch(() => false)) {
        await rewardsPage.deleteReward(row);
      }
    }

    await rewardsPage.goto();
    await rewardsPage.waitForLoad();
    await expect(rewardsPage.getRowByKey(currentKey)).toHaveCount(0);
  });
});
