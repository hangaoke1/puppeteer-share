const html = `<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.0//EN" "http://www.wapforum.org/DTD/xhtml-mobile10.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml">
        <head>
    <meta charset="utf-8">
        <meta name="author" content="m.jd.com">
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <Meta http-equiv="Expires" Content="Wed, 26 Feb 1997 09:21:57 GMT">
        <meta http-equiv="Last-Modified" content="Wed, 26 Feb 1997 09:21:57 GMT">
        <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate,max-age=0,post-check=0, pre-check=0,false">
    <meta name="x5-fullscreen" content="true" />
    <meta http-equiv="Pragma"  CONTENT="no-cache">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <title>充值</title>
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <link href="/js/jquery.toast/jquery.toast.min.css" rel="stylesheet" type="text/css" />
        <link href="/css/animate.css" rel="stylesheet" type="text/css" />

    <script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
        <script type="text/javascript" src="/js/jquery.tap.min.js"></script>

        <script type="text/javascript" src="/js/jquery.toast/jquery.toast.min.js"></script>
    <script type="text/javascript" src="/js/min_js/common.js?v=20151229"></script>
</head> <body>
        <div id="m_common_header"></div>
<link type="text/css" rel="stylesheet" href="/skin/main.css">
<script type="text/javascript" src="/js/newcz.js"></script>
<script type="text/javascript" src="/js/full_js/common.js"></script>
<div class="details-section">
    <div class="details-info">
        <div class="details-info-hd">
            <span class="order-num">订单号：<em class="num">106976582491</em></span>
            <span class="details-status">充值成功</span>
        </div>
        <div class="details-info-fd">
                            <span class="tel">手机号码：155****7893</span>
                                        <span class="area">归属地区：浙江联通</span>
                                        <span class="face">充值面值：20元</span>
            
        </div>
    </div>
    <div class="details-payment">
        <div class="details-payment-bd">
            <span class="paytype-l">支付方式</span>
            <span class="paytype-r">在线支付</span>
        </div>
    </div>
    <div class="details-total">
        <div class="details-total-hd">
            <div class="all-box">
                <span class="all-box-l">商品总额</span>
                <span class="all-box-r"><em class="yen">&yen;</em><em class="yen-int">19.98</em></span>
            </div>
                                </div>
        <div class="details-total-fd">
            <span class="amount-box">实付款：<em class="yen">&yen;</em><em class="yen-int">19.98</em></span>
            <span class="time-box">下单时间: 2019-11-17 13:31:24</span>
        </div>
    </div>
</div>
<div class="details-footer">
    <div class="details-footer-inner">
        <a href="javascript:;" class="details-btn" onclick="orderControl(3,
         '106976582491', '1998');">  再次购买</a>
    </div>
</div>

<script>
    // 分-->元
    function  format(price) {
        var str = (price / 100).toFixed(2) + '';
        var intSum = str.substring(0, str.indexOf(".")).replace(/\B(?=(?:\d{3})+$)/g, ',');// 取到整数部分
        var dot = str.substring(str.length, str.indexOf("."))// 取到小数部分
        var ret = intSum + dot;
        return ret;
    }
</script>

        <div id="m_common_bottom"></div>
<script type="text/javascript" src="//wl.jd.com/unify.min.js"></script>
<script type="text/javascript" src="/js/full_js/bottom.js"></script>
<script type="text/javascript" src="//wq.360buyimg.com/js/common/dest/m.commonHeader.min.js"></script>
<script type="text/javascript" src="//st.360buyimg.com/common/commonH_B/js/m_common2.1.js" ></script>
<script type="text/javascript" src="//wq.360buyimg.com/js/common/dest/wq.imk.downloadAppPlugin.min.js"></script>
<script type="text/javascript">
$(function(){
    var mchb = new MCommonHeaderBottom();
        var headerArg = {hrederId : 'm_common_header',title: '充值' , sid : '', isShowShortCut : false, selectedShortCut : '4'};
    mchb.header(headerArg);
        
    });
</script>
 </body>
</html>`

const cheerio = require('cheerio')
const $ = cheerio.load(html);
console.log($('.details-status').text())