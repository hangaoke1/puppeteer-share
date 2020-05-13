/**
 * 页面性能统计
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
const times = 2
const record = []
const url = 'https://www.163.com'
;(async () => {
  console.log('>>> 性能统计开始')
  for (let i = 0; i < times; i++) {
    const browser = await puppeteer.launch(launchOpt)
    const page = await browser.newPage()
    await page.goto(url)
    // 等待保证页面加载完成
    await page.waitFor(5000)
    // 获取页面的 window.performance 属性
    const timing = JSON.parse(await page.evaluate(() => JSON.stringify(window.performance.timing)))
    record.push(calculate(timing))
    await browser.close()
  }

  let whiteScreenTime = 0, // 白屏时间
    requestTime = 0, // 请求耗时
    dns = 0, // DNS耗时
    tcp = 0, // TCP链接耗时
    domParse = 0, // DOM解析耗时
    domReady = 0, // domReady时间
    onload = 0 // 触发onLoad时间

  for (let item of record) {
    whiteScreenTime += item.whiteScreenTime
    requestTime += item.requestTime
    dns += item.dns
    tcp += item.tcp
    domParse += item.domParse
    domReady += item.domReady
    onload += item.onload
  }

  console.log('>>> 性能统计结果')
  console.log('----------')
  const result = []
  result.push(url)
  result.push(`页面平均白屏时间为：${whiteScreenTime / times} ms`)
  result.push(`页面平均请求时间为：${requestTime / times} ms`)
  result.push(`页面平均DNS耗时：${dns / times} ms`)
  result.push(`页面平均TCP耗时：${tcp / times} ms`)
  result.push(`页面平均DOM解析耗时：${domParse / times} ms`)
  result.push(`页面平均domready时间为：${domReady / times} ms`)
  result.push(`页面平均onLoad触发时间：${onload / times} ms`)
  console.log(result)
  console.log('----------')

  function calculate (timing) {
    const result = {}
    // 白屏时间
    result.whiteScreenTime = timing.responseEnd - timing.fetchStart
    // 请求时间
    result.requestTime = timing.responseEnd - timing.responseStart
    // DNS
    result.dns = timing.domainLookupEnd - timing.domainLookupStart
    // TCP
    result.tcp = timing.connectEnd - timing.connectStart
    // DOM解析
    result.domParse = timing.domComplete - timing.domInteractive
    // onready
    result.domReady = timing.domContentLoadedEventEnd - timing.fetchStart
    // onload
    result.onload = timing.loadEventEnd - timing.fetchStart
    return result
  }
})()
