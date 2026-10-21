"""
Общие шаги оформления заказа, переиспользуемые несколькими тестами
(поиск товара, переход в корзину/оформление, выбор времени/адреса/оплаты).
Не файл с тестами — не подпадает под маску test_*.py, pytest его не собирает.
"""
import time
import datetime
import subprocess
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config


def find_and_add_product_to_cart(driver, wait, search_term=None, product_xpath=None):
    """Находит товар через поиск в 'Продукции' и добавляет его в корзину."""
    search_term = search_term or config.PRODUCT_SEARCH_TERM
    product_xpath = product_xpath or config.PRODUCT_XPATH

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Продукция").click()
    except Exception:
        pass
    time.sleep(2)

    try:
        search_area = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//*[@text='Поиск в продукции' or @content-desc='Поиск в продукции' or @hint='Поиск в продукции']")))
        search_area.click()
    except Exception:
        try:
            driver.find_element(AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'Поиск')]").click()
        except Exception:
            driver.tap([(640, 200)])
    time.sleep(1)

    try:
        edit_text = wait.until(EC.presence_of_element_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
        edit_text.send_keys(search_term)
    except Exception as e:
        pytest.fail(f"Не удалось ввести текст поиска: {e}")

    driver.press_keycode(66)  # Enter
    time.sleep(3)

    try:
        product = driver.find_element(AppiumBy.XPATH, product_xpath)
    except Exception:
        try:
            product = driver.find_element(
                AppiumBy.XPATH,
                f"//android.view.View[contains(@content-desc, '{search_term.upper()}')]")
        except Exception as e:
            driver.save_screenshot("reports/debug_search.png")
            pytest.fail(f"Не удалось найти результат поиска '{search_term}': {e}")
    product.click()
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "В корзину").click()
    except Exception as e:
        pytest.fail(f"Кнопка 'В корзину' не найдена: {e}")
    time.sleep(2)


def increase_cart_item_quantity(driver, times=1):
    """Увеличивает количество первого товара в корзине на заданное число раз."""
    try:
        product_container = driver.find_element(
            AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ШАШЛЫК')]")
        increase_btn = product_container.find_element(AppiumBy.XPATH, ".//android.widget.ImageView[2]")
        for _ in range(times):
            increase_btn.click()
            time.sleep(0.5)
        return True
    except Exception:
        return False


def open_cart(driver, wait, product_hint="ШАШЛЫК"):
    """Открывает корзину и проверяет, что товар в ней присутствует."""
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Заказать").click()
    except Exception:
        try:
            driver.find_element(AppiumBy.XPATH, "//android.widget.ImageView[@instance=19]").click()
        except Exception as e:
            pytest.fail(f"Не удалось перейти в корзину: {e}")
    time.sleep(3)

    assert driver.find_elements(AppiumBy.XPATH, f"//android.view.View[contains(@content-desc, '{product_hint}')]"), \
        f"Товар ({product_hint}) не найден в корзине"


def proceed_to_checkout(driver, wait):
    """Из открытой корзины переходит к экрану оформления заказа."""
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Перейти к оформлению").click()
    except Exception as e:
        pytest.fail(f"Не удалось перейти к оформлению: {e}")
    time.sleep(3)


def go_to_checkout(driver, wait, product_hint="ШАШЛЫК"):
    """Открывает корзину и сразу переходит к оформлению (когда между этими
    шагами не нужно ничего проверять/менять)."""
    open_cart(driver, wait, product_hint)
    proceed_to_checkout(driver, wait)


def handle_gift_popup_if_present(driver, wait, timeout=5):
    """
    Если доступен подарок за мамкоины — окно выбора появляется в корзине.
    Появление зависит от текущего баланса мамкоинов покупателя, поэтому
    это не жёсткая проверка — возвращает True/False, было ли окно.
    """
    from selenium.webdriver.support.ui import WebDriverWait

    try:
        WebDriverWait(driver, timeout).until(EC.presence_of_element_located(
            (AppiumBy.XPATH, "//android.view.View[@content-desc='Вам доступен подарок! Выберите товар']")))
    except Exception:
        return False

    driver.tap(list(config.GIFT_SELECT_COORDINATES))
    time.sleep(1)

    add_gift_btn = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Добавить в корзину")))
    add_gift_btn.click()
    time.sleep(2)

    try:
        driver.find_element(
            AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'закрыть') or @index='0']"
        ).click()
    except Exception:
        driver.tap(list(config.CLOSE_GIFT_NOTIFICATION))
    time.sleep(1)
    return True


def fill_delivery_time_and_address(driver, wait):
    """Заполняет время доставки (завтра, 15:30) и выбирает сохранённый адрес."""
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "В любое другое время").click()
    except Exception:
        pass

    try:
        driver.tap(list(config.CALENDAR_BUTTON))
    except Exception:
        pass

    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    tomorrow_day = tomorrow.day
    try:
        driver.find_element(
            AppiumBy.XPATH, f"//android.widget.Button[contains(@content-desc, '{tomorrow_day},')]"
        ).click()
    except Exception:
        try:
            driver.find_element(
                AppiumBy.XPATH, f"//android.widget.Button[contains(@content-desc, '{tomorrow_day} ')]"
            ).click()
        except Exception:
            pass

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "ОК"))).click()
    except Exception:
        pass
    time.sleep(2)

    try:
        driver.tap(list(config.TIME_BUTTON))
        time.sleep(1)
        driver.tap(list(config.HOUR_INPUT))
        time.sleep(0.5)
        for _ in range(3):
            driver.press_keycode(67)
        subprocess.run(["adb", "shell", "input", "text", "15"])

        driver.tap(list(config.MINUTE_INPUT))
        time.sleep(0.5)
        for _ in range(3):
            driver.press_keycode(67)
        subprocess.run(["adb", "shell", "input", "text", "30"])

        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "ОК").click()
    except Exception:
        pass
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Выбрать адрес доставки").click()
        time.sleep(1)
        wait.until(EC.presence_of_element_located((AppiumBy.XPATH, "//android.view.View[@content-desc='Мои адреса']")))
        wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.view.View[@content-desc='16 • Кыргызстан, Бишкек, Магаданская улица']")
        )).click()
    except Exception:
        pass
    time.sleep(2)


def select_cash_payment(driver, wait):
    """Открывает выбор способа оплаты и выбирает 'Наличные'."""
    try:
        wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.widget.Button[@content-desc='Способ оплаты']"))).click()
    except Exception:
        try:
            driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Способ оплаты").click()
        except Exception:
            pass
    time.sleep(2)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Наличные"))).click()
    except Exception:
        pass
    time.sleep(1)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Выбрать"))).click()
    except Exception:
        pass
    time.sleep(2)


def apply_promo_code(driver, wait, promo_code):
    """Открывает поле промокода и вводит указанный код."""
    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "У меня есть промокод"))).click()
    except Exception:
        driver.tap(list(config.PROMO_INPUT_COORDINATES))
    time.sleep(1)

    try:
        promo_input = wait.until(EC.presence_of_element_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
        promo_input.click()
        promo_input.clear()
        promo_input.send_keys(promo_code)
        driver.press_keycode(66)  # Enter
    except Exception:
        driver.tap(list(config.PROMO_INPUT_COORDINATES))
        time.sleep(0.5)
        for _ in range(10):
            driver.press_keycode(67)
        subprocess.run(["adb", "shell", "input", "text", promo_code])
        driver.press_keycode(66)
    time.sleep(1)


def apply_bonus_points(driver, wait, amount="100"):
    """Открывает блок применения бонусов и вводит указанную сумму (через координаты поля ввода)."""
    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, f"Баллы ({amount})"))).click()
        time.sleep(1)
        driver.tap([(333, 2246)])
        time.sleep(0.5)
        for _ in range(6):
            driver.press_keycode(67)
        subprocess.run(["adb", "shell", "input", "text", amount])
        driver.press_keycode(66)
        return True
    except Exception:
        return False


def calculate_order(driver, wait):
    """Нажимает 'Рассчитать заказ'."""
    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Рассчитать заказ"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось нажать 'Рассчитать заказ': {e}")
    time.sleep(3)


def confirm_order(driver, wait):
    """Нажимает 'Подтвердить заказ'."""
    try:
        confirm_btn = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Подтвердить заказ")))
        confirm_btn.click()
    except Exception as e:
        pytest.fail(f"Не удалось подтвердить заказ: {e}")
    time.sleep(3)
