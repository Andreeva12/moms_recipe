import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC


def test_multiple_items_in_cart(driver, wait):
    """Добавление двух разных товаров из разных категорий в корзину."""
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Продукция").click()
    except Exception as e:
        pytest.fail(f"Ошибка перехода на 'Продукция': {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Пироги").click()
    except Exception as e:
        pytest.fail(f"Категория 'Пироги' не найдена: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ПИРОГ')]").click()
    except Exception as e:
        pytest.fail(f"Не удалось выбрать первый товар: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "В корзину").click()
    except Exception as e:
        pytest.fail(f"Кнопка 'В корзину' не найдена для первого товара: {e}")
    time.sleep(5)

    driver.back()
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Продукция").click()
    except Exception as e:
        pytest.fail(f"Ошибка повторного перехода на 'Продукция': {e}")
    time.sleep(2)

    try:
        vareniki = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Вареники")))
        vareniki.click()
    except Exception:
        try:
            driver.find_element(AppiumBy.XPATH, "//android.view.View[@content-desc='Вареники']").click()
        except Exception as e:
            pytest.fail(f"Категория 'Вареники' не найдена: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ВАРЕНИКИ С КАРТОФЕЛЕМ')]").click()
    except Exception as e:
        pytest.fail(f"Не удалось выбрать второй товар: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "В корзину").click()
    except Exception as e:
        pytest.fail(f"Кнопка 'В корзину' не найдена для второго товара: {e}")
    time.sleep(5)

    driver.back()
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Заказать").click()
    except Exception as e:
        pytest.fail(f"Не удалось перейти в корзину: {e}")
    time.sleep(3)

    has_pirog = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ПИРОГ С КУРИЦЕЙ')]")
    has_vareniki = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ВАРЕНИКИ С КАРТОФЕЛЕМ')]")
    assert has_pirog, "Пирог с курицей не найден в корзине"
    assert has_vareniki, "Вареники с картофелем не найдены в корзине"

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Перейти к оформлению").click()
    except Exception as e:
        pytest.fail(f"Не удалось нажать 'Перейти к оформлению': {e}")
    time.sleep(3)
