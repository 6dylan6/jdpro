/*
京东快递
@Leaf

*/
const $ = new Env('京东快递');
const got = require('got');

const envSplitor = ['&','\n','@']
const ckNames = ['JD_COOKIE']

const MAX_THREAD = parseInt(process.env['jd_jdkd_thread']) || 5
const DEFAULT_TIMEOUT=8000, DEFAULT_RETRY=3;

const default_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001f2f) NetType/WIFI Language/zh_CN miniProgram/wx73247c7819d61796'
const Referer = 'https://jingcai-h5.jd.com/'
const Origin = 'https://jingcai-h5.jd.com'

const client = got.extend({
    headers:{
        Connection:'keep-alive',
        'User-Agent': default_UA,
        Referer,
        Origin,
        AppParams: JSON.stringify({"appid":158,"ticket_type":"m"}),
        ClientInfo: JSON.stringify({"appName":"jingcai","client":"m"}),
        'LOP-DN': 'jingcai.jd.com',
        'X-Requested-With': 'XMLHttpRequest',
    },
    retry: {limit:0},
    timeout: DEFAULT_TIMEOUT,
    followRedirect: false,
})

class BasicClass{constructor(){this.index=$.userIdx++;this.name='';} log(msg,opt={}){var m='',n=$.userCount.toString().length;;if(this.index)m+=`账号[${$.padStr(this.index,n)}]`;if(this.name)m+=`[${this.name}]`;$.log(m+msg,opt);} async request(opt){var resp=null,count=0;var fn=opt.fn||opt.url;opt.method=opt?.method?.toUpperCase()||'GET';while(count++<DEFAULT_RETRY){try{await client(opt).then(t=>{resp=t},e=>{resp=e.response});if(((resp?.statusCode/100)|0)<=4)break;}catch(e){if(e.name=='TimeoutError'){this.log(`[${fn}]请求超时，重试第${count}次`);}else{this.log(`[${fn}]请求错误(${e.message})，重试第${count}次`);}};} if(resp==null)return Promise.resolve({statusCode:-1,headers:null,result:null});let{statusCode,headers,body}=resp;if(body)try{body=JSON.parse(body);}catch{};return Promise.resolve({statusCode,headers,result:body})}}
let http = new BasicClass();

class UserClass extends BasicClass {
    constructor(ck) {
        super()
        this.cookie = ck
        this.pt_pin = ck.match(/pin=([\w\-\%]+)/) ? ck.match(/pin=([\w\-\%]+)/)[1] : ''
        this.name = decodeURIComponent(this.pt_pin)
    }
    
    async queryTaskList() {
        try {
            let options = {
                fn: 'queryTaskList',
                method: 'post',
                url: 'https://lop-proxy.jd.com/ESGApi/queryTaskList',
                headers: {Cookie:this.cookie,'event-id':$.randomPattern('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx')},
                json: [{"pin":"$cooMrdGatewayUid$"}],
            }
            let {result} = await this.request(options)
            let code = result?.code
            if(code == 1) {
                for(let task of (result?.content?.taskInfoList||[]).filter(x => x.taskReachNum < x.taskNeedReachNum && x.triggerType==1)) {
                    await this.reachTaskInfo(task);
                    break;
                }
            } else {
                let errCode = code || result?.error_response?.code
                let errMsg = result?.msg || result?.error_response?.zh_desc
                this.log(`查询任务列表出错[${errCode}]: ${errMsg}`)
            }
        } catch (e) {
            $.log(e)
        } finally {
            return Promise.resolve()
        }
    }
    
    async reachTaskInfo(task) {
        try {
            let options = {
                fn: 'reachTaskInfo',
                method: 'post',
                url: 'https://lop-proxy.jd.com/ESGApi/reachTaskInfo',
                headers: {Cookie:this.cookie,'event-id':$.randomPattern('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx')},
                json: [{
                    taskNo: task.taskNo,
                    childTaskId: task.childTaskId,
                    pin: "$cooMrdGatewayUid$",
                }],
            }
            let {result} = await this.request(options)
            let code = result?.code
            if(code == 1) {
                this.log(`完成任务[${task.taskTitle}]成功`)
                await this.queryTaskList();
            } else {
                let errCode = code || result?.error_response?.code
                let errMsg = result?.msg || result?.error_response?.zh_desc
                this.log(`完成任务[${task.taskTitle}]失败[${errCode}]: ${errMsg}`)
            }
        } catch (e) {
            $.log(e)
        } finally {
            return Promise.resolve()
        }
    }
    
    async queryCanGetRewardTaskList() {
        try {
            let options = {
                fn: 'queryCanGetRewardTaskList',
                method: 'post',
                url: 'https://lop-proxy.jd.com/ESGApi/queryCanGetRewardTaskList',
                headers: {Cookie:this.cookie,'event-id':$.randomPattern('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx')},
                json: [{"pin":"$cooMrdGatewayUid$"}],
            }
            let {result} = await this.request(options)
            let code = result?.code
            if(code == 1) {
                for(let item of (result?.content?.personalCarbonRewardRespDtoList||[])) {
                    await this.operationPersonalCarbonIntegral(item)
                }
            } else {
                let errCode = code || result?.error_response?.code
                let errMsg = result?.msg || result?.error_response?.zh_desc
                this.log(`查询可领取奖励出错[${errCode}]: ${errMsg}`)
            }
        } catch (e) {
            $.log(e)
        } finally {
            return Promise.resolve()
        }
    }
    
    async operationPersonalCarbonIntegral(item) {
        try {
            let options = {
                fn: 'operationPersonalCarbonIntegral',
                method: 'post',
                url: 'https://lop-proxy.jd.com/ESGApi/operationPersonalCarbonIntegral',
                headers: {Cookie:this.cookie,'event-id':$.randomPattern('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx')},
                json: [{
                    type: 2,
                    operationType: 1,
                    rewardNo: item.rewardNo,
                    taskNo: item.taskNo,
                    pin: "$cooMrdGatewayUid$",
                }],
            }
            let {result} = await this.request(options)
            let code = result?.code
            if(code == 1) {
                this.log(`收取[${item.taskTitle}]奖励成功, 现在有${result?.content?.carbonIntegral}g能量`)
            } else {
                let errCode = code || result?.error_response?.code
                let errMsg = result?.msg || result?.error_response?.zh_desc
                this.log(`收取[${item.taskTitle}]奖励失败[${errCode}]: ${errMsg}`)
            }
        } catch (e) {
            $.log(e)
        } finally {
            return Promise.resolve()
        }
    }
    
    async userTask() {
        await this.queryTaskList();
        await this.queryCanGetRewardTaskList();
    }
}

!(async () => {
    $.read_env(UserClass);
    
    await $.threadTask('userTask',MAX_THREAD)
})()
.catch((e) => $.log(e))
.finally(() => $.exitNow())

function Env(name){return new class{constructor(name){this.name=name;this.startTime=Date.now();this.log(`[${this.name}]开始运行\n`,{time:true});this.notifyStr=[];this.notifyFlag=true;this.userIdx=0;this.userList=[];this.userCount=0;} log(msg,options={}){let opt={console:true};Object.assign(opt,options);if(opt.time){let fmt=opt.fmt||'hh:mm:ss';msg=`[${this.time(fmt)}]`+msg;} if(opt.notify)this.notifyStr.push(msg);if(opt.console)console.log(msg);} read_env(Class){let envStrList=ckNames.map(x=>process.env[x]);for(let env_str of envStrList.filter(x=>!!x)){let sp=envSplitor.filter(x=>env_str.includes(x));let splitor=sp.length>0?sp[0]:envSplitor[0];for(let ck of env_str.split(splitor).filter(x=>!!x)){this.userList.push(new Class(ck));}} this.userCount=this.userList.length;if(!this.userCount){this.log(`未找到变量，请检查变量${ckNames.map(x => '['+x+']').join('或')}`,{notify:true});return false;} this.log(`共找到${this.userCount}个账号`);return true;} async threads(taskName,conf,opt={}){while(conf.idx<$.userList.length){let user=$.userList[conf.idx++];await user[taskName](opt);}} async threadTask(taskName,thread){let taskAll=[];let taskConf={idx:0};while(thread--)taskAll.push(this.threads(taskName,taskConf));await Promise.all(taskAll);} time(t,x=null){let xt=x?new Date(x):new Date;let e={"M+":xt.getMonth()+1,"d+":xt.getDate(),"h+":xt.getHours(),"m+":xt.getMinutes(),"s+":xt.getSeconds(),"q+":Math.floor((xt.getMonth()+3)/3),S:this.padStr(xt.getMilliseconds(),3)};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(xt.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t;} async showmsg(){if(!this.notifyFlag)return;if(!this.notifyStr.length)return;var notify=require('./sendNotify');this.log('\n============== 推送 ==============');await notify.sendNotify(this.name,this.notifyStr.join('\n'));} padStr(num,length,opt={}){let padding=opt.padding||'0';let mode=opt.mode||'l';let numStr=String(num);let numPad=(length>numStr.length)?(length-numStr.length):0;let pads='';for(let i=0;i<numPad;i++){pads+=padding;} if(mode=='r'){numStr=numStr+pads;}else{numStr=pads+numStr;} return numStr;} json2str(obj,c,encode=false){let ret=[];for(let keys of Object.keys(obj).sort()){let v=obj[keys];if(v&&encode)v=encodeURIComponent(v);ret.push(keys+'='+v);} return ret.join(c);} str2json(str,decode=false){let ret={};for(let item of str.split('&')){if(!item)continue;let idx=item.indexOf('=');if(idx==-1)continue;let k=item.substr(0,idx);let v=item.substr(idx+1);if(decode)v=decodeURIComponent(v);ret[k]=v;} return ret;} randomPattern(pattern,charset='abcdef0123456789'){let str='';for(let chars of pattern){if(chars=='x'){str+=charset.charAt(Math.floor(Math.random()*charset.length));}else if(chars=='X'){str+=charset.charAt(Math.floor(Math.random()*charset.length)).toUpperCase();}else{str+=chars;}} return str;} randomString(len,charset='abcdef0123456789'){let str='';for(let i=0;i<len;i++){str+=charset.charAt(Math.floor(Math.random()*charset.length));} return str;} randomList(a){let idx=Math.floor(Math.random()*a.length);return a[idx];} wait(t){return new Promise(e=>setTimeout(e,t));} async exitNow(){await this.showmsg();let e=Date.now();let s=(e-this.startTime)/1000;this.log('');this.log(`[${this.name}]运行结束，共运行了${s}秒`,{time:true});process.exit(0);}} (name)}