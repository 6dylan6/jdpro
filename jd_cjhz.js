/*
京东超级盒子
更新时间：2022-1-9
活动入口：京东APP-搜索-超级盒子
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东超级盒子
24 3,13 * * * https://raw.githubusercontent.com/msechen/script/main/jd_cjhz.js, tag=京东超级盒子, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true
================Loon==============
[Script]
cron "24 3,13 * * *" script-path=https://raw.githubusercontent.com/msechen/script/main/jd_cjhz.js,tag=京东超级盒子
===============Surge=================
京东超级盒子 = type=cron,cronexp="24 3,13 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/msechen/script/main/jd_cjhz.js
============小火箭=========
京东超级盒子 = type=cron,script-path=https://raw.githubusercontent.com/msechen/script/main/jd_cjhz.js, cronexpr="24 3,13 * * *", timeout=3600, enable=true
 */

const $ = new Env('京东超级盒子');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '',
    secretp = '',
    joyToken = "";
$.shareCoseList = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/client.action`;
!(async () => {
    console.log('活动入口：京东APP-搜索-超级盒子')
    console.log('开箱目前结果为空气和红包，没发现豆子')
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    await getToken();
    cookiesArr = cookiesArr.map(ck => ck + `joyytoken=50084${joyToken};`)
    $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                continue
            }
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            console.log(`\n入口：app主页搜超级盒子\n`);
            await main()
        }
    };
    $.shareCoseList = [...new Set([...$.shareCoseList])]
    //去助力与开箱
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                continue
            }
            if ($.shareCoseList.length >= 2) {
                for (let y = 0; y < $.shareCoseList.length; y++) {
                    console.log(`京东账号${$.index} ${$.nickName || $.UserName}去助力${$.shareCoseList[y]}`)
                    await helpShare({ "taskId": $.helpId, "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": $.shareCoseList[y] });
                    await $.wait(1000);
                }
            }
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                continue
            }            
            //开箱
            console.log(`京东账号${$.index}去开箱`)
            for (let y = 0; y < $.lotteryNumber; y++) {
                console.log(`可以开箱${$.lotteryNumber}次 ==>>第${y+1}次开箱`)
                await openBox({ "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": "" });
                await $.wait(1000);
            }
        }
    }
})()
.catch((e) => $.logErr(e))
    .finally(() => $.done())

async function main() {
    await superboxSupBoxHomePage({ "taskId": "", "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": "" })
    console.log(`【京东账号${$.index}】${$.nickName || $.UserName}互助码：${$.encryptPin}`)
    await $.wait(1000);
    await apTaskList({ "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": $.encryptPin });
    if ($.allList) {
        for (let i = 0; i < $.allList.length; i++) {
            $.oneTask = $.allList[i];
            if (["SHARE_INVITE"].includes($.oneTask.taskType)) {
                $.helpId = $.oneTask.id;
                $.helpLimit = $.oneTask.taskLimitTimes;
            };
            if (["BROWSE_SHOP"].includes($.oneTask.taskType) && $.oneTask.taskFinished === false) {
                await apTaskDetail({ "taskId": $.oneTask.id, "taskType": $.oneTask.taskType, "channel": 4, "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": "7pcfSWHrAG9MKu3RKLl127VL5L4aIE1sZ1eRRdphpl8" });
                await $.wait(1000)
                for (let y = 0; y < ($.doList.status.finishNeed - $.doList.status.userFinishedTimes); y++) {
                    $.startList = $.doList.taskItemList[y];
                    $.itemName = $.doList.taskItemList[y].itemName;
                    console.log(`去浏览${$.itemName}`)
                    await apDoTask({ "taskId": $.allList[i].id, "taskType": $.allList[i].taskType, "channel": 4, "itemId": $.startList.itemId, "linkId": "Ll3Qb2mhCXSEWxruhv8qIw", "encryptPin": "7pcfSWHrAG9MKu3RKLl127VL5L4aIE1sZ1eRRdphpl8" })
                    await $.wait(1000)
                }
            }
        }
    } else {
        console.log(`任务全部完成`)
    }
}

//活动主页
function superboxSupBoxHomePage(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('superboxSupBoxHomePage', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} superboxSupBoxHomePage API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.encryptPin = data.data.encryptPin;
                        $.shareCoseList.push($.encryptPin)
                        $.lotteryNumber = data.data.lotteryNumber
                    } else {
                        console.log(`superboxSupBoxHomePage：${JSON.stringify(data)}\n`);
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


//获取任务列表
function apTaskList(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('apTaskList', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apTaskList API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.allList = data.data
                        //console.log(JSON.stringify($.allList[1]));
                    } else {
                        console.log(`apTaskList错误：${JSON.stringify(data)}\n`);
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

//获取任务分表
function apTaskDetail(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('apTaskDetail', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apTaskDetail API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.doList = data.data
                        //console.log(JSON.stringify($.doList));
                    } else {
                        console.log(`apTaskDetail错误：${JSON.stringify(data)}\n`);
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

//做任务
function apDoTask(body) {
    return new Promise((resolve) => {
        $.post(taskPostUrl('apDoTask', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apDoTask API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0) {
                        console.log(`浏览${$.itemName}完成\n已完成${data.data.userFinishedTimes}次\n`)
                    } else if (data.success === false && data.code === 2005) {
                        console.log(`${data.data.errMsg}${data.data.userFinishedTimes}次`)
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

//助力
function helpShare(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('superboxSupBoxHomePage', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} superboxSupBoxHomePage API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0) {
                        console.log(`助力成功\n\n`)
                    } else {
                        console.log(`助力失败：${JSON.stringify(data)}\n\n`)
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

//开盲盒
function openBox(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('superboxOrdinaryLottery', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} superboxOrdinaryLottery API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0 && data.data.rewardType === 2) {
                        console.log(`开箱成功获得${data.data.discount}元红包\n\n`)
                    } else if (data.success === true && data.code === 0 && data.data.rewardType !== 2) {
                        console.log(`开箱成功应该获得了空气${JSON.stringify(data.data)}\n\n`)
                    } else {
                        console.log(`失败：${JSON.stringify(data)}\n\n`)
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

function getToken(timeout = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://bh.m.jd.com/gettoken`,
                headers: {
                    'Content-Type': `text/plain;charset=UTF-8`
                },
                body: `content={"appname":"50084","whwswswws":"","jdkey":"","body":{"platform":"1"}}`
            }
            $.post(url, async (err, resp, data) => {
                try {
                    data = JSON.parse(data);
                    joyToken = data.joyytoken;
                    console.log(`joyToken = ${data.joyytoken}`)
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}

function taskGetUrl(functionId, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}&body=${JSON.stringify(body)}&_t=${Date.now()}&appid=activities_platform&client=wh5&clientVersion=1.0.0`,
        //body: `functionId=${functionId}&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0&uuid=ef746bc0663f7ca06cdd1fa724c15451900039cf`,
        headers: {
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Origin': 'https://prodev.m.jd.com',
            'Referer': 'https://pro.m.jd.com/mall/active/j8U2SMhmw3aKgfWwYQfoRR4idTT/index.html?',
        }
    }
}

function taskPostUrl(functionId, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        body: `functionId=${functionId}&body=${JSON.stringify(body)}&_t=${Date.now()}&appid=activities_platform&client=wh5&clientVersion=1.0.0`,
        headers: {
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Origin': 'https://prodev.m.jd.com',
            'Referer': 'https://pro.m.jd.com/mall/active/j8U2SMhmw3aKgfWwYQfoRR4idTT/index.html?',
        }
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
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch {}
            return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } };
                this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => {})) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t;
                e(s, i, i && i.body) })) } post(t, e = (() => {})) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t));
            else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t;
                this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                    e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t;
                    e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }