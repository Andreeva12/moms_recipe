import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy

import config

GREETING_XPATH = f"//android.view.View[@content-desc='Привет, {config.VALID_PHONE}!']"


def test_back_navigation(driver, wait):
    """Системная кнопка 'Назад' корректно возвращает на главный экран."""
    greeting = driver.find_elements(AppiumBy.XPATH, GREETING_XPATH)
    if not greeting:
        pytest.fail("Приветствие на главном экране не найдено — пользователь не авторизован")

    recipes_tab = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Рецепты")
    recipes_tab.click()
    time.sleep(2)

    driver.back()
    time.sleep(2)

    assert driver.find_elements(AppiumBy.XPATH, GREETING_XPATH), \
        "Не удалось вернуться на главный экран после нажатия 'Назад'"

    # повторное нажатие "Назад" не должно закрывать приложение
    driver.back()
    time.sleep(2)
    assert driver.find_elements(AppiumBy.XPATH, GREETING_XPATH), \
        "Приложение свернулось/закрылось после повторного нажатия 'Назад'"
