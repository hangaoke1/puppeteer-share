/**
 * 获取苏宁cookie
 * 1. 获取电话号码
 * 2. 打开京东登录页面
 * 3. 输入号码，点击获取验证码
 * 4. 获取验证码
 * 5. 输入验证码登记登录
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const _ = require('lodash');
const devices = require('puppeteer/DeviceDescriptors')  //引入手机设备ua 设置
const SuAES = require('./aes')
const { fetch } = require('../utils');
const singleBrowser = require('./singleBrowser');
const LOGIN = {
	url: 'https://passport.suning.com/ids/login?loginTheme=wap_new',
  accountInput: '#phoneNum',
  authcodeInput: '#yzm',
	getMsgBtn: '.getYzm',
	loginBtn: '.btn-active',
  delay: 200
}

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
      let resolveHandleB = null
      let rejectHandleB = null
      // 短信阻塞
      const promiseA = new Promise((resolveQ, rejectQ) => { resolveHandle = resolveQ; rejectHandle = rejectQ;})
      // 风控校验阻塞
      const promiseB = new Promise((resolveQ, rejectQ) => { resolveHandleB = resolveQ; rejectHandleB = rejectQ;})
      // phone = await getPhone(token)
      phone = '17043060489'
			console.log(`>>> 获取手机号码: ${phone}`)

      page = await singleBrowser.newPage()
      
      await page.emulate(devices['iPhone X'])

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
					let pos = html.indexOf(`<head>`);

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

				if (interceptedRequest.url().indexOf('checkLoginAccount') > -1) {
          
          console.log(`>>> 验证码登录拦截`);
          
					const options = {
						url: interceptedRequest.url(),
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
          const resJson = JSON.parse(response.body.slice(25, -1))
          console.log('>>> 登录结果', resJson)

          let preCookie = await page.evaluate(() => {
            return document.cookie
          }, '')

          if (resJson.code === 'SLR_ERR_0005' || resJson.code === 'SLR_ERR_0006') {
            // 登录成功
            let loginUrl = ''
            if (resJson.code === 'SLR_ERR_0005') {
              loginUrl = await page.evaluate((token) => {
                return srs_prefix_domain + 'smsLogin/checkLoginToken.do?type=1&rememberMe=true&acessToken=' + token +'&detect='+getDetect()+'&dfpToken='+getDfpToken()+'&terminal='+getTerminal()+'&createChannel='+getChannel();
              }, resJson.acessToken)
              console.log('>>> 登录url', loginUrl)
            } else {
              loginUrl = await page.evaluate((token) => {
                return srs_prefix_domain + 'smsLogin/checkTokenRegAndLogin.do?type=1&rememberMe=true&acessToken=' + token +'&detect='+getDetect()+'&dfpToken='+getDfpToken()+'&terminal='+getTerminal()+'&createChannel='+getChannel();	
              }, resJson.acessToken)
              console.log('>>> 注册url', loginUrl)
            }

            let loginRes = await fetch({
              url: loginUrl,
              method: 'get',
              followRedirect: false,
              headers: {
                cookie: preCookie
              }
            })

            console.log('>>> 登录返回结果', loginRes.headers)

            const extraCookie = loginRes.headers['set-cookie'].map(cookie => {
              return cookie.split(';')[0]
            }).join(';')

            preCookie = ';' + extraCookie

            const getAuthIdUrl = loginRes.headers.location;

            let authRes = await fetch({
              url: getAuthIdUrl,
              method: 'get',
              followRedirect: false,
              headers: {
                cookie: preCookie
              }
            })

            console.log('>>> 获取authId结果', authRes.headers)

          } else {
            // 登录异常
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
					if (response.url().indexOf('needVerifyCode') > -1) {
            const res = await response.text()
            const aesRes = res.split(':')[1].slice(1, -3)
            const data = JSON.parse(SuAES.decrypt(aesRes))
            console.log('>>> 安全风控校验结果', data)
						if (data.msg.indexOf('风控返回有风险') > -1) {
              console.log('>>> 被风控检测, 无法操作，需要人工参与')
              await page.waitFor('.dt_child_content_knob')
              const slideBtn = await page.evaluate(() => {
                const info = document.querySelector('.dt_child_content_knob').getBoundingClientRect()
                return {
                  left: info.left,
                  top: info.top,
                  width: info.width,
                  height: info.height
                }
              }, '')
              await page.waitFor('#dt_notice')
              const slideArea = await page.evaluate(() => {
                const info = document.querySelector('#dt_notice').getBoundingClientRect()
                return {
                  left: info.left,
                  top: info.top,
                  width: info.width,
                  height: info.height
                }
              }, '')
              const axleX = 72
              const axleY = 277
              const distance = 1000
              console.log(axleX, axleY, distance)
              console.log('开始滑动')
              await page.mouse.move(axleX, axleY);
              await page.mouse.down();
              await page.waitFor(1000);
              await page.mouse.move(axleX + distance / 4, axleY, { steps: 20 });
              await page.waitFor(2000);
              await page.mouse.move(axleX + distance / 3, axleY, { steps: 18 });
              await page.waitFor(3500);
              await page.mouse.move(axleX + distance / 2, axleY, { steps: 15 });
              await page.waitFor(4000);
              await page.mouse.move(axleX + (distance / 3) * 2, axleY, { steps: 15 });
              await page.waitFor(3500);
              await page.mouse.move(axleX + (distance / 4) * 3, axleY, { steps: 10 });
              await page.waitFor(3500);
              await page.mouse.move(axleX + distance, axleY, { steps: 10 });
              await page.waitFor(3000);
              await page.mouse.up();
              console.log('结束滑动')
              // rejectHandleB()
						} else {
              resolveHandleB()
              console.log('>>> 恭喜您，没有被风控识别')
            }
          }
          
					if (response.url().indexOf('sendCode') > -1) {
						const res = await response.text()
            const aesRes = res.split(':')[1].slice(1, -3)
            const data = JSON.parse(SuAES.decrypt(aesRes))
            console.log('>>> 短信发送请求', data)
            console.log('>>> 获取短信成功')
            // TODO:
						// getMessageQueue(phone, token).then(res => {
            //   console.log('>>> 获取短信成功')
            //   resolveHandle(res)
            // }).catch(err => {
            //   console.log(err.message)
            //   rejectHandle('>>> 获取短信失败')
            // })
					}
				} catch (err) {
					rejectHandle(err)
				}
			});

			await page.goto(LOGIN.url)

      await page.waitFor(500)
      
      // const devtoolsProtocolClient = await page.target().createCDPSession();
			// await devtoolsProtocolClient.send("Emulation.setEmitTouchEventsForMouse", { enabled: true });

      await page.focus(LOGIN.accountInput)
			await page.type(LOGIN.accountInput, phone, { delay: 50 })
			console.log('账号输入完成')
      await page.waitFor(500)
      await page.tap('body')
      try {
        await promiseB
        await page.waitFor(LOGIN.getMsgBtn)
        await page.tap(LOGIN.getMsgBtn)
        console.log('自动点击获取短信')
      } catch (err) {
        console.log('请手动点击获取短信')
      }

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

// getCookiePolling()
getCookie()

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
