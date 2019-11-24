const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

const path = require('path')
// 隧道代理服务器host/ip和端口
let proxy_ip = 'tps168.kdlapi.com';
let proxy_port = 15818;
const mytid = 't17421839588994';
const password = 'ngkc3b1q';

const launchOpt = {
    headless: false,
    devtools: true,
    // ignoreDefaultArgs: ['--enable-automation'],
    // args: [
    //     `--proxy-server=${proxy_ip}:${proxy_port}`,
    //     '--no-sandbox',
    //     '--disable-setuid-sandbox'
    // ],              
    defaultViewport: null,
    executablePath: path.resolve(
        '../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    )
}
let instance = null

class BrowserPool {
    /**
     * 构造函数
     * @param launchOpt             Puppeteer运行参数
     * @param config.max            允许同时打开浏览器的最大数量，默认20个
     * @param config.maxWaitTime    最多等待时长，超过后将自动关闭，默认60秒
     * @param config.checkTime      浏览器超时的检查间隔时间，默认5秒
     */
    constructor(launchOpt = {}, {max = 20, maxWaitTime = 60000, checkTime = 5000} = {}) {

        this.launchOpt = launchOpt
        this.max = max
        this.maxWaitTime = maxWaitTime
        this.browserArr = []
        this.checker = setInterval(async () => {
            const now = new Date() * 1
            const willRemoveBrowserArr = this.browserArr.filter(item => now - item.createTime > this.maxWaitTime)
            await this.removeBrowsers(willRemoveBrowserArr.map(item => item.browser))
        }, checkTime)
    }

    /**
     * 使用完成之后一定要销毁
     */
    destroy() {
        this.removeAll()
        clearInterval(this.checker)
    }

    /**
     * 创建一个新的浏览器实例
     * @returns {Promise<browser>}
     */
    async getBrowser() {
        if (this.browserArr.length < this.max) {
            const browser = await puppeteer.launch(this.launchOpt)
            const page = (await browser.pages())[0]
            await page.close()
            const pageNew = await browser.newPage()
            // await pageNew.emulate(iPhone)
            // await pageNew.authenticate({mytid: mytid, password: password})
            await pageNew.setUserAgent(
                'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36')
            
            const now = new Date() * 1
            this.browserArr.push({
                key: (Math.random() * 10000000000).toFixed(0) + now + '',
                browser,
                createTime: now,
            })
            return browser
        }
    }

    /**
     * 通过key获取浏览器实例
     * @param key
     * @returns {Promise<browser>}
     */
    async getBrowserByKey(key) {
        const arr = this.browserArr.filter(item => item.key === key)
        return !!arr[0] ? arr[0].browser:null
    }

    /**
     * 通过浏览器实例来获取key
     * @param browser
     * @returns {Promise<key>}
     */
    async getKeyByBrowser(browser) {
        const arr = this.browserArr.filter(item => item.browser === browser)
        return arr[0].key
    }

    /**
     * 通过key关闭并移除浏览器实例
     * @param key
     * @returns {Promise<void>}
     */
    async removeBrowserByKey(key) {
        const arr = this.browserArr.filter(item => item.key === key)
        if (arr.length > 0) {
            const index = this.browserArr.indexOf(arr[0])
            const browser = arr[0].browser
            const pages = await browser.pages()
            if (pages.length > 0) {
                const page = pages[0]
                await page.close()
            }
            !!browser && await browser.close()
            if (index !== -1) {
                this.browserArr.splice(index, 1)
            }
        }
    }

    /**
     * 通过浏览器实例关闭并移除该实例
     * @param browser
     * @returns {Promise<void>}
     */
    async removeBrowser(browser) {
        const key = await this.getKeyByBrowser(browser)
        if (key) {
            await this.removeBrowserByKey(key)
        }
    }

    /**
     * 关闭并移除一组浏览器实例
     * @param browserArr
     * @returns {Promise<void>}
     */
    async removeBrowsers(browserArr) {
        for (const browser of browserArr) {
            await this.removeBrowser(browser)
        }
    }

    /**
     * 关闭并移除第一个实例
     * @returns {Promise<void>}
     */
    async unshift() {
        if (this.browserArr.length > 0) {
            const browser = this.browserArr[0].browser
            const pages = await browser.pages()
            const page = pages[0]
            await page.close()
            await browser.close()
            this.browserArr.splice(0, 1)
        }
    }

    /**
     * 移除所有实例
     * @returns {Promise<void>}
     */
    async removeAll() {
        let len = this.browserArr.length
        const count = len
        while (len-- > 0) {
            await this.unshift()
        }
        return count
    }
}

module.exports = (() => {
    if (!instance) {
        instance = new BrowserPool(launchOpt, {max: 10, maxWaitTime: 60000 * 3})
    }
    return instance
})()
