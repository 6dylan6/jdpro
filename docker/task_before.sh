#!/usr/bin/env bash

## Build 20220831-001-test
## 6dylan6_0126

name_js=(
  jd_farm_help
  jd_pet
  jd_plantBean
  jd_dreamFactory
  jd_jdfactory
  #jd_crazy_joy
  #jd_jdzz
  jd_jxnc
  #jd_bookshop
  #jd_cash
  jd_sgmh
  jd_cfd
  jd_health
  #jd_carnivalcity
  #jd_city
  #jd_moneyTree
  #jd_cfdtx
)
name_config=(
  Fruit
  Pet
  Bean
  DreamFactory
  JdFactory
  #Joy
  #Jdzz
  Jxnc
  #BookShop
  #Cash
  Sgmh
  Cfd
  Health
  #Carni
  #City
  #MoneyTree
  #TokenJxnc
)
name_chinese=(
  东东农场
  东东萌宠
  京东种豆得豆
  京喜工厂
  东东工厂
  #crazyJoy任务
  #京东赚赚
  京喜农场
  #口袋书店
  #签到领现金
  闪购盲盒
  京喜财富岛
  东东健康社区
  #京东手机狂欢城
  #城城领现金
  #摇钱树
  #京喜token
)
env_name=(
  FRUITSHARECODES                     ## 1、东东农场互助码
  PETSHARECODES                       ## 2、东东萌宠互助码
  PLANT_BEAN_SHARECODES               ## 3、种豆得豆互助码
  DREAM_FACTORY_SHARE_CODES           ## 4、京喜工厂互助码
  DDFACTORY_SHARECODES                ## 5、东东工厂互助码
  #JDJOY_SHARECODES                    ## 6、疯狂的JOY互助码
  #JDZZ_SHARECODES                     ## 7、京东赚赚互助码
  JXNC_SHARECODES                     ## 8、京喜农场助力码
  #BOOKSHOP_SHARECODES                 ## 9、口袋书店互助码
  #JD_CASH_SHARECODES                  ## 10、签到领现金互助码
  JDSGMH_SHARECODES                   ## 11、闪购盲盒互助码
  JDCFD_SHARECODES                    ## 12、京喜财富岛互助码
  JDHEALTH_SHARECODES                 ## 13、东东健康社区互助码
  #JD818_SHARECODES                    ## 14、京东手机狂欢城互助码
  #CITY_SHARECODES                     ## 15、城城领现金互助码
  #MONEYTREE_SHARECODES                ## 16、摇钱树
  #JXNCTOKENS                          ## 17、京喜Token(京喜财富岛提现用)
)
var_name=(
  ForOtherFruit                       ## 1、东东农场互助规则
  ForOtherPet                         ## 2、东东萌宠互助规则
  ForOtherBean                        ## 3、种豆得豆互助规则
  ForOtherDreamFactory                ## 4、京喜工厂互助规则
  ForOtherJdFactory                   ## 5、东东工厂互助规则
  #ForOtherJoy                         ## 6、疯狂的JOY互助规则
  #ForOtherJdzz                        ## 7、京东赚赚互助规则
  ForOtherJxnc                        ## 8、京喜农场助力码
  #ForOtherBookShop                    ## 9、口袋书店互助规则
  #ForOtherCash                        ## 10、签到领现金互助规则
  ForOtherSgmh                        ## 11、闪购盲盒互助规则
  ForOtherCfd                         ## 12、京喜财富岛互助规则
  ForOtherHealth                      ## 13、东东健康社区互助规则
  #ForOtherCarni                       ## 14、京东手机狂欢城互助规则
  #ForOtherCity                        ## 15、城城领现金互助规则
  ForOtherMoneyTree                   ## 16、摇钱树
  #TokenJxnc                           ## 17、京喜Token(京喜财富岛提现用)
)

local_scr=$1
relative_path="${local_scr%/*}"
repo_dir=""
sub_dir_scripts="$(ls -l $dir_scripts |awk '/^d/ {print $NF}')"
if [[ ! -z ${relative_path} ]] && [[ ${local_scr} =~ "/" ]]; then
    local_scr_name="$(echo ${local_scr##*/})"
    if [[ ${relative_path} =~ "$dir_scripts" ]]; then
        repo_dir="$(echo ${relative_path#$dir_scripts} | awk -F '/' '{print $(NF)}')"
        local_scr_dir="${relative_path}"
    elif [[ ${relative_path} =~ "/ql/" ]]; then
        local_scr_dir="$dir_scripts"
    else
        repo_dir="$(echo $local_scr | awk -F '/' '{print $(NF-1)}')"
        local_scr_dir="$dir_scripts/${repo_dir}"
    fi
else
    local_scr_name=$local_scr
    local_scr_dir="$dir_scripts"
fi

## 选择python3还是node
define_program() {
    local first_param=$1
    if [[ $first_param == *.js ]]; then
        which_program="node"
    elif [[ $first_param == *.py ]]; then
        which_program="python3"
    elif [[ $first_param == *.sh ]]; then
        which_program="bash"
    elif [[ $first_param == *.ts ]]; then
        which_program="ts-node-transpile-only"
    else
        which_program=""
    fi
}

# 定义 json 数据查询工具
def_envs_tool(){
    local i
    for i in $@; do
        local token=$(cat $file_auth_user | jq -r .token)
		if [[ ! -z ${token} ]]; then
            curl -s --noproxy "*" "http://0.0.0.0:5600/api/envs?searchValue=$i" -H "Authorization: Bearer $token" | jq .data
		fi
    done
}

def_json_total(){
    def_envs_tool $1 | jq .[].$2 | tr -d '[]," '
}

def_json_grep_match(){
    def_envs_tool $1 | jq .[] | perl -pe '{s|([^}])\n|\1|g}' | grep "$3" | jq .$2 | tr -d '[]," '
}

def_json(){
    def_envs_tool $1 | jq .[$2].$3 | perl -pe '{s|^"\|"$||g}' | grep -v "null"
}

def_json_match(){
    if [[ -f $1 ]]; then
        if [[ $3 && $(cat "$1" | grep "$3") ]]; then
            cat "$1" | perl -pe '{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}' | grep "$2" | jq -r .$3 | grep -v "null"
        else
            cat "$1" | perl -pe '{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}' | grep "$2" | grep -v "null"
        fi
    fi
}

def_json_value(){
    if [[ -f $1 ]]; then
        if [[ $(cat "$1" | grep "$2") ]]; then
            cat "$1" | perl -pe "{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}" | grep "$3" | jq -r .$2 | grep -v "null"
        fi
    fi
}

def_sub(){
    local i j
    for i in $(def_json_total $1 $2 | awk '/'$3'/{print NR}'); do
        j=$((i - 1));
        echo $j
    done
}

def_sub_value(){
    local line=$(($3 + 1))
    def_json_total $1 $2 | awk 'NR=='$line''
}

def_urldecode(){
    local i
    for i in $@; do
        echo $i | awk 'BEGIN{for(i=0;i<10;i++)hex[i]=i;hex["A"]=hex["a"]=10;hex["B"]=hex["b"]=11;hex["C"]=hex["c"]=12;hex["D"]=hex["d"]=13;hex["E"]=hex["e"]=14;hex["F"]=hex["f"]=15;}{gsub(/\+/," ");i=$0;while(match(i,/%../)){;if(RSTART>1);printf"%s",substr(i,1,RSTART-1);printf"%c",hex[substr(i,RSTART+1,1)]*16+hex[substr(i,RSTART+2,1)];i=substr(i,RSTART+RLENGTH);}print i;}'
    done
}

def_pin_sub(){
    if [[ $@ ]]; then
        local i j k
        for i in $@; do
            for j in $(def_urldecode $(def_json_total JD_COOKIE value | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}") | awk '/'$i'/{print NR}'); do
                k=$((j - 1));
                echo $k
            done
        done
    fi
}

# 字符串 def_urldecode 解密
def_urldecode(){
    for i in $@; do
        echo $i | awk 'BEGIN{for(i=0;i<10;i++)hex[i]=i;hex["A"]=hex["a"]=10;hex["B"]=hex["b"]=11;hex["C"]=hex["c"]=12;hex["D"]=hex["d"]=13;hex["E"]=hex["e"]=14;hex["F"]=hex["f"]=15;}{gsub(/\+/," ");i=$0;while(match(i,/%../)){;if(RSTART>1);printf"%s",substr(i,1,RSTART-1);printf"%c",hex[substr(i,RSTART+1,1)]*16+hex[substr(i,RSTART+2,1)];i=substr(i,RSTART+RLENGTH);}print i;}'
    done
}

# 字符串 urldecode 解密
urldecode() {
    local url_encoded="${1//+/ }"
    printf '%b' "${url_encoded//%/\\x}"
}

## 生成pt_pin清单
gen_pt_pin_array() {
    ## 生成 json 值清单
    gen_basic_value(){
        for i in $@; do
            eval $i='($(def_json_total JD_COOKIE $i | perl -pe "{s| ||g}"))'
        done
    }

    gen_basic_value value status
    # 生成JD_COOKIE下标数组
    ori_sub=(${!value[@]})
    # 生成序号数组
    sn=($(def_json_total JD_COOKIE value | awk '{print NR}'))
    # 生成pin值数组
    pin=($(def_json_total JD_COOKIE value | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
    # 生成非转码pin值数组
    pt_pin=($(urldecode "${pin[*]}"))
    #面板 JD_COOKIE 数组
    ori_array=(${value[@]})
    #面板 JD_COOKIE 总数
    ori_user_sum=${#ori_array[@]}

    #剔除已禁用 JD_COOKIE 数组元素
    for j in $(def_sub JD_COOKIE status 1); do unset ori_array[j]; done

    #本次导出的 JD_COOKIE 数组
    array=(${ori_array[@]})
    #本次导出的 JD_COOKIE 总数
    user_sum=${#array[@]}
}

## 获取用户昵称 API
Get_NickName() {
    local currentTimeStamp=$(date +%s)
    local cookie=$1
    local url_1="https://me-api.jd.com/user_new/info/GetJDUserInfoUnion"
    local url_2="https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=$currentTimeStamp"
    local UA_1="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62"
    local UA_2="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN"

    local api_1=$(
        curl -s --connect-timeout 20 --retry 3 --noproxy "*" "$url_1" \
            -H "Host: me-api.jd.com" \
            -H "Accept: */*" \
            -H "Connection: keep-alive" \
            -H "Cookie: $cookie" \
            -H "User-Agent: $UA_1" \
            -H "Accept-Language: zh-cn" \
            -H "Referer: https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&" \
            -H "Accept-Encoding:  deflate, br"
    )

    local api_2=$(
        curl -s --connect-timeout 20 --retry 3 --noproxy "*" "$url_2" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -H "Host: wxapp.m.jd.com" \
            -H "Connection: keep-alive" \
            -H "Cookie: $cookie" \
            -H "User-Agent: $UA_2" \
            -H "Referer: https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html" \
            -H "Accept-Encoding:  compress,deflate, br"
    )

    retcode=$(echo $api_1 | jq -r .retcode)
    if [[ $retcode == 0 ]]; then
        nickname=$(echo $api_1 | jq -r .data | jq -r .userInfo | jq -r .baseInfo | jq -r .nickname)
        echo -e "$nickname"
    else
        code=$(echo $api_2 | jq -r .code)
        if [[ $code != 999 ]]; then
            nickname=$(echo $api_2 | jq -r .user | jq -r .petName)
            echo -e "$nickname"
        fi
    fi
}

## 生成用户信息清单
gen_uesr_info(){
    remarks[$1]="$(def_json JD_COOKIE remarks "pin=${pin[$1]};" | head -1)"
    if [[ ${remarks[$1]} == *@@* ]]; then
        remarks_name[$1]="($(echo ${remarks[$1]} | awk -F '@@' '{print $1}'))"
    elif [[ ${remarks[$1]} && ${remarks[$1]} != null ]]; then
        remarks_name[$1]="(${remarks[$1]})"
    else
        remarks_name[$1]="(未备注)"
    fi
    tmp_NickName_1=$(Get_NickName "${value[$1]}")
    [[ -f $CK_WxPusherUid_dir/$CK_WxPusherUid_file ]] && tmp_NickName_2="$(def_json_value "$CK_WxPusherUid_dir/$CK_WxPusherUid_file" NickName "pin=${pin[$1]};")"
    if [[ $tmp_NickName_1 ]]; then
        NickName[$1]="$tmp_NickName_1"
    elif [[ $tmp_NickName_2 ]]; then
        NickName[$1]="$tmp_NickName_2"
    else
        NickName[$1]=""
    fi
    [[ ! ${NickName[$1]} || ${NickName[$1]} = null ]] && UserName[$1]=${pin[$1]} || UserName[$1]=${NickName[$1]}
    ori_full_name[$1]="【${sn[$1]}】${UserName[$1]}${remarks_name[$1]}"
    full_name[$1]="${ori_full_name[$1]}"
    [[ $status[$1] = 1 ]] && unset ori_array[$1]
}

redefine_JD_COOKIE(){
    array=(${ori_array[@]})
    user_sum=${#array[@]}
    jd_Cookie="$(echo ${array[@]} | sed 's# #\&#g')"
    [[ $jd_Cookie ]] && export JD_COOKIE="$jd_Cookie"
}

## 临时禁止账号运行活动脚本
TempBlock_CK(){
    ## 按 Cookie 序号禁止账号
    TempBlock_JD_COOKIE(){
        ## 导入基础 JD_COOKIE 变量
        local TempBlockCookie TempBlockPin TempDesiPin i j m n p q
        if [[ $3 ]]; then
            TempDesiPin="$(def_urldecode $3 | perl -pe "{s|,| |g;}")"
            i=0
            for j in $(def_pin_sub $TempDesiPin); do
                [[ ${status[j]} = 1 ]] && continue
                TempDesiCKArray[i]=${ori_array[j]}
                let i++
            done
            [[ ${TempDesiCKArray[@]} ]] && ori_array=(${TempDesiCKArray[@]})
        else
            [[ $(echo $1 | perl -pe "{s|\D||g;}") ]] && TempBlockCookie="$(eval echo $(echo $1 | perl -pe "{s|~\|-|_|g; s|\W+\|[A-Za-z]+| |g; s|(\d+)_(\d+)|{\1..\2}|g;}"))" || TempBlockCookie=""
            TempBlockPin="$(def_urldecode $2 | perl -pe "{s|,| |g;}")"
            for m in $TempBlockCookie; do
                n=$((m - 1))
                unset ori_array[n]
            done
            for k in $(def_pin_sub $TempBlockPin); do
                unset ori_array[k]
            done
        fi
        redefine_JD_COOKIE
    }

    local i j k
    local initial_user_sum=$user_sum
    if [[ -n "$(echo $tempblock_ck_envs_num|sed -n "/^[0-9]\+$/p")" ]]; then
        for ((i = 1; i <= $tempblock_ck_envs_num; i++)); do
            if [ tempblock_ck_envs$i ]; then
                local tempblock_ck_array=($(eval echo "\$tempblock_ck_envs$i" | perl -pe "{s|&| |g}"))
                for j in "${tempblock_ck_array[@]}"; do
                    local tmp_task_array=($(echo $j | perl -pe "{s|@| |g}"))
                    local tmp_script_array=($(echo ${tmp_task_array[0]} | perl -pe "{s/\|/ /g}"))
                    for k in ${tmp_script_array[@]}; do
                        if [[ $local_scr == *$k* ]]; then
                            TempBlockCookie="${tmp_task_array[1]}"
                            TempBlockPin=${tmp_task_array[2]}
                            TempDesiPin=${tmp_task_array[3]}
                            break
                        fi
                    done
                done
            fi
        done
    fi
    if [[ $TempBlockCookie ]] || [[ $TempBlockPin ]] || [[ $TempDesiPin ]]; then
        TempBlock_JD_COOKIE $TempBlockCookie $TempBlockPin $TempDesiPin
    fi

    #echo -n "# 当前总共 $ori_user_sum 个 JD_COOKIE"
    if  [[ $ori_user_sum -gt $initial_user_sum ]] && [[ $initial_user_sum -gt $user_sum ]]; then
            echo -e "已通过环境变量禁用了 $((ori_user_sum - initial_user_sum)) 个 JD_COOKIE，已临时禁止了 $((initial_user_sum - user_sum)) 个 JD_COOKIE。"
    elif [[ $ori_user_sum -eq $initial_user_sum ]] && [[ $initial_user_sum -gt $user_sum ]]; then
            echo -e "已临时禁止了 $((initial_user_sum - user_sum)) 个 JD_COOKIE。"
    elif [[ $ori_user_sum -gt $initial_user_sum ]] && [[ $initial_user_sum -eq $user_sum ]]; then
            echo -e "已通过环境变量禁用了 $((ori_user_sum - initial_user_sum)) 个 JD_COOKIE。"
    fi
    #echo -e ""
}

## 获取用户状态 API
Get_CK_Status() {
    local cookie=$1
    local url="https://me-api.jd.com/user_new/info/GetJDUserInfoUnion"

    local api=$(
        curl -s --connect-timeout 30 --retry 3 --noproxy "*" "$url" \
            -H "Cookie: $cookie" \
            -H "Referer: https://home.m.jd.com/myJd/home.action"
    )

    retcode=$(echo $api | jq -r .retcode)
    if [[ ! $retcode || $retcode = null ]]; then
        return 2
    elif [[ $retcode == 0 ]]; then
        return 0
    else
        return 1
    fi
}

# 移除失效的 Cookie
remove_void_ck(){
    if [[ $Remove_Void_CK = 1 ]]; then
        local i j void_ck_num
        local initial_user_sum=$user_sum
        local test_connect="$(curl -I -s --connect-timeout 20 --retry 3 --noproxy "*" https://bean.m.jd.com/bean/signIndex.action -w %{http_code} | tail -n1)"
        echo -e "# 开始检测 Cookie 的有效性，可能花费一定时间，请耐心等待 ..."
        echo -e "# 本次一共导入 $user_sum 个 Cookie ，其中："
        for ((i=0; i < $ori_user_sum; i ++)); do
            gen_uesr_info $i
            Get_CK_Status ${value[i]}
            [[ $? = 0 ]] && echo -e "# ${full_name[i]} 状态正常"
            [[ $? = 1 ]] && echo -e "# ${full_name[i]} 已失效" && unset ori_array[i]
            [[ $? = 2 ]] && echo -e "# ${full_name[i]} 因 API 连接失败跳过检测"
        done
        redefine_JD_COOKIE
        void_ck_num=$((initial_user_sum - user_sum))
        [[ $void_ck_num = 0 ]] && echo -e "# 未检测到失效 Cookie 。" || echo -e "# 已剔除以上 $void_ck_num 个失效的 Cookie 。"
        echo -e ""
    fi
}

## 重组 CK
Recombin_CK(){
    local i j k m n
    if [[ -n "$(echo $recombin_ck_envs_num|sed -n "/^[0-9]\+$/p")" ]]; then
        for ((i = 1; i <= $recombin_ck_envs_num; i++)); do
            if [ recombin_ck_envs$i ]; then
                local recombin_ck_array=($(eval echo "\$recombin_ck_envs$i" | perl -pe "{s|&| |g}"))
                #[[ $DEBUG_MODE = 2 ]]  &&]]&& echo ${recombin_ck_array[@]}
                for j in "${recombin_ck_array[@]}"; do
                    local tmp_task_array=($(echo $j | perl -pe "{s|@| |g}"))
                    local tmp_script_array=($(echo ${tmp_task_array[0]} | perl -pe "{s/\|/ /g}"))
                    #[[ $DEBUG_MODE = 1 ]]  && echo ${tmp_script_array[@]}
                    for k in "${tmp_script_array[@]}"; do
                        if [[ $local_scr == *$k* ]]; then
                            [[ $DEBUG_MODE = 1 ]] && echo -n "${tmp_script_array[@]}" && echo -e "\n"
                            Recombin_CK_Mode="${tmp_task_array[1]}"
                            [[ $DEBUG_MODE = 1 ]] && eval echo "Recombin_CK_Mode$m : \$Recombin_CK_Mode$m"
                            for ((m = 1; m <= 5; m++)); do
                                n=$((m + 1))
                                eval Recombin_CK_ARG$m="${tmp_task_array[n]}"
                                [[ $DEBUG_MODE = 1 ]] && eval echo "Recombin_CK_ARG$m : \$Recombin_CK_ARG$m"
                            done
                            local temp_status=1
                            [[ $Recombin_CK_Mode = 4 || $Recombin_CK_Mode = 5 ]] && Recombin_CK_cal && break 4 || Recombin_CK_cal
                        fi
                    done
                done
            fi
        done
    fi

    [[ ! $temp_status ]] && Recombin_CK_cal
}

## 重组 CK 计算
Recombin_CK_cal(){
    ## 随机模式算法
    combine_random(){
        local combined_all ran_sub tmp i
        echo "# 正在应用 随机Cookie 模式..."
        [[ -n "$(echo $1|sed -n "/^[0-9]\+$/p")" && $1 -le $user_sum ]] && ran_num=$1 || ran_num=$user_sum
        echo -e "# 当前总共 $user_sum 个有效账号，本次随机抽取 $ran_num 个账号按随机顺序参加活动。"
        ran_sub="$(seq $user_sum | sort -R | head -$ran_num)"
        for i in $ran_sub; do
            j=$((i -1))
            [[ ! ${array[j]} ]] && continue
            tmp="${array[j]}"
            combined_all="$combined_all&$tmp"
        done
        jdCookie_4=$(echo $combined_all | sed 's/^&//g')
        [[ $jdCookie_4 ]] && export JD_COOKIE="$jdCookie_4"
        #[[ $DEBUG_MODE = 1 ]] && echo $jdCookie_4
    }

    ## 优先模式算法
    combine_priority(){
        local combined_all ran_sub jdCookie_priority jdCookie_random m n
        if [ $1 ]; then
            # 固定区账号数量
            [[ -n "$(echo $1|sed -n "/^[0-9]\+$/p")" ]] && fixed_num=$1 || fixed_num="0"
            if [[ $fixed_num -ge $user_sum ]]; then
                echo "# 优先固定账号数量不得大于或等于有效账号总量，本次暂不重组 Cookie ..."
                export JD_COOKIE="$JD_COOKIE"
            elif [[ $fixed_num -eq 0 ]]; then
                echo "# 未设定优先固定数量，本次暂不重组 Cookie ..."
                export JD_COOKIE="$JD_COOKIE"
            else
                echo "# 正在应用 优先Cookie 模式..."
                echo -e "# 当前总共 $user_sum 个有效账号，其中前 $fixed_num 个账号为固定顺序。\n# 本次从第 $((fixed_num + 1)) 个账号开始按随机顺序参加活动。"
                ran_sub=$(seq $fixed_num $((ori_user_sum-1)) | sort -R)
                for ((m = 0; m < $fixed_num; m++)); do
                    [[ ! ${ori_array[m]} ]] && continue
                    tmp="${ori_array[m]}"
                    jdCookie_priority="$jdCookie_priority&$tmp"
                done
                for n in $ran_sub; do
                    [[ ! ${ori_array[n]} ]] && continue
                    tmp="${ori_array[n]}"
                    jdCookie_random="$jdCookie_random&$tmp"
                done
                combined_all="$jdCookie_priority$jdCookie_random"
                jdCookie_4=$(echo $combined_all | perl -pe "{s|^&||}")
                [[ $jdCookie_4 ]] && export JD_COOKIE="$jdCookie_4"
                #[[ $DEBUG_MODE = 1 ]] && echo $jdCookie_4
            fi
        else
            echo "# 由于参数缺失，本次暂不重组 Cookie ..."
            export JD_COOKIE="$JD_COOKIE"
        fi
    }

    ## 轮换模式算法
    combine_rotation(){
        # 当月总天数
        local total_days=$(cal | grep ^[0-9] | tail -1 | awk -F " " '{print $NF}')
        # 今天几号
        local today_day=$(date +%-d)
        local combined_all rot_num rot_start_num jdCookie_priority jdCookie_rot_head jdCookie_rot_mid tmp_1 tmp_2 tmp_3 a b c
        # 固定区账号数量
        [[ -n "$(echo $1|sed -n "/^[0-9]\+$/p")" ]] && fixed_num=$1 || fixed_num="0"
        if [[ $fixed_num -ge $ori_user_sum ]]; then
            echo "# 优先固定账号数量不得大于或等于有效账号总量，本次暂不重组 Cookie ..."
            export JD_COOKIE="$JD_COOKIE"
        elif [[ $today_day -gt 1 ]]; then
            echo "# 正在应用 轮换Cookie 模式..."
            # 轮换区的账号数量
            local rot_total_num=$((ori_user_sum - fixed_num))
            if [[ $rot_total_num -gt 2 ]]; then
                combine_bottom
                # 每日轮换的账号数量
                rot_num=$2
                [[ -z "$(echo $rot_num|sed -n "/^[0-9]\+$/p")" || ! $rot_num || $rot_num -lt 1 || $rot_total_num -lt $rot_num ]] && rot_num=$(((rot_total_num + total_days -1)/total_days)) && [[ $rot_num -lt 1 ]] && rot_num="1"
                rot_start_num=$((fixed_num + rot_num * ((today_day - 1))))
                while [[ $ori_user_sum -lt $((rot_start_num + 1)) ]]; do rot_start_num=$((rot_start_num - rot_total_num)); done
                echo -n "# 当前总共 $user_sum 个有效账号"
                [[ $fixed_num -gt 0 ]] && echo -n "，其中前 $fixed_num 个账号为固定顺序" || echo -n "，所有账号参与轮换"
                [[ $user_bottom_sum -gt 0 ]] && echo -e "，有 $user_bottom_sum 个账号固定在末尾。" || echo -e "。"
                echo -e "# 今天从第 $((rot_start_num + 1)) 位账号开始轮换，轮换频次为：$rot_num 个账号/天。"
                for ((a = 0; a < fixed_num; a++)); do
                    [[ ! ${ori_array[a]} ]] && continue
                    tmp_1="${ori_array[a]}"
                    jdCookie_priority="$jdCookie_priority&$tmp_1"
                done
                for ((b = $rot_start_num; b < $ori_user_sum; b++)); do
                    [[ ! ${ori_array[b]} ]] && continue
                    tmp_2="${ori_array[b]}"
                    jdCookie_rot_head="$jdCookie_rot_head&$tmp_2"
                done
                for ((c = $fixed_num; c < $((rot_start_num)); c++)); do
                    [[ ! ${ori_array[c]} ]] && continue
                    tmp_3="${ori_array[c]}"
                    jdCookie_rot_mid="$jdCookie_rot_mid&$tmp_3"
                done
                combined_all="$jdCookie_priority$jdCookie_rot_head$jdCookie_rot_mid$jdCookie_bottom"
                jdCookie_4=$(echo $combined_all | perl -pe "{s|^&||; s|&$||}")
                [[ $jdCookie_4 ]] && export JD_COOKIE="$jdCookie_4"
                #[[ $DEBUG_MODE = 1 ]] && echo $jdCookie_4 | sed 's/&/\n/g' > /ql/config/2.txt
            else
                echo "# 由于参加轮换的账号数量不足 2 个，本次暂不重组 Cookie ..."
                export JD_COOKIE="$JD_COOKIE"
            fi
        elif [[ $today_day -eq 1 ]]; then
            echo "# 今天是 1 号，不应用轮换模式，全部 Cookie 按正常顺序参加活动..."
            export JD_COOKIE="$JD_COOKIE"
        fi
    }

    ## 组队模式算法
    combine_team(){
        team_ck(){
            local tmp combined_tmp combined_all i j k m n
            for ((i = 0; i < $team_num_total; i++)); do
                #当前队伍是第几组
                j=$((i + 1))
                #发起组队的账号在Cookie数组中的序号
                k=$((i/team_num))
                tmp=""
                combined_tmp=""
                combined_all=""
                if [ $i -ne $team_num ]; then
                    for ((m = 1; m < $teamer_num; m++)); do
                        #当前组队的第二账号所在Cookie数组的序号
                        n=$(((teamer_num -1)*i + m)) && [[ $n -ge $ori_user_sum ]] && continue
                        tmp="${array[n]}"
                        combined_tmp="$combined_tmp&$tmp"
                    done
                    combined_all="${array[k]}$combined_tmp"
                elif [ $i -eq $team_num ]; then
                    for ((m = 1; m < $((teamer_num - 1)); m++)); do
                        #第二账号发起的第一支组队，该队伍中的第三账号所在Cookie数组的序号
                        n=$(((teamer_num -1)*i + m)) && [[ $n -ge $ori_user_sum ]] && continue
                        tmp="${array[n]}"
                        combined_tmp="$combined_tmp&$tmp"
                    done
                    combined_all="${array[k]}&${array[0]}$combined_tmp"
                fi
                jdCookie_4=$combined_all
                if [[ $jdCookie_4 ]]; then
                    export JD_COOKIE="$jdCookie_4"
                    #[[ $DEBUG_MODE = 1 ]] && echo $jdCookie_4
                    echo -e "\n# 本次提交的是第 $j 组账号。"
                    define_program "$local_scr"
                    if [ $temp_status = 3 ]; then
                        $which_program $local_scr_dir/$local_scr_name
                        [[ $interval_time != "0" ]] && echo -e "# 等待 $interval_time 秒后开始进行下一组队任务 ..."
                        sleep $interval_time
                    else
                        $which_program $local_scr_dir/$local_scr_name &
                        sleep $delay_time
                    fi
                fi
            done
            exit
        }

    run_js_in_team(){
        if [[ $teamer_num -ge $user_sum ]]; then
            echo "# 每组队伍的成员数量不得大于或等于有效账号总数量，本次暂不重组 Cookie ..."
            export JD_COOKIE="$JD_COOKIE"
        elif [[ $((teamer_num * team_num)) -ge $user_sum ]]; then
            echo "# 参与组队的总成员数量不得大于或等于有效账号总数量，本次暂不重组 Cookie ..."
            export JD_COOKIE="$JD_COOKIE"
        else
            echo "# 正在应用 组队Cookie 模式..."
            #总组队数量
            team_num_total=$(((user_sum + teamer_num - 2)/(teamer_num - 1)))
            #前几个账号发起组队
            team_num_launch=$(((team_num_total + team_num - 1)/team_num))
            [[ $team_num -ge $team_num_total ]] && team_num=$team_num_total && [[ $team_num -lt 1 ]] && team_num=1
            echo -n "# 当前总共 $user_sum 个有效账号，其中前 $team_num_launch 个账号发起组队，每个账号最多可以发起 $team_num 次组队，一共组 $team_num_total 队，每支队伍最多包含 $teamer_num 个账号。"
            if [[ -n "$(echo $1|perl -pe "{s|\.\|s\|m\|h\|d||g}"|sed -n "/^[0-9]\+$/p")" ]]; then
                temp_status="1"
                delay_time="$(echo $1|perl -pe "{s|([a-z])(\d)+|\1 \2|g;}")"
                echo -e "各支队伍启动脚本的延隔时间为`format_time $1`。"
            elif [[ $1 = 0 ]]; then
                temp_status="2"
                delay_time="0"
                echo -e "所有队伍并发启动脚本，可能会占用较高的系统资源导致卡顿。"
            elif [[ $1 = "-" ]] && [[ -n "$(echo $2|perl -pe "{s|\.\|s\|m\|h\|d||g}"|sed -n "/^[0-9]\+$/p")" ]] ; then
                temp_status="3"
                interval_time="$(echo $2|perl -pe "{s|([a-z])(\d)|\1 \2|g;}")"
                echo -e "各支队伍启动脚本的间隔时间为`format_time $2`。"
            else
                temp_status="3"
                delay_time="0"
                interval_time="0"
                echo -e ""
            fi
            team_ck
        fi
    }
        local p q
        if [[ $1 ]] && [[ $2 ]]; then
            if [[ $1 = "-" ]] && [[ $2 = "-" ]] && [[ -n "$(echo $5|sed -n "/^[0-9]\+$/p")" ]]; then
                if [[ $5 = 0 ]]; then
                    for p in ${activity_env[@]}; do
                        activity_array=($(echo $p | perl -pe "{s|@| |g}"))
                        teamer_num=${activity_array[0]}
                        team_num=${activity_array[1]}
                        export jd_zdjr_activityId=${activity_array[2]}
                        export jd_zdjr_activityUrl=${activity_array[3]}
                        echo -e "活动 ID (activityId) : $jd_zdjr_activityId"
                        echo -e "活动链接(activityUrl): $jd_zdjr_activityUrl"
                        run_js_in_team $3 $4
                    done
                elif [[ $5 -gt 0 ]]; then
                    q=$(($5 - 1))
                    activity_array=($(echo ${activity_env[q]} | perl -pe "{s|@| |g}"))
                    teamer_num=${activity_array[0]}
                    team_num=${activity_array[1]}
                    export jd_zdjr_activityId=${activity_array[2]}
                    export jd_zdjr_activityUrl=${activity_array[3]}
                    echo -e "活动 ID (activityId) : $jd_zdjr_activityId"
                    echo -e "活动链接(activityUrl): $jd_zdjr_activityUrl"
                    run_js_in_team $3 $4
                fi
            elif [[ -n "$(echo $1|sed -n "/^[0-9]\+$/p")" ]] && [[ -n "$(echo $2|sed -n "/^[0-9]\+$/p")" ]]; then
                # 每组队伍的成员数量
                teamer_num=$1
                # 单个账号最多发起的组队数量
                team_num=$2
            else
                # 每组队伍的成员数量
                teamer_num=$user_sum
                # 单个账号最多发起的组队数量
                team_num=1
            fi
            run_js_in_team $3 $4
        else
            echo "# 由于参数缺失，切换回 正常 Cookie 模式..."
            export JD_COOKIE="$JD_COOKIE"
        fi
    }

    ## 分段模式算法
    combine_segmentation(){
        local delay_time="$3"
        local interval_time="$4"
        local jdCookie_priority jdCookie_team_part i j k m n
        if [[ $1 ]] && [[ $2 ]]; then
            # 固定区账号数量
            [[ -n "$(echo $1|sed -n "/^[0-9]\+$/p")" ]] && fixed_num=$1 || fixed_num="0"
            # 每段账号总数量
            [[ -n "$(echo $2|sed -n "/^[0-9]\+$/p")" ]] && teamer_total_num=$2 || teamer_total_num=$ori_user_sum
            if [[ $fixed_num -ge $teamer_total_num ]]; then
                echo "# 固定账号数量不得大于或等于每段账号总数量，本次暂不重组 Cookie ..."
                export JD_COOKIE="$JD_COOKIE"
            elif [[ $teamer_total_num -ge $ori_user_sum ]]; then
                echo "# 分段账号数量不得大于或等于有效账号总数量，本次暂不重组 Cookie ..."
                export JD_COOKIE="$JD_COOKIE"
            elif [[ $fixed_num -lt $teamer_total_num ]]; then
                echo "# 正在应用 分段Cookie 模式..."
                local teamer_num="$((teamer_total_num - fixed_num))"
                local team_total_num=$(((ori_user_sum - fixed_num + teamer_num -1)/teamer_num)) && [[ $team_total_num -lt 1 ]] && team_total_num=1
                echo -n "# 当前总共 $user_sum 个有效账号"
                [[ $fixed_num -ne 0 ]] && echo -n "，其中前 $fixed_num 个账号为固定顺序"
                echo -n "。每 $teamer_total_num 个账号分一段，一共分 $team_total_num 段。"
                if [[ -n "$(echo $3|perl -pe "{s|\.\|s\|m\|h\|d||g}"|sed -n "/^[0-9]\+$/p")" ]]; then
                    temp_status="1"
                    delay_time="$(echo $3|perl -pe "{s|([a-z])(\d)+|\1 \2|g;}")"
                    echo -e "各分段启动脚本的延隔时间为`format_time $3`。"
                    echo -e "# 注意：如果每段的运行时间较长且延隔时间设定较短，运行日志可能会显示混乱，此为正常现象。"
                elif [[ $3 = 0 ]]; then
                    temp_status="2"
                    delay_time="0"
                    echo -e "所有分段并发启动脚本，可能会占用较高的系统资源导致卡顿。"
                    echo -e "# 注意：运行日志会显示混乱，此为正常现象。"
                elif [[ $3 = "-" ]] && [[ -n "$(echo $4|perl -pe "{s|\.\|s\|m\|h\|d||g}"|sed -n "/^[0-9]\+$/p")" ]] ; then
                    temp_status="3"
                    interval_time="$(echo $4|perl -pe "{s|([a-z])(\d)|\1 \2|g;}")"
                    echo -e ""
                else
                    temp_status="3"
                    delay_time="0"
                    interval_time="0"
                    echo -e ""
                fi
                for ((m = 0; m < $fixed_num; m++)); do
                    [[ ! ${ori_array[m]} ]] && continue
                    tmp="${ori_array[m]}"
                    jdCookie_priority="$jdCookie_priority&$tmp"
                done
                for ((i = 0; i < $team_total_num; i++)); do
                    j=$((i + 1))
                    m=$((teamer_num * i + fixed_num))
                    n=$((teamer_num * j + fixed_num))
                    [[ $n -gt $ori_user_sum ]] && n=$ori_user_sum
                    t=$n && [[ $user_sum -lt $t ]] && t=$user_sum
                    jdCookie_team_part=""
                    for ((k = m; k < $t; k++)); do
                        [[ ! ${ori_array[k]} ]] && continue
                        tmp="${ori_array[k]}"
                        jdCookie_team_part="$jdCookie_team_part&$tmp"
                    done
                    jdCookie_4=$(echo $jdCookie_priority$jdCookie_team_part | perl -pe "{s|^&+\|&+$||g}")
                    if [[ $jdCookie_4 ]]; then
                        export JD_COOKIE="$jdCookie_4"
                        #[[ $DEBUG_MODE = 1 ]] && echo $jdCookie_4
                        if [ $fixed_num -ne 0  ]; then
                            if [ $teamer_num -gt 1  ]; then
                                echo -e "\n# 本次提交的是前 $fixed_num 位账号及第 $((m + 1)) - $n 位账号。"
                            elif [ $teamer_num -eq 1  ]; then
                                echo -e "\n# 本次提交的是前 $fixed_num 位账号及第 $((m + 1)) 位账号。"
                            fi
                        elif [ $fixed_num -eq 0  ]; then
                            if [ $teamer_num -gt 1  ]; then
                                echo -e "\n# 本次提交的是第 $((m + 1)) - $n 位账号。"
                            elif [ $teamer_num -eq 1  ]; then
                                echo -e "\n# 本次提交的是第 $((m + 1)) 位账号。"
                            fi
                        fi
                        define_program "$local_scr"
                        if [ $temp_status = 3 ]; then
                            $which_program $local_scr_dir/$local_scr_name
                            [[ $interval_time != "0" ]] && echo -e "# 等待`format_time $interval_time`后开始进行下一段任务 ..."
                             sleep $interval_time
                        else
                            $which_program $local_scr_dir/$local_scr_name &
                            sleep $delay_time
                        fi
                    fi
                done
                exit
            fi
        else
            echo "# 由于参数缺失，本次暂不重组 Cookie ..."
            export JD_COOKIE="$JD_COOKIE"
        fi
    }

    ## 末尾Cookie
    combine_bottom(){
        local array_bottom i
        if [[ $Bottom_CK && ! $jdCookie_bottom ]]; then
            bottom_ck="$(def_urldecode $Bottom_CK | perl -pe "{s|,| |g;}")"
            i=0
            for j in $(def_pin_sub $bottom_ck); do
                [[ ! ${ori_array[j]} ]] && continue
                array_bottom[i]=${ori_array[j]}
                unset ori_array[j]
                let i++
            done
            jdCookie_bottom="&$(echo ${array_bottom[@]} | sed 's# #\&#g')"
            user_bottom_sum=${#array_bottom[*]}
        fi
    }

    # 格式化时间
    format_time(){
        for i in $@; do
            if [[ -n "$(echo $i|perl -pe "{s|\.||g}"|sed -n "/^[0-9]\+$/p")" ]]; then
                time_text=" $i 秒"
            elif [[ -n "$(echo $i|perl -pe "{s|\.\|s\|m\|h\|d||g}"|sed -n "/^[0-9]\+$/p")" ]]; then
                time_text="$(echo $i|perl -pe "{s|([a-z])(\d)+|\1 \2|g; s|s| 秒|g; s|m| 分|g; s|h| 小时|g; s|d| 天|g; s|^| |g; s|(\d+)$|\1 秒|g;}")"
            fi
            echo -n "$time_text"
        done
    }

    # Cookie 环境变量迭代导入
    [[ $jdCookie_4 ]] && array=($(echo $jdCookie_4 | sed 's/&/ /g')) && user_sum=${#array[*]}

    case $Recombin_CK_Mode in
        1)
            combine_random $Recombin_CK_ARG1
            ;;
        2)
            combine_priority $Recombin_CK_ARG1
            ;;
        3)
            combine_rotation $Recombin_CK_ARG1 $Recombin_CK_ARG2
            ;;
        4)
            combine_team $Recombin_CK_ARG1 $Recombin_CK_ARG2 $Recombin_CK_ARG3 $Recombin_CK_ARG4 $Recombin_CK_ARG5
            ;;
        5)
            combine_segmentation $Recombin_CK_ARG1 $Recombin_CK_ARG2 $Recombin_CK_ARG3 $Recombin_CK_ARG4
            ;;
        *)
            export JD_COOKIE="$JD_COOKIE"
            ;;
    esac
}

## 组合互助码格式化为全局变量的函数
combine_sub() {
    #source $file_env
    local what_combine=$1
    local combined_all=""
    local tmp1 tmp2
    local TempBlockCookieInterval="$(echo $TempBlockCookie | perl -pe "{s|~|-|; s|_|-|}" | sed 's/\(\d\+\)-\(\d\+\)/{\1..\2}/g')"
    local TempBlockCookieArray=($(eval echo $TempBlockCookieInterval))
    local envs=$(eval echo "\$JD_COOKIE")
    local array=($(echo $envs | sed 's/&/ /g'))
    local user_sum=${#array[*]}
    local a b i j t sum combined_all
    for ((i=1; i <= $user_sum; i++)); do
        local tmp1=$what_combine$i
        local tmp2=${!tmp1}
        [[ ${tmp2} ]] && sum=$i || break
    done
    [[ ! $sum ]] && sum=$user_sum
    for ((j = 1; j <= $sum; j++)); do
        a=$temp_user_sum
        b=$sum
        if [[ $a -ne $b ]]; then
            for ((t = 0; t < ${#TempBlockCookieArray[*]}; t++)); do
                [[ "${TempBlockCookieArray[t]}" = "$j" ]] && continue 2
            done
        fi
        local tmp1=$what_combine$j
        local tmp2=${!tmp1}
        combined_all="$combined_all&$tmp2"
    done
    echo $combined_all | perl -pe "{s|^&||; s|^@+||; s|&@|&|g; s|@+&|&|g; s|@+|@|g; s|@+$||}"
}

## 正常依次运行时，组合互助码格式化为全局变量
combine_all() {
    for ((i = 0; i < ${#env_name[*]}; i++)); do
        result=$(combine_sub ${var_name[i]})
        if [[ $result ]]; then
            export ${env_name[i]}="$result"
        fi
    done
}

## 正常依次运行时，组合互助码格式化为全局变量
combine_only() {
    for ((i = 0; i < ${#env_name[*]}; i++)); do
        case $local_scr in
            *${name_js[i]}*.js | *${name_js[i]}*.ts)
                if [[ -f $dir_log/.ShareCode/${name_config[i]}.log ]]; then
                    . $dir_log/.ShareCode/${name_config[i]}.log
                    result=$(combine_sub ${var_name[i]})
                    if [[ $result ]]; then
                        export ShareCodeConfigChineseName=${name_chinese[i]}
                        export ShareCodeConfigName=${name_config[i]}
                        export ShareCodeEnvName=${env_name[i]}
                    fi
                fi
                ;;
           *)
                export ${env_name[i]}=""
                ;;
        esac
    done
}

## 提前替换js基础依赖
JS_Deps_Replace() {
    if [ $js_deps_replace_envs ]; then
        local js_deps_replace_array=($(echo $js_deps_replace_envs | perl -pe "{s|&| |g}"))
        for i in "${js_deps_replace_array[@]}"; do
            local tmp_task_array=($(echo $i | perl -pe "{s|@| |g}"))
            local tmp_script_array=($(echo ${tmp_task_array[0]} | perl -pe "{s/\|/ /g}"))
            local tmp_skip_repo=($(echo ${tmp_task_array[1]} | perl -pe "{s/\|/ /g}"))
            for j in "${tmp_script_array[@]}"; do
                [[ ! $repo_dir ]] || [[ $repo_dir && ! ${tmp_skip_repo[@]} =~ $repo_dir ]] && [[ -f $dir_config/$j.js && $local_scr_dir ]] && cp -rf $dir_config/$j.js $local_scr_dir/$j.js
            done
        done
    fi
}

[[ -f $dir_scripts/CK_WxPusherUid.json && $local_scr_dir && $local_scr_dir != $dir_scripts ]] && cp -rf $dir_scripts/CK_WxPusherUid.json $local_scr_dir/CK_WxPusherUid.json 
#source $file_env
gen_pt_pin_array
#JS_Deps_Replace
TempBlock_CK
#remove_void_ck
if [[ -z $cookieStr ]];then
Recombin_CK
fi
combine_only
