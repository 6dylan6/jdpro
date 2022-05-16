/*
众筹许愿池
活动入口：京东-京东众筹-众筹许愿池
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
===============Quantumultx===============
[task_local]
#众筹许愿池
40 0,2,19 * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_wish.js, tag=众筹许愿池, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
================Loon==============
[Script]
cron "40 0,2,19 * * *" script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_wish.js,tag=众筹许愿池
===============Surge=================
众筹许愿池 = type=cron,cronexp="40 0,2,19 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_wish.js
============小火箭=========
众筹许愿池 = type=cron,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_wish.js, cronexpr="40 0,2,19 * * *", timeout=3600, enable=true
 */
const $ = new Env('众筹许愿池');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let message = '', allMessage = '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let appIdArr = ["1EFFSyqaC","1E1xZy6s","1EFRXxg","1EFRWxKuG","1FFVQyqw"];
let appNameArr = ["吃货嘉年华","PLUS生活特权","1","2","3"];
let appId, appName;
$.shareCode = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n*******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      for (let j = 0; j < appIdArr.length; j++) {
        appId = appIdArr[j]
        appName = appNameArr[j]
        console.log(`\n开始第${j + 1}个活动：${appName}\n`)
        await jd_wish();
      }
    }
  }
  if (allMessage) {
    if ($.isNode()) await notify.sendNotify($.name, allMessage);
    $.msg($.name, '', allMessage)
  }
  let res = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/6dylan6/updateTeam@main/shareCodes/wish.json')
  if (!res) {
    $.http.get({url: 'https://cdn.jsdelivr.net/gh/6dylan6/updateTeam@main/shareCodes/wish.json'}).then((resp) => {}).catch((e) => console.log('刷新CDN异常', e));
    await $.wait(1000)
    res = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/6dylan6/updateTeam@main/shareCodes/wish.json')
  }
  $.shareCode = [...$.shareCode, ...(res || [])]
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      console.log(`开始内部助力\n`)
      for (let v = 0; v < appIdArr.length; v++) {
        $.canHelp = true
        appId = appIdArr[v]
        appName = appNameArr[v]
        console.log(`开始助力第${v + 1}个活动：${appName}\n`)
        for (let j = 0; j < $.shareCode.length && $.canHelp; j++) {
          if ($.shareCode[j].appId === appId) {
            console.log(`${$.UserName} 去助力 ${$.shareCode[j].use} 的助力码 ${$.shareCode[j].code}`)
            if ($.UserName == $.shareCode[j].use) {
              console.log(`不能助力自己\n`)
              continue
            }
            $.delcode = false
            await harmony_collectScore({"appId":appId,"taskToken":$.shareCode[j].code,"actionType":"0","taskId":"6"})
            await $.wait(2000)
            if ($.delcode) {
              $.shareCode.splice(j, 1)
              j--
              continue
            }
          }
        }
      }
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jd_wish() {
  try {
    await healthyDay_getHomeData();
    await $.wait(2000)

    let getHomeDataRes = (await healthyDay_getHomeData(false)).data.result.userInfo
    let forNum = Math.floor(getHomeDataRes.userScore / getHomeDataRes.scorePerLottery)
    await $.wait(2000)

    if (forNum === 0) {
      console.log(`没有抽奖机会\n`)
    } else {
      console.log(`可以抽奖${forNum}次，去抽奖\n`)
    }

    $.canLottery = true
    for (let j = 0; j < forNum && $.canLottery; j++) {
      await interact_template_getLotteryResult()
      await $.wait(2000)
    }
    if (message) allMessage += `京东账号${$.index} ${$.nickName || $.UserName}\n${appName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`

  } catch (e) {
    $.logErr(e)
  }
}

async function healthyDay_getHomeData(type = true) {
  return new Promise(async resolve => {
    $.post(taskUrl('healthyDay_getHomeData', { "appId": appId, "taskToken": "", "channelId": 1 }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} getHomeData API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (type) {
                for (let key of Object.keys(data.data.result.hotTaskVos).reverse()) {
                  let vo = data.data.result.hotTaskVos[key]
                  if (vo.status !== 2) {
                    if (vo.taskType === 13 || vo.taskType === 12) {
                      console.log(`点击热区`)
                    await harmony_collectScore({ "appId": appId, "taskToken": vo.simpleRecordInfoVo.taskToken, "taskId": vo.taskId, "actionType": "0" }, vo.taskType)
                    } else {
                    console.log(`【${vo.taskName}】已完成\n`)
                    }
                  }
                }
              for (let key of Object.keys(data.data.result.taskVos).reverse()) {
                let vo = data.data.result.taskVos[key]
                if (vo.status !== 2) {
                  if (vo.taskType === 13 || vo.taskType === 12) {
                    console.log(`签到`)
                    await harmony_collectScore({ "appId": appId, "taskToken": vo.simpleRecordInfoVo.taskToken, "taskId": vo.taskId, "actionType": "0" }, vo.taskType)
                  } else if (vo.taskType === 1) {
                    for (let key of Object.keys(vo.followShopVo)) {
                      let followShopVo = vo.followShopVo[key]
                      if (followShopVo.status !== 2) {
                        console.log(`【${followShopVo.shopName}】${vo.subTitleName}`)
                        await harmony_collectScore({ "appId": appId, "taskToken": followShopVo.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 5) {
                    for (let key of Object.keys(vo.browseShopVo)) {
                      let browseShopVo = vo.browseShopVo[key]
                      if (browseShopVo.status !== 2) {
                        console.log(`【${browseShopVo.skuName}】${vo.subTitleName}`)
                        await harmony_collectScore({ "appId": appId, "taskToken": browseShopVo.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 15) {
                    for (let key of Object.keys(vo.productInfoVos)) {
                      let productInfoVos = vo.productInfoVos[key]
                      if (productInfoVos.status !== 2) {
                        console.log(`【${productInfoVos.skuName}】${vo.subTitleName}`)
                        await harmony_collectScore({ "appId": appId, "taskToken": productInfoVos.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 3) {
					for (let key of Object.keys(vo.shoppingActivityVos)) {
                      let shoppingActivityVos = vo.shoppingActivityVos[key]
                      if (shoppingActivityVos.status !== 2) {
                        console.log(`【${vo.subTitleName}】`)
                        await harmony_collectScore({ "appId": appId, "taskToken": shoppingActivityVos.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 8) {
                    for (let key of Object.keys(vo.productInfoVos)) {
                      let productInfoVos = vo.productInfoVos[key]
                      if (productInfoVos.status !== 2) {
                        console.log(`【${productInfoVos.skuName}】${vo.subTitleName}`)
                        await harmony_collectScore({ "appId": appId, "taskToken": productInfoVos.taskToken, "taskId": vo.taskId, "actionType": "1" })
                        await $.wait(vo.waitDuration * 1000)
                        await harmony_collectScore({ "appId": appId, "taskToken": productInfoVos.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 27 && vo.taskId === 18) {
                    console.log(`【${vo.subTitleName}】`)
                    await harmony_collectScore({ "appId": appId, "taskToken": vo.productInfoVos[0].taskToken, "taskId": vo.taskId, "actionType": "0" })
                  } else if (vo.taskType === 9 || vo.taskType === 26) {
                    for (let key of Object.keys(vo.shoppingActivityVos)) {
                      let shoppingActivityVos = vo.shoppingActivityVos[key]
                      if (shoppingActivityVos.status !== 2) {
                        console.log(`【${shoppingActivityVos.title}】${vo.subTitleName}`)
                        if (vo.taskType === 9) {
                          await harmony_collectScore({ "appId": appId, "taskToken": shoppingActivityVos.taskToken, "taskId": vo.taskId, "actionType": "1" })
                          await $.wait(vo.waitDuration * 1000)
                        }
                        await harmony_collectScore({ "appId": appId, "taskToken": shoppingActivityVos.taskToken, "taskId": vo.taskId, "actionType": "0" })
                      }
                    }
                  } else if (vo.taskType === 14) {
                    console.log(`【京东账号${$.index}（${$.UserName}）的${appName}好友互助码】${vo.assistTaskDetailVo.taskToken}\n`)
                    if (vo.times !== vo.maxTimes) {
                      $.shareCode.push({
                        "code": vo.assistTaskDetailVo.taskToken,
                        "appId": appId,
                        "use": $.UserName
                      })
                    }
                  }
                } else {
                  console.log(`【${vo.taskName}】已完成\n`)
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function harmony_collectScore(body = {}, taskType = '') {
  return new Promise(resolve => {
    $.post(taskUrl('harmony_collectScore', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} collectScore API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data && data.data && data.data.bizCode === 0) {
              if (taskType === 13) {
                console.log(`签到成功：获得${data.data.result.score}金币\n`)
              } else if (body.taskId == 5) {
                console.log(`助力成功：您的好友获得${data.data.result.score}金币\n`)
              } else {
                console.log(`完成任务：获得${data.data.result.score}金币\n`)
              }
            } else {
              if (taskType === 13) {
                console.log(`签到失败：${data.data.bizMsg}\n`)
              } else if (body.taskId == 5) {
                console.log(`助力失败：${data.data.bizMsg || data.msg}\n`)
                if (data.code === -30001 || (data.data && data.data.bizCode === 108)) $.canHelp = false
                if (data.data.bizCode === 103) $.delcode = true
              } else {
                console.log(body.actionType === "0" ? `完成任务失败：${data.data.bizMsg}\n` : data.data.bizMsg)
              }
            }
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

function interact_template_getLotteryResult() {
  return new Promise(resolve => {
    $.post(taskUrl('interact_template_getLotteryResult', {"appId":appId}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} getLotteryResul API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let userAwardsCacheDto = data && data.data && data.data.result && data.data.result.userAwardsCacheDto;
            if (userAwardsCacheDto) {
              if (userAwardsCacheDto.type === 2) {
                console.log(`抽中：${userAwardsCacheDto.jBeanAwardVo.quantity}${userAwardsCacheDto.jBeanAwardVo.ext || `京豆`}`);
              } else if (userAwardsCacheDto.type === 0) {
                console.log(`很遗憾未中奖~`)
              } else if (userAwardsCacheDto.type === 1) {
                console.log(`抽中：${userAwardsCacheDto.couponVo.prizeName}，金额${userAwardsCacheDto.couponVo.usageThreshold}-${userAwardsCacheDto.couponVo.quota}，使用时间${userAwardsCacheDto.couponVo.useTimeRange}`);
              } else {
                console.log(`抽中：${JSON.stringify(data)}`);
                message += `抽中：${JSON.stringify(data)}\n`;
              }
            } else {
              $.canLottery = false
              console.log(`此活动已黑，无法抽奖\n`)
            }
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

function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}`,
    body: `functionId=${function_id}&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://h5.m.jd.com",
      "Cookie": cookie,
      "Accept-Language": "zh-cn",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Referer": "https://h5.m.jd.com/babelDiy/Zeus/4FdmTJQNah9oDJyQN8NggvRi1nEY/index.html",
      "Accept-Encoding": "gzip, deflate, br"
    }
  }
}

function getAuthorShareCode(url) {
  return new Promise(async resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000)
    resolve();
  })
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
        "Cookie": cookie,
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
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
