// tests/ui/jettons.spec.js
import path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { JettonsPage } from '../../pages/jettons.page.js';
import { RewardsPage } from '../../pages/rewards.page.js';
import { AddOrderPage } from '../../pages/add-order.page.js';

const TEST_IMAGE_PATH = path.join(__dirname, '..', 'fixtures', 'test-reward-image.png');
const CUSTOMER_PHONE = '+996555666777';
const REWARD_PRICE = 100; // за каждые 100 сом суммы заказа — 1 билет

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d} 00:00`;
}

async function setOrderStatusViaApi(page, orderId, status) {
  const token = await page.evaluate(() => localStorage.getItem('token'));

  async function getOrder() {
    const res = await page.request.get(`https://sandbox-api.momsrecipes.fun/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    return (await res.json()).data;
  }

  async function putStatus(order) {
    order.status = status;
    order._method = 'PUT';
    const putRes = await page.request.post(`https://sandbox-api.momsrecipes.fun/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      data: order
    });
    expect(putRes.ok()).toBeTruthy();
    return (await putRes.json()).data;
  }

  // смена статуса через API иногда не закрепляется с первой попытки — ответ
  // PUT рапортует success и эхом отдаёт нужный статус, а при повторном GET
  // заказ уже снова в "_new" (проверено эмпирически, нестабильно
  // воспроизводится). Поэтому статус подтверждаем отдельным GET и при
  // необходимости повторяем PUT.
  let order = await putStatus(await getOrder());
  for (let attempt = 0; attempt < 3 && order.status !== status; attempt++) {
    await page.waitForTimeout(1500);
    order = await putStatus(await getOrder());
  }
  expect(order.status, `статус заказа ${orderId} не закрепился как "${status}"`).toBe(status);
  return order;
}

async function deleteOrderById(page, orderId) {
  await page.goto('/orders?status=', { waitUntil: 'networkidle' });
  const allStatusButton = page.locator('.mt-2 button.btn-outline-primary', { hasText: /Все\s*\(\d+\)/ }).first();
  if (await allStatusButton.isVisible().catch(() => false)) {
    await allStatusButton.click();
    await page.waitForTimeout(1000);
  }
  const row = page.locator(`tr:has-text("${orderId}")`).first();
  await row.locator('.feather-trash, button[data-bs-toggle="modal"]').first().click();
  const confirmDelete = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
  await confirmDelete.waitFor({ state: 'visible', timeout: 10000 });
  await confirmDelete.click();
  await page.waitForTimeout(1500);
}

test.describe('Раздел "Жетоны"', () => {
  let loginPage;
  let jettonsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    jettonsPage = new JettonsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await jettonsPage.goto();
    await jettonsPage.waitForLoad();
  });

  test('Страница загружается корректно (со строками или пустым состоянием)', async () => {
    await expect(jettonsPage.heading).toBeVisible({ timeout: 15000 });

    const rowCount = await jettonsPage.tableRows.count();
    const emptyVisible = await jettonsPage.emptyMessage.isVisible().catch(() => false);

    expect(rowCount > 0 || emptyVisible).toBeTruthy();
  });

  test('Закрытие заказа при активном розыгрыше начисляет билеты (жетоны)', async ({ page }) => {
    test.setTimeout(120000);

    const rewardsPage = new RewardsPage(page);
    const key = `autotest_jetton_${Date.now()}`;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 3600 * 1000);

    let orderId;

    try {
      // 1. активный тестовый розыгрыш с известной ценой билета
      await rewardsPage.goto();
      const createFields = await rewardsPage.openAddModal();
      await rewardsPage.fillRewardForm(createFields, {
        dateStart: formatDateTime(today),
        dateEnd: formatDateTime(nextWeek),
        key,
        price: String(REWARD_PRICE),
        imagePath: TEST_IMAGE_PATH,
        active: true,
        descRu: 'Автотест: начисление билетов',
        descKg: 'Автотест: начисление билетов (kg)',
      });
      await rewardsPage.saveModal(createFields);

      // 2. заказ через админку на тестового покупателя
      await page.goto('/add-order');
      const addOrderPage = new AddOrderPage(page);
      await addOrderPage.waitForLoad();

      await addOrderPage.selectCustomer(CUSTOMER_PHONE);
      await addOrderPage.selectBranch('TEST');
      await addOrderPage.selectDelivery('Обычный заказ');
      await addOrderPage.selectPayment('Наличные');
      await addOrderPage.selectStatus('Новый');
      await addOrderPage.fillDeliveryCost('0');
      await addOrderPage.fillComment('Тест начисления билетов');
      await addOrderPage.fillServiceComment('autotest');

      const productInput = page.locator('input[placeholder*="товара"]').first();
      await productInput.fill('МАНТЫ');
      await page.locator('.vs__dropdown-menu li', { hasText: 'МАНТЫ С МЯСОМ' }).first().click();
      await addOrderPage.productQuantityInput.fill('1');
      await addOrderPage.addProductButton.click();

      await addOrderPage.selectDeliveryDate();
      await addOrderPage.save();
      await page.waitForURL(/\/edit-order\/\d+/);
      orderId = page.url().match(/\/edit-order\/(\d+)/)[1];

      // 3. закрыть заказ — билеты начисляются только по выполненным заказам
      const closedOrder = await setOrderStatusViaApi(page, orderId, 'Closed');
      const expectedTickets = Math.floor(closedOrder.sum / REWARD_PRICE);
      expect(expectedTickets, 'сумма тестового заказа слишком мала для проверки начисления').toBeGreaterThan(0);

      // 4. проверить начисленные билеты
      // фильтруем строго по id нашего заказа: в системе может быть активен
      // только один розыгрыш одновременно (подтверждено 422-ошибкой при
      // попытке включить второй), поэтому пока наш розыгрыш активен, любой
      // заказ, закрытый ПАРАЛЛЕЛЬНО другим тестом (например bonus-limit.spec.js
      // на этом же тестовом клиенте), тоже получает билеты под тем же ключом
      // розыгрыша — фильтр по key в CI ловил и чужие билеты
      // подтверждено экспериментально (2026-09-17): увеличение этого
      // ожидания с 15с до 60с ничего не изменило — билеты либо появляются
      // почти сразу после закрытия заказа, либо не появляются вовсе, сколько
      // ни жди. Это не гонка/задержка на стороне теста, а нестабильность
      // начисления билетов на бэкенде (баг заведён лиду). Короткое окно
      // оставлено просто как небольшой запас на сетевые флуктуации, не как
      // попытка дождаться медленного начисления
      const jettonRows = jettonsPage.getRowsByOrderId(orderId);
      let jettonsFound = 0;
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        await jettonsPage.goto();
        await jettonsPage.waitForLoad();
        jettonsFound = await jettonRows.count();
        if (jettonsFound >= expectedTickets) break;
        await page.waitForTimeout(3000);
      }
      expect(jettonsFound, `билеты по заказу ${orderId} не начислились за отведённое время`).toBe(expectedTickets);
      await expect(jettonRows.first()).toContainText(CUSTOMER_PHONE);
      await expect(jettonRows.first()).toContainText(key);
    } finally {
      // уборка: удаление заказа каскадно удаляет и начисленные билеты
      if (orderId) {
        await deleteOrderById(page, orderId);
      }
      await rewardsPage.goto();
      await rewardsPage.waitForLoad();
      const rewardRow = rewardsPage.getRowByKey(key);
      const rewardExists = await rewardRow.isVisible({ timeout: 10000 }).catch(() => false);
      if (rewardExists) {
        await rewardsPage.deleteReward(rewardRow);
      }
    }
  });
});
