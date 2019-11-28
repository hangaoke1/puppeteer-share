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

const _ = require('lodash');
const { filterJDCookie, fetch } = require('../utils');
const { getPhone, getMessageQueue, addBlacklist, getOrderStatus, syncCookie } = require('./phoneService.js');
const singleBrowser = require('./singleBrowser');
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
let needChangeUa = true
let ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3838.0 Safari/537.36'

// 获取cookie
function getCookie(token) {
  return new Promise(async (resolve, reject) => {
		let page = null
		let phone = null
    try {
			// 1. 获取手机号
			let resolveHandle = null
			let rejectHandle = null
			const promiseA = new Promise((resolveQ, rejectQ) => { resolveHandle = resolveQ; rejectHandle = rejectQ;})
			phone = await getPhone(token)
			console.log(`>>> 获取手机号码: ${phone}`)

			page = await singleBrowser.newPage()

			if (needChangeUa) {
				ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3838.0 Safari/537.36 ' + Math.random()
				needChangeUa = false
			}

			await page.setUserAgent(ua)

			page.setRequestInterception(true)

		  page.on('request', async interceptedRequest => {
				if (interceptedRequest.url() === LOGIN.url) {
					const options = {
						url: LOGIN.url,
						method: interceptedRequest.method(),
						headers: interceptedRequest.headers(),
						body: interceptedRequest.postData()
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

					let html = response.body
					let pos = html.indexOf(`<body>`);

					// 想再页面中插入的js代码
					html = html.slice(0, pos) + 
					`
					<script>
						console.log('😊  开始抹除浏览器信息')
						Object.defineProperties(navigator,{ webdriver:{ get: () => false}})
						window.navigator.chrome = { runtime: {} }
						Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
						Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5,6] })
						console.log('😊  浏览器信息抹除完成')
					</script>
					` 
					+ html.slice(pos, html.length);

					return interceptedRequest.respond({
						status: response.statusCode,
						contentType: response.headers['content-type'],
						headers: response.headers,
						body: html
					});
				}

				if (interceptedRequest.url() === 'https://plogin.m.jd.com/cgi-bin/mm/dosmslogin') {
					const url = interceptedRequest.url();
					console.log(`>>> 验证码登录拦截: ${url}`);
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
					console.log('>>> 登录结果', response.body)

					const cookieStr = response.headers['set-cookie'] && response.headers['set-cookie'].join(';')

					const cookie = filterJDCookie(cookieStr)

					if (cookie.indexOf('TrackerID') > -1) {
						console.log('>>> 获取cookie成功: ', phone, cookie)
						console.log('>>> ⌛️  检测cookie时效性')
						const data = await getOrderStatus(106367592099, cookie)
						if (data === -100) {
							needChangeUa = true
							const cookieList = await page.cookies()
							await page.deleteCookie(...cookieList)
							await page.evaluate(`localStorage.clear();localStorage.setItem('isUsername', '"false"');console.log('清空本地缓存')`)
							console.log('>>> ❌  获取cookie无效，清除浏览器cookie, localStorage')
							await singleBrowser.changeProxy()
						} else {
							console.log('>>> ✅  获取cookie有效')
							console.log('>>> ⌛️  开始上传cookie')
							const data = await syncCookie(phone, cookie)
							console.log('>>> ✅  cookie上传完成', JSON.stringify(data))
						}
					} else {
						needChangeUa = true
						const cookieList = await page.cookies()
						await page.deleteCookie(...cookieList)
						await page.evaluate(`localStorage.clear();localStorage.setItem('isUsername', '"false"');console.log('清空本地缓存')`)
						await singleBrowser.changeProxy()
						console.log('>>> ❌  获取cookie失败, 清除浏览器cookie, localStorage')
						console.log(`>>> 加入黑名单: ${phone}`)
						await addBlacklist(phone, token)
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
							console.log('>>> 需要图片验证, 无法操作，需要人工参与')
						}
					}
					if (response.url() === 'https://plogin.m.jd.com/cgi-bin/mm/dosendlogincode') {
						const res = await response.json()
						if (res.err_msg == '该手机号未注册，请先注册') {
							// console.log(`>>> 首次注册`)
							// await page.evaluate(`localStorage.setItem('jd-smsLoginReg', '""');console.log('清空注册提示')`)
							return rejectHandle('>>> ' + res.err_msg)
						}

						if (res.err_msg && res.err_msg != '该手机号未注册，请先注册' && res.err_msg != '短信已经发送，请勿重复提交') {
							rejectHandle('>>> ' + res.err_msg)
						} else {
							// 开始检测短信
							getMessageQueue(phone, token).then(res => {
								console.log('>>> 获取短信成功')
								resolveHandle(res)
							}).catch(err => {
								console.log(err.message)
								rejectHandle('>>> 获取短信失败')
							})
						}
					}
				} catch (err) {
					rejectHandle(err)
				}
			});

			await page.goto(LOGIN.url)

			await page.waitFor(500)

			if (isFirst) {
				isFirst = false
				await page.waitFor(LOGIN.planB)
				await page.tap(LOGIN.planB)
			}

			await page.waitFor(500)
      await page.focus(LOGIN.accountInput)
			await page.type(LOGIN.accountInput, phone, { delay: 50 })
			console.log('账号输入完成')

			await page.waitFor(500)
			await page.waitFor(LOGIN.getMsgBtn)
			await page.tap(LOGIN.getMsgBtn)
			console.log('点击获取短信')

			const devtoolsProtocolClient = await page.target().createCDPSession();
			await devtoolsProtocolClient.send("Emulation.setEmitTouchEventsForMouse", { enabled: true });

			await page.evaluate(`localStorage.setItem('mobile', '""');console.log('清空电话')`)

			const msgCodeStr = await promiseA
			const msgCode = msgCodeStr.replace(/[^0-9]/ig, '');
			console.log(`>>> 验证码获取成功: ${msgCode}`)

			await page.focus(LOGIN.authcodeInput)
			await page.type(LOGIN.authcodeInput, msgCode, { delay: 50 })
			await page.waitFor(500)
			await page.tap(LOGIN.loginBtn)

    } catch (err) {
			console.log('异常捕获', err)
			console.log(`>>> 加入黑名单: ${phone}`)
			addBlacklist(phone, token).catch(err => {})
			page && page.close().catch(err)

			resolve()
    }
  })
}

function getCookiePolling (cookie, count = 1) {
	return new Promise((resolve, reject) => {
		console.log('\n-----------------------------------------------------');
		console.log(`🔥  第${count}轮获取cookie 开始执行自动登录  🔥`)
		console.log('-----------------------------------------------------');
		count += 1
		getCookie(cookie).then(res => {
			setTimeout(() => {
				resolve(getCookiePolling(cookie, count))
			}, 2000)  
		}).catch(err => {
			console.error(err)
			setTimeout(() => {
				resolve(getCookiePolling(cookie, count))
			}, 2000)  
		})
	})
}


// TODO: test
// getCookie('pp7w0lpocbv7mpvalwlc0qbm0l5bwkop')

getCookiePolling('pp7w0lpocbv7mpvalwlc0qbm0l5bwkop')

// 监听手动ctrl + c
process.on('SIGINT', function() {
	singleBrowser.delBrowser()
	console.log('🐶  进程已退出  🐶')
  process.exit(1)
});

// 捕获在中间件之外发生的异常
process.on('uncaughtException', function (err) {
  console.error('全局异常: uncaughtException')
	console.error(err)
	singleBrowser.delBrowser()
	console.log('🐶  进程已退出  🐶')
  process.exit(1)
})

// 捕获未处理的 Promise 异常
process.on('unhandledRejection', function (err) {
  console.error('全局异常: unhandledRejection')
  console.error(err)
})
