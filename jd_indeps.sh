#!/usr/bin/env bash
#依赖安装，运行一次就好
#0 8 5 5 * jd_indeps.sh
#new Env('依赖安装');
#

npm_ver=`pnpm -v|awk -F. '{print $1}'`
if [[ $npm_ver -ge 7 ]];then
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
fi

echo -e "安装脚本所需依赖，不一定一次全部安装成功，请自己检查\n"
echo -e "开始安装............\n"

#apk add g++ make pixman-dev pango-dev cairo-dev pkgconf --no-cache
apk add g++ make --no-cache
pnpm config set registry https://registry.npm.taobao.org
pnpm install -g
pnpm install -g ds
pnpm install -g png-js
pnpm install -g date-fns
pnpm install -g axios@0.27.2
pnpm install -g crypto-js
pnpm install -g ts-md5
pnpm install -g tslib
pnpm install -g @types/node
pnpm install -g request
pnpm install -g jsdom
pnpm install -g moment
pnpm install -g cheerio
pnpm install -g tough-cookie
pnpm install -g https-proxy-agent
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple/ jieba
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple/ requests
rm -rf /usr/local/pnpm-global/5/node_modules/.pnpm/canvas*
rm -rf /root/.local/share/pnpm/global/5/.pnpm/canvas*
echo -e "\n所需依赖安装完成，请检查有没有报错，可尝试再次运行"