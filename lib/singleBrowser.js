const path = require('path')
const puppeteer = require('puppeteer')
const launchOpt = {
  headless: false,
  devtools: true,          
  defaultViewport: null,
  executablePath: path.resolve(
      '../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
  )
}

let browser = null;

// 生成
async function genBrowser () {
  if (!browser) {
    browser = await puppeteer.launch(launchOpt)
  }
  return browser
}

module.exports = genBrowser