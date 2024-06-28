/*
 * 检查并停用免密支付
 * 默认不开启，如需启用请添加变量：JD_PAY_CONTRACT=true
 * 如需跳过某个账户，请添加变量：JD_PAY_CONTRACT_IGNORE=pin
 * 多个账户需要跳过检查可多次添加 JD_PAY_CONTRACT_IGNORE
[task_local]
#检查并停用免密支付
35 20 * * 5 jd_pay_contract.js, tag=检查并停用免密支付, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
 */

const $ = new Env("关闭免密支付")
const LOGS = []
const USER_AGENT = 'jdapp;iPhone;10.3.6;M/5.0;JDEbook/openapp.jdreader;appBuild/167963;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
const NOTIFY = require('./sendNotify')
const PAY_CONTRACT = new class {
  check(cookie) {
    return new Promise((resolve) => {
      const opts = {
        url: `https://wq.jd.com/wxcontractgw/querypappaycontract?appid=wxae3e8056daea8727&_=${(new Date()).getTime()}&g_login_type=0&callback=jsonpCBKE&g_tk=1600943825&g_ty=ls`,
        headers: {
          "Host": "wq.jd.com",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent": USER_AGENT,
          "Accept-Language": "zh-CN,zh-Hans;q=0.9",
          "Referer": "https://wqs.jd.com/",
          "Cookie": cookie
        }
      }
      $.get(opts, (error, response, data) => {
        try {
          let result = 'failed'
          if (error) {
            console.log(`${JSON.stringify(error)}`)
            console.log(`${$.name} querypappaycontract API请求失败`)
          } else {
            const matches = data.match(/\{.*\}/)
            if (matches) {
              data = JSON.parse(matches[0])
              if (data.errcode === 0) {
                if (data.data.status === 1) {
                  result = 'disabled'
                } else {
                  result = 'enabled'
                }
              } else {
                console.log(`${JSON.stringify(data)}`)
                console.log(data.msg)
                result = 'invalid'
              }
            }
          }
          resolve(result)
        } catch (e) {
          $.logErr(e, response);
          resolve('failed')
        }
      })
    })
  }
  terminate(cookie) {
    return new Promise((resolve) => {
      const opts = {
        url: `https://wq.jd.com/wxcontractgw/terminatepappaycontract?appid=wxae3e8056daea8727&_=${(new Date()).getTime()}&g_login_type=0&callback=jsonpCBKG&g_tk=1600943825&g_ty=ls`,
        headers: {
          "Host": "wq.jd.com",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent": USER_AGENT,
          "Accept-Language": "zh-CN,zh-Hans;q=0.9",
          "Referer": "https://wqs.jd.com/",
          "Cookie": cookie
        }
      }
      $.get(opts, (error, response, data) => {
        try {
          let result = false
          if (error) {
            console.log(`${JSON.stringify(error)}`)
            console.log(`${$.name} terminatepappaycontract API请求失败`)
          } else {
            const matches = data.match(/\{.*\}/)
            if (matches) {
              data = JSON.parse(matches[0])
              result = data.errcode === 0
              if (!result) {
                console.log(`${JSON.stringify(data)}`)
                console.log(data.msg)
              }
            }
          }
          resolve(result)
        } catch (e) {
          $.logErr(e, response);
          resolve(false)
        }
      })
    })
  }
}

!(async () => {
  if (!process.env) {
    process.env = {}
  }
  if (!process.env['JD_PAY_CONTRACT']) {
    process.env['JD_PAY_CONTRACT'] = false
  }
  if (process.env['JD_PAY_CONTRACT'].toString().toLocaleLowerCase() !== 'true') {
    console.log(`当前未启用检查并停用免密支付\n如需启用请添加 JD_PAY_CONTRACT=true\n`)
    console.log(`如果有个别账户需要跳过检查\n请添加 JD_PAY_CONTRACT_IGNORE=pin\n提示：多个账户请多次添加\n`)
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
    $.msg(
      $.name,
      '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取',
      'https://bean.m.jd.com/bean/signIndex.action',
      {
        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
      }
    )
    return
  }
  let sendNotify = false
  let ignorePins = []
  if (process.env['JD_PAY_CONTRACT_IGNORE']) {
    if (process.env['JD_PAY_CONTRACT_IGNORE'].indexOf('&') !== -1) {
      ignorePins = process.env['JD_PAY_CONTRACT_IGNORE'].split('&')
    } else if (process.env['JD_PAY_CONTRACT_IGNORE'].indexOf("\n") !== -1) {
      ignorePins = process.env['JD_PAY_CONTRACT_IGNORE'].split("\n")
    } else {
      ignorePins = [process.env['JD_PAY_CONTRACT_IGNORE']]
    }
  }
  console.log(`如果有个别账户需要跳过检查\n请添加 JD_PAY_CONTRACT_IGNORE=pin\n提示：多个账户请多次添加\n`)
  console.log(`=========== 共 ${cookies.length} 个京东账号 Cookie ===========\n`)
  for (let i = 0; i < cookies.length; i++) {
    let matches = cookies[i].match(/pt_pin=([^;\s]+)/)
    if (!matches) {
      sendNotify = true
      console.log(`*********【京东账户${i + 1}】*********\nCookie 格式错误，请检查\n${cookies[i]}\n`)
      LOGS.push(`【京东账户${i + 1}】`)
      LOGS.push(`Cookie 格式错误，请检查\n`)
      continue
    }
    let pin = matches[1]
    console.log(`*********【京东账户${i + 1}】${decodeURIComponent(pin)}*********\n`)
    LOGS.push(`【京东账户${i + 1}】${decodeURIComponent(pin)}`)
    if (ignorePins.indexOf(pin) !== -1) {
      console.log(`🙅‍♀️该账户已被设定为跳过检查\n`)
      LOGS.push(`🙅‍♀️该账户已被设定为跳过检查\n`)
      continue
    }
    let result = await PAY_CONTRACT.check(cookies[i])
    if (result === 'invalid') {
      sendNotify = true
      LOGS.push(`🤦‍♀️该账户 Cookie 已失效\n`)
      $.msg(
        $.name,
        `【提示】Cookie 已失效`,
        `【京东账户${i + 1}】${decodeURIComponent(pin)}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`,
        {
          "open-url": "https://bean.m.jd.com/bean/signIndex.action"
        }
      )
      $.wait(3000)
      continue
    }
    if (result === 'enabled') {
      sendNotify = true
      console.log(`🤦‍♀️该账户已启用免密支付，正在尝试停用 ...`)
      await $.wait(3000)
      result = await PAY_CONTRACT.terminate(cookies[i])
      if (result) {
        LOGS.push(`✅已成功停用免密支付\n`)
        console.log(`✅已成功停用免密支付！\n`)
      } else {
        LOGS.push(`❎免密支付停用失败，请手动停用\n`)
        console.log(`❎免密支付停用失败！请手动停用：`)
        console.log(`京东购物或者京喜小程序 -> 我的 -> 右上角齿轮⚙️ -> 微信免密支付 -> 已开通，点击去关闭`)
      }
      await $.wait(3000)
      continue
    }
    if (result === 'disabled') {
      LOGS.push(`🎉该账户未启用免密支付，请继续保持\n`)
      console.log(`🎉该账户未启用免密支付，请继续保持！\n`)
      await $.wait(3000)
      continue
    }
    sendNotify = true
    LOGS.push(`❌发生未知错误，请检查日志\n`)
    console.log(`❌发生未知错误\n`)
    await $.wait(3000)
  }
  if (sendNotify && LOGS.length > 0) {
    LOGS.push(`京东购物或者京喜小程序 -> 我的 -> 右上角齿轮⚙️ -> 微信免密支付 -> 已开通，点击去关闭`)
    await NOTIFY.sendNotify($.name, LOGS.join("\n"))
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
