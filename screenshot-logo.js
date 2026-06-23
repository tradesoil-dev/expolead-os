const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulateMediaFeatures([]);
  await page._client().send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page.goto('file:///C:/Users/Gladwin%20Gerald/Downloads/ExpoLead%20OS%20Project%20Docs/Logo%20Ideas/expolead-logo-final.html');
  await page.waitForSelector('.logo');
  const el = await page.$('.logo');
  await el.screenshot({
    path: 'C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Logo Ideas/expolead-logo-final.png',
    omitBackground: true
  });
  await browser.close();
  console.log('Done');
})();
