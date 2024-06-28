# !/usr/bin/env python3
# -*- coding: utf-8 -*-
# Modify : 2024/4/21
# 京豆近7天输出表格统计
# 用不着每天跑,定时自行设置吧，配合desi可指定账号
# https://raw.githubusercontent.com/6dylan6/jdpro/main/jd_beans_7days.py
'''
new Env('豆子7天统计');
8 8 29 2 * jd_beans_7days.py
'''

import requests
import datetime
import random
import os,re,sys,json,time
from urllib.parse import unquote,quote
from datetime import timedelta
from datetime import timezone

try:
    from prettytable import PrettyTable 
except:
    os.system('pip3 install prettytable &> /dev/null')
    from prettytable import PrettyTable 

SHA_TZ = timezone(
    timedelta(hours=8),
    name='Asia/Shanghai',
)
requests.adapters.DEFAULT_RETRIES = 5
session = requests.session()
session.keep_alive = False

url = "https://api.m.jd.com/api"
def getua():
    global uuid,addressid,iosVer,iosV,clientVersion,iPhone,area,ADID,lng,lat
    uuid=''.join(random.sample(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','a','b','c','z'], 40))
    addressid = ''.join(random.sample('1234567898647', 10))
    iosVer = ''.join(random.sample(["15.1.1","14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"], 1))
    iosV = iosVer.replace('.', '_')
    clientVersion=''.join(random.sample(["10.3.0", "10.2.7", "10.2.4"], 1))
    iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
    area=''.join(random.sample('0123456789', 2)) + '_' + ''.join(random.sample('0123456789', 4)) + '_' + ''.join(random.sample('0123456789', 5)) + '_' + ''.join(random.sample('0123456789', 4))
    ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))
    lng='119.31991256596'+str(random.randint(100,999))
    lat='26.1187118976'+str(random.randint(100,999))
    UserAgent=''
    if not UserAgent:
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};model/iPhone{iPhone},1;addressid/{addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1'
    else:
        return UserAgent
def gen_body(page):
    body = {
        "beginDate": datetime.datetime.utcnow().replace(tzinfo=timezone.utc).astimezone(SHA_TZ).strftime("%Y-%m-%d %H:%M:%S"),
        "endDate": datetime.datetime.utcnow().replace(tzinfo=timezone.utc).astimezone(SHA_TZ).strftime("%Y-%m-%d %H:%M:%S"),
        "pageNo": page,
        "pageSize": 20,
    }
    return body

def printf(text):
    print(text)
    sys.stdout.flush()

def column_pad(*columns):
  max_len = max([len(x) for x in columns])
  for y in columns:
      y.extend(['NaN']*(max_len-len(y)))

class getJDCookie(object):

    # 获取cookie
    def getCookie(self):
        global cookies
        cookies = []
        try:
            if "JD_COOKIE" in os.environ:
                if len(os.environ["JD_COOKIE"]) > 10:
                    cookies = os.environ["JD_COOKIE"]
                    printf("\n当前从环境变量获取CK\n")
                    return
        except Exception as e:
            printf(f"【getCookie Error】{e}")

        # 检测cookie格式是否正确

    def getUserInfo(self, ck, pinName, userNum):
        url = 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&sceneval=2&callback='
        headers = {
            'Cookie': ck,
            'Accept': '*/*',
            'Connection': 'close',
            'Referer': 'https://home.m.jd.com/myJd/home.action',
            'Accept-Encoding': 'gzip, deflate, br',
            'Host': 'me-api.jd.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
            'Accept-Language': 'zh-cn'
        }
        try:
            if sys.platform == 'ios':
                resp = requests.get(url=url, verify=False, headers=headers, timeout=60).json()
            else:
                resp = requests.get(url=url, headers=headers, timeout=60).json()
            if resp['retcode'] == "0":
                nickname = resp['data']['userInfo']['baseInfo']['nickname']
                if not nickname:
                    nickname = resp['data']['userInfo']['baseInfo']['curPin']
                return ck, nickname
            else:
                context = f"账号{userNum}【{pinName}】Cookie 已失效！请重新获取\n。"
                printf(context)
                return ck, False
        except Exception:
            context = f"账号{userNum}【{pinName}】Cookie 已失效！请重新获取\n。"
            printf(context)
            return ck, False

    def iscookie(self):
        """
        :return: cookiesList,userNameList,pinNameList
        """
        cookiesList = []
        userNameList = []
        pinNameList = []
        if 'pt_key=' in cookies and 'pt_pin=' in cookies:
            r = re.compile(r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
            result = r.findall(cookies)
            if len(result) >= 1:
                printf("您有{}个账号".format(len(result)))
                u = 1
                for i in result:
                    r = re.compile(r"pt_pin=(.*?);")
                    pinName = r.findall(i)
                    pinName = unquote(pinName[0])
                    # 获取账号名
                    ck, nickname = self.getUserInfo(i, pinName, u)
                    if nickname:
                        cookiesList.append(ck)
                        userNameList.append(nickname)
                        pinNameList.append(pinName)
                    else:
                        u += 1
                        continue
                    u += 1
                if len(cookiesList) > 0 and len(userNameList) > 0:
                    return cookiesList, userNameList, pinNameList
                else:
                    printf("没有可用CK，已退出\n")
                    exit(3)
            else:
                printf("CK格式错误！...本次运行退出\n")
                exit(4)
        else:
            printf("CK格式错误或无CK！...请检查\n")
            exit(4)


getCk = getJDCookie()
getCk.getCookie()


def gen_params(page):
    body = gen_body(page)
    params = {
        "functionId": "jposTradeQuery",
        "appid": "swat_miniprogram",
        "client": "tjj_m",
        "sdkName": "orderDetail",
        "sdkVersion": "1.0.0",
        "clientVersion": "3.1.3",
        "timestamp": int(round(time.time() * 1000)),
        "body": json.dumps(body)
    }
    return params

def creat_bean_count(date, beansin, beansout, beanstotal):
    tb = PrettyTable()
    tb.add_column('DATE', date)
    tb.add_column('BEANSIN', beansin)
    tb.add_column('BEANSOUT', beansout)
    tb.add_column('TOTAL', beanstotal)
    printf(tb)


def get_beans_7days(ck):
    try:
        day_7 = True
        page = 0
        headers = {
            "Host": "bean.m.jd.com",
            "User-Agent": getua(),
            "Content-Type": "application/x-www-form-urlencoded;",
            "Cookie": ck,
        }
        days = []
        for i in range(0, 7):
            days.append((datetime.date.today() - datetime.timedelta(days=i)).strftime("%Y-%m-%d"))
        beans_in = {key: 0 for key in days}
        beans_out = {key: 0 for key in days}
        while day_7:
            page = page + 1
            url="https://bean.m.jd.com/beanDetail/detail.json?page="+str(page)
            data='body='+quote(str({"pageSize":"20","page":str(page)}))+'&appid=ld'
            resp = session.post(url, headers=headers, data=data ,timeout=1000).text

            res = json.loads(resp)
            if res['code'] == '0' :
                for i in res['jingDetailList']:
                    for date in days:
                        if str(date) in i['date'] and int(i['amount']) > 0:
                            beans_in[str(date)] = beans_in[str(date)] + int(i['amount'])
                            break
                        elif str(date) in i['date'] and int(i['amount']) < 0:
                            beans_out[str(date)] = beans_out[str(date)] + int(i['amount'])
                            break
                    if i['date'].split(' ')[0] not in str(days):
                        day_7 = False
            else:
                print("未获取到数据，原因未知！！\n")
                return {'code': 400, 'data': res}
            #print(beans_in, beans_out, days)
        return {'code': 200, 'data': [beans_in, beans_out, days]}
    except Exception as e:
        print(str(e))
        return {'code': 400, 'data': str(e)}


def get_total_beans(ck):
    try:
        headers = {
            "Host": "me-api.jd.com",
            "User-Agent": getua(),
            "Content-Type": "application/x-www-form-urlencoded;",
            "Cookie": ck,
            #"Referer": 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2'
        }
        jurl = "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion"
        resp = requests.get(jurl, headers=headers).text
        res = json.loads(resp)
        #print(res)
        return res['data']['assetInfo']['beanNum']
    except Exception as e:
        printf(str(e))


def get_bean_data(i,ck):
    try:
        if ck:
            #ck = cookies[i-1]
            beans_res = get_beans_7days(ck)
            beantotal = get_total_beans(ck)
            if beans_res['code'] != 200:
                return beans_res
            else:
                beans_in, beans_out = [], []
                beanstotal = [int(beantotal), ]
                for i in beans_res['data'][0]:
                    beantotal = int(beantotal) - int(beans_res['data'][0][i]) - int(beans_res['data'][1][i])
                    beans_in.append(int(beans_res['data'][0][i]))
                    beans_out.append(int(str(beans_res['data'][1][i]).replace('-', '')))
                    beanstotal.append(beantotal)
            return {'code': 200, 'data': [beans_in[::-1], beans_out[::-1], beanstotal[::-1], beans_res['data'][2][::-1]]}
    except Exception as e:
        print(str(e))

def query():
    try:
        global cookiesList, userNameList, pinNameList, ckNum, beanCount, userCount
        cookiesList, userNameList, pinNameList = getCk.iscookie()
        for i,ck,user,pin in zip(range(1,len(cookiesList)+1),cookiesList,userNameList,pinNameList):
           printf(f"\n****** [账号{i}]-{user} ******")
           res=get_bean_data(i,ck)
           if res['code'] != 200:
                printf(res['data'])
                continue
           if res['data'][2][1:] != []:
               creat_bean_count(res['data'][3], res['data'][0], res['data'][1], res['data'][2][1:])
           time.sleep(2)
    except Exception as e:
        printf(str(e))  


if __name__ == "__main__":
    query()
