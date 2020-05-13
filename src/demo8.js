/**
 * 模拟登录
 */
const path = require('path')
const puppeteer = require('puppeteer')
const account = {
  username: 'cd1',
  password: 'a123456'
}

const LOGIN = {
  username: '[name=username]',
  password: '[name=password]',
  login: '.j-submitBtn'
}

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

  await page.goto('http://hddd1.qytest.netease.com/login')

  await page.waitFor(LOGIN.username)
  await page.focus(LOGIN.username)
  await page.type(LOGIN.username, account.username, { delay: 50 })
  await page.focus(LOGIN.password)
  await page.type(LOGIN.password, account.password, { delay: 50 })
  await page.click(LOGIN.login)
  await page.waitFor(3000)
  const cookieList = await page.cookies()
  console.log('>>> cookie', cookieList)
})()
