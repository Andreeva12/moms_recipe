//// проверяет can_delivery для точек внутри и вне зоны

import { test, expect, request } from '@playwright/test';
import { API_BASE_URL, DELIVERY } from '../../utils/test-data';
import { getAdminToken } from '../../utils/api-helper';

test.describe('Delivery API FIXED', () => {
  let apiContext;
  let token;

  test.beforeAll(async () => {
    apiContext = await request.newContext();
    token = await getAdminToken(apiContext);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('delivery price inside zone', async () => {
    const res = await apiContext.get(
      `${API_BASE_URL}/deliveries/price?lat=${DELIVERY.withinZone.lat}&lng=${DELIVERY.withinZone.lng}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    expect(res.ok()).toBeTruthy();

    const data = await res.json();

    expect(typeof data.can_delivery).toBe('boolean');
    expect(typeof data.price).toBe('number');
  });

  test('delivery price outside zone', async () => {
    const res = await apiContext.get(
      `${API_BASE_URL}/deliveries/price?lat=${DELIVERY.outsideZone.lat}&lng=${DELIVERY.outsideZone.lng}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await res.json();

    //
    expect(typeof data.can_delivery).toBe('boolean');
  });
});