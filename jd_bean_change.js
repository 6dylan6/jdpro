/*
cron "28 8,21 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2.

const $ = new Env('京东资产统计');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const dyx = require('./function/dylanx.js');
let NowHour = new Date().getHours();

//默认开启缓存模式
let checkbeanDetailMode = 1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE) {
    checkbeanDetailMode = process.env.BEANCHANGE_BEANDETAILMODE * 1;
}

const fs = require('fs');
const CR = require('crypto-js');
const moment = require("moment");
let matchtitle = "昨日";
let yesterday = "";
let TodayDate = "";
let startDate = "";
let endDate = "";
try {
    yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    TodayDate = moment().format("YYYY-MM-DD");
    startDate = moment().startOf("month").format("YYYY_MM");
    endDate = moment().endOf("month").format("YYYY-MM-DD");
} catch (e) {
    console.log("依赖缺失，请先安装依赖moment!");
    return
}

if (!fs.existsSync("./BeanCache")) {
    fs.mkdirSync("./BeanCache");
}

let strBeanCache = "./BeanCache/" + yesterday + ".json";
let strNewBeanCache = "./BeanCache/" + TodayDate + ".json";
let TodayCache = [];
let Fileexists = fs.existsSync(strBeanCache);
let TempBeanCache = [];
if (!Fileexists) {
    yesterday = TodayDate;
    strBeanCache = strNewBeanCache;
    Fileexists = fs.existsSync(strBeanCache);
    matchtitle = "今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + yesterday + ".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + TodayDate + ".json，载入...");
    TodayCache = fs.readFileSync(strNewBeanCache, 'utf-8');
    if (TodayCache) {
        TodayCache = TodayCache.toString();
        TodayCache = JSON.parse(TodayCache);
    }
}


let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle = "";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify = "";
let strSubNotify = "";
let llPetError = false;
let strGuoqi = "";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【特价金币】特价版APP->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【话费积分】APP->充值中心-赚积分兑话费（180天效期）\n';
RemainMessage += '【礼品卡额】APP->我的->礼品卡（包含E卡，品牌类卡，超市卡）\n';
RemainMessage += '【超市卡】APP首页->京东超市->超市卡（超市商品可用）\n';
RemainMessage += '【老农场】APP->我的->东东农场->回旧版,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【新农场】APP->我的->东东农场,完成可在记录里查看奖品\n';
RemainMessage += '【奖票】APP->我的->玩一玩,可兑换京豆、红包等\n';
RemainMessage += '【汪贝余额】APP首页->京东超市->每日签到,可兑换\n';
RemainMessage += '【其他】不同类别红包不能叠加使用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror = false;
let time = new Date().getHours();
if ($.isNode()) {
    if (process.env.WP_APP_TOKEN_ONE) {
        WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
    }
}
//if(WP_APP_TOKEN_ONE)
//console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
//else
//console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);

let jdSignUrl = 'https://api.nolanstore.cc/sign'
if (process.env.SIGNURL)
    jdSignUrl = process.env.SIGNURL;

let epsignurl = ""
if (process.env.epsignurl)
    epsignurl = process.env.epsignurl;

if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
    intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
    console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
    MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
    MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
    MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {
    strSubNotify = process.env.BEANCHANGE_SUBNOTIFY;
    strSubNotify += "\n";
    console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {
    strAllNotify = process.env.BEANCHANGE_ALLNOTIFY;
    console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
    strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n" + strAllNotify;
    console.log(strAllNotify + "\n");
    strAllNotify += "\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
    llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;


if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
        console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex = -1;
if ($.isNode()) {
    strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//老农场
let EnableJdFruit = true;
DisableIndex = strDisableList.findIndex((item) => item === "老农场");
if (DisableIndex != -1) {
    console.log("检测到设定关闭老农场查询");
    EnableJdFruit = false;
}


//7天过期京豆
let EnableOverBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "过期京豆");
if (DisableIndex != -1) {
    console.log("检测到设定关闭过期京豆查询");
    EnableOverBean = false
}

//查优惠券
let EnableChaQuan = false;
DisableIndex = strDisableList.findIndex((item) => item === "查优惠券");
if (DisableIndex != -1) {
    console.log("检测到设定关闭优惠券查询");
    EnableChaQuan = false
}

DisableIndex = strDisableList.findIndex((item) => item === "活动攻略");
if (DisableIndex != -1) {
    console.log("检测到设定关闭活动攻略显示");
    RemainMessage = "";
}


//京豆收益查询
let EnableCheckBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "京豆收益");
if (DisableIndex != -1) {
    console.log("检测到设定关闭京豆收益查询");
    EnableCheckBean = false
}


const bdy_0x4d8a20=bdy_0x467d;(function(_0x90c948,_0x9403f5){const bdy_0x3399e2={_0x39ed90:'0x29c',_0x195615:'swYa',_0x1b057b:'0x316',_0x3a5f09:'KQAa',_0x82aad:'0x292',_0x292649:'$&Sv',_0xe3d324:'0x21b',_0x17ea3d:'&pHw',_0x3787b0:'0x2fe',_0x10b2eb:'E0p(',_0x1fb37d:'0x276',_0x5ef5d0:'%v^B',_0x3ba1df:'0x25e',_0x47ceb:'o3ro',_0x8f35a:'0x240',_0x58d227:'t*2b',_0x51e0fb:'0x288',_0x390246:'OQ@V',_0x358364:'0x205',_0x414837:'H2@y',_0x53f9f9:'0x299',_0x4db26c:'thG9'},_0x344b2b=bdy_0x467d,_0x3e3609=_0x90c948();while(!![]){try{const _0x71b8b6=parseInt(_0x344b2b(bdy_0x3399e2._0x39ed90,bdy_0x3399e2._0x195615))/(-0x561*-0x3+-0x1*0x135a+0x338)+parseInt(_0x344b2b(bdy_0x3399e2._0x1b057b,bdy_0x3399e2._0x3a5f09))/(-0x1*-0x1f67+-0x15e1+-0x984)*(-parseInt(_0x344b2b(bdy_0x3399e2._0x82aad,bdy_0x3399e2._0x292649))/(0x263b+0x157*-0xf+0x121f*-0x1))+parseInt(_0x344b2b(bdy_0x3399e2._0xe3d324,bdy_0x3399e2._0x17ea3d))/(0xb7d+0x1e9e+0x2a17*-0x1)+parseInt(_0x344b2b(bdy_0x3399e2._0x3787b0,bdy_0x3399e2._0x10b2eb))/(0x66f*0x1+0x640+0x655*-0x2)*(-parseInt(_0x344b2b(bdy_0x3399e2._0x1fb37d,bdy_0x3399e2._0x5ef5d0))/(-0x125*-0x1d+-0x1fa3*0x1+-0x188))+-parseInt(_0x344b2b(bdy_0x3399e2._0x3ba1df,bdy_0x3399e2._0x47ceb))/(0x1*0x1f01+0x9e0+0x6cf*-0x6)*(parseInt(_0x344b2b(bdy_0x3399e2._0x8f35a,bdy_0x3399e2._0x58d227))/(-0x1*-0x33d+0x22f1*0x1+0x1*-0x2626))+parseInt(_0x344b2b(bdy_0x3399e2._0x51e0fb,bdy_0x3399e2._0x390246))/(0x2097+0x6c3+0xb7*-0x37)+-parseInt(_0x344b2b(bdy_0x3399e2._0x358364,bdy_0x3399e2._0x414837))/(-0x743+0xba7*0x2+-0x1001)*(-parseInt(_0x344b2b(bdy_0x3399e2._0x53f9f9,bdy_0x3399e2._0x4db26c))/(0x592+-0xea4+0x91d));if(_0x71b8b6===_0x9403f5)break;else _0x3e3609['push'](_0x3e3609['shift']());}catch(_0x2d85ee){_0x3e3609['push'](_0x3e3609['shift']());}}}(bdy_0xb839,0x2cd66*0x5+0x1*-0xdcea7+-0xd*-0x10b63));function bdy_0x467d(_0xb796e6,_0x20adcf){const _0x483806=bdy_0xb839();return bdy_0x467d=function(_0x4cab42,_0x404e84){_0x4cab42=_0x4cab42-(0x1877+-0x1477+-0x22d);let _0x425064=_0x483806[_0x4cab42];if(bdy_0x467d['dQjBlH']===undefined){var _0x12dbcf=function(_0x368eeb){const _0x5c9588='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0xab6ebe='',_0x394820='',_0x4d238b=_0xab6ebe+_0x12dbcf;for(let _0x89ad8e=0x21a8+0x59d+-0x45d*0x9,_0x4d9c60,_0x3b4d5,_0x4cd79e=-0x187*-0x12+0x463+-0x1fe1;_0x3b4d5=_0x368eeb['charAt'](_0x4cd79e++);~_0x3b4d5&&(_0x4d9c60=_0x89ad8e%(0x250c+-0x17c5+-0xd43)?_0x4d9c60*(-0xc75*-0x3+0xb44+-0x3063)+_0x3b4d5:_0x3b4d5,_0x89ad8e++%(0x11*-0x25+-0x15ad+0x1826))?_0xab6ebe+=_0x4d238b['charCodeAt'](_0x4cd79e+(0x49a+0x1*0x437+-0x1*0x8c7))-(-0x2*0x67+-0x205b+-0x3*-0xb11)!==0x111f+0x19f9+-0x2b18?String['fromCharCode'](-0x108a*0x1+0xa7*-0x11+0x1ca0&_0x4d9c60>>(-(-0x1*-0x20bf+0x25ef+0x2356*-0x2)*_0x89ad8e&0x229d+-0x9e*0x10+0x18b7*-0x1)):_0x89ad8e:0xb1+0x16f9+-0x1*0x17aa){_0x3b4d5=_0x5c9588['indexOf'](_0x3b4d5);}for(let _0x230dff=-0x22*-0x115+0x1d4d+-0x4217,_0x1b80fa=_0xab6ebe['length'];_0x230dff<_0x1b80fa;_0x230dff++){_0x394820+='%'+('00'+_0xab6ebe['charCodeAt'](_0x230dff)['toString'](0x1*0x20b1+0x206d+-0x410e))['slice'](-(0xb*-0x13f+0x3*0x9e+0xbdd*0x1));}return decodeURIComponent(_0x394820);};const _0x3e37e2=function(_0x3c6fbb,_0xd550ba){let _0x317f3f=[],_0x351017=0x4e*-0x7c+0x3*0xa9b+0x5f7,_0x1604bb,_0x4c2abb='';_0x3c6fbb=_0x12dbcf(_0x3c6fbb);let _0x366cc4;for(_0x366cc4=-0x21*-0x2e+0x1*0x11cf+-0x17bd*0x1;_0x366cc4<0x234f+0x1*0x809+-0x2a58;_0x366cc4++){_0x317f3f[_0x366cc4]=_0x366cc4;}for(_0x366cc4=0x9ae+0x46d*-0x5+-0xc73*-0x1;_0x366cc4<-0xc8b*0x3+0x8*-0x36d+0x4209;_0x366cc4++){_0x351017=(_0x351017+_0x317f3f[_0x366cc4]+_0xd550ba['charCodeAt'](_0x366cc4%_0xd550ba['length']))%(-0x1a+0x1*0x822+-0x4b*0x18),_0x1604bb=_0x317f3f[_0x366cc4],_0x317f3f[_0x366cc4]=_0x317f3f[_0x351017],_0x317f3f[_0x351017]=_0x1604bb;}_0x366cc4=-0x96*-0x7+-0x1fdb+0x3f7*0x7,_0x351017=0x15c1+-0x24ef+0xf2e;for(let _0x3b5e14=-0xdc6+0x2186+-0x13c0;_0x3b5e14<_0x3c6fbb['length'];_0x3b5e14++){_0x366cc4=(_0x366cc4+(-0x1ed*-0x2+0x105d+-0x1436))%(0x1320+-0x209+-0x1*0x1017),_0x351017=(_0x351017+_0x317f3f[_0x366cc4])%(-0x58e+-0x1079*0x1+0x1707),_0x1604bb=_0x317f3f[_0x366cc4],_0x317f3f[_0x366cc4]=_0x317f3f[_0x351017],_0x317f3f[_0x351017]=_0x1604bb,_0x4c2abb+=String['fromCharCode'](_0x3c6fbb['charCodeAt'](_0x3b5e14)^_0x317f3f[(_0x317f3f[_0x366cc4]+_0x317f3f[_0x351017])%(0x30e+-0xe95+0x42d*0x3)]);}return _0x4c2abb;};bdy_0x467d['Hfurqi']=_0x3e37e2,_0xb796e6=arguments,bdy_0x467d['dQjBlH']=!![];}const _0x3f5b6f=_0x483806[-0x46e+-0x1*-0x1a7e+-0x1610],_0x1a4437=_0x4cab42+_0x3f5b6f,_0x3b6985=_0xb796e6[_0x1a4437];if(!_0x3b6985){if(bdy_0x467d['tOUahR']===undefined){const _0x1fdd45=function(_0x5255ee){this['GCzbLz']=_0x5255ee,this['crnLXy']=[-0x7f6*-0x1+-0x17f+-0x676,-0x18a*-0x3+-0x3*0xc43+0x66f*0x5,0x1bbf+0x1861+-0x3420],this['aplrof']=function(){return'newState';},this['sYxRRR']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['ItiCFs']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1fdd45['prototype']['DZfUQo']=function(){const _0x2e2e51=new RegExp(this['sYxRRR']+this['ItiCFs']),_0x399e33=_0x2e2e51['test'](this['aplrof']['toString']())?--this['crnLXy'][0xd64+-0x1fcf+-0x3*-0x624]:--this['crnLXy'][-0x186*-0x10+0x1*-0x1039+-0x827];return this['rroeXg'](_0x399e33);},_0x1fdd45['prototype']['rroeXg']=function(_0x12cdf4){if(!Boolean(~_0x12cdf4))return _0x12cdf4;return this['nSdYdr'](this['GCzbLz']);},_0x1fdd45['prototype']['nSdYdr']=function(_0x49cbca){for(let _0x1fc06b=-0x201f+-0xbcf+0x2bee,_0x3095a1=this['crnLXy']['length'];_0x1fc06b<_0x3095a1;_0x1fc06b++){this['crnLXy']['push'](Math['round'](Math['random']())),_0x3095a1=this['crnLXy']['length'];}return _0x49cbca(this['crnLXy'][-0x2644+-0x4*0x79a+-0x2256*-0x2]);},new _0x1fdd45(bdy_0x467d)['DZfUQo'](),bdy_0x467d['tOUahR']=!![];}_0x425064=bdy_0x467d['Hfurqi'](_0x425064,_0x404e84),_0xb796e6[_0x1a4437]=_0x425064;}else _0x425064=_0x3b6985;return _0x425064;},bdy_0x467d(_0xb796e6,_0x20adcf);}const bdy_0x2df17a=(function(){const bdy_0x1c82df={_0x4cf70b:'0x282',_0x178315:'p1@n',_0x363434:'0x2af',_0x279df8:'Jq#d',_0x2b00dc:'0x31c',_0x39f045:'E0p('},bdy_0x1960aa={_0x409390:'0x1f9',_0x1e7024:'E0p(',_0x5f536a:'0x291',_0x2d39fb:'Yx4G',_0x5e8080:'0x32f',_0x1bd76a:'0DcO'};let _0xdd6827=!![];return function(_0x39505c,_0x24b482){const _0xafaa42=bdy_0x467d;if(_0xafaa42(bdy_0x1c82df._0x4cf70b,bdy_0x1c82df._0x178315)!==_0xafaa42(bdy_0x1c82df._0x363434,bdy_0x1c82df._0x279df8)){if(_0x2eb455){const _0x348e2a=_0x23ead4[_0xafaa42(bdy_0x1c82df._0x2b00dc,bdy_0x1c82df._0x39f045)](_0x3fa923,arguments);return _0x1d2395=null,_0x348e2a;}}else{const _0xa8e3c2=_0xdd6827?function(){const _0xed7b84=_0xafaa42;if(_0xed7b84(bdy_0x1960aa._0x409390,bdy_0x1960aa._0x1e7024)!==_0xed7b84(bdy_0x1960aa._0x5f536a,bdy_0x1960aa._0x2d39fb))_0xa79b62(_0x813ca);else{if(_0x24b482){const _0x1ed2e5=_0x24b482[_0xed7b84(bdy_0x1960aa._0x5e8080,bdy_0x1960aa._0x1bd76a)](_0x39505c,arguments);return _0x24b482=null,_0x1ed2e5;}}}:function(){};return _0xdd6827=![],_0xa8e3c2;}};}()),bdy_0x298d8e=bdy_0x2df17a(this,function(){const bdy_0x459d4e={_0x514407:'0x25d',_0x2cf5a9:'E0p(',_0x50adc5:'0x20f',_0x558a7d:'0DcO',_0x15ed5f:'0x1d7',_0x46d877:'7p@o',_0x3e6d99:'0x323',_0x56869e:'@RaM',_0xdd5686:'0x2ba',_0x379cd4:'0x2ca',_0x355195:'Gz(M',_0x1388da:'0x2a5',_0x59bb22:'thG9'},_0x2ef6b3=bdy_0x467d;return bdy_0x298d8e[_0x2ef6b3(bdy_0x459d4e._0x514407,bdy_0x459d4e._0x2cf5a9)]()[_0x2ef6b3(bdy_0x459d4e._0x50adc5,bdy_0x459d4e._0x558a7d)](_0x2ef6b3(bdy_0x459d4e._0x15ed5f,bdy_0x459d4e._0x46d877))[_0x2ef6b3(bdy_0x459d4e._0x3e6d99,bdy_0x459d4e._0x56869e)]()[_0x2ef6b3(bdy_0x459d4e._0xdd5686,bdy_0x459d4e._0x2cf5a9)](bdy_0x298d8e)[_0x2ef6b3(bdy_0x459d4e._0x379cd4,bdy_0x459d4e._0x355195)](_0x2ef6b3(bdy_0x459d4e._0x1388da,bdy_0x459d4e._0x59bb22));});bdy_0x298d8e();const bdy_0x3f6e51=(function(){let _0x13d402=!![];return function(_0x4fbcb0,_0x26d647){const bdy_0x1a0944={_0x55f10b:'0x317',_0x23b204:'tywS'},_0x35ceaf=_0x13d402?function(){const _0x289722=bdy_0x467d;if(_0x26d647){const _0x431e5c=_0x26d647[_0x289722(bdy_0x1a0944._0x55f10b,bdy_0x1a0944._0x23b204)](_0x4fbcb0,arguments);return _0x26d647=null,_0x431e5c;}}:function(){};return _0x13d402=![],_0x35ceaf;};}());function bdy_0xb839(){const _0x4dc073=['W4/dUSkrsmkUwGO','WPOIdmoemW7dJq','WPxdN8kMf8onWRlcSYmLWPZcV8oXWPiq','xYZdKCk1','WRmJWPNdGG','nfrmuKq','cJRdVuuw','hCo2W4hcRrvDB8oWW5lcGmkOWP3cHmosWO/dJG','f8oSW4JcIXng','WQ4KWOJdGbhdVSkIlmogWO12BrjDWOFcLItdRCkKWOhdRtWSWRxcPaWMW4LEW5JdSh3dGmkIW5yijCodCmkoDvdcRsLZWOW8WRhdJeFcLMHcWRm','WRuBctRcKa','WPyJgW','W5zXWOddIZxdOfe','W4b9W5v9oZxdHYpdGf/dJ2xcH8k+rq','W7hdKfaxECoCFey','AKjO','zd7dMCkIWQpdQ8kSW5S','WRX9fHDiyJ0hkCkw','wmkYWOS','WO8TgSoZnW','wMmFn8o3','W5VcGIFdONq','mYhdVfnqWO4gc38I','WRO3WQ3cHW','WRCLftddOmkIWQxdISkPWPRcKCkpW4ddHtn+ts3cNSkWW7WfxCoTW5VdLeiFW7TtWRPmnCoinqVdSCkXW6BdImo2m8kmW5/cISkiWPzKW5qYW4HFv8omW4/cOSoLFSk8WQDf','vabBWPe','d1BcUd/dQCkZW68','AIPpWRDUW5nFWOL9F8kdWQPcfmkStdddO0i','WOu9WOZdQcC','oSoGW4ZcQXfalCoBWPZdICkBW5hdJCkwWRq','bgtcQKCB','W5a9WRtdSH7dPSo5WROmW5jKbmkn','W7FcSZlcJ1RdOSoTWQldPmkP','BqfMBCktWOhcO8o2W4ZcQSoqB0/cOmosW4dcO8kjC8oNp1/dHKe','W44txSoFzsJcHW','WRxcINTtWOldPSkiCa','AITg','yrbWAa','oCkoW7pcGq','jMXFWRVOR6VMS6lLPjBOTRxVVkJORiZMO5ZMNRFNVzpOTQ3PHAZORQO','fmknWPBcV8kYtSkS','y8k9ECoDWQddJbvNWO9iW6eEWPHBW6bjWOLlW7C','WOXBlqjY','WQNdN8kramoIWR/cKcC','W5hcQtdcKXldH8ovWRddOSoO','emoRzG','iXldTmk0W4ddOwq8qSopBmok','FCouWRxcH8kmW5qGt8or','WR4tWR3cU8ku','WR/dHt9cW4KKwCkiB0jOWO7dPCo1','WPP8WRlcPbS','WPv6ernvzq','W6ZcImopWOldUmoSgCo7WQG','lmoMWO1sWOHfaeldJY9s','DIP6WQLeW4DSWPry','W5q0wa','F8kSFSoz','nv/cGYJdOW','dSk0WQXPmYRcTMBdKaxcGSoaWQ4','W4/cUmowWORdLW','WPFcMLS/ixqeWRFdPxldKCkyemkmW7z1wMXTW7fpWO58WR7dQ1NdNmoBWPmWWPZcLCoHEmk+W7tdUfdcNmkjWQmyiIRcIGNdIsDjvCoAxGK','W43dGa8ecSkJWOVdLfiJtSklCmoy','cJ3dVG','hmoRDCog','WOJcJv1QWO4','W4RcJ8oyWPNcU8okf8o4WR9A','WRCuoqJcLG','WQhcHrnjbSkblKnRW4xcUSoEW5W','WRFcGvW7','c1BcRZ7dOmkpW73dVSo/','hSoOW5mvW68yWPRcI8kIW4VdGXFdJ8kodW','ir/dVmk0W4JdPaqxrCogyCokWRG','WP48gmoSkW','l8oWyCoFg8oxuCk5WP0aya','WRaGcZ/dRq','WR8IWQdcJSo1lSoVWR3cG1fkW5iiytFdQg8','W7xcHXeCvG','kmkrW7dcMCkx','WPeEhSoZjq','W7f/W4rRlG','WPZcHK4Mpa','WRW5WR3cNW','W5BdMfioia','WPSPcSo1','d8oSW7ZcUHnDBSo5','W61XW5fDotm','WQL4fb1i','WOxcQ0W','x3iBpW','WOdcUfiHea','lSo0z8oqiCoatq','WRLNhbe','dIBdRveoW7voqxLJW4RcPCojW5ZdM0etWOFcImkn','pmksW6xcH8kNW6STqW','wKpcUCoXWPxcSgy9EConySoNWOlcGeK8WQC','z2H1WP13','aHC3stS','kmkrW7dcVmkk','h2ldMSkLWOpdQCk1W5C2z8kMWQVcKxezWPBdPq','CKj7WPnWW7neW79wWP4','WQzzWQ0','n8kdWQdcLCkz','WP3cUfqXhq','WPBcUfi/imo2h0xdHCkRWQO','W7vHW7RcMbPu','cmoaWODLWOO','WRjhW5n7ccJcQW','bLxcVt3dTq','rWjnWPC','cfO5W7RcLmoW','tNRcSq9wW6zkrZP/W4/dRa','C0JcO8oWWOtcP0CXECodFa','bxOoW63cJG','bmoHW44AW6i','WOzpWRhcPZG','xSo3W7XZBttdRMNcNtBcMSoV','WP7dJCkwf8oaWP3cLsmMWPFcM8oO','WQ89gt3cLa','W5a/xMOAWOOR','W5BcSJlcMcpdJmo+WQBdPSkyW5uldmkWvW','WOhdS8kFs8kIrI3dINddHSkbfg7dQwFcTMtcR0aSW5OxqtnqWQHqWQGKWRddVvSgWQ/cU3CPtcShWQ5fiSk7e8oVWOpdPComW5BcMumjWQddPmo8WR3cJmkXW55TWO5sW5iKW5CKs8kSb1bQjXpcGCoQW7ayoCo7W6qtibXMbSoTWRdcNaXQWO4sy8kiW7KrW5z9WQFcO0PvWRuBkW/cL8olW4dcMIRcVLzcW6bjw8oTW6TpA8k8z8kCjxfVW6xdTfhcOCkFjIusmgLhWRdcItHmqwCzhmkpW6PfW6ZcQddcNupcQrFdMvmvefJdLwvWWOJdJCogft5reSojW7pdVtLQW6HyW5PXW4ZcTu7cS3VdHK7dNSk+r0eajCkYq3KXA8oQWP8EWRTpuCoiWP0wo8oyW6dcPwlcKrdcQYSwWQddOmoXbCoHqLpdHsVcImodW7/dJYeaAmoxqmosW740WQaQWPZcSCkkW53cNJeyW4xcKmozWQ7cRCorECoCE8oKarFcSSokWQtdQv/cKWJdUCo4xSkLW6pcNJNdRsNdMYNdV8kSW75rudHrhqVdTmk/A8koWPtcISoPW5ZdKSkKxYddV8oeWPXmDd5vnmoTWRv4udeFWRzIAmkSs8knkmkgpv5SW53cKSk2W4FdSeBdTGfNWO4ZhCk6WRhdL27cIWVcVdXTWRy2WQ4yuColzvJdGd9lrtzc','WPddG8kt','W6HWW4zTpW','gCo+EmopoZxcV8k5D8oAWRaXc8oXWOtdRtm','BmkUAmoF','WQ5zWQ3cPa','W6G/sYvuAbuFlq','W4/dS2eYqG','WQpcLNbvWQNdQCkromoxW67cTSk1','W4pcPrRcKWq','WR9kWRu','m8o9WOS','WQPNcWa','WOS+dCoLfXNdMW/dGcu','uWldRwNcVmo5WQJdSCoGFWfrWPe','y3v/WRn6','emkhWPa','W7f6W6NcRrSCW6yjrCkMkXddVmk3WP3dNCoCW7dcSSogvcG','WRj8darpmx1gemkEumoCWOfJW43cUKpdImohdtG','kIedBsW','DKX9WOf5','W7jLtwG','DvL9WPTYW4DoW7zD','zSoAWRNdIq','dmkvW7BcUSkR','cfaWW5JcKSoQ','F8kisCo8WRO','WQRcVN8SEG','WR1eeWDs','WPddICkcf8oaWPdcNc8T','FY5DqW','WRFdHH1lW5e','ucVdMmk2WPq','WRq3WQ7cU8kRFa','WRj8darpmx1gcmkhtmowW5PVWO3dVKRdImoobNSpfmo4aq','W4tdSmkEx8k/wGZdKhtdJmoo','W6LOWP3cHmkHB8oHWOW','W5q1wa','E8kLimkdFSksdCo4WP8OxNj0eG','WOZdRZhcIbNdGmo+WQ7dPCkZWPqkb8k7t8oqxq','W43cSJ7cMH7dJq','W5yhW5ZcMLvV','Aq/dV8kyWP8','W4hdVSkcqCkcrH/dNa','vmozWQJdG05IWOlcR8oYWQddMCo/W4Sv','o8oZWPHh','eaiMvYfk','WRa+aCoNoXK','BrbZECkfW4NdVW','n0DIBea','WRHTgrP/zcChfa','W6ldM0C1cSoUWPZdMq','WQiLdtxcLSoUWOVcHsZcIYqIW5mOp8oSWPWZWPZcTCkQW7ahW4GpW4nVW7CqWPG','FdvCxKdcLCoHfJy','wgtcUSoIWPm','zXrHEmkPW5xdQSk2','vsZdImkX','lCo3WOPdWP9Vea','WPBdSwpdJ0FcM8k+WQxdSmkLW5qGla','d8k6WOhcUCkd','hmoYW5y','iCkvW7tcHCkDWR9Ka8o2WQSfeSkoxH3dIxSzW43dMqxdJxa','W5lcUcldV3Dc','wSoFW6uCzG','WPS3WQBcLCkWAW','Dos6Mos4JEweO+wCRs/dU8kDqCo/5PY06k6N6k6z5RkF5AAv6lAQyEkdUo+4TEkaJE+6Ha','WPZcGue7nYbFWRxdShVdImot','WQZdNKbKW6zKBCkbl29iWPxdOSkMu8otFmkDtW','WQ8JWRddNWxcRCoJ','hCoXW5RcPXvAzCoPWPVdHmksW5O','fCk6t8kzBSkohmo0W7CPBH5Ict44WPDMWRJcLM4XzNHCl3NcT8o6W4JcJWnuW7C','wd7dRmk8WPJdUCkxW5CP','WRtcTu4hqSonWQVdU8oNbW','W57cPstdS3Dj','ttLZt8kx','WQ86gHZcJCo/','WRi4gJ3dUSkUWQy','W50HW5BdIwy','WQVdRCk8gmoN','yXrGCmkPW5xdQSk2','c8o3DmonxNVcVCkZ','efRcTZ/dJ8kUW7ldP8oOAajaWRldNvfjbIarqCkTlSkaWRpdMW','kqmbrdbpW75lemkuWQpcHX9U','WQSSWRVcL8k3Aq','W5/dNfy3FSkGW57dNrK7xCowCmklxSo9WOJdHWBdUCkpWO/dM8oHW53cSCotWOCHW5ZdI0pdUW','f8oSW4G','kvnnz0K','k2WFWRDtW6vrWP5S','W7b3W5jR','WQRdImkNW4VcSMddP8kdWOnyeSkOhSkJvmornSoOWRZdUmkzWPtcMcW','W7ikW5VcU0rIW6i','eKdcVcNdN8k4W7ldP8oYyH12WRNdJwDyeaex','yY5j','fNvLB2W','W5VdH0u','t8oDW47dRmoNcmkjkdaREmkK','cmoJW5KCW7PmWP/cMSk+W53dIvRcHSkBfq','5PwM5ysQ5z2x5P+c6k2k5Aw56lsY','WQm1dZddU8kVWQ8','zI9hqW','W6KYASkBWPZcVSka','FdzoWQa','ysHnxedcK8oLfq','W7efW43cKMX1W7FdHq','nEs6M+s6IEwhGEwCUIdcPeZdOXZMNjdORAdORlpMSlxLPzJOT4fh4Okt77Qc4Oka77MU','W6SZtSk1WQ0','WQzxWR7cGcGn','fYZdJmkGWOtdRSo8W4KXpa','W4xdLeqFqSoxAa','WRFdSXDiW4m','WQa6eJlcLSoO','eSoWW7/cOHrhvSo3WOi','WQSkWR/cNmkn','BmkSECoyWQdcK0GHWOKBWQaSWObvW73ORPdMSQJLPjxOTR/VVlBORjJMO5tMNPdNV5dOT5VPHz/ORkC','yZ5MwmkT','zCkGBSogWP3cL1CT','W6j/W5P0','W6H/WPRdHqZcP8o5ASoeWOz0AbTyW4JcKI8','W6/dI8kMW5JcVMddH8kUWOPnsG','W4a0AmkAWONcUa','5lMm5lUL5PYt5yQa5zQK6l2t5zI756MV5PEZ5O+5','f14RW4ZcLW','WOzGW7hcP0NcS8k2','WOJcLLS0wq','pCkoW5pcGCkCW6WLsW','WRmPWOvjiYlcRrNdRa','E8kLEmoEWOBcHv86WQuCWRWwW79FW6ii','WQq1WP3dNIhcQ8o4BCoF','WQ41WP3dLaFcTSo+','WONdHSkvjmo/','hCoYW58CW5LmW5pcI8k1','WRjTgrbzEse','WRj8darpmx1gaCkctmkbW4iGWONcTaNcHCold3Onc8o8eq','mSoZWPHfWOu','eCkOW7mOBNNdSgtdNdVdMSoMWR0Bcmkkea','W53dMeWDAmoBE0DP','WQddKX9uW4eNEq','WOpcRvi7g8oIe1hdRa','W45pW5xcTYm','z11/WPT4','qKlcQ8oMWOlcSea','bZhdUKqnWRTmc381WOVcRmkoW5JdMa','qrvyWOL9W6P1W6CPW4/dUrVdUSk7WRzPW7tdQYRdGSkiW6mzWQ93aCkpW7ldSmk6nCkyrW','WQBcU0GlE8oTWQ3dPSofemom','WQRcNuO9FW9mW73dQNy','b1O6W5O','WQ8JWQZdNbFcT8oBASoB','W6v/W4j5','bt3dVuq','cIjyzSkIW4ycW4yCW7FcK8oa','wCkLv8oEWRW','W7OfW4VcNe0','hmoZW58lW4nwW5tcKa','cdpdLMGp','W6FcUdpcQbS','cvqQW5ZcJG','WPeWgZZcJCoOWPG','WPKTgSoTgXNdMbi','WO3cI1SSpsPo','5lUL5lQn5PYE5yIt5zIM6l2W5zUQ56QX5PA95OYC','bvlcQJ7dHCkVW7RdVa','WOVdLCkroSoh','gwrs','oCknW7xcHSkXW6C+x8o8WQqse8ke','WR1YeqqqkZymbSkErmoBW4OIW4pcSLu','zvtcQmoX','W6a0AmkAWONcUmoExXtcTCk1WRvcW4ro','W7bKW43cG1tdT8k5ACooWP0FFWW','W40PwNWSWOe2W6zOW7C6tWldS8keoSkAemoq','u0RcVCoBWRu','WORdICkgaCofWRhcKW','dmoPD8oNiG','W5ldRmkvxSkcrH/dNa','vGldRMpcVCoXW7pdQCoirt5u','r8oAWRldM1nO','WQLxWR3cOa','gSoMWPPPWQG','eZXnWOzxW6bv','Ah95WOfR','zZvAr13dImkNxZ9BWPqaD2ngW58QWPiuWP3dOSo9W7nzkcxdM8oMW5VdGcOiE8oivJBdSMdcMCkM','W6zsW51Rjq','W44twSoFysJcIIlcKGpcSwxcJfpcPCoSjXLdDhC','yKX7WPm','cSoHWOLuW4blbu3dHdG','WQxcHrflamkeiXPCW6RcR8oSW57cUq','WQ1DWQ3cScKAc3NcIvhdLmkcx0NdREIVR+AXIUwLMEI3Lo+9KUIUHUAINoADMEE8HEI1Q+MeT+ITHG','WQO/WPS','EmkIkSkgFCkubSkGWQ4IEhfY','WOtcT2XzWQi','W79VW6/cSdDoWQzlua','w8kLEmoEWQFcMu4PWOSUWQWCW4ru','WRPzWQVcTJ8','FeJcQSogWOlcPW','AsbCwMFcNmoUhW','cmo3W53cPW9tACo4WOS','BsrpwwdcH8oL','WR/cMqPug8kBmqaLWPNdLCkj','WOzGW7e','WQuIhJBdH8k/WQVdKmkf','y8ooWQO','z8kMAG','W7FcOIpdT2PomSouAGy','BCkOF8oaWOBcHv86WRCpWQa','WPBcIw8qya','WQRcNuO9hc9gW70','u2CBlSoGW4XcWPmVW4xcQSkLEuJcJvxcGYJdQ8ognN3dICk1ac3dHmkPsv7dICklrmkPBGFcTSo7a8olW4LCuCoIW6qHWPddN8kuWPKSvCohCSoW','FmkWAmoLWRG','W6XXWOFdIIldT1a','WQpcLNfkWQxdOG','dSoOzmomqMBcVSkUu8oxWQiGj8kZW4ldOa','WQT3WONcLZi','W6tdMmkxs8kg','cSoVW48xW75DW4a','c1ZcVG','W5NdGueScSoUWPZdMq','WQCGWOZdNaVcP8oSD8ocWOC1iWHhW4BcKMZdO8kZWOVdUgD2WRBcRr8qW4K','cSoVW5qkW75kW4FcNmkKW5hdLa','kSkoW67cHSkAW7C+t8oHWQuf','vaXfWOb7W7XG','WObMW7hcReNcUq','hmoMW5VcRa5qEq','fdFdQLqrWRS','B8khF8ovWR0','W6CfW43cJea','iaGOtITh','W6JcPcpcJXldHSopWQNdR8kVW5Wx','WRX2WQ3cPJu','d1LPCwC','WP0Jdmo5BW','fSoWzCopzc/dTmoZCSoxWQm3f8oZW4NcOsVcObrsW6tdRJa','cmkhWPBcSmks','iCoMjW','WPpcJwXiWQldOmkmC8o6','tmoIW7qVy3i','fJ3dQLu','WPhcUKm3bCoX','AmkHAmooWRJcUL8+WOir','W6bTW4v9pWJcHaNdJG'];bdy_0xb839=function(){return _0x4dc073;};return bdy_0xb839();}(function(){const bdy_0x591447={_0x3ef9ee:'0x301',_0x24f2a8:'DzgY',_0xdc19db:'0x30f',_0x1ce9f0:'KAL6',_0x3162a2:'0x25c',_0x462713:'O[@[',_0x3bae41:'0x244',_0xece00b:'dqAF'},bdy_0x248e60={_0x3c98fc:'0x30a',_0x4f1c4a:'UnSc',_0x251f02:'0x23e',_0xa50e49:'Zjjr',_0x494c1f:'0x2d6',_0x459990:'@RaM',_0x508129:'0x227',_0x5a2d26:'swYa',_0x37b4b8:'0x22b',_0xb8b508:'#DB0',_0x4ac9d4:'0x307',_0x46d365:'Jq#d',_0x4b7aa0:'0x31f',_0xd9639c:'#TE3',_0x29f8f5:'0x2e8',_0x1e0e9a:'$&Sv',_0x55dd99:'0x1e3',_0xc87aa2:'o3ro'},_0x3869b2=bdy_0x467d,_0x509a49={};_0x509a49[_0x3869b2(bdy_0x591447._0x3ef9ee,bdy_0x591447._0x24f2a8)]=_0x3869b2(bdy_0x591447._0xdc19db,bdy_0x591447._0x1ce9f0),_0x509a49[_0x3869b2(bdy_0x591447._0x3162a2,bdy_0x591447._0x462713)]=_0x3869b2(bdy_0x591447._0x3bae41,bdy_0x591447._0xece00b);const _0x437f80=_0x509a49;bdy_0x3f6e51(this,function(){const _0x23ded8=_0x3869b2;if(_0x437f80[_0x23ded8(bdy_0x248e60._0x3c98fc,bdy_0x248e60._0x4f1c4a)]===_0x23ded8(bdy_0x248e60._0x251f02,bdy_0x248e60._0xa50e49)){const _0x5cb2d0=new RegExp(_0x23ded8(bdy_0x248e60._0x494c1f,bdy_0x248e60._0x459990)),_0x13a233=new RegExp(_0x23ded8(bdy_0x248e60._0x508129,bdy_0x248e60._0x5a2d26),'i'),_0x3cc4ec=bdy_0x5853c0(_0x437f80[_0x23ded8(bdy_0x248e60._0x37b4b8,bdy_0x248e60._0xb8b508)]);!_0x5cb2d0[_0x23ded8(bdy_0x248e60._0x4ac9d4,bdy_0x248e60._0x46d365)](_0x3cc4ec+_0x23ded8(bdy_0x248e60._0x4b7aa0,bdy_0x248e60._0xd9639c))||!_0x13a233[_0x23ded8(bdy_0x248e60._0x29f8f5,bdy_0x248e60._0x1e0e9a)](_0x3cc4ec+_0x23ded8(bdy_0x248e60._0x55dd99,bdy_0x248e60._0xc87aa2))?_0x3cc4ec('0'):bdy_0x5853c0();}else _0x44c81d();})();}());const bdy_0x45b14d=require(bdy_0x4d8a20('0x267','Gz(M')),bdy_0x4beb50=require(bdy_0x4d8a20('0x208','&pHw')),bdy_0x41f70a=require(bdy_0x4d8a20('0x256','OQ@V')),bdy_0x3ac7b4=require(bdy_0x4d8a20('0x331','AyHW'));async function getuserinfo_6dy(){const bdy_0x12ad70={_0x4f5cbd:'0x2d8',_0x4e694f:'OQ@V',_0xa7fb4d:'0x31a',_0x1ab3a9:'H2@y',_0x4d85ee:'0x326',_0x19c65f:'CTNW',_0x2a4863:'0x2b4',_0x4ac358:'oAeX',_0x44ad65:'0x2e9',_0x2dfb26:'Pv4j',_0x2a1be2:'0x258',_0x40b2a4:'fli4',_0x20fd2:'0x2b8',_0x142719:'OQ@V',_0x8db9b7:'0x241',_0x5a7172:'jwcz',_0x2df025:'0x2c7',_0x3484af:'t*2b',_0x410698:'0x223',_0x36a1a1:'#TE3',_0x5deab3:'0x215',_0x4cbfdb:'&Svj',_0x3b9501:'0x221',_0x3f0724:'0x271',_0x3b8438:'#TE3'},bdy_0x5ce070={_0x4321b8:'0x283',_0x6e9626:'Zjjr'},bdy_0x1e52bf={_0x5517ef:'0x2de',_0x55d62c:'YNmL',_0x274fba:'0x2a3',_0x1a1bda:'@RaM',_0x1056a9:'0x29b',_0x5f5db4:'OQ@V',_0x331c67:'0x252',_0x99b270:'Jq#d',_0x52973f:'0x1f5',_0x2494a7:'YNmL',_0x5957b9:'0x243',_0x7850c3:'Tf4t',_0x2f2abf:'0x1f6',_0x4552f8:'&Svj',_0x58740a:'0x225',_0xc392f6:'OQ@V',_0x103d45:'0x27f',_0x5c79b3:'#TE3',_0x3cacb6:'0x320',_0x2d93e8:'H2@y',_0x594ded:'0x314',_0x47bcab:'Pv4j',_0x2b3a31:'0x219',_0x30c78a:'AyHW',_0x414eac:'0x279',_0x106f76:'jwcz',_0x3941b1:'0x281',_0x3e1470:'0x1fe',_0x5e6abb:'p1@n',_0x387a6b:'0x305',_0x3e8c24:'xAoq',_0x45581b:'0x217',_0x5f36d0:'KQAa',_0x1a77e9:'0x20e',_0x42f7d3:'Yx4G',_0x1b8da8:'0x32c',_0x415c23:'E0p(',_0x509a81:'0x273',_0x958d4a:'OQ@V',_0x510c52:'0x254',_0x445f92:'Jq#d',_0x3c99fc:'0x297',_0x391339:'0x28d',_0x23b912:'oAeX',_0x5e9d0e:'0x218',_0x2153ef:'#DB0',_0x424447:'0x247',_0x198437:'dqAF',_0xac1485:'0x2f2',_0x251dc0:'KAL6',_0x5465d7:'0x300',_0x3a2b8d:'VSVL',_0x3ea3a2:'0x327',_0x308fde:'%v^B',_0x13d12a:'0x231',_0x1c6781:'uBNu',_0x2388b8:'0x2d1',_0x42972a:'p1@n',_0x14ced9:'0x260',_0x28600a:'OQ@V',_0x3c32da:'0x1e6',_0x1ebc1a:'DzgY',_0x169be8:'0x2ce',_0x5183c9:'o3ro',_0x1df12c:'0x2a4',_0x1806eb:'0x23d',_0x28221a:'dqAF',_0x57ed19:'0x259',_0x20ccf7:'KAL6',_0x4695d0:'0x1d6',_0x4e8897:'OXQ!',_0x310a21:'0x1db',_0x5eae25:'DzgY'},_0x4b6003=bdy_0x4d8a20,_0x2570e6={'HCwac':function(_0x570bc3,_0x12ff6f){return _0x570bc3==_0x12ff6f;},'Lwhbb':function(_0x12b71b){return _0x12b71b();},'CGggM':_0x4b6003(bdy_0x12ad70._0x4f5cbd,bdy_0x12ad70._0x4e694f),'toakE':_0x4b6003(bdy_0x12ad70._0xa7fb4d,bdy_0x12ad70._0x1ab3a9)},_0x2240e0={};_0x2240e0[_0x4b6003(bdy_0x12ad70._0x4d85ee,bdy_0x12ad70._0x19c65f)]=_0x2570e6[_0x4b6003(bdy_0x12ad70._0x2a4863,bdy_0x12ad70._0x4ac358)],_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)]={},_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)][_0x4b6003(bdy_0x12ad70._0x2a1be2,bdy_0x12ad70._0x40b2a4)]=_0x4b6003(bdy_0x12ad70._0x20fd2,bdy_0x12ad70._0x142719),_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)][_0x4b6003(bdy_0x12ad70._0x8db9b7,bdy_0x12ad70._0x5a7172)]=_0x2570e6[_0x4b6003(bdy_0x12ad70._0x2df025,bdy_0x12ad70._0x3484af)],_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)][_0x4b6003(bdy_0x12ad70._0x410698,bdy_0x12ad70._0x36a1a1)]=_0x4b6003(bdy_0x12ad70._0x5deab3,bdy_0x12ad70._0x4cbfdb),_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)][_0x4b6003(bdy_0x12ad70._0x3b9501,bdy_0x12ad70._0x1ab3a9)]=cookie,_0x2240e0[_0x4b6003(bdy_0x12ad70._0x44ad65,bdy_0x12ad70._0x2dfb26)][_0x4b6003(bdy_0x12ad70._0x3f0724,bdy_0x12ad70._0x3b8438)]=$['UA'];let _0x41041e=_0x2240e0;return new Promise(_0x5a93d1=>{const _0x455762=_0x4b6003;$[_0x455762(bdy_0x5ce070._0x4321b8,bdy_0x5ce070._0x6e9626)](_0x41041e,async(_0x52e497,_0x54da9a,_0x3f8f26)=>{const _0x3fabe0=_0x455762;try{if(_0x52e497)console[_0x3fabe0(bdy_0x1e52bf._0x5517ef,bdy_0x1e52bf._0x55d62c)](''+JSON[_0x3fabe0(bdy_0x1e52bf._0x274fba,bdy_0x1e52bf._0x1a1bda)](_0x52e497)),console[_0x3fabe0(bdy_0x1e52bf._0x1056a9,bdy_0x1e52bf._0x5f5db4)](_0x3fabe0(bdy_0x1e52bf._0x331c67,bdy_0x1e52bf._0x99b270));else{if(_0x3f8f26){_0x3f8f26=JSON[_0x3fabe0(bdy_0x1e52bf._0x52973f,bdy_0x1e52bf._0x2494a7)](_0x3f8f26);if(_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x5957b9,bdy_0x1e52bf._0x7850c3)]===_0x3fabe0(bdy_0x1e52bf._0x2f2abf,bdy_0x1e52bf._0x4552f8)){$[_0x3fabe0(bdy_0x1e52bf._0x58740a,bdy_0x1e52bf._0xc392f6)]=![];return;}_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x103d45,bdy_0x1e52bf._0x5c79b3)]==='0'&&_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x3cacb6,bdy_0x1e52bf._0x2d93e8)]&&($[_0x3fabe0(bdy_0x1e52bf._0x594ded,bdy_0x1e52bf._0x47bcab)]=_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x2b3a31,bdy_0x1e52bf._0x30c78a)]?.[_0x3fabe0(bdy_0x1e52bf._0x414eac,bdy_0x1e52bf._0x106f76)]?.[_0x3fabe0(bdy_0x1e52bf._0x3941b1,bdy_0x1e52bf._0x47bcab)]?.[_0x3fabe0(bdy_0x1e52bf._0x3e1470,bdy_0x1e52bf._0x5e6abb)],$[_0x3fabe0(bdy_0x1e52bf._0x387a6b,bdy_0x1e52bf._0x3e8c24)]=_0x2570e6[_0x3fabe0(bdy_0x1e52bf._0x45581b,bdy_0x1e52bf._0x5f36d0)](_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x1a77e9,bdy_0x1e52bf._0x42f7d3)]?.[_0x3fabe0(bdy_0x1e52bf._0x1b8da8,bdy_0x1e52bf._0x415c23)]?.[_0x3fabe0(bdy_0x1e52bf._0x509a81,bdy_0x1e52bf._0x958d4a)],-0xfd2+0x21df+-0x120c),$[_0x3fabe0(bdy_0x1e52bf._0x510c52,bdy_0x1e52bf._0x445f92)]=_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x3c99fc,bdy_0x1e52bf._0x55d62c)]?.[_0x3fabe0(bdy_0x1e52bf._0x391339,bdy_0x1e52bf._0x23b912)]?.[_0x3fabe0(bdy_0x1e52bf._0x5e9d0e,bdy_0x1e52bf._0x2153ef)]?.[_0x3fabe0(bdy_0x1e52bf._0x424447,bdy_0x1e52bf._0x198437)]||$[_0x3fabe0(bdy_0x1e52bf._0xac1485,bdy_0x1e52bf._0x251dc0)],$[_0x3fabe0(bdy_0x1e52bf._0x5465d7,bdy_0x1e52bf._0x3a2b8d)]=_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x3ea3a2,bdy_0x1e52bf._0x308fde)]?.[_0x3fabe0(bdy_0x1e52bf._0x13d12a,bdy_0x1e52bf._0x1c6781)]?.[_0x3fabe0(bdy_0x1e52bf._0x2388b8,bdy_0x1e52bf._0x42972a)]||'',$[_0x3fabe0(bdy_0x1e52bf._0x14ced9,bdy_0x1e52bf._0x28600a)]=_0x3f8f26[_0x3fabe0(bdy_0x1e52bf._0x3c32da,bdy_0x1e52bf._0x1ebc1a)]?.[_0x3fabe0(bdy_0x1e52bf._0x169be8,bdy_0x1e52bf._0x5183c9)]?.[_0x3fabe0(bdy_0x1e52bf._0x1df12c,bdy_0x1e52bf._0x198437)]||0x17cc*-0x1+0x1*-0xc71+0x243d);}else $[_0x3fabe0(bdy_0x1e52bf._0x1806eb,bdy_0x1e52bf._0x28221a)](_0x3fabe0(bdy_0x1e52bf._0x57ed19,bdy_0x1e52bf._0x20ccf7));}}catch(_0x111ab0){$[_0x3fabe0(bdy_0x1e52bf._0x4695d0,bdy_0x1e52bf._0x4e8897)](_0x111ab0,_0x54da9a);}finally{_0x2570e6[_0x3fabe0(bdy_0x1e52bf._0x310a21,bdy_0x1e52bf._0x5eae25)](_0x5a93d1);}});});}async function bdy_0x591981(){const bdy_0x164387={_0x2e03d8:'0x24a',_0x40bfe5:'fli4',_0x6e5f9f:'0x2d5',_0x3ec87b:'7p@o',_0x332067:'0x28f',_0x1812fa:'tacb',_0x35ae84:'0x2ef',_0x3a5f7b:'&pHw',_0x44a3d5:'0x302',_0x23f63f:'(^5L',_0x175fcc:'0x2f0',_0x2bb9a0:'#DB0',_0x5b8271:'0x24d',_0x1a470e:'thG9',_0x54ec10:'0x203',_0x1f6a91:'(^5L',_0x4a1fc3:'0x235',_0x1f089a:'Bk##',_0x3896ab:'0x2e7',_0x30ebd6:'Tf4t',_0x7090b7:'0x2fc',_0x105abf:'uBNu',_0x79c0b4:'0x1e1',_0x176ddf:'oAeX'},bdy_0x55ff87={_0x19ee11:'0x2f5',_0x5ae057:'E0p('},_0x482d43=bdy_0x4d8a20,_0x548b25={};_0x548b25[_0x482d43(bdy_0x164387._0x2e03d8,bdy_0x164387._0x40bfe5)]=_0x482d43(bdy_0x164387._0x6e5f9f,bdy_0x164387._0x3ec87b);const _0x26440a=_0x548b25,_0xb33d33={};_0xb33d33[_0x482d43(bdy_0x164387._0x332067,bdy_0x164387._0x1812fa)]=cookie,_0xb33d33[_0x482d43(bdy_0x164387._0x35ae84,bdy_0x164387._0x3a5f7b)]=$['UA'],_0xb33d33[_0x482d43(bdy_0x164387._0x44a3d5,bdy_0x164387._0x23f63f)]=_0x482d43(bdy_0x164387._0x175fcc,bdy_0x164387._0x2bb9a0),_0xb33d33[_0x482d43(bdy_0x164387._0x5b8271,bdy_0x164387._0x1a470e)]=_0x482d43(bdy_0x164387._0x54ec10,bdy_0x164387._0x1f6a91);let _0x1b1d82={'url':_0x482d43(bdy_0x164387._0x4a1fc3,bdy_0x164387._0x1f089a),'body':_0x482d43(bdy_0x164387._0x3896ab,bdy_0x164387._0x30ebd6)+Date[_0x482d43(bdy_0x164387._0x7090b7,bdy_0x164387._0x105abf)]()+_0x482d43(bdy_0x164387._0x79c0b4,bdy_0x164387._0x176ddf),'headers':_0xb33d33};return new Promise(_0xe65c4d=>{const bdy_0x3cba49={_0x59743f:'0x2b6',_0x1ffc50:'Pv4j',_0x5adcac:'0x26a',_0x236867:'CTNW',_0x196cbb:'0x1e2',_0x403c4b:'p1@n',_0x4710bd:'0x29a',_0xba723b:'DzgY',_0x15297f:'0x268',_0x267708:'thG9',_0x2fbcbb:'0x335',_0x4f347c:'CTNW',_0x3b67ff:'0x278',_0x356fda:'#^)X',_0x124247:'0x213',_0x35e5a9:'(^5L',_0x4ffd78:'0x266',_0x5a6646:'Yx4G',_0x2a96c6:'0x27c',_0x2eba68:'OXQ!',_0x1dc7ff:'0x2b7',_0x779776:'Bk##',_0x4f6c7c:'0x1da',_0x3c2513:'jwcz',_0x43a75a:'jwcz',_0x59b6fd:'0x214',_0x2e60b9:'Bk##',_0x477049:'0x202',_0x4da995:'H2@y',_0x4282fa:'0x1de',_0x26262c:'&Svj',_0x465b10:'0x1fc',_0x2573c9:'O[@[',_0x1386bc:'0x324',_0x4d0f22:'o3ro'},_0xb2c58c=_0x482d43;$[_0xb2c58c(bdy_0x55ff87._0x19ee11,bdy_0x55ff87._0x5ae057)](_0x1b1d82,async(_0x19f6bd,_0x5ef6ea,_0x56b4c0)=>{const _0x4df6c7=_0xb2c58c;try{_0x19f6bd?(console[_0x4df6c7(bdy_0x3cba49._0x59743f,bdy_0x3cba49._0x1ffc50)](''+JSON[_0x4df6c7(bdy_0x3cba49._0x5adcac,bdy_0x3cba49._0x236867)](_0x19f6bd)),console[_0x4df6c7(bdy_0x3cba49._0x196cbb,bdy_0x3cba49._0x403c4b)](_0x4df6c7(bdy_0x3cba49._0x4710bd,bdy_0x3cba49._0xba723b))):($[_0x4df6c7(bdy_0x3cba49._0x15297f,bdy_0x3cba49._0x267708)]=_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x2fbcbb,bdy_0x3cba49._0x4f347c)](/"score":(\d+)/)?_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x3b67ff,bdy_0x3cba49._0x356fda)](/"score":(\d+)/)[0x531+0x5f*-0x47+0x1529]:-0x1e6c+0xe14+0x82c*0x2,$[_0x4df6c7(bdy_0x3cba49._0x124247,bdy_0x3cba49._0x35e5a9)]=_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x4ffd78,bdy_0x3cba49._0x5a6646)](/"currentBeanNum":(\d+)/)?_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x2a96c6,bdy_0x3cba49._0x2eba68)](/"currentBeanNum":(\d+)/)[0x3a*0x21+-0xb6f*0x2+0xf65]:-0x11*-0xbb+-0x3*0x5df+0x46*0x13,$[_0x4df6c7(bdy_0x3cba49._0x1dc7ff,bdy_0x3cba49._0x779776)]=_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x4f6c7c,bdy_0x3cba49._0x3c2513)](/"showName":"(.*?)"/)?_0x56b4c0[_0x4df6c7(bdy_0x3cba49._0x4f6c7c,bdy_0x3cba49._0x43a75a)](/"showName":"(.*?)"/)[-0x25cc+-0x2*-0xb71+-0x43*-0x39]:$[_0x4df6c7(bdy_0x3cba49._0x59b6fd,bdy_0x3cba49._0x2e60b9)]);}catch(_0x58a447){$[_0x4df6c7(bdy_0x3cba49._0x477049,bdy_0x3cba49._0x4da995)](_0x58a447,_0x5ef6ea);}finally{_0x4df6c7(bdy_0x3cba49._0x4282fa,bdy_0x3cba49._0x26262c)===_0x26440a[_0x4df6c7(bdy_0x3cba49._0x465b10,bdy_0x3cba49._0x2573c9)]?_0xe65c4d():_0x5c3f9f[_0x4df6c7(bdy_0x3cba49._0x1386bc,bdy_0x3cba49._0x4d0f22)](_0x4a3da5,_0x4d50fc);}});});}async function queryScores(){const bdy_0x393926={_0x28ae8d:'0x2b3',_0x19f07b:'DzgY',_0x288ed4:'0x284',_0x2eb38e:'E0p(',_0x4d4722:'0x26b',_0x3caa1e:'tc9c',_0x1baf9c:'0x294',_0x1995de:'dqAF',_0x5dab48:'0x330',_0x22fd7b:'0x2ed',_0x4c5514:'7p@o',_0xb787f7:'0x2e0',_0x446b84:'(^5L',_0x3f1b0c:'0x232',_0x4ad6bb:'Pv4j',_0x519b2d:'0x2e6',_0x25f1bc:'H2@y',_0x397ab2:'0x2e3',_0xde7f4d:'%v^B',_0x29a568:'0x1d9',_0x51d529:'OXQ!',_0xecd516:'0x2d3',_0x2f68cb:'OQ@V',_0x387052:'0x2fa',_0x5bfc36:'p1@n',_0x2f99b8:'0x272',_0x59af9d:'OXQ!',_0x357d84:'0x25b',_0x1e608b:'FP!)',_0x2b57e1:'0x21f',_0x1e70bb:'Qzi(',_0x254d66:'0x298',_0x285610:'Yx4G',_0x1a4140:'0x2b0',_0x223b27:'R)Bk',_0x1fc23e:'0x22f',_0x1b6886:'0x1eb',_0x3fab92:'DzgY',_0x362666:'0x265',_0x19dd0f:'0x23a',_0x5623a7:'nx1H',_0x4e6828:'0x2db',_0x4f0705:'R)Bk'},bdy_0x45f8e9={_0x4ad1d8:'0x2e4',_0x2543b7:'Qzi(',_0x386394:'0x1ed',_0x1f2522:'(^5L'},_0x56bef5=bdy_0x4d8a20,_0x3cc563={};_0x3cc563[_0x56bef5(bdy_0x393926._0x28ae8d,bdy_0x393926._0x19f07b)]=_0x56bef5(bdy_0x393926._0x288ed4,bdy_0x393926._0x2eb38e),_0x3cc563[_0x56bef5(bdy_0x393926._0x4d4722,bdy_0x393926._0x3caa1e)]=_0x56bef5(bdy_0x393926._0x1baf9c,bdy_0x393926._0x1995de);const _0x49b5fd=_0x3cc563;let _0x55c702='';const _0x4c5029={};_0x4c5029[_0x56bef5(bdy_0x393926._0x5dab48,bdy_0x393926._0x2eb38e)]=_0x56bef5(bdy_0x393926._0x22fd7b,bdy_0x393926._0x4c5514),_0x4c5029[_0x56bef5(bdy_0x393926._0xb787f7,bdy_0x393926._0x446b84)]=_0x56bef5(bdy_0x393926._0x3f1b0c,bdy_0x393926._0x4ad6bb),_0x4c5029[_0x56bef5(bdy_0x393926._0x519b2d,bdy_0x393926._0x25f1bc)]={},_0x4c5029[_0x56bef5(bdy_0x393926._0x397ab2,bdy_0x393926._0xde7f4d)]=_0x49b5fd[_0x56bef5(bdy_0x393926._0x29a568,bdy_0x393926._0x51d529)],_0x4c5029[_0x56bef5(bdy_0x393926._0xecd516,bdy_0x393926._0x2f68cb)]=$[_0x56bef5(bdy_0x393926._0x387052,bdy_0x393926._0x5bfc36)],_0x4c5029[_0x56bef5(bdy_0x393926._0x2f99b8,bdy_0x393926._0x59af9d)]=0x0,_0x4c5029['ua']=$['UA'];let _0x41b92c=_0x4c5029;body=await bdy_0x3ac7b4[_0x56bef5(bdy_0x393926._0x357d84,bdy_0x393926._0x1e608b)](_0x41b92c);const _0x1094ab={};_0x1094ab[_0x56bef5(bdy_0x393926._0x2b57e1,bdy_0x393926._0x1e70bb)]=cookie,_0x1094ab[_0x56bef5(bdy_0x393926._0x254d66,bdy_0x393926._0x285610)]=$['UA'],_0x1094ab[_0x56bef5(bdy_0x393926._0x1a4140,bdy_0x393926._0x223b27)]=_0x49b5fd[_0x56bef5(bdy_0x393926._0x1fc23e,bdy_0x393926._0x5bfc36)];const _0x50e237={};_0x50e237[_0x56bef5(bdy_0x393926._0x1b6886,bdy_0x393926._0x3fab92)]=_0x56bef5(bdy_0x393926._0x362666,bdy_0x393926._0x446b84)+body+_0x56bef5(bdy_0x393926._0x19dd0f,bdy_0x393926._0x5623a7),_0x50e237[_0x56bef5(bdy_0x393926._0x4e6828,bdy_0x393926._0x4f0705)]=_0x1094ab;let _0x32affa=_0x50e237;return new Promise(_0x7bc93e=>{const bdy_0x414aad={_0x4b3897:'0x2c0',_0x2dc619:'#^)X',_0x46a3b3:'0x2d4',_0x38c5ff:'Zjjr',_0x43bd08:'0x32a',_0x141eb5:'(^5L',_0x5d5e20:'0x29f',_0x2eb231:'Jq#d',_0x21f144:'0x23c',_0x1023ba:'Pv4j',_0x346741:'0x332',_0x49062c:'YNmL',_0xb1dc1e:'0x337',_0x20e4db:'tc9c'},_0x2f2df1=_0x56bef5,_0x2c328c={};_0x2c328c[_0x2f2df1(bdy_0x45f8e9._0x4ad1d8,bdy_0x45f8e9._0x2543b7)]=function(_0x5ab414,_0x3b6e67){return _0x5ab414==_0x3b6e67;};const _0x347b98=_0x2c328c;$[_0x2f2df1(bdy_0x45f8e9._0x386394,bdy_0x45f8e9._0x1f2522)](_0x32affa,async(_0x3733ee,_0x1721a3,_0x4b12ff)=>{const _0x49795d=_0x2f2df1;try{const _0x4a4965=JSON[_0x49795d(bdy_0x414aad._0x4b3897,bdy_0x414aad._0x2dc619)](_0x4b12ff);_0x347b98[_0x49795d(bdy_0x414aad._0x46a3b3,bdy_0x414aad._0x38c5ff)](_0x4a4965[_0x49795d(bdy_0x414aad._0x43bd08,bdy_0x414aad._0x141eb5)],-0x17*0x123+-0xd77+0x2b84)&&($[_0x49795d(bdy_0x414aad._0x5d5e20,bdy_0x414aad._0x2eb231)]=_0x4a4965['rs'][_0x49795d(bdy_0x414aad._0x21f144,bdy_0x414aad._0x1023ba)][_0x49795d(bdy_0x414aad._0x346741,bdy_0x414aad._0x49062c)]);}catch(_0xe041df){$[_0x49795d(bdy_0x414aad._0xb1dc1e,bdy_0x414aad._0x20e4db)](_0xe041df,_0x1721a3);}finally{_0x7bc93e();}});});}async function fruitinfo(){const bdy_0x5c2fa0={_0x5997ae:'0x29d',_0x15ef6b:'KAL6',_0x35a444:'0x2c6',_0x3b0a30:'uBNu'},bdy_0x38596f={_0x56a713:'0x2c3',_0xf210ca:'DzgY',_0x4e8ece:'0x269',_0x5abba1:'VSVL',_0x28e4d5:'0x22d',_0xf1e604:'Tf4t',_0x3993d5:'0x1dd',_0x4318ad:'p1@n',_0x71b19f:'0x2e1',_0x3fc614:'jwcz',_0x1ebbee:'0x333',_0x5526cb:'0x306',_0x1f87bb:'w[f8',_0x5b77fb:'0x2cc',_0x53c8fd:'CTNW',_0x5efe9f:'0x2a8',_0x4e6c35:'E0p(',_0x1d7f7a:'0x26e',_0xd44dce:'7p@o',_0x59d45e:'0x1e4',_0x49a3e3:'uBNu',_0x3fadaa:'0x287',_0x161fdd:'fli4',_0x2a0a2f:'0x30c',_0x26f105:'Bk##',_0x1893ae:'0x24f',_0x5e798d:'&Svj',_0x43827c:'0x209',_0x382f96:'&pHw',_0x52aee0:'0x21e',_0x10b161:'E0p(',_0x28e849:'0x21a',_0x225f77:'Yx4G',_0x550c65:'0x2bf',_0x325ce7:'Jq#d',_0x3696df:'0x2e5',_0x219928:'7p@o',_0x48c30f:'0x1e9',_0x371a2f:'KAL6',_0x27b3ad:'0x26f',_0x39c13a:'$&Sv',_0x4883b3:'0x30b',_0x56844f:'#TE3',_0x5ca2cc:'0x2c5',_0x325adc:'tywS',_0x4c544d:'0x303',_0x4f55f1:'UnSc',_0x4a360b:'0x24c',_0x52a710:'AyHW',_0x13e840:'0x2cb'},bdy_0x4e41eb={_0x565c8d:'0x236',_0x44fced:'@RaM',_0x32156b:'0x249',_0x2a270b:'Gz(M',_0x206d10:'0x30d',_0x3e02ae:'7p@o',_0x2f129e:'0x1f7',_0x186fe9:'YNmL',_0x28368e:'0x20c',_0x3cac53:'oAeX',_0x24e7f9:'0x31e',_0x137607:'o3ro',_0x547673:'0x2dd',_0x30bd8c:'thG9',_0x1bcf38:'0x318',_0x20c953:'swYa',_0x6d47b1:'0x308',_0x4d52d8:'Pv4j',_0x3f008a:'0x277',_0x4d97e5:'Jq#d',_0x4c9fe7:'0x233',_0x4bb0e2:'0DcO',_0x38e158:'0x248',_0x43f1f1:'#^)X',_0xcbf06a:'0x336',_0x2d664b:'CTNW',_0xda126c:'0x2d2',_0x127fe2:'AyHW',_0x1286df:'0x2c2',_0x2eaa2f:'&pHw',_0x273671:'0x27e',_0xbac869:'tywS',_0xc46bdd:'0x1ee',_0x119316:'0x32d',_0x4b76bf:'KQAa',_0xb15a4f:'0x230',_0x777a24:'#DB0',_0x5ef626:'0x270',_0x3bdecd:'O[@[',_0x58f70f:'0x1e0',_0x34341b:'0x263',_0xd94aab:'jwcz',_0x454788:'0x2a2',_0x105e4c:'dqAF',_0x1294a0:'0x2ab',_0x142820:'0x2a7',_0x185821:'Tf4t',_0x32f167:'0x2d9',_0x10928f:'&Svj',_0x5aea2b:'0x220',_0x28323f:'Gz(M',_0x1c4153:'0x1f0',_0x2cb00b:'YNmL',_0x37c604:'0x22c',_0x1364df:'&Svj',_0x3cc2bb:'0x20d',_0xd74ffa:'tacb',_0x5ddade:'0x289',_0xd9a446:'w[f8',_0xf76ca5:'0x229',_0xd2a1ca:'0x334',_0x5aa69b:'t*2b',_0x56abcf:'0x25a',_0x260fb8:'OXQ!',_0x25e2fb:'0x2a0',_0x1128a7:'DzgY',_0x236b2f:'0x246',_0x580f28:'xAoq',_0x415e01:'0x228',_0x42f872:'0x2b2',_0x38b759:'uBNu',_0x3019e6:'0x2d0',_0x83dc8:'tywS'},_0x541a55=bdy_0x4d8a20,_0x41ab2c={};_0x41ab2c[_0x541a55(bdy_0x5c2fa0._0x5997ae,bdy_0x5c2fa0._0x15ef6b)]=_0x541a55(bdy_0x5c2fa0._0x35a444,bdy_0x5c2fa0._0x3b0a30);const _0x3edb97=_0x41ab2c;return new Promise(_0x5c16c9=>{const _0x3793f7=_0x541a55,_0xe15043={};_0xe15043[_0x3793f7(bdy_0x38596f._0x56a713,bdy_0x38596f._0xf210ca)]=function(_0x1ea0dd,_0x1cbc90){return _0x1ea0dd===_0x1cbc90;};const _0x565b7e=_0xe15043,_0x216d18={};_0x216d18[_0x3793f7(bdy_0x38596f._0x4e8ece,bdy_0x38596f._0x5abba1)]=0x18,_0x216d18[_0x3793f7(bdy_0x38596f._0x28e4d5,bdy_0x38596f._0xf1e604)]=0x1,_0x216d18[_0x3793f7(bdy_0x38596f._0x3993d5,bdy_0x38596f._0x4318ad)]=_0x3793f7(bdy_0x38596f._0x71b19f,bdy_0x38596f._0x3fc614),_0x216d18[_0x3793f7(bdy_0x38596f._0x1ebbee,bdy_0x38596f._0xf210ca)]='0',_0x216d18[_0x3793f7(bdy_0x38596f._0x5526cb,bdy_0x38596f._0x1f87bb)]='0';const _0x52a7b0={};_0x52a7b0[_0x3793f7(bdy_0x38596f._0x5b77fb,bdy_0x38596f._0x53c8fd)]=_0x3793f7(bdy_0x38596f._0x5efe9f,bdy_0x38596f._0x4e6c35),_0x52a7b0[_0x3793f7(bdy_0x38596f._0x1d7f7a,bdy_0x38596f._0xd44dce)]=_0x3793f7(bdy_0x38596f._0x59d45e,bdy_0x38596f._0x49a3e3),_0x52a7b0[_0x3793f7(bdy_0x38596f._0x3fadaa,bdy_0x38596f._0x161fdd)]=_0x3793f7(bdy_0x38596f._0x2a0a2f,bdy_0x38596f._0x26f105),_0x52a7b0[_0x3793f7(bdy_0x38596f._0x1893ae,bdy_0x38596f._0x5e798d)]=cookie,_0x52a7b0[_0x3793f7(bdy_0x38596f._0x43827c,bdy_0x38596f._0x382f96)]=_0x3793f7(bdy_0x38596f._0x52aee0,bdy_0x38596f._0x10b161),_0x52a7b0[_0x3793f7(bdy_0x38596f._0x28e849,bdy_0x38596f._0x225f77)]=_0x3edb97[_0x3793f7(bdy_0x38596f._0x550c65,bdy_0x38596f._0x325ce7)],_0x52a7b0[_0x3793f7(bdy_0x38596f._0x3696df,bdy_0x38596f._0x219928)]=$['UA'],_0x52a7b0[_0x3793f7(bdy_0x38596f._0x48c30f,bdy_0x38596f._0x371a2f)]=_0x3793f7(bdy_0x38596f._0x27b3ad,bdy_0x38596f._0x39c13a);const _0x3175b3={'url':_0x3793f7(bdy_0x38596f._0x4883b3,bdy_0x38596f._0x56844f),'body':_0x3793f7(bdy_0x38596f._0x5ca2cc,bdy_0x38596f._0x325adc)+encodeURIComponent(JSON[_0x3793f7(bdy_0x38596f._0x4c544d,bdy_0x38596f._0x4f55f1)](_0x216d18))+_0x3793f7(bdy_0x38596f._0x4a360b,bdy_0x38596f._0x52a710),'headers':_0x52a7b0,'timeout':0x2710};$[_0x3793f7(bdy_0x38596f._0x13e840,bdy_0x38596f._0x219928)](_0x3175b3,(_0x2497d5,_0x1afe43,_0x4dfb00)=>{const _0x72a760=_0x3793f7;try{if(_0x2497d5)!llgeterror&&(console[_0x72a760(bdy_0x4e41eb._0x565c8d,bdy_0x4e41eb._0x44fced)](_0x72a760(bdy_0x4e41eb._0x32156b,bdy_0x4e41eb._0x2a270b)),console[_0x72a760(bdy_0x4e41eb._0x206d10,bdy_0x4e41eb._0x3e02ae)](JSON[_0x72a760(bdy_0x4e41eb._0x2f129e,bdy_0x4e41eb._0x186fe9)](_0x2497d5))),llgeterror=!![];else{llgeterror=![];if(safeGet(_0x4dfb00)){$[_0x72a760(bdy_0x4e41eb._0x28368e,bdy_0x4e41eb._0x3cac53)]=JSON[_0x72a760(bdy_0x4e41eb._0x24e7f9,bdy_0x4e41eb._0x137607)](_0x4dfb00);if($[_0x72a760(bdy_0x4e41eb._0x547673,bdy_0x4e41eb._0x30bd8c)][_0x72a760(bdy_0x4e41eb._0x1bcf38,bdy_0x4e41eb._0x20c953)]){if(_0x72a760(bdy_0x4e41eb._0x6d47b1,bdy_0x4e41eb._0x4d52d8)===_0x72a760(bdy_0x4e41eb._0x3f008a,bdy_0x4e41eb._0x4d97e5))$[_0x72a760(bdy_0x4e41eb._0x4c9fe7,bdy_0x4e41eb._0x4bb0e2)]=$[_0x72a760(bdy_0x4e41eb._0x38e158,bdy_0x4e41eb._0x43f1f1)][_0x72a760(bdy_0x4e41eb._0xcbf06a,bdy_0x4e41eb._0x2d664b)][_0x72a760(bdy_0x4e41eb._0xda126c,bdy_0x4e41eb._0x127fe2)],$[_0x72a760(bdy_0x4e41eb._0x1286df,bdy_0x4e41eb._0x2eaa2f)]=$[_0x72a760(bdy_0x4e41eb._0x273671,bdy_0x4e41eb._0xbac869)][_0x72a760(bdy_0x4e41eb._0x1bcf38,bdy_0x4e41eb._0x20c953)][_0x72a760(bdy_0x4e41eb._0xc46bdd,bdy_0x4e41eb._0xbac869)],$[_0x72a760(bdy_0x4e41eb._0x119316,bdy_0x4e41eb._0x4b76bf)]=$[_0x72a760(bdy_0x4e41eb._0xb15a4f,bdy_0x4e41eb._0x777a24)][_0x72a760(bdy_0x4e41eb._0x5ef626,bdy_0x4e41eb._0x3bdecd)][_0x72a760(bdy_0x4e41eb._0x58f70f,bdy_0x4e41eb._0x2eaa2f)],$[_0x72a760(bdy_0x4e41eb._0x34341b,bdy_0x4e41eb._0xd94aab)]=$[_0x72a760(bdy_0x4e41eb._0x454788,bdy_0x4e41eb._0x105e4c)][_0x72a760(bdy_0x4e41eb._0x1294a0,bdy_0x4e41eb._0x4d97e5)][_0x72a760(bdy_0x4e41eb._0x142820,bdy_0x4e41eb._0x185821)];else{if(_0x2d35d2)return _0xf1a5d9;else _0xfe8a94(-0x344+-0x1*0x9f4+0xd38);}}}}}catch(_0x469f9e){_0x565b7e[_0x72a760(bdy_0x4e41eb._0x32f167,bdy_0x4e41eb._0x10928f)](_0x72a760(bdy_0x4e41eb._0x5aea2b,bdy_0x4e41eb._0x28323f),_0x72a760(bdy_0x4e41eb._0x1c4153,bdy_0x4e41eb._0x2cb00b))?$[_0x72a760(bdy_0x4e41eb._0x37c604,bdy_0x4e41eb._0x1364df)](_0x469f9e,_0x1afe43):_0x44d03a[_0x72a760(bdy_0x4e41eb._0x3cc2bb,bdy_0x4e41eb._0xd74ffa)]=_0x4764f4['rs'][_0x72a760(bdy_0x4e41eb._0x5ddade,bdy_0x4e41eb._0xd9a446)][_0x72a760(bdy_0x4e41eb._0xf76ca5,bdy_0x4e41eb._0x3bdecd)];}finally{if(_0x72a760(bdy_0x4e41eb._0xd2a1ca,bdy_0x4e41eb._0x5aa69b)!==_0x72a760(bdy_0x4e41eb._0x56abcf,bdy_0x4e41eb._0x260fb8))_0x5c16c9();else{_0x1ff665=_0x2fcccb[_0x72a760(bdy_0x4e41eb._0x25e2fb,bdy_0x4e41eb._0x1128a7)](_0x336544);if(_0x4d3faf[_0x72a760(bdy_0x4e41eb._0x236b2f,bdy_0x4e41eb._0x580f28)]==-0x6*-0x7fae7+-0x18026*-0x1f+-0x444a6c)_0x5a9748[_0x72a760(bdy_0x4e41eb._0x415e01,bdy_0x4e41eb._0x127fe2)]=_0x2ea403['rs'][_0x72a760(bdy_0x4e41eb._0x42f872,bdy_0x4e41eb._0x38b759)][_0x72a760(bdy_0x4e41eb._0x3019e6,bdy_0x4e41eb._0x83dc8)]?!![]:![];else{}}}});});}async function fruitnew(_0x58b2ce=-0xd7f+0x905*0x1+0x66e){const bdy_0x459d6d={_0x131b10:'0x338',_0x4a09c6:'Yx4G',_0x37e483:'0x2da',_0x578a0b:'tywS',_0x797ac9:'0x28c',_0x9b28f5:'swYa',_0x1849c5:'0x2f8',_0x230c00:'Jq#d',_0x10b904:'0x28b',_0x511feb:'p1@n',_0x133331:'0x22e',_0x2db9a4:'R)Bk',_0x1ab164:'0x29e',_0x5a36c6:'tc9c',_0x4b809f:'0x2fb',_0x293e34:'&pHw',_0x4c9c8d:'0x325',_0x5b711b:'(^5L',_0x4aaeed:'0x237',_0xe118ac:'Zjjr',_0x4e29da:'0x2df',_0x1b6e53:'AyHW',_0x103eb6:'0x2bd',_0x3168eb:'@RaM',_0x26ace2:'0x313',_0x47b1b5:'#TE3',_0x143c64:'0x1dc',_0x49c565:'Gz(M',_0x7686ff:'0x20a',_0x417b84:'#^)X',_0x3b243e:'0x2c8',_0x7802c4:'0x210',_0x33c9fd:'tywS',_0x40e9dc:'0x27b',_0x3b646d:'0x2ec',_0x2e282f:'@RaM',_0x4fdef7:'0x285',_0x5cd145:'(^5L',_0x5de915:'0x310',_0x4ea923:'UnSc',_0x111324:'0x2dc',_0x2733ce:'o3ro',_0x472f63:'0x224',_0x20e379:'VSVL',_0x27aa01:'0x26d',_0x553408:'KQAa',_0x2e2855:'0x32b',_0x57e88d:'7p@o',_0x58430b:'0x2b1',_0x3c5fc2:'KAL6',_0x5bdabe:'0x21d',_0x523c9a:'jwcz',_0x23f0a7:'0x211',_0x11ea57:'#DB0',_0x7fcf8b:'0x2bb',_0x66645a:'$&Sv'},_0x560431=bdy_0x4d8a20,_0x28c811={};_0x28c811[_0x560431(bdy_0x459d6d._0x131b10,bdy_0x459d6d._0x4a09c6)]=_0x560431(bdy_0x459d6d._0x37e483,bdy_0x459d6d._0x578a0b),_0x28c811[_0x560431(bdy_0x459d6d._0x797ac9,bdy_0x459d6d._0x9b28f5)]=_0x560431(bdy_0x459d6d._0x1849c5,bdy_0x459d6d._0x230c00);const _0x211c91=_0x28c811,_0x4a12e2={};_0x4a12e2[_0x560431(bdy_0x459d6d._0x10b904,bdy_0x459d6d._0x511feb)]=0x1;let _0x48b94e=_0x4a12e2,_0x4c718d={'appId':_0x560431(bdy_0x459d6d._0x133331,bdy_0x459d6d._0x2db9a4),'fn':_0x560431(bdy_0x459d6d._0x1ab164,bdy_0x459d6d._0x5a36c6),'body':_0x48b94e,'apid':_0x560431(bdy_0x459d6d._0x4b809f,bdy_0x459d6d._0x293e34),'ver':$['UA'][_0x560431(bdy_0x459d6d._0x4c9c8d,bdy_0x459d6d._0x5b711b)](';')[-0x2555+-0x68b+0x2be2],'cl':_0x211c91[_0x560431(bdy_0x459d6d._0x4aaeed,bdy_0x459d6d._0xe118ac)],'user':$[_0x560431(bdy_0x459d6d._0x4e29da,bdy_0x459d6d._0x1b6e53)],'code':0x1,'ua':$['UA']};_0x48b94e=await bdy_0x4beb50[_0x560431(bdy_0x459d6d._0x103eb6,bdy_0x459d6d._0x3168eb)](_0x4c718d);const _0x3c7db2={};_0x3c7db2[_0x560431(bdy_0x459d6d._0x26ace2,bdy_0x459d6d._0x47b1b5)]=_0x560431(bdy_0x459d6d._0x143c64,bdy_0x459d6d._0x49c565),_0x3c7db2[_0x560431(bdy_0x459d6d._0x7686ff,bdy_0x459d6d._0x417b84)]=_0x560431(bdy_0x459d6d._0x3b243e,bdy_0x459d6d._0x230c00),_0x3c7db2[_0x560431(bdy_0x459d6d._0x7802c4,bdy_0x459d6d._0x33c9fd)]=_0x211c91[_0x560431(bdy_0x459d6d._0x40e9dc,bdy_0x459d6d._0x293e34)],_0x3c7db2[_0x560431(bdy_0x459d6d._0x3b646d,bdy_0x459d6d._0x2e282f)]=_0x560431(bdy_0x459d6d._0x4fdef7,bdy_0x459d6d._0x5cd145),_0x3c7db2[_0x560431(bdy_0x459d6d._0x5de915,bdy_0x459d6d._0x4ea923)]=$['UA'],_0x3c7db2[_0x560431(bdy_0x459d6d._0x111324,bdy_0x459d6d._0x2733ce)]=_0x560431(bdy_0x459d6d._0x472f63,bdy_0x459d6d._0x20e379),_0x3c7db2[_0x560431(bdy_0x459d6d._0x27aa01,bdy_0x459d6d._0x553408)]=_0x560431(bdy_0x459d6d._0x2e2855,bdy_0x459d6d._0x57e88d),_0x3c7db2[_0x560431(bdy_0x459d6d._0x58430b,bdy_0x459d6d._0x3c5fc2)]=cookie;const _0x508e5a={};_0x508e5a[_0x560431(bdy_0x459d6d._0x5bdabe,bdy_0x459d6d._0x523c9a)]=JD_API_HOST+'?'+_0x48b94e,_0x508e5a[_0x560431(bdy_0x459d6d._0x23f0a7,bdy_0x459d6d._0x11ea57)]=_0x3c7db2,_0x508e5a[_0x560431(bdy_0x459d6d._0x7fcf8b,bdy_0x459d6d._0x66645a)]=0x7530;let _0x45afbe=_0x508e5a;return new Promise(_0x51055a=>{const bdy_0x46c17a={_0xcefba4:'0x2a6',_0x288255:'FP!)'},bdy_0x55170f={_0x323f78:'0x32e',_0x5dfe5e:'YNmL',_0x54dbd1:'0x24e',_0xc106ea:'VSVL',_0x4abab8:'0x23f',_0x302f3f:'Bk##',_0x2d46c8:'0x242',_0x136fda:'0x2d7',_0x3cb764:'@RaM',_0x5613e7:'0x2e2',_0x5778ca:'tywS',_0x30f6fd:'0x226',_0x16b741:'@RaM',_0x2a4e5d:'0x274',_0x5c86ed:'o3ro',_0x4d58a0:'0x2be',_0x354987:'7p@o',_0x16076f:'0x24b',_0x29939e:'DzgY'};setTimeout(()=>{const _0x5eb9c7=bdy_0x467d;$[_0x5eb9c7(bdy_0x46c17a._0xcefba4,bdy_0x46c17a._0x288255)](_0x45afbe,(_0x27dc58,_0x4a5fdb,_0x53b9ea)=>{const _0x2982e7=_0x5eb9c7;try{_0x27dc58?_0x2982e7(bdy_0x55170f._0x323f78,bdy_0x55170f._0x5dfe5e)===_0x2982e7(bdy_0x55170f._0x54dbd1,bdy_0x55170f._0xc106ea)?(console[_0x2982e7(bdy_0x55170f._0x4abab8,bdy_0x55170f._0x302f3f)](_0x2982e7(bdy_0x55170f._0x2d46c8,bdy_0x55170f._0xc106ea)),$[_0x2982e7(bdy_0x55170f._0x136fda,bdy_0x55170f._0x3cb764)](_0x27dc58)):_0x45c55f(-0xa7*0xb+-0x719+0xe*0x105):(_0x53b9ea=JSON[_0x2982e7(bdy_0x55170f._0x5613e7,bdy_0x55170f._0x5778ca)](_0x53b9ea),$[_0x2982e7(bdy_0x55170f._0x30f6fd,bdy_0x55170f._0x16b741)]=_0x53b9ea[_0x2982e7(bdy_0x55170f._0x2a4e5d,bdy_0x55170f._0x5c86ed)]?.[_0x2982e7(bdy_0x55170f._0x4d58a0,bdy_0x55170f._0x354987)]||'');}catch(_0xc8646c){$[_0x2982e7(bdy_0x55170f._0x16076f,bdy_0x55170f._0x29939e)](_0xc8646c,_0x4a5fdb);}finally{_0x51055a(_0x53b9ea);}});},_0x58b2ce);});}async function checkplus(){const bdy_0x5cca33={_0x2d2a55:'0x20b',_0x1cec86:'AyHW',_0x368a8a:'0x2f1',_0x383caf:'tywS',_0x270568:'0x1fb',_0x1228bf:'Jq#d',_0x1f0ea5:'0x284',_0x205742:'E0p(',_0x32622d:'0x257',_0x300284:'nx1H',_0x36099c:'0x296',_0x33604f:'tywS',_0x5341b4:'0x239',_0x40c2e7:'o3ro',_0x446c2e:'0x1e8',_0x305ec1:'thG9',_0x8fe27f:'0x2cd',_0x27ef6b:'0x321',_0x90f610:'Bk##',_0x24c372:'0x31b',_0x370133:'0x2aa',_0x366270:'Qzi(',_0x14a9a8:'0x2ea',_0x450a17:'xAoq',_0x49dc9b:'0x1f8',_0x4251cf:'tacb',_0x49bf38:'0x26c',_0x445dbe:'YNmL',_0x466938:'0x311',_0x290475:'&Svj',_0x1df450:'0x286',_0x229add:'KQAa',_0x1d173e:'0x2ad',_0x14438e:'#TE3',_0x31292c:'0x275',_0x36486c:'7p@o',_0x563b3f:'0x329',_0x2ae3e:'swYa',_0x577e3a:'0x298',_0x1a0256:'Yx4G',_0xa63b5d:'0x2c1',_0x4c5352:'0DcO',_0x45f409:'0x22a',_0x37a480:'Qzi(',_0xdcb0b5:'0x1f3',_0x2604c0:'(^5L',_0x1db972:'0x27d',_0x16eccd:'&Svj',_0x56c101:'0x1f2',_0x598b00:'tc9c',_0x567f61:'0x2f3',_0x50e517:'0x2ae',_0x5433e0:'%v^B',_0x323ef9:'0x30e',_0x2e5e0b:'uBNu',_0x12d387:'0x245',_0x3e2b14:'fli4'},bdy_0x2824f2={_0x212399:'0x28a',_0x119693:'KQAa',_0x2a38ae:'0x2f9',_0xc0f101:'(^5L',_0x336572:'0x1ff',_0x249c90:'dqAF'},bdy_0x10acf9={_0x2da2bd:'0x262',_0x7647c4:'p1@n',_0x4c85e0:'0x27a',_0xfb92c6:'7p@o',_0x4c0fc0:'0x1ec',_0x930345:'Yx4G',_0x57d7f1:'0x216',_0x379970:'dqAF',_0x3193b8:'0x2a9',_0x461938:'Jq#d',_0x32b060:'0x2f6',_0x48a89f:'YNmL',_0x18cf78:'0x30d',_0xe9045:'7p@o',_0x40ed61:'0x280',_0x42dd6b:'swYa',_0x34c72a:'0x2ac',_0x172955:'O[@[',_0x91d2d4:'0x2eb',_0x9829f6:'OQ@V',_0x426439:'0x328',_0x1ec7dc:'CTNW',_0x4420bc:'0x290',_0x86b257:'DzgY',_0x4d4543:'0x250',_0x392b0e:'@RaM',_0x247d22:'0x25f',_0x3d4f8d:'Jq#d',_0x42f445:'0x23b',_0x4b8eb5:'#^)X',_0x409ee5:'0x2a1',_0x470d46:'KQAa',_0x5bc96f:'0x202',_0x578736:'H2@y'},_0x525029=bdy_0x4d8a20,_0x4a3bcc={};_0x4a3bcc[_0x525029(bdy_0x5cca33._0x2d2a55,bdy_0x5cca33._0x1cec86)]=_0x525029(bdy_0x5cca33._0x368a8a,bdy_0x5cca33._0x383caf),_0x4a3bcc[_0x525029(bdy_0x5cca33._0x270568,bdy_0x5cca33._0x1228bf)]=_0x525029(bdy_0x5cca33._0x1f0ea5,bdy_0x5cca33._0x205742);const _0x41dbf7=_0x4a3bcc,_0x9b0de5={};_0x9b0de5[_0x525029(bdy_0x5cca33._0x32622d,bdy_0x5cca33._0x300284)]=_0x525029(bdy_0x5cca33._0x36099c,bdy_0x5cca33._0x33604f),_0x9b0de5[_0x525029(bdy_0x5cca33._0x5341b4,bdy_0x5cca33._0x40c2e7)]=_0x41dbf7[_0x525029(bdy_0x5cca33._0x446c2e,bdy_0x5cca33._0x305ec1)],_0x9b0de5[_0x525029(bdy_0x5cca33._0x8fe27f,bdy_0x5cca33._0x1228bf)]=0x1;let _0x227a64=_0x9b0de5;const _0x293606={};_0x293606[_0x525029(bdy_0x5cca33._0x27ef6b,bdy_0x5cca33._0x90f610)]=_0x525029(bdy_0x5cca33._0x24c372,bdy_0x5cca33._0x305ec1),_0x293606[_0x525029(bdy_0x5cca33._0x370133,bdy_0x5cca33._0x366270)]=_0x525029(bdy_0x5cca33._0x14a9a8,bdy_0x5cca33._0x450a17),_0x293606[_0x525029(bdy_0x5cca33._0x49dc9b,bdy_0x5cca33._0x4251cf)]=_0x227a64,_0x293606[_0x525029(bdy_0x5cca33._0x49bf38,bdy_0x5cca33._0x445dbe)]=_0x41dbf7[_0x525029(bdy_0x5cca33._0x466938,bdy_0x5cca33._0x290475)],_0x293606[_0x525029(bdy_0x5cca33._0x1df450,bdy_0x5cca33._0x229add)]=$[_0x525029(bdy_0x5cca33._0x1d173e,bdy_0x5cca33._0x14438e)],_0x293606[_0x525029(bdy_0x5cca33._0x31292c,bdy_0x5cca33._0x36486c)]=0x1,_0x293606['ua']=$['UA'];let _0xd26aba=_0x293606;_0x227a64=await bdy_0x3ac7b4[_0x525029(bdy_0x5cca33._0x563b3f,bdy_0x5cca33._0x2ae3e)](_0xd26aba);const _0x43e1c8={};_0x43e1c8[_0x525029(bdy_0x5cca33._0x577e3a,bdy_0x5cca33._0x1a0256)]=$['UA'],_0x43e1c8[_0x525029(bdy_0x5cca33._0xa63b5d,bdy_0x5cca33._0x4c5352)]=cookie,_0x43e1c8[_0x525029(bdy_0x5cca33._0x45f409,bdy_0x5cca33._0x37a480)]=_0x525029(bdy_0x5cca33._0xdcb0b5,bdy_0x5cca33._0x2604c0),_0x43e1c8[_0x525029(bdy_0x5cca33._0x1db972,bdy_0x5cca33._0x16eccd)]=_0x525029(bdy_0x5cca33._0x56c101,bdy_0x5cca33._0x598b00);const _0x1e7c16={};_0x1e7c16[_0x525029(bdy_0x5cca33._0x567f61,bdy_0x5cca33._0x450a17)]=_0x525029(bdy_0x5cca33._0x50e517,bdy_0x5cca33._0x5433e0),_0x1e7c16[_0x525029(bdy_0x5cca33._0x323ef9,bdy_0x5cca33._0x2e5e0b)]=_0x227a64,_0x1e7c16[_0x525029(bdy_0x5cca33._0x12d387,bdy_0x5cca33._0x3e2b14)]=_0x43e1c8;let _0x571eb9=_0x1e7c16;return new Promise(async _0x345aea=>{const _0x3d5ac4=_0x525029,_0x174917={};_0x174917[_0x3d5ac4(bdy_0x2824f2._0x212399,bdy_0x2824f2._0x119693)]=_0x3d5ac4(bdy_0x2824f2._0x2a38ae,bdy_0x2824f2._0xc0f101);const _0x5e5344=_0x174917;$[_0x3d5ac4(bdy_0x2824f2._0x336572,bdy_0x2824f2._0x249c90)](_0x571eb9,async(_0x356d6b,_0x4af0ec,_0x47ef0b)=>{const _0x11b345=_0x3d5ac4;try{if(_0x356d6b)_0x11b345(bdy_0x10acf9._0x2da2bd,bdy_0x10acf9._0x7647c4)!==_0x11b345(bdy_0x10acf9._0x4c85e0,bdy_0x10acf9._0xfb92c6)?(console[_0x11b345(bdy_0x10acf9._0x4c0fc0,bdy_0x10acf9._0x930345)](''+JSON[_0x11b345(bdy_0x10acf9._0x57d7f1,bdy_0x10acf9._0x379970)](_0x356d6b)),console[_0x11b345(bdy_0x10acf9._0x3193b8,bdy_0x10acf9._0x461938)](_0x11b345(bdy_0x10acf9._0x32b060,bdy_0x10acf9._0x48a89f))):_0x1be3b5[_0x11b345(bdy_0x10acf9._0x18cf78,bdy_0x10acf9._0xe9045)](_0x11b345(bdy_0x10acf9._0x40ed61,bdy_0x10acf9._0x42dd6b));else{if(_0x11b345(bdy_0x10acf9._0x34c72a,bdy_0x10acf9._0x172955)===_0x5e5344[_0x11b345(bdy_0x10acf9._0x91d2d4,bdy_0x10acf9._0x9829f6)]){_0x47ef0b=JSON[_0x11b345(bdy_0x10acf9._0x426439,bdy_0x10acf9._0x1ec7dc)](_0x47ef0b);if(_0x47ef0b[_0x11b345(bdy_0x10acf9._0x4420bc,bdy_0x10acf9._0x86b257)]==-0x24a84b+-0x3327d9+-0x1c7aef*-0x4)$[_0x11b345(bdy_0x10acf9._0x4d4543,bdy_0x10acf9._0x392b0e)]=_0x47ef0b['rs'][_0x11b345(bdy_0x10acf9._0x247d22,bdy_0x10acf9._0x3d4f8d)][_0x11b345(bdy_0x10acf9._0x42f445,bdy_0x10acf9._0x4b8eb5)]?!![]:![];else{}}else _0x2202eb[_0x11b345(bdy_0x10acf9._0x409ee5,bdy_0x10acf9._0x470d46)](_0x333ebf,_0xc59bd4);}}catch(_0x4d784d){$[_0x11b345(bdy_0x10acf9._0x5bc96f,bdy_0x10acf9._0x578736)](_0x4d784d,_0x4af0ec);}finally{_0x345aea();}});});}function bdy_0x5853c0(_0x490645){const bdy_0x5744ed={_0x108aa8:'0x1d4',_0x3aac47:'Pv4j',_0x1af40e:'0x1ea',_0x2d9b24:'&pHw',_0xc2b553:'0x295',_0x10952f:'o3ro',_0x3207ed:'0x1f4',_0x443eb8:'0DcO',_0x4a6949:'0x253',_0x3a2093:'#DB0',_0xe9adac:'0x293',_0x304874:'YNmL'},bdy_0xdb71fa={_0x2b8aab:'0x234',_0x1828d4:'H2@y',_0x558544:'0x1d8',_0x12be35:'KQAa',_0x57a166:'0x315',_0x365f0e:'jwcz',_0x16ebbc:'0x200',_0x37d4d8:'VSVL',_0xfe3507:'0x2b5',_0x53e498:'0x1fd',_0x351a33:'(^5L',_0xd2b0c6:'0x212',_0x3babb0:'Zjjr',_0x551a50:'0x1fa',_0x206f88:'OXQ!',_0x5788c7:'0x2ff',_0x48fdcf:'0x251',_0x3c387c:'H2@y',_0x602453:'0x21c',_0x2738e6:'t*2b',_0x498c5d:'0x204',_0x337319:'oAeX',_0x3bfd43:'0x31d',_0x5bf806:'tywS',_0x31c521:'0x322',_0x35d682:'tywS',_0x1a0c66:'0x1d5',_0x12e279:'$&Sv',_0x5c0f08:'0x255',_0x52f458:'o3ro',_0x33f7ba:'0x2bc',_0x4de473:'FP!)',_0x330519:'0x2b9',_0x160edd:'jwcz',_0x201232:'0x2f4',_0x190444:'#DB0',_0x48d761:'0x1e5',_0x88ce9b:'Jq#d',_0x2ec3bf:'0x319',_0x1731ae:'Tf4t',_0x287b14:'0x304',_0x1c46d1:'Yx4G'},bdy_0x52d416={_0x407e4d:'0x2c4',_0x4a3241:'Zjjr',_0x3bf364:'0x201',_0x174f56:'AyHW',_0x188058:'0x206',_0x2f5e6c:'w[f8',_0xde2c9b:'0x222',_0x57bd81:'uBNu',_0x18fd0f:'0x1f1',_0x2114e:'t*2b',_0x864cf2:'0x2c9',_0x1644dc:'KAL6'},_0x59f125=bdy_0x4d8a20,_0x36e8cb={};_0x36e8cb[_0x59f125(bdy_0x5744ed._0x108aa8,bdy_0x5744ed._0x3aac47)]=_0x59f125(bdy_0x5744ed._0x1af40e,bdy_0x5744ed._0x2d9b24),_0x36e8cb[_0x59f125(bdy_0x5744ed._0xc2b553,bdy_0x5744ed._0x10952f)]=function(_0x39d9ff,_0x580071){return _0x39d9ff!==_0x580071;},_0x36e8cb[_0x59f125(bdy_0x5744ed._0x3207ed,bdy_0x5744ed._0x443eb8)]=function(_0x2c3031,_0x3a028b){return _0x2c3031/_0x3a028b;},_0x36e8cb[_0x59f125(bdy_0x5744ed._0x4a6949,bdy_0x5744ed._0x3a2093)]=function(_0x2e05c3,_0x2f1cdf){return _0x2e05c3===_0x2f1cdf;},_0x36e8cb[_0x59f125(bdy_0x5744ed._0xe9adac,bdy_0x5744ed._0x304874)]=function(_0x498038,_0x129d0c){return _0x498038+_0x129d0c;};const _0x8ab1c5=_0x36e8cb;function _0x2c4c8c(_0x411151){const _0xe04dbf=_0x59f125;if(typeof _0x411151===_0xe04dbf(bdy_0xdb71fa._0x2b8aab,bdy_0xdb71fa._0x1828d4))return function(_0x26d54f){}[_0xe04dbf(bdy_0xdb71fa._0x558544,bdy_0xdb71fa._0x12be35)](_0xe04dbf(bdy_0xdb71fa._0x57a166,bdy_0xdb71fa._0x365f0e))[_0xe04dbf(bdy_0xdb71fa._0x16ebbc,bdy_0xdb71fa._0x37d4d8)](_0xe04dbf(bdy_0xdb71fa._0xfe3507,bdy_0xdb71fa._0x365f0e));else _0x8ab1c5[_0xe04dbf(bdy_0xdb71fa._0x53e498,bdy_0xdb71fa._0x351a33)]((''+_0x8ab1c5[_0xe04dbf(bdy_0xdb71fa._0xd2b0c6,bdy_0xdb71fa._0x3babb0)](_0x411151,_0x411151))[_0xe04dbf(bdy_0xdb71fa._0x551a50,bdy_0xdb71fa._0x206f88)],0xb82+-0x1228+-0x1*-0x6a7)||_0x8ab1c5[_0xe04dbf(bdy_0xdb71fa._0x5788c7,bdy_0xdb71fa._0x1828d4)](_0x411151%(0x375+0x5*-0xfa+0x7*0x37),0xa27+-0xd1b+-0x6*-0x7e)?_0xe04dbf(bdy_0xdb71fa._0x48fdcf,bdy_0xdb71fa._0x3c387c)!==_0xe04dbf(bdy_0xdb71fa._0x602453,bdy_0xdb71fa._0x2738e6)?_0x109bee():function(){const _0x122388=_0xe04dbf;if(_0x122388(bdy_0x52d416._0x407e4d,bdy_0x52d416._0x4a3241)===_0x8ab1c5[_0x122388(bdy_0x52d416._0x3bf364,bdy_0x52d416._0x174f56)])_0x793a68[_0x122388(bdy_0x52d416._0x188058,bdy_0x52d416._0x2f5e6c)](_0x122388(bdy_0x52d416._0xde2c9b,bdy_0x52d416._0x57bd81)),_0x41adac[_0x122388(bdy_0x52d416._0x18fd0f,bdy_0x52d416._0x2114e)](_0x87b2e7[_0x122388(bdy_0x52d416._0x864cf2,bdy_0x52d416._0x1644dc)](_0x580e9a));else return!![];}[_0xe04dbf(bdy_0xdb71fa._0x498c5d,bdy_0xdb71fa._0x337319)](_0x8ab1c5[_0xe04dbf(bdy_0xdb71fa._0x3bfd43,bdy_0xdb71fa._0x5bf806)](_0xe04dbf(bdy_0xdb71fa._0x31c521,bdy_0xdb71fa._0x35d682),_0xe04dbf(bdy_0xdb71fa._0x1a0c66,bdy_0xdb71fa._0x12e279)))[_0xe04dbf(bdy_0xdb71fa._0x5c0f08,bdy_0xdb71fa._0x52f458)](_0xe04dbf(bdy_0xdb71fa._0x33f7ba,bdy_0xdb71fa._0x4de473)):function(){return![];}[_0xe04dbf(bdy_0xdb71fa._0x330519,bdy_0xdb71fa._0x160edd)](_0xe04dbf(bdy_0xdb71fa._0x201232,bdy_0xdb71fa._0x190444)+_0xe04dbf(bdy_0xdb71fa._0x48d761,bdy_0xdb71fa._0x88ce9b))[_0xe04dbf(bdy_0xdb71fa._0x2ec3bf,bdy_0xdb71fa._0x1731ae)](_0xe04dbf(bdy_0xdb71fa._0x287b14,bdy_0xdb71fa._0x1c46d1));_0x2c4c8c(++_0x411151);}try{if(_0x490645)return _0x2c4c8c;else _0x2c4c8c(0x1*0x24dd+0x1*0xe87+-0x3364);}catch(_0x23e0f9){}}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
            "open-url": "https://bean.m.jd.com/bean/signIndex.action"
        });
        return;
    }
    for (i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
            $.index = i + 1;
            $.beanCount = 0;
            $.incomeBean = 0;
            $.expenseBean = 0;
            $.todayIncomeBean = 0;
            $.todayOutcomeBean = 0;
            $.errorMsg = '';
            $.isLogin = true;
            $.nickName = '';
            $.levelName = '';
            $.message = '';
            $.balance = 0;
            $.expiredBalance = 0;
            $.JdFarmProdName = '';
            $.JdtreeEnergy = 0;
            $.JdtreeTotalEnergy = 0;
            $.treeState = 0;
            $.JdwaterTotalT = 0;
            $.JdwaterD = 0;
            $.JDwaterEveryDayT = 0;
            $.JDtotalcash = 0;
            $.jdCash = 0;
            $.isPlusVip = false;
            $.isRealNameAuth = false;
            $.JingXiang = "";
            $.allincomeBean = 0; //月收入
            $.allexpenseBean = 0; //月支出
            $.beanChangeXi = 0;
            $.YunFeiTitle = "";
            $.YunFeiQuan = 0;
            $.YunFeiQuanEndTime = "";
            $.YunFeiTitle2 = "";
            $.YunFeiQuan2 = 0;
            $.YunFeiQuanEndTime2 = "";
            $.JoyRunningAmount = "";
            $.ECardinfo = "";
            $.PlustotalScore = 0;
            $.CheckTime = "";
            $.beanCache = 0;
            $.fruitnewinfo = '';
            $.newfarm_info = '';
            TempBaipiao = "";
            strGuoqi = "";
            $.wyw_score = '';
            $.wb_score = '';

            console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
            $.UA = require('./USER_AGENTS').UARAM();
            await getuserinfo_6dy();
            //await TotalBean2();
            if ($.beanCount == 0) {
                console.log("数据获取失败，等待30秒后重试....")
                await $.wait(30 * 1000);
                await TotalBean();
            }
            if ($.beanCount == 0) {
                console.log("疑似获取失败,等待10秒后用第二个接口试试....")
                await $.wait(10 * 1000);
                var userdata = await getuserinfo();
                if (userdata.code == 1) {
                    $.beanCount = userdata.content.jdBean;
                }
            }


            if (!$.isLogin) {
                await isLoginByX1a0He();
            }
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }

            if (TempBeanCache) {
                for (let j = 0; j < TempBeanCache.length; j++) {
                    if (TempBeanCache[j].pt_pin == $.UserName) {
                        $.CheckTime = TempBeanCache[j].CheckTime;
                        $.beanCache = TempBeanCache[j].BeanNum;
                        break;
                    }
                }
            }

            var llfound = false;
            var timeString = "";
            var nowHour = new Date().getHours();
            var nowMinute = new Date().getMinutes();
            if (nowHour < 10)
                timeString += "0" + nowHour + ":";
            else
                timeString += nowHour + ":";

            if (nowMinute < 10)
                timeString += "0" + nowMinute;
            else
                timeString += nowMinute;

            if (TodayCache) {
                for (let j = 0; j < TodayCache.length; j++) {
                    if (TodayCache[j].pt_pin == $.UserName) {
                        TodayCache[j].CheckTime = timeString;
                        TodayCache[j].BeanNum = $.beanCount;
                        llfound = true;
                        break;
                    }
                }
            }
            if (!llfound) {

                var tempAddCache = {
                    "pt_pin": $.UserName,
                    "CheckTime": timeString,
                    "BeanNum": $.beanCount
                };
                TodayCache.push(tempAddCache);
            }
            await getjdfruitinfo(); //老农场
            await $.wait(1000);
            await fruitnew();
            //await checkplus();
            await Promise.all([
                wanyiwan(),
                wb_info(),
                bean(), //京豆查询
                queryScores(),
                getek(),
                newfarm_info()
            ])

            await showMsg();
            if (intPerSent > 0) {
                if ((i + 1) % intPerSent == 0) {
                    console.log("分段通知条件达成，处理发送通知....");
                    if ($.isNode() && allMessage) {
                        var TempMessage = allMessage;
                        if (strAllNotify)
                            allMessage = strAllNotify + `\n` + allMessage;

                        await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                        }, undefined, TempMessage)
                    }
                    if ($.isNode() && allMessageMonth) {
                        await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                        })
                    }
                    allMessage = "";
                    allMessageMonth = "";
                }

            }
        }
    }

    var str = JSON.stringify(TodayCache, null, 2);
    fs.writeFile(strNewBeanCache, str, function (err) {
        if (err) {
            console.log(err);
            console.log("添加缓存" + TodayDate + ".json失败!");
        } else {
            console.log("添加缓存" + TodayDate + ".json成功!");
        }
    })

    //组1通知
    if (ReceiveMessageGp4) {
        allMessage2Gp4 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp4;
    }
    if (WarnMessageGp4) {
        if (allMessage2Gp4) {
            allMessage2Gp4 = `\n` + allMessage2Gp4;
        }
        allMessage2Gp4 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
    }

    //组2通知
    if (ReceiveMessageGp2) {
        allMessage2Gp2 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp2;
    }
    if (WarnMessageGp2) {
        if (allMessage2Gp2) {
            allMessage2Gp2 = `\n` + allMessage2Gp2;
        }
        allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
    }

    //组3通知
    if (ReceiveMessageGp3) {
        allMessage2Gp3 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp3;
    }
    if (WarnMessageGp3) {
        if (allMessage2Gp3) {
            allMessage2Gp3 = `\n` + allMessage2Gp3;
        }
        allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
    }

    //其他通知
    if (allReceiveMessage) {
        allMessage2 = `【⏰商品白嫖清单⏰】\n` + allReceiveMessage;
    }
    if (allWarnMessage) {
        if (allMessage2) {
            allMessage2 = `\n` + allMessage2;
        }
        allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
    }

    if (intPerSent > 0) {
        //console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
        if (allMessage || allMessageMonth) {
            console.log("分段通知收尾，处理发送通知....");
            if ($.isNode() && allMessage) {
                var TempMessage = allMessage;
                if (strAllNotify)
                    allMessage = strAllNotify + `\n` + allMessage;

                await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                }, undefined, TempMessage)
            }
            if ($.isNode() && allMessageMonth) {
                await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }
    } else {

        if ($.isNode() && allMessageGp2) {
            var TempMessage = allMessageGp2;
            if (strAllNotify)
                allMessageGp2 = strAllNotify + `\n` + allMessageGp2;
            await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp3) {
            var TempMessage = allMessageGp3;
            if (strAllNotify)
                allMessageGp3 = strAllNotify + `\n` + allMessageGp3;
            await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp4) {
            var TempMessage = allMessageGp4;
            if (strAllNotify)
                allMessageGp4 = strAllNotify + `\n` + allMessageGp4;
            await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessage) {
            var TempMessage = allMessage;
            if (strAllNotify)
                allMessage = strAllNotify + `\n` + allMessage;

            await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }

        if ($.isNode() && allMessageMonthGp2) {
            await notify.sendNotify(`京东月资产统计#2`, `${allMessageMonthGp2}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonthGp3) {
            await notify.sendNotify(`京东月资产统计#3`, `${allMessageMonthGp3}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonthGp4) {
            await notify.sendNotify(`京东月资产统计#4`, `${allMessageMonthGp4}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonth) {
            await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
    }

    if ($.isNode() && allMessage2Gp2) {
        allMessage2Gp2 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#2", `${allMessage2Gp2}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2Gp3) {
        allMessage2Gp3 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#3", `${allMessage2Gp3}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2Gp4) {
        allMessage2Gp4 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#4", `${allMessage2Gp4}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2) {
        allMessage2 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒", `${allMessage2}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }

})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })
async function showMsg() {
    //if ($.errorMsg)
    //return
    ReturnMessageTitle = "";
    ReturnMessage = "";
    var strsummary = "";
    if (MessageUserGp2) {
        userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
    }
    if (MessageUserGp3) {
        userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
    }
    if (MessageUserGp4) {
        userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
    }

    if (userIndex2 != -1) {
        IndexGp2 += 1;
        ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex3 != -1) {
        IndexGp3 += 1;
        ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex4 != -1) {
        IndexGp4 += 1;
        ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
        IndexAll += 1;
        ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}`;
    }


    if ($.JingXiang||1) {
        if ($.isRealNameAuth)
            if (cookie.includes("app_open"))
                ReturnMessageTitle += `(wskey已实名)\n`;
            else
                ReturnMessageTitle += `(已实名)\n`;
        else
            if (cookie.includes("app_open"))
                ReturnMessageTitle += `(wskey未实名)\n`;
            else
                ReturnMessageTitle += `(未实名)\n`;

        ReturnMessage += `【账号信息】`;
        if ($.isPlusVip) {
            ReturnMessage += `Plus会员`;
        } else {
            ReturnMessage += `普通会员`;
        }
        if ($.PlustotalScore)
            ReturnMessage += `(${$.PlustotalScore}分)`
        ReturnMessage += `\n`;
        //ReturnMessage += `,京享值${$.JingXiang}\n`;
    } else {
        ReturnMessageTitle += `\n`;
    }
    if (llShowMonth) {
        ReturnMessageMonth = ReturnMessage;
        ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
        ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

        console.log(ReturnMessageMonth);

        if (userIndex2 != -1) {
            allMessageMonthGp2 += ReturnMessageMonth + `\n`;
        }
        if (userIndex3 != -1) {
            allMessageMonthGp3 += ReturnMessageMonth + `\n`;
        }
        if (userIndex4 != -1) {
            allMessageMonthGp4 += ReturnMessageMonth + `\n`;
        }
        if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
            allMessageMonth += ReturnMessageMonth + `\n`;
        }
        if ($.isNode() && WP_APP_TOKEN_ONE) {
            try {
                await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
            } catch {
                $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
            }
        }

    }
    if (EnableCheckBean) {
        if (checkbeanDetailMode == 0) {
            ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
            strsummary += `收${$.todayIncomeBean}豆,`;
            if ($.todayOutcomeBean != 0) {
                ReturnMessage += `,支${$.todayOutcomeBean}豆`;
            }
            ReturnMessage += `\n`;
            ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;

            if ($.expenseBean != 0) {
                ReturnMessage += `,支${$.expenseBean}豆`;
            }
            ReturnMessage += `\n`;
        } else {
            if (TempBeanCache) {
                ReturnMessage += `【京豆变动】${$.beanCount - $.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;
                strsummary += `变动${$.beanCount - $.beanCache}豆,`;
                ReturnMessage += `\n`;
            }
            else {
                ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
                ReturnMessage += `\n`;
            }
        }
    }


    if ($.beanCount) {
        ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
    } else {
        if ($.levelName || $.JingXiang)
            ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
        else {
            ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
        }
    }

    if ($.JDtotalcash) {
        ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
    }
    if ($.ECardinfo)
        ReturnMessage += `【礼品卡额】${$.ECardinfo}元\n`;

    if ($.JoyRunningAmount)
        ReturnMessage += `【汪汪赛跑】${$.JoyRunningAmount}元\n`;

    if ($.JdFarmProdName != "") {
        if ($.JdtreeEnergy != 0) {
            if ($.treeState === 2 || $.treeState === 3) {
                ReturnMessage += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                TempBaipiao += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                if (userIndex2 != -1) {
                    ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
            } else {
                //if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
                //ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
                //} else {
                ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

                //}
            }
        } else {
            if ($.treeState === 0) {
                TempBaipiao += `【老农场】水果领取后未重新种植!\n`;

                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }

            } else if ($.treeState === 1) {
                ReturnMessage += `【老农场】${$.JdFarmProdName}种植中...\n`;
            } else {
                TempBaipiao += `【老农场】状态异常!\n`;
                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                //ReturnMessage += `【老农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
            }
        }
    }
    if ($.fruitnewinfo){
        //ReturnMessage += `【新农场】种植进度${$.fruitnewinfo}\n`;
        if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeFullStage == 5 ){
            ReturnMessage += `【新农场】种植完成!\n`;
            TempBaipiao += `【新农场】种植完成!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】种植完成，去领取吧 (新农场)\n`;
        } else if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeCurrentState === 0){
            ReturnMessage += '【新农场】种植进度' + $.fruitnewinfo.treeFullStage +'/5(' + $.fruitnewinfo.currentProcess+'%)\n';
        } else if ($.fruitnewinfo.treeFullStage === 0){
            ReturnMessage += `【新农场】未种植!\n`;
            //TempBaipiao += `【新农场】未种植!\n`;
            //allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】未种植，快去种植吧! (新农场)\n`;
        } else {
            ReturnMessage += '【新农场】可能枯萎了，请重新种植！\n';
        }
    } 
    if ($.newfarm_info){
            //ReturnMessage += `【新农场】奖品未兑换!\n`;
            TempBaipiao += `【新农场】奖品未兑换!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】\n ${$.newfarm_info}\n 快去兑换吧 (新农场)\n`;        
    }

    let dwscore = await dwappinfo();
    if (dwscore) {
        let dwappex = await dwappexpire();
        ReturnMessage += `【话费积分】${dwscore}`;
        if (dwappex) {
            ReturnMessage += `(近7日将过期${dwappex})`;
        }
        ReturnMessage += `\n`;
    }
    let marketcard = await marketCard();
    if (marketcard && marketcard.balance != '0.00' ) {
        ReturnMessage += `【超市卡】${marketcard.balance}元`;
        if (marketcard.expirationGiftAmountDes) {
            ReturnMessage += `(${marketcard.expirationGiftAmountDes})`;
        }
        ReturnMessage += `\n`;
    }
    if ($.wyw_score != '' ) {
        ReturnMessage += `【玩一玩奖票】${$.wyw_score}个`;
        ReturnMessage += `\n`;
    }
    if ($.wb_score != '' ) {
        ReturnMessage += `【汪贝余额】${$.wb_score}${$.wb_expire!=0?'(近7日将过期'+$.wb_expire+')':''}`;
        ReturnMessage += `\n`;
    }    
    if ($.jdCash) {
        ReturnMessage += `【其他信息】`;

        if ($.jdCash) {
            ReturnMessage += `领现金:${$.jdCash}元`;
        }

        ReturnMessage += `\n`;

    }

    if (strGuoqi) {
        ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
        ReturnMessage += `${strGuoqi}`;
    }

    ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
    ReturnMessage += `${$.message}`;
    strsummary += `红包${$.balance}元`
    if ($.YunFeiQuan) {
        var strTempYF = "【免运费券】" + $.YunFeiQuan + "张";
        if ($.YunFeiQuanEndTime)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime + ")";
        strTempYF += "\n";
        ReturnMessage += strTempYF
    }
    if ($.YunFeiQuan2) {
        var strTempYF2 = "【免运费券】" + $.YunFeiQuan2 + "张";
        if ($.YunFeiQuanEndTime2)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime2 + ")";
        strTempYF2 += "\n";
        ReturnMessage += strTempYF2
    }

    if (userIndex2 != -1) {
        allMessageGp2 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex3 != -1) {
        allMessageGp3 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex4 != -1) {
        allMessageGp4 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
        allMessage += ReturnMessageTitle + ReturnMessage + `\n------\n`;
    }

    console.log(`${ReturnMessageTitle + ReturnMessage}`);

    if ($.isNode() && WP_APP_TOKEN_ONE) {
        var strTitle = "京东资产统计";
        if ($.JingXiang||1) {
            if ($.isRealNameAuth)
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey已实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(已实名)\n` + ReturnMessage;
            else
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey未实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(未实名)\n` + ReturnMessage;

        } else {
            ReturnMessage = `【账号名称】${$.nickName || $.UserName}\n` + ReturnMessage;
        }
        if (TempBaipiao) {
            TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
            ReturnMessage = TempBaipiao + `\n` + ReturnMessage;
        }

        ReturnMessage += RemainMessage;

        if (strAllNotify)
            ReturnMessage = strAllNotify + `\n` + ReturnMessage;
        try {
            await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`, undefined, strsummary);
        } catch {
            $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
        }
    }

    //$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {

    if (EnableCheckBean && checkbeanDetailMode == 0) {

        // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
        // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
        // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

        //前一天的0:0:0时间戳
        const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
        // 今天0:0:0时间戳
        const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
        let page = 1,
            t = 0,
            yesterdayArr = [],
            todayArr = [];
        do {
            let response = await getJingBeanBalanceDetail(page);
            await $.wait(1000);
            // console.log(`第${page}页: ${JSON.stringify(response)}`);
            if (response && response.code === "0") {
                page++;
                let detailList = response.jingDetailList;
                if (detailList && detailList.length > 0) {
                    for (let item of detailList) {
                        const date = item.date.replace(/-/g, '/') + "+08:00";
                        if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                            todayArr.push(item);
                        } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                            //昨日的
                            yesterdayArr.push(item);
                        } else if (tm > new Date(date).getTime()) {
                            //前天的
                            t = 1;
                            break;
                        }
                    }
                } else {
                    $.errorMsg = `数据异常`;
                    $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
                    t = 1;
                }
            } else if (response && response.code === "3") {
                console.log(`cookie已过期，或者填写不规范，跳出`)
                t = 1;
            } else {
                console.log(`未知情况：${JSON.stringify(response)}`);
                console.log(`未知情况，跳出`)
                t = 1;
            }
        } while (t === 0);
        for (let item of yesterdayArr) {
            if (Number(item.amount) > 0) {
                $.incomeBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.expenseBean += Number(item.amount);
            }
        }
        for (let item of todayArr) {
            if (Number(item.amount) > 0) {
                $.todayIncomeBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.todayOutcomeBean += Number(item.amount);
            }
        }
        $.todayOutcomeBean = -$.todayOutcomeBean;
        $.expenseBean = -$.expenseBean;
    }

    if (EnableOverBean) {
        await jingBeanDetail(); //过期京豆	    
    }
    await redPacket();
    if (EnableChaQuan)
        await getCoupon();
}

async function Monthbean() {
    let time = new Date();
    let year = time.getFullYear();
    let month = parseInt(time.getMonth()); //取上个月
    if (month == 0) {
        //一月份，取去年12月，所以月份=12，年份减1
        month = 12;
        year -= 1;
    }

    //开始时间 时间戳
    let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
    console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

    //结束时间 时间戳
    if (month == 12) {
        //取去年12月，进1个月，所以月份=1，年份加1
        month = 1;
        year += 1;
    }
    let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
    console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

    let allpage = 1,
        allt = 0,
        allyesterdayArr = [];
    do {
        let response = await getJingBeanBalanceDetail(allpage);
        await $.wait(1000);
        // console.log(`第${allpage}页: ${JSON.stringify(response)}`);
        if (response && response.code === "0") {
            allpage++;
            let detailList = response.jingDetailList;
            if (detailList && detailList.length > 0) {
                for (let item of detailList) {
                    const date = item.date.replace(/-/g, '/') + "+08:00";
                    if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
                        //日期区间内的京豆记录
                        allyesterdayArr.push(item);
                    } else if (start > new Date(date).getTime()) {
                        //前天的
                        allt = 1;
                        break;
                    }
                }
            } else {
                $.errorMsg = `数据异常`;
                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
                allt = 1;
            }
        } else if (response && response.code === "3") {
            console.log(`cookie已过期，或者填写不规范，跳出`)
            allt = 1;
        } else {
            console.log(`未知情况：${JSON.stringify(response)}`);
            console.log(`未知情况，跳出`)
            allt = 1;
        }
    } while (allt === 0);

    for (let item of allyesterdayArr) {
        if (Number(item.amount) > 0) {
            $.allincomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            $.allexpenseBean += Number(item.amount);
        }
    }

}


function apptaskUrl(functionId = "", body = "") {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        body,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': '',
            'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 10000
    }
}

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.UA
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                            //$.isPlusVip=data['isPlusVip'];
                            $.isRealNameAuth = data['isRealNameAuth'];
                            $.beanCount = (data['base'] && data['base'].jdNum) || 0;
                            $.JingXiang = (data['base'] && data['base'].jvalue) || 0;
                        } else {
                            $.nickName = $.UserName
                        }



                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function TotalBean2() {
    return new Promise(async (resolve) => {
        const options = {
            url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
            headers: {
                Cookie: cookie,
                'content-type': `application/x-www-form-urlencoded`,
                Connection: `keep-alive`,
                'Accept-Encoding': `gzip,compress,br,deflate`,
                Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
                Host: `wxapp.m.jd.com`,
                'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
            },
            timeout: 10000
        };
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    if (data) {
                        data = JSON.parse(data);

                        if (!data.user) {
                            return;
                        }
                        const userInfo = data.user;
                        if (userInfo) {
                            if (!$.nickName)
                                $.nickName = userInfo.petName;
                            if ($.beanCount == 0) {
                                $.beanCount = userInfo.jingBean;
                            }
                            $.JingXiang = userInfo.uclass;
                        }
                    } else {
                        $.log('京东服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e);
            }
            finally {
                resolve();
            }
        });
    });
}
function wanyiwan() {
    return new Promise(async (resolve) => {
        const options = {
            url: `http://api.m.jd.com/client.action`,
            body: `functionId=wanyiwan_exchange_page&appid=signed_wh5&body={"version":1}&&networkType=wifi&client=ios&clientVersion=${$.UA.split(';')[2]}&t=${Date.now()}`,
            headers: {
                Cookie: cookie,
                'content-type': `application/x-www-form-urlencoded`,
                // 'Accept-Encoding': `gzip,compress,br,deflate`,
                Origin: `https://pro.m.jd.com`,
                Referer: `https://pro.m.jd.com/`,
                'User-Agent': $.UA,
            },
            timeout: 30000
        };
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    if (data) {
                        data = $.toObj(data);
                        if (data.data.bizCode == 0) {
                            $.wyw_score = data.data.result.score || 0;
                        }

                    } else {
                        $.log('服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e);
            }
            finally {
                resolve();
            }
        });
    });
}
function wb_info() {
    return new Promise(async (resolve) => {
        const options = {
            url: `http://api.m.jd.com/functionId=atop_channel_my_score`,
            body: `appid=jd-super-market&functionId=atop_channel_my_score&client=m&body=%7B%22bizCode%22%3A%22cn_retail_jdsupermarket%22%2C%22scenario%22%3A%22sign%22%2C%22babelChannel%22%3A%22ttt1%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D&t=${Date.now()}`,
            headers: {
                Cookie: cookie,
                'content-type': `application/x-www-form-urlencoded`,
                // 'Accept-Encoding': `gzip,compress,br,deflate`,
                Origin: `https://pro.m.jd.com`,
                Referer: `https://pro.m.jd.com/`,
                'User-Agent': $.UA,
            },
            timeout: 30000
        };
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    if (data) {
                        data = $.toObj(data);
                        if (data.success) {
                            try{
                               $.wb_score = data.data.floorData.items[0].restScore || 0; 
                               $.wb_expire = data.data.floorData.items[0].nexp || 0; 
                            } catch{}
                        }

                    } else {
                        $.log('服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e);
            }
            finally {
                resolve();
            }
        });
    });
}
function isLoginByX1a0He() {
    return new Promise((resolve) => {
        const options = {
            url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
            headers: {
                "Cookie": cookie,
                "referer": "https://h5.m.jd.com/",
                "User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
            },
            timeout: 10000
        }
        $.get(options, (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data.islogin === "1") {
                        console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
                    } else if (data.islogin === "0") {
                        $.isLogin = false;
                        console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
                    } else {
                        console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
                        $.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
                    }
                }
            } catch (e) {
                console.log(e);
            }
            finally {
                resolve();
            }
        });
    });
}

function getJingBeanBalanceDetail(page) {
    return new Promise(async resolve => {
        const options = {
            "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
            "body": `body=${escape(JSON.stringify({ "pageSize": "20", "page": page.toString() }))}&appid=ld`,
            "headers": {
                'User-Agent': $.UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie,
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        // console.log(data)
                    } else {
                        // console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function jingBeanDetail() {
    return new Promise(async resolve => {
        setTimeout(async () => {
            var strsign = "";
            if (epsignurl) {
                strsign = await getepsign('jingBeanDetail', { "pageSize": "20", "page": "1" });
                strsign = strsign.body;
            }
            else
                strsign = await dyx.getbody('jingBeanDetail', { "pageSize": "20", "page": "1" });

            const options = {
                "url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
                "body": strsign,
                "headers": {
                    'User-Agent': $.UA,
                    'Host': 'api.m.jd.com',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie,
                }
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} jingBeanDetail API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            data = JSON.parse(data);
                            if (data?.others?.jingBeanExpiringInfo?.detailList) {
                                const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
                                detailList.map(item => {
                                    strGuoqi += `【${(item['eventMassage']).replace("即将过期京豆", "").replace("年", "-").replace("月", "-").replace("日", "")}】过期${item['amount']}豆\n`;
                                })
                            }
                        } else {
                            console.log(`jingBeanDetail 京东服务器返回空数据`)
                        }
                    }
                } catch (e) {
                    if (epsignurl)
                        $.logErr(e, resp)
                    else
                        console.log("因为没有指定带ep的Sign,获取过期豆子信息次数多了就会失败.")
                } finally {
                    resolve(data);
                }
            })
        }, 0 * 1000);
    })
}

function getepsign(n, o, t = "sign") {
    let e = {
        url: epsignurl,
        form: {
            functionId: n, body: $.toStr(o),
        }, headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };
    return new Promise(n => {
        $.post(e, async (o, t, e) => {
            try {
                o ? console.log(o) : e = JSON.parse(e)
                if (e.code === 200 && e.data) {
                    n({ body: e.data.convertUrlNew })
                }
            } catch (n) {
                $.logErr(n, t)
            } finally {
                n({ body: e.convertUrlNew })
            }
        })
    })
}

function getSignfromNolan(functionId, body) {
    var strsign = '';
    let data = {
        "fn": functionId,
        "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
            followRedirect: false,
            headers: {
                'Accept': '*/*',
                "accept-encoding": "gzip, deflate, br",
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
        $.post(url, async (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data && data.body) {
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(strsign);
            }
        })
    })
}


function redPacket() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
            "headers": {
                'Host': 'api.m.jd.com',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://h5.m.jd.com/',
                'Accept-Encoding': 'gzip, deflate, br',
                "Cookie": cookie,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`redPacket API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        $.jxRed = 0,
                            $.jsRed = 0,
                            $.jdRed = 0,
                            $.jdhRed = 0,
                            $.jdwxRed = 0,
                            $.jdGeneralRed = 0,
                            $.jxRedExpire = 0,
                            $.jsRedExpire = 0,
                            $.jdRedExpire = 0,
                            $.jdhRedExpire = 0;
                        $.jdwxRedExpire = 0,
                            $.jdGeneralRedExpire = 0

                        let t = new Date();
                        t.setDate(t.getDate() + 1);
                        t.setHours(0, 0, 0, 0);
                        t = parseInt((t - 1) / 1000) * 1000;

                        for (let vo of data.hongBaoList || []) {
                            if (vo.orgLimitStr) {
                                if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
                                    $.jxRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jxRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("购物小程序")) {
                                    $.jdwxRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdwxRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("京东商城")) {
                                    $.jdRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
                                    $.jsRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jsRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
                                    $.jdhRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdhRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                }
                            }
                            $.jdGeneralRed += parseFloat(vo.balance)
                            if (vo['endTime'] === t) {
                                $.jdGeneralRedExpire += parseFloat(vo.balance)
                            }
                        }

                        $.balance = ($.jxRed + $.jsRed + $.jdRed + $.jdhRed + $.jdwxRed + $.jdGeneralRed).toFixed(2);
                        $.jxRed = $.jxRed.toFixed(2);
                        $.jsRed = $.jsRed.toFixed(2);
                        $.jdRed = $.jdRed.toFixed(2);
                        $.jdhRed = $.jdhRed.toFixed(2);
                        $.jdwxRed = $.jdwxRed.toFixed(2);
                        $.jdGeneralRed = $.jdGeneralRed.toFixed(2);
                        $.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire + $.jdhRedExpire + $.jdwxRedExpire + $.jdGeneralRedExpire).toFixed(2);
                        $.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
                        if ($.jxRed > 0) {
                            if ($.jxRedExpire > 0)
                                $.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜红包】${$.jxRed}元 \n`;
                        }

                        if ($.jsRed > 0) {
                            if ($.jsRedExpire > 0)
                                $.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜特价】${$.jsRed}元 \n`;
                        }

                        if ($.jdRed > 0) {
                            if ($.jdRedExpire > 0)
                                $.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京东红包】${$.jdRed}元 \n`;
                        }

                        if ($.jdhRed > 0) {
                            if ($.jdhRedExpire > 0)
                                $.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【健康红包】${$.jdhRed}元 \n`;
                        }

                        if ($.jdwxRed > 0) {
                            if ($.jdwxRedExpire > 0)
                                $.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【微信小程序】${$.jdwxRed}元 \n`;
                        }

                        if ($.jdGeneralRed > 0) {
                            if ($.jdGeneralRedExpire > 0)
                                $.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【全平台通用】${$.jdGeneralRed}元 \n`;

                        }

                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data);
            }
        })
    })
}

function getCoupon() {
    return new Promise(resolve => {
        let options = {
            url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
            headers: {
                'authority': 'wq.jd.com',
                "User-Agent": $.UA,
                'accept': '*/*',
                'referer': 'https://wqs.jd.com/',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cookie': cookie
            },
            timeout: 10000
        }
        $.get(options, async (err, resp, data) => {
            try {
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
                $.platFormInfo = "";
                for (let i = 0; i < useable.length; i++) {
                    //console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota <= 100 && useable[i].coupontype === 1) {
                            //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;

                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);
                            if (useable[i].quota > useable[i].discount + 5 && useable[i].discount < 2)
                                continue
                            $.message += `【全品类券】满${decquota}减${decdisc}元`;

                            if (useable[i].endTime < $.todayEndTime) {
                                $.message += `(今日过期,${$.platFormInfo})\n`;
                            } else if (useable[i].endTime < $.tomorrowEndTime) {
                                $.message += `(明日将过期,${$.platFormInfo})\n`;
                            } else {
                                $.message += `(${$.platFormInfo})\n`;
                            }

                        }
                    }
                    if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
                        if (!$.YunFeiTitle) {
                            $.YunFeiTitle = useable[i].couponTitle;
                            $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.YunFeiQuan += 1;
                        } else {
                            if ($.YunFeiTitle == useable[i].couponTitle) {
                                $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                                $.YunFeiQuan += 1;
                            } else {
                                if (!$.YunFeiTitle2)
                                    $.YunFeiTitle2 = useable[i].couponTitle;

                                if ($.YunFeiTitle2 == useable[i].couponTitle) {
                                    $.YunFeiQuanEndTime2 = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                                    $.YunFeiQuan2 += 1;
                                }
                            }

                        }

                    }
                    if (useable[i].couponTitle.indexOf('特价版APP活动') > -1 && useable[i].limitStr == '仅可购买活动商品') {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].coupontype === 1) {
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;
                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);

                            $.message += `【特价版券】满${decquota}减${decdisc}元`;

                            if (useable[i].endTime < $.todayEndTime) {
                                $.message += `(今日过期,${$.platFormInfo})\n`;
                            } else if (useable[i].endTime < $.tomorrowEndTime) {
                                $.message += `(明日将过期,${$.platFormInfo})\n`;
                            } else {
                                $.message += `(${$.platFormInfo})\n`;
                            }

                        }

                    }
                    //8是支付券， 7是白条券
                    if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                            continue;
                        }

                        if (useable[i].couponStyle == 8) {
                            $.couponType = "支付立减";
                        } else {
                            $.couponType = "白条优惠";
                        }
                        if (useable[i].discount < useable[i].quota)
                            $.message += `【${$.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
                        else
                            $.message += `【${$.couponType}】立减${useable[i].discount}元`;
                        if (useable[i].platFormInfo)
                            $.platFormInfo = useable[i].platFormInfo;

                        //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');

                        if (useable[i].endTime < $.todayEndTime) {
                            $.message += `(今日过期,${$.platFormInfo})\n`;
                        } else if (useable[i].endTime < $.tomorrowEndTime) {
                            $.message += `(明日将过期,${$.platFormInfo})\n`;
                        } else {
                            $.message += `(${$.platFormInfo})\n`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            $.get(taskfruitUrl(function_id, body), (err, resp, data) => {
                try {
                    if (err) {
                        console.log('\n老农场: API查询请求失败 ‼️‼️')
                        console.log(JSON.stringify(err));
                        console.log(`function_id:${function_id}`)
                        $.logErr(err);
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data.code == "400") {
                                console.log('老农场: ' + data.message);
                                llgeterror = true;
                            }
                            else
                                $.JDwaterEveryDayT = data.firstWaterInit.totalWaterTimes;
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                }
                finally {
                    resolve(data);
                }
            })
        }, timeout)
    })
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        //await jdfruitRequest('taskInitForFarm', {
        //    "version": 14,
        //    "channel": 1,
        //    "babelChannel": "120"
        //});
        //
        //if (llgeterror)
        //	return
        //
        await fruitinfo();
        if (llgeterror) {
            console.log(`老农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await fruitinfo();
        }
        if (llgeterror) {
            console.log(`老农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
    return;
}

async function getjdfruit() {
    return new Promise(resolve => {
        const option = {
            url: `${JD_API_HOST}?functionId=initForFarm`,
            body: `body=${escape(JSON.stringify({ "version": 4 }))}&appid=wh5&clientVersion=9.1.0`,
            headers: {
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "cookie": cookie,
                "origin": "https://home.m.jd.com",
                "pragma": "no-cache",
                "referer": "https://home.m.jd.com/myJd/newhome.action",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000
        };
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    if (!llgeterror) {
                        console.log('\n老农场: API查询请求失败 ‼️‼️');
                        console.log(JSON.stringify(err));
                    }
                    llgeterror = true;
                } else {
                    llgeterror = false;
                    if (safeGet(data)) {
                        $.farmInfo = JSON.parse(data)
                        if ($.farmInfo.farmUserPro) {
                            $.JdFarmProdName = $.farmInfo.farmUserPro.name;
                            $.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
                            $.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
                            $.treeState = $.farmInfo.treeState;
                            let waterEveryDayT = $.JDwaterEveryDayT;
                            let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; //一共还需浇多少次水
                            let waterD = Math.ceil(waterTotalT / waterEveryDayT);

                            $.JdwaterTotalT = waterTotalT;
                            $.JdwaterD = waterD;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve();
            }
        })
    })
}

function taskfruitUrl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
        headers: {
            "Host": "api.m.jd.com",
            "Accept": "*/*",
            "Origin": "https://carry.m.jd.com",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://carry.m.jd.com/",
            "Cookie": cookie
        },
        timeout: 10000
    }
}

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}



function taskcashUrl(functionId, body = {}) {
    const struuid = randomString(16);
    let nowTime = Date.now();
    let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
    let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
    const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
    let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
    let strurl = JD_API_HOST + "api?functionId=" + functionId + "&body=" + `${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=` + struuid + `&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
    return {
        url: strurl,
        headers: {
            'Host': "api.m.jd.com",
            'accept': "*/*",
            'kernelplatform': "RN",
            'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
            'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
            'Cookie': cookie
        },
        timeout: 10000
    }
}

function randomString(e) {
    e = e || 32;
    let t = "0123456789abcdef",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

Date.prototype.Format = function (fmt) {
    var e,
        n = this,
        d = fmt,
        l = {
            "M+": n.getMonth() + 1,
            "d+": n.getDate(),
            "D+": n.getDate(),
            "h+": n.getHours(),
            "H+": n.getHours(),
            "m+": n.getMinutes(),
            "s+": n.getSeconds(),
            "w+": n.getDay(),
            "q+": Math.floor((n.getMonth() + 3) / 3),
            "S+": n.getMilliseconds()
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t,
                a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
function timeFormat(time) {
    let date;
    if (time) {
        date = new Date(time)
    } else {
        date = new Date();
    }
    return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetDateTime(date) {

    var timeString = "";

    var timeString = date.getFullYear() + "-";
    if ((date.getMonth() + 1) < 10)
        timeString += "0" + (date.getMonth() + 1) + "-";
    else
        timeString += (date.getMonth() + 1) + "-";

    if ((date.getDate()) < 10)
        timeString += "0" + date.getDate() + " ";
    else
        timeString += date.getDate() + " ";

    if ((date.getHours()) < 10)
        timeString += "0" + date.getHours() + ":";
    else
        timeString += date.getHours() + ":";

    if ((date.getMinutes()) < 10)
        timeString += "0" + date.getMinutes() + ":";
    else
        timeString += date.getMinutes() + ":";

    if ((date.getSeconds()) < 10)
        timeString += "0" + date.getSeconds();
    else
        timeString += date.getSeconds();

    return timeString;
}

async function getuserinfo() {
    var body = [{ "pin": "$cooMrdGatewayUid$" }];
    var ua = `jdapp;iPhone;${random(["11.1.0", "10.5.0", "10.3.6"])};${random(["13.5", "14.0", "15.0"])};${uuidRandom()};network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,6;addressid/7565095847;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;

    let config = {
        url: 'https://lop-proxy.jd.com/JingIntegralApi/userAccount',
        body: JSON.stringify(body),
        headers: {
            "host": "lop-proxy.jd.com",
            "jexpress-report-time": Date.now().toString(),
            "access": "H5",
            "source-client": "2",
            "accept": "application/json, text/plain, */*",
            "d_model": "iPhone11,6",
            "accept-encoding": "gzip",
            "lop-dn": "jingcai.jd.com",
            "user-agent": ua,
            "partner": "",
            "screen": "375*812",
            "cookie": cookie,
            "x-requested-with": "XMLHttpRequest",
            "version": "1.0.0",
            "uuid": randomNumber(10),
            "clientinfo": "{\"appName\":\"jingcai\",\"client\":\"m\"}",
            "d_brand": "iPhone",
            "appparams": "{\"appid\":158,\"ticket_type\":\"m\"}",
            "sdkversion": "1.0.7",
            "area": area(),
            "client": "iOS",
            "referer": "https://jingcai-h5.jd.com/",
            "eid": "",
            "osversion": random(["13.5", "14.0", "15.0"]),
            "networktype": "wifi",
            "jexpress-trace-id": uuid(),
            "origin": "https://jingcai-h5.jd.com",
            "app-key": "jexpress",
            "event-id": uuid(),
            "clientversion": random(["11.1.0", "10.5.0", "10.3.6"]),
            "content-type": "application/json;charset=utf-8",
            "build": "167541",
            "biz-type": "service-monitor",
            "forcebot": "0"
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                //console.log(data)
                if (err) {
                    console.log(err)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data || '');
            }
        })
    })
}
function dwappinfo() {
    let ts = Date.now();
    let opt = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        body: JSON.stringify({ "t": ts, "channelSource": "txzs", "encStr": CR.MD5(ts + 'e9c398ffcb2d4824b4d0a703e38yffdd').toString() }),
        headers: {
            'Origin': 'https://txsm-m.jd.com',
            'Content-Type': 'application/json',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            let ccc = '';
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappinfo 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code == 200) {
                        ccc = data.data.balanceNum;
                    } else {
                        console.log(data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(ccc);
            }
        })
    })
}
function dwappexpire() {
    let opt = {
        url: `https://api.m.jd.com/api?functionId=DATAWALLET_USER_QUERY_EXPIRED_SCORE&appid=h5-sep&body=%7B%22expireDayNum%22%3A7%7D&client=m&clientVersion=6.0.0`,
        headers: {
			'Origin':'https://prodev.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappexpire 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 200) {
                        data = data.data.expireNum;
						
                    } else {
                        //console.log(data.msg);
                        data = '';
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function getek() {
    let opt = {
        url: `https://mygiftcard.jd.com/giftcard/queryChannelUserCard`,
        //body: `appid=wh5&clientVersion=1.0.0&functionId=wanrentuan_superise_send&body={"channel":2}&area=2_2813_61130_0`,
        headers: {
            //'Host': 'api.m.jd.com',
            'Origin': 'https://o.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.get(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getek请求失败!!!!`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 000000) {
                        $.ECardinfo = Number(data.data.totalAmount);
                    } else {
                        console.log(data.msg)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data)
            }
        })
    })
}
function marketCard() {
    let opt = {
        url: `https://api.m.jd.com/atop_channel_marketCard_cardInfo`,
        body: `appid=jd-super-market&t=${Date.now()}&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D`,
        headers: {
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    let carddata = '';
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`marketCard 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.success) {
                        carddata = data.data?.floorData?.items ? data.data?.floorData?.items[0].marketCardVO : '';
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(carddata);
            }
        })
    })
}
function newfarm_info() {
    let opt = {
        url: `https://api.m.jd.com/client.action`,
        body: `appid=signed_wh5&client=android&clientVersion=12.4.2&screen=393*0&wqDefault=false&build=99108&osVersion=12&t=${Date.now()}&body={"version":1,"type":1}&functionId=farm_award_detail`,
        headers: {
            'Origin': 'https://h5.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`newfarm_info 请求失败，请检查网路重试`)
                } else {
                    
                    data = JSON.parse(data);
                    if (data.data.success) {
                        if (data.data.result.plantAwards && data.data.result.plantAwards.length > 0){
                            for (let i of  data.data.result.plantAwards ){
                                if (i.awardStatus == 1){
                                    $.newfarm_info = `${i.skuName} -> ${i.exchangeRemind}`;
                                }
                            }
                        }
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

function area() {
    let i = getRand(1, 30)
    let o = getRand(70, 3000)
    let x = getRand(900, 60000)
    let g = getRand(600, 30000)
    let a = i + '_' + o + '_' + x + '_' + g;
    return a
};
function getRand(min, max) {
    return parseInt(Math.random() * (max - min)) + min;
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
};
function uuidRandom() {
    return Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(len) {
    let chars = '0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return Date.now() + str;
}


function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s {
        constructor(t) {
            this.env = t
        }
        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            }
                : t;
            let s = this.get;
            return "POST" === e && (s = this.post),
                new Promise((e, i) => {
                    s.call(this, t, (t, s, r) => {
                        t ? i(t) : e(s)
                    })
                })
        }
        get(t) {
            return this.send.call(this.env, t)
        }
        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }
    return new class {
        constructor(t, e) {
            this.name = t,
                this.http = new s(this),
                this.data = null,
                this.dataFile = "box.dat",
                this.logs = [],
                this.isMute = !1,
                this.isNeedRewrite = !1,
                this.logSeparator = "\n",
                this.startTime = (new Date).getTime(),
                Object.assign(this, e),
                this.log("", `🔔${this.name}, 开始!`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }
        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i)
                try {
                    s = JSON.parse(this.getdata(t))
                } catch { }
            return s
        }
        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }
        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20,
                    r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"),
                    n = {
                        url: `http://${h}/v1/scripting/evaluate`,
                        body: {
                            script_text: t,
                            mock_type: "cron",
                            timeout: r
                        },
                        headers: {
                            "X-Key": o,
                            Accept: "*/*"
                        }
                    };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode())
                return {}; {
                this.fs = this.fs ? this.fs : require("fs"),
                    this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i)
                    return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"),
                    this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r)
                    return s;
            return r
        }
        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                    o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                        s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                        s = this.setval(JSON.stringify(o), i)
                }
            } else
                s = this.setval(t, e);
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"),
                this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
                this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
                t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }
        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
                this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                    "X-Surge-Skip-Scripting": !1
                })), $httpClient.get(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                        e(t, s, i)
                })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                    hints: !1
                })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                    try {
                        if (t.headers["set-cookie"]) {
                            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                            s && this.ckjar.setCookieSync(s, null),
                                e.cookieJar = this.ckjar
                        }
                    } catch (t) {
                        this.logErr(t)
                    }
                }).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                }))
        }
        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
                this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                    "X-Surge-Skip-Scripting": !1
                })), $httpClient.post(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                        e(t, s, i)
                });
            else if (this.isQuanX())
                t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                    hints: !1
                })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i)
                new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                        : this.isSurge() ? {
                            url: t
                        }
                            : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e),
                    s && t.push(s),
                    i && t.push(i),
                    console.log(t.join("\n")),
                    this.logs = this.logs.concat(t)
            }
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator))
        }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
                this.log(),
                (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }
        (t, e)
}