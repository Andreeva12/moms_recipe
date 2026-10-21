import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config


def test_login_with_offer_screen(driver, wait):
    """
    Вход с обработкой возможного экрана оферты, который иногда перекрывает
    форму входа сразу после нажатия чекбокса согласия.
    """
    edit_texts = wait.until(EC.presence_of_all_elements_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
    assert len(edit_texts) >= 2, "Не найдены оба поля ввода (номер и пароль)"

    edit_texts[0].click()
    edit_texts[0].clear()
    edit_texts[0].send_keys(config.VALID_PHONE)

    edit_texts[1].click()
    edit_texts[1].clear()
    edit_texts[1].send_keys(config.VALID_PASSWORD)

    time.sleep(1)
    try:
        driver.hide_keyboard()
    except Exception:
        pass

    # экран оферты иногда перекрывает форму — если появился, закрываем и
    # повторяем нажатие чекбокса согласия
    try:
        wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "Оферта")))
        back_btn = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Назад")))
        back_btn.click()
        time.sleep(1)
        driver.tap([config.CHECKBOX_CONSENT])
    except Exception:
        pass

    driver.tap([config.CHECKBOX_CONSENT])
    time.sleep(1)

    try:
        next_btn = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.widget.Button[@text='Далее' or contains(@content-desc, 'Далее')]")))
        next_btn.click()
    except Exception:
        driver.tap([config.NEXT_BUTTON_FALLBACK])

    time.sleep(5)

    not_logged_in = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Авторизуйтесь, чтобы войти в профиль")
    assert not not_logged_in, "Вход не выполнен: всё ещё отображается предложение авторизоваться"
