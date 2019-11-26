const path = require('path')
module.exports = {
	kuaimi: {
		url: 'http://api.caihyz.com/api/do.php',
		name: 'testGm',
		password: 'gmtest123',
		sid: 2214
	},
	javaUrl: {
		syncCookie: 'http://47.107.125.96:19918/save'
	},
	log4js: {
		pm2: true, // pm2启动服务时需要开启
		logDir: path.resolve(__dirname, '../logs/'), // 输出文件路径
		logFilePrefix: 'jd-node', // 输出文件前缀
		pattern: '' // 自定义模版字符串 https://log4js-node.github.io/log4js-node/layouts.html
	}
};
