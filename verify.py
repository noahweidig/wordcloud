import time
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.goto("http://localhost:3000/wordcloud/")

        # Wait for the clear button to be rendered
        clear_button = page.locator("button:has-text('Clear')")
        clear_button.wait_for()

        # Disable transitions and animations
        page.add_style_tag(content="* { transition: none !important; animation-duration: 0s !important; }")

        # Hover to see the title attribute might not be fully necessary,
        # but we can capture the button itself
        clear_button.screenshot(path="clear_button.png")

        # Taking a screenshot of the tooltip requires hovering, but native tooltips
        # are managed by the OS and might not be reliably captured in screenshots.
        # However, we can take a screenshot of the general area.
        clear_button.hover()
        time.sleep(0.5)
        page.screenshot(path="full_page_clear_hover.png")

        browser.close()

if __name__ == "__main__":
    main()
