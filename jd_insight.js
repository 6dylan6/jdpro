/**
京洞察问卷通知
35 9 * * * jd_insight.js
*/


const $ = new Env('京东调研问卷')
const notify = $.isNode() ? require('./sendNotify') : ''
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : ''
//IOS等用户直接用NobyDa的jd cookie

let cookiesArr = [], cookie = '', message = '', messageTitle = '', messageBottom = ''

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    }
    if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0)
} else {
    let cookiesData = $.getdata('CookiesJD') || '[]'
    cookiesData = jsonParse(cookiesData)
    cookiesArr = cookiesData.map(item => item.cookie)
    cookiesArr.reverse()
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')])
    cookiesArr.reverse()
    cookiesArr = cookiesArr.filter(item => item !== '' && item !== null && item !== undefined)
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    for (let i = 0; i < cookiesArr.length && true; i++) {
        if (cookiesArr[i]) {
            $.index = i + 1;
            $.cookie = cookiesArr[i];
            $.nickName = ''
            $.UserName = decodeURIComponent($.cookie.match(/pin=([^; ]+)(?=;?)/) && $.cookie.match(/pin=([^; ]+)(?=;?)/)[1]);
            $.isLogin = true;
            console.log(`\n=====开始【京东账号${$.index}】${$.nickName || $.UserName}=====\n`);
            await getUA()
            await TotalBean();
            if (!$.isLogin) {
                console.log("Cookie已失效. . .")
                continue
            }
            await run()
        }
    }
    await showMsg()

})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


function showMsg() {
    return new Promise(async resolve => {
        console.log('\n运行完毕')
        if (message) {
            $.msg($.name, '', `${message}`)
            if ($.isNode()) {
                await notify.sendNotify(`${$.name}`, `${message}`)
            }
        }
        resolve()
    })
}

async function run() {
    try {
        $.surveyList = []
        await takePostRequest('有奖问答列表');
        if ($.surveyList.length > 0) {
            let n = 1
            for (let s of $.surveyList) {
                console.log(`${n}、[${s.title}] ${s.subTitle}\n${s.answerUrl}\n`)
                if (!message.includes(`账号${$.index}`)) message += `【账号${$.index}】${$.UserName}\n`
                message += `${n}、[${s.title}] ${s.subTitle}\n${s.answerUrl}\n`
                $.answerUrl = s.answerUrl
                $.survey_id = ''
                $.short_code = ''
                await takePostRequest('有奖问答页面');
                // console.log($.survey_id,$.short_code)
                if ($.survey_id && $.short_code) {
                    await takePostRequest('有奖问答题目');
                    console.log()
                }
                n++
            }
        } else {
            console.log("无任何信息")
        }
    } catch (e) {
        console.log(e)
    }
}

async function takePostRequest(type) {
    if ($.outFlag) return
    let url = '';
    let body = ``;
    let method = 'POST'
    let headers = ''
    switch (type) {
        case '有奖问答列表':
            url = `https://answer.jd.com/community/survey/list`;
            method = 'GET'
            headers = {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "Cookie": $.cookie,
                "Origin": `https://prodev.m.jd.com`,
                "Referer": `https://prodev.m.jd.com/mall/active/2TADa7HkFatzGyeNG6KWZFyh96wM/index.html`,
                "User-Agent": $.UA
            }
            break;
        case '有奖问答页面':
            url = $.answerUrl;
            method = 'GET'
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Cookie": $.cookie,
                "User-Agent": $.UA
            }
            break;
        case '有奖问答题目':
            url = `https://answer.jd.com/answer/getSurveyDetail?surveyId=${$.survey_id}&shortCode=${$.short_code}`;
            method = 'GET'
            headers = {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Cookie": $.cookie,
                "Referer": $.answerUrl,
                "User-Agent": $.UA
            }
            break;
        default:
            console.log(`错误${type}`);
    }
    if (!url) return
    let myRequest = getPostRequest(url, body, headers, method);
    return new Promise(async resolve => {
        $[method.toLocaleLowerCase()](myRequest, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.toStr(err, err)}`)
                    console.log(`${type} API请求失败，请检查网路重试`)
                } else {
                    await dealReturn(type, data);
                }
            } catch (e) {
                console.log(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function dealReturn(type, data) {
    let res = ''
    try {
        if (type != 'accessLogWithAD' || type != 'drawContent') {
            if (data) {
                res = $.toObj(data, data);
            }
        }
    } catch (e) {
        console.log(`${type} 执行任务异常`);
        console.log(data);
        $.runFalag = false;
    }
    try {
        switch (type) {
            case '有奖问答列表':
                if (typeof res == 'object') {
                    if (res['messages'] && res['result'] == true && res['messages']['list']) {
                        for (let i of res['messages']['list']) {
                            if (i.type == 1) {
                                $.surveyList = i.surveyList;
                            }
                        }
                    } else {
                        console.log(`${type}-> ${data}`);
                    }
                } else {
                    console.log(`${type}-> ${data}`);
                }
                break;
            case '有奖问答页面':
                // console.log(data)
                try {
                    $.survey_id = data.match(/id="?survey-id"? value="?([^>]+)"?/)[1]
                } catch (e) { }
                if (!$.survey_id) {
                    try {
                        $.survey_id = data.match(/surveyId: ?['"]([^'"]+)['"]/)[1]
                    } catch (e) { }
                }
                try {
                    $.short_code = data.match(/id="?short-code"? value="?([^>]+)"?/)[1]
                } catch (e) { }
                break;
            case '有奖问答题目':
                // console.log(data)
                let index1 = []
                try {
                    index1 = res.messages.jsonStr.pages
                } catch (e) { }
                for (let i of index1) {
                    for (let q of i.questions) {
                        let arr = []
                        for (let o in q.options) {
                            let arr1 = q.options[o]
                            if (arr1.goto == '-2') arr.push(delhtml(arr1.text))
                        }
                        if (arr.length > 0) console.log("题目：" + delhtml(q.title) + "\n  不要选：" + arr.join("\n        "))
                    }
                }
                break;
            default:
                console.log(`${type}-> ${data}`);
        }
        if (typeof res == 'object') {
            if (res.errorMessage) {
                if (res.errorMessage.indexOf('火爆') > -1) {
                    $.hotFlag = true
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
}
function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                Host: "me-api.jd.com",
                Accept: "*/*",
                Connection: "keep-alive",
                Cookie: $.cookie,
                "User-Agent": $.UA,
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        let res = $.toObj(data, data);
                        if (typeof res == 'object') {
                            if (res['retcode'] === "1001") {
                                $.isLogin = false; //cookie过期
                                return;
                            }
                            if (res['retcode'] === "0" && res.data && res.data.hasOwnProperty("userInfo")) {
                                $.nickName = res.data.userInfo.baseInfo.nickname;
                            }
                        }
                    } else {
                        $.log('京东服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}

function getPostRequest(url, body, headers = '', method = "POST") {
    let headers_only = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-Hans-CN;q=1",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": $.cookie,
        "User-Agent": $.UA
    }
    if (!headers) {
        headers = headers_only
    }
    // console.log(headers)
    // console.log(headers.Cookie)
    const options = { url: url, method: method, headers: headers, body: body, timeout: 10000 };
    if (method == "GET") {
        delete options.body
    }
    return options
}

async function getUA() {
    $.UA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36`
}

function delhtml(text) {
    return text && text.replace(/<\/?[\w \-"=:(),;+]+>/g, '').trim() || text
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

function Env(t, e) { 'undefined' != typeof process && JSON.stringify(process.env).indexOf('GITHUB') > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = 'GET') { t = 'string' == typeof t ? { url: t } : t; let s = this.get; return 'POST' === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, 'POST') } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = 'box.dat', this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = '\n', this.startTime = (new Date).getTime(), Object.assign(this, e), this.log('', `🔔${this.name}, 开始!`) } isNode() { return 'undefined' != typeof module && !!module.exports } isQuanX() { return 'undefined' != typeof $task } isSurge() { return 'undefined' != typeof $httpClient && 'undefined' == typeof $loon } isLoon() { return 'undefined' != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata('@chavy_boxjs_userCfgs.httpapi'); i = i ? i.replace(/\n/g, '').trim() : i; let r = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout'); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split('@'), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: 'cron', timeout: r }, headers: { 'X-Key': o, Accept: '*/*' } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require('fs'), this.path = this.path ? this.path : require('path'); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require('fs'), this.path = this.path ? this.path : require('path'); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, '.$1').split('.'); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ''; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, '') : e } catch (t) { e = '' } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? 'null' === o ? null : o || '{}' : '{}'; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require('got'), this.cktough = this.cktough ? this.cktough : require('tough-cookie'), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers['Content-Type'], delete t.headers['Content-Length']), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on('redirect', (t, e) => { try { if (t.headers['set-cookie']) { const s = t.headers['set-cookie'].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers['Content-Type'] && (t.headers['Content-Type'] = 'application/x-www-form-urlencoded'), t.headers && delete t.headers['Content-Length'], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = 'POST', this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { 'M+': s.getMonth() + 1, 'd+': s.getDate(), 'H+': s.getHours(), 'm+': s.getMinutes(), 's+': s.getSeconds(), 'q+': Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + '').substr(4 - RegExp.$1.length))); for (let e in i) new RegExp('(' + e + ')').test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ('00' + i[e]).substr(('' + i[e]).length))); return t } msg(e = t, s = '', i = '', r) { const o = t => { if (!t) return t; if ('string' == typeof t) return this.isLoon() ? t : this.isQuanX() ? { 'open-url': t } : this.isSurge() ? { url: t } : void 0; if ('object' == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t['open-url'], s = t.mediaUrl || t['media-url']; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t['open-url'] || t.url || t.openUrl, s = t['media-url'] || t.mediaUrl; return { 'open-url': e, 'media-url': s } } if (this.isSurge()) { let e = t.url || t.openUrl || t['open-url']; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ['', '==============📣系统通知📣==============']; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join('\n')), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log('', `❗️${this.name}, 错误!`, t.stack) : this.log('', `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log('', `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
