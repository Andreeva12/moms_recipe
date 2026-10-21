// tests/ui/notifications.spec.js
// БЕЗОПАСНОСТЬ: чекбокс "Отправить всем" на этой странице включён по
// умолчанию. Ни один тест здесь не должен нажимать "Отправить" пока он
// включён — перед любой отправкой формы вызывается
// targetOnlyTestRecipient(TEST_PHONE), который снимает галочку и таргетит
// ЕДИНСТВЕННОГО тестового покупателя. Реальную успешную отправку
// (проходящую валидацию) этот файл намеренно не тестирует.
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { NotificationsPage } from '../../pages/notifications.page.js';

const TEST_PHONE = '+996555666777';

test.describe('Раздел "Рассылка"', () => {
  let loginPage;
  let notificationsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    notificationsPage = new NotificationsPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_LOGIN, process.env.ADMIN_PASSWORD);
    await notificationsPage.goto();
    await notificationsPage.waitForLoad();
  });

  test('Загрузка страницы и переключение вкладок', async () => {
    await expect(notificationsPage.heading).toBeVisible();
    await expect(notificationsPage.formTab).toBeVisible();
    await expect(notificationsPage.logTab).toBeVisible();

    // форма активна по умолчанию
    await expect(notificationsPage.titleInput).toBeVisible();
    await expect(notificationsPage.contentTextarea).toBeVisible();

    // Логи
    await notificationsPage.switchToLog();
    await expect(notificationsPage.logTable).toBeVisible();

    // Обратно на форму
    await notificationsPage.switchToForm();
    await expect(notificationsPage.titleInput).toBeVisible();
  });

  test('Чекбокс "Отправить всем" кликабелен и меняет состояние', async () => {
    // форма не отправляется в этом тесте — переключение чекбокса безопасно
    const initialChecked = await notificationsPage.isSendToAllChecked();
    await notificationsPage.toggleSendToAll();
    expect(await notificationsPage.isSendToAllChecked()).toBe(!initialChecked);
    await notificationsPage.toggleSendToAll();
    expect(await notificationsPage.isSendToAllChecked()).toBe(initialChecked);
  });

  test('Валидация обязательных полей при попытке отправить пустую форму', async ({ page }) => {
    // отслеживаем реальные (не-GET) запросы на бэкенд рассылок — валидация
    // должна заблокировать отправку ДО того, как форма реально уйдёт на сервер
    const sendRequests = [];
    page.on('request', (req) => {
      // /broadcasting/auth — служебная авторизация WebSocket-канала
      // (Pusher/Echo), а не отправка рассылки, её нужно исключить
      if (req.method() !== 'GET'
        && /notification|broadcast|push/i.test(req.url())
        && !req.url().includes('/broadcasting/auth')) {
        sendRequests.push(`${req.method()} ${req.url()}`);
      }
    });

    // безопасность: выключаем "Отправить всем" и таргетим только тестовый
    // номер, прежде чем вообще нажимать "Отправить"
    await notificationsPage.targetOnlyTestRecipient(TEST_PHONE);

    // поля заголовка/содержания пусты
    await notificationsPage.fillForm('', '');
    await notificationsPage.submitForm();

    // Появление сообщения об ошибке
    await expect(notificationsPage.errorToast).toBeVisible({ timeout: 5000 });

    // Поля подсвечены как invalid и отображаются сообщения под ними
    await expect(notificationsPage.titleInvalidFeedback).toBeVisible();
    await expect(notificationsPage.contentInvalidFeedback).toBeVisible();

    const titleError = await notificationsPage.getTitleInvalidFeedbackText();
    expect(titleError).toContain('Поле обязательно для заполнения');

    const contentError = await notificationsPage.getContentInvalidFeedbackText();
    expect(contentError).toContain('Поле обязательно для заполнения');

    // ни одного реального запроса на отправку не должно было уйти
    expect(sendRequests, `Неожиданные запросы на отправку: ${sendRequests.join(', ')}`).toHaveLength(0);
  });

  test('Вкладка "Логи" содержит записи (проверка таблицы)', async () => {
    await notificationsPage.switchToLog();
    await expect(notificationsPage.logTable).toBeVisible();

    const rowsCount = await notificationsPage.getLogRowsCount();
    expect(rowsCount).toBeGreaterThan(0);
  });
});
