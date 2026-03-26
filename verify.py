import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Configure viewport for Mobile
        context_mobile = await browser.new_context(viewport={'width': 375, 'height': 812})
        page_mobile = await context_mobile.new_page()

        await page_mobile.goto("http://localhost:3000/wordcloud/")
        await page_mobile.add_style_tag(content="* { transition: none !important; animation-duration: 0s !important; }")

        # The main viewport will likely just show the WordCloud since there's sample text.
        # We don't need to check "Add Text to Begin" if there is sample text.

        # Open the sidebar
        await page_mobile.click("button.mobile-menu-toggle")

        # Wait for the sidebar Generate button
        await page_mobile.wait_for_selector("aside.sidebar button:has-text('Generate')")

        # Take screenshot of the sidebar button on Mobile
        button_locator_mobile = page_mobile.locator("aside.sidebar button").filter(has_text="Generate").first
        await button_locator_mobile.screenshot(path="mobile_generate_button.png")
        print("Captured mobile screenshot")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())