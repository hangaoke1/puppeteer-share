const child_process = require('child_process');

// 要访问的目标地址
let page_url = 'http://2000019.ip138.com/'

// 隧道id和密码, 若已添加白名单则不需要添加
const mytid = 't17421839588994';
const password = 'ngkc3b1q';

// 隧道代理服务器host/ip和端口
let proxy_ip = 'tps136.kdlapi.com';
let proxy_port = 15818;

let proxy = `http://${mytid}:${password}@${proxy_ip}:${proxy_port}`;

let curl = `curl '${page_url}' -x ${proxy} -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' -H 'Cookie: ASPSESSIONIDAQCDTSBS=JLJKEGPADIFJDFFKFHKLDEKI' --compressed --insecure`

const child = child_process.exec(curl, function(err, stdout, stderr) {
  console.log(stdout)
});
