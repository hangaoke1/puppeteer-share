const axios = require('axios');
const querystring = require('querystring');

const URL_MAP = {
	needCode: 'http://upay.10010.com/npfwap/NpfMob/needCode', // 检测是否需要验证码
	mobWapPayFeeCheck:
		'http://upay.10010.com/npfwap/NpfMob/mobWapBankPay/mobWapPayFeeCheck.action', // 预充值
	mobWapPayFeeApply:
		'http://upay.10010.com/npfwap/NpfMob/mobWapBankPay/mobWapPayFeeApply.action' // 充值
};

/**
 * 通过ticket获取授权后token
 * @param {string} ticket 腾讯防水验证码校验值
 */
async function genTokenWithTicket(ticket) {
	try {
		const res = await axios.post(
			URL_MAP.mobWapPayFeeCheck,
			querystring.stringify({
				ticketNew: ticket,
				'commonBean.phoneNo': '13107737893',
				'commonBean.payAmount': '2.00',
				'commonBean.channelCode': 'alipaywap',
				'commonBean.orgCode': '03',
				'commonBean.bussineType': '01',
				'commonBean.channelType': '307',
				'commonBean.reserved1': 'false'
			}),
			{
				headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'http://upay.10010.com/npfwap/npfMobWap/bankcharge/',
          'Host': 'upay.10010.com',
					'User-Agent':
						'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
				}
			}
		);
		console.log('res', res);
	} catch (error) {
    console.log(error)
	}
}

genTokenWithTicket(
	'yAuJqk9LCCRMRHe_5a54HQ2hnoUwqYzXC2so69HkcO3xlDhWmZRUTZQF6jeL_NtQMYVfkrSjJMc*'
);
