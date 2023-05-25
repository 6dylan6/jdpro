/*
东东农场助力
20 2,5 * * * jd_farm_help.js
updatetime:2022/12/22
dlan
变量
epxort FRUIT_DELAY = '1000',设置等待时间(毫秒)，默认请求5次接口等待60秒（60000）
*/
const $ = new Env('东东农场-助力');
let cookiesArr = [], cookie = '', jdFruitShareArr = [], isBox = false, notify, newShareCodes, allMessage = '';
//助力好友分享码(最多3个,否则后面的助力失败),原因:京东农场每人每天只有3次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // 这个列表填入你要助力的好友的shareCode
    ''
]

let message = '', subTitle = '', fulled=[], option = {}, isFruitFinished = false;
const retainWater = 100;//保留水滴大于多少g,默认100g;
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let jdFruitBeanCard = false;//农场使用水滴换豆卡(如果出现限时活动时100g水换20豆,此时比浇水划算,推荐换豆),true表示换豆(不浇水),false表示不换豆(继续浇水),脚本默认是浇水
let randomCount = $.isNode() ? 20 : 5;
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const delay = process.env.FRUIT_DELAY||60000;
const urlSchema = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html%22%20%7D`;
$.reqnum=1;
!(async () => {
    await requireConfig();
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            await TotalBean();
            console.log(`开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            message = '';
            subTitle = '';
            option = {};
            $.UA = require('./USER_AGENTS').UARAM();
            await shareCodesFormat();
            await jdFruit();
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })
async function jdFruit() {
    subTitle = `【京东账号${$.index}🆔】${$.nickName || $.UserName}`;
    try {
        await initForFarm();
        if ($.farmInfo.farmUserPro) {
            await masterHelpShare();//助力好友
            await doDailyTask();
        } else {
            console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify($.farmInfo)}`);
            message = `【数据异常】请手动登录京东app查看此账号${$.name}是否正常`;
        }
    } catch (e) {
        console.log(`任务执行异常，请检查执行日志 ‼️‼️`);
        $.logErr(e);
        const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;

    }
    await showMsg();
}
async function doDailyTask() {

    await getAwardInviteFriend();

    await turntableFarm()//天天抽奖得好礼
}
async function predictionFruit() {
    console.log('开始预测水果成熟时间\n');
    await initForFarm();
    await taskInitForFarm();
    let waterEveryDayT = $.farmTask.totalWaterTaskInit.totalWaterTaskTimes;//今天到到目前为止，浇了多少次水
    message += `【今日共浇水】${waterEveryDayT}次\n`;
    message += `【剩余 水滴】${$.farmInfo.farmUserPro.totalEnergy}g💧\n`;
    message += `【水果进度】${(($.farmInfo.farmUserPro.treeEnergy / $.farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${$.farmInfo.farmUserPro.treeEnergy / 10}次,还需${($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10}次\n`
    if ($.farmInfo.toFlowTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
        message += `【开花进度】再浇水${$.farmInfo.toFlowTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
    } else if ($.farmInfo.toFruitTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
        message += `【结果进度】再浇水${$.farmInfo.toFruitTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
    }
    // 预测n天后水果课可兑换功能
    let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水

    let waterD = Math.ceil(waterTotalT / waterEveryDayT);

    message += `【预测】${waterD === 1 ? '明天' : waterD === 2 ? '后天' : waterD + '天之后'}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果🍉\n`
}
//浇水十次
async function doTenWater() {
    jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
    if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
        jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
    }
    await myCardInfoForFarm();
    const { fastCard, doubleCard, beanCard, signCard } = $.myCardInfoRes;
    if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match(`限时翻倍`) && beanCard > 0) {
        console.log(`您设置的是使用水滴换豆卡，且背包有水滴换豆卡${beanCard}张, 跳过10次浇水任务`)
        return
    }
    if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
        console.log(`\n准备浇水十次`);
        let waterCount = 0;
        isFruitFinished = false;
        for (; waterCount < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit - $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
            console.log(`第${waterCount + 1}次浇水`);
            await waterGoodForFarm();
            console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
            if ($.waterResult.code === '0') {
                console.log(`剩余水滴${$.waterResult.totalEnergy}g`);
                if ($.waterResult.finished) {
                    // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
                    isFruitFinished = true;
                    break
                } else {
                    if ($.waterResult.totalEnergy < 10) {
                        console.log(`水滴不够，结束浇水`)
                        break
                    }
                    await gotStageAward();//领取阶段性水滴奖励
                }
            } else {
                console.log('浇水出现失败异常,跳出不在继续浇水')
                break;
            }
        }
        if (isFruitFinished) {
            option['open-url'] = urlSchema;
            $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
            $.done();
            if ($.isNode()) {
                await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
            }
        }
    } else {
        console.log('\n今日已完成10次浇水任务\n');
    }
}
//领取首次浇水奖励
async function getFirstWaterAward() {
    await taskInitForFarm();
    //领取首次浇水奖励
    if (!$.farmTask.firstWaterInit.f && $.farmTask.firstWaterInit.totalWaterTimes > 0) {
        await firstWaterTaskForFarm();
        if ($.firstWaterReward.code === '0') {
            console.log(`【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`);
            // message += `【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`;
        } else {
            // message += '【首次浇水奖励】领取奖励失败,详询日志\n';
            console.log(`领取首次浇水奖励结果:  ${JSON.stringify($.firstWaterReward)}`);
        }
    } else {
        console.log('首次浇水奖励已领取\n')
    }
}
//领取十次浇水奖励
async function getTenWaterAward() {
    //领取10次浇水奖励
    if (!$.farmTask.totalWaterTaskInit.f && $.farmTask.totalWaterTaskInit.totalWaterTaskTimes >= $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
        await totalWaterTaskForFarm();
        if ($.totalWaterReward.code === '0') {
            console.log(`【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`);
            // message += `【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`;
        } else {
            // message += '【十次浇水奖励】领取奖励失败,详询日志\n';
            console.log(`领取10次浇水奖励结果:  ${JSON.stringify($.totalWaterReward)}`);
        }
    } else if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
        // message += `【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`;
        console.log(`【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`);
    }
    console.log('finished 水果任务完成!');
}
//再次浇水
async function doTenWaterAgain() {
    console.log('开始检查剩余水滴能否再次浇水再次浇水\n');
    await initForFarm();
    let totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
    console.log(`剩余水滴${totalEnergy}g\n`);
    await myCardInfoForFarm();
    const { fastCard, doubleCard, beanCard, signCard } = $.myCardInfoRes;
    console.log(`背包已有道具:\n快速浇水卡:${fastCard === -1 ? '未解锁' : fastCard + '张'}\n水滴翻倍卡:${doubleCard === -1 ? '未解锁' : doubleCard + '张'}\n水滴换京豆卡:${beanCard === -1 ? '未解锁' : beanCard + '张'}\n加签卡:${signCard === -1 ? '未解锁' : signCard + '张'}\n`)
    if (totalEnergy >= 100 && doubleCard > 0) {
        //使用翻倍水滴卡
        for (let i = 0; i < new Array(doubleCard).fill('').length; i++) {
            await userMyCardForFarm('doubleCard');
            console.log(`使用翻倍水滴卡结果:${JSON.stringify($.userMyCardRes)}`);
        }
        await initForFarm();
        totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
    }
    if (signCard > 0) {
        //使用加签卡
        for (let i = 0; i < 3; i++) {
            await userMyCardForFarm('signCard');
            console.log(`使用加签卡结果:${JSON.stringify($.userMyCardRes)}`);
        }
        await initForFarm();
        totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
    }
    jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
    if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
        jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
    }
    if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match('限时翻倍')) {
        console.log(`\n您设置的是水滴换豆功能,现在为您换豆`);
        if (totalEnergy >= 100 && $.myCardInfoRes.beanCard > 0) {
            //使用水滴换豆卡
            await userMyCardForFarm('beanCard');
            console.log(`使用水滴换豆卡结果:${JSON.stringify($.userMyCardRes)}`);
            if ($.userMyCardRes.code === '0') {
                message += `【水滴换豆卡】获得${$.userMyCardRes.beanCount}个京豆\n`;
                return
            }
        } else {
            console.log(`您目前水滴:${totalEnergy}g,水滴换豆卡${$.myCardInfoRes.beanCard}张,暂不满足水滴换豆的条件,为您继续浇水`)
        }
    }    

    if (process.env.FRUIT_FAST_CARD && totalEnergy > 100 && $.myCardInfoRes.fastCard > 0) {
      //使用快速浇水卡
          for (let i=0;i<new Array(fastCard).fill('').length;i++){
                  await userMyCardForFarm('fastCard');
                  console.log(`使用快速浇水卡结果:${JSON.stringify($.userMyCardRes)}`);
                  if ($.userMyCardRes.code === '0') {
                       console.log(`已使用快速浇水卡浇水${$.userMyCardRes.waterEnergy}g`);
                  }  
                  if ($.userMyCardRes.treeFinished){
                       break;
                  }
                  await $.wait(500);
                  await initForFarm();
                  totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
        }
    }
    // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
    let overageEnergy = totalEnergy - retainWater;
    if (totalEnergy >= ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy)) {
        //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
        isFruitFinished = false;
        for (let i = 0; i < ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; i++) {
            await waterGoodForFarm();
            await $.wait(500);
            console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify($.waterResult)}`);
            if ($.waterResult.code === '0') {
                console.log('\n浇水10g成功\n');
                if ($.waterResult.finished) {
                    // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
                    isFruitFinished = true;
                    break
                } else {
                    console.log(`目前水滴【${$.waterResult.totalEnergy}】g,继续浇水，水果马上就可以兑换了`)
                }
            } else {
                console.log('浇水出现失败异常,跳出不在继续浇水')
                break;
            }
        }
        if (isFruitFinished) {
            option['open-url'] = urlSchema;
            $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
            $.done();
            if ($.isNode()) {
                await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
            }
        }
    } else if (overageEnergy >= 10) {
        console.log("目前剩余水滴：【" + totalEnergy + "】g，可继续浇水");
        isFruitFinished = false;
        for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
            await waterGoodForFarm();
            console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
            if ($.waterResult.code === '0') {
                console.log(`\n浇水10g成功,剩余${$.waterResult.totalEnergy}\n`)
                if ($.waterResult.finished) {
                    // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
                    isFruitFinished = true;
                    break
                } else {
                    await gotStageAward()
                }
            } else {
                console.log('浇水出现失败异常,跳出不在继续浇水')
                break;
            }
        }
        if (isFruitFinished) {
            option['open-url'] = urlSchema;
            $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
            $.done();
            if ($.isNode()) {
                await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
            }
        }
    } else {
        console.log("目前剩余水滴：【" + totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务")
    }
}
//领取阶段性水滴奖励
function gotStageAward() {
    return new Promise(async resolve => {
        if ($.waterResult.waterStatus === 0 && $.waterResult.treeEnergy === 10) {
            console.log('果树发芽了,奖励30g水滴');
            await gotStageAwardForFarm('1');
            console.log(`浇水阶段奖励1领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
            if ($.gotStageAwardForFarmRes.code === '0') {
                // message += `【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`;
                console.log(`【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`);
            }
        } else if ($.waterResult.waterStatus === 1) {
            console.log('果树开花了,奖励40g水滴');
            await gotStageAwardForFarm('2');
            console.log(`浇水阶段奖励2领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
            if ($.gotStageAwardForFarmRes.code === '0') {
                // message += `【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
                console.log(`【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
            }
        } else if ($.waterResult.waterStatus === 2) {
            console.log('果树长出小果子啦, 奖励50g水滴');
            await gotStageAwardForFarm('3');
            console.log(`浇水阶段奖励3领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`)
            if ($.gotStageAwardForFarmRes.code === '0') {
                // message += `【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
                console.log(`【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
            }
        }
        resolve()
    })
}
//天天抽奖活动
async function turntableFarm() {

        //天天抽奖助力
        console.log('开始天天抽奖--好友助力--每人每天只有三次助力机会.')
        for (let code of newShareCodes) {
            if (code === $.farmInfo.farmUserPro.shareCode) {
                console.log('天天抽奖-不能自己给自己助力\n')
                continue
            }
            await lotteryMasterHelp(code);
            await $.wait(1000)
            // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
            if ($.lotteryMasterHelpRes.helpResult === undefined) break;
            if ($.lotteryMasterHelpRes.helpResult.code === '0') {
                console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`)
            } else if ($.lotteryMasterHelpRes.helpResult.code === '11') {
                console.log(`天天抽奖-不要重复助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`)
            } else if ($.lotteryMasterHelpRes.helpResult.code === '13') {
                console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
                break;
            }
        }
}
//领取额外奖励水滴
async function getExtraAward() {
    await farmAssistInit();
    if ($.farmAssistResult.code === "0") {
        if ($.farmAssistResult.assistFriendList && $.farmAssistResult.assistFriendList.length >= 2) {
            if ($.farmAssistResult.status === 2) {
                let num = 0;
                for (let key of Object.keys($.farmAssistResult.assistStageList)) {
                    let vo = $.farmAssistResult.assistStageList[key]
                    if (vo.stageStaus === 2) {
                        await receiveStageEnergy();
                        await $.wait(500);
                        if ($.receiveStageEnergy.code === "0") {
                            console.log(`成功领取第${Number(key) + 1}段助力奖励：【${$.receiveStageEnergy.amount}】g水`)
                            num += $.receiveStageEnergy.amount
                        }
                    }
                }
                message += `【额外奖励】${num}g水领取成功\n`;
            } else if ($.farmAssistResult.status === 3) {
                console.log("已经领取过8好友助力额外奖励");
                message += `【额外奖励】已被领取过\n`;
            }
        } else {
            console.log("助力好友未达到2个");
            message += `【额外奖励】领取失败,原因：给您助力的人未达2个\n`;
        }
        if ($.farmAssistResult.assistFriendList && $.farmAssistResult.assistFriendList.length > 0) {
            let str = '';
            $.farmAssistResult.assistFriendList.map((item, index) => {
                if (index === ($.farmAssistResult.assistFriendList.length - 1)) {
                    str += item.nickName || "匿名用户";
                } else {
                    str += (item.nickName || "匿名用户") + ',';
                }
                let date = new Date(item.time);
                let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
                console.log(`【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力`);
            })
            message += `【助力您的好友】${str}\n`;
        }
        console.log('领取额外奖励水滴结束\n');
    } else {
        await masterHelpTaskInitForFarm();
        if ($.masterHelpResult.code === '0') {
            if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length >= 5) {
                // 已有五人助力。领取助力后的奖励
                if (!$.masterHelpResult.masterGotFinal) {
                    await masterGotFinishedTaskForFarm();
                    if ($.masterGotFinished.code === '0') {
                        console.log(`已成功领取好友助力奖励：【${$.masterGotFinished.amount}】g水`);
                        message += `【额外奖励】${$.masterGotFinished.amount}g水领取成功\n`;
                    }
                } else {
                    console.log("已经领取过5好友助力额外奖励");
                    message += `【额外奖励】已被领取过\n`;
                }
            } else {
                console.log("助力好友未达到5个");
                message += `【额外奖励】领取失败,原因：给您助力的人未达5个\n`;
            }
            if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length > 0) {
                let str = '';
                $.masterHelpResult.masterHelpPeoples.map((item, index) => {
                    if (index === ($.masterHelpResult.masterHelpPeoples.length - 1)) {
                        str += item.nickName || "匿名用户";
                    } else {
                        str += (item.nickName || "匿名用户") + ',';
                    }
                    let date = new Date(item.time);
                    let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
                    console.log(`【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力`);
                })
                message += `【助力您的好友】${str}\n`;
            }
            console.log('领取额外奖励水滴结束\n');
        }
    }
}
//助力好友
async function masterHelpShare() {
    console.log('开始助力好友')
    let salveHelpAddWater = 0;
    let remainTimes = 3;//今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
    let helpSuccessPeoples = '';//成功助力好友
    //console.log(`格式化后的助力码::${JSON.stringify(newShareCodes)}\n`);

    for (let code of newShareCodes) {
        console.log(`去助力: ${code}`);
        if (!code) continue;
        if (code === $.farmInfo.farmUserPro.shareCode) {
            console.log('不能为自己助力哦，跳过自己的shareCode\n')
            continue
        }
        await masterHelp(code);
        await $.wait(1000)
        if ($.helpResult.code === '0') {
            if ($.helpResult.helpResult.code === '0') {
                //助力成功
                salveHelpAddWater += $.helpResult.helpResult.salveHelpAddWater;
                console.log(`【助力结果】: 助力成功`);
                console.log(`助力获得${$.helpResult.helpResult.salveHelpAddWater}g水滴`)
                helpSuccessPeoples += ($.helpResult.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
            } else if ($.helpResult.helpResult.code === '8') {
                console.log(`【助力结果】: 助力失败，今天助力次数已耗尽`);
            } else if ($.helpResult.helpResult.code === '9') {
                console.log(`【助力结果】: 已经助力过TA了`);
            } else if ($.helpResult.helpResult.code === '10') {
                console.log(`【助力结果】: 对方已满助力`);
                fulled.push(code);
            } else {
                console.log(`助力其他情况：${JSON.stringify($.helpResult.helpResult)}`);
            }
            console.log(`【助力次数还剩】${$.helpResult.helpResult.remainTimes}次\n`);
            remainTimes = $.helpResult.helpResult.remainTimes;
            if ($.helpResult.helpResult.remainTimes === 0) {
                console.log(`您当前助力次数已耗尽，跳出助力`);
                break;
            }
        } else {
            console.log(`助力失败::${JSON.stringify($.helpResult)}`);
            break;
        }
    }
    if ($.isLoon() || $.isQuanX() || $.isSurge()) {
        let helpSuccessPeoplesKey = timeFormat() + $.farmInfo.farmUserPro.shareCode;
        if (!$.getdata(helpSuccessPeoplesKey)) {
            //把前一天的清除
            $.setdata('', timeFormat(Date.now() - 24 * 60 * 60 * 1000) + $.farmInfo.farmUserPro.shareCode);
            $.setdata('', helpSuccessPeoplesKey);
        }
        if (helpSuccessPeoples) {
            if ($.getdata(helpSuccessPeoplesKey)) {
                $.setdata($.getdata(helpSuccessPeoplesKey) + ',' + helpSuccessPeoples, helpSuccessPeoplesKey);
            } else {
                $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
            }
        }
        helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
    }
    //if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
    //message += `【您助力的好友👬】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
    //}
    if (salveHelpAddWater > 0) {
        // message += `【助力好友👬】获得${salveHelpAddWater}g💧\n`;
        console.log(`【助力好友👬】获得${salveHelpAddWater}g💧\n`);
    }
    message += `【今日剩余助力👬】${remainTimes}次\n`;
    console.log('助力好友结束，即将开始领取额外水滴奖励\n');
}
//水滴雨
async function executeWaterRains() {
    let executeWaterRain = !$.farmTask.waterRainInit.f;
    if (executeWaterRain) {
        console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
        console.log(`两次水滴雨任务是否全部完成：${$.farmTask.waterRainInit.f ? '是' : '否'}`);
        if ($.farmTask.waterRainInit.lastTime) {
            if (Date.now() < ($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000)) {
                executeWaterRain = false;
                // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`;
                console.log(`\【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`);
            }
        }
        if (executeWaterRain) {
            console.log(`开始水滴雨任务,这是第${$.farmTask.waterRainInit.winTimes + 1}次，剩余${2 - ($.farmTask.waterRainInit.winTimes + 1)}次`);
            await waterRainForFarm();
            console.log('水滴雨waterRain');
            if ($.waterRain.code === '0') {
                console.log('水滴雨任务执行成功，获得水滴：' + $.waterRain.addEnergy + 'g');
                console.log(`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`);
                // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`;
            }
        }
    } else {
        // message += `【水滴雨】已全部完成，获得20g💧\n`;
    }
}
//打卡领水活动
async function clockInIn() {
    console.log('开始打卡领水活动（签到，关注，领券）');
    await clockInInitForFarm();
    if ($.clockInInit.code === '0') {
        // 签到得水滴
        if (!$.clockInInit.todaySigned) {
            console.log('开始今日签到');
            await clockInForFarm();
            console.log(`打卡结果${JSON.stringify($.clockInForFarmRes)}`);
            if ($.clockInForFarmRes.code === '0') {
                // message += `【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`;
                console.log(`【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`)
                if ($.clockInForFarmRes.signDay === 7) {
                    //可以领取惊喜礼包
                    console.log('开始领取--惊喜礼包38g水滴');
                    await gotClockInGift();
                    if ($.gotClockInGiftRes.code === '0') {
                        // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
                        console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
                    }
                }
            }
        }
        if ($.clockInInit.todaySigned && $.clockInInit.totalSigned === 7) {
            console.log('开始领取--惊喜礼包38g水滴');
            await gotClockInGift();
            if ($.gotClockInGiftRes.code === '0') {
                // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
                console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
            }
        }
        // 限时关注得水滴
        if ($.clockInInit.themes && $.clockInInit.themes.length > 0) {
            for (let item of $.clockInInit.themes) {
                if (!item.hadGot) {
                    console.log(`关注ID${item.id}`);
                    await clockInFollowForFarm(item.id, "theme", "1");
                    console.log(`themeStep1--结果${JSON.stringify($.themeStep1)}`);
                    if ($.themeStep1.code === '0') {
                        await clockInFollowForFarm(item.id, "theme", "2");
                        console.log(`themeStep2--结果${JSON.stringify($.themeStep2)}`);
                        if ($.themeStep2.code === '0') {
                            console.log(`关注${item.name}，获得水滴${$.themeStep2.amount}g`);
                        }
                    }
                }
            }
        }
        // 限时领券得水滴
        if ($.clockInInit.venderCoupons && $.clockInInit.venderCoupons.length > 0) {
            for (let item of $.clockInInit.venderCoupons) {
                if (!item.hadGot) {
                    console.log(`领券的ID${item.id}`);
                    await clockInFollowForFarm(item.id, "venderCoupon", "1");
                    console.log(`venderCouponStep1--结果${JSON.stringify($.venderCouponStep1)}`);
                    if ($.venderCouponStep1.code === '0') {
                        await clockInFollowForFarm(item.id, "venderCoupon", "2");
                        if ($.venderCouponStep2.code === '0') {
                            console.log(`venderCouponStep2--结果${JSON.stringify($.venderCouponStep2)}`);
                            console.log(`从${item.name}领券，获得水滴${$.venderCouponStep2.amount}g`);
                        }
                    }
                }
            }
        }
    }
    console.log('开始打卡领水活动（签到，关注，领券）结束\n');
}
//
async function getAwardInviteFriend() {
    await friendListInitForFarm();//查询好友列表
    // console.log(`查询好友列表数据：${JSON.stringify($.friendList)}\n`)
    if ($.friendList) {
        console.log(`\n今日已邀请好友${$.friendList.inviteFriendCount}个 / 每日邀请上限${$.friendList.inviteFriendMax}个`);
        // console.log(`开始删除${$.friendList.friends && $.friendList.friends.length}个好友,可拿每天的邀请奖励`);
        // if ($.friendList.friends && $.friendList.friends.length > 0) {
        //     for (let friend of $.friendList.friends) {
        //         console.log(`开始删除好友 [${friend.shareCode}]`);
        //         const deleteFriendForFarm = await request('deleteFriendForFarm', { "shareCode": `${friend.shareCode}`, "version": 8, "channel": 1 });
        //         if (deleteFriendForFarm && deleteFriendForFarm.code === '0') {
        //             console.log(`删除成功！\n`);
        //         }
        //     }
        // }
        await receiveFriendInvite();//为他人助力,接受邀请成为别人的好友
        if ($.friendList.inviteFriendCount > 0) {
            if ($.friendList.inviteFriendCount > $.friendList.inviteFriendGotAwardCount) {
                console.log('开始领取邀请好友的奖励');
                await awardInviteFriendForFarm();
                console.log(`领取邀请好友的奖励结果：：${JSON.stringify($.awardInviteFriendRes)}`);
            }
        } else {
            console.log('今日未邀请过好友')
        }
    } else {
        console.log(`查询好友列表失败\n`);
    }
}
//给好友浇水
async function doFriendsWater() {
    await friendListInitForFarm();
    console.log('开始给好友浇水...');
    await taskInitForFarm();
    const { waterFriendCountKey, waterFriendMax } = $.farmTask.waterFriendTaskInit;
    console.log(`今日已给${waterFriendCountKey}个好友浇水`);
    if (waterFriendCountKey < waterFriendMax) {
        let needWaterFriends = [];
        if ($.friendList.friends && $.friendList.friends.length > 0) {
            $.friendList.friends.map((item, index) => {
                if (item.friendState === 1) {
                    if (needWaterFriends.length < (waterFriendMax - waterFriendCountKey)) {
                        needWaterFriends.push(item.shareCode);
                    }
                }
            });
            console.log(`需要浇水的好友列表shareCodes:${JSON.stringify(needWaterFriends)}`);
            let waterFriendsCount = 0, cardInfoStr = '';
            for (let index = 0; index < needWaterFriends.length; index++) {
                await waterFriendForFarm(needWaterFriends[index]);
                console.log(`为第${index + 1}个好友浇水结果:${JSON.stringify($.waterFriendForFarmRes)}\n`)
                if ($.waterFriendForFarmRes.code === '0') {
                    waterFriendsCount++;
                    if ($.waterFriendForFarmRes.cardInfo) {
                        console.log('为好友浇水获得道具了');
                        if ($.waterFriendForFarmRes.cardInfo.type === 'beanCard') {
                            console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
                            cardInfoStr += `水滴换豆卡,`;
                        } else if ($.waterFriendForFarmRes.cardInfo.type === 'fastCard') {
                            console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
                            cardInfoStr += `快速浇水卡,`;
                        } else if ($.waterFriendForFarmRes.cardInfo.type === 'doubleCard') {
                            console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
                            cardInfoStr += `水滴翻倍卡,`;
                        } else if ($.waterFriendForFarmRes.cardInfo.type === 'signCard') {
                            console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
                            cardInfoStr += `加签卡,`;
                        }
                    }
                } else if ($.waterFriendForFarmRes.code === '11') {
                    console.log('水滴不够,跳出浇水')
                }
            }
            // message += `【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`;
            console.log(`【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`);
            if (cardInfoStr && cardInfoStr.length > 0) {
                // message += `【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`;
                console.log(`【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`);
            }
        } else {
            console.log('您的好友列表暂无好友,快去邀请您的好友吧!')
        }
    } else {
        console.log(`今日已为好友浇水量已达${waterFriendMax}个`)
    }
}
//领取给3个好友浇水后的奖励水滴
async function getWaterFriendGotAward() {
    await taskInitForFarm();
    const { waterFriendCountKey, waterFriendMax, waterFriendSendWater, waterFriendGotAward } = $.farmTask.waterFriendTaskInit
    if (waterFriendCountKey >= waterFriendMax) {
        if (!waterFriendGotAward) {
            await waterFriendGotAwardForFarm();
            console.log(`领取给${waterFriendMax}个好友浇水后的奖励水滴::${JSON.stringify($.waterFriendGotAwardRes)}`)
            if ($.waterFriendGotAwardRes.code === '0') {
                // message += `【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`;
                console.log(`【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`);
            }
        } else {
            console.log(`给好友浇水的${waterFriendSendWater}g水滴奖励已领取\n`);
            // message += `【给${waterFriendMax}好友浇水】奖励${waterFriendSendWater}g水滴已领取\n`;
        }
    } else {
        console.log(`暂未给${waterFriendMax}个好友浇水\n`);
    }
}
//接收成为对方好友的邀请
async function receiveFriendInvite() {
    for (let code of newShareCodes) {
        if (code === $.farmInfo.farmUserPro.shareCode) {
            console.log('自己不能邀请自己成为好友噢\n')
            continue
        }
		if (newShareCodes.findIndex(a=>a===code) >= 5) break;
        await inviteFriend(code);
        // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes)}`)
        if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '0') {
            console.log(`接收邀请成为好友结果成功,您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
        } else if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '17') {
            console.log(`接收邀请成为好友结果失败,对方已是您的好友`)
        }
    }
    // console.log(`开始接受6fbd26cc27ac44d6a7fed34092453f77的邀请\n`)
    // await inviteFriend('6fbd26cc27ac44d6a7fed34092453f77');
    // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
    // if ($.inviteFriendRes.helpResult.code === '0') {
    //   console.log(`您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
    // } else if ($.inviteFriendRes.helpResult.code === '17') {
    //   console.log(`对方已是您的好友`)
    // }
}
async function duck() {
    for (let i = 0; i < 10; i++) {
        //这里循环十次
        await getFullCollectionReward();
        if ($.duckRes.code === '0') {
            if (!$.duckRes.hasLimit) {
                console.log(`小鸭子游戏:${$.duckRes.title}`);
                // if ($.duckRes.type !== 3) {
                //   console.log(`${$.duckRes.title}`);
                //   if ($.duckRes.type === 1) {
                //     message += `【小鸭子】为你带回了水滴\n`;
                //   } else if ($.duckRes.type === 2) {
                //     message += `【小鸭子】为你带回快速浇水卡\n`
                //   }
                // }
            } else {
                console.log(`${$.duckRes.title}`)
                break;
            }
        } else if ($.duckRes.code === '10') {
            console.log(`小鸭子游戏达到上限`)
            break;
        }
    }
}
// ========================API调用接口========================
//鸭子，点我有惊喜
async function getFullCollectionReward() {
    return new Promise(resolve => {
        const body = { "type": 2, "version": 6, "channel": 2 };
        $.post(taskUrl("getFullCollectionReward", body), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n东东农场: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        $.duckRes = JSON.parse(data);
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

/**
 * 领取10次浇水奖励API
 */
async function totalWaterTaskForFarm() {
    const functionId = arguments.callee.name.toString();
    $.totalWaterReward = await request(functionId);
}
//领取首次浇水奖励API
async function firstWaterTaskForFarm() {
    const functionId = arguments.callee.name.toString();
    $.firstWaterReward = await request(functionId);
}
//领取给3个好友浇水后的奖励水滴API
async function waterFriendGotAwardForFarm() {
    const functionId = arguments.callee.name.toString();
    $.waterFriendGotAwardRes = await request(functionId, { "version": 4, "channel": 1 });
}
// 查询背包道具卡API
async function myCardInfoForFarm() {
    const functionId = arguments.callee.name.toString();
    $.myCardInfoRes = await request(functionId, { "version": 5, "channel": 1 });
}
//使用道具卡API
async function userMyCardForFarm(cardType) {
    const functionId = arguments.callee.name.toString();
    $.userMyCardRes = await request(functionId, { "cardType": cardType });
}
/**
 * 领取浇水过程中的阶段性奖励
 * @param type
 * @returns {Promise<void>}
 */
async function gotStageAwardForFarm(type) {
    $.gotStageAwardForFarmRes = await request(arguments.callee.name.toString(), { 'type': type });
}
//浇水API
async function waterGoodForFarm() {
    await $.wait(1000);
    console.log('等待了1秒');

    const functionId = arguments.callee.name.toString();
    $.waterResult = await request(functionId);
}
// 初始化集卡抽奖活动数据API
async function initForTurntableFarm() {
    $.initForTurntableFarmRes = await request(arguments.callee.name.toString(), { version: 4, channel: 1 });
}
async function lotteryForTurntableFarm() {
    await $.wait(2000);
    console.log('等待了2秒');
    $.lotteryRes = await request(arguments.callee.name.toString(), { type: 1, version: 4, channel: 1 });
}

async function timingAwardForTurntableFarm() {
    $.timingAwardRes = await request(arguments.callee.name.toString(), { version: 4, channel: 1 });
}

async function browserForTurntableFarm(type, adId) {
    if (type === 1) {
        console.log('浏览爆品会场');
    }
    if (type === 2) {
        console.log('天天抽奖浏览任务领取水滴');
    }
    const body = { "type": type, "adId": adId, "version": 4, "channel": 1 };
    $.browserForTurntableFarmRes = await request(arguments.callee.name.toString(), body);
    // 浏览爆品会场8秒
}
//天天抽奖浏览任务领取水滴API
async function browserForTurntableFarm2(type) {
    const body = { "type": 2, "adId": type, "version": 4, "channel": 1 };
    $.browserForTurntableFarm2Res = await request('browserForTurntableFarm', body);
}
/**
 * 天天抽奖拿好礼-助力API(每人每天三次助力机会)
 */
async function lotteryMasterHelp() {
    $.lotteryMasterHelpRes = await request(`initForFarm`, {
        imageUrl: "",
        nickName: "",
        shareCode: arguments[0] + '-3',
        babelChannel: "3",
        version: 4,
        channel: 1
    });
}

//领取5人助力后的额外奖励API
async function masterGotFinishedTaskForFarm() {
    const functionId = arguments.callee.name.toString();
    $.masterGotFinished = await request(functionId);
}
//助力好友信息API
async function masterHelpTaskInitForFarm() {
    const functionId = arguments.callee.name.toString();
    $.masterHelpResult = await request(functionId);
}
//新版助力好友信息API
async function farmAssistInit() {
    const functionId = arguments.callee.name.toString();
    $.farmAssistResult = await request(functionId, { "version": 14, "channel": 1, "babelChannel": "120" });
}
//新版领取助力奖励API
async function receiveStageEnergy() {
    const functionId = arguments.callee.name.toString();
    $.receiveStageEnergy = await request(functionId, { "version": 14, "channel": 1, "babelChannel": "120" });
}
//接受对方邀请,成为对方好友的API
async function inviteFriend() {
    $.inviteFriendRes = await request(`initForFarm`, {
        imageUrl: "",
        nickName: "",
        shareCode: arguments[0] + '-inviteFriend',
        version: 4,
        channel: 2
    });
}
// 助力好友API
async function masterHelp() {
    $.helpResult = await request(`initForFarm`, {
        imageUrl: "",
        nickName: "",
        shareCode: arguments[0],
        babelChannel: "3",
        version: 2,
        channel: 1
    });
}
/**
 * 水滴雨API
 */
async function waterRainForFarm() {
    const functionId = arguments.callee.name.toString();
    const body = { "type": 1, "hongBaoTimes": 100, "version": 3 };
    $.waterRain = await request(functionId, body);
}
/**
 * 打卡领水API
 */
async function clockInInitForFarm() {
    const functionId = arguments.callee.name.toString();
    $.clockInInit = await request(functionId);
}

// 连续签到API
async function clockInForFarm() {
    const functionId = arguments.callee.name.toString();
    $.clockInForFarmRes = await request(functionId, { "type": 1 });
}

//关注，领券等API
async function clockInFollowForFarm(id, type, step) {
    const functionId = arguments.callee.name.toString();
    let body = {
        id,
        type,
        step
    }
    if (type === 'theme') {
        if (step === '1') {
            $.themeStep1 = await request(functionId, body);
        } else if (step === '2') {
            $.themeStep2 = await request(functionId, body);
        }
    } else if (type === 'venderCoupon') {
        if (step === '1') {
            $.venderCouponStep1 = await request(functionId, body);
        } else if (step === '2') {
            $.venderCouponStep2 = await request(functionId, body);
        }
    }
}

// 领取连续签到7天的惊喜礼包API
async function gotClockInGift() {
    $.gotClockInGiftRes = await request('clockInForFarm', { "type": 2 })
}

//定时领水API
async function gotThreeMealForFarm() {
    const functionId = arguments.callee.name.toString();
    $.threeMeal = await request(functionId);
}
/**
 * 浏览广告任务API
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
async function browseAdTaskForFarm(advertId, type) {
    const functionId = arguments.callee.name.toString();
    if (type === 0) {
        $.browseResult = await request(functionId, { advertId, type });
    } else if (type === 1) {
        $.browseRwardResult = await request(functionId, { advertId, type });
    }
}
// 被水滴砸中API
async function gotWaterGoalTaskForFarm() {
    $.goalResult = await request(arguments.callee.name.toString(), { type: 3 });
}
//签到API
async function signForFarm() {
    const functionId = arguments.callee.name.toString();
    $.signResult = await request(functionId);
}
/**
 * 初始化农场, 可获取果树及用户信息API
 */
async function initForFarm() {
    await $.wait(500);
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
                "User-Agent": $.UA,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000,
        };
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n东东农场: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        $.farmInfo = JSON.parse(data)
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

// 初始化任务列表API
async function taskInitForFarm() {
    console.log('\n初始化任务列表')
    const functionId = arguments.callee.name.toString();
    $.farmTask = await request(functionId, { "version": 14, "channel": 1, "babelChannel": "120" });
}
//获取好友列表API
async function friendListInitForFarm() {
    $.friendList = await request('friendListInitForFarm', { "version": 4, "channel": 1 });
    // console.log('aa', aa);
}
// 领取邀请好友的奖励API
async function awardInviteFriendForFarm() {
    $.awardInviteFriendRes = await request('awardInviteFriendForFarm');
}
//为好友浇水API
async function waterFriendForFarm(shareCode) {
    const body = { "shareCode": shareCode, "version": 6, "channel": 1 }
    $.waterFriendForFarmRes = await request('waterFriendForFarm', body);
}
async function showMsg() {
    if ($.isNode() && process.env.FRUIT_NOTIFY_CONTROL) {
        $.ctrTemp = `${process.env.FRUIT_NOTIFY_CONTROL}` === 'false';
    } else if ($.getdata('jdFruitNotify')) {
        $.ctrTemp = $.getdata('jdFruitNotify') === 'false';
    } else {
        $.ctrTemp = `${jdNotify}` === 'false';
    }
    if ($.ctrTemp) {
        $.msg($.name, subTitle, message, option);
        if ($.isNode()) {
            allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
            // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}`, `${subTitle}\n${message}`);
        }
    } else {
        $.log(`\n${message}\n`);
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
function readShareCode() {
    return new Promise(async resolve => {
        $.get({ url: `https://cdn.jsdelivr.net/gh/6dylan6/updateTeam@main/shareCodes/fruit.json`, timeout: 10000 }, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err))
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        //console.log(`随机取个${randomCount}码放到您固定的互助码后面(不影响已有固定互助)`)
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
        await $.wait(10000);
        resolve()
    })
}
function shareCodesFormat() {
    return new Promise(async resolve => {
        // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
        newShareCodes = [];
        if ($.shareCodesArr[$.index - 1]) {
            newShareCodes = $.shareCodesArr[$.index - 1].split('@');
        } else {
            //console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
            const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
            newShareCodes = shareCodes[tempIndex].split('@');
        }
        const readShareCodeRes = await readShareCode();
        if (readShareCodeRes && readShareCodeRes.code === 200) {
            //newShareCodes = newShareCodes.concat(readShareCodeRes.data || []);
            newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
        }
        newShareCodes = newShareCodes.filter(item => { return fulled.indexOf(item) == -1 });
        console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
        resolve();
    })
}
function requireConfig() {
    return new Promise(resolve => {
        console.log('开始获取配置文件\n')
        notify = $.isNode() ? require('./sendNotify') : '';
        //Node.js用户请在jdCookie.js处填写京东ck;
        const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
        //const jdFruitShareCodes = $.isNode() ? require('./jdFruitShareCodes.js') : '';
        if ($.isNode()) {
            if (process.env.FRUITSHARECODES) {
                if (process.env.FRUITSHARECODES.indexOf('\n') > -1) {
                    shareCodes = process.env.FRUITSHARECODES.split('\n');
                } else {
                    shareCodes = process.env.FRUITSHARECODES.split('&');
                }
            }
        }
        //IOS等用户直接用NobyDa的jd cookie
        if ($.isNode()) {
            Object.keys(jdCookieNode).forEach((item) => {
                if (jdCookieNode[item]) {
                    cookiesArr.push(jdCookieNode[item])
                }
            })
            if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
        } else {
            cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
        }
        console.log(`共${cookiesArr.length}个京东账号\n`)
        $.shareCodesArr = [];
        if ($.isNode()) {
            Object.keys(shareCodes).forEach((item) => {
                if (shareCodes[item]) {
                    $.shareCodesArr.push(shareCodes[item])
                }
            })
        } else {
            if ($.getdata('jd_fruit_inviter')) $.shareCodesArr = $.getdata('jd_fruit_inviter').split('\n').filter(item => !!item);
            console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_fruit_inviter') ? $.getdata('jd_fruit_inviter') : '暂无'}\n`);
        }
        // console.log(`$.shareCodesArr::${JSON.stringify($.shareCodesArr)}`)
        // console.log(`jdFruitShareArr账号长度::${$.shareCodesArr.length}`)
        console.log(`您提供了${$.shareCodesArr.length}个账号的农场助力码\n`);
        resolve()
    })
}
function TotalBean() {
    return new Promise((resolve) => {
        const options = {
            url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
            headers: {
                "Cookie": cookie,
                "referer": "https://h5.m.jd.com/",
                "User-Agent": $.UA,
            },
            timeout: 10000
        }
        $.get(options, (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data.islogin === "1") {
                    } else if (data.islogin === "0") {
                        $.isLogin = false;
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
function request(function_id, body = {}, timeout = 1000) {
    if(process.env.FRUIT_DELAY && $.reqnum % 5 == 0 ) {console.log(`\n等待${delay/1000}秒......\n`);timeout=delay};
    $.reqnum++;      
    return new Promise(resolve => {
        setTimeout(() => {
            $.get(taskUrl(function_id, body), (err, resp, data) => {
                try {
                    if (err) {
                        console.log('\n东东农场: API查询请求失败 ‼️‼️')
                        console.log(JSON.stringify(err));
                        console.log(`function_id:${function_id}`)
                        $.logErr(err);
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        }, timeout)
    })
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

function taskUrl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
        headers: {
            "Host": "api.m.jd.com",
            "Accept": "*/*",
            "Origin": "https://carry.m.jd.com",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": $.UA,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://carry.m.jd.com/",
            "Cookie": cookie
        },
        timeout: 10000
    }
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
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }