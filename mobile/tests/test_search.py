import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config

SEARCH_TRANSLATE_XPATH = (
    "//android.view.View[contains(translate(@content-desc, "
    "'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ', 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'), '{}')]"
)


def test_search_finds_product(driver, wait):
    """Поиск товара по названию показывает совпадающий результат."""
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Продукция").click()
    except Exception:
        pass  # возможно, поиск уже доступен на текущем экране
    time.sleep(2)

    try:
        search_field = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.view.View[@hint='Поиск в продукции']")))
        search_field.click()
    except Exception:
        try:
            search_field = driver.find_element(AppiumBy.XPATH, "//android.view.View[@instance=7]")
            search_field.click()
        except Exception as e:
            pytest.fail(f"Не удалось найти поле поиска: {e}")
    time.sleep(1)

    try:
        edit_text = wait.until(EC.presence_of_element_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
        edit_text.send_keys(config.PRODUCT_SEARCH_TERM)
    except Exception as e:
        pytest.fail(f"Не удалось ввести текст поиска: {e}")

    driver.press_keycode(66)  # Enter
    time.sleep(3)

    results = driver.find_elements(
        AppiumBy.XPATH, SEARCH_TRANSLATE_XPATH.format(config.PRODUCT_SEARCH_TERM.lower())
    )
    assert results, f"Товары по запросу '{config.PRODUCT_SEARCH_TERM}' не найдены"
