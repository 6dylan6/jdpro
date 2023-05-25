/**
汪汪赛跑-提现10元,周五9点
59 59 8 * * 5 jd_joy_run_reward.ts
new Env('汪汪赛跑提现')
updateTime：2022-07-09
**/

import { get, post, requireConfig, wait } from './TS_USER_AGENTS'
import { H5ST } from "./function/h5st"

let cookie: string = '', res: any = '', UserName: string = '', fp_448de: string = '' || process.env.FP_448DE, fp_b6ac3: string = '' || process.env.FP_B6AC3
let h5stTool: H5ST = null

!(async () => {
    let cookiesArr: string[] = await requireConfig()
    for (let [index, value] of cookiesArr.entries()) {
        cookie = value
        UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
        console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
        let rewardAmount: number = 0
        try {
            h5stTool = new H5ST('448de', 'jdltapp;', fp_448de)
            await h5stTool.__genAlgo()
            res = await team('runningMyPrize', { "linkId": "L-sOanK_5RJCz7I314FpnQ", "pageSize": 20, "time": null, "ids": null })
            rewardAmount = res.data.rewardAmount
            if (res.data.runningCashStatus.currentEndTime) {
                console.log('可提现', rewardAmount)
                res = await api('runningPrizeDraw', { "linkId": "L-sOanK_5RJCz7I314FpnQ", "type": 2, "level": 3 })
                if (res.errMsg.indexOf("不足") > -1) {
                    res = await api('runningPrizeDraw', { "linkId": "L-sOanK_5RJCz7I314FpnQ", "type": 2, "level": 2 })
                }
                await wait(1000)
                if (res.success) {
                    console.log(res.data.message)
                } else {
                    console.log('提现失败：', res.errMsg)
                }
            } else {
                console.log('还未到提现时间')
            }
        } catch (e) {
            console.log('Error', e)
            await wait(1000)
        }
    }
})()

async function api(fn: string, body: object) {
    let timestamp: number = Date.now(), h5st: string = ''
    if (fn === 'runningOpenBox') {
        h5st = h5stTool.__genH5st({
            appid: "activities_platform",
            body: JSON.stringify(body),
            client: "ios",
            clientVersion: "3.1.0",
            functionId: "runningOpenBox",
            t: timestamp.toString()
        })
    }
    let params: string = `functionId=${fn}&body=${JSON.stringify(body)}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1`
    h5st && (params += `&h5st=${h5st}`)
    return await post('https://api.m.jd.com/', params, {
        'authority': 'api.m.jd.com',
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': cookie,
        'origin': 'https://h5platform.jd.com',
        'referer': 'https://h5platform.jd.com/',
        'user-agent': 'jdltapp;'
    })
}

async function team(fn: string, body: object) {
    let timestamp: number = Date.now(), h5st: string
    h5st = h5stTool.__genH5st({
        appid: "activities_platform",
        body: JSON.stringify(body),
        client: "ios",
        clientVersion: "3.1.0",
        functionId: fn,
        t: timestamp.toString()
    })
    return await get(`https://api.m.jd.com/?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1&h5st=${h5st}`, {
        'Host': 'api.m.jd.com',
        'User-Agent': 'jdltapp;',
        'Origin': 'https://h5platform.jd.com',
        'X-Requested-With': 'com.jd.jdlite',
        'Referer': 'https://h5platform.jd.com/',
        'Cookie': cookie
    })
}
