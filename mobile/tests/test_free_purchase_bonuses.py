from appium.webdriver.common.appiumby import AppiumBy

from checkout_helpers import (
    find_and_add_product_to_cart,
    open_cart,
    increase_cart_item_quantity,
    proceed_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    apply_bonus_points,
    calculate_order,
    confirm_order,
)


def test_free_purchase_with_bonus_payment(driver, wait):
    """
    Бесплатная доставка при достаточном количестве товара + оплата частично
    бонусами (100 баллов) — заказ доходит до подтверждения.
    """
    find_and_add_product_to_cart(driver, wait)
    open_cart(driver, wait)

    assert increase_cart_item_quantity(driver, times=3), \
        "Не удалось увеличить количество товара в корзине"

    free_delivery = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Бесплатная доставка")
    assert free_delivery, "'Бесплатная доставка' не активировалась при увеличенном количестве товара"

    proceed_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)

    assert apply_bonus_points(driver, wait, "100"), "Не удалось применить бонусы к заказу"

    calculate_order(driver, wait)

    total_sum = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Итого:')]")
    assert total_sum, "Итоговая сумма заказа не отображается"

    confirm_order(driver, wait)
