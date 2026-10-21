import time
from appium.webdriver.common.appiumby import AppiumBy


def test_navigation(driver, wait):
    """Клик по каждому пункту нижней навигации не должен приводить к ошибке."""
    nav_items = ["Главная", "Продукция", "Рецепты", "Профиль"]
    failed = []

    for item in nav_items:
        try:
            element = driver.find_element(AppiumBy.ACCESSIBILITY_ID, item)
            element.click()
            time.sleep(1)
        except Exception as e:
            failed.append(f"{item}: {e}")

    assert not failed, f"Не удалось нажать на вкладки: {failed}"
