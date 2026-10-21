from appium.webdriver.common.appiumby import AppiumBy

from checkout_helpers import (
    find_and_add_product_to_cart,
    go_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    calculate_order,
    confirm_order,
)


def test_paid_purchase(driver, wait):
    """Оформление платного заказа наличными: товар из корзины доходит до подтверждения заказа."""
    find_and_add_product_to_cart(driver, wait)
    go_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)
    calculate_order(driver, wait)

    total_sum = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Итого:')]")
    assert total_sum, "Итоговая сумма заказа не отображается"

    confirm_order(driver, wait)
