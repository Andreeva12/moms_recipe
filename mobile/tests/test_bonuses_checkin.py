import time
from appium.webdriver.common.appiumby import AppiumBy


def test_bonus_balance_updates_after_refresh(driver, wait):
    """
    После pull-to-refresh на главном экране баланс бонусов отображается и
    отличается от начального (0 или стартовые 100).
    """
    try:
        size = driver.get_window_size()
        start_x = size['width'] // 2
        start_y = int(size['height'] * 0.15)
        end_y = int(size['height'] * 0.6)
        for _ in range(2):
            driver.swipe(start_x, start_y, start_x, end_y, 800)
            time.sleep(1)
    except Exception:
        pass  # pull-to-refresh не критичен для самой проверки баланса
    time.sleep(2)

    bonus_cards = driver.find_elements(
        AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'Ваша бонусная карта')]"
    )
    assert bonus_cards, "Элемент бонусной карты не найден"

    desc = bonus_cards[0].get_attribute("content-desc")
    import re
    match = re.search(r'(\d+(?:\.\d+)?)\s*баллов', desc)
    assert match, f"Не удалось извлечь число баллов из content-desc: {desc!r}"

    bonus_amount = float(match.group(1))
    assert bonus_amount not in (0, 100), (
        f"Баланс бонусов = {bonus_amount}, похоже бонусы не начислились "
        f"(остался стартовым или нулевым)"
    )
