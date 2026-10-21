import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config


def test_forgot_password(driver, wait):
    """Запрос восстановления пароля показывает экран ввода кода."""
    wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Профиль"))).click()
    wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Войти"))).click()

    forgot_btn = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Я забыл(а) пароль")))
    forgot_btn.click()
    time.sleep(2)

    phone_field = wait.until(EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.EditText")))
    phone_field.send_keys(config.VALID_PHONE.lstrip("+"))

    request_btn = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Запросить пароль")))
    request_btn.click()
    time.sleep(3)

    code_screen = driver.find_elements(
        AppiumBy.ACCESSIBILITY_ID,
        f"Введите код восстановления пароля, отправленный на ваш номер телефона {config.VALID_PHONE}"
    )
    assert code_screen, "Экран ввода кода восстановления не появился"

    # возвращаемся, не завершая восстановление до конца
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Назад").click()
    except Exception:
        driver.back()
