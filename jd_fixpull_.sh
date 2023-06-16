#!/usr/bin/env bash
#15 3 * * 3 jd_fixpull_.sh 
#new Env('拉库失败修复');
## Build 20230429
echo -e '\n开始修复。。。\n'
DIR="$( cd "$( dirname $0 )" >/dev/null 2>&1 && pwd )"
#echo $DIR
function fix(){
        if [[ -z "$(echo "$DIR"|grep 'main')" ]];then
            if [[ -d /ql/repo/6dylan6_jdpro ]];then
        	    rm -rf /ql/repo/6dylan6_jdpro
				#ql repo https://ghproxy.com/https://github.com/6dylan6/jdpro.git "jd_|jx_|jddj_" "backUp" "^jd[^_]|USER|JD|function|sendNotify"
            elif [[ -d /ql/data/repo/6dylan6_jdpro ]];then
        	    rm -rf /ql/data/repo/6dylan6_jdpro
				#ql repo https://ghproxy.com/https://github.com/6dylan6/jdpro.git "jd_|jx_|jddj_" "backUp" "^jd[^_]|USER|JD|function|sendNotify"
            else
                echo -e '无需修复，拉不动可能是代理问题' 
                #find /ql -maxdepth 2 -type d
                return 1
            fi
        else
            if [[ -d /ql/repo/6dylan6_jdpro_main ]];then
        	    rm -rf /ql/repo/6dylan6_jdpro_main
				#ql repo https://ghproxy.com/https://github.com/6dylan6/jdpro.git "jd_|jx_|jddj_" "backUp" "^jd[^_]|USER|JD|function|sendNotify" "main"
            elif [[ -d /ql/data/repo/6dylan6_jdpro_main ]];then
        	    rm -rf /ql/data/repo/6dylan6_jdpro_main
				#ql repo https://ghproxy.com/https://github.com/6dylan6/jdpro.git "jd_|jx_|jddj_" "backUp" "^jd[^_]|USER|JD|function|sendNotify" "main"
            else
                echo -e '无需修复，拉不动可能是代理问题\n'
                #find /ql -maxdepth 2 -type d
                return 1
            fi
        fi
}

fix

[[ $(echo $?) -eq 0 ]]  && echo -e '修复完成，再拉库试试！，如果还不行是网络或代理问题！！！'
	