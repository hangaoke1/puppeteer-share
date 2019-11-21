process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const child_process = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 0;

const statusMap = {
	'等待付款': 0,
	'正在充值': 1,
	'充值成功': 2,
	'订单取消': 3
}
async function getOrderStatus(orderId, cookies) {
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

/**
 * 根据cookie获取csrfToken
 * @param {string} cookies
 */
async function genCsrfToken(cookies) {
	const res = await axios.get('https://newcz.m.jd.com/', {
		headers: {
			Cookie: cookies
		}
	});
	let setCookieList = res.headers['set-cookie'];
	let csrfToken = '';
	for (let i = 0; i < setCookieList.length; i++) {
		if (
			setCookieList[i].indexOf('m.jd.com') > -1 &&
			setCookieList[i].indexOf('csrfToken') > -1
		) {
			csrfToken = setCookieList[i].split('; ')[0].split('=')[1];
			break;
		}
	}
	return csrfToken;
}

// 获取sku列表
function genSkuList(mobile, cookies) {
	mobile = String(mobile);
	const mobileStr =
		mobile.slice(0, 3) + '+' + mobile.slice(3, 7) + '+' + mobile.slice(7, 11);
	return new Promise(resolve => {
		const curl = `curl 'https://newcz.m.jd.com/newcz/product.json' -H 'Connection: keep-alive' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Origin: https://newcz.m.jd.com' -H 'X-Requested-With: XMLHttpRequest' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Referer: https://newcz.m.jd.com/' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookies}' --data 'mobile=${mobileStr}' --compressed`;
		const child = child_process.exec(curl, function(err, stdout, stderr) {
			resolve(_.get(JSON.parse(stdout), 'skuPrice.skuList', []));
		});
	});
}

// 获取订单参数
function genPayRes(params) {
	return new Promise(resolve => {
		var { cookies, csrfToken, mobile, skuId, sku } = params;
		var newSkuId = sku.skuId;
		var orderPrice = sku.jdPrice;
		var onlinePay = sku.jdPrice / 100;
		var origin = '';
		var cookieStr = cookies;
		var curl = `curl 'https://newcz.m.jd.com/newcz/submitOrder.action?mobile=${mobile}&newSkuId=${newSkuId}&orderPrice=${orderPrice}&onlinePay=${onlinePay}&skuId=${skuId}&origin=&csrfToken=${csrfToken}&loginStatus=true' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://newcz.m.jd.com/' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookieStr}' --compressed`;
		const child = child_process.exec(curl, function(err, stdout, stderr) {
			if (!stdout) {
				return resolve(-100)
			}
			if (stdout.indexOf('运营商系统升级') > -1) {
				return resolve(-200)
			}
			var $ = cheerio.load(stdout);
			var orderId = $('#orderId').val();
			var onlinePay = $('#onlinePay').val();
			var origin = $('#origin').val();
			var mobile = $('#mobile').val();
			var facePrice = $('#facePrice').val();
			var orderType = $('#orderType').val();
			resolve({
				orderId,
				onlinePay,
				origin,
				mobile,
				facePrice,
				orderType
			});
		});
	});
}

// 获取支付id
async function genPayId(params, cookies) {
	const { orderId, onlinePay, mobile } = params;
	return new Promise(resolve => {
		const curl = `curl -i 'https://newcz.m.jd.com/newcz/goPay.action?orderId=${orderId}&onlinePay=${onlinePay}&origin=&mobile=${mobile}' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://newcz.m.jd.com/newcz/submitOrder.action?mobile=15557007893&newSkuId=1007347885&orderPrice=1998&onlinePay=19.98&skuId=20&origin=&csrfToken=17f692eb9e8b450e88d03ffc3a1960d9&loginStatus=true' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookies}' --compressed`;
		child_process.exec(curl, function(err, stdout, stderr) {
			const index = stdout.indexOf('payId=');
			resolve(stdout.slice(index, index + 38).split('=')[1]);
		});
	});
}

// 微信预下单
async function genWxPre(payId, cookies) {
	return new Promise(resolve => {
		const curl = `curl 'https://pay.m.jd.com/newpay/index.action' -H 'Connection: keep-alive' -H 'Accept: */*' -H 'Origin: https://pay.m.jd.com' -H 'X-Requested-With: XMLHttpRequest' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Referer: https://pay.m.jd.com/cpay/pay-index.html?appId=jd_m_chongzhi&payId=${payId}' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookies}' --data 'lastPage=&appId=jd_m_chongzhi&payId=${payId}&_format_=JSON' --compressed`;
		const child = child_process.exec(curl, function(err, stdout, stderr) {
			resolve(stdout);
		});
	});
}

// 获取微信支付链接
async function genWxLink(payId, cookies) {
	return new Promise(resolve => {
		const curl = `curl 'https://pay.m.jd.com/index.action?functionId=wapWeiXinPay&body=%7B%22payId%22%3A%22${payId}%22%2C%22appId%22%3A%22jd_m_chongzhi%22%7D&appId=jd_m_chongzhi&payId=${payId}&_format_=JSON' -H 'Connection: keep-alive' -H 'Accept: */*' -H 'X-Requested-With: XMLHttpRequest' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Referer: https://pay.m.jd.com/cpay/pay-index.html?appId=jd_m_chongzhi&payId=${payId}' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ${cookies}' --compressed`;

		const child = child_process.exec(curl, function(err, stdout, stderr) {
			resolve(JSON.parse(stdout));
		});
	});
}

/**
 * 获取支付链接
 * @param {string} cookies
 */
async function getWxPayUrl(cookies, mobile, price) {
	const skuId = price;
	const csrfToken = await genCsrfToken(cookies);
  const newCookies = cookies + 'csrfToken=' + csrfToken;
  
  // 获取sku
  const skuList = await genSkuList(mobile, newCookies);
	const sku = _.find(skuList, function(o) {
		return o.facePrice == price;
  });
  if (!sku) {
    throw new Error(`ERROR: 查找sku失败, mobile: ${mobile} money: ${price}`)
  }

	const payRes = await genPayRes({
		cookies: newCookies,
		csrfToken,
		mobile,
		skuId,
		sku
	});
	if (payRes === -100) {
		throw new Error('cookie已失效')
	}
	if (payRes === -200) {
		throw new Error('运营商系统升级')
	}

  const payId = await genPayId(payRes, newCookies);
  if (!payId) {
    throw new Error(`ERROR: 生成payId失败, mobile: ${mobile} money: ${price}`)
  }

	await genWxPre(payId, newCookies);
	const result = await genWxLink(payId, newCookies);
	return {
		url: result.deepLink,
		payId,
		jdPrePayId: result.jdPrePayId,
		orderId: payRes.orderId,
		jdPrice: sku.jdPrice / 100,
		facePrice: Number(sku.facePrice),
		searchUrl: 'https://pay.m.jd.com/index.action',
		searchData: {
			functionId: 'wapWeiXinPayQueryForMobile',
			body: { payId: result.jdPrePayId, payEnum: '407', time: '1' },
			_format_: 'JSON'
		}
	};
}

module.exports = { getWxPayUrl, getOrderStatus };
