const puppeteer = require('puppeteer');
const path = require('path');

const dir = 'C:/Users/GLADWI~1/AppData/Local/Temp/claude/C--Users-Gladwin-Gerald-Downloads-All-Nations-School/d2982574-6ee2-4549-aac5-479c23436ede/scratchpad';
const htmlPath = 'file:///' + dir + '/expolead-crm-positioning.html';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // 297mm x 210mm at 96dpi => 1122 x 793 per sheet
  await page.setViewport({ width: 1122, height: 793, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // PDF (two A4 landscape pages)
  await page.pdf({
    path: path.join(dir, 'ExpoLead-CRM-Positioning-v3.pdf'),
    width: '297mm', height: '210mm',
    printBackground: true, pageRanges: '1-2',
  });

  // PNG per sheet for visual QA
  const sheets = await page.$$('.sheet');
  for (let i = 0; i < sheets.length; i++) {
    await sheets[i].screenshot({ path: path.join(dir, `page${i + 1}.png`) });
  }

  await browser.close();
  console.log('done: ' + sheets.length + ' sheets');
})();
