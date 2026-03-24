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
        page.evaluate("document.querySelectorAll('.section-title').forEach(el => { if (el.textContent.includes('Shape Mask')) {el.click(); el.scrollIntoView();} });")
        time.sleep(1)

        # Select 'custom' to reveal the upload button
        page.evaluate("document.querySelectorAll('select').forEach(el => { Array.from(el.options).forEach(opt => { if (opt.value === 'custom') { el.value = 'custom'; el.dispatchEvent(new Event('change', {bubbles: true})); }})});")
        time.sleep(1)

        page.screenshot(path="mobile_mask_320.png")

        browser.close()

run()
