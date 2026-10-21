import time
import re
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC


def test_bonus_card_qr_displayed(driver, wait):
    """QR-код бонусной карты отображается в ожидаемой области экрана."""
    try:
        bonus_card = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'Ваша бонусная карта')]")))
        bonus_card.click()
    except Exception as e:
        pytest.fail(f"Не удалось найти элемент бонусной карты: {e}")
    time.sleep(3)

    x_left, x_right, y_top, y_bottom = 218, 1052, 703, 1515

    found = False
    for el in driver.find_elements(AppiumBy.XPATH, "//*"):
        try:
            bounds = el.get_attribute("bounds")
            if not bounds:
                continue
            match = re.search(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds)
            if not match:
                continue
            x1, y1, x2, y2 = map(int, match.groups())
            if x1 < x_right and x2 > x_left and y1 < y_bottom and y2 > y_top:
                if el.get_attribute("displayed") == "true":
                    found = True
                    break
        except Exception:
            continue

    if not found:
        driver.save_screenshot("reports/debug_qr.png")
    assert found, "QR-код не найден в ожидаемой области экрана"
