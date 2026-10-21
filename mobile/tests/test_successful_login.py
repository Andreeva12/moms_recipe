import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config


def test_successful_login(driver, wait):
    """Успешный вход в приложение с валидными данными."""
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
    password_field.send_keys(config.VALID_PASSWORD)

    driver.tap([config.CHECKBOX_CONSENT])

    try:
        next_btn = wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "Далее")))
        assert next_btn.is_enabled(), "Кнопка 'Далее' присутствует, но не активна"
        next_btn.click()
    except Exception as e:
        pytest.fail(f"Кнопка 'Далее' не найдена: {e}")

    # успешный вход означает, что плашка "Авторизуйтесь, чтобы войти в профиль" исчезла
    not_logged_in = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Авторизуйтесь, чтобы войти в профиль")
    assert not not_logged_in, "Вход не выполнен: всё ещё отображается предложение авторизоваться"
