import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC


def test_bonus_history_has_records(driver, wait):
    """История бонусной карты содержит записи о начислениях за покупки."""
    try:
        bonus_card = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'Ваша бонусная карта')]")))
        bonus_card.click()
    except Exception as e:
        pytest.fail(f"Не удалось найти элемент бонусной карты: {e}")
    time.sleep(3)

    purchase_records = driver.find_elements(
        AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Покупка на сумму')]"
    )
    assert len(purchase_records) >= 2, (
        f"Ожидалось минимум 2 записи о начислении баллов, найдено: {len(purchase_records)}"
    )
