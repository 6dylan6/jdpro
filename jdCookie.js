/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。
let CookieJDs = [
  '',//账号一ck,例:pt_key=XXX;pt_pin=XXX;
  '',//账号二ck,例:pt_key=XXX;pt_pin=XXX;如有更多,依次类推
]
let IP='';
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
if (JSON.stringify(process.env).indexOf('GITHUB')>-1) {
  console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    await process.exit(0);
  })()
}
//!(async () => {
//	IP = await getIP();
//    try {
//        IP = IP.match(/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/)[0];
//        console.log(`\n当前公网IP: ${IP}`);
//    } catch (e) { }
//})()
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
console.log(`\n====================共${CookieJDs.length}个京东账号Cookie=================\n`);
console.log(`============脚本执行时间：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString('chinese',{hour12:false})}=============\n`)
console.log('>>>>>>>>>>>>>>6Dylan6 提示：任务正常运行中>>>>>>>>>>>>>>>\n')
for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n提示:京东cookie 【${CookieJDs[i]}】填写不规范,可能会影响部分脚本正常使用。正确格式为: pt_key=xxx;pt_pin=xxx;（分号;不可少）\n`);
  CookieJDs[i] = CookieJDs[i].replace(/[\u4e00-\u9fa5]/g, (str) => encodeURI(str));
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}


function getIP() {
    const https = require('https');
    return new Promise((resolve, reject) => {
        let opt = {
            hostname: "www.cip.cc",
            port: 443,
            path: "/",
            method: "GET",
            headers: {
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
            },
            timeout: 5000
        }
        const req = https.request(opt, (res) => {
             res.setEncoding('utf-8');
             let tmp = '';
             res.on('error', reject);
             res.on('data', d => tmp += d);
             res.on('end',() => resolve(tmp));
        });

        req.on('error', reject);
        req.end();
    });
}
// 以下为注入互助码环境变量（仅nodejs内起效）的代码
function SetShareCodesEnv(nameChinese = "", nameConfig = "", envName = "") {
    let rawCodeConfig = {}
    let fs = require('fs')
    // 读取互助码
    let shareCodeLogPath = fs.existsSync(`${process.env.QL_DIR}/data`) ? `${process.env.QL_DIR}/data/log/.ShareCode/${nameConfig}.log` : `${process.env.QL_DIR}/log/.ShareCode/${nameConfig}.log`;
    if (fs.existsSync(shareCodeLogPath)) {
        // 因为faker2目前没有自带ini，改用已有的dotenv来解析
        // // 利用ini模块读取原始互助码和互助组信息
        // let ini = require('ini')
        // rawCodeConfig = ini.parse(fs.readFileSync(shareCodeLogPath, 'utf-8'))

        // 使用env模块
        require('dotenv').config({path: shareCodeLogPath})
        rawCodeConfig = process.env
    }

    // 解析每个用户的互助码
    let codes = {}
    Object.keys(rawCodeConfig).forEach(function (key) {
        if (key.startsWith(`My${nameConfig}`)) {
            codes[key] = rawCodeConfig[key]
        }
    });

    // 解析每个用户要帮助的互助码组，将用户实际的互助码填充进去
    let helpOtherCodes = {}
    Object.keys(rawCodeConfig).forEach(function (key) {
        if (key.startsWith(`ForOther${nameConfig}`)) {
            let helpCode = rawCodeConfig[key]
            for (const [codeEnv, codeVal] of Object.entries(codes)) {
                helpCode = helpCode.replace("${" + codeEnv + "}", codeVal)
            }

            helpOtherCodes[key] = helpCode
        }
    });

    // 按顺序用&拼凑到一起，并放入环境变量，供目标脚本使用
    let shareCodes = []
    let leftIndex = 1, rightIndex = Object.keys(helpOtherCodes).length

    // 判断是否是ptask并行触发，若是，则修改实际需要设置的互助码范围
    let ptaskLeft = process.env.PTASK_LEFT
    let ptaskRight = process.env.PTASK_RIGHT
    if (ptaskLeft && ptaskRight) {
        leftIndex = Number(ptaskLeft)
        rightIndex = Number(ptaskRight)
    }

    for (let idx = leftIndex; idx <= rightIndex; idx++) {
        shareCodes.push(helpOtherCodes[`ForOther${nameConfig}${idx}`])
    }
    let shareCodesStr = shareCodes.join('&')
    process.env[envName] = shareCodesStr

    let totalCodeCount = rightIndex - leftIndex + 1
    //console.info(`${nameChinese}的 互助码环境变量 ${envName}，共计 ${totalCodeCount} 组互助码，总大小为 ${shareCodesStr.length} 字节`)
}

// 判断当前活动脚本是否在互助脚本列表中
function IsShareJsFile() {
    // 尝试获取在task_before.sh中设置的 互助活动的脚本文件名的关键部分 列表
    let rawJsNameList = process.env.ShareCodeJSNameList
    if (!rawJsNameList) {
        return false
    }

    // 转换为list
    let jsNameList = process.env.ShareCodeJSNameList.split(" ")

    // 判断当前
    let currentActivityScriptFileName = GetCurrentActivityScriptFileName()

    let isShareJsFile = false
    for (let idx = 0; idx < jsNameList.length; idx++) {
        if (currentActivityScriptFileName.includes(jsNameList[idx])) {
            isShareJsFile = true
            break
        }
    }

    return isShareJsFile
}

// 获取当前活动脚本的文件名
function GetCurrentActivityScriptFileName() {
    const path = require('path')
    return path.basename(process.argv[1])
}

// 若在task_before.sh 中设置了要设置互助码环境变量的活动名称和环境变量名称信息，则在nodejs中处理，供活动使用
let nameChinese = process.env.ShareCodeConfigChineseName
let nameConfig = process.env.ShareCodeConfigName
let envName = process.env.ShareCodeEnvName
if (nameChinese && nameConfig && envName) {
    SetShareCodesEnv(nameChinese, nameConfig, envName)
} 
