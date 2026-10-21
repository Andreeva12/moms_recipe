import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config
from checkout_helpers import (
    find_and_add_product_to_cart,
    go_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
    calculate_order,
    confirm_order,
)


def test_promocode_percent_discount(driver, wait):
    """Применение существующего промокода из списка даёт скидку -10% и заказ подтверждается."""
    find_and_add_product_to_cart(driver, wait)
    go_to_checkout(driver, wait)
    fill_delivery_time_and_address(driver, wait)
    select_cash_payment(driver, wait)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "У меня есть промокод").click()
    except Exception:
        driver.tap(list(config.PROMO_INPUT_COORDINATES))
    time.sleep(1)

    try:
        existing_promo = wait.until(EC.element_to_be_clickable(
            (AppiumBy.XPATH,
             f"//android.view.View[contains(@content-desc, '{config.PERCENT_DISCOUNT_PROMO_CODE}') "
             f"and contains(@content-desc, '-10%')]")))
        existing_promo.click()
    except Exception:
        promo_input = wait.until(EC.presence_of_element_located((AppiumBy.CLASS_NAME, "android.widget.EditText")))
        promo_input.send_keys(config.PERCENT_DISCOUNT_PROMO_CODE)
        driver.press_keycode(66)

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Применить").click()
    except Exception:
        pass
    time.sleep(2)

    calculate_order(driver, wait)

    discount_label = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "Скидка по промокоду")
    discount_percent = driver.find_elements(AppiumBy.ACCESSIBILITY_ID, "-10%")
    assert discount_label, "Метка 'Скидка по промокоду' не отображается"
    assert discount_percent, "Скидка -10% не отображается"

    confirm_order(driver, wait)
