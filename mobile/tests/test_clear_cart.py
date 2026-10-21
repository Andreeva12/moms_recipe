import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy


def test_clear_cart(driver, wait):
    """Очистка корзины через кнопку 'Очистить' → корзина пуста."""
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
        pytest.fail(f"Не удалось выбрать товар: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "В корзину").click()
    except Exception as e:
        pytest.fail(f"Кнопка 'В корзину' не найдена: {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Корзина").click()
    except Exception:
        try:
            driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Заказать").click()
        except Exception as e:
            pytest.fail(f"Не удалось перейти в корзину: {e}")
    time.sleep(3)

    assert driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ПИРОГ')]"), \
        "Товар не найден в корзине перед очисткой"

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Очистить").click()
        time.sleep(1)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Да").click()
        time.sleep(2)
    except Exception as e:
        pytest.fail(f"Не удалось очистить корзину: {e}")

    assert driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Корзина пустая"), \
        "Сообщение о пустой корзине не найдено после очистки"
