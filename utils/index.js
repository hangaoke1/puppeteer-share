const request = require('request');

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

// 请求服务
exports.fetch = function(options) {
	return new Promise((resolve, reject) => {
		options.resolveWithFullResponse = true;
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
