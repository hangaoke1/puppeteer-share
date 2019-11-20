process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const HttpAgent = require('agentkeepalive')
const HttpsAgent = require('agentkeepalive').HttpsAgent
const getProxyIp = 'http://route.xiongmaodaili.com/xiongmao-web/selfControl/getIP?secret=e4af36aed444da8b0918326b680b6acb&code=0&orderNo=ZK20191117223222ZpM6q4gD&type=0'

let proxyIp = '124.113.193.186'
let proxyPort = '41823'

// 5分钟轮换一次ip
// setInterval(() => {
//   axios.get(getProxyIp).then(res => {
//     let data = res.data;
//     if (data.code === '0') {
//       proxyIp = data.obj.ip
//       proxyPort = data.obj.port
//     }
//   })
// }, 5 * 60 * 1000)

const httpAgent = new HttpAgent({
  timeout: 60000,
  freeSocketTimeout: 30000
})
const httpsAgent = new HttpsAgent({
  timeout: 60000,
  freeSocketTimeout: 30000
})

var options = {
  headers: {},
  httpAgent,
  httpsAgent,
  proxy: {
    host: proxyIp,
    port: proxyPort
  }
}

axios.get('http://2000019.ip138.com/', options).then(res => {
  console.log(res.data)
});
