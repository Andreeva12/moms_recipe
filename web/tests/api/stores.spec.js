import { test, expect, request } from '@playwright/test';
import { STORE, TEST_CUSTOMER, API_BASE_URL } from '../../utils/test-data';

test.describe('Филиалы', () => {
  let apiContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext();
  });

  test('Авторизация филиала', async () => {
    const res = await apiContext.post(`${API_BASE_URL}/login`, {
      data: {
        email: STORE.email,
        password: STORE.password
      }
    });

    const json = await res.json();
    const token = json.token || json.data?.token || json.data?.[0]?.token;

    expect(res.ok()).toBeTruthy();
    expect(token).toBeTruthy();
  });


});