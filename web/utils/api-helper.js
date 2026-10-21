import { request } from '@playwright/test';
import { API_BASE_URL, ADMIN, TEST_CUSTOMER, STORE } from './test-data.js';

let adminToken = null;
let customerToken = null;
let storeToken = null;

async function performLogin(url, data, context) {
  const ctx = context || await request.newContext();

  const response = await ctx.post(url, { data });

  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`Login failed (${response.status()}): ${text.slice(0, 200)}`);
  }

  const json = await response.json();

  const token =
    json.token ||
    json.access_token ||
    json.data?.token ||
    json.data?.[0]?.token;

  if (!token) throw new Error('Token not found');

  return token;
}

// ---------------- ADMIN ----------------
export async function getAdminToken(context) {
  if (adminToken) return adminToken;

  adminToken = await performLogin(
    `${API_BASE_URL}/login`,
    { email: ADMIN.email, password: ADMIN.password },
    context
  );

  return adminToken;
}

// ---------------- CUSTOMER ----------------
export async function getCustomerToken(context) {
  if (customerToken) return customerToken;

  customerToken = await performLogin(
    `${API_BASE_URL}/login`,
    { phone: TEST_CUSTOMER.phone, password: TEST_CUSTOMER.password },
    context
  );

  return customerToken;
}

// ---------------- STORE ----------------
export async function getStoreToken(context) {
  if (storeToken) return storeToken;

  storeToken = await performLogin(
    `${API_BASE_URL}/login`,
    { email: STORE.email, password: STORE.password },
    context
  );

  return storeToken;
}

// ---------------- API WRAPPER ----------------
export async function apiRequest(context, method, path, options = {}, token) {
  const url = `${API_BASE_URL}${path}`;

  return await context[method](url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...options
  });
}

// ---------------- ORDERS UI CLEANUP ----------------
import { OrdersPage } from '../pages/orders.page.js';

export async function deleteOrdersByPhone(page, phone) {
  const ordersPage = new OrdersPage(page);

  await page.goto('/orders', { waitUntil: 'domcontentloaded' });
  await ordersPage.waitForLoad();

  let maxAttempts = 10;

  while (maxAttempts-- > 0) {
    const rows = ordersPage.tableRows.filter({ hasText: phone });
    const count = await rows.count();

    if (count === 0) break;

    const deleteBtn = rows.first().locator('button[data-bs-toggle="modal"]');
    await deleteBtn.click();

    const confirmBtn = page.locator('.modal .btn-danger:has-text("Удалить навсегда")');
    await confirmBtn.click();

    await page.waitForTimeout(1500);
    await page.reload();
    await ordersPage.waitForLoad();
  }
}