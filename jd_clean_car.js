/*
清空购物车
更新时间：2022-12-24
因其他脚本会加入商品到购物车，故此脚本用来清空购物车
包括预售
需要算法支持
默认：不执行 如需要请添加环境变量
JD_CART_REMOVE="true"

——————————————
1.@&@ 前面加数字 指定账号pin
如果有中文请填写中文
2.|-| 账号之间隔开
3.英文大小写请填清楚
4.优先匹配账号再匹配*
5.定义不清空的[商品]名称支持模糊匹配
6.pin@&@ 👉 指定账号(后面添加商品 前面账号[pin] *表示所有账号
7.|-| 👉 账号之间隔开
——————————————

商品名称规则,默认所有账号全清空
——————gua_cleancart_products————————
pin2@&@商品1,商品2👉该pin这几个商品名不清空
pin5@&@👉该pin全清
pin3@&@不清空👉该pin不清空
*@&@不清空👉所有账号不请空
*@&@👉所有账号清空

优先匹配账号再匹配*
|-| 👉 账号之间隔开
有填帐号pin则*不适配
——————————————
如果有不清空的一定要加上"*@&@不清空"
防止没指定的账号购物车全清空

*/

const $ = new Env('清空购物车');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
const dy = require('./function/dylanx.js');
//IOS等用户直接用NobyDa的jd cookie
let cleancartRun = 'false'
let cleancartProducts = ''
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

message = ''

cleancartRun = $.isNode() ? (process.env.JD_CART_REMOVE ? process.env.JD_CART_REMOVE : `${cleancartRun}`) : ($.getdata('JD_CART_REMOVE') ? $.getdata('JD_CART_REMOVE') : `${cleancartRun}`);

cleancartProducts = $.isNode() ? (process.env.gua_cleancart_products ? process.env.gua_cleancart_products : '*@&@') : ($.getdata('gua_cleancart_products') ? $.getdata('gua_cleancart_products') : `${cleancartProducts}`);

let productsArr = []
let cleancartProductsAll = []
for (let i of cleancartProducts && cleancartProducts.split('|-|')) {
    productsArr.push(i)
}
for (let i of cleancartProducts && cleancartProducts.split('|-|')) {
    productsArr.push(i)
}
for (let i in productsArr) {
    if (productsArr[i].indexOf('@&@') > -1) {
        let arr = productsArr[i].split('@&@')
        cleancartProductsAll[arr[0]] = arr[1].split(',')
    }
}

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }
    if (cleancartRun !== 'true') {
        console.log('脚本停止\n请添加环境变量JD_CART_REMOVE为"true"')
        return
    }
    if (!cleancartProducts) {
        console.log('脚本停止\n请添加环境变量[gua_cleancart_products]\n清空商品\n内容规则看脚本文件')
        return
    }

    $.out = false
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (cleancartProductsAll[$.UserName]) {
                $.cleancartProductsArr = cleancartProductsAll[$.UserName]
            } else if (cleancartProductsAll["*"]) {
                $.cleancartProductsArr = cleancartProductsAll["*"]
            } else $.cleancartProductsArr = false
            if ($.cleancartProductsArr) console.log($.cleancartProductsArr)
            await run();
            if ($.out) break
        }
    }
    if (message) {
        $.msg($.name, ``, `${message}`);
        if ($.isNode()) {
            await notify.sendNotify(`${$.name}`, `${message}`);
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function run() {
    try {
        let msg = ''
        let signBody = `{"homeWishListUserFlag":"1","userType":"0","updateTag":true,"showPlusEntry":"2","hitNewUIStatus":"1","cvhv":"049591","cartuuid":"hjudwgohxzVu96krv/T6Hg==","adid":""}`
        let body = await dy.getbody('cartClearQuery', signBody)
        if ($.out) return
        if (!body) {
            console.log('获取不到算法')
            return
        }
        let data = await jdApi('cartClearQuery', body)
        let res = $.toObj(data, data);
        if (typeof res == 'object' && res) {
            if (res.resultCode == 0) {
                if (!res.clearCartInfo || !res.subTitle) {
                    msg += `${res.mainTitle}\n`
                    console.log(res.mainTitle)
                } else {
                    let num = 0
                    if (res.subTitle) {
                        num = res.subTitle.match(/共(\d+)件商品/).length > 0 && res.subTitle.match(/共(\d+)件商品/)[1] || 0
                        msg += res.subTitle + "\n"
                        console.log(res.subTitle)
                    }
                    // console.log(`共${num}件商品`)
                    if (num != 0) {
                        let operations = []
                        let operNum = 0
                        for (let a of res.clearCartInfo || {}) {
                            // console.log(a.groupName)
                            // if(a.groupName.indexOf('7天前加入购物车') > -1){
                            for (let s of a.groupDetails || []) {
                                if (toSDS(s.name)) {
                                    // console.log(s.unusable,s.skuUuid,s.name)
                                    operNum += s.clearSkus && s.clearSkus.length || 1;
                                    operations.push({
                                        "itemType": s.itemType + "",
                                        "suitType": s.suitType,
                                        "skuUuid": s.skuUuid + "",
                                        "itemId": s.itemId || s.skuId,
                                        "useUuid": typeof s.useUuid !== 'undefined' && s.useUuid || false
                                    })
                                }
                            }
                            // }
                        }
                        console.log(`准备清空${operNum}件商品`)
                        if (operations.length == 0) {
                            console.log(`清空${operNum}件商品|没有找到要清空的商品`)
                            msg += `清空${operNum}件商品|没有找到要清空的商品\n`
                        } else {
                            let clearBody = `{"homeWishListUserFlag":"1","userType":"0","updateTag":false,"showPlusEntry":"2","hitNewUIStatus":"1","cvhv":"049591","cartuuid":"hjudwgohxzVu96krv/T6Hg==","operations":${$.toStr(operations, operations)},"adid":"","coord_type":"0"}`
                            clearBody = await dy.getbody('cartClearRemove', clearBody)
                            if ($.out) return
                            if (!clearBody) {
                                console.log('获取不到算法')
                            } else {
                                let clearData = await jdApi('cartClearRemove', clearBody)
                                let clearRes = $.toObj(clearData, clearData);
                                if (typeof clearRes == 'object') {
                                    if (clearRes.resultCode == 0) {
                                        msg += `清空${operNum}件商品|✅\n`
                                        console.log(`清空${operNum}件商品|✅\n`)
                                    } else if (clearRes.mainTitle) {
                                        msg += `清空${operNum}件商品|${clearRes.mainTitle}\n`
                                        console.log(`清空${operNum}件商品|${clearRes.mainTitle}\n`)
                                    } else {
                                        msg += `清空${operNum}件商品|❌\n`
                                        console.log(`清空${operNum}件商品|❌\n`)
                                        console.log(clearData)
                                    }
                                } else {
                                    msg += `清空${operNum}件商品|❌\n`
                                    console.log(`清空${operNum}件商品|❌\n`)
                                    console.log(clearData)
                                }
                            }
                        }
                    } else if (res.mainTitle) {
                        msg += `${res.mainTitle}\n`
                        console.log(res.mainTitle)
                    } else {
                        msg += `未识别到购物车有商品\n`
                        console.log(data)
                    }
                }
            } else {
                console.log(data)
            }
        } else {
            console.log(data)
        }
        if (msg) {
            message += `【京东账号${$.index}】${$.nickName || $.UserName}\n${msg}\n`
        }
        await $.wait(parseInt(Math.random() * 2000 + 2000, 10))
    } catch (e) {
        console.log(e)
    }
}
function toSDS(name) {
    let res = true
    if ($.cleancartProductsArr === false) return false
    for (let t of $.cleancartProductsArr || []) {
        if (t && name.indexOf(t) > -1 || t == '不清空') {
            res = false
            break
        }
    }
    return res
}
function jdApi(functionId, body) {
    if (!functionId || !body) return
    return new Promise(resolve => {
        $.post(taskPostUrl(`/client.action?functionId=${functionId}`, body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.toStr(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // console.log(data)
                    let res = $.toObj(data, data);
                    if (typeof res == 'object') {
                        if (res.mainTitle) console.log(res.mainTitle)
                        if (res.resultCode == 0) {
                            resolve(res);
                        } else if (res.tips && res.tips.includes("正在努力加载")) {
                            console.log("请求太快，ip被限制了")
                            $.out = true
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve('');
            }
        })
    })
}


function taskPostUrl(url, body) {
    return {
        url: `https://api.m.jd.com${url}`,
        body: body,
        headers: {
            "Accept": "*/*",
            "Accept-Language": "zh-cn",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            'Cookie': `${cookie}`,
            "Host": "api.m.jd.com",
            "User-Agent": "JD4iPhone/167853 (iPhone; iOS; Scale/2.00)",
        }
    }
}

function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
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


