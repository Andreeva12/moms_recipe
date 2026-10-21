import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config


def test_invalid_password(driver, wait):
    """Вход с неверным паролем должен показывать сообщение об ошибке."""
    wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Профиль"))).click()
    wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Войти"))).click()

    edit_texts = wait.until(EC.presence_of_all_elements_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
    if not edit_texts:
        pytest.fail("Поле номера телефона не найдено")
    edit_texts[0].send_keys(config.VALID_PHONE.lstrip("+"))

    if len(edit_texts) >= 2:
        password_field = edit_texts[1]
    else:
        try:
            password_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[@hint='Пароль']")
        except Exception:
            pytest.fail("Поле пароля не найдено")
    password_field.click()
    password_field.clear()
    password_field.send_keys(config.INVALID_PASSWORD)

    driver.tap([config.CHECKBOX_CONSENT])
    time.sleep(1)

    next_btn = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Далее")))
    next_btn.click()
    time.sleep(2)

    error_msg = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Неверный пароль.")
    assert error_msg, "Сообщение об ошибке 'Неверный пароль.' не найдено"
