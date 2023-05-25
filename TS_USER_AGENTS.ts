import axios from "axios"
import {Md5} from "ts-md5"
import * as dotenv from "dotenv"
import {existsSync, readFileSync} from "fs"
import {sendNotify} from './sendNotify'

dotenv.config()

let fingerprint: string | number, token: string = '', enCryptMethodJD: any

const USER_AGENTS: Array<string> = [
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;android;10.0.2;9;network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
  "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.5;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.7;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;13.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
  "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;11.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79",
  "jdapp;android;10.0.2;10;;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36",
  "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
  "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
  "jdapp;android;10.0.2;8.0.0;network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;14.0.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36",
  "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
  "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
]

function TotalBean(cookie: string) {
  return {
    cookie: cookie,
    isLogin: true,
    nickName: ''
  }
}

function getRandomNumberByRange(start: number, end: number) {
  end <= start && (end = start + 100)
  return Math.floor(Math.random() * (end - start) + start)
}

let USER_AGENT = USER_AGENTS[getRandomNumberByRange(0, USER_AGENTS.length)]

async function getBeanShareCode(cookie: string) {
  let {data}: any = await axios.post('https://api.m.jd.com/client.action',
    `functionId=plantBeanIndex&body=${encodeURIComponent(
      JSON.stringify({version: "9.0.0.1", "monitor_source": "plant_app_plant_index", "monitor_refer": ""})
    )}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`, {
      headers: {
        Cookie: cookie,
        Host: "api.m.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        "User-Agent": USER_AGENT
      }
    })
  if (data.data?.jwordShareInfo?.shareUrl)
    return data.data.jwordShareInfo.shareUrl.split('Uuid=')![1]
  else
    return ''
}

async function getFarmShareCode(cookie: string) {
  let {data}: any = await axios.post('https://api.m.jd.com/client.action?functionId=initForFarm', `body=${encodeURIComponent(JSON.stringify({"version": 4}))}&appid=wh5&clientVersion=9.1.0`, {
    headers: {
      "cookie": cookie,
      "origin": "https://home.m.jd.com",
      "referer": "https://home.m.jd.com/myJd/newhome.action",
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })

  if (data.farmUserPro)
    return data.farmUserPro.shareCode
  else
    return ''
}

async function requireConfig(check: boolean = false): Promise<string[]> {
  let cookiesArr: string[] = []
  const jdCookieNode = require('./jdCookie.js')
  let keys: string[] = Object.keys(jdCookieNode)
  for (let i = 0; i < keys.length; i++) {
    let cookie = jdCookieNode[keys[i]]
    if (!check) {
      cookiesArr.push(cookie)
    } else {
      if (await checkCookie(cookie)) {
        cookiesArr.push(cookie)
      } else {
        let username = decodeURIComponent(jdCookieNode[keys[i]].match(/pt_pin=([^;]*)/)![1])
        console.log('Cookie失效', username)
        await sendNotify('Cookie失效', '【京东账号】' + username)
      }
    }
  }
  console.log(`共${cookiesArr.length}个京东账号\n`)
  return cookiesArr
}

async function checkCookie(cookie: string) {
  await wait(3000)
  try {
    let {data}: any = await axios.get(`https://api.m.jd.com/client.action?functionId=GetJDUserInfoUnion&appid=jd-cphdeveloper-m&body=${encodeURIComponent(JSON.stringify({"orgFlag": "JD_PinGou_New", "callSource": "mainorder", "channel": 4, "isHomewhite": 0, "sceneval": 2}))}&loginType=2&_=${Date.now()}&sceneval=2&g_login_type=1&callback=GetJDUserInfoUnion&g_ty=ls`, {
      headers: {
        'authority': 'api.m.jd.com',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        'referer': 'https://home.m.jd.com/',
        'cookie': cookie
      }
    })
    data = JSON.parse(data.match(/GetJDUserInfoUnion\((.*)\)/)[1])
    return data.retcode === '0';
  } catch (e) {
    return false
  }
}

function wait(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

async function requestAlgo(appId: number = 10032) {
  fingerprint = generateFp()
  return new Promise<void>(async resolve => {
    let {data}: any = await axios.post('https://cactus.jd.com/request_algo?g_ty=ajax', {
      "version": "1.0",
      "fp": fingerprint,
      "appId": appId,
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    }, {
      "headers": {
        'Authority': 'cactus.jd.com',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
        'Origin': 'https://st.jingxi.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://st.jingxi.com/',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
      },
    })
    if (data['status'] === 200) {
      token = data.data.result.tk
      let enCryptMethodJDString = data.data.result.algo
      if (enCryptMethodJDString) enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)()
    } else {
      console.log(`fp: ${fingerprint}`)
      console.log('request_algo 签名参数API请求失败:')
    }
    resolve()
  })
}

function generateFp() {
  let e = "0123456789"
  let a = 13
  let i = ''
  for (; a--;)
    i += e[Math.random() * e.length | 0]
  return (i + Date.now()).slice(0, 16)
}

function getJxToken(cookie: string, phoneId: string = '') {
  function generateStr(input: number) {
    let src = 'abcdefghijklmnopqrstuvwxyz1234567890'
    let res = ''
    for (let i = 0; i < input; i++) {
      res += src[Math.floor(src.length * Math.random())]
    }
    return res
  }

  if (!phoneId)
    phoneId = generateStr(40)
  let timestamp = Date.now().toString()
  let nickname = cookie.match(/pt_pin=([^;]*)/)![1]
  let jstoken = Md5.hashStr('' + decodeURIComponent(nickname) + timestamp + phoneId + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy')
  return {
    'strPgtimestamp': timestamp,
    'strPhoneID': phoneId,
    'strPgUUNum': jstoken
  }
}

function exceptCookie(filename: string = 'x.ts') {
  let except: any = []
  if (existsSync('./utils/exceptCookie.json')) {
    try {
      except = JSON.parse(readFileSync('./utils/exceptCookie.json').toString() || '{}')[filename] || []
    } catch (e) {
      console.log('./utils/exceptCookie.json JSON格式错误')
    }
  }
  return except
}

function randomString(e: number, word?: number) {
  e = e || 32
  let t = word === 26 ? "012345678abcdefghijklmnopqrstuvwxyz" : "0123456789abcdef", a = t.length, n = ""
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a))
  return n
}

function o2s(arr: object, title: string = '') {
  title ? console.log(title, JSON.stringify(arr)) : console.log(JSON.stringify(arr))
}

function randomNumString(e: number) {
  e = e || 32
  let t = '0123456789', a = t.length, n = ""
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a))
  return n
}

function randomWord(n: number = 1) {
  let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', a = t.length
  let rnd: string = ''
  for (let i = 0; i < n; i++) {
    rnd += t.charAt(Math.floor(Math.random() * a))
  }
  return rnd
}

async function getshareCodeHW(key: string) {
  let shareCodeHW: string[] = []
  for (let i = 0; i < 5; i++) {
    try {
      let {data}: any = await axios.get('https://api.jdsharecode.xyz/api/HW_CODES')
      shareCodeHW = data[key] || []
      if (shareCodeHW.length !== 0) {
        break
      }
    } catch (e) {
      console.log("getshareCodeHW Error, Retry...")
      await wait(getRandomNumberByRange(2000, 6000))
    }
  }
  return shareCodeHW
}

async function getShareCodePool(key: string, num: number) {
  let shareCode: string[] = []
  for (let i = 0; i < 2; i++) {
    try {
      let {data}: any = await axios.get(`https://api.jdsharecode.xyz/api/${key}/${num}`)
      shareCode = data.data || []
      console.log(`随机获取${num}个${key}成功：${JSON.stringify(shareCode)}`)
      if (shareCode.length !== 0) {
        break
      }
    } catch (e) {
      console.log("getShareCodePool Error, Retry...")
      await wait(getRandomNumberByRange(2000, 6000))
    }
  }
  return shareCode
}

/*async function wechat_app_msg(title: string, content: string, user: string) {
  let corpid: string = "", corpsecret: string = ""
  let {data: gettoken} = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`)
  let access_token: string = gettoken.access_token

  let {data: send} = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`, {
    "touser": user,
    "msgtype": "text",
    "agentid": 1000002,
    "text": {
      "content": `${title}\n\n${content}`
    },
    "safe": 0
  })
  if (send.errcode === 0) {
    console.log('企业微信应用消息发送成功')
  } else {
    console.log('企业微信应用消息发送失败', send)
  }
}*/

function obj2str(obj: object) {
  return JSON.stringify(obj)
}

async function getDevice() {
  let {data} = await axios.get('https://betahub.cn/api/apple/devices/iPhone', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    }
  })
  data = data[getRandomNumberByRange(0, 16)]
  return data.identifier
}

async function getVersion(device: string) {
  let {data} = await axios.get(`https://betahub.cn/api/apple/firmwares/${device}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    }
  })
  data = data[getRandomNumberByRange(0, data.length)]
  return data.firmware_info.version
}

async function jdpingou() {
  let device: string, version: string;
  device = await getDevice();
  version = await getVersion(device);
  return `jdpingou;iPhone;5.19.0;${version};${randomString(40)};network/wifi;model/${device};appBuild/100833;ADID/;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/${getRandomNumberByRange(10, 90)};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
}

function get(url: string, headers?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      headers: headers
    }).then(res => {
      if (typeof res.data === 'string' && res.data.includes('jsonpCBK')) {
        resolve(JSON.parse(res.data.match(/jsonpCBK.?\(([\w\W]*)\);?/)[1]))
      } else {
        resolve(res.data)
      }
    }).catch(err => {
      reject({
        code: err?.response?.status || -1,
        msg: err?.response?.statusText || err.message || 'error'
      })
    })
  })
}

function post(url: string, prarms?: string | object, headers?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.post(url, prarms, {
      headers: headers
    }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject({
        code: err?.response?.status || -1,
        msg: err?.response?.statusText || err.message || 'error'
      })
    })
  })
}

export default USER_AGENT
export {
  TotalBean,
  getBeanShareCode,
  getFarmShareCode,
  requireConfig,
  wait,
  getRandomNumberByRange,
  requestAlgo,
  getJxToken,
  exceptCookie,
  randomString,
  o2s,
  randomNumString,
  getshareCodeHW,
  getShareCodePool,
  randomWord,
  obj2str,
  jdpingou,
  get,
  post
}
