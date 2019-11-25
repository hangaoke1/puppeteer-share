/**
 * 获取京东cookie
 * 1. 获取电话号码
 * 2. 打开京东登录页面
 * 3. 输入号码，点击获取验证码
 * 4. 获取验证码
 * 5. 输入验证码登记登录
 * https://plogin.m.jd.com/cgi-bin/mm/dosendlogincode
 * https://plogin.m.jd.com/cgi-bin/mm/dosmslogin
 */

// dosmslogin
// {
// 	"err_code" : 194,
// 	"err_msg" : "您的账号因安全原因被暂时封锁，请将账号和联系方式发送到shensu@jd.com，等待处理",
// 	"errcode" : 194,
// 	"message" : "您的账号因安全原因被暂时封锁，请将账号和联系方式发送到shensu@jd.com，等待处理"
// }

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const _ = require('lodash');
const request = require('request');
const genBrowser = require('./singleBrowser');
const SID = 2214
const LOGIN = {
	url: 'https://plogin.m.jd.com/login/login',
	planB: '.planBLogin',
  accountInput: '.mobile',
  authcodeInput: '#authcode',
	getMsgBtn: '.getMsg-btn',
	loginBtn: '.btn-active',
  delay: 200
}
let isFirst = true

axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 0;

function filterJDCookie (cookie) {
  cookie = cookie.replace(/\s/g, '')
  const whiteList = ['TrackerID', 'pt_key', 'pt_pin', 'pt_token', 'pwdt_id']
  return cookie.split(';').filter(item => {
    for (let i = 0; i < whiteList.length; i++) {
      if (item.indexOf(whiteList[i]) > -1) {
        return true
      }
    }
    return false
  }).join(';').trim()
}

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
		const res = await axios.get('http://api.caihyz.com/api/do.php', {
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
		const res = await axios.get('http://api.caihyz.com/api/do.php', {
			params: {
				action: 'getMessage',
				sid: SID,
        token,
        phone
			}
		});
		const code = res.data.split('|')[0];
		const val = res.data.split('|')[1];
		return {
			code,
			val
		}
	} catch (err) {
		throw err
	}
}

function getMessageQueue(phone, token, count = 0) {
	return new Promise((resolve, reject) => {
		getMessage(phone, token).then(res => {
			count += 1
			console.log(`第${count}次查询短信${phone}`, JSON.stringify(res))
			if (res.code == 1) {
				resolve(res.val)
			} else {
				if (count < 10) {
					timer = setTimeout(() => {
						resolve(getMessageQueue(phone, token, count))
					}, 5000)  
				} else {
					reject('超过轮询次数')
				}
			}
		})
	})
}

// 拉黑手机号
async function addBlacklist(phone, token) {
	try {
		const res = await axios.get('http://api.caihyz.com/api/do.php', {
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
			const promiseA = new Promise((resolveQ, rejectQ) => { resolveHandle = resolveQ; rejectHandle = rejectQ;})
			const phone = await getPhone(token)
			console.log('获取手机号码: ', phone)

      browser = await genBrowser()
			page = await browser.newPage()

			page.setRequestInterception(true)

		  page.on('request', async interceptedRequest => {
				if (interceptedRequest.url() === 'https://plogin.m.jd.com/cgi-bin/mm/dosmslogin') {
					const url = interceptedRequest.url();
					console.log('验证码拦截: ', url);
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
								options.headers.cookie = cookies.map(item =>
										item.name + "=" + item.value).join("; ");
						}
					}

					const response = await fetch(options)
					console.log('登录结果', response.body)

					const cookieStr = response.headers['set-cookie'] && response.headers['set-cookie'].join(';')

					// console.log(response.headers['set-cookie'])

					const cookie = filterJDCookie(cookieStr)

					if (cookie.indexOf('TrackerID') > -1) {
						console.log('获取cookie成功: ', phone, cookie)
					} else {
						console.log('获取cookie失败: ', phone)
					}
					interceptedRequest.respond({
						status: response.statusCode,
						contentType: response.headers['content-type'],
						headers: response.headers,
						body: response.body
					});
					await page.close()
					resolve()
				} else {
					interceptedRequest.continue()
				}
			})
			
		  page.on('response', async response => {
				try {
					if (response.url() === 'https://jcap.m.jd.com/cgi-bin/api/check') {
						const res = await response.json()
						if (res.img) {
							console.log('需要图片验证, 无法操作，需要人工参与')
						}
					}
					if (response.url() === 'https://plogin.m.jd.com/cgi-bin/mm/dosendlogincode') {
						const res = await response.json()
						if (res.err_msg) {
							console.log(res.err_msg)
							rejectHandle('')
						} else {
							// 开始检测短信
							getMessageQueue(phone, token).then(res => {
								console.log('获取短信成功')
								resolveHandle(res)
							}).catch(err => {
								console.log('获取短信失败')
								rejectHandle('')
							})
						}
					}
				} catch (err) {
					rejectHandle('')
				}
			});

			await page.goto(LOGIN.url)
			await page.waitFor(1000)

			if (isFirst) {
				isFirst = false
				await page.waitFor(LOGIN.planB)
				await page.tap(LOGIN.planB)
			}

			await page.waitFor(1000)
      await page.focus(LOGIN.accountInput)
			await page.type(LOGIN.accountInput, phone, { delay: 100 })
			console.log('账号输入完成')

			await page.evaluate(`Object.defineProperties(navigator,{ webdriver:{ get: () => false}})`)
			await page.evaluate('window.navigator.chrome = { runtime: {} }')
			await page.evaluate(`Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })`)
			await page.evaluate(`Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5,6] })`)
			

			await page.waitFor(1000)
			await page.waitFor(LOGIN.getMsgBtn)
			await page.tap(LOGIN.getMsgBtn)
			console.log('点击获取短信')
			

			const devtoolsProtocolClient = await page.target().createCDPSession();
			await devtoolsProtocolClient.send("Emulation.setEmitTouchEventsForMouse", { enabled: true });

			await page.evaluate(`localStorage.setItem('mobile', '""');console.log('清空电话')`)

			const msgCodeStr = await promiseA
			const msgCode = msgCodeStr.replace(/[^0-9]/ig, '');
			console.log('--验证码获取成功--', msgCode)

			await page.focus(LOGIN.authcodeInput)
			await page.type(LOGIN.authcodeInput, msgCode, { delay: 100 })
			await page.waitFor(1000)
			await page.tap(LOGIN.loginBtn)

    } catch (err) {
			console.log('异常捕获', err)

			try {
				await page.close()
			} catch(err) {}
			resolve()
    }
  })
}

// getCookie('739937b6cfde4594761cc50d7eb60fe2')

function getCookiePolling (cookie, count = 0) {
	return new Promise((resolve, reject) => {
		getCookie(cookie).then(res => {
			count += 1
			console.log(`第${count}轮获取cookie`)
			setTimeout(() => {
				resolve(getCookiePolling(cookie, count))
			}, 5000)  
		}).catch(err => {
			console.error(err)
			setTimeout(() => {
				resolve(getCookiePolling(cookie, count))
			}, 5000)  
		})
	})
}

getCookiePolling('pp7w0lpocbv7mpvalwlc0qbm0l5bwkop')
