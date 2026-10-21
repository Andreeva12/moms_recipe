import pytest
import time
from appium import webdriver
from appium.options.android import UiAutomator2Options
from selenium.webdriver.support.ui import WebDriverWait
import config

def pytest_addoption(parser):
    """Добавляем кастомные аргументы командной строки"""
    parser.addoption("--device", action="store", default=config.DEVICE_NAME, help="Имя устройства")
    parser.addoption("--env", action="store", default="sandbox", help="Окружение: sandbox, prod")

@pytest.fixture(scope="session")
def environment(request):
    """Возвращает текущее окружение"""
    return request.config.getoption("--env")

@pytest.fixture(scope="function")
def driver(request):
    """Фикстура для создания драйвера Appium"""
    device_name = request.config.getoption("--device")
    
    options = UiAutomator2Options()
    options.platform_name = config.PLATFORM_NAME
    options.device_name = device_name
    options.app_package = config.APP_PACKAGE
    options.app_activity = config.APP_ACTIVITY
    options.automation_name = config.AUTOMATION_NAME
    options.no_reset = True
    options.auto_grant_permissions = True
    options.skip_unlock = True
    options.new_command_timeout = config.NEW_COMMAND_TIMEOUT
    options.adb_exec_timeout = config.ADB_EXEC_TIMEOUT
    options.uiautomator2_server_install_timeout = config.UI_TIMEOUT

    driver = webdriver.Remote(config.APPIUM_SERVER, options=options)
    print(f"✅ Приложение запущено на {device_name}")
    
    yield driver
    
    time.sleep(2)
    driver.quit()
    print("✅ Драйвер закрыт")

@pytest.fixture(scope="function")
def wait(driver):
    """Фикстура для явных ожиданий"""
    return WebDriverWait(driver, config.EXPLICIT_WAIT)

@pytest.fixture(scope="function")
def screenshot_on_failure(request, driver):
    """Автоматический скриншот при падении теста"""
    yield
    if request.node.rep_call.failed:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        screenshot_path = f"reports/screenshot_{timestamp}.png"
        driver.save_screenshot(screenshot_path)
        print(f"📸 Скриншот сохранён: {screenshot_path}")

# Хук для перехвата результата теста
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)