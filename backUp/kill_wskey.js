/*
 * 注销所有 WSKEY
 * 默认不开启，如需启用请添加变量：
 * JD_WSCK_LOGOUT=pin 退出指定账户
 * JD_WSCK_LOGOUT=ALL 退出所有 CK 有效的账户（必须大写）
 */

const $ = new Env("作废WSKEY")
const WSKEY_LOGOUT = class {
  ck = null
  key = null
  constructor(ck) {
    this.ck = ck
    const matches = ck.match(/pt_key=([^;]+)/)
    if (matches) {
      this.key = matches[1]
    }
  }
  getDevices() {
    return new Promise((resolve) => {
      const opts = {
        url: `https://plogin.m.jd.com/cgi-bin/login/devicemanagement_getdevices?appid=100&_=${(new Date()).getTime()}`,
        headers: {
          "Host": "plogin.m.jd.com",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent": 'jdapp',
          "Accept-Language": "zh-CN,zh-Hans;q=0.9",
          "Cookie": this.ck
        }
      }
      $.get(opts, (error, response, data) => {
        try {
          if (error) {
            console.log(`${JSON.stringify(error)}`)
            console.log(`${$.name} getdevices API请求失败`)
            resolve('failed')
          } else {
            const devices = []
            let guid = undefined
            let matches = data.match(/<li\s[^>]+>[\s\S]+?<\/li>/g)
            if (matches) {
              if (response.headers['set-cookie']) {
                response.headers['set-cookie'].forEach((item) => {
                  let matches2 = item.match(/guid=([^;]+)/)
                  if (matches2) {
                    guid = matches2[1]
                  }
                })
              }
              matches.forEach((item) => {
                let matches2, uuid, ticket, deviceName, id, loginTime
                matches2 = item.match(/data-uid=['"]([^'"]+)['"]/)
                if (matches2) {
                  uuid = matches2[1]
                }
                matches2 = item.match(/data-tiket=['"]([^'"]+)['"]/)
                if (matches2) {
                  ticket = matches2[1]
                }
                matches2 = item.match(/data-name=['"]([^'"]+)['"]/)
                if (matches2) {
                  deviceName = matches2[1]
                }
                matches2 = item.match(/data-index=['"]([^'"]+)['"]/)
                if (matches2) {
                  id = matches2[1]
                }
                matches2 = item.match(/<p>([\s\S]+?)<\/p>/)
                if (matches2) {
                  loginTime = this.htmlDecode(matches2[1])
                }
                devices.push({
                  deviceName,
                  loginTime,
                  config: {
                    uuid,
                    ticket,
                    deviceName: this.htmlEncode(deviceName),
                    id,
                    appid: '100',
                    pt_key: this.key,
                    guid,
                  }
                })
              })
            }
            resolve(devices)
          }
        } catch (e) {
          $.logErr(e, response);
          resolve('failed')
        }
      })
    })
  }
  deleteDevice(config) {
    return new Promise((resolve) => {
      const body = Object.keys(config).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(config[key])}`
      }).join('&')
      const opts = {
        url: `https://plogin.m.jd.com/cgi-bin/login/devicemanagement_deletedevice`,
        headers: {
          "Host": "plogin.m.jd.com",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent": 'jdapp',
          "Accept-Language": "zh-CN,zh-Hans;q=0.9",
          "Cookie": `guid=${config.guid}; ${this.ck}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": body.length,
          "Origin": "https://plogin.m.jd.com",
          "Referer": "https://plogin.m.jd.com/cgi-bin/login/devicemanagement_getdevices?appid=100"
        },
        body
      }
      $.post(opts, (error, response, data) => {
        try {
          if (error) {
            console.log(`${JSON.stringify(error)}`)
            console.log(`${$.name} deletedevice API请求失败`)
            resolve('failed')
          } else {
            resolve(JSON.parse(data))
          }
        } catch (e) {
          $.logErr(e, response);
          resolve('failed')
        }
      })
    })
  }
  htmlEncode(str) {
    str = str.replaceAll('&', '&amp;')
    str = str.replaceAll('<', '&lt;')
    str = str.replaceAll('>', '&gt;')
    str = str.replaceAll('"', '&quot;')
    str = str.replaceAll("'", '&#39;')
    str = str.replaceAll(" ", '&nbsp;')
    return str
  }
  htmlDecode(str) {
    str = str.replaceAll('&nbsp;', " ")
    str = str.replaceAll('&#39;', "'")
    str = str.replaceAll('&quot;', '"')
    str = str.replaceAll('&gt;', '>')
    str = str.replaceAll('&lt;', '<')
    str = str.replaceAll('&amp;', '&')
    return str
  }
}

!(async () => {
  if (!process.env) {
    process.env = {}
  }
  if (!process.env['JD_WSCK_LOGOUT']) {
    process.env['JD_WSCK_LOGOUT'] = ''
  }
  if (process.env['JD_WSCK_LOGOUT'] !== 'ALL') {
    if (process.env['JD_WSCK_LOGOUT'].indexOf('&') !== -1) {
      process.env['JD_WSCK_LOGOUT'] = process.env['JD_WSCK_LOGOUT'].split('&')
    } else if (process.env['JD_WSCK_LOGOUT'].indexOf("\n") !== -1) {
      process.env['JD_WSCK_LOGOUT'] = process.env['JD_WSCK_LOGOUT'].split("\n")
    } else if (process.env['JD_WSCK_LOGOUT']) {
      process.env['JD_WSCK_LOGOUT'] = [process.env['JD_WSCK_LOGOUT']]
    } else {
      process.env['JD_WSCK_LOGOUT'] = []
    }
  }
  if (!process.env['JD_WSCK_LOGOUT'] || !process.env['JD_WSCK_LOGOUT'].length) {
    console.log(`当前不开启，如需启用请添加变量：\nJD_WSCK_LOGOUT=pin 退出指定账户\nJD_WSCK_LOGOUT=ALL 退出所有 CK 有效的账户（必须大写）`)
    return
  }

  let cookies = []
  if (process.env['JD_COOKIE']) {
    if (process.env['JD_COOKIE'].indexOf('&') !== -1) {
      cookies = process.env['JD_COOKIE'].split('&')
    } else if (process.env['JD_COOKIE'].indexOf("\n") !== -1) {
      cookies = process.env['JD_COOKIE'].split("\n")
    } else {
      cookies = [process.env['JD_COOKIE']]
    }
  }
  if (typeof cookies[0] === "undefined") {
    console.log(`未添加任何京东账户`)
    return
  }
  console.log(`=========== 共 ${cookies.length} 个京东账号 Cookie ===========\n`)
  for (let i = 0; i < cookies.length; i++) {
    let matches = cookies[i].match(/pt_pin=([^;\s]+)/)
    if (!matches) {
      console.log(`*********【京东账户${i + 1}】*********\nCookie 格式错误，请检查\n${cookies[i]}\n`)
      continue
    }
    let pin = matches[1]
    console.log(`*********【京东账户${i + 1}】${decodeURIComponent(pin)}*********\n`)
    if (process.env['JD_WSCK_LOGOUT'] !== 'ALL' && process.env['JD_WSCK_LOGOUT'].indexOf(pin) === -1) {
      console.log(`不注销该账户任何 WSKEY\n`)
      continue
    }
    let logout = new WSKEY_LOGOUT(cookies[i])
    let devices = await logout.getDevices()
    if (devices === 'failed') {
      console.log(`获取设备列表失败，可能为 Cookie 或脚本失效\n`)
      continue
    }
    if (!devices.length) {
      console.log(`获取设备列表失败，可能为脚本失效\n`)
      continue
    }
    for (let j = 0; j < devices.length; j++) {
      console.log(`${devices[j].deviceName} (${devices[j].loginTime})`)
      const result = await logout.deleteDevice(devices[j].config)
      if (result.errcode === 0) {
        console.log(`0 => 已注销\n`)
      } else {
        console.log(`${result.errcode} => ${result.message}\n`)
      }
      await $.wait(1000)
    }
    await $.wait(3000)
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
