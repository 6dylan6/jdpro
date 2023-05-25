/*
45 3-21/6 * * * jx_aid_cashback.js
new Env('京喜购物返红包助力')
*/

let common = require("./function/common");
let $ = new common.env('京喜购物返红包助力');
let min = 5,
    help = $.config[$.filename(__filename)] || Math.min(min, $.config.JdMain) || min;
$.setOptions({
    headers: {
        'content-type': 'application/json',
        'user-agent': 'jdapp;iPhone;9.4.6;14.2;965af808880443e4c1306a54afdd5d5ae771de46;network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone8,4;addressid/;supportBestPay/0;appBuild/167618;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'referer': 'https://happy.m.jd.com/babelDiy/Zeus/3ugedFa7yA6NhxLN5gw2L3PF9sQC/index.html?asid=287215626&un_area=12_904_905_57901&lng=117.612969135975&lat=23.94014745198865',
    }
});
$.readme = `
在京喜下单,如订单有购物返现,脚本会自动查询返现groupid并予以助力,目前每个账号每天能助力3次
44 */6 * * * task ${$.runfile}
export ${$.runfile}=2  #如需增加被助力账号,在这边修改人数
`
eval(common.eval.mainEval($));
async function prepare() {
    let url = `https://wq.jd.com/bases/orderlist/list?order_type=3&start_page=1&last_page=0&page_size=10&callersource=newbiz&t=${$.timestamp}&traceid=&g_ty=ls&g_tk=606717070`
    for (let j of cookies['help']) {
        $.setCookie(j);
        await $.curl(url)
        try {
            for (let k of $.source.orderList) {
                try {
                    let orderid = k.parentId != '0' ? k.parentId : k.orderId
                    let url = `https://wq.jd.com/fanxianzl/zhuli/QueryGroupDetail?isquerydraw=1&orderid=${orderid}&groupid=&sceneval=2&g_login_type=1&g_ty=ls`
                    let dec = await jxAlgo.dec(url)
                    await $.curl(dec.url)
                    let now = parseInt(new Date() / 1000)
                    let end = $.source.data.groupinfo.end_time
                    if (end > now && $.source.data.groupinfo.openhongbaosum != $.source.data.groupinfo.totalhongbaosum) {
                        let groupid = $.source.data.groupinfo.groupid;
                        $.sharecode.push({
                            'groupid': groupid
                        })
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }
}
async function main(id) {
    common.assert(id.groupid, '没有可助力ID')
    let url = `http://wq.jd.com/fanxianzl/zhuli/Help?groupid=${id.groupid}&_stk=groupid&_ste=2&g_ty=ls&g_tk=1710198667&sceneval=2&g_login_type=1`
    let dec = await jxAlgo.dec(url)
    await $.curl(dec.url)
    console.log($.source.data.prize.discount)
}