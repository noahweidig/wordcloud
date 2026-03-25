from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="videos")
        page = context.new_page()

        # Disable transitions
        page.add_init_script("""
            const style = document.createElement('style');
            style.textContent = `* { transition: none !important; animation-duration: 0s !important; }`;
            document.head.appendChild(style);
        """)

        # Go to app
        page.goto("http://localhost:3000/wordcloud/")

        # Wait for app to load
        page.wait_for_selector(".app")

        # Set some text to enable buttons
        page.fill("#source-text-input", "test test test test")

        # Open Quick Actions section
        # Ensure it's open
        page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true);")

        # Take screenshot of the utility buttons in control panel (desktop)
        page.locator(".quick-actions").screenshot(path="final_768px.png")

        # Focus on the control panel to see clear button
        page.locator(".control-panel").screenshot(path="control_panel.png")

        # Set mobile viewport and take screenshot
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto("http://localhost:3000/wordcloud/")
        page.wait_for_selector(".app")

        # open sidebar on mobile
        page.click(".mobile-menu-toggle")
        page.wait_for_selector(".sidebar.sidebar-open")

        page.fill("#source-text-input", "test test test test")
        page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true);")

        page.locator(".quick-actions").screenshot(path="final_375px.png")

        # take screenshot of the clear button
        page.locator(".control-panel").screenshot(path="mobile_control_panel.png")

        context.close()
        browser.close()

if __name__ == "__main__":
    verify()
