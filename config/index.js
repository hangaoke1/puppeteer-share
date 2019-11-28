const path = require('path')
module.exports = {
	// 隧道代理
	proxy: {
		enable: true, // 是否开启代理
		proxy_ip: 'tps168.kdlapi.com',
		proxy_port: 15818,
		mytid: 't17483157176021',
		password: 'vzmfrk1l',
		orderid: '907483157176094',
		apiKey: '66x3eixs1g9x8o87arn12uiwn7f724jz'
	},
	// 打码平台
	kuaimi: {
		url: 'http://api.caihyz.com/api/do.php',
		name: 'testGm',
		password: 'gmtest123',
		sid: 2214
	},
	// cookie同步地址
	javaUrl: {
		syncCookie: 'http://47.107.125.96:19918/save'
	},
	// 日志系统
	log4js: {
		pm2: true, // pm2启动服务时需要开启
		logDir: path.resolve(__dirname, '../logs/'), // 输出文件路径
		logFilePrefix: 'jd-node', // 输出文件前缀
		pattern: '' // 自定义模版字符串 https://log4js-node.github.io/log4js-node/layouts.html
	}
};
