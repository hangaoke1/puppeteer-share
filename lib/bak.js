/**
 * 获取京东cookie
 * 1. 获取电话号码
 * 2. 打开京东登录页面
 * 3. 输入号码，点击获取验证码
 * 4. 获取验证码
 * 5. 输入验证码登记登录
 * https://plogin.m.jd.com/cgi-bin/mm/dosendlogincode
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const _ = require('lodash');
const request = require('request');
const genBrowser = require('./singleBrowser');
const SID = 2214
const LOGIN = {
	url: 'https://plogin.m.jd.com/login/login?appid=300&returnurl=https%3A%2F%2Fwqlogin1.jd.com%2Fpassport%2FLoginRedirect%3Fstate%3D729555512%26returnurl%3D%252F%252Fhome.m.jd.com%252FmyJd%252Fnewhome.action%253Fsceneval%253D2%2526ufc%253D%2526%252FmyJd%252Fhome.action&source=wq_passport',
	planB: '.planBLogin',
  accountInput: '.mobile',
  authcodeInput: '#authcode',
  getMsgBtn: '.getMsg-btn',
  delay: 200
}
let lock = true

axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 0;

function fetch(options) {
	return new Promise((resolve, reject) => {
		options.resolveWithFullResponse = true;
		request(options, (error, response, body) => {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				response.body = body;
				resolve(response);
			}
		});
	});
}

// 获取手机号
async function getPhone(token) {
	try {
		const res = await axios.get('http://api.kmiyz.com/api/do.php', {
			params: {
				action: 'getPhone',
				sid: SID,
				token,
				vno: 0,
				locationLevel: 'p',
				location: '四川'
			}
		});
		const code = res.data.split('|')[0];
		const val = res.data.split('|')[1];
		if (code == '1') {
			return val;
		} else {
			throw new Error(val);
		}
	} catch (err) {
		throw err
	}
}

// 获取短信
async function getMessage(phone, token) {
	try {
		const res = await axios.get('http://api.kmiyz.com/api/do.php', {
			params: {
				action: 'getMessage',
				sid: SID,
        token,
        phone
			}
		});
		const code = res.data.split('|')[0];
		const val = res.data.split('|')[1];
		if (code == '1') {
			return val;
		} else {
			throw new Error(val);
		}
	} catch (err) {
		throw err
	}
}

// 拉黑手机号
async function addBlacklist(phone, token) {
	try {
		const res = await axios.get('http://api.kmiyz.com/api/do.php', {
			params: {
				action: 'addBlacklist',
				sid: SID,
        token,
        phone
			}
		});
		const code = res.data.split('|')[0];
		const val = res.data.split('|')[1];
		if (code == '1') {
			return val;
		} else {
			throw new Error(val);
		}
	} catch (err) {
		throw err
	}
}

// 获取cookie
function getCookie(token) {
  return new Promise(async (resolve, reject) => {
		let browser = null
		let page = null
    try {
			// 1. 获取手机号
			let resolveHandle = null
			let rejectHandle = null
			const promiseA = new Promise((resolve, reject) => { resolveHandle = resolve; rejectHandle = reject;})
			const phone = await getPhone(token)
			console.log('获取手机号码: ', phone)

      const browser = await genBrowser()
			page = await browser.newPage()
			await page.emulate({
				viewport: {
					width: 375,
					height: 667,
					isMobile: true,
					hasTouch: true,
					isLandscape: true,
				},
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
			})
			await page.setRequestInterception(true)
			page.on('request', async interceptedRequest => {
				if (interceptedRequest.url() === 'https://plogin.m.jd.com/cgi-bin/mm/dosmslogin') {
					const url = interceptedRequest.url();
					console.log('请求登录拦截: ', url);
					const options = {
						url: url,
						method: interceptedRequest.method(),
						headers: interceptedRequest.headers(),
						body: interceptedRequest.postData(),
						usingProxy: true
					};

					// cookie写入
					if (options.headers && (options.headers.cookie == null || options.headers.Cookie == null)) {
						const cookies = await page.cookies(options.url);
						if (cookies.length) {
							console.log(options.url + "\n" + cookies.map(item => item.name + "=" + item.value + "; domain=" + item.domain).join("\n") + "\n");
								options.headers.cookie = cookies.map(item =>
										item.name + "=" + item.value).join("; ");
						}
					}

					const response = await fetch(options)

					lock = false

					interceptedRequest.abort()

					page.close()
				} else {
					interceptedRequest.continue()
				}
			})
			
			page.on('response', async response => {
				if (response.url() === 'https://jcap.m.jd.com/cgi-bin/api/check') {
					const res = await response.json()
					if (res.img) {
						lock = true
						rejectHandle(new Error('需要图片验证, 无法操作，需要人工参与'))
					} else {
						lock = false
						resolveHandle('')
					}
				}
			});

			await page.goto(LOGIN.url)
			await page.waitFor(LOGIN.planB)
			await page.click(LOGIN.planB)
			await page.waitFor(LOGIN.getMsgBtn)
      await page.focus(LOGIN.accountInput)
			await page.type(LOGIN.accountInput, phone, { delay: 100 })
			await page.waitFor(500)
			await page.evaluate(`Object.defineProperties(navigator,{ webdriver:{ get: () => false}})`)
			await page.evaluate('window.navigator.chrome = { runtime: {} }')
			await page.evaluate(`Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })`)
			await page.evaluate(`Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5,6] })`)
						
			// await page.click(LOGIN.getMsgBtn)
			await promiseA
			// TODO:
			console.log('开始尝试获取短信: ')
    } catch (err) {
			console.log(err)
			// browserPool.removeBrowser(browser)
    }
  })
}

getCookie('739937b6cfde4594761cc50d7eb60fe2')
