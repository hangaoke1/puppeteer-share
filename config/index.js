const path = require('path')
module.exports = {
	log4js: {
		pm2: true, // pm2启动服务时需要开启
		logDir: path.resolve(__dirname, '../logs/'), // 输出文件路径
		logFilePrefix: 'jd-node', // 输出文件前缀
		pattern: '' // 自定义模版字符串 https://log4js-node.github.io/log4js-node/layouts.html
	}
};
