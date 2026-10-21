# config.py
"""
Конфигурационный файл для автотестов мобильного приложения «Мамины рецепты»
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ---------- НАСТРОЙКИ APPIUM ----------
PLATFORM_NAME = "Android"
AUTOMATION_NAME = "UiAutomator2"
DEVICE_NAME = "emulator-5554"
APPIUM_SERVER = "http://localhost:4723"

# ---------- ПРИЛОЖЕНИЕ ----------
APP_PACKAGE = "com.ashvaiberov.momsrecipes"
APP_ACTIVITY = ".MainActivity"

# ---------- ТАЙМАУТЫ (в секундах) ----------
IMPLICIT_WAIT = 10
EXPLICIT_WAIT = 15
NEW_COMMAND_TIMEOUT = 300
ADB_EXEC_TIMEOUT = 60000
UI_TIMEOUT = 60000

# ---------- ТЕСТОВЫЕ ДАННЫЕ ----------
# Валидные данные — из .env, см. .env.example
VALID_PHONE = os.getenv("VALID_PHONE")
VALID_PASSWORD = os.getenv("VALID_PASSWORD")

# Невалидные данные
INVALID_PASSWORD = "wrong_password"
INVALID_PHONE = "111"
INVALID_SHORT_PASSWORD = "123"

# ---------- ТОВАРЫ ----------
PRODUCT_NAME = "Шашлык"
PRODUCT_SEARCH_TERM = "Шашлык"
PRODUCT_XPATH = "//android.view.View[contains(@content-desc, 'ШАШЛЫК') and contains(@content-desc, '955')]"

# ---------- ПРОМОКОДЫ ----------
VALID_PROMO_CODE = "123тест_один123"
EXPIRED_PROMO_CODE = "123тест_просроченный"
ONE_TIME_PROMO_CODE = "123тест_одноразовый"
PERCENT_DISCOUNT_PROMO_CODE = "123тест123"          # даёт скидку -10%
MIN_SUM_PROMO_CODE = "123тест_сумм123"              # требует минимальную сумму заказа

# ---------- КООРДИНАТЫ (для элементов без локаторов) ----------
# Чекбокс согласия на экране входа
CHECKBOX_CONSENT = (104, 1395)

# Крестик закрытия уведомления о подарке
CLOSE_GIFT_NOTIFICATION = (1136, 720)

# Кнопка "Далее" (запасной вариант)
NEXT_BUTTON_FALLBACK = (640, 2082)

# Поле ввода промокода
PROMO_INPUT_COORDINATES = (336, 2289)

# Подарки / мамкоины
GIFT_SELECT_COORDINATES = (665, 1025)

# Календарь и время
CALENDAR_BUTTON = (338, 633)
TIME_BUTTON = (932, 638)
HOUR_INPUT = (507, 1368)
MINUTE_INPUT = (921, 1379)

# ---------- URL API (песочница) ----------
SANDBOX_API_BASE = "https://sandbox-api.momsrecipes.fun/api"
NOTIFICATIONS_URL = f"{SANDBOX_API_BASE}/notifications"
ORDERS_URL = f"{SANDBOX_API_BASE}/orders"

# ---------- ЗАГОЛОВКИ ДЛЯ ПРОВЕРОК ----------
HOME_SCREEN_TITLE = "Продукция"
CART_EMPTY_MESSAGE = "Корзина пуста"