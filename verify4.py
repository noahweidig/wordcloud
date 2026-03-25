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

        # Open SHAPE MASK section
        page.evaluate("document.querySelectorAll('.section-title').forEach(el => { if (el.textContent.includes('Shape Mask')) {el.click();} });")
        time.sleep(1)

        # Select 'custom' to reveal the upload button
        page.evaluate("""
            const selects = document.querySelectorAll('select');
            const shapeSelect = selects[selects.length - 1];
            shapeSelect.value = 'custom';
            shapeSelect.dispatchEvent(new Event('change', {bubbles: true}));
        """)
        time.sleep(1)

        # Scroll to SHAPE MASK section
        page.evaluate("document.querySelectorAll('.section-title').forEach(el => { if (el.textContent.includes('Shape Mask')) {el.scrollIntoView();} });")

        page.screenshot(path="mobile_mask2_320.png")

        browser.close()

run()
