/**
 * 请求拦截
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

  const blockTypes = new Set([ 'image', 'media', 'font' ])
  await page.setRequestInterception(true) //开启请求拦截
  page.on('request', (request) => {
    const type = request.resourceType()
    const shouldBlock = blockTypes.has(type)
    if (shouldBlock) {
      // 直接阻止请求
      return request.abort()
    } else {
      // 对请求重写
      return request.continue({
        headers: Object.assign({}, request.headers(), {
          'puppeteer-test': 'true'
        })
      })
    }
  })

  await page.goto('https://www.qq.com')
})()
