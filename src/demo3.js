/**
 * 生成图片
 */
const path = require('path')
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors') // 引入手机设备ua 设置
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
  await page.emulate(devices['iPhone X'])
  await page.goto('https://huke.163.com/')
  // await page.screenshot({
  //   path: 'qiyu_fullscreen.png', // 图片保存路径
  //   type: 'png',
  //   fullPage: true // 边滚动边截图
  //   // clip: { x: 0, y: 0, width: 1920, height: 800 }
  // })
  await page.waitFor(3000)
  // 某个元素的截图
  let element = await page.$('.Home-H5-topBar')
  await element.screenshot({
    path: 'element.png'
  })
  await page.close()
  await browser.close()
})()
