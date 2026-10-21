// utils/orders.js
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
    await page.waitForTimeout(2000);
    await page.reload();
    await ordersPage.waitForLoad();
  }
}