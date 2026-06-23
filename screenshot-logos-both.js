const puppeteer = require('puppeteer');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; width: 1050px; height: 600px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 80px; }
  .logo { display: inline-flex; align-items: center; gap: 22px; }
  .top { font-family: Arial, sans-serif; font-size: 64px; font-weight: 700; line-height: 1; white-space: nowrap; }
  .green { color: #10b981; }
  .os { color: #94a3b8; font-size: 46px; font-weight: 400; }
  .sub {
    display: flex;
    justify-content: space-between;
    align-self: stretch;
    font-family: Arial, sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #10b981;
    margin-top: 10px;
  }
</style>
</head>
<body>

  <!-- Light logo with tagline -->
  <div class="logo">
    <svg width="100" height="100" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
    </svg>
    <div style="display:inline-flex;flex-direction:column;">
      <div class="top" style="color:#0f172a;">Expo<span class="green">Lead</span><span class="os"> OS</span></div>
      <div class="sub">
        <span>P</span><span>O</span><span>W</span><span>E</span><span>R</span><span>E</span><span>D</span><span style="opacity:0">.</span><span>B</span><span>Y</span><span style="opacity:0">.</span><span>T</span><span>R</span><span>A</span><span>D</span><span>E</span><span>S</span><span>O</span><span>I</span><span>L</span>
      </div>
    </div>
  </div>

  <!-- Dark logo without tagline -->
  <div class="logo">
    <svg width="100" height="100" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <rect x="22" y="1" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <rect x="1" y="22" width="17" height="17" rx="3" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
    </svg>
    <div class="top" style="color:#ffffff;">Expo<span class="green">Lead</span><span class="os"> OS</span></div>
  </div>

</body>
</html>`;

const tmpFile = 'C:/Users/Gladwin Gerald/Downloads/expolead-os/expolead-os/logos-both-tmp.html';
fs.writeFileSync(tmpFile, html);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1050, height: 600 });
  await page._client().send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await page.goto('file:///' + tmpFile.replace(/\\/g, '/'));
  await page.screenshot({
    path: 'C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Logo Ideas/expolead-logos-both.png',
    omitBackground: true,
    clip: { x: 0, y: 0, width: 1050, height: 600 }
  });
  await browser.close();
  fs.unlinkSync(tmpFile);
  console.log('Done');
})();
