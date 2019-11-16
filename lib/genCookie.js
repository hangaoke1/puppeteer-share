const path = require('path');
const puppeteer = require('puppeteer');
const getDiff = require('./getCapPos');

function getTicket(msg) {
  const v = msg.text();
  if (v.indexOf('ticket:') > -1) {
    const ticket = v.split('ticket:')[1];
    console.log('获取票据: ', ticket)
  }
}

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		devtools: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-features=site-per-process'],               
		defaultViewport: null,
		executablePath: path.resolve(
			'../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
		)
  });
  
  const page = await browser.newPage();

  page.on('console', getTicket);
	await page.goto(
		'http://upay.10010.com/npfwap/npfMobWap/bankcharge/#/bankcharge'
  );
  await page.evaluate(() => {
    window.a = {
      callback: function(res) {
        console.log('ticket:', res.ticket)
      },
      themeColor: "FF8C00",
      type: "popup"
    };
    window.capInit(document.getElementById("TCaptcha"), a)
  }, '');

  // tcaptcha_iframe
  await page.waitForSelector('#tcaptcha_iframe');

  const frame = await page.frames().find(frame => {
    return frame.name() === 'tcaptcha_iframe'
  });

  console.log('iframe加载中')
  await frame.waitForSelector('#tcaptcha_drag_button');
  await page.waitFor(5000)
  console.log('iframe加载完毕')


  const frameEl = await page.$('#tcaptcha_iframe');
  const frameBox = await frameEl.boundingBox();

  const src = await frame.evaluate('document.querySelector(".tcaptcha-bg-img").src')
  const image_base = src.replace('https', 'http');
  const image1 = image_base.slice(0, image_base.length - 1) + 0
  const image2 = image_base
  console.log(image1, image2)
  const diff = await getDiff(image1, image2)
  const distance = diff / 680 * 437 - 50 // 真正需要滑动的距离
  console.log('缺口位置', distance)

  const slideBtn = {
    left: 47.1,
    top: 332.7,
    width: 86.4,
    height: 48
  }

  const axleX = Math.floor(frameBox.x + slideBtn.left + slideBtn.width / 2);
  const axleY = Math.floor(frameBox.y + slideBtn.top + slideBtn.height / 2);
  await page.mouse.move(axleX, axleY);
  await page.mouse.down();
  await page.waitFor(200);
  await page.mouse.move(axleX + distance / 4, axleY, { steps: 20 });
  await page.waitFor(200);
  await page.mouse.move(axleX + distance / 3, axleY, { steps: 18 });
  await page.waitFor(350);
  await page.mouse.move(axleX + distance / 2, axleY, { steps: 15 });
  await page.waitFor(400);
  await page.mouse.move(axleX + (distance / 3) * 2, axleY, { steps: 15 });
  await page.waitFor(350);
  await page.mouse.move(axleX + (distance / 4) * 3, axleY, { steps: 10 });
  await page.waitFor(350);
  await page.mouse.move(axleX + distance, axleY, { steps: 10 });
  await page.waitFor(300);
  await page.mouse.up();

  // await page.mouse.move(axleX, axleY);
  // await page.mouse.down();
  // await page.mouse.move(axleX + 100, axleY, { steps: 1 });
  // await page.waitFor(200);
  // await page.mouse.move(axleX + distance - 50, axleY, { steps: 1 });
  // await page.waitFor(300);
  // await page.mouse.move(axleX + distance, axleY, { steps: 2 });
  // await page.waitFor(300);
  // await page.mouse.up();
})();
