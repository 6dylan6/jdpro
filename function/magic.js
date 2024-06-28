// noinspection JSUnresolvedFunction,JSUnresolvedVariable

const axios = require('axios');
const fs = require("fs");
const {format} = require("date-fns");
const notify = require('./sendNotify');
const jdCookieNode = require('./jdcookie.js');
const CryptoJS = require("crypto-js");

let cookies = [];
let testMode = process.env.TEST_MODE?.includes('on') ? true
    : __dirname.includes("magic")

let mode = process.env.MODE ? process.env.MODE : "local"

let apiToken = process.env.M_API_TOKEN ? process.env.M_API_TOKEN : ""
let apiSignUrl = process.env.M_API_SIGN_URL ? process.env.M_API_SIGN_URL : "http://158.101.153.139:19840/sign"

let wxBlackCookiePin = process.env.M_WX_BLACK_COOKIE_PIN
    ? process.env.M_WX_BLACK_COOKIE_PIN : ''

Object.keys(jdCookieNode).forEach((item) => {
    cookies.push(jdCookieNode[item])
})

const JDAPP_USER_AGENTS = [
    `jdapp;android;10.0.2;9;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;9;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;9;${uuid()};network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;9;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;11;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;10;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;11;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36`,
    `jdapp;iPhone;10.0.2;14.2;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.3;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.2;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;11.4;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79`,
    `jdapp;android;10.0.2;10;;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36`,
    `jdapp;iPhone;10.0.2;14.3;${uuid()};network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.6;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.6;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.5;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.1;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.3;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.7;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.1;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.3;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;13.4;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.3;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.3;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.3;${uuid()};network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;iPhone;10.0.2;14.1;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;android;10.0.2;8.1.0;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36`,
    `jdapp;android;10.0.2;8.0.0;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36`,
    `jdapp;iPhone;10.0.2;14.0.1;${uuid()};network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
    `jdapp;android;10.0.2;8.1.0;${uuid()};network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36`,
]

//来源于kedaya大佬
const ISV_OBFUSCATOR = {
    'lzkj-isv.isvjcloud.com': [
        'body=%7B%22url%22%3A%22https%3A%2F%2Flzkj-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=1d9f7760c9ffaad4eb&client=apple&clientVersion=10.0.10&st=1646999134752&sv=112&sign=d14c9517190f8a8b0e253e3dbbdee87a',
    ],
    'cjhy-isv.isvjcloud.com': [
        'body=%7B%22url%22%3A%22https%3A%2F%2Fcjhy-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=b024526b380d35c9e3&client=apple&clientVersion=10.0.10&st=1646999134786&sv=111&sign=fd9417f9d8e872da6c55102bd69da99f',
    ],
    'txzj-isv.isvjcloud.com': [
        'body=%7B%22url%22%3A%22https%3A%2F%2Ftxzj-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=f7fc9bef85a8620cdf&client=apple&clientVersion=10.0.10&st=1646999134805&sv=121&sign=bbe137e2f52dbf3a1f10fa2ffe749d05',
    ],
    'lzdz1-isv.isvjcloud.com': [
        'body=%7B%22url%22%3A%20%22https%3A//lzdz1-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=72124265217d48b7955781024d65bbc4&client=apple&clientVersion=9.4.0&st=1621796702000&sv=120&sign=14f7faa31356c74e9f4289972db4b988'
    ],
    'cjhydz-isv.isvjcloud.com': [
        'adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2'
    ],
}
const $ = axios.create({timeout: 30000});
$.defaults.headers['Accept'] = '*/*';
$.defaults.headers['Connection'] = 'keep-alive';
$.defaults.headers['Accept-Language'] = "zh-CN,zh-Hans;q=0.9";
$.defaults.headers['Accept-Encoding'] = "gzip, deflate, br";

function uuid(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    return x.replace(/[xy]/g, function (x) {
        const r = 16 * Math.random() | 0, n = "x" === x ? r : 3 & r | 8;
        return n.toString(36)
    })
}

class Env {
    constructor(name) {
        this.name = name
        this.username = '';
        this.cookie = '';
        this.cookies = cookies;
        this.index = '';
        this.ext = [];
        this.msg = [];
        this.delimiter = '';
        this.filename = ''
        this.lz = ''
        this.appId = '';
        this.algo = {};
        this.bot = false;
        this.expire = false;
        this.accounts = {};
    }

    async run(data = {
        wait: [1000, 2000],
        bot: false,
        delimiter: '',
        o2o: false,
        random: false,
        once: false,
        blacklist: [],
        whitelist: []
    }) {
        console.log('运行参数：', data);
        this.filename = process.argv[1];
        console.log(`${this.now()} ${this.name} ${this.filename} 开始运行...`);
        this.start = this.timestamp();
        let accounts = "";
        if (__dirname.includes("magic")) {
            accounts = this.readFileSync(
                '/home/magic/Work/wools/doc/account.json')
        } else {
            if (fs.existsSync('utils/account.json')) {
                accounts = this.readFileSync('utils/account.json')
            } else {
                accounts = this.readFileSync('account.json')
            }
        }
        accounts ? JSON.parse(accounts).forEach(
            o => this.accounts[o.pt_pin] = o.remarks) : ''
        await this.config()
        if (data?.delimiter) {
            this.delimiter = data?.delimiter
        }
        if (data?.bot) {
            this.bot = data.bot;
        }

        console.log('原始ck长度', cookies.length)
        if (data?.blacklist?.length > 0) {
            for (const cki of this.__as(data.blacklist)) {
                delete cookies[cki - 1];
            }
        }
        this.delBlackCK()
        console.log('排除黑名单后ck长度', cookies.length)
        if (data?.whitelist?.length > 0) {
            let cks = []
            for (const cki of this.__as(data.whitelist)) {
                if (cki - 1 < cookies.length) {
                    cks.push(cookies[cki - 1])
                }
            }
            cookies = cks;
        }
        console.log('设置白名单后ck长度', cookies.length)

        if (data?.random) {
            cookies = this.randomArray(cookies)
        }
        await this.verify()
        this.cookies = cookies;
        if (data?.before) {
            for (let i = 0; i <= this.cookies.length; i++) {
                if (this.cookies[i] && !this.expire) {
                    let cookie = this.cookies[i];
                    this.cookie = cookie;
                    this.username = decodeURIComponent(
                        cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
                    $.defaults.headers['Cookie'] = this.cookie;
                    this.index = i + 1;
                    let me = {
                        username: this.username,
                        index: this.index,
                        cookie: this.cookie
                    };
                    try {
                        this.ext.push(Object.assign(me, await this.before()));
                    } catch (e) {
                        console.log(e)
                    }
                    if (data?.wait?.length > 0 && this.index
                        !== cookies.length) {
                        await this.wait(data?.wait[0], data?.wait[1])
                    }
                }
            }
        }
        let once = false;
        for (let i = 0; i <= this.cookies.length; i++) {
            if (this.cookies[i] && !this.expire) {
                this.index = i + 1;
                if (data?.once && this.index !== data.once) {
                    once = true;
                    continue;
                }
                let cookie = this.cookies[i];
                this.cookie = cookie;
                this.username = decodeURIComponent(
                    cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
                $.defaults.headers['Cookie'] = this.cookie;
                this.index = i + 1;
                try {
                    await this.logic()
                    if (data?.o2o) {
                        await this.send();
                        testMode ? this.log(this.msg.join("\n")) : ''
                        this.msg = [];
                    }
                    if (once) {
                        break;
                    }
                } catch (e) {
                    console.log(e.message || '')
                }
                if (data?.wait?.length > 0 && this.index !== cookies.length) {
                    await this.wait(data?.wait[0], data?.wait[1])
                }
            }
        }
        await this.after()
        console.log(`${this.now()} ${this.name} 运行结束,耗时 ${this.timestamp()
        - this.start}ms\n`)
        testMode && this.msg.length > 0 ? console.log(this.msg.join("\n")) : ''
        if (!data?.o2o) {
            await this.send();
        }
    }

    async config() {

    }

    delBlackCK() {
        let strArrTemp = []
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i]) {
                let cookie = cookies[i]
                let pt_pin = decodeURIComponent(
                    cookie.match(/pt_pin=(.+?);/) && cookie.match(
                    /pt_pin=(.+?);/)[1]);
                if (wxBlackCookiePin.includes(pt_pin)) {
                    this.log("剔除黑号CK:" + pt_pin);
                    continue;
                }
                strArrTemp.push(cookie);
            }
        }
        cookies = strArrTemp;
    }

    me() {
        return this.ext[this.index - 1]
    }

    finish() {
        this.ext[this.index - 1].finish = true
    }

    __as(es) {
        console.log(es)

        let b = [];
        for (let e of es) {
            if (typeof e === 'string') {
                let start = e.split('-')[0] * 1
                let end = e.split('-')[1] * 1
                if (end - start === 1) {
                    b.push(start)
                    b.push(end)
                } else {
                    for (let i = start; i <= end; i++) {
                        b.push(i)
                    }
                }
            } else {
                b.push(e)
            }
        }
        console.log(b)
        return b
    }

    deleteCookie() {
        delete this.cookies[this.index - 1]
        return {};
    }

    groupBy(arr, fn) {
        const data = {};
        arr.forEach(function (o) {
            const k = fn(o);
            data[k] = data[k] || []
            data[k].push(o)
        })

        return data;
    }

    async send() {
        if (this.msg?.length > 0) {
            this.msg.push(
                `\n时间：${this.now()} 时长：${((this.timestamp() - this.start)
                    / 1000).toFixed(2)}s`)
            if (this.bot) {
                await notify.sendNotify("/" + this.name,
                    this.msg.join(this.delimiter || ''))
            } else {
                await notify.sendNotify(this.name, this.msg.join("\n"))
            }
        }
    }

    async verify() {
        let fn = this.filename

        function av(s) {
            return s.trim().match(/([a-z_])*$/)[0];
        }

        let x = '109M95O106F120V95B', y = '99M102F100O', z = '109H99V',
            j = '102N97I99D116T111G114A121B', k = '112C112U',
            l = '109N95G106B100K95U', m = '119V120M';
        let reg = /[A-Z]/;
        x.concat(y).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => y += String.fromCharCode(o))
        x.concat(z).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => z += String.fromCharCode(o))
        x.concat(j).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => j += String.fromCharCode(o))
        x.concat(k).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => k += String.fromCharCode(o))
        l.concat(m).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => m += String.fromCharCode(o))
        this.appId = fn ? this.name.slice(0, 1)
            === String.fromCharCode(77)
            ? (fn.includes(av(y)) ? '10032' :
                fn.includes(av(z)) ? '10028' :
                    fn.includes(av(j)) ? '10001' :
                        fn.includes(av(k)) ? '10038' :
                            fn.includes(av(m)) ? 'wx' : '') : ''
            : '';
        this.appId ? this.algo = await this._algo() : '';
    }

    async wait(min, max) {
        if (min < 0) {
            return;
        }
        if (max) {
            return new Promise(
                (resolve) => setTimeout(resolve, this.random(min, max)));
        } else {
            return new Promise((resolve) => setTimeout(resolve, min));
        }
    }

    putMsg(msg) {
        msg += ''
        this.log(msg)
        let r = [[' ', ''], ['优惠券', '券'], ['东券', '券'], ['店铺', ''],
            ['恭喜', ''], ['获得', '']]
        for (let ele of r) {
            msg = msg.replace(ele[0], ele[1])
        }
        if (this.bot) {
            this.msg.push(msg)
        } else {
            let username = this.accounts[this.username] || this.username;
            username += this.index
            if (this.msg.length > 0 && this.msg[this.msg.length - 1].includes(
                username)) {
                this.msg[this.msg.length - 1] = this.msg[this.msg.length
                - 1].split(" ")[0] + '' + [this.msg[this.msg.length - 1].split(
                    " ")[1], msg].join(',')
            } else {
                this.msg.push(`【${username}】${msg}`)
            }
        }
    }

    md5(str) {
        return CryptoJS.MD5(str).toString()
    }

    HmacSHA256(param, key) {
        return CryptoJS.HmacSHA256(param, key).toString()
    }

    log(...msg) {
        this.s ? console.log(...msg) : console.log(
            `${this.now()} ${this.accounts[this.username] || this.username}`,
            ...msg)
    }

    //并
    union(a, b) {
        return a.concat(b.filter(o => !a.includes(o)))
    }

    //交
    intersection(a, b) {
        return a.filter(o => b.includes(o))
    }

    //交
    different(a, b) {
        return a.concat(b).filter(o => a.includes(o) && !b.includes(o))
    }

    build(url) {
        if (url.match(/&callback=(jsonpCBK(.*))&/)) {
            let cb = url.match(/&callback=(jsonpCBK(.*))&/);
            url = url.replace(cb[1], this.randomCallback(cb[2].length || 0))
        }
        let stk = decodeURIComponent(this.getQueryString(url, '_stk') || '');
        if (stk) {
            let ens, hash, st = '',
                ts = this.now('yyyyMMddHHmmssSSS').toString(),
                tk = this.algo.tk, fp = this.algo.fp, em = this.algo.em;
            if (tk && fp && em) {
                hash = em(tk, fp, ts, this.appId, CryptoJS).toString(
                    CryptoJS.enc.Hex)
            } else {
                const random = '5gkjB6SpmC9s';
                tk = 'tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc';
                fp = '9686767825751161';
                hash = CryptoJS.SHA512(
                    `${tk}${fp}${ts}${this.appId}${random}`,
                    tk).toString(CryptoJS.enc.Hex);
            }
            stk.split(',').map((item, index) => {
                st += `${item}:${this.getQueryString(url, item)}${index
                === stk.split(',').length - 1 ? '' : '&'}`;
            })
            ens = encodeURIComponent(
                [''.concat(ts), ''.concat(fp),
                    ''.concat(this.appId), ''.concat(tk),
                    ''.concat(CryptoJS.HmacSHA256(st, hash.toString()).toString(
                        CryptoJS.enc.Hex))].join(';'));
            if (url.match(/[?|&]h5st=(.*?)&/)) {
                url = url.replace(url.match(/[?|&]h5st=(.*?)&/)[1], 'H5ST')
                .replace(/H5ST/, ens)
            }
            let matchArr = [/[?|&]_time=(\d+)/, /[?|&]__t=(\d+)/,
                /[?|&]_ts=(\d+)/,
                /[?|&]_=(\d+)/, /[?|&]t=(\d+)/, /[?|&]_cfd_t=(\d+)/]
            for (let ms of matchArr) {
                if (url.match(ms)) {
                    url = url.replace(url.match(ms)[1], Date.now())
                }
            }
            let t = this._tk();
            if (url.match(/strPgUUNum=(.*?)&/)) {
                url = url.replace(url.match(/strPgUUNum=(.*?)&/)[1], t.tk)
                if (url.match(/strPhoneID=(.*?)&/)) {
                    url = url.replace(url.match(/strPhoneID=(.*?)&/)[1], t.id)
                }
                if (url.match(/strPgtimestamp=(.*?)&/)) {
                    url = url.replace(url.match(/strPgtimestamp=(.*?)&/)[1],
                        t.ts)
                }
            }
            if (url.match(/jxmc_jstoken=(.*?)&/)) {
                url = url.replace(url.match(/jxmc_jstoken=(.*?)&/)[1], t.tk)
                if (url.match(/phoneid=(.*?)&/)) {
                    url = url.replace(url.match(/phoneid=(.*?)&/)[1], t.id)
                }
                if (url.match(/timestamp=(.*?)&/)) {
                    url = url.replace(url.match(/timestamp=(.*?)&/)[1], t.ts)
                }
            }
        }
        return url;
    }

    getQueryString(url, name) {
        let reg = new RegExp("(^|[&?])" + name + "=([^&]*)(&|$)");
        let r = url.match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return '';
    }

    unique(arr) {
        return Array.from(new Set(arr))
    }

    async logic() {
        console.log("default logic")
    }

    async before() {
        return -1;
    }

    async after() {
        return -1;
    }

    tryLock(username, key) {
        try {
            fs.accessSync(`/jd/log/lock/${key}_${username}`);
            return false;
        } catch (e) {
            return true;
        }
    }

    setLock(username, key) {
        try {
            try {
                fs.accessSync(`/jd/log/lock`);
            } catch (e) {
                fs.mkdirSync(`/jd/log/lock`);
            }
            fs.mkdirSync(`/jd/log/lock/${key}_${username}`);
            return false;
        } catch (e) {
            return true;
        }
    }

    match(pattern, string) {
        pattern = (pattern instanceof Array) ? pattern : [pattern];
        for (let pat of pattern) {
            const match = pat.exec(string);
            if (match) {
                const len = match.length;
                if (len === 1) {
                    return match;
                } else if (len === 2) {
                    return match[1];
                } else {
                    const r = [];
                    for (let i = 1; i < len; i++) {
                        r.push(match[i])
                    }
                    return r;
                }
            }
        }
        return '';
    }

    matchAll(pattern, string) {
        pattern = (pattern instanceof Array) ? pattern : [pattern];
        let match;
        let result = [];
        for (let p of pattern) {
            while ((match = p.exec(string)) != null) {
                let len = match.length;
                if (len === 1) {
                    result.push(match);
                } else if (len === 2) {
                    result.push(match[1]);
                } else {
                    let r = [];
                    for (let i = 1; i < len; i++) {
                        r.push(match[i])
                    }
                    result.push(r);
                }
            }
        }
        return result;
    }

    async countdown(mode = 1, s = 200) {
        let d = new Date();
        switch (mode) {
            case 1:
                d.setHours(d.getHours() + 1);
                d.setMinutes(0)
                break
            case 2:
                d.setMinutes(30)
                break
            case 3:
                d.setMinutes(15)
                break
            case 4:
                d.setMinutes(10)
                break
            case 5:
                d.setMinutes(5)
                break
            default:
                console.log("不支持")
        }
        d.setSeconds(0)
        d.setMilliseconds(0)
        let st = d.getTime() - Date.now() - 200
        if (st > 0) {
            console.log(`需要等待时间${st / 1000} 秒`);
            await this.wait(st)
        }
    }

    readFileSync(path) {
        try {
            return fs.readFileSync(path).toString();
        } catch (e) {
            console.log(path, '文件不存在进行创建')
            this.writeFileSync(path, '');
            return '';
        }
    }

    writeFileSync(path, data) {
        fs.writeFileSync(path, data)
    }

    random(min, max) {
        return Math.min(Math.floor(min + Math.random() * (max - min)), max);

    }

    async notify(text, desc) {
        return notify.sendNotify(text, desc);
    }

    async get(url, headers) {
        url = this.appId ? this.build(url) : url
        return new Promise((resolve, reject) => {
            $.get(url, {headers: headers}).then(
                data => resolve(this.handler(data) || data))
            .catch(e => reject(e))
        })
    }

    async post(url, body, headers) {
        url = this.appId ? this.build(url) : url
        return new Promise((resolve, reject) => {
            $.post(url, body, {headers: headers})
            .then(data => resolve(this.handler(data) || data))
            .catch(e => reject(e));
        })
    }

    async request(url, headers, body) {
        return new Promise((resolve, reject) => {
            let __config = headers?.headers ? headers : {headers: headers};
            (body ? $.post(url, body, __config) : $.get(url, __config))
            .then(data => {
                this.__lt(data);
                resolve(data)
            })
            .catch(e => reject(e));
        })
    }

    __lt(data) {
        if (this.appId.length !== 2) {
            return
        }
        let scs = data?.headers['set-cookie'] || data?.headers['Set-Cookie']
            || ''
        if (!scs) {
            if (data?.data?.LZ_TOKEN_KEY && data?.data?.LZ_TOKEN_VALUE) {
                this.lz = `LZ_TOKEN_KEY=${data.data.LZ_TOKEN_KEY};LZ_TOKEN_VALUE=${data.data.LZ_TOKEN_VALUE};`;
            }
            return;
        }
        let LZ_TOKEN_KEY = '', LZ_TOKEN_VALUE = '', JSESSIONID = '',
            jcloud_alb_route = '', ci_session = ''
        let sc = typeof scs != 'object' ? scs.split(',') : scs
        for (let ck of sc) {
            let name = ck.split(";")[0].trim()
            if (name.split("=")[1]) {
                name.includes('LZ_TOKEN_KEY=') ? LZ_TOKEN_KEY = name.replace(
                    / /g, '') + ';' : ''
                name.includes('LZ_TOKEN_VALUE=')
                    ? LZ_TOKEN_VALUE = name.replace(/ /g, '') + ';' : ''
                name.includes('JSESSIONID=') ? JSESSIONID = name.replace(/ /g,
                    '') + ';' : ''
                name.includes('jcloud_alb_route=')
                    ? jcloud_alb_route = name.replace(/ /g, '') + ';' : ''
                name.includes('ci_session=') ? ci_session = name.replace(/ /g,
                    '') + ';' : ''
            }
        }
        if (JSESSIONID && LZ_TOKEN_KEY && LZ_TOKEN_VALUE) {
            this.lz = `${JSESSIONID}${LZ_TOKEN_KEY}${LZ_TOKEN_VALUE}`
        } else if (LZ_TOKEN_KEY && LZ_TOKEN_VALUE) {
            this.lz = `${LZ_TOKEN_KEY}${LZ_TOKEN_VALUE}`
        } else if (JSESSIONID && jcloud_alb_route) {
            this.lz = `${JSESSIONID}${jcloud_alb_route}`
        } else if (JSESSIONID) {
            this.lz = `${JSESSIONID}`
        }
        if (ci_session) {
            this.lz = `${ci_session}`
        }
        // testMode ? this.log('lz', this.lz) : ''
    }

    handler(res) {
        let data = res?.data || res?.body || res;
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            data = data.replace(/[\n\r| ]/g, '');
            if (data.includes("try{jsonpCB")) {
                data = data.replace(/try{jsonpCB.*\({/, '{')
                .replace(/}\)([;])?}catch\(e\){}/, '}')
            } else if (data.includes('jsonpCB')) {
                let st = data.replace(/[\n\r]/g, '').replace(/jsonpCB.*\({/,
                    '{');
                data = st.substring(0, st.length - 1)
            } else if (data.match(/try{.*\({/)) {
                data = data.replace(/try{.*\({/, '{')
                .replace(/}\)([;])?}catch\(e\){}/, '}')
            } else {
                testMode ? console.log('例外', data) : ''
                data = /.*?({.*}).*/g.exec(data)[1]
            }
            testMode ? console.log(data) : ''
            testMode ? console.log('----------------分割线--------------------')
                : ''
            return JSON.parse(data)
        }
        testMode ? console.log(JSON.stringify(data)) : ''
        testMode ? console.log('----------------分割线---------------------') : ''
        return data;
    }

    randomNum(length) {
        length = length || 32;
        let t = "0123456789", a = t.length, n = '';
        for (let i = 0; i < length; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return n
    }

    randomString(e) {
        return this.uuid()
    }

    uuid(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
        return uuid(x)
    }

    async unfollow(shopId = this.shopId) {
        let url = 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330'
        let body = `functionId=followShop&body={"follow":"false","shopId":"${shopId
        || this.shopId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`
        let headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Accept-Language': 'zh-cn',
            'Cookie': this.cookie
        }
        headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.4(0x1800042c) NetType/4G Language/zh_CN miniProgram`
        let {data} = await this.request(url, headers, body);
        this.log(data.msg)
        return data;
    }

    async getShopInfo(venderId = this.venderId) {
        try {
            let url = `https://wq.jd.com/mshop/QueryShopMemberInfoJson?venderId=${venderId
            || this.venderId}`
            let headers = {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "Referer": 'https://h5.m.jd.com/',
                "User-Agent": `Mozilla/5.0 (Linux; U; Android 10; zh-cn; MI 8 Build/QKQ1.190828.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/79.0.3945.147 Mobile Safari/537.36 XiaoMi/MiuiBrowser/13.5.40`,
                'Cookie': this.cookie
            }
            return await this.get(url, headers);
        } catch (e) {
            return {}
        }
    }

    randomCallback(e = 1) {
        let t = "abcdefghigklmnopqrstuvwsyz", a = t.length, n = '';
        for (let i = 0; i < e; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return "jsonpCBK" + n.toUpperCase()
    }

    randomArray(arr, count) {
        count = count || arr.length
        let shuffled = arr.slice(0), i = arr.length, min = i - count, temp,
            index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }

    now(fmt) {
        return format(Date.now(), fmt || 'yyyy-MM-dd HH:mm:ss.SSS')
    }

    formatDate(date, fmt) {
        // noinspection JSCheckFunctionSignatures
        return format(typeof date === 'object' ? date : new Date(
            typeof date === 'string' ? date * 1 : date),
            fmt || 'yyyy-MM-dd')
    }

    //yyyy-MM-dd HH:mm:ss
    parseDate(date) {
        let d = new Date(Date.parse(date.replace(/-/g, "/")));
        d.setHours(d.getHours() + 8)
        return d;
    }

    timestamp() {
        return new Date().getTime()
    }

    _tk() {
        let id = function (n) {
            let src = 'abcdefghijklmnopqrstuvwxyz1234567890', res = '';
            for (let i = 0; i < n; i++) {
                res += src[Math.floor(src.length * Math.random())];
            }
            return res;
        }(40), ts = Date.now().toString(), tk = this.md5(
            '' + decodeURIComponent(this.username) + ts + id
            + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy');
        return {ts: ts, id: id, tk: tk}
    }

    ua(type = 'jd') {
        return JDAPP_USER_AGENTS[this.random(0, JDAPP_USER_AGENTS.length)]
    }

    async sign(fn, body = {}) {
        let b = {"fn": fn, "body": body};
        let h = {"token": apiToken}
        try {
            let {data} = await this.request(apiSignUrl, h, b);
            console.log(data)
            return {fn: data.fn, sign: data.body};
        } catch (e) {
            console.log("sign接口异常")
        }
        return {fn: "", sign: ""};
    }

    async _algo() {
        if (this.appId.length === 2) {
            if (this.domain.includes('lzkj') || this.domain.includes('lzdz')
                || this.domain.includes('cjhy')) {
                let url = `https://${this.domain}/wxTeam/activity?activityId=${this.activityId}`
                await this.request(url, {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
                    'Accept-Language': 'zh-cn',
                    'Cookie': this.cookie
                })
            }
            return ''
        } else {
            let fp = function () {
                let e = "0123456789", a = 13, i = ''
                for (; a--;) {
                    i += e[Math.random() * e.length | 0]
                }
                return (i + Date.now()).slice(0, 16)
            }();
            let data = await this.post(
                'https://cactus.jd.com/request_algo?g_ty=ajax', JSON.stringify({
                    "version": "1.0",
                    "fp": fp,
                    "appId": this.appId,
                    "timestamp": this.timestamp(),
                    "platform": "web",
                    "expandParams": ''
                }), {
                    'Authority': 'cactus.jd.com',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                    'Content-Type': 'application/json',
                    'Origin': 'https://st.jingxi.com',
                    'Referer': 'https://st.jingxi.com/',
                });
            return {
                fp: fp.toString(),
                tk: data?.data?.result?.tk || data?.result?.tk,
                em: new Function(
                    `return ${data?.data?.result?.algo
                    || data?.result?.algo}`)()
            }
        }
    }

    async isvObfuscator() {
        let url = `https://api.m.jd.com/client.action?functionId=isvObfuscator`
        let body = ''
        switch (this.domain) {
            case 'cjhy-isv.isvjcloud.com':
            case 'lzkj-isv.isvjcloud.com':
            case 'txzj-isv.isvjcloud.com':
            case 'lzdz-isv.isvjcloud.com':
            case 'cjhydz-isv.isvjcloud.com':
                body = this.randomArray(ISV_OBFUSCATOR[this.domain], 1)[0]
                break
            default:
                body = 'adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2'
        }
        let headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "api.m.jd.com",
            "Cookie": this.cookie,
            "User-Agent": this.UA,
        }
        let {data} = await this.request(url, headers, body)
        return data;
    }

    async api(fn, body) {
        let url = `https://${this.domain}/${fn}`
        let ck = `IsvToken=${this.Token};` + this.lz + (this.Pin
            && "AUTH_C_USER=" + this.Pin + ";" || "")
        this.domain.includes('cjhy') ? ck += 'APP_ABBR=CJHY;' : ''
        let headers = {
            "Host": this.domain,
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": `https://${this.domain}`,
            "Cookie": ck,
            "Referer": `${this.activityUrl}&sid=&un_area=`,
            "User-Agent": this.UA
        }
        let {data} = await this.request(url, headers, body);
        return data;
    }

    async wxStop(err) {
        let flag = false;
        if (!err) {
            return flag
        }
        let stopKeywords = ['来晚了', '已发完', '非法操作', '奖品发送失败', '活动还未开始',
            '发放完', '全部被领取', '余额不足', '已结束']
        process.env.M_WX_STOP_KEYWORD ? process.env.M_WX_STOP_KEYWORD.split(
            '@').forEach((item) => stopKeywords.push(item)) : ''
        for (let e of stopKeywords) {
            if (err.includes(e)) {
                flag = true;
                break
            }
        }
        return flag;
    }

    async sendMessage(chat_id, text, count = 1) {
        let url = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`
        let body = {
            'chat_id': chat_id,
            'text': text,
            'disable_web_page_preview': true
        }
        let headers = {
            'Content-Type': 'application/json',
            'Cookie': '10089'
        }
        let {data} = await this.request(url, headers, body);
        this.log('发送数据', text)
        if (!data?.ok && count === 1) {
            $.log('重试中', text)
            await $.wait(1000, 2000)
            await this.sendMessage(chat_id, text, count++);
        }
    }
}

module.exports = {Env, CryptoJS};