import { test, expect, request } from '@playwright/test';
import { STORE, TEST_CUSTOMER, API_BASE_URL } from '../../utils/test-data';

const PRODUCT_ID = 3415 ;

test.describe.skip('Филиалы - создание заказа', () => {
  let apiContext;
  let storeToken;

  test.beforeAll(async () => {
    apiContext = await request.newContext();
  });

  test.skip('Авторизация филиала', async () => {
    const response = await apiContext.post(`${API_BASE_URL}/login`, {
      data: {
        email: STORE.email,
        password: STORE.password
      }
    });

    expect(response.ok()).toBeTruthy();

    const json = await response.json();

    storeToken =
      json.token ||
      json.data?.token ||
      json.data?.[0]?.token;

    expect(storeToken).toBeTruthy();
  });

  test.skip('Создание заказа с сырниками с изюмом', async () => {

    // фиксированная цена (из твоего API логов)
    const price = 390;

    const orderData = {
      customer_id: TEST_CUSTOMER.id,
      store_id: STORE.id,

      delivery: 'obycnyi-zakaz',
      delivery_date: new Date().toISOString(),

      payment: ['obank'],

      products: [
        {
          product_id: PRODUCT_ID,
          count: 1,
          price: 390,
          sum: 390
        }
      ],

      sum: 390,
      count: 1,

      address: 'Орто-Сай филиал',

      phone: TEST_CUSTOMER.phone,
      name: TEST_CUSTOMER.name
    };

    const createRes = await apiContext.post(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${storeToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      data: orderData
    });

    // ===== DEBUG =====
    console.log('FINAL URL:', createRes.url());
    console.log('STATUS:', createRes.status());
    console.log('HEADERS:', createRes.headers());

    const body = await createRes.text();

    console.log('RESPONSE BODY:');
    console.log(body);

    // если ошибка API
    if (createRes.status() !== 200 && createRes.status() !== 201) {
      throw new Error(
        `❌ API ERROR
STATUS: ${createRes.status()}

BODY:
${body}`
      );
    }

    // парсим JSON
    const json = JSON.parse(body);

    const orderId = json.id || json.data?.id;

    expect(orderId).toBeTruthy();

    console.log(`✅ Заказ создан, ID: ${orderId}`);
  });
});