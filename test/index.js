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
        <div id="m_common_header"></div><script type="text/javascript" src="https://res.wx.qq.com/open/js/jweixin-1.3.2.js"></script>
<script src="/js/full_js/common.js"></script>
<style>
    <!--
    .quickmc {
        margin: 30px 0 0;
        text-align: center;
        color: #3c3c3c;
    }
    -->
</style>
<input type="hidden" id="orderId" value="106767188735" />
<input type="hidden" id="onlinePay" value="19.98" />
<input type="hidden" id="origin" value="" />
<input type="hidden" id="mobile" value="15557007893" />
<input type="hidden" id="facePrice" value="20" />
<input type="hidden" id="orderType" value="37" />
<div class="quickmc">
    <img src="/images/common/t_confirm_n.png">
    <div style="color: #67738a; font-weight: bold; padding: 5px 0 5px 5px;">
        正在跳转收银台。。。
    </div>
    <br>
</div>
<script type="text/javascript" >
    $(function (){
        var orderId = $("#orderId").val();
        var onlinePay = $("#onlinePay").val();
        var origin = $("#origin").val();
        var mobile = $("#mobile").val();
        var facePrice = $("#facePrice").val();
        var orderType = $("#orderType").val();
        var url = "";
        if(onlinePay == null || onlinePay == "" || onlinePay == "0" || onlinePay == "0.00") {
            url = "/newcz/detail.action?orderId="+orderId;

        }else {
            url = "/newcz/goPay.action?orderId=" +orderId +"&onlinePay="+onlinePay +"&origin="
            +origin +"&mobile=" +mobile;
        }
        newczMPing(orderId,onlinePay);
        if(origin == "jdds"){
            url="/pages/phoneReCharge/phoneReCharge?orderId="+orderId+"&amount="+onlinePay+"&phoneNumber="+mobile
            +"&facePrice="+facePrice+"&orderType="+orderType;
            wx.miniProgram.redirectTo({url: url})
        }else{
            setTimeout(function() {
                window.location.replace(url);
                // window.location.href = url;
            }, 300);
            // 如果是内嵌并弹出的webview支付，则下面代码会继续执行，返回商品详情页面
            setTimeout(function() {
                window.history.go(-2);
            }, 5000);
        }
        
    })

    function newczMPing(orderId,onlinePay){
        try {
            var orderId = orderId;                      //必选参数，订单号
            var totalPrice = onlinePay;                     //可选参数，优惠后订单总金额
            var mping = new MPing();
            var ord = new MPing.inputs.Order("s_virtual_charge");
            ord.sale_ord_id = orderId;
            ord.order_total_fee = totalPrice;
            mping.send(ord);                    //上报订单

        } catch (e) {
        }
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
console.log($("#orderId").val())