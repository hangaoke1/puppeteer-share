let cookies = '';

const path = require('path');
const puppeteer = require('puppeteer');

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
  await  page.setViewport({
    width: 375,
    height: 667
  })
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
  await page.goto(
		'https://newcz.m.jd.com/'
  );
  let cookieList = [
    {
      name: 'TrackerID',
      value: 'fEyHZoxWkcKYp7Wh0qMExiMAEZIXbf7D9ZnLB_3SNSRbx3mpcGyw9Yiucsvj0XfDJUDC1tN8Jel33exJgBxUuimpVFvrtzGQ6Z_AEca9hYr4p7NGQlRlUX5OD__3wEb8lHodY5iQr-HyC3Yv0CgaLw',
      domain: '.jd.com'
    },
    {
      name: 'pt_token',
      value: 'llh4dj6k',
      domain: '.jd.com'
    },
    {
      name: 'pt_key',
      value: 'AAJdyBiDADDc_aBHFOhlfYIwCRbv5N1kHRWQBhHjKx0jmgVs1voPDFb7e2zeXrpD-HziT53UaY4',
      domain: '.jd.com'
    },
    {
      name: 'pwdt_id',
      value: '1689700009-229544',
      domain: '.jd.com'
    },
    {
      name: 'pt_pin',
      value: '1689700009-229544',
      domain: '.jd.com'
    }
  ]
  await page.setCookie(...cookieList)
  await page.reload()
})();
