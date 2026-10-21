import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC


def test_language_switch(driver, wait):
    """Переключение языка на кыргызский и обратно на русский."""
    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Профиль"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось перейти на 'Профиль': {e}")
    time.sleep(2)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Язык"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось нажать 'Язык': {e}")
    time.sleep(2)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Кыргызча"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось выбрать 'Кыргызча': {e}")
    time.sleep(2)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Артка"))).click()
    except Exception:
        driver.back()
    time.sleep(2)

    assert driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Тил"), \
        "Язык не переключился на кыргызский (кнопка 'Тил' не найдена)"

    # возвращаем обратно на русский
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Тил").click()
    time.sleep(2)

    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Русский"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось выбрать 'Русский': {e}")
    time.sleep(2)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Артка").click()
    except Exception:
        driver.back()
    time.sleep(2)

    assert driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Язык"), \
        "Язык не вернулся на русский (кнопка 'Язык' не найдена)"
