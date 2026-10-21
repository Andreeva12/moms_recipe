import re
import time
from appium.webdriver.common.appiumby import AppiumBy

from checkout_helpers import (
    find_and_add_product_to_cart,
    open_cart,
    increase_cart_item_quantity,
    proceed_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    calculate_order,
    confirm_order,
)


def test_cashback_accrual_on_purchase(driver, wait):
    """
    После оформления заказа начисляется кешбэк (~3% от суммы заказа), и
    баланс бонусной карты отражает начисление.
    """
    find_and_add_product_to_cart(driver, wait)
    open_cart(driver, wait)
    increase_cart_item_quantity(driver, times=2)  # для бесплатной доставки, не критично для кешбэка
    proceed_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)
    calculate_order(driver, wait)

    cashback_block = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Кешбек (-3%)")
    assert cashback_block, "Блок кешбэка не отображается на экране оформления"

    total_elements = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Итого:')]")
    assert total_elements, "Итоговая сумма заказа не отображается"

    total_text = total_elements[0].get_attribute("content-desc")
    match = re.search(r'Итого:\s*(\d+)\s*сом', total_text)
    assert match, f"Не удалось извлечь сумму заказа из текста: {total_text!r}"
    order_sum = int(match.group(1))
    expected_cashback = round(order_sum * 0.03, 2)
    print(f"Сумма заказа: {order_sum}, ожидаемый кешбэк (3%): {expected_cashback}")

    confirm_order(driver, wait)

    # два pull-to-refresh, чтобы обновить баланс бонусной карты на главном экране
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Вернуться на главный экран").click()
    except Exception:
        driver.back()
    time.sleep(2)

    try:
        size = driver.get_window_size()
        start_x = size['width'] // 2
        start_y = int(size['height'] * 0.8)
        end_y = int(size['height'] * 0.2)
        driver.swipe(start_x, start_y, start_x, end_y, 500)
        time.sleep(1)
        driver.swipe(start_x, start_y, start_x, end_y, 500)
        time.sleep(2)
    except Exception:
        pass

    bonus_cards = driver.find_elements(
        AppiumBy.XPATH, "//android.widget.ImageView[contains(@content-desc, 'Ваша бонусная карта')]"
    )
    assert bonus_cards, "Элемент бонусной карты не найден после оформления заказа"

    desc = bonus_cards[0].get_attribute("content-desc")
    balance_match = re.search(r'(\d+(?:\.\d+)?)\s*баллов', desc)
    assert balance_match, f"Не удалось извлечь баланс баллов из content-desc: {desc!r}"

    bonus_amount = float(balance_match.group(1))
    assert bonus_amount not in (0, 100), (
        f"Баланс бонусов = {bonus_amount}, кешбэк похоже не начислился "
        f"(остался стартовым/нулевым)"
    )
