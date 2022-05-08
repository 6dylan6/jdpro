/*
活动入口：微信小程序-赚京豆-瓜分京豆

10 3-6 * * * https://raw.githubusercontent.com/6dylan6/jdpro/main/jd_zjd.js

安全，勿传，能用多久随缘

默认不运行，变量export DY_ZJD='true'运行

默认前3个CK开团，CK多的请自行修改tuannum数量

一组30豆，一天最多开三组，至少5个CK才能保证成一次！

部分账号还可能火爆，尝试多跑几次。

2022-4-27

2022年5月8日由https://github.com/insoxin/解密
解密附言:下列js中的服务器不是我的,原作就有,不承担任何责任,有能力者可自行解密对验

*/
 
let tuannum = 3; 

const $ = new Env('赚京豆-加密');

if ($.isNode() && process.env.DY_ZJD != 'true') {
    console.log(`\n默认不运行，如需运行请设置变量DY_ZJD='true'\n`);
    return;
}
const _0x4093a3=$.isNode()?require('./sendNotify'):'';
const _0x2d566c=$.isNode()?require('./jdCookie.js'):'';
let _0x523950=true;
let _0x141e18=[],_0x4e96f4='',_0xe5be03;
$.tuanList=[];
if($.isNode()){
	Object.keys(_0x2d566c).forEach(_0x1d72d5=>{
		_0x141e18.push(_0x2d566c[_0x1d72d5]);
	});
	if(process.env.JD_DEBUG&&process.env.JD_DEBUG==='false')console.log=()=>{};
	if(JSON.stringify(process.env).indexOf('GITHUB')>-1)process.exit(0);
}else{
	_0x141e18=[$.getdata('CookieJD'),$.getdata('CookieJD2'),..._0x498fe5($.getdata('CookiesJD')||'[]').map(_0x5d00fb=>_0x5d00fb.cookie)].filter(_0x4aac1f=>!!_0x4aac1f);
}
!(async()=>{
	if(!_0x141e18[0]){
		$.msg($.name,'【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取','https://bean.m.jd.com/bean/signIndex.action',{'open-url':'https://bean.m.jd.com/bean/signIndex.action'});
		return;
	}
	console.log('默认前3个CK开团，调整请修改tuannum，至少5个ck才能保证成一组！\n');
	console.log('====================开始开团====================\n');
	for(let _0x529659=0;_0x529659<tuannum;_0x529659++){
		if(_0x141e18[_0x529659]){
			_0x4e96f4=_0x141e18[_0x529659];
			$.UserName=decodeURIComponent(_0x4e96f4.match(/pt_pin=([^; ]+)(?=;?)/)&&_0x4e96f4.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.index=(_0x529659+1);
			$.isLogin=true;
			$.nickName='';
			_0xe5be03='';
			await _0x3e2dc4();
			console.log('\n******开始【京东账号'+$.index+'】'+($.nickName||$.UserName)+'*********\n');
			if(!$.isLogin){
				$.msg($.name,'【提示】cookie已失效','京东账号'+$.index+' '+($.nickName||$.UserName)+'\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action',{'open-url':'https://bean.m.jd.com/bean/signIndex.action'});
				if($.isNode()){
					await _0x4093a3.sendNotify($.name+'cookie已失效 - '+$.UserName,'京东账号'+$.index+' '+$.UserName+'\n请重新登录获取cookie');
				}
				continue;
			}
			await _0x2948a0();
		}
	}
	console.log('\n====================开始团助力====================\n');
	for(let _0x706a77=0;_0x706a77<_0x141e18.length;_0x706a77++){
		$.canHelp=true;
		if(_0x141e18[_0x706a77]){
			_0x4e96f4=_0x141e18[_0x706a77];
			$.index=(_0x706a77+1);
			$.UserName=decodeURIComponent(_0x4e96f4.match(/pt_pin=([^; ]+)(?=;?)/)&&_0x4e96f4.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			if($.canHelp&&(_0x141e18.length>$.assistNum)){
				if($.tuanList&&$.tuanList.length){
					console.log('账号'+$.index+'开始助力 ');
					for(let _0x53dd28=0;_0x53dd28<$.tuanList.length;_0x53dd28++){
						console.log('账号 '+$.UserName+' 开始给 【'+$.tuanList[_0x53dd28].assistedPinEncrypted+'】助力');
						$.max=false;
						await _0x1fefc2($.tuanList[_0x53dd28]);
						if($.max){
							$.tuanList.splice(_0x53dd28,1);
							_0x53dd28--;
							continue;
						}
						if(!$.canHelp)break;
						await $.wait(Math.random()*1000+500);
					}
				}else{
					console.log('助力已满，结束运行\n');
					break;
				}
			}else{
				console.log('CK数量不足，助力个毛\n');
				break;
			};
		}
	}
})().catch(_0x51e732=>{
	$.log('','❌ '+$.name+', 失败! 原因: '+_0x51e732+'!','');
}).finally(()=>{
	$.done();
});
function _0x88bddc(){
	return new Promise(_0x674cd8=>{
		if(_0xe5be03)$.msg($.name,'','【京东账号'+$.index+'】'+$.nickName+'\n'+_0xe5be03);
		_0x674cd8();
	});
}
async function _0x2948a0(){
	try{
		await _0x51a7ea();
		await _0x88bddc();
	}catch(_0x481c4a){
		$.logErr(_0x481c4a);
	}
}
async function _0x51a7ea(){
	try{
		$.tuan='';
		$.hasOpen=false;
		$.assistStatus=0;
		await _0x827654();
		if(!$.tuan&&(($.assistStatus===3)||($.assistStatus===2)||($.assistStatus===0))&&$.canStartNewAssist){
			console.log('准备再次开团');
			await _0x85bec0();
			if($.hasOpen)await _0x827654();
		}if($.tuan&&$.tuan.hasOwnProperty('assistedPinEncrypted')&&($.assistStatus!==3)){
			$.tuanList.push($.tuan);
		}
	}catch(_0x30a581){
		$.logErr(_0x30a581);
	}
}
async function _0x1fefc2(_0x8b6a20){
	return h5st=await _0x1b993b('vvipclub_distributeBean_assist',_0x8b6a20,'b9790'),new Promise(_0x3d557f=>{
		$.post(_0x1dcd6a(h5st.fn,h5st.body),async(_0x9b51f0,_0x249add,_0x164df9)=>{
			try{
				if(_0x9b51f0){
					console.log(''+JSON.stringify(_0x9b51f0));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(_0x237a84(_0x164df9)){
						_0x164df9=JSON.parse(_0x164df9);
						if(_0x164df9.success){
							console.log('助力结果：助力成功\n');
						}else{
							if(_0x164df9.resultCode==='9200008')console.log('助力结果：不能助力自己\n');else if(_0x164df9.resultCode==='9200011')console.log('助力结果：已助力过TA且没次数了\n');else if(_0x164df9.resultCode==='2400205'){
								console.log('助力结果：团已满\n');
								$.max=true;
							}else if(_0x164df9.resultCode==='90000014'){
								console.log('助力结果：助力次数已耗尽\n');
								$.canHelp=false;
							}else if(_0x164df9.resultCode==='2400203')console.log('助力结果：已助力过TA，还有助力次数\n');else if(_0x164df9.resultCode==='9000013'){
								console.log('助力结果：活动火爆，跳出\n');
								$.canHelp=false;
							}else if(_0x164df9.resultCode==='101'){
								console.log('助力结果：未登录，跳出\n');
								$.canHelp=false;
							}else console.log('助力结果：未知错误\n'+JSON.stringify(_0x164df9)+'\n\n');
						}
					}
				}
			}catch(_0x7bfa65){
				$.logErr(_0x7bfa65,_0x249add);
			}
			finally{
				_0x3d557f(_0x164df9);
			}
		});
	});
}
async function _0x827654(){
	return h5st=await _0x1b993b('distributeBeanActivityInfo',{'paramData':{'channel':'FISSION_BEAN'}},'d8ac0'),new Promise(_0x14ad78=>{
		$.post(_0x1dcd6a(h5st.fn,h5st.body),async(_0x3eb4ca,_0x3db7a6,_0x198f4b)=>{
			try{
				if(_0x3eb4ca){
					console.log(''+JSON.stringify(_0x3eb4ca));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(_0x237a84(_0x198f4b)){
						_0x198f4b=JSON.parse(_0x198f4b);
						if(_0x198f4b.success){
							$.log('\n当前账号能否再次开团: '+(_0x198f4b.data.canStartNewAssist?'可以':'否'));
							if((_0x198f4b.data.assistStatus===1)&&!_0x198f4b.data.canStartNewAssist){
								console.log('已开团(未达上限)，但团成员人未满\n');
							}else if((_0x198f4b.data.assistStatus===3)&&_0x198f4b.data.canStartNewAssist){
								console.log('已开团(未达上限)，团成员人已满\n');
							}else if((_0x198f4b.data.assistStatus===3)&&!_0x198f4b.data.canStartNewAssist){
								console.log('今日开团已达上限，且当前团成员人已满\n');
							}
							if(_0x198f4b.data&&!_0x198f4b.data.canStartNewAssist){
								$.tuan={'activityIdEncrypted':_0x198f4b.data.id,'assistStartRecordId':_0x198f4b.data.assistStartRecordId,'assistedPinEncrypted':_0x198f4b.data.encPin,'channel':'FISSION_BEAN','launchChannel':'undefined'};
							}
							$.tuanActId=_0x198f4b.data.id;
							$.assistNum=_0x198f4b.data.assistNum||4;
							$.assistStatus=_0x198f4b.data.assistStatus;
							$.canStartNewAssist=_0x198f4b.data.canStartNewAssist;
						}else{
							$.tuan=true;
							console.log('当前账号活动信息失败 '+JSON.stringify(_0x198f4b)+'\n');
						}
					}
				}
			}catch(_0x39e5d6){
				$.logErr(_0x39e5d6,_0x3db7a6);
			}
			finally{
				_0x14ad78(_0x198f4b);
			}
		});
	});
}
async function _0x85bec0(){
	return h5st=await _0x1b993b('vvipclub_distributeBean_startAssist',{'activityIdEncrypted':$.tuanActId,'channel':'FISSION_BEAN'},'dde2b',0),new Promise(_0x16c90b=>{
		$.post(_0x1dcd6a(h5st.fn,h5st.body),async(_0x340d32,_0x2f6063,_0x509eb6)=>{
			try{
				if(_0x340d32){
					console.log(''+JSON.stringify(_0x340d32));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(_0x237a84(_0x509eb6)){
						_0x509eb6=JSON.parse(_0x509eb6);
						if(_0x509eb6.success){
							console.log('>>>>>>>>>>>>>>>>>>>>>>>开团成功');
							$.hasOpen=true;
						}else{
							console.log('\n开团失败：'+JSON.stringify(_0x509eb6)+'\n');
						}
					}
				}
			}catch(_0x5183e5){
				$.logErr(_0x5183e5,_0x2f6063);
			}
			finally{
				_0x16c90b(_0x509eb6);
			}
		});
	});
}
function _0x1dcd6a(_0x4451bb,_0x2589a9){
	return{'url':'https://api.m.jd.com/api?functionId='+_0x4451bb+'&fromType=wxapp&timestamp='+new Date().getTime(),'body':_0x2589a9,'headers':{'Host':'api.m.jd.com','Connection':'keep-alive','Content-Length':'415','Cookie':_0x4e96f4,'content-type':'application/x-www-form-urlencoded','Accept-Encoding':'gzip,compress,br,deflate','User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.17(0x1800112e) NetType/WIFI Language/zh_CN','Referer':'https://servicewechat.com/wxa5bf5ee667d91626/182/page-frame.html'}};
}
function _0x3e2dc4(){
	return new Promise(async _0x119db1=>{
		const _0x3e7686={'url':'https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2','headers':{'Host':'wq.jd.com','Accept':'*/*','Connection':'keep-alive','Cookie':_0x4e96f4,'User-Agent':$.isNode()?process.env.JD_USER_AGENT?process.env.JD_USER_AGENT:require('./USER_AGENTS').USER_AGENT:$.getdata('JDUA')?$.getdata('JDUA'):'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1','Accept-Language':'zh-cn','Referer':'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&','Accept-Encoding':'gzip, deflate, br'}};
		$.get(_0x3e7686,(_0x37cf0c,_0x539ae5,_0x1b9d00)=>{
			try{
				if(_0x37cf0c){
					$.logErr(_0x37cf0c);
				}else{
					if(_0x1b9d00){
						_0x1b9d00=JSON.parse(_0x1b9d00);
						if(_0x1b9d00.retcode===1001){
							$.isLogin=false;
							return;
						}if((_0x1b9d00.retcode===0)&&_0x1b9d00.data&&_0x1b9d00.data.hasOwnProperty('userInfo')){
							$.nickName=_0x1b9d00.data.userInfo.baseInfo.nickname;
						}
					}else{
						console.log('京东服务器返回空数据');
					}
				}
			}catch(_0x583705){
				$.logErr(_0x583705);
			}
			finally{
				_0x119db1();
			}
		});
	});
}
function _0x237a84(_0x25754b){
	try{
		if(typeof JSON.parse(_0x25754b)=='object'){
			return true;
		}
	}catch(_0xa6281b){
		console.log(_0xa6281b);
		console.log('京东服务器访问数据为空，请检查自身设备网络情况');
		return false;
	}
}
function _0x498fe5(_0x3a3ae2){
	if(typeof _0x3a3ae2=='string'){
		try{
			return JSON.parse(_0x3a3ae2);
		}catch(_0x36dd5d){
			console.log(_0x36dd5d);
			$.msg($.name,'','请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie');
			return[];
		}
	}
}
function _0x1b993b(_0xf66f4d,_0x177936,_0x47b9b3){
	let _0x230110={'fn':_0xf66f4d,'body':_0x177936,'appid':'swat_miniprogram','appId':_0x47b9b3,'client':'android','clientVersion':'3.1.3','version':'3.0','code':0};
	return new Promise(_0x36c2e6=>{
		let _0x15d131={'url':'http://42.192.224.175/getH5ST','body':JSON.stringify(_0x230110),'headers':{'Content-Type':'application/json','log':'qjXxMnNiW6~uNJTmbBWxW9igKkWuRuXhcH0mWuhuMU2+ajWPW+Jv.UmRM9bvCC8YK0eGcmFoR0~yCBzzK8DmLVcRc0#wC+8IKlzOcVcBDctzBmc0L.InpocLAmtxC.O8RImmcmFoR.bST68lD0JfpubHM6tKT9b60IbHTcX0MHtwTuOST9Wfp7tGTlepCV8UNUayp88BT71zNCE6DjO6DIXaBCtnC.zzT0hOLoO6RIAcBkDeaIecBnX6B02paHKJM0icpnbFMlAlCBeJMHFxaI20RIIhBl8laIJONnxhZ9lyCUi#pnXgp7Xtc7OvpnblYnIfp.#6RIAFpBetL0aOL.tHB8t.C08uD0JfLUtZB0AKBktFZ6EyDJXFBubuNIbU..Wfp8KBZ6XgTCt6MIayAGORRIAYZ6De09b6WmAhMIeYp.hzWlAfRVA6MVF~Tuz6KyJXCyK6MlACpl~yL0ahToDtB.8WT68#RIXXBubHMubYpCDSaIJgRUXaRI#STnmFT8XGCk8GM7JXaUOIbjzya720plK~C.bYMU2fRUDFM7OPNVceCkFWB+OuM6Wn07shM7mgp8D6c0JXp9iZc0ewDItuBJD~aUOZA7zh.Uc6B.Jf0uOeNIAgWntoD.tmAJ0jDlxfCneobubAck8FRIOfK.ibq0cm0+cpRVIhWyOhblTnCHEjWlWyRUbibnixTkDu.IOxRUphb9ancUhyM7WfK.sfB7eWT6pyK7egRJ8aMCthaH8l.IhOauahZubzCI#ZMlIOBnX6c0IOTnbF07X6cntuZ+TzpkF6qoEfCntuB9XY06FpaUbcTcD6B0APp.mYK0ecK.J6TnbwaHKUq.IzpyFZLl~npCtZMkFH.UetaI2zC78#T7JfL0thblAzpccFc7WOBkF6RJtoTkDFCIafB.tGb9anT.xzKnbxBnbIB02.pjepMlJ6WnXHRUbaaJcuc0JHp8taMlT6NUbIc.JXRVKbqoABCHt6q0beT0etaUmXCUeUpcAxWytZaVAUCHEjD7JH.JX6B.bSTjz6ToIha6Ehb6D9BkD8blJYpueZBubCNCFYcIOcM0JIB6W6C.iIYmXccnciplc#CItIKyFwNnmuR.mwT7#FblJWAJcFR0OPcUe0L9JYp680Ml#VC.bFBUWnRU0fc9bTC7Dpa8#V.VthMnXxCc0jYlmfq+cBb78fp7bJCnWnaUtBTmA~p.xyqJNw.HtIc8s6Bn2tDcWnAotoR.8lC+8FWlOVcmFoD0c#07tJK9JHNV#Lb+bw.6KXLnJVcytoR.8lC+8FDIecT.#ob+OmcmXGq+c9CUm8ajOPNycUacDBNCF8N0Wlr7XoqJNwA+thMlIOCo8pKcNnr+cZc.bwCV8FKlOVcytoRCtwpmKIKlIOB6KIcCXvcUOlRVFfKBbbR0Om068ZDIm.p6tjcH0mWuhuMU2+bGWPW7egDUtbqctxcl76B.2xp8bHMUcpT0bxD0O.ToXaM9bS0kFYA7WORGO0TlcwcHFFB0hwpl#6b7AxCUOYNHFfAI2tplKYAU2FplWha7K0TlpfcH8ST0mWplX6M8tKBkDS.8~fRVAaTnXvaHtZBCFHpm8gMU8~092FDIXfNnObL9l6TcKucIbHK.tIB6X~CGOPa8shaI2pTybe.HFoqcshaUmpaI8e.IayMJshaV#paJDe.HFoM8shaUipaJDP.IblBcshaUipaJDP.IblA8Xvcm7urT55'},'timeout':30000};
		$.post(_0x15d131,async(_0x5bb78d,_0x2dfd5d,_0x230110)=>{
			try{
				if(_0x230110&&(_0x230110.indexOf('code')==-1)){
					_0x230110=JSON.parse(_0x230110);
				}else{
					console.log('签名获取失败，退出.');
					process.exit(1);
				}
			}catch(_0x1305c9){
				$.logErr(_0x1305c9,_0x2dfd5d);
			}
			finally{
				_0x36c2e6(_0x230110);
			}
		});
	});
};

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
