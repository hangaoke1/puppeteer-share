const app = require('express')()
const bodyParser = require('body-parser')
const getWxPayUrl = require('../lib/jd-api.js')
const cookieList = require('../mock/cookie');
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

app.use('/mobile/getJDPhonePay', async (req, res) => {
	let { mobile, money, cookie } = req.body;
	console.log(`INFO: 话费充值请求-mobile:${mobile}, money:${money}, cookie: ${cookie}`);

	try {
		// TODO: 测试环境缺省状态使用小韩的cookie
		if (!cookie) {
			cookie = cookieList.reduce((total, item) => {
				total += item.name + '=' + item.value + '; ';
				return total;
			}, '');
		}
		cookie = cookie.replace('csrfToken', 'csrfTokenBak')
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
		console.error('FAIL: 充值请求失败', err)
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
