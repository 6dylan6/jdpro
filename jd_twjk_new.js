/*
 特务集卡
 脚本没有自动开卡，会尝试领取开卡奖励
10 10,17,19 * * * https://raw.githubusercontent.com/6dylan6/jdpro/main/jd_twjk_new.js
updatetime: 2022/11/5 fix
* */
const $ = new Env('特务集卡');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
console.log('\n活动地址：首页下拉，没集齐就手动做开卡任务，集齐晚上8点前瓜分\n')
let shareList = [];
$.flag = false
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { 'open-url': 'https://bean.m.jd.com/bean/signIndex.action' });
        return;
    }
    for (let _0x44559b = 0; _0x44559b < cookiesArr.length; _0x44559b++) {
        if (cookiesArr[_0x44559b]) {
            $.cookie = cookiesArr[_0x44559b];
            $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.index = (_0x44559b + 1);
            $.isLogin = true;
            $.nickName = '';
            console.log('\n******开始【京东账号' + $.index + '】' + ($.nickName || $.UserName) + '*********\n');
            if (!$.isLogin) {
                $.msg($.name, '【提示】cookie已失效', '京东账号' + $.index + ' ' + ($.nickName || $.UserName) + '\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action', { 'open-url': 'https://bean.m.jd.com/bean/signIndex.action' });
                if ($.isNode()) {
                    await notify.sendNotify($.name + 'cookie已失效 - ' + $.UserName, '京东账号' + $.index + ' ' + $.UserName + '\n请重新登录获取cookie');
                }
                continue;
            } try {

                await main($.cookie);
                if (_0x44559b == 0 && $.flag) return;
            } catch (_0x282ca) {
                console.log(_0x282ca);
            }
        }
    }
    if (shareList.length === 0) {
        return;
    }
    let _0x2f4ff9 = [];
    for (let _0x44559b = 0; _0x44559b < cookiesArr.length; _0x44559b++) {
        let _0x3b61e9 = cookiesArr[_0x44559b];
        let _0x7cdd5d = decodeURIComponent(_0x3b61e9.match(/pt_pin=(.+?);/) && _0x3b61e9.match(/pt_pin=(.+?);/)[1]);
        for (let _0x1155c9 = 0; _0x1155c9 < shareList.length; _0x1155c9++) {
            if (shareList[_0x1155c9].user === _0x7cdd5d) {
                _0x2f4ff9.push(shareList[_0x1155c9]);
                break;
            }
        }
    }
    console.log('\n-----------------------互助----------------------\n');
    for (let _0x44559b = 0; _0x44559b < cookiesArr.length; _0x44559b++) {
        let _0x3b61e9 = cookiesArr[_0x44559b];
        let _0x7cdd5d = decodeURIComponent(_0x3b61e9.match(/pt_pin=(.+?);/) && _0x3b61e9.match(/pt_pin=(.+?);/)[1]);
        let _0x4ce29d = true;
        for (let _0x1155c9 = 0; (_0x1155c9 < _0x2f4ff9.length) && _0x4ce29d; _0x1155c9++) {
            let _0x383730 = _0x2f4ff9[_0x1155c9];
            if ((_0x383730.user === _0x7cdd5d) || (_0x383730.need === 0) || _0x383730.max) {
                continue;
            }
            console.log('' + _0x7cdd5d + '去助力:' + _0x383730.user);
            let _0x224f8e = await takeRequest(_0x3b61e9, 'superBrandDoTask', '{"source":"card","activityId":' + _0x383730.activityId + ',"encryptProjectId":"' + _0x383730.encryptProjectId + '","encryptAssignmentId":"' + _0x383730.encryptAssignmentId + '","assignmentType":2,"itemId":"' + _0x383730.itemId + '","actionType":0}');
            if (_0x224f8e.bizCode === '0') {
                console.log('助力成功');
            } else if (_0x224f8e.bizCode === '103') {
                console.log('助力已满');
                _0x383730.max = true;
            } else if (_0x224f8e.bizCode === '108') {
                //console.log('助力次数已用完');
                _0x4ce29d = false;
            } else if (_0x224f8e.bizMsg.indexOf('风控') > -1) {
                console.log('黑号跳过！');
                break;
            }
            console.log('助力结果：' + _0x224f8e.bizMsg);
            await $.wait(2000);
        }
    }
})().catch(_0x307399 => {
    $.log('', '❌ ' + $.name + ', 失败! 原因: ' + _0x307399 + '!', '');
}).finally(() => {
    $.done();
});
async function main(_0x14f2ac) {
    let _0xc6f9d4 = decodeURIComponent(_0x14f2ac.match(/pt_pin=(.+?);/) && _0x14f2ac.match(/pt_pin=(.+?);/)[1]);
    let _0x43a9de = await takeRequest(_0x14f2ac, 'showSecondFloorCardInfo', '{"source":"card"}');
    if (_0x43a9de.bizCode == 'MP001') {
        console.log('本期活动结束，等待下期。。。');
        $.flag = true
        return;
    } else if (_0x43a9de.bizCode == '2001') {
        console.log('黑号了！');
        return;
    }
    let _0x215414 = _0x43a9de.result.activityBaseInfo;
    let _0x23add7 = _0x215414.activityId;
    let _0x5bf325 = await takeRequest(_0x14f2ac, 'superBrandTaskList', '{"source":"card","activityId":' + _0x23add7 + ',"assistInfoFlag":1}');
    if ((JSON.stringify(_0x5bf325) === '{}') || (JSON.stringify(_0x43a9de) === '{}')) {
        console.log(_0xc6f9d4 + ',获取活动详情失败2');
        return;
    }
    if (!_0x5bf325 || !_0x5bf325.result || !_0x5bf325.result.taskList) {
        console.log(_0xc6f9d4 + ',黑号');
        return;
    }
    let _0x183c5a = _0x5bf325.result.taskList || [];
    console.log('' + _0xc6f9d4 + ',获取活动详情成功');
    let _0x5add38 = _0x215414.encryptProjectId;
    let _0x34eeb3 = _0x43a9de.result.activityCardInfo;
    if ((_0x34eeb3.divideTimeStatus === 1) && (_0x34eeb3.divideStatus === 0) && _0x34eeb3.cardStatus === 1) {
        console.log(_0xc6f9d4 + ',去瓜分');
        let _0x2a25b6 = await takeRequest(_0x14f2ac, 'superBrandTaskLottery', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","tag":"divide"}');
        console.log('瓜分结果：' + _0x2a25b6.result.userAwardInfo.beanNum + '豆\n');
        return;
    } else if (_0x34eeb3.divideTimeStatus === 1 && _0x34eeb3.divideStatus === 1 && (_0x34eeb3.cardStatus === 1)) {
        console.log(_0xc6f9d4 + ',已瓜分');
        return;
    } else {
        console.log(_0xc6f9d4 + ',未集齐或者未到瓜分时间');
    }
    await $.wait(2000);
    for (let _0x5813c8 = 0; _0x5813c8 < _0x183c5a.length; _0x5813c8++) {
        let _0x4a424c = _0x183c5a[_0x5813c8];
        if (_0x4a424c.assignmentType === 2) {
            let _0x2ec90c = _0x4a424c.ext.cardAssistBoxRest || '0';
            for (let _0x5d0f56 = 0; _0x5d0f56 < _0x2ec90c; _0x5d0f56++) {
                console.log('领取助力奖励');
                let _0x9b8d5a = await takeRequest(_0x14f2ac, 'superBrandTaskLottery', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '"}');
                console.log('领取结果：' + _0x9b8d5a.bizMsg);
                await $.wait(3000);
            }
        } if (_0x4a424c.completionFlag) {
            console.log('任务：' + _0x4a424c.assignmentName + ',已完成');
            continue;
        } if (_0x4a424c.assignmentType === 1) {
            for (let i = 0; i < (_0x4a424c.assignmentTimesLimit - _0x4a424c.completionCnt); i++) {
                console.log('任务：' + _0x4a424c.assignmentName + ',去执行');
                let _0x3c7f29 = _0x4a424c.ext.shoppingActivity && _0x4a424c.ext.shoppingActivity[i].itemId || _0x4a424c.ext.productsInfo[i].itemId ||'';
                if (!_0x3c7f29) {
                    console.log('任务：' + _0x4a424c.assignmentName + ',信息异常');
                }
                let _0x2d2e7c = await takeRequest(_0x14f2ac, 'superBrandDoTask', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","encryptAssignmentId":"' + _0x4a424c.encryptAssignmentId + '","assignmentType":' + _0x4a424c.assignmentType + ',"itemId":"' + _0x3c7f29 + '","actionType":0}');
                console.log('执行结果：' + _0x2d2e7c.bizMsg);
                await $.wait(3000);
            }
        } if (_0x4a424c.assignmentType === 3) {
			for (let i = 0; i < (_0x4a424c.assignmentTimesLimit - _0x4a424c.completionCnt); i++) {
            console.log('任务：' + _0x4a424c.assignmentName + ',去执行');
            let _0x440f46 = _0x4a424c.ext.followShop[i].itemId || '';
            if (!_0x440f46) {
                console.log('任务：' + _0x4a424c.assignmentName + ',信息异常');
            }
            let _0x2d2e7c = await takeRequest(_0x14f2ac, 'superBrandDoTask', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","encryptAssignmentId":"' + _0x4a424c.encryptAssignmentId + '","assignmentType":' + _0x4a424c.assignmentType + ',"itemId":"' + _0x440f46 + '","actionType":0}');
            console.log('执行结果：' + _0x2d2e7c.bizMsg);
            await $.wait(3000);
			}
        } if (_0x4a424c.assignmentType === 7) {
            console.log('任务：' + _0x4a424c.assignmentName + ',去执行');
            let _0x25a600 = _0x4a424c.ext.brandMemberList[0].itemId || '';
            if (!_0x25a600) {
                console.log('任务：' + _0x4a424c.assignmentName + ',信息异常');
            }
            let _0x2d2e7c = await takeRequest(_0x14f2ac, 'superBrandDoTask', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","encryptAssignmentId":"' + _0x4a424c.encryptAssignmentId + '","assignmentType":' + _0x4a424c.assignmentType + ',"itemId":"' + _0x25a600 + '","actionType":0}');
            console.log('执行结果：' + _0x2d2e7c.bizMsg);
            await $.wait(3000);
        } if (_0x4a424c.assignmentType === 5) {
            let _0x1e4481 = _0x4a424c.ext.sign2 || [];
            if (_0x1e4481.length === 0) {
                console.log('任务：' + _0x4a424c.assignmentName + ',信息异常');
            } if (_0x4a424c.assignmentName === '首页限时下拉') {
                for (let _0x5d0f56 = 0; _0x5d0f56 < _0x1e4481.length; _0x5d0f56++) {
                    if (_0x1e4481[_0x5d0f56].status === 1) {
                        console.log('任务：' + _0x4a424c.assignmentName + ',去执行');
                        let _0x25a600 = _0x1e4481[_0x5d0f56].itemId;
                        let _0x2d2e7c = await takeRequest(_0x14f2ac, 'superBrandDoTask', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","encryptAssignmentId":"' + _0x4a424c.encryptAssignmentId + '","assignmentType":' + _0x4a424c.assignmentType + ',"itemId":"' + _0x25a600 + '","actionType":0,"dropDownChannel":1}');
                        console.log('执行结果：' + _0x2d2e7c.bizMsg);
                        await $.wait(3000);
                    }
                }
            } else if (_0x4a424c.assignmentName.indexOf('小游戏') !== -1) {
                for (let _0x5d0f56 = 0; _0x5d0f56 < _0x1e4481.length; _0x5d0f56++) {
                    if (_0x1e4481[_0x5d0f56].status === 1) {
                        console.log('任务：' + _0x4a424c.assignmentName + ',去执行');
                        let _0x5e4237 = await takeRequest(_0x14f2ac, 'showSecondFloorGameInfo', '{"source":"card"}');
                        let _0x5bc621 = _0x5e4237.result.activityGameInfo.gameCurrentRewardInfo.secCode;
                        let _0x4e6eb7 = _0x5e4237.result.activityGameInfo.gameCurrentRewardInfo.encryptAssignmentId;
                        await $.wait(3000);
                        let _0x2d2e7c = await takeRequest(_0x14f2ac, 'superBrandTaskLottery', '{"source":"card","activityId":' + _0x23add7 + ',"encryptProjectId":"' + _0x5add38 + '","encryptAssignmentId":"' + _0x4e6eb7 + '","secCode":"' + _0x5bc621 + '"}');
                        console.log('执行结果：' + _0x2d2e7c.bizMsg);
                        await $.wait(3000);
                    }
                }
            }
        } if (_0x4a424c.assignmentType === 2) {
            let _0x282818 = _0x4a424c.ext.assistTaskDetail.itemId || '';
            if (!_0x282818) {
                console.log('任务：' + _0x4a424c.assignmentName + ',信息异常');
            }
            shareList.push({ 'user': _0xc6f9d4, 'activityId': _0x23add7, 'encryptProjectId': _0x5add38, 'encryptAssignmentId': _0x4a424c.encryptAssignmentId, 'itemId': _0x282818, 'max': false });
        }
    }
    await $.wait(2000);
    let myaward = await takeRequest(_0x14f2ac, 'superBrandShowMyAward', '{"source":"card","activityId":' + _0x23add7 + '}');
    let rewardList = myaward.result.rewardList;
    let y = '';
    let x = '';
    for (let i = 0; i < rewardList.length; i++) {
        if (rewardList[i]['rewardType'] === 3) {
            x += rewardList[i].rewardValue + '\n';
        } else if (rewardList[i]['rewardType'] === 7) {
            x += rewardList[i].rewardName + ' ' + rewardList[i].useRange + '\n';
        } else {
            x += rewardList[i].rewardValue + '\n';
            y += (rewardList[i].rewardValue + ';');
        }
    } if (x) {
        console.log('\n已获得奖励：\n' + x);
    } if (y) {
        await notify.sendNotify('特务集卡', '京东账号' + _0xc6f9d4 + '可能获得实物奖励\n' + y);
    }
}
async function takeRequest(_0x419790, _0x5a318a, _0x10cedb) {
    let _0x436779 = '';
    let _0x383bf2 = 'https://api.m.jd.com/?uuid=&client=wh5&area=2_2830_51828_0&appid=ProductZ4Brand&functionId=' + _0x5a318a + '&t=' + Date.now() + '&body=' + encodeURIComponent(_0x10cedb);
    const _0xb17315 = {
        'Origin': 'https://prodev.m.jd.com', 'Cookie': _0x419790, 'Connection': 'keep-alive', 'Accept': 'application/json, text/plain, */*', 'Referer': 'https://prodev.m.jd.com/mall/active/2XsicQEdY1CY4tLw96HmFCzn1MNn/index.html', 'Host': 'api.m.jd.com', 'user-agent': $.isNode() ? process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : require('./USER_AGENTS').USER_AGENT : $.getdata('JDUA') ? $.getdata('JDUA') : 'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1', 'Accept-Language': 'zh-cn', 'Accept-Encoding': 'gzip, deflate, br'
    };
    let _0x257f89 = { 'url': _0x383bf2, 'headers': _0xb17315, 'body': _0x436779 };
    return new Promise(async _0x3ed0bf => {
        $.post(_0x257f89, (_0x4748bf, _0x21a504, _0x340c8a) => {
            try {
                if (_0x4748bf) {
                    console.log(_0x4748bf);
                } else {
                    _0x340c8a = JSON.parse(_0x340c8a);
                    if (_0x340c8a && _0x340c8a.data && (JSON.stringify(_0x340c8a.data) === '{}')) {
                        console.log(JSON.stringify(_0x340c8a));
                    }
                }
            } catch (_0xd9c1ae) {
                console.log(_0x340c8a);
            }
            finally {
                _0x3ed0bf(_0x340c8a.data || {});
            }
        });
    });
}
function TotalBean() {
    return new Promise(async _0x5b42bb => {
        const _0x4de18f = {
            'url': 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2', 'headers': {
                'Accept': 'application/json,text/plain, */*', 'Content-Type': 'application/x-www-form-urlencoded', 'Accept-Encoding': 'gzip, deflate, br', 'Accept-Language': 'zh-cn', 'Connection': 'keep-alive', 'Cookie': $.cookie, 'Referer': 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2', 'User-Agent': $.isNode() ? process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : require(_0x3a2151).USER_AGENT : $.getdata('JDUA') ? $.getdata('JDUA') : 'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
            }
        };
        $.post(_0x4de18f, (_0x43af7c, _0x4afeb2, _0x557f34) => {
            try {
                if (_0x43af7c) {
                    console.log('' + JSON.stringify(_0x43af7c));
                    console.log($.name + ' API请求失败，请检查网路重试');
                } else {
                    if (_0x557f34) {
                        _0x557f34 = JSON.parse(_0x557f34);
                        if (_0x557f34.retcode === 13) {
                            $.isLogin = false;
                            return;
                        } if (_0x557f34.retcode === 0) {
                            $.nickName = _0x557f34.base && _0x557f34.base.nickname || $.UserName;
                        } else {
                            $.nickName = $.UserName;
                        }
                    } else {
                        console.log('京东服务器返回空数据');
                    }
                }
            } catch (_0x4c8801) {
                $.logErr(_0x4c8801, _0x4afeb2);
            }
            finally {
                _0x5b42bb();
            }
        });
    });
};
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
