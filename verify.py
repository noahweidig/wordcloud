import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={'width': 375, 'height': 667})
        page = context.new_page()
        page.goto("http://localhost:3000/wordcloud/")
        time.sleep(2)

        # Take a screenshot of the main screen (empty state)
        page.screenshot(path="mobile_main_375.png")

        # Open sidebar
        page.click(".mobile-menu-toggle")
        time.sleep(1)
        page.screenshot(path="mobile_sidebar_375.png")

        # Scroll to upload buttons in sidebar
        page.evaluate("document.querySelector('.sidebar-body').scrollTop = 100;")
        time.sleep(1)
        page.screenshot(path="mobile_sidebar_scrolled_375.png")

        browser.close()

run()
