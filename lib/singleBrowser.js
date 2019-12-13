const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const os = require('os');
const {
	proxy_ip,
	proxy_port,
	mytid,
	password,
	orderid,
	apiKey,
	enable
} = require('../config/index').proxy;

const launchOpt = {
	headless: false,
	devtools: true,
	defaultViewport: null,
	args: enable
		? [
				`--proxy-server=${proxy_ip}:${proxy_port}`,
				'--no-sandbox',
				'--disable-setuid-sandbox'
		  ]
		: ['--no-sandbox', '--disable-setuid-sandbox'],
	executablePath: os.platform() === 'darwin' ? path.join(
		__dirname,
		'../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
	) : undefined
};

class SingleBrowser {
	constructor() {
		this.browser = null;
	}
	// 更换代理
	async changeProxy() {
		try {
			if (!enable) { return }
			const res = await axios.get('https://tps.kdlapi.com/api/changetpsip', {
				params: { orderid, signature: apiKey }
			});
			console.log('✅  更换代理成功', res.data);
		} catch (err) {
			console.log('❌  更换代理失败', err.message);
		}
	}
	async genBrowser() {
		if (!this.browser) {
			this.browser = await puppeteer.launch(launchOpt);
			const page = (await this.browser.pages())[0];
			// await page.authenticate({ username: mytid, password: password });
			// await page.goto('http://2000019.ip138.com/');
			// await page.goto('http://www.baidu.com');
		}
		return this.browser;
	}
	async delBrowser() {
		this.browser && this.browser.close();
	}
	async newPage() {
		if (!this.browser) {
			await this.genBrowser();
		}
		const page = await this.browser.newPage();
		const headers = {
			'Accept-Encoding': 'gzip'
		};
		await page.setExtraHTTPHeaders(headers);

		// 用户名密码认证
		enable && await page.authenticate({ username: mytid, password: password });

		return page;
	}
}

module.exports = new SingleBrowser();
