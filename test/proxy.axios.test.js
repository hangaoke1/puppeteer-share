process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const axios = require('axios');
const HttpAgent = require('agentkeepalive')
const HttpsAgent = require('agentkeepalive').HttpsAgent

const httpAgent = new HttpAgent({
  timeout: 60000,
  freeSocketKeepAliveTimeout: 30000
})
const httpsAgent = new HttpsAgent({
  timeout: 60000,
  freeSocketKeepAliveTimeout: 30000
})

var options = {
  headers: {},
  httpAgent,
  httpsAgent,
  proxy: {
    host: '180.164.96.62',
    port: 49678
  }
}

axios.get('http://2000019.ip138.com/', options).then(res => {
  console.log(res.data)
});
