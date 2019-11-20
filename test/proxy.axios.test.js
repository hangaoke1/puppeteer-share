// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const HttpAgent = require('agentkeepalive')
const HttpsAgent = require('agentkeepalive').HttpsAgent

// 要访问的目标地址
let page_url = 'http://2000019.ip138.com/'

// 隧道id和密码, 若已添加白名单则不需要添加
const mytid = 't17421839588994';
const password = 'ngkc3b1q';

// 隧道代理服务器host/ip和端口
let proxy_ip = 'tps136.kdlapi.com';
let proxy_port = 15818;

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
    host: proxy_ip,
    port: proxy_port,
    auth: {
      username: mytid,
      password: password
    }
  }
}

axios.get(page_url, options).then(res => {
  console.log(res.data)
});