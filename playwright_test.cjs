const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/wordcloud/');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'initial_screenshot.png' });

  await browser.close();
})();
