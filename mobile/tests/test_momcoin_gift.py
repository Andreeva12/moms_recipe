from appium.webdriver.common.appiumby import AppiumBy

from checkout_helpers import (
    find_and_add_product_to_cart,
    open_cart,
    handle_gift_popup_if_present,
    proceed_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    calculate_order,
    confirm_order,
)


def test_momcoin_gift_in_order(driver, wait):
    """
    Если доступен подарок за мамкоины — окно выбора появляется в корзине,
    подарок можно выбрать и добавить. Появление окна зависит от текущего
    баланса мамкоинов, поэтому тест не проваливается, если подарка нет,
    но в этом случае явно логирует это в отчёте.
    """
    find_and_add_product_to_cart(driver, wait)
    open_cart(driver, wait)

    gift_shown = handle_gift_popup_if_present(driver, wait)
    if not gift_shown:
        print("⚠️ Окно подарка не появилось (недостаточно мамкоинов или нет условий) — пропускаем проверку подарка")

    proceed_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)
    calculate_order(driver, wait)

    total_sum = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Итого:')]")
    assert total_sum, "Итоговая сумма заказа не отображается"

    confirm_order(driver, wait)
