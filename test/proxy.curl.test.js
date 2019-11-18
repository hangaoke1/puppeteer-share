const child_process = require('child_process');
const getProxyIp = 'http://route.xiongmaodaili.com/xiongmao-web/selfControl/getIP?secret=e4af36aed444da8b0918326b680b6acb&code=0&orderNo=ZK20191117223222ZpM6q4gD&type=0'

let proxy = '180.164.96.62:49678';
let curl = `curl 'http://2000019.ip138.com/' -x ${proxy} -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ASPSESSIONIDAQCDTSBS=JLJKEGPADIFJDFFKFHKLDEKI' --compressed --insecure`

const child = child_process.exec(curl, function(err, stdout, stderr) {
  console.log(stdout)
});
