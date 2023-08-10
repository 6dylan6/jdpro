/*
cron "28 8,21 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2.

const $ = new Env('京东资产统计');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let NowHour = new Date().getHours();

//默认开启缓存模式
let checkbeanDetailMode=1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE){
	checkbeanDetailMode=process.env.BEANCHANGE_BEANDETAILMODE*1;
}

const fs = require('fs');
const CR = require('crypto-js');
let matchtitle="昨日";
let yesterday="";
let TodayDate="";
let startDate="";
let endDate="";
try {
    const moment = require("moment");
    yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    TodayDate = moment().format("YYYY-MM-DD");
    startDate = moment().startOf("month").format("YYYY_MM");
    endDate = moment().endOf("month").format("YYYY-MM-DD");
} catch (e) {
    console.log("依赖缺失，请先安装依赖moment!");
    return
}

if (!fs.existsSync("./BeanCache")) {
    fs.mkdirSync("./BeanCache");
}

let strBeanCache = "./BeanCache/" + yesterday + ".json";
let strNewBeanCache = "./BeanCache/" + TodayDate + ".json";
let TodayCache = [];
let Fileexists = fs.existsSync(strBeanCache);
let TempBeanCache = [];
if(!Fileexists){
	yesterday=TodayDate;
	strBeanCache=strNewBeanCache;
	Fileexists = fs.existsSync(strBeanCache);
	matchtitle="今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+yesterday+".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+TodayDate+".json，载入...");
    TodayCache = fs.readFileSync(strNewBeanCache, 'utf-8');
    if (TodayCache) {
        TodayCache = TodayCache.toString();
        TodayCache = JSON.parse(TodayCache);
    }
}


let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle="";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify="";
let strSubNotify="";
let llPetError=false;
let strGuoqi="";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【京喜特价金币】京东特价版->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【领现金】京东->搜领现金(可微信提现或兑换红包)\n';
RemainMessage += '【话费积分】京东->充值中心-赚积分兑话费（180天效期）\n';
RemainMessage += '【东东农场】京东->我的->东东农场,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【其他】不同类别红包不能叠加使用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror=false;
let time = new Date().getHours();
if ($.isNode()) {
	if (process.env.WP_APP_TOKEN_ONE) {		
		WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
	}	
}
//if(WP_APP_TOKEN_ONE)
	//console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
//else
	//console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);

let jdSignUrl = 'https://api.nolanstore.cc/sign'
if (process.env.SIGNURL)
	jdSignUrl = process.env.SIGNURL;

let epsignurl=""
if (process.env.epsignurl)
    epsignurl = process.env.epsignurl;

if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
	intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
	console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
	MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
	MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
	MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
	//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {	
	strSubNotify=process.env.BEANCHANGE_SUBNOTIFY;
	strSubNotify+="\n";
	console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);	
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {	
	strAllNotify=process.env.BEANCHANGE_ALLNOTIFY;
	console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
	strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n"+strAllNotify;
	console.log(strAllNotify+"\n");
	strAllNotify +="\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
	llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;


if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
		console.log = () => {};
} else {
	cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex=-1;
if ($.isNode()) {	
	strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//东东农场
let EnableJdFruit=true;
DisableIndex = strDisableList.findIndex((item) => item === "东东农场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东农场查询");
	EnableJdFruit=false;	
}

//特价金币
let EnableJdSpeed=true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if(DisableIndex!=-1){
	console.log("检测到设定关闭特价金币查询");
	EnableJdSpeed=false;	
}

//领现金
let EnableCash=true;
DisableIndex=strDisableList.findIndex((item) => item === "领现金");
if(DisableIndex!=-1){
	console.log("检测到设定关闭领现金查询");
	EnableCash=false;	
}	

//7天过期京豆
let EnableOverBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "过期京豆");
if(DisableIndex!=-1){
	console.log("检测到设定关闭过期京豆查询");
	EnableOverBean=false
}

//查优惠券
let EnableChaQuan=false;
DisableIndex=strDisableList.findIndex((item) => item === "查优惠券");
if(DisableIndex!=-1){
	console.log("检测到设定关闭优惠券查询");
	EnableChaQuan=false
}

DisableIndex=strDisableList.findIndex((item) => item === "活动攻略");
if(DisableIndex!=-1){
	console.log("检测到设定关闭活动攻略显示");
	RemainMessage="";
}

//汪汪赛跑
let EnableJoyRun=true;
DisableIndex=strDisableList.findIndex((item) => item === "汪汪赛跑");
if(DisableIndex!=-1){
	console.log("检测到设定关闭汪汪赛跑查询");
	EnableJoyRun=false
}

//京豆收益查询
let EnableCheckBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "京豆收益");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京豆收益查询");
	EnableCheckBean=false
}



!(async() => {
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
			"open-url": "https://bean.m.jd.com/bean/signIndex.action"
		});
		return;
	}
	for (i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
			$.index = i + 1;
			$.beanCount = 0;
			$.incomeBean = 0;
			$.expenseBean = 0;
			$.todayIncomeBean = 0;
			$.todayOutcomeBean = 0;
			$.errorMsg = '';
			$.isLogin = true;
			$.nickName = '';
			$.levelName = '';
			$.message = '';
			$.balance = 0;
			$.expiredBalance = 0;
			$.JdFarmProdName = '';
			$.JdtreeEnergy = 0;
			$.JdtreeTotalEnergy = 0;
			$.treeState = 0;
			$.JdwaterTotalT = 0;
			$.JdwaterD = 0;
			$.JDwaterEveryDayT = 0;
			$.JDtotalcash = 0;
			$.jdCash = 0;
			$.isPlusVip = false;
			$.isRealNameAuth = false;
			$.JingXiang = "";
			$.allincomeBean = 0; //月收入
			$.allexpenseBean = 0; //月支出
			$.beanChangeXi=0;
			$.YunFeiTitle="";
			$.YunFeiQuan = 0;
			$.YunFeiQuanEndTime = "";
			$.YunFeiTitle2="";
			$.YunFeiQuan2 = 0;
			$.YunFeiQuanEndTime2 = "";
			$.JoyRunningAmount = "";
			$.ECardinfo = "";
			$.PlustotalScore=0;
			$.CheckTime="";
			$.beanCache=0;			
			TempBaipiao = "";
			strGuoqi="";
			
			console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
		    $.UA = require('./USER_AGENTS').UARAM();
			await TotalBean();			
		    //await TotalBean2();
			if ($.beanCount == 0) {
				console.log("数据获取失败，等待30秒后重试....")
				await $.wait(30*1000);
				await TotalBean();		
			}
			if ($.beanCount == 0) {
				console.log("疑似获取失败,等待10秒后用第二个接口试试....")
				await $.wait(10*1000);
			    var userdata = await getuserinfo();
			    if (userdata.code == 1) {
			        $.beanCount = userdata.content.jdBean;
			    }
			}
			
			
			if (!$.isLogin) {
				await isLoginByX1a0He();
			}
			if (!$.isLogin) {
				$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
					"open-url": "https://bean.m.jd.com/bean/signIndex.action"
				});

				if ($.isNode()) {
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
				}
				continue
			}
			
			if (TempBeanCache) {
			    for (let j = 0; j < TempBeanCache.length; j++) {
			        if (TempBeanCache[j].pt_pin == $.UserName) {
						$.CheckTime = TempBeanCache[j].CheckTime;
			            $.beanCache = TempBeanCache[j].BeanNum;
			            break;
			        }
			    }
			}
			
			var llfound = false;
			var timeString = "";
			var nowHour = new Date().getHours();
			var nowMinute = new Date().getMinutes();
			if (nowHour < 10)
			    timeString += "0" + nowHour + ":";
			else
			    timeString += nowHour + ":";

			if (nowMinute < 10)
			    timeString += "0" + nowMinute;
			else
			    timeString += nowMinute;

			if (TodayCache) {
			    for (let j = 0; j < TodayCache.length; j++) {
			        if (TodayCache[j].pt_pin == $.UserName) {
			            TodayCache[j].CheckTime = timeString;
			            TodayCache[j].BeanNum = $.beanCount;
			            llfound = true;
			            break;
			        }
			    }
			}
			if (!llfound) {

			    var tempAddCache = {
			        "pt_pin": $.UserName,
			        "CheckTime": timeString,
			        "BeanNum": $.beanCount
			    };
			    TodayCache.push(tempAddCache);
			}
						
			await getjdfruitinfo(); //东东农场
			await $.wait(1000);
			
			await Promise.all([        
			        cash(), //特价金币
			        bean(), //京豆查询
			        jdCash(), //领现金
			        GetJoyRuninginfo(), //汪汪赛跑
			        queryScores()
			    ])
				
			await showMsg();
			if (intPerSent > 0) {
				if ((i + 1) % intPerSent == 0) {
					console.log("分段通知条件达成，处理发送通知....");
					if ($.isNode() && allMessage) {
						var TempMessage=allMessage;
						if(strAllNotify)
							allMessage=strAllNotify+`\n`+allMessage;

						await notify.sendNotify(`${$.name}`, `${allMessage}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						}, undefined,TempMessage)
					}
					if ($.isNode() && allMessageMonth) {
						await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						})
					}
					allMessage = "";
					allMessageMonth = "";
				}

			}
		}
	}
	
	var str = JSON.stringify(TodayCache, null, 2);
	fs.writeFile(strNewBeanCache, str, function (err) {
	    if (err) {
	        console.log(err);
	        console.log("添加缓存" + TodayDate + ".json失败!");
	    } else {
	        console.log("添加缓存" + TodayDate + ".json成功!");
	    }
	})

	//组1通知
	if (ReceiveMessageGp4) {
		allMessage2Gp4 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp4;
	}
	if (WarnMessageGp4) {
		if (allMessage2Gp4) {
			allMessage2Gp4 = `\n` + allMessage2Gp4;
		}
		allMessage2Gp4 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
	}

	//组2通知
	if (ReceiveMessageGp2) {
		allMessage2Gp2 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp2;
	}
	if (WarnMessageGp2) {
		if (allMessage2Gp2) {
			allMessage2Gp2 = `\n` + allMessage2Gp2;
		}
		allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
	}

	//组3通知
	if (ReceiveMessageGp3) {
		allMessage2Gp3 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp3;
	}
	if (WarnMessageGp3) {
		if (allMessage2Gp3) {
			allMessage2Gp3 = `\n` + allMessage2Gp3;
		}
		allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
	}

	//其他通知
	if (allReceiveMessage) {
		allMessage2 = `【⏰商品白嫖清单⏰】\n` + allReceiveMessage;
	}
	if (allWarnMessage) {
		if (allMessage2) {
			allMessage2 = `\n` + allMessage2;
		}
		allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
	}

	if (intPerSent > 0) {
		//console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
		if (allMessage || allMessageMonth) {
			console.log("分段通知收尾，处理发送通知....");
			if ($.isNode() && allMessage) {
				var TempMessage=allMessage;
				if(strAllNotify)
					allMessage=strAllNotify+`\n`+allMessage;
				
				await notify.sendNotify(`${$.name}`, `${allMessage}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				}, undefined,TempMessage)
			}
			if ($.isNode() && allMessageMonth) {
				await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				})
			}
		}
	} else {

		if ($.isNode() && allMessageGp2) {
			var TempMessage=allMessageGp2;
			if(strAllNotify)
				allMessageGp2=strAllNotify+`\n`+allMessageGp2;
			await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp3) {
			var TempMessage=allMessageGp3;
			if(strAllNotify)
				allMessageGp3=strAllNotify+`\n`+allMessageGp3;
			await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp4) {
			var TempMessage=allMessageGp4;
			if(strAllNotify)
				allMessageGp4=strAllNotify+`\n`+allMessageGp4;
			await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessage) {
			var TempMessage=allMessage;
			if(strAllNotify)
				allMessage=strAllNotify+`\n`+allMessage;
			
			await notify.sendNotify(`${$.name}`, `${allMessage}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}

		if ($.isNode() && allMessageMonthGp2) {
			await notify.sendNotify(`京东月资产统计#2`, `${allMessageMonthGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp3) {
			await notify.sendNotify(`京东月资产统计#3`, `${allMessageMonthGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp4) {
			await notify.sendNotify(`京东月资产统计#4`, `${allMessageMonthGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonth) {
			await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
	}

	if ($.isNode() && allMessage2Gp2) {
		allMessage2Gp2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#2", `${allMessage2Gp2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp3) {
		allMessage2Gp3 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#3", `${allMessage2Gp3}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp4) {
		allMessage2Gp4 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#4", `${allMessage2Gp4}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2) {
		allMessage2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒", `${allMessage2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}

})()
.catch((e) => {
	$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
	$.done();
})
async function showMsg() {
	//if ($.errorMsg)
	//return
	ReturnMessageTitle="";
	ReturnMessage = "";
	var strsummary="";
	if (MessageUserGp2) {
		userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp3) {
		userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp4) {
		userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
	}
	
	if (userIndex2 != -1) {
		IndexGp2 += 1;
		ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex3 != -1) {
		IndexGp3 += 1;
		ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex4 != -1) {
		IndexGp4 += 1;
		ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		IndexAll += 1;
		ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}`;
	}
	
		
	if ($.JingXiang) {
		if ($.isRealNameAuth)
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey已实名)\n`;
			else
				ReturnMessageTitle += `(已实名)\n`;
		else
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey未实名)\n`;
			else
				ReturnMessageTitle += `(未实名)\n`;
			
	    ReturnMessage += `【账号信息】`;
	    if ($.isPlusVip) {
	        ReturnMessage += `Plus会员`;	        
	    } else {
	        ReturnMessage += `普通会员`;
	    } 
		if ($.PlustotalScore)
	        ReturnMessage += `(${$.PlustotalScore}分)` 
			
	    ReturnMessage += `,京享值${$.JingXiang}\n`;	    
	}else{
		ReturnMessageTitle+= `\n`;
	}
	if (llShowMonth) {
		ReturnMessageMonth = ReturnMessage;
		ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
		ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

		console.log(ReturnMessageMonth);

		if (userIndex2 != -1) {
			allMessageMonthGp2 += ReturnMessageMonth + `\n`;
		}
		if (userIndex3 != -1) {
			allMessageMonthGp3 += ReturnMessageMonth + `\n`;
		}
		if (userIndex4 != -1) {
			allMessageMonthGp4 += ReturnMessageMonth + `\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allMessageMonth += ReturnMessageMonth + `\n`;
		}
		if ($.isNode() && WP_APP_TOKEN_ONE) {
			await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
		}

	}
	if (EnableCheckBean) {
	    if (checkbeanDetailMode == 0) {
	        ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
	        strsummary += `收${$.todayIncomeBean}豆,`;
	        if ($.todayOutcomeBean != 0) {
	            ReturnMessage += `,支${$.todayOutcomeBean}豆`;
	        }
	        ReturnMessage += `\n`;
	        ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;

	        if ($.expenseBean != 0) {
	            ReturnMessage += `,支${$.expenseBean}豆`;
	        }
	        ReturnMessage += `\n`;
	    } else {	
			if (TempBeanCache){
				ReturnMessage += `【京豆变动】${$.beanCount-$.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;			
				strsummary += `变动${$.beanCount-$.beanCache}豆,`;
				ReturnMessage += `\n`;				
			}	
			else{
				ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
				ReturnMessage += `\n`;
			}		
		}
	}
	
	
	if ($.beanCount){		
		ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
	} else {
		if($.levelName || $.JingXiang)
			ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
		else{
			ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		}			
	}	
	
	if ($.JDtotalcash) {
		ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
	}	
	if($.ECardinfo)
		ReturnMessage += `【礼卡余额】${$.ECardinfo}\n`;
	
	if ($.JoyRunningAmount) 
		ReturnMessage += `【汪汪赛跑】${$.JoyRunningAmount}元\n`;

	if ($.JdFarmProdName != "") {
		if ($.JdtreeEnergy != 0) {
			if ($.treeState === 2 || $.treeState === 3) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				TempBaipiao += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				if (userIndex2 != -1) {
					ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
			} else {
				if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
				} else {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

				}
			}
		} else {
			if ($.treeState === 0) {
				TempBaipiao += `【东东农场】水果领取后未重新种植!\n`;

				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}

			} else if ($.treeState === 1) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName}种植中...\n`;
			} else {
				TempBaipiao += `【东东农场】状态异常!\n`;
				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				//ReturnMessage += `【东东农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
			}
		}
	}
    let dwscore = await dwappinfo();
    if (dwscore){
      let dwappex = await dwappexpire();
      ReturnMessage += `【话费积分】${dwscore}`;
      if (dwappex){
        ReturnMessage += `(最近已过期:${dwappex})`;
      }
      ReturnMessage += `\n`;
    }
	if ($.jdCash) {
		ReturnMessage += `【其他信息】`;
		
		if ($.jdCash) {						
			ReturnMessage += `领现金:${$.jdCash}元`;
		}		
		
		ReturnMessage += `\n`;

	}
	
	if(strGuoqi){		
		ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
		ReturnMessage += `${strGuoqi}`;
	}
	ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
	ReturnMessage += `${$.message}`;
	strsummary+=`红包${$.balance}元`
	if($.YunFeiQuan){
		var strTempYF="【免运费券】"+$.YunFeiQuan+"张";
		if($.YunFeiQuanEndTime)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime+")";
		strTempYF+="\n";
		ReturnMessage +=strTempYF
	}
	if($.YunFeiQuan2){
		var strTempYF2="【免运费券】"+$.YunFeiQuan2+"张";
		if($.YunFeiQuanEndTime2)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime2+")";
		strTempYF2+="\n";
		ReturnMessage +=strTempYF2
	}
	
	if (userIndex2 != -1) {
		allMessageGp2 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex3 != -1) {
		allMessageGp3 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex4 != -1) {
		allMessageGp4 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		allMessage += ReturnMessageTitle+ReturnMessage + `\n------\n`;
	}

	console.log(`${ReturnMessageTitle+ReturnMessage}`);

	if ($.isNode() && WP_APP_TOKEN_ONE) {
		var strTitle="京东资产统计";
		if($.JingXiang){
			if ($.isRealNameAuth)
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey已实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(已实名)\n`+ReturnMessage;
			else
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey未实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(未实名)\n`+ReturnMessage;
			
		}else{
			ReturnMessage=`【账号名称】${$.nickName || $.UserName}\n`+ReturnMessage;
		}
		if (TempBaipiao) {			
			TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
			ReturnMessage = TempBaipiao + `\n` + ReturnMessage;			
		} 
		
		ReturnMessage += RemainMessage;
		
		if(strAllNotify)
			ReturnMessage=strAllNotify+`\n`+ReturnMessage;
		
		await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`,undefined,strsummary);
	}

	//$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {
	
	if (EnableCheckBean && checkbeanDetailMode==0) {	
			
	    // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
	    // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
	    // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

	    //前一天的0:0:0时间戳
	    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
	    // 今天0:0:0时间戳
	    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
	    let page = 1,
	    t = 0,
	    yesterdayArr = [],
	    todayArr = [];
	    do {
	        let response = await getJingBeanBalanceDetail(page);
	        await $.wait(1000);
	        // console.log(`第${page}页: ${JSON.stringify(response)}`);
	        if (response && response.code === "0") {
	            page++;
	            let detailList = response.jingDetailList;
	            if (detailList && detailList.length > 0) {
	                for (let item of detailList) {
	                    const date = item.date.replace(/-/g, '/') + "+08:00";
	                    if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        todayArr.push(item);
	                    } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        //昨日的
	                        yesterdayArr.push(item);
	                    } else if (tm > new Date(date).getTime()) {
	                        //前天的
	                        t = 1;
	                        break;
	                    }
	                }
	            } else {
	                $.errorMsg = `数据异常`;
	                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
	                t = 1;
	            }
	        } else if (response && response.code === "3") {
	            console.log(`cookie已过期，或者填写不规范，跳出`)
	            t = 1;
	        } else {
	            console.log(`未知情况：${JSON.stringify(response)}`);
	            console.log(`未知情况，跳出`)
	            t = 1;
	        }
	    } while (t === 0);
	    for (let item of yesterdayArr) {
	        if (Number(item.amount) > 0) {
	            $.incomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.expenseBean += Number(item.amount);
	        }
	    }
	    for (let item of todayArr) {
	        if (Number(item.amount) > 0) {
	            $.todayIncomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.todayOutcomeBean += Number(item.amount);
	        }
	    }
	    $.todayOutcomeBean = -$.todayOutcomeBean;
	    $.expenseBean = -$.expenseBean;	    
	}
	
	if (EnableOverBean) {
	    await jingBeanDetail(); //过期京豆	    
	}
	await redPacket();
	if (EnableChaQuan)
	    await getCoupon();
}

async function Monthbean() {
	let time = new Date();
	let year = time.getFullYear();
	let month = parseInt(time.getMonth()); //取上个月
	if (month == 0) {
		//一月份，取去年12月，所以月份=12，年份减1
		month = 12;
		year -= 1;
	}

	//开始时间 时间戳
	let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
	console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

	//结束时间 时间戳
	if (month == 12) {
		//取去年12月，进1个月，所以月份=1，年份加1
		month = 1;
		year += 1;
	}
	let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
	console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

	let allpage = 1,
	allt = 0,
	allyesterdayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(allpage);
		await $.wait(1000);
		// console.log(`第${allpage}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			allpage++;
			let detailList = response.jingDetailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
						//日期区间内的京豆记录
						allyesterdayArr.push(item);
					} else if (start > new Date(date).getTime()) {
						//前天的
						allt = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				allt = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			allt = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			allt = 1;
		}
	} while (allt === 0);

	for (let item of allyesterdayArr) {
		if (Number(item.amount) > 0) {
			$.allincomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.allexpenseBean += Number(item.amount);
		}
	}

}

async function jdCash() {
	if (!EnableCash)
		return;
	let functionId = "cash_homePage";
	let sign = await getSignfromNolan(functionId, {});
		return new Promise((resolve) => {
			$.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`jdCash API请求失败，请检查网路重试`)
					} else {
						if (safeGet(data)) {
							data = JSON.parse(data);
							if (data.code === 0 && data.data.result) {
								$.jdCash = data.data.result.totalMoney || 0;								
								return
							}
						}
					}
				} catch (e) {
					$.logErr(e, resp)
				}
				finally {
					resolve(data);
				}
			})
		})
}

function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
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
                "User-Agent": $.UA
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
							$.isPlusVip=data['isPlusVip'];
							$.isRealNameAuth=data['isRealNameAuth'];
							$.beanCount=(data['base'] && data['base'].jdNum) || 0 ;		
							$.JingXiang = (data['base'] && data['base'].jvalue) || 0 ;						
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

function TotalBean2() {
	return new Promise(async(resolve) => {
		const options = {
			url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
			headers: {
				Cookie: cookie,
				'content-type': `application/x-www-form-urlencoded`,
				Connection: `keep-alive`,
				'Accept-Encoding': `gzip,compress,br,deflate`,
				Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
				Host: `wxapp.m.jd.com`,
				'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
			},
			timeout: 10000
		};
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err);
				} else {					
					if (data) {								
						data = JSON.parse(data);
						
						if (!data.user) {
							return;
						}
						const userInfo = data.user;						
						if (userInfo) {
							if (!$.nickName)
								$.nickName = userInfo.petName;
							if ($.beanCount == 0) {
								$.beanCount = userInfo.jingBean;
							}
							$.JingXiang = userInfo.uclass;
						}
					} else {
						$.log('京东服务器返回空数据');
					}
				}
			} catch (e) {
				$.logErr(e);
			}
			finally {
				resolve();
			}
		});
	});
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
			timeout: 10000
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

function getJingBeanBalanceDetail(page) {
  return new Promise(async resolve => {
    const options = {
      "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
      "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
      "headers": {
				'User-Agent': $.UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            // console.log(data)
          } else {
            // console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function jingBeanDetail() {
	return new Promise(async resolve => {
		setTimeout(async () => {
			var strsign = "";
			if (epsignurl) {
				strsign = await getepsign('jingBeanDetail', { "pageSize": "20", "page": "1" });
				strsign = strsign.body;
			}
			else
				strsign = await getSignfromNolan('jingBeanDetail', { "pageSize": "20", "page": "1" });

			const options = {
				"url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
				"body": strsign,
				"headers": {
					'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
					'Host': 'api.m.jd.com',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cookie': cookie,
				}
			}
			$.post(options, (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`${$.name} jingBeanDetail API请求失败，请检查网路重试`)
					} else {
						if (data) {
							data = JSON.parse(data);
							if (data?.others?.jingBeanExpiringInfo?.detailList) {
								const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
								detailList.map(item => {
									strGuoqi += `【${(item['eventMassage']).replace("即将过期京豆", "").replace("年", "-").replace("月", "-").replace("日", "")}】过期${item['amount']}豆\n`;
								})
							}
						} else {
							console.log(`jingBeanDetail 京东服务器返回空数据`)
						}
					}
				} catch (e) {
					if (epsignurl)
						$.logErr(e, resp)
					else
						console.log("因为没有指定带ep的Sign,获取过期豆子信息次数多了就会失败.")
				} finally {
					resolve(data);
				}
			})
		}, 0 * 1000);
	})
} 
  
function getepsign(n, o, t = "sign") {	
  let e = {
    url: epsignurl, 
    form: {
      functionId: n, body: $.toStr(o),
    }, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
  return new Promise(n => {
    $.post(e, async (o, t, e) => {
      try {
        o ? console.log(o) : e = JSON.parse(e)
        if (e.code === 200 && e.data) {
          n({body: e.data.convertUrlNew})
        }
      } catch (n) {
        $.logErr(n, t)
      } finally {
        n({body: e.convertUrlNew})
      }
    })
  })
}

function getSignfromNolan(functionId, body) {	
    var strsign = '';
	let data = {
      "fn":functionId,
      "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
		    followRedirect: false,
		    headers: {
		        'Accept': '*/*',
		        "accept-encoding": "gzip, deflate, br",
		        'Content-Type': 'application/json'
		    },
		    timeout: 30000
        }
        $.post(url, async(err, resp, data) => {
            try {				
                data = JSON.parse(data);
                if (data && data.body) {                    
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }				
            }catch (e) {
                $.logErr(e, resp);
            }finally {
				resolve(strsign);
			}
        })
    })
}


function redPacket() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
			"headers": {
				'Host': 'api.m.jd.com',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'Accept-Language': 'zh-cn',
				'Referer': 'https://h5.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				"Cookie": cookie,
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
			}
		}
		$.get(options, (err, resp, data) => {
			try {				
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`redPacket API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						$.jxRed = 0,
						$.jsRed = 0,
						$.jdRed = 0,
						$.jdhRed = 0,
						$.jdwxRed = 0,
						$.jdGeneralRed = 0,
						$.jxRedExpire = 0,
						$.jsRedExpire = 0,
						$.jdRedExpire = 0,
						$.jdhRedExpire = 0;
						$.jdwxRedExpire = 0,
						$.jdGeneralRedExpire = 0
						
						let t = new Date();
						t.setDate(t.getDate() + 1);
						t.setHours(0, 0, 0, 0);
						t = parseInt((t - 1) / 1000)*1000;
						
						for (let vo of data.hongBaoList || []) {
						    if (vo.orgLimitStr) {								
						        if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
						            $.jxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jxRedExpire += parseFloat(vo.balance)									
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("购物小程序")) {
						            $.jdwxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdwxRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("京东商城")) {
						            $.jdRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
						            $.jsRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jsRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
						            $.jdhRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdhRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        }
						    }
						    $.jdGeneralRed += parseFloat(vo.balance)
						    if (vo['endTime'] === t) {
						        $.jdGeneralRedExpire += parseFloat(vo.balance)
						    }
						}
						
						$.balance = ($.jxRed+$.jsRed+$.jdRed +$.jdhRed+$.jdwxRed+$.jdGeneralRed).toFixed(2);
						$.jxRed = $.jxRed.toFixed(2);
						$.jsRed = $.jsRed.toFixed(2);
						$.jdRed = $.jdRed.toFixed(2);						
						$.jdhRed = $.jdhRed.toFixed(2);
						$.jdwxRed = $.jdwxRed.toFixed(2);
						$.jdGeneralRed = $.jdGeneralRed.toFixed(2);						
						$.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire+$.jdhRedExpire+$.jdwxRedExpire+$.jdGeneralRedExpire).toFixed(2);
						$.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
						if ($.jxRed > 0){
							if($.jxRedExpire>0)
								$.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京喜红包】${$.jxRed}元 \n`;
						}
							
						if ($.jsRed > 0){
							if($.jsRedExpire>0)
								$.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元(原极速版) \n`;
							else
								$.message += `【京喜特价】${$.jsRed}元(原极速版) \n`;
						}
							
						if ($.jdRed > 0){
							if($.jdRedExpire>0)
								$.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京东红包】${$.jdRed}元 \n`;
						}
							
						if ($.jdhRed > 0){
							if($.jdhRedExpire>0)
								$.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【健康红包】${$.jdhRed}元 \n`;
						}
							
						if ($.jdwxRed > 0){
							if($.jdwxRedExpire>0)
								$.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【微信小程序】${$.jdwxRed}元 \n`;
						}
							
						if ($.jdGeneralRed > 0){
							if($.jdGeneralRedExpire>0)
								$.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【全平台通用】${$.jdGeneralRed}元 \n`;
							
						}
							
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function getCoupon() {
    return new Promise(resolve => {
        let options = {
            url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
            headers: {
                'authority': 'wq.jd.com',
                "User-Agent": $.UA,
                'accept': '*/*',
                'referer': 'https://wqs.jd.com/',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cookie': cookie
            },
			timeout: 10000
        }
        $.get(options, async(err, resp, data) => {
            try {				
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
				$.platFormInfo="";
                for (let i = 0; i < useable.length; i++) {
					//console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota <= 100 && useable[i].coupontype === 1) {                           
							//$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
							if (useable[i].platFormInfo) 
								$.platFormInfo = useable[i].platFormInfo;
							
							var decquota=parseFloat(useable[i].quota).toFixed(2);
							var decdisc= parseFloat(useable[i].discount).toFixed(2);
							if (useable[i].quota>useable[i].discount+5 && useable[i].discount<2)
								continue
							$.message += `【全品类券】满${decquota}减${decdisc}元`;
							
							if (useable[i].endTime < $.todayEndTime) {
								$.message += `(今日过期,${$.platFormInfo})\n`;
							} else if (useable[i].endTime < $.tomorrowEndTime) {
								$.message += `(明日将过期,${$.platFormInfo})\n`;
							} else {
								$.message += `(${$.platFormInfo})\n`;
							}
							
                        }
                    }
					if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
					    if (!$.YunFeiTitle) {
					        $.YunFeiTitle = useable[i].couponTitle;
					        $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					        $.YunFeiQuan += 1;
					    } else {
					        if ($.YunFeiTitle == useable[i].couponTitle) {
					            $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					            $.YunFeiQuan += 1;
					        } else {
					            if (!$.YunFeiTitle2)
					                $.YunFeiTitle2 = useable[i].couponTitle;
								
					            if ($.YunFeiTitle2 == useable[i].couponTitle) {
					                $.YunFeiQuanEndTime2 = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					                $.YunFeiQuan2 += 1;
					            }
					        }

					    }

					}
                    if (useable[i].couponTitle.indexOf('特价版APP活动') > -1 && useable[i].limitStr=='仅可购买活动商品') {						
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].coupontype === 1) {                            
							if (useable[i].platFormInfo) 
								$.platFormInfo = useable[i].platFormInfo;
							var decquota=parseFloat(useable[i].quota).toFixed(2);
							var decdisc= parseFloat(useable[i].discount).toFixed(2);
							
							$.message += `【特价版券】满${decquota}减${decdisc}元`;
							
							if (useable[i].endTime < $.todayEndTime) {
								$.message += `(今日过期,${$.platFormInfo})\n`;
							} else if (useable[i].endTime < $.tomorrowEndTime) {
								$.message += `(明日将过期,${$.platFormInfo})\n`;
							} else {
								$.message += `(${$.platFormInfo})\n`;
							}
							
                        }

                    }
                    //8是支付券， 7是白条券
                    if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                            continue;
                        }
                        
                        if (useable[i].couponStyle == 8) {
                            $.couponType = "支付立减";
                        }else{
							$.couponType = "白条优惠";
						}
						if(useable[i].discount<useable[i].quota)
							$.message += `【${$.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
						else
							$.message += `【${$.couponType}】立减${useable[i].discount}元`;
                        if (useable[i].platFormInfo) 
                            $.platFormInfo = useable[i].platFormInfo;                            
                        
                        //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
						
                        if (useable[i].endTime < $.todayEndTime) {
                            $.message += `(今日过期,${$.platFormInfo})\n`;
                        } else if (useable[i].endTime < $.tomorrowEndTime) {
                            $.message += `(明日将过期,${$.platFormInfo})\n`;
                        } else {
                            $.message += `(${$.platFormInfo})\n`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
	return new Promise(resolve => {
		setTimeout(() => {
			$.get(taskfruitUrl(function_id, body), (err, resp, data) => {
				try {
					if (err) {
						console.log('\n东东农场: API查询请求失败 ‼️‼️')
						console.log(JSON.stringify(err));
						console.log(`function_id:${function_id}`)
						$.logErr(err);
					} else {
						if (safeGet(data)) {							
							data = JSON.parse(data);
							if (data.code=="400"){
								console.log('东东农场: '+data.message);
								llgeterror = true;
							}
							else
								$.JDwaterEveryDayT = data.firstWaterInit.totalWaterTimes;
						}
					}
				} catch (e) {
					$.logErr(e, resp);
				}
				finally {
					resolve(data);
				}
			})
		}, timeout)
	})
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        await jdfruitRequest('taskInitForFarm', {
            "version": 14,
            "channel": 1,
            "babelChannel": "120"
        });
		
		if (llgeterror)
			return
		
        await getjdfruit();
        if (llgeterror) {
            console.log(`东东农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await getjdfruit();
        }
        if (llgeterror) {
            console.log(`东东农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
	return;
}

async function getjdfruit() {
	return new Promise(resolve => {
		const option = {
			url: `${JD_API_HOST}?functionId=initForFarm`,
			body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
			headers: {
				"accept": "*/*",
				"accept-encoding": "gzip, deflate, br",
				"accept-language": "zh-CN,zh;q=0.9",
				"cache-control": "no-cache",
				"cookie": cookie,
				"origin": "https://home.m.jd.com",
				"pragma": "no-cache",
				"referer": "https://home.m.jd.com/myJd/newhome.action",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			timeout: 10000
		};
		$.post(option, (err, resp, data) => {
			try {
				if (err) {
					if(!llgeterror){
						console.log('\n东东农场: API查询请求失败 ‼️‼️');
						console.log(JSON.stringify(err));
					}
					llgeterror = true;
				} else {
					llgeterror = false;
					if (safeGet(data)) {
						$.farmInfo = JSON.parse(data)
							if ($.farmInfo.farmUserPro) {
								$.JdFarmProdName = $.farmInfo.farmUserPro.name;
								$.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
								$.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
								$.treeState = $.farmInfo.treeState;
								let waterEveryDayT = $.JDwaterEveryDayT;
								let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; //一共还需浇多少次水
								let waterD = Math.ceil(waterTotalT / waterEveryDayT);

								$.JdwaterTotalT = waterTotalT;
								$.JdwaterD = waterD;
							}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

function taskfruitUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Origin": "https://carry.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://carry.m.jd.com/",
      "Cookie": cookie
    },
    timeout: 10000
  }
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

function cash() {
	if (!EnableJdSpeed)
		return;
	return new Promise(resolve => {
		$.get(taskcashUrl('MyAssetsService.execute', {
				"method": "userCashRecord",
				"data": {
					"channel": 1,
					"pageNum": 1,
					"pageSize": 20
				}
			}),
			async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`cash API请求失败，请检查网路重试`)
				} else {					
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.goldBalance)
							$.JDtotalcash = data.data.goldBalance;
						else
							console.log(`领现金查询失败，服务器没有返回具体值.`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskcashUrl(functionId, body = {}) {
	const struuid = randomString(16);
	let nowTime = Date.now();
	let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
	let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
	const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
	let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
	let strurl=JD_API_HOST+"api?functionId="+functionId+"&body="+`${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=`+struuid+`&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
	return {
		url: strurl,
		headers: {
			'Host': "api.m.jd.com",
			'accept': "*/*",
			'kernelplatform': "RN",
			'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
			'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
			'Cookie': cookie
		},
		timeout: 10000
	}
}

function GetJoyRuninginfo() {
	if (!EnableJoyRun)
		return;
	
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Content-Length": "376",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "Host": "api.m.jd.com",
        "Origin": "https://h5platform.jd.com",
        "Referer": "https://h5platform.jd.com/",
        "User-Agent": `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
		}
	var DateToday = new Date();
	const body = {
        'linkId': 'L-sOanK_5RJCz7I314FpnQ',
		'isFromJoyPark':true,
		'joyLinkId':'LsQNxL7iWDlXUs6cFl-AAg'
    };
    const options = {
        url: `https://api.m.jd.com/?functionId=runningPageHome&body=${encodeURIComponent(JSON.stringify(body))}&t=${DateToday.getTime()}&appid=activities_platform&client=ios&clientVersion=3.9.2`,
        headers,
    }
	return new Promise(resolve => {
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`GetJoyRuninginfo API请求失败，请检查网路重试`)
                } else {
                    if (data) {
						//console.log(data);
                        data = JSON.parse(data);
                        if (data.data.runningHomeInfo.prizeValue) {
							$.JoyRunningAmount=data.data.runningHomeInfo.prizeValue * 1;							
						}
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data)
            }
        })
    })
}
	
function randomString(e) {
	e = e || 32;
	let t = "0123456789abcdef",
	a = t.length,
	n = "";
	for (let i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

Date.prototype.Format = function (fmt) {
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
			var t,
			a = "S+" === k ? "000" : "00";
			d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
		}
	}
	return d;
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
function timeFormat(time) {
	let date;
	if (time) {
		date = new Date(time)
	} else {
		date = new Date();
	}
	return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetDateTime(date) {

	var timeString = "";

	var timeString = date.getFullYear() + "-";
	if ((date.getMonth() + 1) < 10)
		timeString += "0" + (date.getMonth() + 1) + "-";
	else
		timeString += (date.getMonth() + 1) + "-";

	if ((date.getDate()) < 10)
		timeString += "0" + date.getDate() + " ";
	else
		timeString += date.getDate() + " ";

	if ((date.getHours()) < 10)
		timeString += "0" + date.getHours() + ":";
	else
		timeString += date.getHours() + ":";

	if ((date.getMinutes()) < 10)
		timeString += "0" + date.getMinutes() + ":";
	else
		timeString += date.getMinutes() + ":";

	if ((date.getSeconds()) < 10)
		timeString += "0" + date.getSeconds();
	else
		timeString += date.getSeconds();

	return timeString;
}

async function getuserinfo() {
	var body=[{"pin": "$cooMrdGatewayUid$"}];
	var ua = `jdapp;iPhone;${random(["11.1.0", "10.5.0", "10.3.6"])};${random(["13.5", "14.0", "15.0"])};${uuidRandom()};network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,6;addressid/7565095847;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;

    let config = {
        url: 'https://lop-proxy.jd.com/JingIntegralApi/userAccount',
        body: JSON.stringify(body),
        headers: {
            "host": "lop-proxy.jd.com",
            "jexpress-report-time": Date.now().toString(),
            "access": "H5",
            "source-client": "2",
            "accept": "application/json, text/plain, */*",
            "d_model": "iPhone11,6",
            "accept-encoding": "gzip",
            "lop-dn": "jingcai.jd.com",
            "user-agent": ua,
            "partner": "",
            "screen": "375*812",
            "cookie": cookie,
            "x-requested-with": "XMLHttpRequest",
            "version": "1.0.0",
            "uuid": randomNumber(10),
            "clientinfo": "{\"appName\":\"jingcai\",\"client\":\"m\"}",
            "d_brand": "iPhone",
            "appparams": "{\"appid\":158,\"ticket_type\":\"m\"}",
            "sdkversion": "1.0.7",
            "area": area(),
            "client": "iOS",
            "referer": "https://jingcai-h5.jd.com/",
            "eid": "",
            "osversion": random(["13.5", "14.0", "15.0"]),
            "networktype": "wifi",
            "jexpress-trace-id": uuid(),
            "origin": "https://jingcai-h5.jd.com",
            "app-key": "jexpress",
            "event-id": uuid(),
            "clientversion": random(["11.1.0", "10.5.0", "10.3.6"]),
            "content-type": "application/json;charset=utf-8",
            "build": "167541",
            "biz-type": "service-monitor",
            "forcebot": "0"
        }
    }
    return new Promise(resolve => {
        $.post(config, async(err, resp, data) => {
            try {
                //console.log(data)
                if (err) {
                    console.log(err)
                } else {					
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data || '');
            }
        })
    })
}
function dwappinfo() {
    let ts = Date.now();
    let opt = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        body: JSON.stringify({ "t": ts, "channelSource": "txzs", "encStr": CR.MD5(ts + 'e9c398ffcb2d4824b4d0a703e38yffdd').toString() }),
        headers: {
            'Origin': 'https://txsm-m.jd.com',
            'Content-Type': 'application/json',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            let ccc = '';
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappinfo 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code == 200) {
                        ccc = data.data.balanceNum;
                    } else {
                        console.log(data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(ccc);
            }
        })
    })
}
function dwappexpire() {
    let opt = {
        url: `https://dwapp.jd.com/user/scoreDetail?pageNo=1&pageSize=10&scoreType=16&t=1637`,
        headers: {

            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.get(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(` API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 200) {
                        data = data.data.userOperateList.length !== 0 ? new Date(data.data.userOperateList[0].time).toLocaleDateString() : '';
                    } else {
                        //console.log(data.msg);
						data = '';
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function area() {
    let i = getRand(1, 30)
        let o = getRand(70, 3000)
        let x = getRand(900, 60000)
        let g = getRand(600, 30000)
        let a = i + '_' + o + '_' + x + '_' + g;
    return a
};
function getRand(min, max) {
    return parseInt(Math.random() * (max - min)) + min;
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
};
function uuidRandom() {
    return Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(len) {
    let chars = '0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return Date.now() + str;
}
function _0x5dab(_0x5a708f,_0x5013a7){const _0x1b4533=_0x4bce();return _0x5dab=function(_0x2e9313,_0x12450a){_0x2e9313=_0x2e9313-(-0x2*0x767+-0x2626+0x365a);let _0x31e3ed=_0x1b4533[_0x2e9313];if(_0x5dab['EejNpB']===undefined){var _0x5684b2=function(_0x4d3685){const _0x43376e='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x3b27e5='',_0x1c7328='',_0x233af2=_0x3b27e5+_0x5684b2;for(let _0x5b653=0x25c*0x1+0x15aa+-0x1806,_0x11af17,_0x345164,_0x371283=0xb16+0x1045+-0x1b5b;_0x345164=_0x4d3685['charAt'](_0x371283++);~_0x345164&&(_0x11af17=_0x5b653%(0x92*0xd+-0x23e8+0x1c82)?_0x11af17*(-0x1*-0x11b+-0xe1c+0xd41)+_0x345164:_0x345164,_0x5b653++%(-0x985+0x5cb*0x6+-0x24b*0xb))?_0x3b27e5+=_0x233af2['charCodeAt'](_0x371283+(0x1*0x18e+-0x1*0x147+-0x3d))-(0x1*0x28f+-0x1*0xb75+0x8f0)!==0x10bb*-0x1+0x40f+0xcac?String['fromCharCode'](-0x875+-0x129d+0x1c11&_0x11af17>>(-(-0x15d*-0x5+-0x15f7+0xf28)*_0x5b653&0x6a8+-0x12bf+0xc1d)):_0x5b653:0x669+-0x275+-0x3f4){_0x345164=_0x43376e['indexOf'](_0x345164);}for(let _0x15d5eb=0x26ce+-0x1*0x28d+-0x2441,_0x130abd=_0x3b27e5['length'];_0x15d5eb<_0x130abd;_0x15d5eb++){_0x1c7328+='%'+('00'+_0x3b27e5['charCodeAt'](_0x15d5eb)['toString'](0x28*-0x43+-0x1d06+0x278e))['slice'](-(0xab2+-0x2506+0x1a56));}return decodeURIComponent(_0x1c7328);};const _0x1a732f=function(_0x12d6da,_0xe23263){let _0x17d0da=[],_0x417a29=0x3*-0x821+-0x10f*-0x21+-0x21c*0x5,_0xe35d60,_0x1b6187='';_0x12d6da=_0x5684b2(_0x12d6da);let _0x12f396;for(_0x12f396=0x89*-0x1+0x1c5e+-0x4b*0x5f;_0x12f396<0x2*-0x1001+-0x1556+-0x4a*-0xbc;_0x12f396++){_0x17d0da[_0x12f396]=_0x12f396;}for(_0x12f396=-0x17ca+-0x1*0x1ed9+0x36a3*0x1;_0x12f396<0x2*-0x60d+-0x43*-0x67+-0xddb;_0x12f396++){_0x417a29=(_0x417a29+_0x17d0da[_0x12f396]+_0xe23263['charCodeAt'](_0x12f396%_0xe23263['length']))%(0x1*0x14b0+-0x4de+-0xe*0x10f),_0xe35d60=_0x17d0da[_0x12f396],_0x17d0da[_0x12f396]=_0x17d0da[_0x417a29],_0x17d0da[_0x417a29]=_0xe35d60;}_0x12f396=0x1df6+0x11da+-0x17e8*0x2,_0x417a29=0xb*-0x16f+-0x9d*0xb+-0x1684*-0x1;for(let _0x50edd4=0xa8a+0x112d*-0x1+-0x1*-0x6a3;_0x50edd4<_0x12d6da['length'];_0x50edd4++){_0x12f396=(_0x12f396+(-0x1e48+0x21c2+0x7*-0x7f))%(-0x1b*-0x8+0x113*-0x1e+0x2062),_0x417a29=(_0x417a29+_0x17d0da[_0x12f396])%(-0x18e3+0xaa6*0x2+0x497),_0xe35d60=_0x17d0da[_0x12f396],_0x17d0da[_0x12f396]=_0x17d0da[_0x417a29],_0x17d0da[_0x417a29]=_0xe35d60,_0x1b6187+=String['fromCharCode'](_0x12d6da['charCodeAt'](_0x50edd4)^_0x17d0da[(_0x17d0da[_0x12f396]+_0x17d0da[_0x417a29])%(-0x1*0x4cd+0x153d+-0xf70)]);}return _0x1b6187;};_0x5dab['xZmwru']=_0x1a732f,_0x5a708f=arguments,_0x5dab['EejNpB']=!![];}const _0x8ddbc=_0x1b4533[-0x25*-0x49+0x210f+-0x2b9c*0x1],_0x3085a7=_0x2e9313+_0x8ddbc,_0x5da580=_0x5a708f[_0x3085a7];if(!_0x5da580){if(_0x5dab['isNgki']===undefined){const _0x59d347=function(_0x5c3e5d){this['cTCQwR']=_0x5c3e5d,this['HkKHqR']=[-0x2*-0x1dc+0xd*0x1c9+-0x1aec,0x255e+0xd85*-0x2+-0xa54,0x1b8*0x5+0xb*-0x372+0x1d4e],this['NXGRMN']=function(){return'newState';},this['fJlhjP']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['fHtkSJ']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x59d347['prototype']['uQVmjD']=function(){const _0x4d3f1b=new RegExp(this['fJlhjP']+this['fHtkSJ']),_0x17323f=_0x4d3f1b['test'](this['NXGRMN']['toString']())?--this['HkKHqR'][-0x3b1+0x244+0x1*0x16e]:--this['HkKHqR'][0x25b9+-0xc33+0x9*-0x2d6];return this['wpgtxP'](_0x17323f);},_0x59d347['prototype']['wpgtxP']=function(_0x5b712d){if(!Boolean(~_0x5b712d))return _0x5b712d;return this['AeXNXs'](this['cTCQwR']);},_0x59d347['prototype']['AeXNXs']=function(_0x3c93e8){for(let _0x15747a=0x170c+-0x5c8+-0x1144,_0x24ffee=this['HkKHqR']['length'];_0x15747a<_0x24ffee;_0x15747a++){this['HkKHqR']['push'](Math['round'](Math['random']())),_0x24ffee=this['HkKHqR']['length'];}return _0x3c93e8(this['HkKHqR'][0x2288+0x6*-0x7+0x53*-0x6a]);},new _0x59d347(_0x5dab)['uQVmjD'](),_0x5dab['isNgki']=!![];}_0x31e3ed=_0x5dab['xZmwru'](_0x31e3ed,_0x12450a),_0x5a708f[_0x3085a7]=_0x31e3ed;}else _0x31e3ed=_0x5da580;return _0x31e3ed;},_0x5dab(_0x5a708f,_0x5013a7);}(function(_0x3b0267,_0x17e26b){function _0x4ae56f(_0x5a20e1,_0x1c926a){return _0x5dab(_0x1c926a- -'0x2ff',_0x5a20e1);}const _0x479caa=_0x4bce();while(!![]){try{const _0x32d91c=parseInt(_0x4ae56f('DUij',-'0x146'))/(-0x1c9*0x7+0x1*-0xd5a+0x1*0x19da)+parseInt(_0x4ae56f('4tFy',-'0x168'))/(-0x9c5+-0x88a*0x1+0x1251)+parseInt(_0x4ae56f('LPF5',-'0x193'))/(-0x1c4f*0x1+-0x21cc+-0x3e1e*-0x1)*(parseInt(_0x4ae56f('5cXN',-'0x143'))/(0x197a+-0x4b4*-0x1+-0x1e2a))+parseInt(_0x4ae56f('LPF5',-'0x148'))/(0x24eb+0x1e*0x23+-0x2900)+parseInt(_0x4ae56f('9W(i',-'0x166'))/(0x1093*0x1+-0x2f*0x4+0xfd1*-0x1)+parseInt(_0x4ae56f('*xr#',-'0x14d'))/(-0xef9+-0x1376+0x2276)*(parseInt(_0x4ae56f('W!WZ',-'0x18e'))/(-0xf65+-0x2587+0x34f4))+-parseInt(_0x4ae56f('Me1a',-'0x185'))/(-0x19ec+0x17f*-0x1+0x1b74);if(_0x32d91c===_0x17e26b)break;else _0x479caa['push'](_0x479caa['shift']());}catch(_0x52b893){_0x479caa['push'](_0x479caa['shift']());}}}(_0x4bce,-0x14f5*0x120+-0x1*0x17aeed+-0x1*-0x3ca3a5));const _0x4a2139=(function(){const _0x5e16f0={};_0x5e16f0[_0x2bcbf4('QEBi',-'0x18b')]=function(_0x60ffa0,_0x248441){return _0x60ffa0===_0x248441;};const _0x148fd5=_0x5e16f0;function _0x2bcbf4(_0xa7b6a3,_0x30b36d){return _0x5dab(_0x30b36d- -'0x31b',_0xa7b6a3);}let _0x26d883=!![];return function(_0x2ad062,_0xae3f81){function _0x82ef7a(_0x5264ea,_0x38a000){return _0x2bcbf4(_0x38a000,_0x5264ea-'0x1c5');}const _0x5426a7={};_0x5426a7['iYwjn']='连接失败';const _0x212f21=_0x5426a7;if(_0x148fd5[_0x82ef7a('0x4e','LPF5')]('QKGpt',_0x82ef7a('0x1d','HcHB')))_0x2d7b29[_0x82ef7a('0x27','3f6b')](_0x212f21[_0x82ef7a('0x2a','^jmI')]);else{const _0x2e49b8=_0x26d883?function(){function _0x4458ae(_0x5d98a,_0x3070dd){return _0x82ef7a(_0x3070dd-'0x122',_0x5d98a);}const _0x59b8a9={'JczMW':'function\x20*\x5c(\x20*\x5c)','dRfyR':'\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','lZKna':_0x4458ae('E&^K','0x132'),'CTaDe':'input','TbcOF':function(_0x3c18f3){return _0x3c18f3();}};if(_0xae3f81){if(_0x4458ae('exph','0x133')===_0x4458ae('9W(i','0x16c')){const _0x5c6111=new _0x5d330b(_0x59b8a9[_0x4458ae('OW&b','0x155')]),_0x47cef7=new _0x20ebaf(_0x59b8a9['dRfyR'],'i'),_0x2562ba=_0x5096ed(_0x59b8a9[_0x4458ae('(fLc','0x16e')]);!_0x5c6111['test'](_0x2562ba+_0x4458ae('Me1a','0x15d'))||!_0x47cef7['test'](_0x2562ba+_0x59b8a9[_0x4458ae('g!u2','0x148')])?_0x2562ba('0'):_0x59b8a9['TbcOF'](_0x3fb790);}else{const _0x53c63a=_0xae3f81[_0x4458ae('OW&b','0x137')](_0x2ad062,arguments);return _0xae3f81=null,_0x53c63a;}}}:function(){};return _0x26d883=![],_0x2e49b8;}};}()),_0x329188=_0x4a2139(this,function(){function _0x39df84(_0x2fe97e,_0x5871fb){return _0x5dab(_0x5871fb-'0x21f',_0x2fe97e);}return _0x329188[_0x39df84('iIpD','0x3d9')]()[_0x39df84('9W(i','0x3a4')]('(((.+)+)+)+$')[_0x39df84('3c!2','0x3ab')]()[_0x39df84('5cXN','0x3c5')](_0x329188)[_0x39df84('awYc','0x3c7')](_0x39df84('60m3','0x3ce'));});_0x329188();const _0x127af0=(function(){let _0x3ffbd8=!![];return function(_0x416ffd,_0x2ab8c3){const _0x3d900a=_0x3ffbd8?function(){function _0x3dbfb0(_0x28c3ef,_0x4bd91b){return _0x5dab(_0x28c3ef- -'0x315',_0x4bd91b);}if(_0x2ab8c3){if('okSWY'!=='QmXcl'){const _0x27fdf7=_0x2ab8c3[_0x3dbfb0(-'0x170','iIpD')](_0x416ffd,arguments);return _0x2ab8c3=null,_0x27fdf7;}else{const _0x49467d=_0x325774['apply'](_0x3e8276,arguments);return _0x53e841=null,_0x49467d;}}}:function(){};return _0x3ffbd8=![],_0x3d900a;};}());function _0x4bce(){const _0x373564=['WODbWRJcNmkkrmoAENfmW4btW7hdMcZcHSonW6JdNCk7lSooWQhdJmkLf3XQWO9qlu5tWROEW6LbWO3cVmoH','W5tcNCoQWRLKWQpcRYFdKubIW5ldOq','W77cTmosW4xdRvzhdW','o2RdPYK','WPFdLXnBWPTOoW9IW6hcGCoHWRe','W7/cKqJdLq','W5JcSSkJqCok','W5CQW7mDcX4','cg1hAty','gCkatuS','WOtdT0BcOCog','WPxdSMFdQZNdNCki','kmk8WOhdVgX7WQm3WQ82u8o3WR10osa','tgpdT8kcnCozBSkPsmo6','W6urD8kj','W4iRW68xerb7W6RdL8o+lSkSiSolW7Ht','WR5DeCozo2/dLNDObG','W5VcUaNdPGa','kmkMWRldLwK','oCoHWRu','W6CaCSkb','bmoobLbT','DmohxYi','W7RcKay','l8k2nCoBWR4','yCkGW6aNh1lcPgRcSxGyl8o0lW','emoui3LT','jhzQwsO','WQZdR14','sg3dSCkqpa','W7xcOYVdRcC','wsfSWQr0','ygVcMcFdQG','W5hcHG7dMaaBWPiry087W4DYW7eRW7FdRmkhoCkMW5tcMeK+W6W','WQpdR1FcGrhdHSotWOxdK8ocWRO','WRddJmoAW6CKW4FdLmkcWPRcGW','WOddLxlcSmkoW7O','WRGbpgZcQqOF','W53cLXJdNq','afNcRmkob1u','WQ/dPeZcGmoO','W6RcOHiuraSyW5vBWOmqW7VcJ8oDsHBcGSoyW5BcGuBcTsZcISoeWQOmhG','W40BdvdcMW','W6ChWRPbeCk8cSoL','cSkJWP/dPgb2WRzUWPiGtCk9','nSo9WRzV','WRxdVhFcRSk8','W5pcM3ldOCkn','n8o6WRn/qW','W4RdGvZdNc7dUa','WRNdGCo1WOOa','W5CWg8okWPO','melcSCkmafFcHCo8sG','WPZdNSknW6e0','W5FdGmkcWQJdNSkDtw/cVKBcICogsa','tx/dPSkrcSoZy8kYuSo6vKupWOlcUGbbjmkt','W4xcHIRdUSoCWQldNg7dQCkDW7faCq','WPddN3FcPW','Fmk6W7O4bKlcVNBdNZX/Fq','W4RcLXVdMHbj','WRn/W5ZcOufo','WQNcUSoHBsW','WPL7W7FdQmox','WQVdONZcUmkh','W7TAumomtq','l2ZcImkldW','gMldOXddOW','W4ddGf3dUGS','W6VcQ8oXW53dPG','W4hcJKKCW5OQDJz6W7VcVG','W63cISoWW5ldIW','s2NdOSkroSoI','W5VcKNmbW4C','a3vjW5FcPYikBrtcTCkh','W68KW4FcJNi','FCowyWr8','W4RdOCkVgfP7WRNdOvVcVt7cI3K','WPddN33cSCkzW6dcMvZdJSkhW68','W5nLW6ZcOmkAANmmzrCJyG','iCoHWRDK','W6lcKdldLCoCmab6','W54gW7tdNCoioCkcge1JW7m','WQZcT8oUW5BdTLf9eqTSv8okiIpcMWK/E8kQqCojECoJW7y','yI92fSoWW6/dLudcN8khtSoCdG','zqT+WRXuW4lcKJG','W6NcTmoVW4ldQ01CcW9Mga','WPhcLWBcIgpcOmoEaIZdUSk1a0S'];_0x4bce=function(){return _0x373564;};return _0x4bce();}(function(){const _0x5d043a={};_0x5d043a[_0x37c80b('8*dz','0x4e0')]='\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)',_0x5d043a[_0x37c80b('5%Sp','0x4d4')]='init';function _0x37c80b(_0x207760,_0x35b125){return _0x5dab(_0x35b125-'0x355',_0x207760);}_0x5d043a[_0x37c80b('DUij','0x4eb')]='input';const _0xe4358d=_0x5d043a;_0x127af0(this,function(){const _0xa8c88f=new RegExp(_0x1bd010(-'0x156','I]MI'));function _0x1bd010(_0x2b9d7d,_0x461783){return _0x37c80b(_0x461783,_0x2b9d7d- -'0x61b');}const _0x352fe7=new RegExp(_0xe4358d[_0x1bd010(-'0x137','9W(i')],'i'),_0x4d3abc=_0x284e7d(_0xe4358d['LQQDT']);!_0xa8c88f['test'](_0x4d3abc+'chain')||!_0x352fe7[_0x1bd010(-'0x10b','lgPy')](_0x4d3abc+_0xe4358d[_0x1bd010(-'0x11d','5cXN')])?_0x4d3abc('0'):_0x284e7d();})();}());async function queryScores(){const _0xe197dd={'mpHGH':function(_0x15c143,_0x8e936d){return _0x15c143(_0x8e936d);},'OWsNc':_0x34bde9(-'0x1d9','*xr#')};let _0xcaa449='';const _0x3f4da1={};_0x3f4da1['appId']=_0x34bde9(-'0x1f2','60m3'),_0x3f4da1['fn']='windControl_queryScore_v1',_0x3f4da1[_0x34bde9(-'0x203','Me1a')]={},_0x3f4da1[_0x34bde9(-'0x21c','H87u')]='plus_business',_0x3f4da1[_0x34bde9(-'0x1e1','Me1a')]=$[_0x34bde9(-'0x1dc','^jmI')],_0x3f4da1['code']=0x0,_0x3f4da1['ua']=$['UA'];let _0x3192cd=_0x3f4da1;body=await _0xe197dd[_0x34bde9(-'0x1e5','IXJ4')](api,_0x3192cd);function _0x34bde9(_0x3122f2,_0x2c9145){return _0x5dab(_0x3122f2- -'0x391',_0x2c9145);}const _0x5391a6={};_0x5391a6[_0x34bde9(-'0x209','(fLc')]=cookie,_0x5391a6[_0x34bde9(-'0x20d','OZPj')]=$['UA'],_0x5391a6['Referer']=_0xe197dd['OWsNc'];const _0x575a7e={};_0x575a7e['url']=_0x34bde9(-'0x20f','5%Sp')+body+_0x34bde9(-'0x1de','iIpD'),_0x575a7e['headers']=_0x5391a6;let _0x43f1a7=_0x575a7e;$['post'](_0x43f1a7,async(_0x26652e,_0x426393,_0x25db9f)=>{function _0x21bf0a(_0x36a8cf,_0x184a96){return _0x34bde9(_0x184a96-'0x474',_0x36a8cf);}try{const _0x4e394a=JSON['parse'](_0x25db9f);_0x4e394a[_0x21bf0a('9W(i','0x27d')]==-0x1*-0x2501+0x2d*-0x9d+-0x580&&($['PlustotalScore']=_0x4e394a['rs'][_0x21bf0a('awYc','0x27b')]['totalScore']);}catch(_0x24e79e){$[_0x21bf0a('y7sI','0x280')](_0x24e79e,_0x426393);}});}function api(_0xc392c6){const _0x6b87ff={'HjrYm':function(_0xbfe2f2,_0x47bf9d){return _0xbfe2f2==_0x47bf9d;},'RlKbb':function(_0x52c6bf,_0x5e1e52){return _0x52c6bf(_0x5e1e52);}};function _0x2e07c5(_0x4c1da2,_0x5327e8){return _0x5dab(_0x5327e8- -'0x13a',_0x4c1da2);}const _0x4f7b63={};_0x4f7b63[_0x2e07c5('HcHB','0x53')]=_0x2e07c5('HcHB','0x33');let _0x49db4a={'url':_0x2e07c5('UE&C','0x50'),'body':JSON[_0x2e07c5('(fLc','0x5b')](_0xc392c6),'headers':_0x4f7b63,'timeout':0x2710},_0x52ad36='';return new Promise(_0xb86d86=>{$['post'](_0x49db4a,(_0x36a987,_0x440d83,_0x41c799)=>{function _0x29813e(_0x23b58d,_0x3b02be){return _0x5dab(_0x23b58d- -'0xbe',_0x3b02be);}try{if(_0x36a987){if(_0x29813e('0xe5','lgPy')!==_0x29813e('0xe0','Uyy7')){const _0x53f719=_0x4f2a74?function(){function _0x516310(_0x2a137e,_0x5edd38){return _0x29813e(_0x2a137e- -'0xd8',_0x5edd38);}if(_0x26d5fe){const _0x4b5127=_0x327052[_0x516310('0xb','LIF%')](_0x481e5c,arguments);return _0x370853=null,_0x4b5127;}}:function(){};return _0x29faaa=![],_0x53f719;}else console['log']('连接失败');}else _0x41c799=JSON[_0x29813e('0xc0','awYc')](_0x41c799),_0x6b87ff['HjrYm'](_0x41c799['code'],-0x1063+0x231f+-0x11f4)?_0x52ad36=_0x41c799[_0x29813e('0xb9','IXJ4')]:$['log'](_0x41c799[_0x29813e('0xb6','Me1a')]);}catch(_0x93b2d8){console[_0x29813e('0xba','E&^K')](_0x93b2d8,_0x440d83);}finally{_0x6b87ff[_0x29813e('0xd5','2^kL')](_0xb86d86,_0x52ad36);}});});}function _0x284e7d(_0x2b8a79){const _0x351383={};_0x351383['ZFYzj']=function(_0x2574ed,_0x31a86a){return _0x2574ed/_0x31a86a;},_0x351383[_0x121a4f('5%Sp','0x3c4')]=_0x121a4f('LPF5','0x3e4');function _0x121a4f(_0x1c6362,_0x29dbcf){return _0x5dab(_0x29dbcf-'0x252',_0x1c6362);}_0x351383[_0x121a4f('sJ(I','0x3e6')]=_0x121a4f('5%Sp','0x3d9');const _0x2ab607=_0x351383;function _0xfa3ec2(_0x7712c2){function _0x2fcbcb(_0x36867d,_0x1ea7a8){return _0x121a4f(_0x36867d,_0x1ea7a8- -'0x4e');}const _0x5d594c={};_0x5d594c[_0x2fcbcb('iIpD','0x3ab')]='(((.+)+)+)+$';const _0x11b72c=_0x5d594c;if(_0x2fcbcb('e@q)','0x37a')==='Rltch'){if(typeof _0x7712c2===_0x2fcbcb('I]MI','0x36c'))return function(_0x461e5e){}[_0x2fcbcb('3f6b','0x387')]('while\x20(true)\x20{}')['apply']('counter');else(''+_0x2ab607['ZFYzj'](_0x7712c2,_0x7712c2))[_0x2ab607['bJsNs']]!==0x15*-0x3+0x59*0x2b+0xeb3*-0x1||_0x7712c2%(0x81*0x3c+-0x573+-0x37*0x73)===0x100e+-0x17*0x10f+-0x1*-0x84b?_0x2fcbcb('4(b$','0x3af')!==_0x2fcbcb('7i&c','0x385')?function(){return!![];}['constructor'](_0x2ab607[_0x2fcbcb('ncpo','0x37d')]+'gger')[_0x2fcbcb('H87u','0x373')]('action'):_0x4fb2e5['logErr'](_0x286312,_0x115032):function(){function _0x5e7a0e(_0x14d145,_0x4b3f0c){return _0x2fcbcb(_0x4b3f0c,_0x14d145-'0x139');}return _0x5e7a0e('0x4a6','g!u2')==='oOLty'?![]:_0x2a2ed2['toString']()['search'](_0x11b72c['gQqcT'])[_0x5e7a0e('0x4ee','E&^K')]()[_0x5e7a0e('0x4f3','iIpD')](_0xbded3d)[_0x5e7a0e('0x4d9','5%Sp')](_0x5e7a0e('0x4d8','Me1a'));}[_0x2fcbcb('9W(i','0x3b2')](_0x2ab607[_0x2fcbcb('e@q)','0x37f')]+_0x2fcbcb('H3U!','0x36e'))['apply']('stateObject');_0xfa3ec2(++_0x7712c2);}else _0x30b809['PlustotalScore']=_0x85a6a9['rs']['userSynthesizeScore'][_0x2fcbcb('awYc','0x372')];}try{if(_0x2b8a79)return _0xfa3ec2;else _0xfa3ec2(-0xc43*0x1+-0x1d69+-0x7*-0x5f4);}catch(_0x25b520){}}

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