/*
#快速推一推
13 1 * * * jd_tyt_ck1.js, tag=推一推, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
注意：助力码每天会变，旧的不可用。
助力逻辑：默认助力第一个ck
入口-极速版-推推赚大钱  1元无门槛卷
TYT_PACKETID 变量也可设置需要推的账号
*/
const $ = new Env('推推赚大钱');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
let tytpacketId = '';
// if (process.env.tytpacketId) {
//   tytpacketId = process.env.tytpacketId;
// }
let acid='ccd0447255384f06ae26690993be27f1'
//兼容elecV2P
tytpacketId = $.getdata('TYT_PACKETID') ? $.getdata('TYT_PACKETID') : '';
if ($.isNode() && process.env.TYT_PACKETID) {
  tytpacketId = process.env.TYT_PACKETID;
}

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';

!(async () => {
  console.log('\n自动获取并推第一个账号\n')
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  console.log(`\n************\n`);
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      $.canRun = true
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      if ($.canRun && tytpacketId === '') {
        await initateCoinDozer() //开团
        await $.wait(2000)
        await getCoinDozerInfo()
        await $.wait(1000)
        await coinDozerBackFlow()
        await $.wait(1000)
        await helpCoinDozer(packetId)
        await $.wait(500)
        tytpacketId = `${packetId}`
      } else {
          await tythelp(tytpacketId)
		  console.log('等待10s。。。')
		  await $.wait(10000)
      }
    }
  }
  // nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
  if (new Date().getHours() >= 33) {
    for (let i = 0; i < cookiesArr.length; i++) {
      if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        console.log(`${$.UserName} 去助力`)
        for (let j = 0; j < $.authorCode.length; j++) {
          let tytpacketId = $.authorCode[j];
          await tythelp(tytpacketId)
          await $.wait(1000)
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

function initateCoinDozer() {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/?t=1623066557140`,
      body: `functionId=initiateCoinDozer&body={"actId":"${acid}","channel":"coin_dozer","antiToken":"ec14brrjlsu8u4lhmia162581607334284f3~NmZeSyVEbFNSd3V7dldUAH92AwhlRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8LLyAADWQFNUgHcnZ4dlhZC3khBAxhUDIVBnJzf3dZC0M7LENkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80Qks5ATkdB28tKWoCAl8RZhtkcxY4LUF7G29rPU8eEWZHTA1EbC1BKTM5NBJXbm9oaxohDwpTWR1lf3RNWR56aAcUYUpvRD9jOm9oQwhWKTdQGmtEZgQXcWVhZgIeEHdmRQsmBSESWyAsISMVAkcvN0BeIlNlFgouLiQzFFpRI3VWUD0KdF1BImV3ZlQHXnU1UEFoADUYFCcvLCgQW0h8cgUNaVdgQVRydHl1BxpadWYbGjUVOFNZYzQ0NRkcRy59FRRzDyVTWWN2b2hDB1suZg0aaF9vSEE8%7C~1626269234856~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnsiaWMiOiIwIiwibGUiOiI3NSIsImN0IjoiaSIsImR0IjoiMiJ9fQ%3D%3D~2~472~tix5%7Cgw57a%3B554ci-6n%2C81%2C%2C%3B751r-%2C%2C%2C%3B358-6o%2C81%2C3t%2Cj%3Bb53-6o%2C81%2C3t%2Cj%3B050-6o%2C81%2C3t%2Cj%3Bdoei%3A%2C1%2C186%2C186%2C0%2C0%2C9%2C22%2C3%2C15%3Bdmei%3A%2C1%2C302%2C0%2C-2%2C0%2C-2%2C0%2C-2%2C0%3Bemc%3A%2C5%3A1%3Bemmm%3A%3Bemcf%3A%2C5%3A1%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%2C5%3A187-46%3B1626269222397%2C1626269234855%2C0%2C1%2C6%2C6%2C0%2C1%2C0%2C0%2C0%3Ba3bp","referer":"-1","frontendInitStatus":"s"}&appid=megatron&client=android&clientVersion=9&t=1626269234860&networkType=wifi&eid=eidAecfa8121c7s1QgSzJyiJRFuXovji/QEn20IEtJ8WEfBsxVlLBBlDx1NDeWXp7i+1qklWZQtVP/M+tndxJj/uR/SSHj2G7vN0F2lfP0e9ux8UHlNC&fp=-1&frontendInitStatus=s&uuid=8363532363230343238303836333-43D2468336563316936636265356&osVersion=9&d_brand=Xiaomi&d_model=MI 8&agent=-1&pageClickKey=-1&screen=393*818&platform=3&lang=zh_CN&eu=8363532363230343238303836333&fv=43D2468336563316936636265356`,
      headers: {
        "Origin": "https://pushgold.jd.com",
        "Host": "api.m.jd.com",
        "User-Agent": "jdltapp;iPhone;3.3.6;14.3;75aeceef3046d8ce11d354ff89af9517a2e4aa18;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone9,2;addressid/4585826605;hasOCPay/0;appBuild/1060;supportBestPay/0;pv/53.31;apprpd/;ref/https://invite-reward.jd.com/?lng=106.286950&lat=29.969353&sid=547255867e847394aedfb6d68c3e50fw&un_area=4_48201_54794_0#/invitee?inviterId=dS%2Bp85VyjydPuAOOnFP%2Faw%3D%3D;psq/0;ads/;psn/75aeceef3046d8ce11d354ff89af9517a2e4aa18|89;jdv/0|kong|t_1001003207_1762319_6901310|jingfen|30578707801140d09fcd54e5cd83bbf7|1621510932517|1621511027;adk/;app_device/IOS;pap/JA2020_3112531|3.3.6|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`initateCoinDozer API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (!data.success && data.code === 508) {
            console.log(data.msg)
            $.canRun = false
          } else {
            console.log(`【京东账号${$.index}】推一推开团成功\n`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function tythelp(tytpacketId) {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/?t=1623066557140`,
      body: `functionId=helpCoinDozer&appid=station-soa-h5&client=H5&clientVersion=1.0.0&t=1623120183787&body={"actId":"${acid}","channel":"coin_dozer","antiToken":"mmkajtm9eqonssy6xoi1623119406463ic84~NmZeSyVEbFNSd3V+dVNdA3pxAABkRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29+PU9ReSdSWTNTNxICI3V0dlYOV3p0Bwg3UW9IVnd+KSdUC1E3KQFkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80Qks5ATkdB28tKWoCAl8RZhtkcxY4LUF7G29rPU8eEWZHTA1EbC1BKTM5NBJXbm9oaxohDwpTWR1lf3RNWR56aAcUYUpnQFcdZTBmTU9XKSBEX3NcdEEFMDdvaEMOQW9+FV82CDAUAXhzfTEDXV07I0VUZx49F1MucyosBwIHeTFSDycPIlNPYyRvfkMDQCwiBFo1VWFHBzsuPnVZB185dQEKYlZkRFR3cnVxUAFFf3QVFHMCJR9Be2U3MwkVQC8nWBp9RD8CQXtlfGZNT1gkJxUCc19vSFpjOg==|~1623120183785~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~2~281~1pl4|5563f-70,aa,,;751e-,,,;359-70,aa,40,u;b512-70,aa,40,u;058-70,aa,40,u;doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:,5:1;emmm:;emcf:,5:1;ivli:;iivl:;ivcvj:;scvje:;ewhi:,5:197-49;1623120175774,1623120183784,0,1,5,5,0,1,0,0,0;u5ge","referer":"-1","frontendInitStatus":"s","packetId":"${tytpacketId}","helperStatus":"0"}&_ste=1&_stk=appid,body,client,clientVersion,functionId,t&h5st=20210608104303790;8489907903583162;10005;tk01w89681aa9a8nZDdIanIyWnVuWFLK4gnqY+05WKcPY3NWU2dcfa73B7PBM7ufJEN0U+4MyHW5N2mT/RNMq72ycJxH;7e6b956f1a8a71b269a0038bbb4abd24bcfb834a88910818cf1bdfc55b7b96e5`,
      headers: {
        "Origin": "https://pushgold.jd.com",
        "Host": "api.m.jd.com",
        "User-Agent": "jdltapp;iPhone;3.3.6;14.3;75aeceef3046d8ce11d354ff89af9517a2e4aa18;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone9,2;addressid/4585826605;hasOCPay/0;appBuild/1060;supportBestPay/0;pv/53.31;apprpd/;ref/https://invite-reward.jd.com/?lng=106.286950&lat=29.969353&sid=547255867e847394aedfb6d68c3e50fw&un_area=4_48201_54794_0#/invitee?inviterId=dS%2Bp85VyjydPuAOOnFP%2Faw%3D%3D;psq/0;ads/;psn/75aeceef3046d8ce11d354ff89af9517a2e4aa18|89;jdv/0|kong|t_1001003207_1762319_6901310|jingfen|30578707801140d09fcd54e5cd83bbf7|1621510932517|1621511027;adk/;app_device/IOS;pap/JA2020_3112531|3.3.6|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code == 0) {
            console.log("帮砍CK1：" + data.data.amount)
          } else
            console.log(data.msg + "CK1")
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function coinDozerBackFlow() {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/?t=1623066557140`,
      body: `functionId=coinDozerBackFlow&body={"actId":"${acid}","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s"}&appid=megatron&client=android&clientVersion=9&t=1627920132339&networkType=wifi&eid=eidAecfa8121c7s1QgSzJyiJRFuXovji/QEn20IEtJ8WEfBsxVlLBBlDx1NDeWXp7i+1qklWZQtVP/M+tndxJj/uR/SSHj2G7vN0F2lfP0e9ux8UHlNC&fp=-1&frontendInitStatus=s&uuid=8363532363230343238303836333-43D2468336563316936636265356&osVersion=9&d_brand=Xiaomi&d_model=MI 8&agent=-1&pageClickKey=-1&screen=393*818&platform=3&lang=zh_CN&eu=8363532363230343238303836333&fv=43D2468336563316936636265356`,
      headers: {
        "Origin": "https://pushgold.jd.com",
        "Host": "api.m.jd.com",
        "User-Agent": "jdltapp;iPhone;3.3.6;14.3;75aeceef3046d8ce11d354ff89af9517a2e4aa18;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone9,2;addressid/4585826605;hasOCPay/0;appBuild/1060;supportBestPay/0;pv/53.31;apprpd/;ref/https://invite-reward.jd.com/?lng=106.286950&lat=29.969353&sid=547255867e847394aedfb6d68c3e50fw&un_area=4_48201_54794_0#/invitee?inviterId=dS%2Bp85VyjydPuAOOnFP%2Faw%3D%3D;psq/0;ads/;psn/75aeceef3046d8ce11d354ff89af9517a2e4aa18|89;jdv/0|kong|t_1001003207_1762319_6901310|jingfen|30578707801140d09fcd54e5cd83bbf7|1621510932517|1621511027;adk/;app_device/IOS;pap/JA2020_3112531|3.3.6|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code == 0 && data.data) {
            console.log(`${data.msg}\n`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function helpCoinDozer(tytpacketId) {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/?t=1623066557140`,
      body: `functionId=helpCoinDozer&appid=station-soa-h5&client=H5&clientVersion=1.0.0&t=1627922761739&body={"actId":"${acid}","channel":"coin_dozer","antiToken":"d75b37qfowsfn740mp41627921383808x5a4~NmZeSyVEbFNSd3V6fVNfBX9wDwliRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8HeCVVCDQHNElTeHB7fVFVUyhyDlllU2cXUSJ3LCdWWlR7fU1kc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80Qks5ATkdB28tKWoCAl8RZhtkcxY4LUF7G29rPU8eEWZHTA1EbC1BKTM5NBJXbm9oaxohDwpTWR1lf3RNWR56aAcUYUpvQD9jOm9oQwhWKTdQGmtEZkcKNWVhZgIeEHdmQU0kUGYfVjclKTUFFF17KVsLJRYwGVU1InUrCBUCfXFPC2MTdF1BImV3ZlMKQSk%2BDg8wAT5DBDdzPj0KXlB8cgUPaFRnQltyf31zGQBcdGYbGjUVOFNZYy4vNhlUUS43FRRzDyVTWWN2b2hDB1suZg0aaF9vSEE8%7C~1627922761730~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnsiaWMiOiIxIiwibGUiOiI5NSIsImN0IjoiaSIsImR0IjoiaSJ9fQ%3D%3D~4~475~siip%7C554yw-7f%2C85%2C%2C%3B753j-%2C%2C%2C%3B356-7f%2C85%2C4k%2Cn%3Bb58-7f%2C85%2C4k%2Cn%3B050-7f%2C85%2C4k%2Cn%3Bgw13b%3Bgwji5%3B552py-6q%2C83%2C%2C%3B752r-%2C%2C%2C%3Bb5a-6r%2C83%2Cm%2C-1%3Bbd1-6r%2C83%2Cm%2C-1%3B051-6r%2C83%2Cm%2C-1%3Bdoei%3A%2C1%2C647%2C647%2C0%2C0%2C-11%2C19%2C-12%2C33%3Bdmei%3A%2C1%2C898%2C0%2C-7%2C1%2C-7%2C1%2C-7%2C1%3Bemc%3A%2C5%3A2%2Cd%3A1%3Bemmm%3A%3Bemcf%3A%2C5%3A2%2Cd%3A1%2C5%3A0%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%2C5%3A187-46%3B1627922724803%2C1627922761727%2C0%2C1%2C12%2C12%2C0%2C3%2C0%2C0%2C0%3Bw1rv","referer":"-1","frontendInitStatus":"s","packetId":"${tytpacketId}"}&_ste=1&_stk=appid,body,client,clientVersion,functionId,t&h5st=20210803004601741%3B9832466289341162%3B10005%3Btk01wb2581ba2a8ndXcyN0dBc2lmOdBKB2j6AmZhqiMBL1xbV3unOkVbDl2xKYdsB%2ByLyUDNYeOBhsA4b316%2B1cdS2VW%3Bc7520ffaa8ad8d7cdb6b593d33aa37079c3d6a678a12ad5fb40aa1cde0787363`,
      headers: {
        "Origin": "https://pushgold.jd.com",
        "Host": "api.m.jd.com",
        "User-Agent": "jdltapp;iPhone;3.3.6;14.3;75aeceef3046d8ce11d354ff89af9517a2e4aa18;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone9,2;addressid/4585826605;hasOCPay/0;appBuild/1060;supportBestPay/0;pv/53.31;apprpd/;ref/https://invite-reward.jd.com/?lng=106.286950&lat=29.969353&sid=547255867e847394aedfb6d68c3e50fw&un_area=4_48201_54794_0#/invitee?inviterId=dS%2Bp85VyjydPuAOOnFP%2Faw%3D%3D;psq/0;ads/;psn/75aeceef3046d8ce11d354ff89af9517a2e4aa18|89;jdv/0|kong|t_1001003207_1762319_6901310|jingfen|30578707801140d09fcd54e5cd83bbf7|1621510932517|1621511027;adk/;app_device/IOS;pap/JA2020_3112531|3.3.6|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code == 0) {
            console.log(`逛会场再推一次成功，获得${data.data.amount}元\n`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getCoinDozerInfo() {
  return new Promise(async (resolve) => {
    let options = {
      url: `https://api.m.jd.com/?t=1623066557140`,
      body: `functionId=getCoinDozerInfo&body={"actId":"${acid}","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":""}&appid=megatron&client=android&clientVersion=9&t=1626269713293&networkType=4g&eid=&fp=&frontendInitStatus=&uuid=8363532363230343238303836333-43D2468336563316936636265356&osVersion=9&d_brand=&d_model=&agent=-1&pageClickKey=-1&screen=393*818&platform=3&lang=zh_CN&eu=8363532363230343238303836333&fv=43D2468336563316936636265356`,
      headers: {
        "Origin": "https://pushgold.jd.com",
        "Host": "api.m.jd.com",
        "User-Agent": "jdltapp;iPhone;3.3.6;14.3;75aeceef3046d8ce11d354ff89af9517a2e4aa18;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone9,2;addressid/4585826605;hasOCPay/0;appBuild/1060;supportBestPay/0;pv/53.31;apprpd/;ref/https://invite-reward.jd.com/?lng=106.286950&lat=29.969353&sid=547255867e847394aedfb6d68c3e50fw&un_area=4_48201_54794_0#/invitee?inviterId=dS%2Bp85VyjydPuAOOnFP%2Faw%3D%3D;psq/0;ads/;psn/75aeceef3046d8ce11d354ff89af9517a2e4aa18|89;jdv/0|kong|t_1001003207_1762319_6901310|jingfen|30578707801140d09fcd54e5cd83bbf7|1621510932517|1621511027;adk/;app_device/IOS;pap/JA2020_3112531|3.3.6|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code == 0 && data.data.sponsorActivityInfo.packetId) {
            console.log(`【京东账号${$.index}的推一推邀请码】${data.data.sponsorActivityInfo.packetId}\n`)
            packetId = data.data.sponsorActivityInfo.packetId
          } else {
            console.log(`【京东账号${$.index}】获取助力码失败\n`)
            console.log(JSON.stringify(data))
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}


async function taskPostUrl(functionId, body) {
  return {
    url: `${JD_API_HOST}`,
    body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&appid=content_ecology&uuid=6898c30638c55142969304c8e2167997fa59eb54&t=1622588448365`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

async function TotalBean() {
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
            if (data["retcode"] === 13) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data["retcode"] === 0) {
              $.nickName = (data["base"] && data["base"].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName;
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
async function safeGet(data) {
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

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }