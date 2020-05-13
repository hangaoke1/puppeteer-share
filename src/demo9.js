/**
 * 生成骨架屏
 */
const path = require('path')
const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors') // 引入手机设备ua 设置
const fs = require('fs')
const launchOpt = {
  headless: false,
  devtools: true,
  defaultViewport: {
    width: 375,
    height: 1337
  },
  ignoreDefaultArgs: [ '--enable-automation' ], // Inform users that their browser is being controlled by an automated test.
  args: [ '--no-sandbox' ], // 关闭沙箱模式
  executablePath: path.join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium')
}
const createDom = require('./dom')
;(async () => {
  const browser = await puppeteer.launch(launchOpt)
  const page = await browser.newPage()

  await page.emulate(devices['iPhone X'])

  console.log('>>> ✅开始加载网页')

  // await page.goto('https://www.baidu.com/')
  await page.goto('https://huke.163.com/')
  page.waitFor(3000)

  console.log('>>> ✅开始生成骨架页面')

  const result = await page.evaluate(createDom, {
    background: '#eee',
    animation: 'opacity 1s linear infinite;'
  })

  fs.writeFileSync('sk.html', `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <style>
      @keyframes opacity {
        0% {
          opacity: 1
        }

        50% {
          opacity: .5
        }

        100% {
          opacity: 1
        }
      }
    </style>
    <body>
      ${result}
    </body>
    </html>
  `)

  console.log('>>> ✅骨架页面完成', result)
})()
