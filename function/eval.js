function mainEval($) {
    return `
!(async () => {
    jdcookie = process.env.JD_COOKIE ? process.env.JD_COOKIE.split("&") : require("./function/jdcookie").cookie;
    cookies={
        'all':jdcookie,
        'help': typeof(help) != 'undefined' ? [...jdcookie].splice(0,parseInt(help)):[]
    }
    $.sleep=cookies['all'].length * 500
    taskCookie=cookies['all']
    jxAlgo = new common.jxAlgo();
    if ($.readme) {
            console.log(\`使用说明:\\n\${$.readme}\\n以上内容仅供参考,有需求自行添加\\n\`,)
    }
    console.log(\`======================本次任务共\${taskCookie.length}个京东账户Cookie======================\\n\`)
    try{
        await prepare();

        if ($.sharecode.length > 0) {
            $.sharecode = $.sharecode.filter(d=>d && JSON.stringify(d)!='{}')
            console.log('助力码', $.sharecode )
        }
    }catch(e1){console.log("初始函数不存在,将继续执行主函数Main\\n")}
    if (typeof(main) != 'undefined') {
        try{
            for (let i = 0; i < taskCookie.filter(d => d).length; i++) {
                $.cookie = taskCookie[i];
                $.user = decodeURIComponent($.cookie.match(/pt_pin=([^;]+)/)[1])
                $.index = parseInt(i) + 1;
                let info = {
                    'index': $.index,
                    'user': $.user,
                    'cookie': $.cookie
                }
                if (!$.thread) {
                    console.log(\`\n******开始【京东账号\${$.index}】\${$.user} 任务*********\n\`);
                }
                if ($.config[\`\${$.runfile}_except\`] && $.config[\`\${$.runfile}_except\`].includes(\$.user)) {
                    console.log(\`全局变量\${$.runfile}_except中配置了该账号pt_pin,跳过此次任务\`)
                }else{
                    $.setCookie($.cookie)
                    try{
                        if ($.sharecode.length > 0) {
                            for (let smp of $.sharecode) {
                                smp = Object.assign({ ...info}, smp);
                                $.thread ? main(smp) : await main(smp);
                            }
                        }else{
                            $.thread ? main(info) : await main(info);
                        }
                    }
                    catch(em){
                        console.log(em.message)
                    }
                }


            }
        }catch(em){console.log(em.message)}
        if ($.thread) {
            await $.wait($.sleep)
        }
    }
    if (typeof(extra) != 'undefined') {
        console.log(\`============================开始运行额外任务============================\`)
        try{
            await extra();
        }catch(e4){console.log(e4.message)}
    }
})().catch((e) => {
    console.log(e.message)
}).finally(() => {
    if ($.message.length > 0) {
        $.notify($.message)
    }
    $.done();
});

`
}
module.exports = {
    mainEval
}
