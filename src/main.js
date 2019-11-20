const app = require('express')()
const bodyParser = require('body-parser')
const { getWxPayUrl, getOrderStatus } = require('../lib/jd-api.js')
const cookieList = require('../mock/cookie');
const { filterCookie } = require('../utils/index')
const argPort = process.argv[2]
const port = !!argPort ? +argPort : 9580
const config = require('../config')

if (config.log4js) {
  require('../log4js/index')
}

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json({limit: '2mb'}))
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}))
app.use((req, resp, next) => {
    resp.header("Access-Control-Allow-Credentials", true)
    resp.header('Access-Control-Allow-Origin', '*')
    resp.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
    resp.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})

app.use('/index', (req, res) => {
	res.render("index.html",{ title:"hello" })
})

app.use('/mobile/getJDOrderStatus', async (req, res) => {
	let { orderId, cookie } = req.body;
	let cookieOrigin = cookie;
	console.log(`JD: 话费到账请求 orderId:${orderId}, cookie: ${cookie}`);
	try {
		if (!cookie) {
			throw new Error('cookie不能为空')
		}
		if (!orderId) {
			throw new Error('订单号不能为空')
		}
		const data = await getOrderStatus(orderId, cookie)
		if (data === -100) {
			throw new Error('cookie已失效')
		}
		console.log(`JD: 话费到账查询成功 orderId:${orderId}, data: ${JSON.stringify(data)}`);
		res.json({
			code: 200,
			message: '查询成功',
			data
		})
	} catch (err) {
		console.error(`JD: 到账查询失败 orderId:${orderId}, cookie: ${cookieOrigin}`, err)
		if (err.message === 'cookie已失效' || err.message === 'The header content contains invalid characters') {
			res.json({
				code: -100,
				message: err.message
			})
		} else {
			res.json({
				code: -1,
				message: err.message
			})
		}
	}
})

app.use('/mobile/getJDPhonePay', async (req, res) => {
	let { mobile, money, cookie } = req.body;
	let cookieOrigin = cookie;
	console.log(`JD: 话费充值请求 mobile:${mobile}, money:${money}, cookie: ${cookie}`);

	try {
		if (!cookie) {
			throw new Error('cookie不能为空')
		}
		if (!mobile) {
			throw new Error('手机号不能为空')
		}
		if (!money) {
			throw new Error('面额不能为空')
		}
		cookie = filterCookie(cookie)
		const data = await getWxPayUrl(cookie, mobile, money);
		console.log(`JD: 话费充值请求成功 mobile:${mobile}, data: ${JSON.stringify(data)}`);
		res.json({
			code: 200,
			message: '成功',
			data: data
		})
	} catch (err) {
		console.error(`JD: 充值请求失败 mobile:${mobile}, money:${money}, cookie: ${cookieOrigin}`, err)
		if (err.message === 'cookie已失效' || err.message === 'The header content contains invalid characters') {
			res.json({
				code: -100,
				message: err.message
			})
		} else {
			res.json({
				code: -1,
				message: err.message
			})
		}
	}
})

app.use('/jd', async (req, res) => {
	try {
		const mobile = req.query.mobile;
		const money = req.query.money;
		if (!mobile) {
			throw new Error('请输入手机号')
		}
		if (!money) {
			throw new Error('请输入面额')
		}
		const data = await getWxPayUrl(cookieList, mobile, money);
		res.render('wechat.html', {
			info: data
		})
	} catch (err) {
		res.json({
			code: -1,
			message: err.message
		})
	}
})

app.listen(port, () => {
    console.log('server start!')
    console.log(`port is ${port}`)
})
