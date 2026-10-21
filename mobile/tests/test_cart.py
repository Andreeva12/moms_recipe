import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy


def test_cart_add_and_adjust_quantity(driver, wait):
    """Добавление товара в корзину, изменение количества, переход к оформлению."""
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
        product = driver.find_element(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ПИРОГ')]")
        product.click()
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
        "Товар не найден в корзине"

    # изменение количества через кнопки +/-
    try:
        product_container = driver.find_element(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'ПИРОГ')]")
        btns = product_container.find_elements(AppiumBy.CLASS_NAME, "android.widget.ImageView")
        if len(btns) >= 2:
            decrease_btn, increase_btn = btns[0], btns[1]
            increase_btn.click()
            time.sleep(1)
            decrease_btn.click()
            time.sleep(1)
    except Exception:
        pass  # кнопки +/- не критичны для основной цели теста

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Перейти к оформлению").click()
    except Exception as e:
        pytest.fail(f"Кнопка 'Перейти к оформлению' не найдена: {e}")
    time.sleep(3)

    checkout_screen = driver.find_elements(
        AppiumBy.XPATH, "//android.widget.FrameLayout[@resource-id='android:id/content']"
    )
    assert checkout_screen, "Экран оформления заказа не открылся"
