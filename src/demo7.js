/**
 * 脚本注入
 */
const path = require('path')
const puppeteer = require('puppeteer')
const launchOpt = {
  headless: false,
  devtools: true,
  defaultViewport: null,
  ignoreDefaultArgs: [ '--enable-automation' ],
  args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  executablePath: path.join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium')
}
;(async () => {
  const browser = await puppeteer.launch(launchOpt)
  const page = await browser.newPage()
  const param = '到此一游'
  await page.goto('https://www.qq.com')
  const result = await page.evaluate(async (p) => {
    console.log('>>> 脚本执行', p)
    return '从控制台返回'
  }, param)
  console.log('>>> reuslt', result)
})()
