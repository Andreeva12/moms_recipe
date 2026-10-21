import { test, expect } from '@playwright/test';
import { apiRequest, getAdminToken } from '../../utils/api-helper';
import { TEST_CUSTOMER } from '../../utils/test-data';

test.describe('Получение данных покупателя', () => {
  test('Проверка структуры ответа', async ({ request }) => {

    // 🔥 ВАЖНО: получаем токен
    const token = await getAdminToken(request);

    const resp = await apiRequest(
      request,
      'get',
      `/customers/${TEST_CUSTOMER.id}`,
      {},
      token
    );

    expect(resp.status()).toBe(200);

    const json = await resp.json();
    const customer = json.data;

    expect(customer.id).toBe(TEST_CUSTOMER.id);
    expect(customer.user_id).toBeDefined();
    expect(customer.phone).toBe(TEST_CUSTOMER.phone);
    expect(typeof customer.bonus).toBe('number');
    expect(customer.notify).toBeDefined();
    expect(customer.hash).toBeDefined();
    expect(customer.fcm_token).toBeDefined();
    expect(customer.created_at).toBeDefined();
  });
});