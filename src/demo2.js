/**
 * 生成pdf
 */
const path = require('path')
const puppeteer = require('puppeteer');
const launchOpt = {
  headless: true, // 目前仅支持headless生成pdf
  devtools: true,
  defaultViewport: null,
  ignoreDefaultArgs: [ '--enable-automation' ],
  args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  executablePath: path.join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium')
}
;(async () => {
  const browser = await puppeteer.launch(launchOpt);
  const page = await browser.newPage();
  await page.goto('https://huke.163.com/');
  await page.pdf({path: 'qiyu.pdf', format: 'A4'});
  await browser.close();
})();
