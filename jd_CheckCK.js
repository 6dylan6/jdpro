/*
cron "0 0/8 * * *" jd_CheckCK.js, tag:京东CK检测by-ccwav
 */
//详细说明参考 https://github.com/ccwav/QLScript2.
const $ = new Env('CK检测');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const got = require('got');
const {
    getEnvs,
	getEnvById,
    DisableCk,
    EnableCk,
    getstatus
} = require('./function/ql');
const api = got.extend({
        retry: {
            limit: 0
        },
        responseType: 'json',
    });

let ShowSuccess = "false",
CKAlwaysNotify = "false",
CKAutoEnable = "false",
NoWarnError = "false";

let MessageUserGp2 = "";
let MessageUserGp3 = "";
let MessageUserGp4 = "";

let MessageGp2 = "";
let MessageGp3 = "";
let MessageGp4 = "";
let MessageAll = "";

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;

let IndexGp2 = 0;
let IndexGp3 = 0;
let IndexGp4 = 0;
let IndexAll = 0;

let TempErrorMessage = '',
TempSuccessMessage = '',
TempDisableMessage = '',
TempEnableMessage = '',
TempOErrorMessage = '';

let allMessage = '',
ErrorMessage = '',
SuccessMessage = '',
DisableMessage = '',
EnableMessage = '',
OErrorMessage = '';

let allMessageGp2 = '',
ErrorMessageGp2 = '',
SuccessMessageGp2 = '',
DisableMessageGp2 = '',
EnableMessageGp2 = '',
OErrorMessageGp2 = '';

let allMessageGp3 = '',
ErrorMessageGp3 = '',
SuccessMessageGp3 = '',
DisableMessageGp3 = '',
EnableMessageGp3 = '',
OErrorMessageGp3 = '';

let allMessageGp4 = '',
ErrorMessageGp4 = '',
SuccessMessageGp4 = '',
DisableMessageGp4 = '',
EnableMessageGp4 = '',
OErrorMessageGp4 = '';

let strAllNotify = "";
let strNotifyOneTemp = "";
let WP_APP_TOKEN_ONE = "";
if ($.isNode() && process.env.WP_APP_TOKEN_ONE) {
    WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
}

let ReturnMessageTitle = '';

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
    MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
    console.log(`检测到设定了分组推送2`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
    MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
    console.log(`检测到设定了分组推送3`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
    MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
    console.log(`检测到设定了分组推送4`);
}

if ($.isNode() && process.env.CHECKCK_SHOWSUCCESSCK) {
    ShowSuccess = process.env.CHECKCK_SHOWSUCCESSCK;
}
if ($.isNode() && process.env.CHECKCK_CKALWAYSNOTIFY) {
    CKAlwaysNotify = process.env.CHECKCK_CKALWAYSNOTIFY;
}
if ($.isNode() && process.env.CHECKCK_CKAUTOENABLE) {
    CKAutoEnable = process.env.CHECKCK_CKAUTOENABLE;
}
if ($.isNode() && process.env.CHECKCK_CKNOWARNERROR) {
    NoWarnError = process.env.CHECKCK_CKNOWARNERROR;
}

if ($.isNode() && process.env.CHECKCK_ALLNOTIFY) {

    strAllNotify = process.env.CHECKCK_ALLNOTIFY;
/*     if (strTempNotify.length > 0) {
        for (var TempNotifyl in strTempNotify) {
            strAllNotify += strTempNotify[TempNotifyl] + '\n';
        }
    } */
    console.log(`检测到设定了温馨提示,将在推送信息中置顶显示...`);
    strAllNotify = `\n【✨✨✨✨温馨提示✨✨✨✨】\n` + strAllNotify;
    console.log(strAllNotify);
}

!(async() => {
    const envs = await getEnvs();
    if (!envs[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
            "open-url": "https://bean.m.jd.com/bean/signIndex.action"
        });
        return;
    }
	$.log(`\n默认不自动启用CK，开启变量CHECKCK_CKAUTOENABLE='true'`);
    for (let i = 0; i < envs.length; i++) {
        if (envs[i].value) {			
			var tempid=0;
			if(envs[i]._id){
				tempid=envs[i]._id;
			}
			if(envs[i].id){
				tempid=envs[i].id;
			}
            cookie = await getEnvById(tempid);				
            $.UserName = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.UserName2 = decodeURIComponent($.UserName);
            $.index = i + 1;
            $.isLogin = true;
            $.error = '';
            $.NoReturn = '';
            $.nickName = "";
            TempErrorMessage = '';
            TempSuccessMessage = '';
            TempDisableMessage = '';
            TempEnableMessage = '';
            TempOErrorMessage = '';

            console.log(`开始检测【京东账号${$.index}】${$.UserName2} ....\n`);
            if (MessageUserGp4) {
                userIndex4 = MessageUserGp4.findIndex((item) => item === $.UserName);
            }
            if (MessageUserGp2) {

                userIndex2 = MessageUserGp2.findIndex((item) => item === $.UserName);
            }
            if (MessageUserGp3) {

                userIndex3 = MessageUserGp3.findIndex((item) => item === $.UserName);
            }

            if (userIndex2 != -1) {
                console.log(`账号属于分组2`);
                IndexGp2 += 1;
                ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.UserName2}`;
            }
            if (userIndex3 != -1) {
                console.log(`账号属于分组3`);
                IndexGp3 += 1;
                ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.UserName2}`;
            }
            if (userIndex4 != -1) {
                console.log(`账号属于分组4`);
                IndexGp4 += 1;
                ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.UserName2}`;
            }
            if (userIndex4 == -1 && userIndex2 == -1 && userIndex3 == -1) {
                console.log(`账号没有分组`);
                IndexAll += 1;
                ReturnMessageTitle = `【账号${IndexAll}🆔】${$.UserName2}`;
            }

            await TotalBean();
            if ($.NoReturn) {
                console.log(`接口1检测失败，尝试使用接口2....\n`);
                await isLoginByX1a0He();
            } else {
                if ($.isLogin) {
                    if (!$.nickName) {
                        console.log(`获取的别名为空，尝试使用接口2验证....\n`);
                        await isLoginByX1a0He();
                    } else {
                        console.log(`成功获取到别名: ${$.nickName},Pass!\n`);
                    }
                }
            }

            if ($.error) {
                console.log(`有错误，跳出....`);
                TempOErrorMessage = $.error;

            } else {
                const strnowstatus = await getstatus(tempid);
                if (strnowstatus == 99) {
                    strnowstatus = envs[i].status;
                }
                if (!$.isLogin) {

                    if (strnowstatus == 0) {
                        const DisableCkBody = await DisableCk(tempid);
                        if (DisableCkBody.code == 200) {
                            if ($.isNode() && WP_APP_TOKEN_ONE) {
                                strNotifyOneTemp = `京东账号: ${$.nickName || $.UserName2} 已失效,自动禁用成功!\n如果要继续挂机，请联系管理员重新登录账号，账号有效期为30天.`

                                    if (strAllNotify)
                                        strNotifyOneTemp += `\n` + strAllNotify;

                                    await notify.sendNotifybyWxPucher(`${$.name}`, strNotifyOneTemp, `${$.UserName2}`);
                            }
                            console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已失效,自动禁用成功!\n`);
                            TempDisableMessage = ReturnMessageTitle + ` (自动禁用成功!)\n`;
                            TempErrorMessage = ReturnMessageTitle + ` 已失效,自动禁用成功!\n`;
                        } else {
                            if ($.isNode() && WP_APP_TOKEN_ONE) {
                                strNotifyOneTemp = `京东账号: ${$.nickName || $.UserName2} 已失效!\n如果要继续挂机，请联系管理员重新登录账号，账号有效期为30天.`

                                    if (strAllNotify)
                                        strNotifyOneTemp += `\n` + strAllNotify;

                                    await notify.sendNotifybyWxPucher(`${$.name}`, strNotifyOneTemp, `${$.UserName2}`);
                            }
                            console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已失效,自动禁用失败!\n`);
                            TempDisableMessage = ReturnMessageTitle + ` (自动禁用失败!)\n`;
                            TempErrorMessage = ReturnMessageTitle + ` 已失效,自动禁用失败!\n`;
                        }
                    } else {
                        console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已失效,已禁用!\n`);
                        TempErrorMessage = ReturnMessageTitle + ` 已失效,已禁用.\n`;
                    }
                } else {
                    if (strnowstatus == 1) {

                        if (CKAutoEnable == "true") {
                            const EnableCkBody = await EnableCk(tempid);
                            if (EnableCkBody.code == 200) {
                                if ($.isNode() && WP_APP_TOKEN_ONE) {
                                    await notify.sendNotifybyWxPucher(`${$.name}`, `京东账号: ${$.nickName || $.UserName2} 已恢复,自动启用成功!\n祝您挂机愉快...`, `${$.UserName2}`);
                                }
                                console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已恢复,自动启用成功!\n`);
                                TempEnableMessage = ReturnMessageTitle + ` (自动启用成功!)\n`;
                                TempSuccessMessage = ReturnMessageTitle + ` (自动启用成功!)\n`;
                            } else {
                                if ($.isNode() && WP_APP_TOKEN_ONE) {
                                    await notify.sendNotifybyWxPucher(`${$.name}`, `京东账号: ${$.nickName || $.UserName2} 已恢复,但自动启用失败!\n请联系管理员处理...`, `${$.UserName2}`);
                                }
                                console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已恢复,但自动启用失败!\n`);
                                TempEnableMessage = ReturnMessageTitle + ` (自动启用失败!)\n`;
                            }
                        } else {
                            console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 已恢复，可手动启用!\n`);
                            TempEnableMessage = ReturnMessageTitle + ` 已恢复，可手动启用.\n`;
                        }
                    } else {
                        console.log(`京东账号${$.index} : ${$.nickName || $.UserName2} 状态正常!\n`);
                        TempSuccessMessage = ReturnMessageTitle + `\n`;
                    }
                }
            }

            if (userIndex2 != -1) {
                ErrorMessageGp2 += TempErrorMessage;
                SuccessMessageGp2 += TempSuccessMessage;
                DisableMessageGp2 += TempDisableMessage;
                EnableMessageGp2 += TempEnableMessage;
                OErrorMessageGp2 += TempOErrorMessage;
            }
            if (userIndex3 != -1) {
                ErrorMessageGp3 += TempErrorMessage;
                SuccessMessageGp3 += TempSuccessMessage;
                DisableMessageGp3 += TempDisableMessage;
                EnableMessageGp3 += TempEnableMessage;
                OErrorMessageGp3 += TempOErrorMessage;
            }
            if (userIndex4 != -1) {
                ErrorMessageGp4 += TempErrorMessage;
                SuccessMessageGp4 += TempSuccessMessage;
                DisableMessageGp4 += TempDisableMessage;
                EnableMessageGp4 += TempEnableMessage;
                OErrorMessageGp4 += TempOErrorMessage;
            }

            if (userIndex4 == -1 && userIndex2 == -1 && userIndex3 == -1) {
                ErrorMessage += TempErrorMessage;
                SuccessMessage += TempSuccessMessage;
                DisableMessage += TempDisableMessage;
                EnableMessage += TempEnableMessage;
                OErrorMessage += TempOErrorMessage;
            }

        }
        console.log(`等待2秒.......	\n`);
        await $.wait(2 * 1000)
    }

    if ($.isNode()) {
        if (MessageUserGp2) {
            if (OErrorMessageGp2) {
                allMessageGp2 += `👇👇👇👇👇检测出错账号👇👇👇👇👇\n` + OErrorMessageGp2 + `\n\n`;
            }
            if (DisableMessageGp2) {
                allMessageGp2 += `👇👇👇👇👇自动禁用账号👇👇👇👇👇\n` + DisableMessageGp2 + `\n\n`;
            }
            if (EnableMessageGp2) {
                if (CKAutoEnable == "true") {
                    allMessageGp2 += `👇👇👇👇👇自动启用账号👇👇👇👇👇\n` + EnableMessageGp2 + `\n\n`;
                } else {
                    allMessageGp2 += `👇👇👇👇👇账号已恢复👇👇👇👇👇\n` + EnableMessageGp2 + `\n\n`;
                }
            }

            if (ErrorMessageGp2) {
                allMessageGp2 += `👇👇👇👇👇失效账号👇👇👇👇👇\n` + ErrorMessageGp2 + `\n\n`;
            } else {
                allMessageGp2 += `👇👇👇👇👇失效账号👇👇👇👇👇\n 一个失效的都没有呢，羡慕啊...\n\n`;
            }

            if (ShowSuccess == "true" && SuccessMessage) {
                allMessageGp2 += `👇👇👇👇👇有效账号👇👇👇👇👇\n` + SuccessMessageGp2 + `\n`;
            }

            if (NoWarnError == "true") {
                OErrorMessageGp2 = "";
            }

            if ($.isNode() && (EnableMessageGp2 || DisableMessageGp2 || OErrorMessageGp2 || CKAlwaysNotify == "true")) {
                console.log("京东CK检测#2：");
                console.log(allMessageGp2);

                if (strAllNotify)
                    allMessageGp2 += `\n` + strAllNotify;

                await notify.sendNotify("京东CK检测#2", `${allMessageGp2}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }
        if (MessageUserGp3) {
            if (OErrorMessageGp3) {
                allMessageGp3 += `👇👇👇👇👇检测出错账号👇👇👇👇👇\n` + OErrorMessageGp3 + `\n\n`;
            }
            if (DisableMessageGp3) {
                allMessageGp3 += `👇👇👇👇👇自动禁用账号👇👇👇👇👇\n` + DisableMessageGp3 + `\n\n`;
            }
            if (EnableMessageGp3) {
                if (CKAutoEnable == "true") {
                    allMessageGp3 += `👇👇👇👇👇自动启用账号👇👇👇👇👇\n` + EnableMessageGp3 + `\n\n`;
                } else {
                    allMessageGp3 += `👇👇👇👇👇账号已恢复👇👇👇👇👇\n` + EnableMessageGp3 + `\n\n`;
                }
            }

            if (ErrorMessageGp3) {
                allMessageGp3 += `👇👇👇👇👇失效账号👇👇👇👇👇\n` + ErrorMessageGp3 + `\n\n`;
            } else {
                allMessageGp3 += `👇👇👇👇👇失效账号👇👇👇👇👇\n 一个失效的都没有呢，羡慕啊...\n\n`;
            }

            if (ShowSuccess == "true" && SuccessMessage) {
                allMessageGp3 += `👇👇👇👇👇有效账号👇👇👇👇👇\n` + SuccessMessageGp3 + `\n`;
            }

            if (NoWarnError == "true") {
                OErrorMessageGp3 = "";
            }

            if ($.isNode() && (EnableMessageGp3 || DisableMessageGp3 || OErrorMessageGp3 || CKAlwaysNotify == "true")) {
                console.log("京东CK检测#3：");
                console.log(allMessageGp3);
                if (strAllNotify)
                    allMessageGp3 += `\n` + strAllNotify;

                await notify.sendNotify("京东CK检测#3", `${allMessageGp3}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }
        if (MessageUserGp4) {
            if (OErrorMessageGp4) {
                allMessageGp4 += `👇👇👇👇👇检测出错账号👇👇👇👇👇\n` + OErrorMessageGp4 + `\n\n`;
            }
            if (DisableMessageGp4) {
                allMessageGp4 += `👇👇👇👇👇自动禁用账号👇👇👇👇👇\n` + DisableMessageGp4 + `\n\n`;
            }
            if (EnableMessageGp4) {
                if (CKAutoEnable == "true") {
                    allMessageGp4 += `👇👇👇👇👇自动启用账号👇👇👇👇👇\n` + EnableMessageGp4 + `\n\n`;
                } else {
                    allMessageGp4 += `👇👇👇👇👇账号已恢复👇👇👇👇👇\n` + EnableMessageGp4 + `\n\n`;
                }
            }

            if (ErrorMessageGp4) {
                allMessageGp4 += `👇👇👇👇👇失效账号👇👇👇👇👇\n` + ErrorMessageGp4 + `\n\n`;
            } else {
                allMessageGp4 += `👇👇👇👇👇失效账号👇👇👇👇👇\n 一个失效的都没有呢，羡慕啊...\n\n`;
            }

            if (ShowSuccess == "true" && SuccessMessage) {
                allMessageGp4 += `👇👇👇👇👇有效账号👇👇👇👇👇\n` + SuccessMessageGp4 + `\n`;
            }

            if (NoWarnError == "true") {
                OErrorMessageGp4 = "";
            }

            if ($.isNode() && (EnableMessageGp4 || DisableMessageGp4 || OErrorMessageGp4 || CKAlwaysNotify == "true")) {
                console.log("京东CK检测#4：");
                console.log(allMessageGp4);
                if (strAllNotify)
                    allMessageGp4 += `\n` + strAllNotify;

                await notify.sendNotify("京东CK检测#4", `${allMessageGp4}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }

        if (OErrorMessage) {
            allMessage += `👇👇👇👇👇检测出错账号👇👇👇👇👇\n` + OErrorMessage + `\n\n`;
        }
        if (DisableMessage) {
            allMessage += `👇👇👇👇👇自动禁用账号👇👇👇👇👇\n` + DisableMessage + `\n\n`;
        }
        if (EnableMessage) {
            if (CKAutoEnable == "true") {
                allMessage += `👇👇👇👇👇自动启用账号👇👇👇👇👇\n` + EnableMessage + `\n\n`;
            } else {
                allMessage += `👇👇👇👇👇账号已恢复👇👇👇👇👇\n` + EnableMessage + `\n\n`;
            }
        }

        if (ErrorMessage) {
            allMessage += `👇👇👇👇👇失效账号👇👇👇👇👇\n` + ErrorMessage + `\n\n`;
        } else {
            allMessage += `👇👇👇👇👇失效账号👇👇👇👇👇\n 一个失效的都没有呢，羡慕啊...\n\n`;
        }

        if (ShowSuccess == "true" && SuccessMessage) {
            allMessage += `👇👇👇👇👇有效账号👇👇👇👇👇\n` + SuccessMessage + `\n`;
        }

        if (NoWarnError == "true") {
            OErrorMessage = "";
        }

        if ($.isNode() && (EnableMessage || DisableMessage || OErrorMessage || CKAlwaysNotify == "true")) {
            console.log("京东CK检测：");
            console.log(allMessage);
			if (strAllNotify)
                    allMessage += `\n` + strAllNotify;
				
            await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
        }

    }

})()
.catch((e) => $.logErr(e))
.finally(() => $.done())

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                Host: "me-api.jd.com",
                Accept: "*/*",
                Connection: "keep-alive",
                Cookie: cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42",
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                    $.nickName = decodeURIComponent($.UserName);
                    $.NoReturn = `${$.nickName} :` + `${JSON.stringify(err)}\n`;
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === "1001") {
                            $.isLogin = false; //cookie过期
                            $.nickName = decodeURIComponent($.UserName);
                            return;
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = (data.data.userInfo.baseInfo.nickname);
                        } else {
                            $.nickName = decodeURIComponent($.UserName);
                            console.log("Debug Code:" + data['retcode']);
                            $.NoReturn = `${$.nickName} :` + `服务器返回未知状态，不做变动\n`;
                        }
                    } else {
                        $.nickName = decodeURIComponent($.UserName);
                        $.log('京东服务器返回空数据');
                        $.NoReturn = `${$.nickName} :` + `服务器返回空数据，不做变动\n`;
                    }
                }
            } catch (e) {
                $.nickName = decodeURIComponent($.UserName);
                $.logErr(e)
                $.NoReturn = `${$.nickName} : 检测出错，不做变动\n`;
            }
            finally {
                resolve();
            }
        })
    })
}
function isLoginByX1a0He() {
    return new Promise((resolve) => {
        const options = {
            url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
            headers: {
                "Cookie": cookie,
                "referer": "https://h5.m.jd.com/",
                "User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
            },
        }
        $.get(options, (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data.islogin === "1") {
                        console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
                    } else if (data.islogin === "0") {
                        $.isLogin = false;
                        console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
                    } else {
                        console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
                        $.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
                    }
                }
            } catch (e) {
                console.log(e);
            }
            finally {
                resolve();
            }
        });
    });
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
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s {
        constructor(t) {
            this.env = t
        }
        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            }
             : t;
            let s = this.get;
            return "POST" === e && (s = this.post),
            new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }
        get(t) {
            return this.send.call(this.env, t)
        }
        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }
    return new class {
        constructor(t, e) {
            this.name = t,
            this.http = new s(this),
            this.data = null,
            this.dataFile = "box.dat",
            this.logs = [],
            this.isMute = !1,
            this.isNeedRewrite = !1,
            this.logSeparator = "\n",
            this.startTime = (new Date).getTime(),
            Object.assign(this, e),
            this.log("", `🔔${this.name}, 开始!`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }
        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i)
                try {
                    s = JSON.parse(this.getdata(t))
                } catch {}
            return s
        }
        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }
        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20,
                r = e && e.timeout ? e.timeout : r;
                const[o, h] = i.split("@"),
                n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode())
                return {}; {
                this.fs = this.fs ? this.fs : require("fs"),
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                e = this.path.resolve(process.cwd(), this.dataFile),
                s = this.fs.existsSync(t),
                i = !s && this.fs.existsSync(e);
                if (!s && !i)
                    return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"),
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                e = this.path.resolve(process.cwd(), this.dataFile),
                s = this.fs.existsSync(t),
                i = !s && this.fs.existsSync(e),
                r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r)
                    return s;
            return r
        }
        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                o = this.getval(i),
                h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                    s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                    s = this.setval(JSON.stringify(o), i)
                }
            } else
                s = this.setval(t, e);
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"),
            this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
            t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }
        get(t, e = (() => {})) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
            this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                        "X-Surge-Skip-Scripting": !1
                    })), $httpClient.get(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                    e(t, s, i)
                })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                        hints: !1
                    })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                    try {
                        if (t.headers["set-cookie"]) {
                            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                            s && this.ckjar.setCookieSync(s, null),
                            e.cookieJar = this.ckjar
                        }
                    } catch (t) {
                        this.logErr(t)
                    }
                }).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                }))
        }
        post(t, e = (() => {})) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
                this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                        "X-Surge-Skip-Scripting": !1
                    })), $httpClient.post(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                    e(t, s, i)
                });
            else if (this.isQuanX())
                t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                        hints: !1
                    })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i)
                new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                 : this.isSurge() ? {
                    url: t
                }
                 : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                        s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                        s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e),
                s && t.push(s),
                i && t.push(i),
                console.log(t.join("\n")),
                this.logs = this.logs.concat(t)
            }
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
            console.log(t.join(this.logSeparator))
        }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
            s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
            this.log(),
            (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }
    (t, e)
}
