const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { width: 320, height: 600, name: '320px' },
    { width: 375, height: 812, name: '375px' },
    { width: 768, height: 1024, name: '768px' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/wordcloud/');

    // We should explicitly clear the text. First we need to open the sidebar on mobile
    if (vp.width <= 768) {
        await page.click('.mobile-menu-toggle');
        await page.waitForTimeout(500); // Wait for sidebar transition
    }

    // Click "Clear" button in sidebar to clear the text so empty state appears
    // We evaluate a click to bypass visibility checks if it's partially offscreen
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const clearBtn = btns.find(b => b.textContent.includes('Clear'));
        if (clearBtn) clearBtn.click();
    });

    await page.waitForTimeout(500); // Wait for any re-renders

    // Take a screenshot of the empty state (close sidebar on mobile first so we can see it clearly)
    if (vp.width <= 768) {
       await page.click('.mobile-menu-toggle');
       await page.waitForTimeout(500);
    }

    await page.screenshot({ path: `/app/screenshot_${vp.name}.png` });
    console.log(`Saved /app/screenshot_${vp.name}.png`);
  }

  await browser.close();
})();
