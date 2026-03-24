import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 320, 'height': 568})
        page = context.new_page()
        page.goto("http://localhost:3000/wordcloud/")
        time.sleep(2)

        # Open sidebar
        page.click(".mobile-menu-toggle")
        time.sleep(1)

        # Open APPEARANCE section
        page.click("text=APPEARANCE")
        time.sleep(1)

        # Scroll to APPEARANCE section
        page.evaluate("document.querySelectorAll('.section-title').forEach(el => { if (el.textContent.includes('Appearance')) el.scrollIntoView(); });")
        time.sleep(1)
        page.screenshot(path="mobile_appearance_320.png")

        browser.close()

run()
