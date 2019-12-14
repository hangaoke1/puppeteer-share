const request = require('request');
const child_process = require('child_process');

exports.filterJDCookie  = function (cookie) {
  cookie = cookie.replace(/\s/g, '')
  const whiteList = ['TrackerID', 'pt_key', 'pt_pin', 'pt_token', 'pwdt_id']
  return cookie.split(';').filter(item => {
    for (let i = 0; i < whiteList.length; i++) {
      if (item.indexOf(whiteList[i]) > -1) {
        return true
      }
    }
    return false
  }).join(';').trim()
}

// 请求服务 request promise版本
exports.fetch = function(options) {
	return new Promise((resolve, reject) => {
		options.resolveWithFullResponse = true;
		options.strictSSL = false
		options.followRedirect = false
		options.maxRedirects = 0
		request(options, (error, response, body) => {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				response.body = body;
				resolve(response);
			}
		});
	});
}

// 请求服务 curl promise版本
exports.curl = function(curl) {
	return new Promise((resolve, reject) => {
		child_process.exec(curl, function(err, stdout, stderr) {
			if (err) {
				reject(err)
			} else {
				resolve(stdout)
			}
		});
	})
}

exports.safeParse = function(str) {
	try {
		return JSON.parse(str)
	} catch (error) {
		console.log(error)
		return null
	}
}

exports.safeStringify = function(obj) {
	try {
		return JSON.stringify(obj)
	} catch (error) {
		console.log(error)
		return ''
	}
}

exports.getCookie = function (cookie, name) {
	let cookieMap = {}
	cookie.split(';').forEach(item => {
		const key = item.split('=')[0]
		const val = item.split('=')[1]
		cookieMap[key] = val
	})
	return cookieMap[name]
}
