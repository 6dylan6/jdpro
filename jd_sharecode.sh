#!/usr/bin/env bash
#15 0 * * * jd_sharecode.sh 
#new Env('搜集互助码');
#互助码生成顺序变量HPTYPE='2'随机，HPTOPNUM='10'固定在车头数量,具体看57行注释
## update 20231028

DIR="$( cd "$( dirname $0 )" >/dev/null 2>&1 && pwd )"
## 导入通用变量与函数
#dir_shell=/ql/shell
#. $dir_shell/share.sh
## 目录
dir_root=/ql
dir_config=$dir_root/config
dir_scripts=$dir_root/scripts
dir_repo=$dir_root/repo
dir_deps=$dir_root/deps
dir_log=$dir_root/log

if [[ -z "$(echo "$DIR"|grep 'main')" ]];then
    dir_code=$dir_log/6dylan6_jdpro_jd_sharecode
    repo='6dylan6_jdpro' 
else
    dir_code=$dir_log/6dylan6_jdpro_main_jd_sharecode
    repo='6dylan6_jdpro_main' 
fi
grep '6dylan6_0212' /ql/data/config/task_before.sh >/dev/null 2>&1 || grep '6dylan6_0212' /ql/config/task_before.sh > /dev/null 2>&1
if [[ $? != 0 ]];then
 cp /ql/repo/${repo}/docker/task_before.sh /ql/config/ >/dev/null 2>&1 || cp /ql/data/repo/${repo}/docker/task_before.sh /ql/data/config/ > /dev/null 2>&1
fi
[[ $QL_DIR == /ql ]] && dir_root=$QL_DIR
[[ -d $dir_root/data ]] && dir_data=$dir_root/data
[[ -d $dir_data/config ]] && dir_config=$dir_data/config
[[ -d $dir_data/scripts ]] && dir_scripts=$dir_data/scripts
[[ -d $dir_data/repo ]] && dir_repo=$dir_data/repo
[[ -d $dir_data/deps ]] && dir_deps=$dir_data/deps
[[ -d $dir_data/log ]] && dir_log=$dir_data/log
[[ -d `echo /ql/data/log/${repo}*|awk '{print $1}'` ]]  && dir_code=`ls -dt /ql/data/log/${repo}_jd_sharecode*|awk '{print $1}'|head -1`
[[ $AUTOCFG == true ]] && cp $dir_repo/6dylan6_jdpro/sendNotify.js $dir_deps/ > /dev/null 2>&1

## 预设的仓库及默认调用仓库设置
## 将"repo=$repo1"改成repo=$repo2"或其他，以默认调用其他仓库脚本日志
## 也可自行搜索本脚本内的"name_js=("和"name_js_only",将"repo"改成"repo2"或其他，用以自由组合调用仓库的脚本日志


## 调试模式开关，默认是0，表示关闭；设置为1，表示开启
DEBUG="1"

## 本脚本限制的最大线程数量
proc_num="10"

## 备份配置文件开关，默认是1，表示开启；设置为0，表示关闭。备份路径 /ql/config/bak/
BACKUP="1"
## 是否删除指定天数以前的备份文件开关，默认是1，表示开启；设置为0，表示关闭。删除路径 /ql/config/bak/
CLEANBAK="1"
## 定义删除指定天数以前的备份文件
CLEANBAK_DAYS="2"

## 定义 jcode 脚本导出的互助码模板样式（选填）
## 不填 使用“按编号顺序互助模板”，Cookie编号在前的优先助力
## 填 0 使用“全部一致互助模板”，所有账户要助力的码全部一致
## 填 1 使用“均等机会互助模板”，所有账户获得助力次数一致
## 填 2 使用“随机顺序互助模板”，本套脚本内账号间随机顺序助力，每次生成的顺序都不一致。
## 填 3 使用“车头A模式互助模板”，本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序随机)。
## 填 4 使用“车头B模式互助模板”，本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序固定)。
HelpType=${HPTYPE:-''}

## 定义前 N 个账号优先助力，N 个以后账号间随机助力。front_num="N"，N 定义值小于账号总数，当HelpType 赋值 3 或 4 时有效
front_num=${HPTOPNUM:-'5'}

## 定义指定活动采用指定的互助模板。
## 设定值为 DiyHelpType="1" 表示启用功能；不填或填其他内容表示不开启功能。
## 如果只是想要控制某个活动以执行某种互助规则，可以参考下面 case 这个命令的例子来控制
## 活动名称参见 name_config 定义内容；具体可在本脚本中搜索 name_config=( 获悉
DiyHelpType=""
diy_help_rules(){
    case $1 in
        Fruit)
            tmp_helptype="0"            # 东东农场使用“全部一致互助模板”，所有账户要助力的码全部一致
            ;;
        DreamFactory | JdFactory)
            tmp_helptype="1"            # 京喜工厂和东东工厂使用“均等机会互助模板”，所有账户获得助力次数一致
            ;;
        Jdzz | Joy)
            tmp_helptype="2"            # 京东赚赚和疯狂的Joy使用“随机顺序互助模板”，本套脚本内账号间随机顺序助力，每次生成的顺序都不一致。
            ;;
        *)
            tmp_helptype=$HelpType      # 其他活动仍按默认互助模板生产互助规则。
            ;;
    esac
}

## 定义屏蔽模式。被屏蔽的账号将不被助力，被屏蔽的账号仍然可以助力其他账号。
## 设定值为 BreakHelpType="1" 表示启用屏蔽模式；不填或填其他内容表示不开启功能。
## 自定义屏蔽账号序号或序号区间。当 BreakHelpType="1"时生效。
## 设定值为一个或多个不相同正整数，每个正整数不大于账号总数；也可以设置正整数区间，最大正整数不大于账号总数；
## 如：a) 设定为 BreakHelpNum="3" 表示第 3 个账号不被助力；
##     b) 设定为 BreakHelpNum="5 7 8 10" 表示第 5 7 8 10 个账号均不被助力；
##     c) 设定为 BreakHelpNum="6-12" 表示从第 6 至 12 个账号均不被助力；
##     d) 设定为 BreakHelpNum="4 9-14 15~18 19_21" 表示第4个账号、第9至14账号、第15至18账号、第19至21账号均不被助力。注意序号区间连接符仅支持 - ~ _；
## 不按示例填写可能引发报错。
BreakHelpType="0"                  ## 屏蔽模式
BreakHelpNum="4 9-14 15~18 19_21"  ## 屏蔽账号序号或序号区间

## 定义是否自动更新配置文件中的互助码和互助规则
## 默认为 UpdateType="1" 表示更新互助码和互助规则；UpdateType="2" 表示只更新互助码，不更新互助规则；UpdateType="3" 表示只更新互助规则，不更新互助码；留空或其他数值表示不更新。
UpdateType="1"

## 需组合的环境变量列表，env_name需要和var_name一一对应，如何有新活动按照格式添加(不懂勿动)
env_name=(
  FRUITSHARECODES
  NEWFRUITSHARECODES  
  #PETSHARECODES
  PLANT_BEAN_SHARECODES
  #DREAM_FACTORY_SHARE_CODES
  #DDFACTORY_SHARECODES
  #JDJOY_SHARECODES
  #JDZZ_SHARECODES
  #JXNC_SHARECODES
  #BOOKSHOP_SHARECODES
  #JD_CASH_SHARECODES
  #JDSGMH_SHARECODES
  #JDCFD_SHARECODES
  JDHEALTH_SHARECODES
  #JD818_SHARECODES
  #CITY_SHARECODES
  #MONEYTREE_SHARECODES
)
var_name=(
  ForOtherFruit
  ForOtherFruit_new
  #ForOtherPet
  ForOtherBean
  #ForOtherDreamFactory
  #ForOtherJdFactory
  #ForOtherJoy
  #ForOtherJdzz
  #ForOtherJxnc
  #ForOtherBookShop
  #ForOtherCash
  #ForOtherSgmh
  #ForOtherCfd
  ForOtherHealth
  #ForOtherCarni
  #ForOtherCity
  #ForOtherMoneyTree
)

## name_js为脚本文件名，如果使用ql repo命令拉取，文件名含有作者名
## 所有有互助码的活动，把脚本名称列在 name_js 中，对应 config.sh 中互助码后缀列在 name_config 中，中文名称列在 name_chinese 中。
## name_js、name_config 和 name_chinese 中的三个名称必须一一对应。
name_js=(
  "$repo"_jd_fruit
  "$repo"_jd_fruit_new
  #"$repo"_jd_pet
  "$repo"_jd_plantBean
  #"$repo"_jd_dreamFactory
  #"$repo"_jd_jdfactory
  #"$repo"_jd_crazy_joy
  #"$repo"_jd_jdzz
  #"$repo"_jd_jxnc
  #"$repo"_jd_bookshop
  #"$repo"_jd_cash
  #"$repo"_jd_sgmh
  #"$repo"_jd_cfd
  "$repo"_jd_health
  #"$repo"_jd_carnivalcity
  #"$repo"_jd_city
  #"$repo"_jd_moneyTree_he?p
  #"$repo"_jd_cfd
)

name_config=(
  Fruit
  Fruit_new
  #Pet
  Bean
  #DreamFactory
  #JdFactory
  #Joy
  #Jdzz
  #Jxnc
  #BookShop
  #Cash
  #Sgmh
  #Cfd
  Health
  #Carni
  #City
  #MoneyTree
  #TokenJxnc
)

name_chinese=(
  东东农场-任务
  新农场任务
  #东东萌宠
  种豆得豆任务
  #京喜工厂
  #东东工厂
  #crazyJoy任务
  #京东赚赚
  #京喜农场
  #口袋书店
  #签到领现金
  #闪购盲盒
  #京喜财富岛
  东东健康社区
  #京东手机狂欢城
  #城城领现金
  #摇钱树
  #京喜token
)

# 定义 json 数据查询工具
def_envs_tool(){
    for i in $@; do
        curl -s --noproxy "*" "http://0.0.0.0:5600/api/envs?searchValue=$i" -H "Authorization: Bearer $token" | jq .data | perl -pe "{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}"
    done
}

def_json_total(){
    def_envs_tool $1 | jq -r .$2
}

def_json(){
    def_envs_tool $1 | grep "$3" | jq -r .$2
}

def_json_value(){
    cat "$1" | perl -pe "{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}" | grep "$3" | jq -r .$2
}

def_sub(){
    local i j
    for i in $(def_json_total $1 $2 | awk '/'$3'/{print NR}'); do
        j=$((i - 1));
        echo $j
    done
}

## 生成pt_pin清单
gen_pt_pin_array() {
  local envs=$(eval echo "\$JD_COOKIE")
  local array=($(echo ${envs// /} | sed 's/&/ /g'))
  local tmp1 tmp2 i pt_pin_temp pin_arr_tmp j keywords
  keywords="pt_pin="
  j=0
  for i in "${!array[@]}"; do
    if [[ "${array[i]}" =~ $keywords ]]; then
        pt_pin_temp=$(echo ${array[i]} | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|; s|%|\\\x|g}")
        [[ $pt_pin_temp == *\\x* ]] && pt_pin[j]=$(printf $pt_pin_temp) || pt_pin[j]=$pt_pin_temp
        j=$((j + 1))
    fi
  done
}

## 导出互助码的通用程序，$1：去掉后缀的脚本名称，$2：config.sh中的后缀，$3：活动中文名称
export_codes_sub() {
    local task_name=$1
    local config_name=$2
    local chinese_name=$3
    local config_name_my=My$config_name
    local config_name_for_other=ForOther$config_name
    local tmp_helptype=$HelpType
    local BreakHelpInterval=$(echo $BreakHelpNum | perl -pe "{s|~|-|; s|_|-|}" | sed 's/\(\d\+\)-\(\d\+\)/{\1..\2}/g')
    local BreakHelpNumArray=($(eval echo $BreakHelpInterval))
    local BreakHelpNumVerify=$(echo $BreakHelpNum | sed 's/ //g' | perl -pe "{s|-||; s|~||; s|_||}" | sed 's/^\d\+$//g')
    local i j k m n t pt_pin_in_log code tmp_grep tmp_my_code tmp_for_other user_num tmp_helptype HelpTemp random_num_list
    local envs=$(eval echo "\$JD_COOKIE")
    local array=($(echo ${envs// /} | sed 's/&/ /g'))
    local user_sum=${#array[*]}
    local tmp=''
	if $newflag;then
		tmp=$(ls -t ${dir_log}/|grep -E "${task_name}_[0-9]+$"|head -1)
	else
		tmp="${task_name}"
	fi
    if cd $dir_log &>/dev/null && [[ $(ls ./$tmp/*.log 2> /dev/null | wc -l) -gt 0 ]]; then
        ## 寻找所有互助码以及对应的pt_pin
        i=0
        pt_pin_in_log=()
        code=()
        pt_pin_and_code=$(ls -t ./$tmp/*.log|head -6| xargs awk -v var="的$chinese_name好友互助码" 'BEGIN{FS="[（ ）】]+"; OFS="&"} $3~var {print $2,$4}')
        for line in $pt_pin_and_code; do
            pt_pin_in_log[i]=$(echo $line | awk -F "&" '{print $1}')
            code[i]=$(echo $line | awk -F "&" '{print $2}')
            let i++
        done

        ## 输出My系列变量
        if [[ ${#code[*]} -gt 0 ]]; then
            for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                tmp_my_code=""
                j=$((m + 1))
                for ((n = 0; n < ${#code[*]}; n++)); do
                    if [[ ${pt_pin[m]} == ${pt_pin_in_log[n]} ]]; then
                        tmp_my_code=${code[n]}
                        break
                    fi
                done
                echo "$config_name_my$j='$tmp_my_code'"
            done
        else
            echo "## 从日志中未找到任何互助码"
        fi

        ## 输出ForOther系列变量
        if [[ ${#code[*]} -gt 0 ]]; then
            [[ $DiyHelpType = "1" ]] && diy_help_rules $2
            case $tmp_helptype in
            0) ## 全部一致
                HelpTemp="全部一致"
                echo -e "\n## 采用\"$HelpTemp\"互助模板："
                tmp_for_other=""
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    j=$((m + 1))
                    if [[ $BreakHelpType = "1" ]]; then
                        if [ "$BreakHelpNumVerify" = "" ]; then
                            for ((t = 0; t < ${#BreakHelpNumArray[*]}; t++)); do
                                [[ "${BreakHelpNumArray[t]}" = "$j" ]] && continue 2
                            done
                            tmp_for_other="$tmp_for_other@\${$config_name_my$j}"
                        else
                            echo -e "\n#【`date +%X`】 变量值填写不规范，请检查后重试！"
                            tmp_for_other="$tmp_for_other@\${$config_name_my$j}"
                        fi
                    else
                        tmp_for_other="$tmp_for_other@\${$config_name_my$j}"
                    fi
                done
                echo "${config_name_for_other}1=\"$tmp_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                for ((m = 1; m < ${#pt_pin[*]}; m++)); do
                    j=$((m + 1))
                    echo "$config_name_for_other$j=\"$tmp_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;

            1) ## 均等助力
                HelpTemp="均等助力"
                echo -e "\n## 采用\"$HelpTemp\"互助模板："
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    tmp_for_other=""
                    j=$((m + 1))
                    for ((n = $m; n < $(($user_sum + $m)); n++)); do
                        [[ $m -eq $n ]] && continue
                        if [[ $((n + 1)) -le $user_sum ]]; then
                            k=$((n + 1))
                        else
                            k=$((n + 1 - $user_sum))
                        fi
                        if [[ $BreakHelpType = "1" ]]; then
                            if [ "$BreakHelpNumVerify" = "" ]; then
                                for ((t = 0; t < ${#BreakHelpNumArray[*]}; t++)); do
                                    [[ "${BreakHelpNumArray[t]}" = "$k" ]] && continue 2
                                done
                                tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                            else
                                echo -e "\n#【`date +%X`】 变量值填写不规范，请检查后重试！"
                                tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                            fi
                        else
                            tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                        fi
                    done
                    echo "$config_name_for_other$j=\"$tmp_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;

            2) ## 本套脚本内账号间随机顺序助力
                HelpTemp="随机顺序"
                echo -e "\n## 采用\"$HelpTemp\"互助模板："
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    tmp_for_other=""
                    random_num_list=$(seq $user_sum | sort -R)
                    j=$((m + 1))
                    for n in $random_num_list; do
                        [[ $j -eq $n ]] && continue
                        if [[ $BreakHelpType = "1" ]]; then
                            if [ "$BreakHelpNumVerify" = "" ]; then
                                for ((t = 0; t < ${#BreakHelpNumArray[*]}; t++)); do
                                    [[ "${BreakHelpNumArray[t]}" = "$n" ]] && continue 2
                                done
                                tmp_for_other="$tmp_for_other@\${$config_name_my$n}"
                            else
                                echo -e "\n#【`date +%X`】 变量值填写不规范，请检查后重试！"
                                tmp_for_other="$tmp_for_other@\${$config_name_my$n}"
                            fi
                        else
                            tmp_for_other="$tmp_for_other@\${$config_name_my$n}"
                        fi
                    done
                    echo "$config_name_for_other$j=\"$tmp_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;

            3) ## 本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序随机)。
                HelpTemp="车头A模式"
                echo -e "\n## 采用\"$HelpTemp\"互助模板"
                [[ $user_sum -le $front_num ]] && front_num=$user_sum
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    tmp_for_other=""
                    j=$((m + 1))
                    for ((n = 0; n < $user_sum; n++)); do
                        [[ $m -eq $n ]] && continue
                        k=$((n + 1))
                        if [[ $k -le $front_num ]]; then
                            tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                        fi
                    done
                    tmp_ramdom_for_other=""
                    random_num_list=$(seq $((front_num+1)) $user_sum | sort -R)
                    for x in $random_num_list; do
                        tmp_ramdom_for_other="$tmp_ramdom_for_other@\${$config_name_my$x}"
                    done
                    echo "$config_name_for_other$j=\"$tmp_for_other$tmp_ramdom_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;

            4) ## 本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序固定)。
                HelpTemp="车头B模式"
                echo -e "\n## 采用\"$HelpTemp\"互助模板"
                [[ $user_sum -le $front_num ]] && front_num=$user_sum
                random_num_list=$(seq $((front_num+1)) $user_sum | sort -R)
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    tmp_for_other=""
                    j=$((m + 1))
                    for ((n = 0; n < $user_sum; n++)); do
                        [[ $m -eq $n ]] && continue
                        k=$((n + 1))
                        if [[ $k -le $front_num ]]; then
                            tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                        fi
                    done
                    tmp_ramdom_for_other=""
                    for x in $random_num_list; do
                        [[ $m -eq $((x-1)) ]] && continue
                        tmp_ramdom_for_other="$tmp_ramdom_for_other@\${$config_name_my$x}"
                    done
                    echo "$config_name_for_other$j=\"$tmp_for_other$tmp_ramdom_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;

            *) ## 按编号优先
                HelpTemp="按编号优先"
                echo -e "\n## 采用\"$HelpTemp\"互助模板"
                for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                    tmp_for_other=""
                    j=$((m + 1))
                    for ((n = 0; n < $user_sum; n++)); do
                        [[ $m -eq $n ]] && continue
                        k=$((n + 1))
                        if [[ $BreakHelpType = "1" ]]; then
                            if [ "$BreakHelpNumVerify" = "" ]; then
                                for ((t = 0; t < ${#BreakHelpNumArray[*]}; t++)); do
                                    [[ "${BreakHelpNumArray[t]}" = "$k" ]] && continue 2
                                done
                                tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                            else
                                echo -e "\n#【`date +%X`】 变量值填写不规范，请检查后重试！"
                                tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                            fi
                        else
                            tmp_for_other="$tmp_for_other@\${$config_name_my$k}"
                        fi
                    done
                    echo "$config_name_for_other$j=\"$tmp_for_other\"" | perl -pe "s|($config_name_for_other\d+=\")@|\1|"
                done
                ;;
            esac
        fi
    else
        echo "#【`date +%X`】 未运行过 $chinese_name 的脚本，未产生日志"
    fi
}

## 汇总输出
export_all_codes() {
    gen_pt_pin_array
    #[[ $DEBUG = "1" ]] && echo -e "\n#【`date +%X`】 当前 sharecode.sh 的进程数量：$ps_num"
    #[[ $DEBUG = "1" ]] && echo -e "\n#【`date +%X`】 预设的 JD_COOKIE 数量：`echo $JD_COOKIE | grep -o 'pt_key' | wc -l`"
    #[[ $DEBUG = "1" ]] && echo -e "\n#【`date +%X`】 预设的 JD_COOKIE 环境变量数量：`echo $JD_COOKIE | sed 's/&/\n/g' | wc -l`"
    [[ $DEBUG = "1" && "$(echo $JD_COOKIE | sed 's/&/\n/g' | wc -l)" = "1" && "$(echo $JD_COOKIE | grep -o 'pt_key' | wc -l)" -gt 1 ]] && echo -e "\n#【`date +%X`】 检测到您将多个 COOKIES 填写到单个环境变量值，请注意将各 COOKIES 采用 & 分隔，否则将无法完整输出互助码及互助规则！"
    echo -e "\n#【`date +%X`】 从日志提取互助码，编号和配置文件中Cookie编号完全对应，如果为空就是所有日志中都没有。\n\n#【`date +%X`】 即使某个MyXxx变量未赋值，也可以将其变量名填在ForOtherXxx中，jtask脚本会自动过滤空值。\n"
    if [[ $DiyHelpType = "1" ]]; then
        echo -e "#【`date +%X`】 您已启用指定活动采用指定互助模板功能！"
    else
        echo -n "#【`date +%X`】 您选择的互助码模板为："
        case $HelpType in
        0)
            echo "所有账号助力码全部一致。"
            ;;
        1)
            echo "所有账号机会均等助力。"
            ;;
        2)
            echo "本套脚本内账号间随机顺序助力。"
            ;;
        3)
            echo "本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序随机)。"
            ;;
        4)
            echo "本套脚本内指定前 N 个账号优先助力，N 个以后账号间随机助力(随机部分账号顺序固定)。"
            ;;
    	*)
            echo "按账号编号优先。"
            ;;
        esac
    fi
    [[ $BreakHelpType = "1" ]] && echo -e "\n#【`date +%X`】 您已启用屏蔽模式，账号 $BreakHelpNum 将不被助力！"
    if [ "$ps_num" -gt $proc_num ]; then
        echo -e "\n#【`date +%X`】 检测到 sharecode.sh 的线程过多 ，请稍后再试！"
        exit
    else
        [[ $repo ]] && echo -e "\n#【`date +%X`】 默认查询 $repo 的活动脚本日志，格式化导出互助码，生成互助规则！" || echo -e "\n#【`date +%X`】 遍历活动脚本日志，格式化导出互助码，生成互助规则！"
        # dump_user_info
        for ((i = 0; i < ${#name_js[*]}; i++)); do
            echo -e "\n## ${name_chinese[i]}："
            export_codes_sub "${name_js[i]}" "${name_config[i]}" "${name_chinese[i]}"
        done
    fi
}

#更新配置文件中互助码的函数
help_codes(){
local envs=$(eval echo "\$JD_COOKIE")
local array=($(echo ${envs// /} | sed 's/&/ /g'))
local user_sum=${#array[*]}
local config_name=$1
local chinese_name=$2
local config_name_my=My$config_name
local config_name_for_other=ForOther$config_name
local ShareCode_dir="$dir_log/.ShareCode"
local ShareCode_log="$ShareCode_dir/$config_name.log"
local i j k
local anum=`tail -1 $ShareCode_log |awk -F= '{print $1}'|tr -d 'a-zA-z'`
local bnum=`cat $latest_log_path|grep -E "${config_name_for_other}[0-9]+"|wc -l`
local cnum=$anum
if [[ $anum -lt $bnum ]];then
    cnum=$bnum
fi
#更新配置文件中的互助码
[[ ! -d $ShareCode_dir ]] && mkdir -p $ShareCode_dir
[[ "$1" = "TokenJxnc" ]] && config_name_my=$1    
if [ ! -f $ShareCode_log ] || [ -z "$(cat $ShareCode_log | grep "^$config_name_my\d")" ]; then
   echo -e "\n## $chinese_name\n${config_name_my}1=''\n" >> $ShareCode_log
fi
echo -e "\n#【`date +%X`】 正在更新 $chinese_name 的互助码..."
for ((i=1; i<=$cnum; i++)); do
    local new_code="$(cat $latest_log_path | grep "^$config_name_my$i=.\+'$" | sed "s/\S\+'\([^']*\)'$/\1/")"
    local old_code="$(cat $ShareCode_log | grep "^$config_name_my$i=.\+'$" | sed "s/\S\+'\([^']*\)'$/\1/")"
    if [[ $i -le $user_sum ]]; then
        if [ -z "$(grep "^$config_name_my$i" $ShareCode_log)" ]; then
            sed -i "/^$config_name_my$[$i-1]='.*'/ s/$/\n$config_name_my$i=\'\'/" $ShareCode_log
        fi
        if [ "$new_code" != "$old_code" ]; then
            if [[ "$new_code" != "undefined" ]] && [[ "$new_code" != "{}" ]]; then
                sed -i "s/^$config_name_my$i='$old_code'$/$config_name_my$i='$new_code'/" $ShareCode_log
            fi
        fi
    elif [[ $i -gt $user_sum ]] && [[ $i -gt 1 ]]; then
        sed -i "/^$config_name_my$i/d" $ShareCode_log
    elif [[ $i -eq 1 ]] && [[ -z "$new_code" ]]; then
        sed -i "s/^$config_name_my$i='\S*'$/$config_name_my$i=''/" $ShareCode_log
    fi
done
sed -i "1c ## 上次导入时间：$(date +%Y年%m月%d日\ %X)" $ShareCode_log
}

#更新配置文件中互助规则的函数
help_rules(){
local envs=$(eval echo "\$JD_COOKIE")
local array=($(echo ${envs// /} | sed 's/&/ /g'))
local user_sum=${#array[*]}
local config_name=$1
local chinese_name=$2
local config_name_my=My$config_name
local config_name_for_other=ForOther$config_name
local ShareCode_dir="$dir_log/.ShareCode"
local ShareCode_log="$ShareCode_dir/$config_name.log"
local i j k
local anum=`tail -1 $ShareCode_log |awk -F= '{print $1}'|tr -d 'a-zA-z'`
local bnum=`cat $latest_log_path|grep -E "${config_name_for_other}[0-9]+"|wc -l`
local cnum=$anum
if [[ $anum -lt $bnum ]];then
    cnum=$bnum
fi
#更新配置文件中的互助规则
echo -e "\n#【`date +%X`】 正在更新 $chinese_name 的互助规则..."
if [ -z "$(cat $ShareCode_log | grep "^$config_name_for_other\d")" ]; then
   echo -e "${config_name_for_other}1=\"\"" >> $ShareCode_log
fi
for ((j=1; j<=$cnum; j++)); do
    local new_rule="$(cat $latest_log_path | grep "^$config_name_for_other$j=.\+\"$" | sed "s/\S\+\"\([^\"]*\)\"$/\1/")"
    local old_rule="$(cat $ShareCode_log | grep "^$config_name_for_other$j=.\+\"$" | sed "s/\S\+\"\([^\"]*\)\"$/\1/")"
    if [[ $j -le $user_sum ]]; then
        if [ -z "$(grep "^$config_name_for_other$j" $ShareCode_log)" ]; then
            sed -i "/^$config_name_for_other$[$j-1]=".*"/ s/$/\n$config_name_for_other$j=\"\"/" $ShareCode_log
        fi
        if [ "$new_rule" != "$old_rule" ]; then
            sed -i "s/^$config_name_for_other$j=\"$old_rule\"$/$config_name_for_other$j=\"$new_rule\"/" $ShareCode_log
        fi
    elif [[ $j -gt $user_sum ]] && [[ $j -gt 1 ]]; then
        sed -i "/^$config_name_for_other$j/d" $ShareCode_log
    elif [[ $j -eq 1 ]] && [[ -z "$new_rule" ]]; then
        sed -i "s/^$config_name_for_other$j=\"\S*\"$/$config_name_for_other$j=\"\"/" $ShareCode_log
    fi
done
sed -i "1c ## 上次导入时间：$(date +%Y年%m月%d日\ %X)" $ShareCode_log
}

export_codes_sub_only(){
    if [ "$(cat $dir_scripts/"$repo"_jd_cfd.js | grep "// console.log(\`token")" != "" ]; then
        echo -e "\n# 正在修改 "$repo"_jd_cfd.js ，待完全运行 "$repo"_jd_cfd.js 后即可输出 token ！"
    fi
    sed -i 's/.*\(c.*log\).*\(${JSON.*token)}\).*/      \1(\`\\n【京东账号${$.index}（${$.UserName}）的京喜token好友互助码】\2\\n\`)/g' /ql/scripts/*_jd_cfd.js
    local task_name=$1
    local config_name=$2
    local chinese_name=$3
    local i j k m n pt_pin_in_log code tmp_grep tmp_my_code tmp_for_other user_num random_num_list
    local envs=$(eval echo "\$JD_COOKIE")
    local array=($(echo ${envs// /} | sed 's/&/ /g'))
    local user_sum=${#array[*]}
    if cd $dir_log &>/dev/null && [[ $(ls ./*$task_name*/*.log 2> /dev/null | wc -l) -gt 0 ]]; then
        ## 寻找所有互助码以及对应的pt_pin
        i=0
        pt_pin_in_log=()
        code=()
        pt_pin_and_code=$(ls -t ./*$task_name*/*.log | xargs awk -v var="的$chinese_name好友互助码" 'BEGIN{FS="[（ ）】]+"; OFS="&"} $3~var {print $2,$4}' | xargs awk -v var="的$chinese_name好友互助码" 'BEGIN{FS="[（ ）】]+"; OFS="&"} $3~var {print $2,$4}')
        for line in $pt_pin_and_code; do
            pt_pin_in_log[i]=$(echo $line | awk -F "&" '{print $1}')
            code[i]=$(echo $line | awk -F "&" '{print $2}')
            let i++
        done

        ## 输出互助码
        if [[ ${#code[*]} -gt 0 ]]; then
            for ((m = 0; m < ${#pt_pin[*]}; m++)); do
                tmp_my_code=""
                j=$((m + 1))
                for ((n = 0; n < ${#code[*]}; n++)); do
                    if [[ ${pt_pin[m]} == ${pt_pin_in_log[n]} ]]; then
                        tmp_my_code=${code[n]}
                        break
                    fi
                done
                echo "$config_name$j='$tmp_my_code'"
            done
        else
            echo "## 从日志中未找到任何互助码"
        fi
    else
        echo "#【`date +%X`】 未运行过 $chinese_name 的脚本，未产生日志"
    fi
}

#更新互助码和互助规则
update_help(){
case $UpdateType in
    1)
        if [ "$ps_num" -le $proc_num ] && [ -f $latest_log_path ]; then
            backup_del
            echo -e "\n#【`date +%X`】 开始更新配置文件的互助码和互助规则"
            for ((i = 0; i < ${#name_config[*]}; i++)); do
                { help_codes "${name_config[i]}" "${name_chinese[i]}"; [[ "${name_config[i]}" != "TokenJxnc" ]] && help_rules "${name_config[i]}" "${name_chinese[i]}"; } 
            done
            echo -e "\n#【`date +%X`】 配置文件的互助码和互助规则已完成更新"
        elif [ ! -f $latest_log_path ]; then
            echo -e "\n#【`date +%X`】 日志文件不存在，请检查后重试！"
        fi
        ;;
    2)
        if [ "$ps_num" -le $proc_num ] && [ -f $latest_log_path ]; then
            backup_del
            echo -e "\n#【`date +%X`】 开始更新配置文件的互助码，不更新互助规则"
            for ((i = 0; i < ${#name_config[*]}; i++)); do
                help_codes "${name_config[i]}" "${name_chinese[i]}" 
            done
            echo -e "\n#【`date +%X`】 配置文件的互助码已完成更新"
        elif [ ! -f $latest_log_path ]; then
            echo -e "\n#【`date +%X`】 日志文件不存在，请检查后重试！"
        fi
        ;;
    3)
        if [ "$ps_num" -le $proc_num ] && [ -f $latest_log_path ]; then
            backup_del
            echo -e "\n#【`date +%X`】 开始更新配置文件的互助规则，不更新互助码"
            for ((i = 0; i < ${#name_config[*]}; i++)); do
                [[ "${name_config[i]}" != "TokenJxnc" ]] && help_rules "${name_config[i]}" "${name_chinese[i]}" 
            done
            echo -e "\n#【`date +%X`】 配置文件的互助规则已完成更新"
        elif [ ! -f $latest_log_path ]; then
            echo -e "\n#【`date +%X`】 日志文件不存在，请检查后重试！"
        fi
        ;;
    *)
        echo -e "\n#【`date +%X`】 您已设置不更新配置文件的互助码和互助规则，跳过更新！"
        ;;
esac
}

check_jd_cookie(){
    local test_connect="$(curl -I -s --connect-timeout 5 --retry 3 --noproxy "*" https://bean.m.jd.com/bean/signIndex.action -w %{http_code} | tail -n1)"
    local test_jd_cookie="$(curl -s --connect-timeout 5 --retry 3 --noproxy "*" "https://bean.m.jd.com/bean/signIndex.action" -H "cookie: $1")"
    if [ "$test_connect" -eq "302" ]; then
        [[ "$test_jd_cookie" ]] && echo "(COOKIE 有效)" || echo "(COOKIE 已失效)"
    else
        echo "(API 连接失败)"
    fi
}

dump_user_info(){
echo -e "\n## 账号用户名及 COOKIES 整理如下："
local envs=$(eval echo "\$JD_COOKIE")
local array=($(echo ${envs// /} | sed 's/&/ /g'))
    for ((i = 0; i < ${#pt_pin[*]}; i++)); do
        remarks[i]="$(def_json JD_COOKIE remarks "pin=${pin[i]};" | head -1)"
        if [[ ${remarks[i]} == *@@* ]]; then
            remarks_name[i]="($(echo ${remarks[i]} | awk -F '@@' '{print $1}'))"
        elif [[ ${remarks[i]} && ${remarks[i]} != null ]]; then
            remarks_name[i]="(${remarks[i]})"
        else
            remarks_name[i]="(未备注)"
        fi
        j=$((i + 1))
        echo -e "## 用户名 $j：${pt_pin[i]} 备注：${remark_name[i]} `check_jd_cookie ${array[i]}`\nCookie$j=\"${array[i]}\""
    done
}

backup_del(){
[[ ! -d $dir_log/.bak_ShareCode ]] && mkdir -p $dir_log/.bak_ShareCode
local bak_ShareCode_full_path_list=$(find $dir_log/.bak_ShareCode/ -name "*.log")
local diff_time
if [[ $BACKUP = "1" ]]; then
    for ((i = 0; i < ${#name_config[*]}; i++)); do
        [[ -f $dir_log/.ShareCode/${name_config[i]}.log ]] && cp $dir_log/.ShareCode/${name_config[i]}.log $dir_log/.bak_ShareCode/${name_config[i]}_`date "+%Y-%m-%d-%H-%M-%S"`.log
    done
fi
if [[ $CLEANBAK = "1" ]]; then
    for log in $bak_ShareCode_full_path_list; do
        local log_date=$(echo $log | awk -F "_" '{print $NF}' | cut -c1-10)
        if [[ $(date +%s -d $log_date 2>/dev/null) ]]; then
            if [[ $is_macos -eq 1 ]]; then
                diff_time=$(($(date +%s) - $(date -j -f "%Y-%m-%d" "$log_date" +%s)))
            else
                diff_time=$(($(date +%s) - $(date +%s -d "$log_date")))
            fi
            [[ $diff_time -gt $(($CLEANBAK_DAYS * 86400)) ]] && rm -rf $log
        fi
    done
fi
}

kill_proc(){
    ps -ef|grep "$1"|grep -Ev "$2"|awk '{print $1}'|xargs kill -9
}

## 执行并写入日志
#kill_proc "code.sh" "grep|$$" >/dev/null 2>&1
#echo $dir_code
latest_log=$(ls -r $dir_code | head -1)
if [[ ${dir_code: -1} =~ [0-9] ]]; then
  newflag=true
else
  newflag=false
fi
latest_log_path="$dir_code/$latest_log"
ps_num="$(ps | grep sharecode.sh | grep -v grep | wc -l)"
export_all_codes | perl -pe "{s|京东种豆|种豆|; s|crazyJoy任务|疯狂的JOY|}"
sleep 1
update_help