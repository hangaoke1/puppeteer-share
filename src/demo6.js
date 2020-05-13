/**
 * 性能追踪
 */
const path = require('path')
const puppeteer = require('puppeteer')
const launchOpt = {
  headless: false, // 目前仅支持headless生成pdf
  devtools: false,
  defaultViewport: null,
  ignoreDefaultArgs: [ '--enable-automation' ],
  args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  executablePath: path.join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium')
}
;(async () => {
  const browser = await puppeteer.launch(launchOpt)
  const page = await browser.newPage()
  await page.tracing.start({ path: 'trace.json' })
  await page.goto('https://www.qq.com')
  await page.tracing.stop()
  await browser.close()
})()
