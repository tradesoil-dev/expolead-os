const puppeteer = require('puppeteer');
const fs = require('fs');

const lightHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; width: 1050px; height: 600px; display: flex; align-items: center; justify-content: center; }
  .logo { display: inline-flex; align-items: center; gap: 28px; }
  .top { font-family: Arial, sans-serif; font-size: 72px; font-weight: 700; color: #0f172a; line-height: 1; white-space: nowrap; }
  .green { color: #10b981; }
  .os { color: #94a3b8; font-size: 52px; font-weight: 400; }
  .sub { display: flex; justify-content: space-between; align-self: stretch; font-family: Arial, sans-serif; font-size: 19px; font-weight: 700; color: #10b981; margin-top: 12px; }
</style></head>
<body>
<div class="logo">
  <svg width="116" height="116" viewBox="0 0 40 40" fill="none">
    <rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
    <rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
    <rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
    <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
  </svg>
  <div style="display:inline-flex;flex-direction:column;">
    <div class="top">Expo<span class="green">Lead</span><span class="os"> OS</span></div>
    <div class="sub">
      <span>P</span><span>O</span><span>W</span><span>E</span><span>R</span><span>E</span><span>D</span><span style="opacity:0">.</span><span>B</span><span>Y</span><span style="opacity:0">.</span><span>T</span><span>R</span><span>A</span><span>D</span><span>E</span><span>S</span><span>O</span><span>I</span><span>L</span>
    </div>
  </div>
</div>
</body></html>`;

const darkHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; width: 1050px; height: 600px; display: flex; align-items: center; justify-content: center; }
  .logo { display: inline-flex; align-items: center; gap: 28px; }
  .top { font-family: Arial, sans-serif; font-size: 72px; font-weight: 700; color: #ffffff; line-height: 1; white-space: nowrap; }
  .green { color: #10b981; }
  .os { color: #94a3b8; font-size: 52px; font-weight: 400; }
</style></head>
<body>
<div class="logo">
  <svg width="116" height="116" viewBox="0 0 40 40" fill="none">
    <rect x="1" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="22" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="1" y="22" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
  </svg>
  <div class="top">Expo<span class="green">Lead</span><span class="os"> OS</span></div>
</div>
</body></html>`;

const lightTmp = 'C:/Users/Gladwin Gerald/Downloads/expolead-os/expolead-os/logo-light-tmp.html';
const darkTmp = 'C:/Users/Gladwin Gerald/Downloads/expolead-os/expolead-os/logo-dark-tmp.html';
fs.writeFileSync(lightTmp, lightHtml);
fs.writeFileSync(darkTmp, darkHtml);

(async () => {
  const browser = await puppeteer.launch();

  // Light logo
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1050, height: 600 });
  await page1._client().send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page1.goto('file:///' + lightTmp);
  await page1.screenshot({
    path: 'C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Logo Ideas/expolead-logo-light-1050x600.png',
    omitBackground: true,
    clip: { x: 0, y: 0, width: 1050, height: 600 }
  });
  console.log('Light logo done');

  // Dark logo
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1050, height: 600 });
  await page2._client().send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page2.goto('file:///' + darkTmp);
  await page2.screenshot({
    path: 'C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Logo Ideas/expolead-logo-dark-1050x600.png',
    omitBackground: true,
    clip: { x: 0, y: 0, width: 1050, height: 600 }
  });
  console.log('Dark logo done');

  await browser.close();
  fs.unlinkSync(lightTmp);
  fs.unlinkSync(darkTmp);
})();
