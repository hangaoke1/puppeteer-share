/**
 * 获取苏宁支付链接
 */
const _ = require('lodash');
const qs = require('qs');
const SuAES = require('./aes');
const { fetch, curl, safeParse, safeStringify, getCookie } = require('../utils');
const apiUrl = {
  getAddress: 'https://shopping.suning.com/app/address/private/queryContacts.do?opType=1&_x_resp_flag_=2',
  getNewBuyUrl: 'https://pintrade.suning.com/pgs/cart/gateway/singleNowBuy.do',
  getGoodsHtmlUrl: 'https://pin.suning.com/pgs/product',
  getGoodsDetailUrl: 'https://pin.suning.com/pgs/cart/gateway/showCart.do?_ignore=true',
  recCouponInfo: 'https://pin.suning.com/pgs/cart/private/recCouponInfo.do',
  getPayUrl: 'https://pin.suning.com/pgs/order/private/indSubmitOrder.do'
}

/**
 * detect 在浏览器商品页面输入bd.rst()
 * goodsId 商品订单号
 * cookie 浏览器cookie里寻找对应的值
 */
const detect = '';
genSuningOrder({
  goodsId: '51065428568699207610',
  cookie: 'authId=si40714B9A85ACC321F27A6A31FCE9AFF4;_snzwt=THrlUc16f08d2637albDB8b0b;_device_session_id=p_1576402270267_90066652567209890',
  amount: 1
})

/**
 * 获取支付链接及订单号
 * @param {string} goodsId 商品id
 * @param {number} amount 数量
 * @param {string} cookie cookie
 */
async function genSuningOrder ({goodsId, amount, cookie} = {}) {
  try {
    // 1. 获取收货地址
    const address = await getAddress(cookie)
    // 2. 商品加入购物车
    await addToCart({
      goodsId,
      amount,
      cookie,
      address,
    })
    // 3.获取商品详情
    // const goodsRes = await getGoodsDetail(cookie)
    // 4. 数量确认
    await recCouponInfo({ cookie, amount, goodsId, address})
    // 5. 获取支付链接
    const payRes = await getPayUrl({ cookie, amount, address})
  } catch (error) {
    console.log(error)
  }
}

async function getAddress (cookie) {
  try {
    const headers = {
      'cookie': cookie
    }
    const config = { url: apiUrl.getAddress, method: 'get', headers };
    const response = await fetch(config)
    const res = safeParse(SuAES.decrypt(safeParse(response.body).security_data))
    const address = _.get(res, 'data[0]')
    if (address) {
      console.log('>>>✅ 获取地址成功\n', address)
      return address
    } else {
      return Promise.reject('>>>❌ 该用户无收货地址')
    }
  } catch(error) {
    console.log('>>>❌ 获取收获地址失败')
    return Promise.reject(error)
  }

}
// getAddress('authId=si34C98013FBF5F2DCB954DD3801918547').then(address => {
//   console.log('>>>✅ 收货地址\n', address)
// })

/**
 * 商品加入购物车
 */
async function addToCart ({
  goodsId,
  amount = 1,
  cookie,
  address,
} = {}) {
  try {
    const goodUrl = `${apiUrl.getGoodsHtmlUrl}/${goodsId}.html`
    console.log('>>>✅ 商品页面:', goodUrl)
    const itemCode = await getItemCode(goodUrl)
    console.log('>>>✅ 商品code', itemCode)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'cookie': cookie
    }
    console.log('>>>✅ 下单cookie\n', headers.cookie)
    const params = {
      actId: goodsId,
      cityCode: _.get(address, 'cityCode', '025'),
      version: 2,
      amount: amount,
      deviceToken: getCookie(cookie, '_device_session_id'),
      dfpToken: getCookie(cookie, '_snzwt'),
      referenceUrl: `https%3A%2F%2Fpin.suning.com%2Fpgs%2Fproduct%2F${goodsId}.html`,
      // itemCode: '000000011616375254'
      itemCode
    }
    console.log('>>>✅ 下单参数\n', params)
    const res = await fetch({
      url: apiUrl.getNewBuyUrl +  '?_=' + Date.now(),
      method: 'POST',
      headers,
      body: qs.stringify(params)
    })
    console.log('>>>✅ 下单结果', res.body)
  } catch (error) {
    console.log(error)
  }
}
// addToCart({
//   goodsId: '51177074232647362448',
//   cookie: 'authId=si0ED1B2330A21C7E9EF3D06F4A27477B2;_snzwt=THfL2z16f024f4b84M2KLea0d;_device_session_id=p_1576300566041_29497667091326816',
//   address: {}
// })

async function getItemCode (url) {
  try {
    const reg = /itemCode: "(\d{18})"/
    const res = await fetch({url, method: 'get'});
    const matches = res.body.match(reg);
    return matches[1]
  } catch (error) {
    console.log('>>>❌ 获取itemCode失败')
    throw error
  } 
}
// getItemId('https://pin.suning.com/pgs/product/51177074232647362448.html')

async function getGoodsDetail (cookie) {
  try {
    const goodsDetail = await fetch({
      url: apiUrl.getGoodsDetailUrl,
      method: 'GET',
      headers: {
        cookie
      }
    })
    console.log('>>>✅ 获取商品详情\n', goodsDetail.body)
    return safeParse(goodsDetail.body)
  } catch (error) {
    console.log('>>>❌ 获取商品详情失败\n', goodsDetail.body)
    throw error
  }
}
// getGoodsDetail('authId=siCC85CE0AEF56A55C600EC2CDE223A58E;_snzwt=THfL2z16f024f4b84M2KLea0d;_device_session_id=p_1576300566041_29497667091326816')

async function recCouponInfo ({
  cookie = '', amount = 1, goodsId = '', address = ''
} = {}) {
  try {
    const headers = {
      cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const params = {
      actId: goodsId,
      amount: amount,
      cityId: address.cityCode,
      version: 1,
      couponNumber: '',
      cardNumbers: '',
      useCouponFlag: '',
      area: address.townCode,
      useCashFlag: 1,
      usedTotalPointAmt: 0
    };
    const config = { url: apiUrl.recCouponInfo, method: 'post', headers, body: qs.stringify(params) };
    const response = await fetch(config)
    console.log('>>>✅ 数量及优惠信息确认\n', response.body)
  } catch (error) {
    console.log('>>>❌ 数量及优惠信息确认失败\n')
    throw error
  }
}

async function getPayUrl ({
  cookie, address, amount = 1
} = {}) {
  try {
    let curlData = {
      address: address.detailAddress,
      addressNo: address.addressID,
      amount: amount,
      cityCode: address.cityCode,
      cityId: address.cityCode,
      consignee: address.receiverName,
      customerMsg: "",
      deliveryAddrMain: `${address.provinceName+address.cityName+address.districtName+address.townName}|${address.detailAddress}`,
      deliveryArea: address.deliveryRegionCode,
      districtId: address.districtCode.substr(address.cityCode.length),
      invoiceTitle: address.receiverName,
      invoiceType: 1,
      orderPayType: "08",
      phonenum: address.receiverMobile,
      provinceId: address.provinceCode,
      provinceName: address.provinceName,
      terminalVersion: "WAP|06",
      townId: "99",
      version: 5,
      zipCode: ""
    }
    const data = {
      provinceName: encodeURIComponent(address.provinceName),
      cityName: encodeURIComponent(address.cityName),
      districtName: encodeURIComponent(address.districtName),
      townName: encodeURIComponent(address.townName),
      detailedAddress: encodeURIComponent(address.detailAddress),
      couponNos: '',
      cardNumbers: '',
      deviceToken: getCookie(cookie, '_device_session_id'),
      dfpToken: getCookie(cookie, '_snzwt'),
      detect,
      referenceUrl: encodeURIComponent('https://mvs.suning.com/project/JoinGo/cart.html#!main'),
      challengeChannel: 'WAP',
      useCashFlag: 1,
      usedTotalPointAmt: 0,
      source: 0,
    }
    let subData = ''
    Object.keys(data).forEach(key => {
      subData += `&${key}=${data[key]}`
    })
    const curlUrl = `curl 'https://pin.suning.com/pgs/order/private/indSubmitOrder.do' -H 'Accept: application/json, text/plain, */*' -H 'Referer: https://mvs.suning.com/project/JoinGo/cart.html' -H 'Origin: https://mvs.suning.com' -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Cookie: ${cookie}' --data $'data=${encodeURIComponent(safeStringify(curlData))}${subData}' --compressed`
    console.log('>>>✅ curl链接\n', curlUrl)
    const response = await curl(curlUrl)
    console.log('>>>✅ 获取支付链接', response)
  } catch (error) {
    console.log('>>>❌ 获取支付链接失败')
    throw error
  }
}