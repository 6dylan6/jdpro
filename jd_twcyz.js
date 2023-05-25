/**
特务-春意值，首页下拉
不自动开卡，会尝试领取开卡奖励
第一个CK获取不到活动信息，自动退出
35 10,15 * * * jd_twcyz.js
 */
const $ = new Env('特务春意值抽奖');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [];
let UA = ``;
$.allInvite = [];
let useInfo = {};
$.helpEncryptAssignmentId = '';
$.flag = false
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        UA = `jdapp;iPhone;10.0.8;14.6;${randomWord(false, 40, 40)};network/wifi;JDEbook/openapp.jdreader;model/iPhone9,2;addressid/2214222493;appBuild/168841;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16E158;supportJDSHWK/1`;
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        await TotalBean();
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

            if ($.isNode()) {
                await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
            }
            continue
        }
        try {
            await main();
        } catch (e) {
            console.log(JSON.stringify(e));
        }
        if (i == 0 && $.flag) return;
        await $.wait(1000);
    }
    if ($.allInvite.length > 0) {
        console.log(`\n开始内部互助:\n`);
    }
    cookiesArr = getRandomArrayElements(cookiesArr, cookiesArr.length);
    for (let i = 0; i < cookiesArr.length; i++) {
        $.cookie = cookiesArr[i];
        $.canHelp = true;
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        if (!useInfo[$.UserName]) {
            continue;
        }
        $.encryptProjectId = useInfo[$.UserName];
        for (let j = 0; j < $.allInvite.length && $.canHelp; j++) {
            $.codeInfo = $.allInvite[j];
            $.code = $.codeInfo.code;
            if ($.UserName === $.codeInfo.userName || $.codeInfo.time === 3) {
                continue;
            }
            $.encryptAssignmentId = $.codeInfo.encryptAssignmentId;
            console.log(`\n${$.UserName},去助力:${$.code}`);
            await takeRequest('help');
            await $.wait(1000);
        }
    }
})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); })

async function main() {
    $.runFlag = false;
    $.activityInfo = {};
    await takeRequest('superBrandSecondFloorMainPage');
    if ($.bizCode == 'MP001') {
        console.log(`本期活动结束，期待下期。。。`);
        $.flag = true;
        return;
    }
    if (JSON.stringify($.activityInfo) === '{}') {
        console.log(`获取活动详情失败`);
        return;
    }
    console.log(`获取活动详情成功`);
    $.activityId = $.activityInfo.activityBaseInfo.activityId;
    $.activityName = $.activityInfo.activityBaseInfo.activityName;
    $.drawstartnum = $.activityInfo.activityBaseInfo.drawStarNum;
    console.log(`当前活动:${$.activityName},ID：${$.activityId},抽奖限制${$.activityInfo.activityBaseInfo.drawLimit}次`);
    $.encryptProjectId = $.activityInfo.activityBaseInfo.encryptProjectId;
    useInfo[$.UserName] = $.encryptProjectId;
    await $.wait(1000);
    $.taskList = [];
    await takeRequest('superBrandTaskList');
    await $.wait(1000);
    await doTask();
    //if ($.runFlag) {
    await $.wait(200);
    await takeRequest('superBrandSecondFloorMainPage');
    $.callNumber = $.activityInfo.activityUserInfo.userStarNum;
    $.drawtimes = Math.floor($.callNumber / $.drawstartnum);
    //}
    console.log(`\n可抽奖${$.drawtimes}次，开始...`);
    for (let i = 0; i < $.drawtimes; i++) {
        console.log(`进行${i + 1}次抽奖：`);;
        await takeRequest('superBrandTaskLottery');//抽奖
        await $.wait(1000);
        if (!$.runFlag) break;
    }
}
async function doTask() {
    for (let i = 0; i < $.taskList.length; i++) {
        $.oneTask = $.taskList[i];
        if ($.oneTask.completionFlag) {
            console.log(`任务：${$.oneTask.assignmentName}，已完成`);
            continue;
        }
        if ($.oneTask.assignmentType === 3 || $.oneTask.assignmentType === 7 || $.oneTask.assignmentType === 1) {  //7是开卡  3是关注店铺 1是浏览会场
            if ($.oneTask.assignmentType === 7) {
                console.log(`任务：${$.oneTask.assignmentName}，尝试领取开卡奖励（不会自动开卡）`);
            } else {
                console.log(`任务：${$.oneTask.assignmentName}，去执行`);
            }
            let subInfo = $.oneTask.ext.followShop || $.oneTask.ext.brandMemberList || $.oneTask.ext.shoppingActivity;
            for (let j of subInfo) {
                if (j) {
                    $.runInfo = j;
                } else {
                    $.runInfo = { 'itemId': null };
                }
                await takeRequest('superBrandDoTask');
                await $.wait(1000);
            }

            $.runFlag = true;
        } else if ($.oneTask.assignmentType === 2) {  //助力任务
            console.log(`助力码：${$.oneTask.ext.assistTaskDetail.itemId}`);
            $.allInvite.push({
                'userName': $.UserName,
                'code': $.oneTask.ext.assistTaskDetail.itemId,
                'time': 0,
                'max': true,
                'encryptAssignmentId': $.oneTask.encryptAssignmentId
            });
        } else if ($.oneTask.assignmentType === 5) {
            let signList = $.oneTask.ext.sign2 || [];
            if (signList.length === 0) {
                console.log(`任务：${$.oneTask.assignmentName},信息异常`);
            }
            //if ($.oneTask.assignmentName.indexOf('首页下拉') !== -1) {
            for (let j = 0; j < signList.length; j++) {
                if (signList[j].status === 1) {
                    console.log(`任务：${$.oneTask.assignmentName},去执行,请稍稍`);
                    let itemId = signList[j].itemId;
                    $.runInfo = { 'itemId': itemId };
                    await takeRequest('superBrandDoTask');
                    await $.wait(3000);
                }
            }
            $.runFlag = true;
            //}
        }
    }
}
async function takeRequest(type) {
    let url = ``;
    let myRequest = ``;
    switch (type) {
        case 'superBrandSecondFloorMainPage':
            url = `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=showSecondFloorRunInfo&t=1680485439158&body=%7B%22source%22:%22run%22%7D`;
            break;
        case 'superBrandTaskList':
            url = `https://api.m.jd.com/?uuid=&client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t=1680485439481&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId},%22assistInfoFlag%22:1%7D`;
            break;
        case 'superBrandDoTask':
            if ($.runInfo.itemId === null) {
                url = `https://api.m.jd.com/api?functionId=superBrandDoTask&appid=ProductZ4Brand&client=wh5&t=${Date.now()}&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId},%22encryptProjectId%22:%22${$.encryptProjectId}%22,%22encryptAssignmentId%22:%22${$.oneTask.encryptAssignmentId}%22,%22assignmentType%22:${$.oneTask.assignmentType},%22completionFlag%22:1,%22itemId%22:%22${$.runInfo.itemId}%22,%22actionType%22:0%7D`;
            } else {
                url = `https://api.m.jd.com/api?functionId=superBrandDoTask&appid=ProductZ4Brand&client=wh5&t=${Date.now()}&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId},%22encryptProjectId%22:%22${$.encryptProjectId}%22,%22encryptAssignmentId%22:%22${$.oneTask.encryptAssignmentId}%22,%22assignmentType%22:${$.oneTask.assignmentType},%22itemId%22:%22${$.runInfo.itemId}%22,%22actionType%22:0%7D`;
            }
            if ($.oneTask.assignmentType === 5) {
                url = `https://api.m.jd.com/api?functionId=superBrandDoTask&appid=ProductZ4Brand&client=wh5&t=${Date.now()}&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId},%22encryptProjectId%22:%22${$.encryptProjectId}%22,%22encryptAssignmentId%22:%22${$.oneTask.encryptAssignmentId}%22,%22assignmentType%22:${$.oneTask.assignmentType},%22itemId%22:%22${$.runInfo.itemId}%22,%22actionType%22:0,%22dropDownChannel%22:1%7D`;
            }
            break;
        case 'superBrandTaskLottery':
            url = `https://api.m.jd.com/api?functionId=superBrandTaskLottery&appid=ProductZ4Brand&client=wh5&t=${Date.now()}&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId}%7D`;
            break;
        case 'help':
            url = `https://api.m.jd.com/api?functionId=superBrandDoTask&appid=ProductZ4Brand&client=wh5&t=${Date.now()}&body=%7B%22source%22:%22run%22,%22activityId%22:${$.activityId},%22encryptProjectId%22:%22${$.encryptProjectId}%22,%22encryptAssignmentId%22:%22${$.encryptAssignmentId}%22,%22assignmentType%22:2,%22itemId%22:%22${$.code}%22,%22actionType%22:0%7D`;
            break;
        default:
            console.log(`错误${type}`);
    }
    myRequest = getRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dealReturn(type, data);
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function dealReturn(type, data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        console.log(`返回信息异常：${data}\n`);
        return;
    }
    switch (type) {
        case 'superBrandSecondFloorMainPage':
            $.bizCode = data.data.bizCode;
            if (data.code === '0' && data.data && data.data.result) {
                $.activityInfo = data.data.result;
            }
            break;
        case 'superBrandTaskList':
            if (data.code === '0') {
                $.taskList = data.data.result.taskList;
            }
            break;
        case 'superBrandDoTask':
            if (data.code === '0') {
                console.log(JSON.stringify(data.data.bizMsg));
            } else {
                console.log(JSON.stringify(data));
            }

            break;
        case 'superBrandTaskLottery':
            if (data.code === '0' && data.data.bizCode !== 'TK000') {
                $.runFlag = false;
                console.log(`抽奖打到上限！`);
            } else if (data.code === '0' && data.data.bizCode == 'TK000') {
                if (data?.data?.result?.rewardComponent?.beanList) {
                    if (data.data.result.rewardComponent.beanList.length > 0) {
                        console.log(`获得豆子：${data.data.result.rewardComponent.beanList[0].quantity}`)
                    }
                } else if (data?.data?.result?.rewardComponent?.couponList) {
                    $.log('获得优惠券');
                } else if (data?.data?.result?.rewardComponent?.realList) {
                    $.log('可能抽中实物，到APP查看！');
                } else {
                    $.log('空气');
                }
            } else {
                $.runFlag = false;
                console.log(`抽奖失败`);
            }
            //console.log(JSON.stringify(data));
            break;

        case 'help':
            if (data.code === '0' && data.data.bizCode === '0') {
                $.codeInfo.time++;
                console.log(`助力成功`);
            } else if (data.code === '0' && data.data.bizCode === '104') {
                $.codeInfo.time++;
                console.log(`已助力过`);
            } else if (data.code === '0' && data.data.bizCode === '108') {
                $.canHelp = false;
                console.log(`助力次数已用完`);
            } else if (data.code === '0' && data.data.bizCode === '103') {
                console.log(`助力已满`);
                $.codeInfo.time = 3;
            } else if (data.code === '0' && data.data.bizCode === '2001') {
                $.canHelp = false;
                console.log(`黑号`);
            } else {
                console.log(JSON.stringify(data));
            }
            break;
        default:
            console.log(JSON.stringify(data));
    }
}

function getRequest(url) {
    const headers = {
        'Origin': `https://pro.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `application/json, text/plain, */*`,
        'Referer': `https://pro.m.jd.com/mall/active/4UgUvnFebXGw6CbzvN6cadmfczuP/index.html`,
        'Host': `api.m.jd.com`,
        'User-Agent': UA,
        'Accept-Language': `zh-cn`,
        'Accept-Encoding': `gzip, deflate, br`
    };
    return { url: url, headers: headers, body: `` };
}

function randomWord(randomFlag, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    // 随机产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
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
                "Cookie": $.cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
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
function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
