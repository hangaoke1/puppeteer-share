/**
 * 联通获取图片验证码缺口位置
 */

const resemble = require('node-resemble-js');
const pixels = require('image-pixels');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadFile(url, filepath, name) {
  if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath);
  }
  const mypath = path.resolve(filepath, name);
  const writer = fs.createWriteStream(mypath);
  const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
  });
}

async function getDiff(fullUrl, notFullUrl) {
	await downloadFile(fullUrl, '../image', 'full.jpeg');
	await downloadFile(notFullUrl,'../image', 'notFull.jpeg');
	resemble('../image/full.jpeg')
		.compareTo('../image/notFull.jpeg')
		.ignoreColors()
		.onComplete(async res => {
			fs.writeFileSync('../image/diff.jpg', res.getDiffImageAsJPEG());
		});

	const { data } = await pixels(path.resolve(__dirname, '../image','diff.jpg'), {
		cache: false
	});

	// console.log(data)
	// 获取缺口距离左边的做小位置，即计为需要滑动的距离
	let arr = [];
	for (let i = 10; i < 390; i++) {
		for (let j = 80; j < 680; j++) {
			var p = 680 * i + j;
			p = p << 2;
			// RGB
			if (data[p] === 255 && data[p + 1] === 0 && data[p + 2] === 255) {
				arr.push(j);
				break;
			}
		}
	}
	console.log(Math.min(...arr));
	return Math.min(...arr)
}

module.exports = getDiff
