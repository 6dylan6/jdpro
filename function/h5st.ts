import axios from "axios"
import {format} from "date-fns"
import * as CryptoJS from 'crypto-js'

class H5ST {
  tk: string;
  timestamp: string;
  rd: string;
  appId: string;
  fp: string;
  time: number;
  ua: string
  enc: string;

  constructor(appId: string, ua: string, fp: string) {
    this.appId = appId
    this.ua = ua
    this.fp = fp || this.__genFp()
  }

  __genFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--;)
      i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0, 16)
  }

  async __genAlgo() {
    this.time = Date.now()
    this.timestamp = format(this.time, "yyyyMMddHHmmssSSS")
    let {data} = await axios.post(`https://cactus.jd.com/request_algo?g_ty=ajax`, {
      'version': '3.0',
      'fp': this.fp,
      'appId': this.appId.toString(),
      'timestamp': this.time,
      'platform': 'web',
      'expandParams': ''
    }, {
      headers: {
        'Host': 'cactus.jd.com',
        'accept': 'application/json',
        'content-type': 'application/json',
        'user-agent': this.ua,
      }
    })
    this.tk = data.data.result.tk
    this.rd = data.data.result.algo.match(/rd='(.*)'/)[1]
    this.enc = data.data.result.algo.match(/algo\.(.*)\(/)[1]
  }

  __genKey(tk: string, fp: string, ts: string, ai: string, algo: object) {
    let str = `${tk}${fp}${ts}${ai}${this.rd}`;
    return algo[this.enc](str, tk)
  }

  __genH5st(body: object) {
    let y = this.__genKey(this.tk, this.fp, this.timestamp, this.appId, CryptoJS).toString(CryptoJS.enc.Hex)
    let s = ''
    for (let key of Object.keys(body)) {
      key === 'body' ? s += `${key}:${CryptoJS.SHA256(body[key]).toString(CryptoJS.enc.Hex)}&` : s += `${key}:${body[key]}&`
    }
    s = s.slice(0, -1)
    s = CryptoJS.HmacSHA256(s, y).toString(CryptoJS.enc.Hex)
    return encodeURIComponent(`${this.timestamp};${this.fp};${this.appId.toString()};${this.tk};${s};3.0;${this.time.toString()}`)
  }
}

export {
  H5ST
}
