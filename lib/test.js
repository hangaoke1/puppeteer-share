(async () => {
  const genBrowser = require('./singleBrowser');
  browser = await genBrowser()
  page = await browser.newPage()
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3838.0 Safari/537.36 " + Math.random())
  await page.goto('https://plogin.m.jd.com/login/login')
})()