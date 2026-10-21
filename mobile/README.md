# 📱 AutoTesting – мобильное приложение «Мамины рецепты»

Автотесты для мобильного приложения **«Мамины рецепты»** (Android).  
Написаны на **Python + Appium** с использованием **pytest**.

---

# 📁 Структура репозитория

```bash
AutoTesting/
├── README.md                     # Главная инструкция
├── requirements.txt              # Все зависимости
├── pytest.ini                    # Настройки pytest (python_files = test_*.py)
├── conftest.py                   # Фикстуры (driver, wait, screenshot_on_failure)
├── config.py                     # Конфиги: таймауты, координаты, промокоды;
│                                  # VALID_PHONE/VALID_PASSWORD — из .env
├── .env.example                  # Шаблон .env (скопировать в .env и заполнить)
├── tests/
│   ├── checkout_helpers.py       # общие шаги оформления заказа (не тест,
│   │                              # не подпадает под test_*.py)
│   │
│   ├── test_successful_login.py
│   ├── test_login_with_offer_screen.py
│   ├── test_invalid_password.py
│   ├── test_forgot_password.py
│   │
│   │   # НАВИГАЦИЯ
│   ├── test_navigation.py
│   ├── test_back_navigation.py
│   ├── test_language.py
│   │
│   │   # ПОИСК И КОРЗИНА
│   ├── test_search.py
│   ├── test_cart.py
│   ├── test_clear_cart.py
│   ├── test_multiple_items.py
│   │
│   │   # ОФОРМЛЕНИЕ ЗАКАЗА
│   ├── test_paid_purchase.py
│   ├── test_free_purchase.py
│   ├── test_free_purchase_bonuses.py
│   ├── test_momcoin_gift.py
│   │
│   │   # ПРОМОКОДЫ
│   ├── test_promocode_one_one.py
│   ├── test_promocode_success.py
│   ├── test_promocode_summ.py
│   │
│   │   # БОНУСЫ, БАЛЛЫ, QR
│   ├── test_bonuses.py
│   ├── test_bonuses_checkin.py
│   ├── test_score_history.py
│   ├── test_qr_display.py
│   │
│   │   # РЕЦЕПТЫ
│   └── test_recipes.py
│
└── reports/                      # Папка для отчётов (создаётся автоматически)
```

Все файлы в `tests/` теперь называются `test_*.py` (кроме `checkout_helpers.py` —
это не тест, а общий модуль с шагами оформления заказа) и pytest реально их
собирает — раньше `pytest.ini` требовал строго `test_*.py`, а часть файлов не
подходила под маску и молча пропускалась.

---

# ⚙️ Технологии

- Python 3.10+
- Appium
- Pytest
- Android Studio
- ADB
- UiAutomator2

---

# 🧰 Что нужно установить перед запуском

## 1. Python 3.10 или новее

Скачать:  
https://www.python.org/downloads/

---

## 2. Appium сервер

Установите Appium глобально:

```bash
npm install -g appium
```

Установите драйвер UiAutomator2:

```bash
appium driver install uiautomator2
```

---

## 3. Android Studio

Установите Android Studio для запуска эмулятора.

Создайте эмулятор с:

- API 30 (Android 11) или выше

---

## 4. Зависимости Python

Установите зависимости проекта:

```bash
pip install -r requirements.txt
```

---

## 5. Тестовые данные (.env)

Скопируйте `.env.example` в `.env` и укажите реальные данные тестового
аккаунта:

```bash
cp .env.example .env
```

```
VALID_PHONE=+996XXXXXXXXX
VALID_PASSWORD=пароль_тестового_аккаунта
```

`.env` — в `.gitignore`, не коммитьте его с реальными данными.

---

# ▶️ Как запустить тесты

## Шаг 1. Запустите Appium сервер

В отдельном терминале:

```bash
appium
```

---

## Шаг 2. Запустите эмулятор

Через **AVD Manager** или командой:

```bash
emulator -avd Имя_вашего_AVD
```

Проверьте, что устройство подключено:

```bash
adb devices
```

---

## Шаг 3. Запустите тесты

В корне репозитория:

```bash
pytest tests/ -v
```

---

# 📊 Отчёты

После запуска отчёты сохраняются в папку `reports/`.

Сгенерировать HTML-отчёт:

```bash
pytest tests/ --html=reports/report.html
```

---

# 📁 Структура проекта

| Файл / Папка | Описание |
|---|---|
| `tests/` | Все тесты проекта + `checkout_helpers.py` (общие шаги заказа) |
| `config.py` | Настройки, пути, таймауты, промокоды; креды — из `.env` |
| `conftest.py` | Фикстуры pytest (`driver`, `wait`, `screenshot_on_failure`) |
| `reports/` | Отчёты и скриншоты |

---

# 🐛 Если тест упал

- Посмотрите сообщение об ошибке в консоли
- Проверьте, что Appium сервер запущен
- Проверьте, что эмулятор работает
- Убедитесь, что устройство видно через `adb devices`
- Проверьте папку `reports/` — там могут быть скриншоты ошибок

---

# 📌 Пример запуска одного теста

```bash
pytest tests/test_successful_login.py -v
```

---

# 👩‍💻 Для стажёров

Если вы видите этот текст:

1. Склонируйте репозиторий
2. Установите зависимости
3. Запустите Appium
4. Запустите эмулятор
5. Выполните тесты

Если что-то непонятно — спросите у автора проекта.

Удачи 🚀

---

# ⚡ Быстрый старт

## Установите зависимости

```bash
pip install -r requirements.txt
```

## Запустите тесты

```bash
pytest tests/ -v
```

## Запуск с кастомным устройством и окружением

```bash
pytest tests/ --device="emulator-5555" --env=prod
```