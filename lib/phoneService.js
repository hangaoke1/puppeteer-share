process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const child_process = require('child_process');
const cheerio = require('cheerio');
const HttpAgent = require('agentkeepalive')
const HttpsAgent = require('agentkeepalive').HttpsAgent
const config = require('../config/index');
const SID = config.kuaimi.sid;
const kuaimiUrl = config.kuaimi.url;

const httpAgent = new HttpAgent({
  timeout: 60000,
  freeSocketTimeout: 30000
})
const httpsAgent = new HttpsAgent({
  timeout: 60000,
  freeSocketTimeout: 30000
})

axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 0;
axios.default.httpAgent = httpAgent
axios.default.httpsAgent = httpsAgent
axios.defaults.headers.common['Accept-Encoding'] = 'gzip';

// 获取手机号
async function getPhone(token) {
	try {
		const res = await axios.get(kuaimiUrl, {
			params: {
				action: 'getPhone',
				sid: SID,
				token,
				vno: 0,
				// locationLevel: 'p',
				// location: '四川'
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
		const res = await axios.get(kuaimiUrl, {
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


// 拉黑手机号
async function addBlacklist(phone, token) {
	try {
		const res = await axios.get(kuaimiUrl, {
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
		console.log(err)
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
		}).catch(reject)
	})
}

const statusMap = {
	'等待付款': 0,
	'正在充值': 1,
	'充值成功': 2,
	'订单取消': 3
}

function getOrderStatus(orderId, cookies) {
	return new Promise(resolve => {
		const curl = `curl 'https://newcz.m.jd.com/newcz/detail.action?orderId=${orderId}&channel=' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-Mode: navigate' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookies}' --compressed`;
		const child = child_process.exec(curl, function(err, stdout, stderr) {
			if (!stdout) {
				return resolve(-100)
			}
			var $ = cheerio.load(stdout);
			var orderStatusStr = $('.details-status').text();
			var telStr = $('.tel').text();
			var areaStr = $('.area').text();
			var faceStr = $('.face').text();
			var paytypeStr = $('.paytype-r').text();
			var priceStr = $('.amount-box .yen-int').text();
			var timeStr = $('.time-box').text();
			var data = {
				status: statusMap[orderStatusStr] === undefined ? -1 : statusMap[orderStatusStr],
				orderStatusStr,
				telStr,
				areaStr,
				faceStr,
				paytypeStr,
				priceStr,
				timeStr,
			}
			resolve(data);
		});
	});
}

// 同步cookie到服务器
async function syncCookie(phone, cookie) {
	try {
		const res = await axios.post(config.javaUrl.syncCookie, {
			isp: 5,
			phone,
			cookie
		}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept-Encoding': 'gzip'
			}
		});
		return res.data
	} catch (err) {
		throw err
	}
}

module.exports = {
  getPhone,
  getMessage,
  getMessageQueue,
  addBlacklist,
	getOrderStatus,
	syncCookie
}
