const app = require('express')()
const bodyParser = require('body-parser')
const getWxPayUrl = require('../lib/jd-api.js')
const argPort = process.argv[2]
const port = !!argPort ? +argPort : 9580

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

let cookieList = [
	{
		name: 'TrackerID',
		value:
			'fEyHZoxWkcKYp7Wh0qMExiMAEZIXbf7D9ZnLB_3SNSRbx3mpcGyw9Yiucsvj0XfDJUDC1tN8Jel33exJgBxUuimpVFvrtzGQ6Z_AEca9hYr4p7NGQlRlUX5OD__3wEb8lHodY5iQr-HyC3Yv0CgaLw',
		domain: '.jd.com'
	},
	{
		name: 'pt_token',
		value: 'llh4dj6k',
		domain: '.jd.com'
	},
	{
		name: 'pt_key',
		value:
			'AAJdyBiDADDc_aBHFOhlfYIwCRbv5N1kHRWQBhHjKx0jmgVs1voPDFb7e2zeXrpD-HziT53UaY4',
		domain: '.jd.com'
	},
	{
		name: 'pwdt_id',
		value: '1689700009-229544',
		domain: '.jd.com'
	},
	{
		name: 'pt_pin',
		value: '1689700009-229544',
		domain: '.jd.com'
	},
	{
		name: 'mobilev',
		value: 'html5',
		domain: '.jd.com'
	},
	{
		name: '_mkjdcnsl',
		value: '110',
		domain: '.jd.com'
	}
];

app.use('/mobile/getJDPhonePay', async (req, res) => {
	const { mobile, money } = req.body;
	console.log(mobile, money)
	try {
		if (!mobile) {
			throw new Error('请输入手机号')
		}
		if (!money) {
			throw new Error('请输入面额')
		}
		const data = await getWxPayUrl(cookieList, mobile, money);
		res.json({
			code: 200,
			message: '成功',
			data: data
		})
	} catch (err) {
		res.json({
			code: -1,
			message: err.message
		})
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
