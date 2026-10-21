import { test, expect, request } from '@playwright/test';
import {
  API_BASE_URL,
  DELIVERY,
  TEST_CUSTOMER,
  PRODUCTS,
  PAYMENT_METHODS
} from '../../utils/test-data.js';

import { getAdminToken } from '../../utils/api-helper.js';

test.describe('API: Delivery Suite (stable)', () => {
  let apiContext;
  let adminToken;

  test.beforeAll(async () => {
    apiContext = await request.newContext();
    adminToken = await getAdminToken(apiContext);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // -------------------------
  // 1. DELIVERY PRICE INSIDE
  // -------------------------
  test('Delivery price - inside zone', async () => {
    const { lat, lng } = DELIVERY.withinZone;

    const res = await apiContext.get(
      `${API_BASE_URL}/deliveries/price?lat=${lat}&lng=${lng}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json.can_delivery).toBe(true);
    expect(json.price).toBeGreaterThanOrEqual(0);
  });

  // -------------------------
  // 2. DELIVERY PRICE OUTSIDE
  // -------------------------
  test('Delivery price - outside zone', async () => {
    const { lat, lng } = DELIVERY.outsideZone;

    const res = await apiContext.get(
      `${API_BASE_URL}/deliveries/price?lat=${lat}&lng=${lng}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json.can_delivery).toBe(false);
  });

  // -------------------------
  // 3. CREATE ORDER (STABLE)
  // -------------------------
  test('Create order inside delivery zone (FIXED)', async () => {
    const orderData = {
      customer_id: TEST_CUSTOMER.id,
      store_id: 15,

      delivery_coords: [
        DELIVERY.withinZone.lat,
        DELIVERY.withinZone.lng
      ],

      payment: PAYMENT_METHODS.cash.id, //

      products: [
        {
          product_id: PRODUCTS.bonusProductId,
          count: 1,
          price: PRODUCTS.bonusProductPrice,
          title: 'Test product'
        }
      ],

      delivery_date: new Date().toISOString(),

      address: 'Тыналиева 36',
      phone: TEST_CUSTOMER.phone,
      name: TEST_CUSTOMER.name
    };


});
});