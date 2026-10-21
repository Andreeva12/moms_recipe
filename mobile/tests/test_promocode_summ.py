import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC

import config
from checkout_helpers import (
    find_and_add_product_to_cart,
    go_to_checkout,
    fill_delivery_time_and_address,
    select_cash_payment,
)


def test_promocode_requires_minimum_sum(driver, wait):
    """
    Промокод с условием минимальной суммы заказа не применяется, если сумма
    заказа не достигнута — должно появиться соответствующее сообщение, а
    подарок не должен отобразиться.
    """
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
             f"//android.view.View[contains(@content-desc, '{config.MIN_SUM_PROMO_CODE}') "
             f"and contains(@content-desc, 'Подарок')]")))
        existing_promo.click()
    except Exception:
        driver.tap([(207, 2486)])
    time.sleep(2)

    error_msg = driver.find_elements(
        AppiumBy.XPATH,
        "//android.view.View[@content-desc='Минимальная сумма заказа для применения промокода не достигнута']"
    )
    assert error_msg, "Сообщение о недостаточной сумме заказа не появилось"

    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "ОК").click()
    except Exception:
        driver.back()

    gift = driver.find_elements(AppiumBy.XPATH, "//android.view.View[contains(@content-desc, 'Подарок')]")
    assert not gift, "Подарок отобразился, хотя промокод не должен был примениться"
