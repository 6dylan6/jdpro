
"""
cron: 10 20 * * *
new Env('京东试用成功通知');
"""
import requests
import json
import time
import os
import re
import sys
import random
import string
import urllib



def randomuserAgent():
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

#以上部分参考Curtin的脚本：https://github.com/curtinlv/JD-Script

def load_send():
    global send
    cur_path = os.path.abspath(os.path.dirname(__file__))
    sys.path.append(cur_path)
    if os.path.exists(cur_path + "/sendNotify.py"):
        try:
            from sendNotify import send
        except:
            send=False
            print("加载通知服务失败~")
    else:
        send=False
        print("加载通知服务失败~")
load_send()


def printf(text):
    print(text)
    sys.stdout.flush()

def get_remarkinfo():
    url='http://127.0.0.1:5600/api/envs'
    try:
        with open('/ql/config/auth.json', 'r') as f:
            token=json.loads(f.read())['token']
        headers={
            'Accept':'application/json',
            'authorization':'Bearer '+token,
            }
        response=requests.get(url=url,headers=headers)

        for i in range(len(json.loads(response.text)['data'])):
            if json.loads(response.text)['data'][i]['name']=='JD_COOKIE':
                try:
                    if json.loads(response.text)['data'][i]['remarks'].find('@@')==-1:
                        remarkinfos[json.loads(response.text)['data'][i]['value'].split(';')[1].replace('pt_pin=','')]=json.loads(response.text)['data'][i]['remarks'].replace('remark=','')
                    else:
                        remarkinfos[json.loads(response.text)['data'][i]['value'].split(';')[1].replace('pt_pin=','')]=json.loads(response.text)['data'][i]['remarks'].split("@@")[0].replace('remark=','').replace(';','')
                except:
                    pass
    except:
        print('读取auth.json文件出错，跳过获取备注')

def get_succeedinfo(ck):
    jda = "__jda=1.1.1.1.1;"
    url='https://api.m.jd.com/client.action'
    headers={
    'accept':'application/json, text/plain, */*',
    'content-type':'application/x-www-form-urlencoded',
    'origin':'https://prodev.m.jd.com',
    'accept-language':'zh-CN,zh-Hans;q=0.9',
    'User-Agent': UserAgent,
    'referer':'https://prodev.m.jd.com/',
    'accept-encoding':'gzip, deflate',
    'cookie': ck + jda
	    }   
    data=f'appid=newtry&functionId=try_MyTrials&uuid={uuid}&clientVersion={clientVersion}&client=wh5&osVersion={iosVer}&area={area}&networkType=wifi&body=%7B%22page%22%3A1%2C%22selected%22%3A2%2C%22previewTime%22%3A%22%22%7D'
    response=requests.post(url=url,headers=headers,data=data)
    isnull=True
    try:
        for i in range(len(json.loads(response.text)['data']['list'])):
            if(json.loads(response.text)['data']['list'][i]['text']['text']).find('试用资格将保留')!=-1:
                print(json.loads(response.text)['data']['list'][i]['trialName'])
                try:
                    send("京东试用待领取物品通知",'账号名称：'+remarkinfos[ptpin]+'\n'+'商品名称:'+json.loads(response.text)['data']['list'][i]['trialName']+"\n"+"商品链接:https://item.jd.com/"+json.loads(response.text)['data']['list'][i]['skuId']+".html")
                    isnull=False
                except:
                     send("京东试用待领取物品通知",'账号名称：'+urllib.parse.unquote(ptpin)+'\n'+'商品名称:'+json.loads(response.text)['data']['list'][i]['trialName']+"\n"+"商品链接:https://item.jd.com/"+json.loads(response.text)['data']['list'][i]['skuId']+".html")
                     isnull=False 
        if isnull==True:
            print("没有在有效期内待领取的试用品\n\n")
    except:
        print('获取信息出错，可能是账号已过期')
if __name__ == '__main__':
    remarkinfos={}
    try:
        get_remarkinfo()
    except:
        pass
    try:
        cks = os.environ["JD_COOKIE"].split("&")
    except:
        f = open("/jd/config/config.sh", "r", encoding='utf-8')
        cks = re.findall(r'Cookie[0-9]*="(pt_key=.*?;pt_pin=.*?;)"', f.read())
        f.close()
    for ck in cks:
        ck = ck.strip()
        if ck[-1] != ';':
            ck += ';'
        ptpin = re.findall(r"pt_pin=(.*?);", ck)[0]
        try:
            if remarkinfos[ptpin]!='':
                printf("--账号:" + remarkinfos[ptpin] + "--")
            else:
                printf("--无备注账号:" + urllib.parse.unquote(ptpin) + "--")
        except Exception as e:
            printf("--账号:" + urllib.parse.unquote(ptpin) + "--")
        UserAgent=randomuserAgent()
        get_succeedinfo(ck)