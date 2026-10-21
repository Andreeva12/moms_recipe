import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC


def test_recipe_open_and_has_steps(driver, wait):
    """Открытие рецепта из категории 'Сырники' и проверка пошаговой инструкции."""
    try:
        wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Рецепты"))).click()
    except Exception as e:
        pytest.fail(f"Не удалось перейти на вкладку 'Рецепты': {e}")
    time.sleep(2)

    assert driver.find_elements(AppiumBy.XPATH, "//android.view.View[@content-desc='Рецепты']"), \
        "Заголовок 'Рецепты' не отображается"

    try:
        cat_elem = wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "Сырники")))
        cat_elem.click()
    except Exception as e:
        pytest.fail(f"Не удалось выбрать категорию 'Сырники': {e}")
    time.sleep(1)

    try:
        recipe_card = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.view.View[@content-desc='СЫРНИКИ С АПЕЛЬСИНОВЫМ СОУСОМ И МЯТОЙ']")))
        recipe_card.click()
    except Exception as e:
        pytest.fail(f"Не удалось открыть рецепт: {e}")
    time.sleep(2)

    assert driver.find_elements(
        AppiumBy.XPATH, "(//android.view.View[@content-desc='СЫРНИКИ С АПЕЛЬСИНОВЫМ СОУСОМ И МЯТОЙ'])[2]"
    ), "Заголовок открытого рецепта не отображается"

    has_step = driver.find_elements(AppiumBy.XPATH, "//*[contains(@content-desc, 'Шаг')]")
    assert has_step, "В рецепте отсутствует пошаговая инструкция (не найден элемент 'Шаг')"
