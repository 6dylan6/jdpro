let request = require("request");
let CryptoJS = require('crypto-js');
let qs = require("querystring");
Date.prototype.Format = function(fmt) {
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
            var t, a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

function generateFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--;) i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0, 16)
}

function getUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}
class jxAlgo {
    constructor(params = {}) {
        this.appId = 10001
        this.result = {}
        this.timestamp = Date.now();
        for (let i in params) {
            this[i] = params[i]
        }
    }
    set(params = {}) {
        for (let i in params) {
            this[i] = params[i]
        }
    }
    get(key) {
        return this[key]
    }
    async dec(url) {
        if (!this.tk) {
            this.fingerprint = generateFp();
            await this.requestAlgo()
        }
        let obj = qs.parse(url.split("?")[1]);
        let stk = obj['_stk'];
        return this.h5st(this.timestamp, stk, url)
    }
    h5st(time, stk, url) {
        stk = stk || (url ? getUrlData(url, '_stk') : '')
        const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
        let hash1 = this.enCryptMethodJD(this.tk, this.fingerprint.toString(), timestamp.toString(), this.appId.toString(), CryptoJS).toString(CryptoJS.enc.Hex);
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = CryptoJS.HmacSHA256(st, hash1.toString()).toString(CryptoJS.enc.Hex);
        const enc = (["".concat(timestamp.toString()), "".concat(this.fingerprint.toString()), "".concat(this.appId.toString()), "".concat(this.tk), "".concat(hash2)].join(";"))
        this.result['fingerprint'] = this.fingerprint;
        this.result['timestamp'] = this.timestamp
        this.result['stk'] = stk;
        this.result['h5st'] = enc
        let sp = url.split("?");
        let obj = qs.parse(sp[1])
        if (obj.callback) {
            delete obj.callback
        }
        let params = Object.assign(obj, {
            '_time': this.timestamp,
            '_': this.timestamp,
            'timestamp': this.timestamp,
            'sceneval': 2,
            'g_login_type': 1,
            'h5st': enc,
        })
        this.result['url'] = `${sp[0]}?${qs.stringify(params)}`
        return this.result
    }
    token(user) {
        let nickname = user.includes('pt_pin') ? user.match(/pt_pin=([^;]+)/)[1] : user;
        let phoneId = this.createuuid(40, 'lc');

        let token = this.md5(decodeURIComponent(nickname) + this.timestamp + phoneId + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy');
        return {
            'strPgtimestamp': this.timestamp,
            'strPhoneID': phoneId,
            'strPgUUNum': token
        }
    }
    md5(encryptString) {
        return CryptoJS.MD5(encryptString).toString()
    }
    createuuid(a, c) {
        switch (c) {
            case "a":
                c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                break;
            case "n":
                c = "0123456789";
                break;
            case "c":
                c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                break;
            case "l":
                c = "abcdefghijklmnopqrstuvwxyz";
                break;
            case 'cn':
            case 'nc':
                c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                break;
            case "lc":
            case "cl":
                c = "abcdefghijklmnopqrstuvwxyz0123456789";
                break;
            default:
                c = "0123456789abcdef"
        }
        var e = "";
        for (var g = 0; g < a; g++) e += c[Math.ceil(1E8 * Math.random()) % c.length];
        return e
    }
    async requestAlgo() {
        const options = {
            "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
            "headers": {
                'Authority': 'cactus.jd.com',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'User-Agent': 'jdpingou;iPhone;4.9.4;12.4;ae49fae72d0a8976f5155267f56ec3a5b0da75c3;network/wifi;model/iPhone8,4;appBuild/100579;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
                'Content-Type': 'application/json',
                'Origin': 'https://st.jingxi.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html?ptag=7155.9.4',
                'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
            },
            'body': JSON.stringify({
                "version": "1.0",
                "fp": this.fingerprint,
                "appId": this.appId.toString(),
                "timestamp": this.timestamp,
                "platform": "web",
                "expandParams": ""
            })
        }
        return new Promise(async resolve => {
            request.post(options, (err, resp, data) => {
                try {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            let result = data.data.result
                            this.tk = result.tk;
                            let enCryptMethodJDString = result.algo;
                            if (enCryptMethodJDString) {
                                this.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                            }
                            this.result = result
                        }
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    resolve(this.result);
                }
            })
        })
    }
}
module.exports = jxAlgo
