//20 8 10 4 * jd_farm_automation.js

console.log('默认种2级，如需调整请设置变量 M_JD_FARM_LEVEL\n使用率不高，指定（desi）账号运行\n')
const {Env} = require('./function/magic');
const $ = new Env('农场自动种植兑换');
let level = process.env.M_JD_FARM_LEVEL ? process.env.M_JD_FARM_LEVEL * 1 : 2
$.logic = async function () {
    let info = await api('initForFarm',
        {"version": 11, "channel": 3, "babelChannel": 0});
    if (info.code !== '0') {
        $.log('可能没开通农场或者黑透了！！！')
        return
    }
    if (info.farmUserPro.treeState === 1) {
        return
    }
    if (info.farmUserPro.treeState === 2) {
        await $.wait(1000, 3000)
        $.log(`${info.farmUserPro.name},种植时间：${$.formatDate(
            info.farmUserPro.createTime)}`);
        //成熟了
        let coupon = await api('gotCouponForFarm',
            {"version": 11, "channel": 3, "babelChannel": 0});
        $.log(coupon)
        info = await api('initForFarm',
            {"version": 11, "channel": 3, "babelChannel": 0});
    }
    if (info.farmUserPro.treeState === 3) {
        let hongBao = info.myHongBaoInfo.hongBao;
        $.putMsg(`已兑换${hongBao.discount}红包，${$.formatDate(hongBao.endTime)}过期`)
    }
    
    let element = info.farmLevelWinGoods[level][0] || 0;
    await $.wait(1000, 3000)
    if (element) {
    info = await api('choiceGoodsForFarm', {
        "imageUrl": '',
        "nickName": '',
        "shareCode": '',
        "goodsType": element.type,
        "type": "0",
        "version": 11,
        "channel": 3,
        "babelChannel": 0
    });
    if (info.code * 1 === 0) {
        $.putMsg(`\n再次种植【${info.farmUserPro.name}】`)
    }
    let a = await api('gotStageAwardForFarm',
        {"type": "4", "version": 11, "channel": 3, "babelChannel": 0});
    let b = await api('waterGoodForFarm',
        {"type": "", "version": 11, "channel": 3, "babelChannel": 0});
    let c = await api('gotStageAwardForFarm',
        {"type": "1", "version": 11, "channel": 3, "babelChannel": 0}); 
    }else{
    $.log('种子已抢完，下次在来!!!\n')
    } 
};

$.run({wait: [2000, 3000]}).catch(reason => $.log(reason));

// noinspection DuplicatedCode
async function api(fn, body) {
    let url = `https://api.m.jd.com/client.action?functionId=${fn}&body=${JSON.stringify(
        body)}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓请求头↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    let headers = {
        "Cookie": $.cookie,
        "Connection": "keep-alive",
        "Accept": "*/*",
        "Host": "api.m.jd.com",
        'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.4(0x1800042c) NetType/4G Language/zh_CN miniProgram`,
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn"
    }
    let {data} = await $.request(url, headers)
    await $.wait(1000, 3000)
    return data;
}



