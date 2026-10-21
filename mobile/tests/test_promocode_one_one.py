from appium.webdriver.common.appiumby import AppiumBy

import config
from checkout_helpers import (
    find_and_add_product_to_cart,
    go_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    apply_promo_code,
    calculate_order,
    confirm_order,
)


def _place_order_with_promo(driver, wait, promo_code):
    """Полный цикл заказа с применением промокода. Возвращает True, если
    после применения промокода появилась 'Бесплатная доставка'."""
    find_and_add_product_to_cart(driver, wait)
    go_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)

    apply_promo_code(driver, wait, promo_code)
    calculate_order(driver, wait)

    got_free_delivery = bool(driver.find_elements(
        AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Бесплатная доставка')]"))
    return got_free_delivery


def test_promocode_one_time_use(driver, wait):
    """
    Одноразовый промокод даёт бесплатную доставку при первом применении и
    не должен повторно сработать при следующем заказе того же покупателя.
    """
    first_use_free_delivery = _place_order_with_promo(driver, wait, config.VALID_PROMO_CODE)
    assert first_use_free_delivery, "Промокод не дал бесплатную доставку при первом применении"
    confirm_order(driver, wait)
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Вернуться на главный экран").click()
    except Exception:
        driver.back()

    second_use_free_delivery = _place_order_with_promo(driver, wait, config.VALID_PROMO_CODE)
    assert not second_use_free_delivery, (
        "Одноразовый промокод сработал повторно — 'Бесплатная доставка' "
        "снова активировалась при втором применении"
    )
