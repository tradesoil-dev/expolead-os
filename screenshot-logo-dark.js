const puppeteer = require('puppeteer');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; display: inline-block; }
  .logo {
    background: transparent;
    padding: 20px 28px;
    display: inline-flex;
    align-items: center;
    gap: 18px;
  }
  .top {
    font-family: Arial, sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
    white-space: nowrap;
  }
  .top .green { color: #10b981; }
  .top .os { color: #94a3b8; font-size: 26px; font-weight: 400; }
</style>
</head>
<body>
<div class="logo">
  <svg width="58" height="58" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="22" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="1" y="22" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
  </svg>
  <div class="top">Expo<span class="green">Lead</span><span class="os"> OS</span></div>
</div>
</body>
</html>`;

const tmpFile = 'C:/Users/Gladwin Gerald/Downloads/expolead-os/expolead-os/logo-dark-tmp.html';
fs.writeFileSync(tmpFile, html);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page._client().send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'));
  await page.waitForSelector('.logo');
  const el = await page.$('.logo');
  await el.screenshot({
    path: 'C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Logo Ideas/expolead-logo-dark.png',
    omitBackground: true
  });
  await browser.close();
  fs.unlinkSync(tmpFile);
  console.log('Done');
})();
