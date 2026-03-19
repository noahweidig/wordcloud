const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 768, height: 1024 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto('http://localhost:3000/wordcloud/', { waitUntil: 'networkidle' });

    // click mobile menu toggle to open sidebar
    try {
      if (await page.isVisible('.mobile-menu-toggle')) {
        await page.click('.mobile-menu-toggle');
        await page.waitForTimeout(500); // Wait for sidebar to open
      }
    } catch (e) {
      console.log('Mobile menu toggle not visible on viewport', vp.width);
    }

    await page.screenshot({ path: `final_${vp.width}px.png` });

    // Test scrolling to bottom of sidebar
    if (vp.width <= 768) {
      await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar-body');
        if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `final_scroll_${vp.width}px.png` });
    }

    await page.close();
  }

  await browser.close();
})();
