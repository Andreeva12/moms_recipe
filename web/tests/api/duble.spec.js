import { test, expect, request } from '@playwright/test';
import { API_BASE_URL, STORE, TEST_CUSTOMER } from '../../utils/test-data';

test.describe.skip('Проверка дублей заказов', () => {
  let apiContext;
  let storeToken;

  test.beforeAll(async () => {
    apiContext = await request.newContext();

    const loginRes = await apiContext.post(`${API_BASE_URL}/login`, {
      data: {
        email: STORE.email,
        password: STORE.password
      }
    });

    const json = await loginRes.json();

    storeToken =
      json.token ||
      json.data?.token ||
      json.data?.[0]?.token;

    expect(storeToken).toBeTruthy();
  });

  test.skip('Проверка дублей заказов (2 параллельных запроса)', async () => {

    const orderData = {
      customer_id: TEST_CUSTOMER.id,
      store_id: STORE.id,

      delivery: 'obycnyi-zakaz',
      delivery_date: new Date().toISOString(),

      payment: ['obank'],

      products: [
        {
          product_id: 3415,
          count: 1,
          price: 390,
          sum: 390
        }
      ],

      sum: 390,
      count: 1,

      address: 'test',

      phone: TEST_CUSTOMER.phone,
      name: TEST_CUSTOMER.name
    };

    const responses = await Promise.all([
      apiContext.post(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${storeToken}`,
          'Content-Type': 'application/json'
        },
        data: orderData
      }),

      apiContext.post(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${storeToken}`,
          'Content-Type': 'application/json'
        },
        data: orderData
      })
    ]);

    const results = await Promise.all(
      responses.map(r => r.text())
    );

    console.log('RESPONSE 1:', results[0]);
    console.log('RESPONSE 2:', results[1]);

    const status1 = responses[0].status();
    const status2 = responses[1].status();

    console.log('STATUS 1:', status1);
    console.log('STATUS 2:', status2);

    // проверка дубля (если система правильная — не должно быть 2 успешных создания)
    const successCount = [status1, status2].filter(s => s === 200 || s === 201).length;

    console.log('SUCCESS COUNT:', successCount);

    expect(successCount).toBeLessThanOrEqual(1);
  });
});