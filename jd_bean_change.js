/*
cron "28 8,21 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2.

// prettier-ignore
!function (t, e) { "object" == typeof exports ? module.exports = exports = e() : "function" == typeof define && define.amd ? define([], e) : t.CryptoJS = e() }(this, function () { var h, t, e, r, i, n, f, o, s, c, a, l, d, m, x, b, H, z, A, u, p, _, v, y, g, B, w, k, S, C, D, E, R, M, F, P, W, O, I, U, K, X, L, j, N, T, q, Z, V, G, J, $, Q, Y, tt, et, rt, it, nt, ot, st, ct, at, ht, lt, ft, dt, ut, pt, _t, vt, yt, gt, Bt, wt, kt, St, bt = bt || function (l) { var t; if ("undefined" != typeof window && window.crypto && (t = window.crypto), !t && "undefined" != typeof window && window.msCrypto && (t = window.msCrypto), !t && "undefined" != typeof global && global.crypto && (t = global.crypto), !t && "function" == typeof require) try { t = require("crypto") } catch (t) { } function i() { if (t) { if ("function" == typeof t.getRandomValues) try { return t.getRandomValues(new Uint32Array(1))[0] } catch (t) { } if ("function" == typeof t.randomBytes) try { return t.randomBytes(4).readInt32LE() } catch (t) { } } throw new Error("Native crypto module could not be used to get secure random number.") } var r = Object.create || function (t) { var e; return n.prototype = t, e = new n, n.prototype = null, e }; function n() { } var e = {}, o = e.lib = {}, s = o.Base = { extend: function (t) { var e = r(this); return t && e.mixIn(t), e.hasOwnProperty("init") && this.init !== e.init || (e.init = function () { e.$super.init.apply(this, arguments) }), (e.init.prototype = e).$super = this, e }, create: function () { var t = this.extend(); return t.init.apply(t, arguments), t }, init: function () { }, mixIn: function (t) { for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]); t.hasOwnProperty("toString") && (this.toString = t.toString) }, clone: function () { return this.init.prototype.extend(this) } }, f = o.WordArray = s.extend({ init: function (t, e) { t = this.words = t || [], this.sigBytes = null != e ? e : 4 * t.length }, toString: function (t) { return (t || a).stringify(this) }, concat: function (t) { var e = this.words, r = t.words, i = this.sigBytes, n = t.sigBytes; if (this.clamp(), i % 4) for (var o = 0; o < n; o++) { var s = r[o >>> 2] >>> 24 - o % 4 * 8 & 255; e[i + o >>> 2] |= s << 24 - (i + o) % 4 * 8 } else for (o = 0; o < n; o += 4)e[i + o >>> 2] = r[o >>> 2]; return this.sigBytes += n, this }, clamp: function () { var t = this.words, e = this.sigBytes; t[e >>> 2] &= 4294967295 << 32 - e % 4 * 8, t.length = l.ceil(e / 4) }, clone: function () { var t = s.clone.call(this); return t.words = this.words.slice(0), t }, random: function (t) { for (var e = [], r = 0; r < t; r += 4)e.push(i()); return new f.init(e, t) } }), c = e.enc = {}, a = c.Hex = { stringify: function (t) { for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n++) { var o = e[n >>> 2] >>> 24 - n % 4 * 8 & 255; i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16)) } return i.join("") }, parse: function (t) { for (var e = t.length, r = [], i = 0; i < e; i += 2)r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4; return new f.init(r, e / 2) } }, h = c.Latin1 = { stringify: function (t) { for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n++) { var o = e[n >>> 2] >>> 24 - n % 4 * 8 & 255; i.push(String.fromCharCode(o)) } return i.join("") }, parse: function (t) { for (var e = t.length, r = [], i = 0; i < e; i++)r[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8; return new f.init(r, e) } }, d = c.Utf8 = { stringify: function (t) { try { return decodeURIComponent(escape(h.stringify(t))) } catch (t) { throw new Error("Malformed UTF-8 data") } }, parse: function (t) { return h.parse(unescape(encodeURIComponent(t))) } }, u = o.BufferedBlockAlgorithm = s.extend({ reset: function () { this._data = new f.init, this._nDataBytes = 0 }, _append: function (t) { "string" == typeof t && (t = d.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes }, _process: function (t) { var e, r = this._data, i = r.words, n = r.sigBytes, o = this.blockSize, s = n / (4 * o), c = (s = t ? l.ceil(s) : l.max((0 | s) - this._minBufferSize, 0)) * o, a = l.min(4 * c, n); if (c) { for (var h = 0; h < c; h += o)this._doProcessBlock(i, h); e = i.splice(0, c), r.sigBytes -= a } return new f.init(e, a) }, clone: function () { var t = s.clone.call(this); return t._data = this._data.clone(), t }, _minBufferSize: 0 }), p = (o.Hasher = u.extend({ cfg: s.extend(), init: function (t) { this.cfg = this.cfg.extend(t), this.reset() }, reset: function () { u.reset.call(this), this._doReset() }, update: function (t) { return this._append(t), this._process(), this }, finalize: function (t) { return t && this._append(t), this._doFinalize() }, blockSize: 16, _createHelper: function (r) { return function (t, e) { return new r.init(e).finalize(t) } }, _createHmacHelper: function (r) { return function (t, e) { return new p.HMAC.init(r, e).finalize(t) } } }), e.algo = {}); return e }(Math); function mt(t, e, r) { return t ^ e ^ r } function xt(t, e, r) { return t & e | ~t & r } function Ht(t, e, r) { return (t | ~e) ^ r } function zt(t, e, r) { return t & r | e & ~r } function At(t, e, r) { return t ^ (e | ~r) } function Ct(t, e) { return t << e | t >>> 32 - e } function Dt(t, e, r, i) { var n, o = this._iv; o ? (n = o.slice(0), this._iv = void 0) : n = this._prevBlock, i.encryptBlock(n, 0); for (var s = 0; s < r; s++)t[e + s] ^= n[s] } function Et(t) { if (255 == (t >> 24 & 255)) { var e = t >> 16 & 255, r = t >> 8 & 255, i = 255 & t; 255 === e ? (e = 0, 255 === r ? (r = 0, 255 === i ? i = 0 : ++i) : ++r) : ++e, t = 0, t += e << 16, t += r << 8, t += i } else t += 1 << 24; return t } function Rt() { for (var t = this._X, e = this._C, r = 0; r < 8; r++)ft[r] = e[r]; e[0] = e[0] + 1295307597 + this._b | 0, e[1] = e[1] + 3545052371 + (e[0] >>> 0 < ft[0] >>> 0 ? 1 : 0) | 0, e[2] = e[2] + 886263092 + (e[1] >>> 0 < ft[1] >>> 0 ? 1 : 0) | 0, e[3] = e[3] + 1295307597 + (e[2] >>> 0 < ft[2] >>> 0 ? 1 : 0) | 0, e[4] = e[4] + 3545052371 + (e[3] >>> 0 < ft[3] >>> 0 ? 1 : 0) | 0, e[5] = e[5] + 886263092 + (e[4] >>> 0 < ft[4] >>> 0 ? 1 : 0) | 0, e[6] = e[6] + 1295307597 + (e[5] >>> 0 < ft[5] >>> 0 ? 1 : 0) | 0, e[7] = e[7] + 3545052371 + (e[6] >>> 0 < ft[6] >>> 0 ? 1 : 0) | 0, this._b = e[7] >>> 0 < ft[7] >>> 0 ? 1 : 0; for (r = 0; r < 8; r++) { var i = t[r] + e[r], n = 65535 & i, o = i >>> 16, s = ((n * n >>> 17) + n * o >>> 15) + o * o, c = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0); dt[r] = s ^ c } t[0] = dt[0] + (dt[7] << 16 | dt[7] >>> 16) + (dt[6] << 16 | dt[6] >>> 16) | 0, t[1] = dt[1] + (dt[0] << 8 | dt[0] >>> 24) + dt[7] | 0, t[2] = dt[2] + (dt[1] << 16 | dt[1] >>> 16) + (dt[0] << 16 | dt[0] >>> 16) | 0, t[3] = dt[3] + (dt[2] << 8 | dt[2] >>> 24) + dt[1] | 0, t[4] = dt[4] + (dt[3] << 16 | dt[3] >>> 16) + (dt[2] << 16 | dt[2] >>> 16) | 0, t[5] = dt[5] + (dt[4] << 8 | dt[4] >>> 24) + dt[3] | 0, t[6] = dt[6] + (dt[5] << 16 | dt[5] >>> 16) + (dt[4] << 16 | dt[4] >>> 16) | 0, t[7] = dt[7] + (dt[6] << 8 | dt[6] >>> 24) + dt[5] | 0 } function Mt() { for (var t = this._X, e = this._C, r = 0; r < 8; r++)wt[r] = e[r]; e[0] = e[0] + 1295307597 + this._b | 0, e[1] = e[1] + 3545052371 + (e[0] >>> 0 < wt[0] >>> 0 ? 1 : 0) | 0, e[2] = e[2] + 886263092 + (e[1] >>> 0 < wt[1] >>> 0 ? 1 : 0) | 0, e[3] = e[3] + 1295307597 + (e[2] >>> 0 < wt[2] >>> 0 ? 1 : 0) | 0, e[4] = e[4] + 3545052371 + (e[3] >>> 0 < wt[3] >>> 0 ? 1 : 0) | 0, e[5] = e[5] + 886263092 + (e[4] >>> 0 < wt[4] >>> 0 ? 1 : 0) | 0, e[6] = e[6] + 1295307597 + (e[5] >>> 0 < wt[5] >>> 0 ? 1 : 0) | 0, e[7] = e[7] + 3545052371 + (e[6] >>> 0 < wt[6] >>> 0 ? 1 : 0) | 0, this._b = e[7] >>> 0 < wt[7] >>> 0 ? 1 : 0; for (r = 0; r < 8; r++) { var i = t[r] + e[r], n = 65535 & i, o = i >>> 16, s = ((n * n >>> 17) + n * o >>> 15) + o * o, c = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0); kt[r] = s ^ c } t[0] = kt[0] + (kt[7] << 16 | kt[7] >>> 16) + (kt[6] << 16 | kt[6] >>> 16) | 0, t[1] = kt[1] + (kt[0] << 8 | kt[0] >>> 24) + kt[7] | 0, t[2] = kt[2] + (kt[1] << 16 | kt[1] >>> 16) + (kt[0] << 16 | kt[0] >>> 16) | 0, t[3] = kt[3] + (kt[2] << 8 | kt[2] >>> 24) + kt[1] | 0, t[4] = kt[4] + (kt[3] << 16 | kt[3] >>> 16) + (kt[2] << 16 | kt[2] >>> 16) | 0, t[5] = kt[5] + (kt[4] << 8 | kt[4] >>> 24) + kt[3] | 0, t[6] = kt[6] + (kt[5] << 16 | kt[5] >>> 16) + (kt[4] << 16 | kt[4] >>> 16) | 0, t[7] = kt[7] + (kt[6] << 8 | kt[6] >>> 24) + kt[5] | 0 } return h = bt.lib.WordArray, bt.enc.Base64 = { stringify: function (t) { var e = t.words, r = t.sigBytes, i = this._map; t.clamp(); for (var n = [], o = 0; o < r; o += 3)for (var s = (e[o >>> 2] >>> 24 - o % 4 * 8 & 255) << 16 | (e[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255) << 8 | e[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, c = 0; c < 4 && o + .75 * c < r; c++)n.push(i.charAt(s >>> 6 * (3 - c) & 63)); var a = i.charAt(64); if (a) for (; n.length % 4;)n.push(a); return n.join("") }, parse: function (t) { var e = t.length, r = this._map, i = this._reverseMap; if (!i) { i = this._reverseMap = []; for (var n = 0; n < r.length; n++)i[r.charCodeAt(n)] = n } var o = r.charAt(64); if (o) { var s = t.indexOf(o); -1 !== s && (e = s) } return function (t, e, r) { for (var i = [], n = 0, o = 0; o < e; o++)if (o % 4) { var s = r[t.charCodeAt(o - 1)] << o % 4 * 2, c = r[t.charCodeAt(o)] >>> 6 - o % 4 * 2, a = s | c; i[n >>> 2] |= a << 24 - n % 4 * 8, n++ } return h.create(i, n) }(t, e, i) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" }, function (l) { var t = bt, e = t.lib, r = e.WordArray, i = e.Hasher, n = t.algo, H = []; !function () { for (var t = 0; t < 64; t++)H[t] = 4294967296 * l.abs(l.sin(t + 1)) | 0 }(); var o = n.MD5 = i.extend({ _doReset: function () { this._hash = new r.init([1732584193, 4023233417, 2562383102, 271733878]) }, _doProcessBlock: function (t, e) { for (var r = 0; r < 16; r++) { var i = e + r, n = t[i]; t[i] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8) } var o = this._hash.words, s = t[e + 0], c = t[e + 1], a = t[e + 2], h = t[e + 3], l = t[e + 4], f = t[e + 5], d = t[e + 6], u = t[e + 7], p = t[e + 8], _ = t[e + 9], v = t[e + 10], y = t[e + 11], g = t[e + 12], B = t[e + 13], w = t[e + 14], k = t[e + 15], S = o[0], m = o[1], x = o[2], b = o[3]; S = z(S, m, x, b, s, 7, H[0]), b = z(b, S, m, x, c, 12, H[1]), x = z(x, b, S, m, a, 17, H[2]), m = z(m, x, b, S, h, 22, H[3]), S = z(S, m, x, b, l, 7, H[4]), b = z(b, S, m, x, f, 12, H[5]), x = z(x, b, S, m, d, 17, H[6]), m = z(m, x, b, S, u, 22, H[7]), S = z(S, m, x, b, p, 7, H[8]), b = z(b, S, m, x, _, 12, H[9]), x = z(x, b, S, m, v, 17, H[10]), m = z(m, x, b, S, y, 22, H[11]), S = z(S, m, x, b, g, 7, H[12]), b = z(b, S, m, x, B, 12, H[13]), x = z(x, b, S, m, w, 17, H[14]), S = A(S, m = z(m, x, b, S, k, 22, H[15]), x, b, c, 5, H[16]), b = A(b, S, m, x, d, 9, H[17]), x = A(x, b, S, m, y, 14, H[18]), m = A(m, x, b, S, s, 20, H[19]), S = A(S, m, x, b, f, 5, H[20]), b = A(b, S, m, x, v, 9, H[21]), x = A(x, b, S, m, k, 14, H[22]), m = A(m, x, b, S, l, 20, H[23]), S = A(S, m, x, b, _, 5, H[24]), b = A(b, S, m, x, w, 9, H[25]), x = A(x, b, S, m, h, 14, H[26]), m = A(m, x, b, S, p, 20, H[27]), S = A(S, m, x, b, B, 5, H[28]), b = A(b, S, m, x, a, 9, H[29]), x = A(x, b, S, m, u, 14, H[30]), S = C(S, m = A(m, x, b, S, g, 20, H[31]), x, b, f, 4, H[32]), b = C(b, S, m, x, p, 11, H[33]), x = C(x, b, S, m, y, 16, H[34]), m = C(m, x, b, S, w, 23, H[35]), S = C(S, m, x, b, c, 4, H[36]), b = C(b, S, m, x, l, 11, H[37]), x = C(x, b, S, m, u, 16, H[38]), m = C(m, x, b, S, v, 23, H[39]), S = C(S, m, x, b, B, 4, H[40]), b = C(b, S, m, x, s, 11, H[41]), x = C(x, b, S, m, h, 16, H[42]), m = C(m, x, b, S, d, 23, H[43]), S = C(S, m, x, b, _, 4, H[44]), b = C(b, S, m, x, g, 11, H[45]), x = C(x, b, S, m, k, 16, H[46]), S = D(S, m = C(m, x, b, S, a, 23, H[47]), x, b, s, 6, H[48]), b = D(b, S, m, x, u, 10, H[49]), x = D(x, b, S, m, w, 15, H[50]), m = D(m, x, b, S, f, 21, H[51]), S = D(S, m, x, b, g, 6, H[52]), b = D(b, S, m, x, h, 10, H[53]), x = D(x, b, S, m, v, 15, H[54]), m = D(m, x, b, S, c, 21, H[55]), S = D(S, m, x, b, p, 6, H[56]), b = D(b, S, m, x, k, 10, H[57]), x = D(x, b, S, m, d, 15, H[58]), m = D(m, x, b, S, B, 21, H[59]), S = D(S, m, x, b, l, 6, H[60]), b = D(b, S, m, x, y, 10, H[61]), x = D(x, b, S, m, a, 15, H[62]), m = D(m, x, b, S, _, 21, H[63]), o[0] = o[0] + S | 0, o[1] = o[1] + m | 0, o[2] = o[2] + x | 0, o[3] = o[3] + b | 0 }, _doFinalize: function () { var t = this._data, e = t.words, r = 8 * this._nDataBytes, i = 8 * t.sigBytes; e[i >>> 5] |= 128 << 24 - i % 32; var n = l.floor(r / 4294967296), o = r; e[15 + (64 + i >>> 9 << 4)] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8), e[14 + (64 + i >>> 9 << 4)] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), t.sigBytes = 4 * (e.length + 1), this._process(); for (var s = this._hash, c = s.words, a = 0; a < 4; a++) { var h = c[a]; c[a] = 16711935 & (h << 8 | h >>> 24) | 4278255360 & (h << 24 | h >>> 8) } return s }, clone: function () { var t = i.clone.call(this); return t._hash = this._hash.clone(), t } }); function z(t, e, r, i, n, o, s) { var c = t + (e & r | ~e & i) + n + s; return (c << o | c >>> 32 - o) + e } function A(t, e, r, i, n, o, s) { var c = t + (e & i | r & ~i) + n + s; return (c << o | c >>> 32 - o) + e } function C(t, e, r, i, n, o, s) { var c = t + (e ^ r ^ i) + n + s; return (c << o | c >>> 32 - o) + e } function D(t, e, r, i, n, o, s) { var c = t + (r ^ (e | ~i)) + n + s; return (c << o | c >>> 32 - o) + e } t.MD5 = i._createHelper(o), t.HmacMD5 = i._createHmacHelper(o) }(Math), e = (t = bt).lib, r = e.WordArray, i = e.Hasher, n = t.algo, f = [], o = n.SHA1 = i.extend({ _doReset: function () { this._hash = new r.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (t, e) { for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = 0; a < 80; a++) { if (a < 16) f[a] = 0 | t[e + a]; else { var h = f[a - 3] ^ f[a - 8] ^ f[a - 14] ^ f[a - 16]; f[a] = h << 1 | h >>> 31 } var l = (i << 5 | i >>> 27) + c + f[a]; l += a < 20 ? 1518500249 + (n & o | ~n & s) : a < 40 ? 1859775393 + (n ^ o ^ s) : a < 60 ? (n & o | n & s | o & s) - 1894007588 : (n ^ o ^ s) - 899497514, c = s, s = o, o = n << 30 | n >>> 2, n = i, i = l } r[0] = r[0] + i | 0, r[1] = r[1] + n | 0, r[2] = r[2] + o | 0, r[3] = r[3] + s | 0, r[4] = r[4] + c | 0 }, _doFinalize: function () { var t = this._data, e = t.words, r = 8 * this._nDataBytes, i = 8 * t.sigBytes; return e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = Math.floor(r / 4294967296), e[15 + (64 + i >>> 9 << 4)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash }, clone: function () { var t = i.clone.call(this); return t._hash = this._hash.clone(), t } }), t.SHA1 = i._createHelper(o), t.HmacSHA1 = i._createHmacHelper(o), function (n) { var t = bt, e = t.lib, r = e.WordArray, i = e.Hasher, o = t.algo, s = [], B = []; !function () { function t(t) { for (var e = n.sqrt(t), r = 2; r <= e; r++)if (!(t % r)) return; return 1 } function e(t) { return 4294967296 * (t - (0 | t)) | 0 } for (var r = 2, i = 0; i < 64;)t(r) && (i < 8 && (s[i] = e(n.pow(r, .5))), B[i] = e(n.pow(r, 1 / 3)), i++), r++ }(); var w = [], c = o.SHA256 = i.extend({ _doReset: function () { this._hash = new r.init(s.slice(0)) }, _doProcessBlock: function (t, e) { for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = r[5], h = r[6], l = r[7], f = 0; f < 64; f++) { if (f < 16) w[f] = 0 | t[e + f]; else { var d = w[f - 15], u = (d << 25 | d >>> 7) ^ (d << 14 | d >>> 18) ^ d >>> 3, p = w[f - 2], _ = (p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10; w[f] = u + w[f - 7] + _ + w[f - 16] } var v = i & n ^ i & o ^ n & o, y = (i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22), g = l + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & a ^ ~c & h) + B[f] + w[f]; l = h, h = a, a = c, c = s + g | 0, s = o, o = n, n = i, i = g + (y + v) | 0 } r[0] = r[0] + i | 0, r[1] = r[1] + n | 0, r[2] = r[2] + o | 0, r[3] = r[3] + s | 0, r[4] = r[4] + c | 0, r[5] = r[5] + a | 0, r[6] = r[6] + h | 0, r[7] = r[7] + l | 0 }, _doFinalize: function () { var t = this._data, e = t.words, r = 8 * this._nDataBytes, i = 8 * t.sigBytes; return e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = n.floor(r / 4294967296), e[15 + (64 + i >>> 9 << 4)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash }, clone: function () { var t = i.clone.call(this); return t._hash = this._hash.clone(), t } }); t.SHA256 = i._createHelper(c), t.HmacSHA256 = i._createHmacHelper(c) }(Math), function () { var n = bt.lib.WordArray, t = bt.enc; t.Utf16 = t.Utf16BE = { stringify: function (t) { for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n += 2) { var o = e[n >>> 2] >>> 16 - n % 4 * 8 & 65535; i.push(String.fromCharCode(o)) } return i.join("") }, parse: function (t) { for (var e = t.length, r = [], i = 0; i < e; i++)r[i >>> 1] |= t.charCodeAt(i) << 16 - i % 2 * 16; return n.create(r, 2 * e) } }; function s(t) { return t << 8 & 4278255360 | t >>> 8 & 16711935 } t.Utf16LE = { stringify: function (t) { for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n += 2) { var o = s(e[n >>> 2] >>> 16 - n % 4 * 8 & 65535); i.push(String.fromCharCode(o)) } return i.join("") }, parse: function (t) { for (var e = t.length, r = [], i = 0; i < e; i++)r[i >>> 1] |= s(t.charCodeAt(i) << 16 - i % 2 * 16); return n.create(r, 2 * e) } } }(), function () { if ("function" == typeof ArrayBuffer) { var t = bt.lib.WordArray, n = t.init; (t.init = function (t) { if (t instanceof ArrayBuffer && (t = new Uint8Array(t)), (t instanceof Int8Array || "undefined" != typeof Uint8ClampedArray && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array) && (t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength)), t instanceof Uint8Array) { for (var e = t.byteLength, r = [], i = 0; i < e; i++)r[i >>> 2] |= t[i] << 24 - i % 4 * 8; n.call(this, r, e) } else n.apply(this, arguments) }).prototype = t } }(), Math, c = (s = bt).lib, a = c.WordArray, l = c.Hasher, d = s.algo, m = a.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]), x = a.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]), b = a.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]), H = a.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]), z = a.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), A = a.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), u = d.RIPEMD160 = l.extend({ _doReset: function () { this._hash = a.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (t, e) { for (var r = 0; r < 16; r++) { var i = e + r, n = t[i]; t[i] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8) } var o, s, c, a, h, l, f, d, u, p, _, v = this._hash.words, y = z.words, g = A.words, B = m.words, w = x.words, k = b.words, S = H.words; l = o = v[0], f = s = v[1], d = c = v[2], u = a = v[3], p = h = v[4]; for (r = 0; r < 80; r += 1)_ = o + t[e + B[r]] | 0, _ += r < 16 ? mt(s, c, a) + y[0] : r < 32 ? xt(s, c, a) + y[1] : r < 48 ? Ht(s, c, a) + y[2] : r < 64 ? zt(s, c, a) + y[3] : At(s, c, a) + y[4], _ = (_ = Ct(_ |= 0, k[r])) + h | 0, o = h, h = a, a = Ct(c, 10), c = s, s = _, _ = l + t[e + w[r]] | 0, _ += r < 16 ? At(f, d, u) + g[0] : r < 32 ? zt(f, d, u) + g[1] : r < 48 ? Ht(f, d, u) + g[2] : r < 64 ? xt(f, d, u) + g[3] : mt(f, d, u) + g[4], _ = (_ = Ct(_ |= 0, S[r])) + p | 0, l = p, p = u, u = Ct(d, 10), d = f, f = _; _ = v[1] + c + u | 0, v[1] = v[2] + a + p | 0, v[2] = v[3] + h + l | 0, v[3] = v[4] + o + f | 0, v[4] = v[0] + s + d | 0, v[0] = _ }, _doFinalize: function () { var t = this._data, e = t.words, r = 8 * this._nDataBytes, i = 8 * t.sigBytes; e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = 16711935 & (r << 8 | r >>> 24) | 4278255360 & (r << 24 | r >>> 8), t.sigBytes = 4 * (e.length + 1), this._process(); for (var n = this._hash, o = n.words, s = 0; s < 5; s++) { var c = o[s]; o[s] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8) } return n }, clone: function () { var t = l.clone.call(this); return t._hash = this._hash.clone(), t } }), s.RIPEMD160 = l._createHelper(u), s.HmacRIPEMD160 = l._createHmacHelper(u), p = bt.lib.Base, _ = bt.enc.Utf8, bt.algo.HMAC = p.extend({ init: function (t, e) { t = this._hasher = new t.init, "string" == typeof e && (e = _.parse(e)); var r = t.blockSize, i = 4 * r; e.sigBytes > i && (e = t.finalize(e)), e.clamp(); for (var n = this._oKey = e.clone(), o = this._iKey = e.clone(), s = n.words, c = o.words, a = 0; a < r; a++)s[a] ^= 1549556828, c[a] ^= 909522486; n.sigBytes = o.sigBytes = i, this.reset() }, reset: function () { var t = this._hasher; t.reset(), t.update(this._iKey) }, update: function (t) { return this._hasher.update(t), this }, finalize: function (t) { var e = this._hasher, r = e.finalize(t); return e.reset(), e.finalize(this._oKey.clone().concat(r)) } }), y = (v = bt).lib, g = y.Base, B = y.WordArray, w = v.algo, k = w.SHA1, S = w.HMAC, C = w.PBKDF2 = g.extend({ cfg: g.extend({ keySize: 4, hasher: k, iterations: 1 }), init: function (t) { this.cfg = this.cfg.extend(t) }, compute: function (t, e) { for (var r = this.cfg, i = S.create(r.hasher, t), n = B.create(), o = B.create([1]), s = n.words, c = o.words, a = r.keySize, h = r.iterations; s.length < a;) { var l = i.update(e).finalize(o); i.reset(); for (var f = l.words, d = f.length, u = l, p = 1; p < h; p++) { u = i.finalize(u), i.reset(); for (var _ = u.words, v = 0; v < d; v++)f[v] ^= _[v] } n.concat(l), c[0]++ } return n.sigBytes = 4 * a, n } }), v.PBKDF2 = function (t, e, r) { return C.create(r).compute(t, e) }, E = (D = bt).lib, R = E.Base, M = E.WordArray, F = D.algo, P = F.MD5, W = F.EvpKDF = R.extend({ cfg: R.extend({ keySize: 4, hasher: P, iterations: 1 }), init: function (t) { this.cfg = this.cfg.extend(t) }, compute: function (t, e) { for (var r, i = this.cfg, n = i.hasher.create(), o = M.create(), s = o.words, c = i.keySize, a = i.iterations; s.length < c;) { r && n.update(r), r = n.update(t).finalize(e), n.reset(); for (var h = 1; h < a; h++)r = n.finalize(r), n.reset(); o.concat(r) } return o.sigBytes = 4 * c, o } }), D.EvpKDF = function (t, e, r) { return W.create(r).compute(t, e) }, I = (O = bt).lib.WordArray, U = O.algo, K = U.SHA256, X = U.SHA224 = K.extend({ _doReset: function () { this._hash = new I.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]) }, _doFinalize: function () { var t = K._doFinalize.call(this); return t.sigBytes -= 4, t } }), O.SHA224 = K._createHelper(X), O.HmacSHA224 = K._createHmacHelper(X), L = bt.lib, j = L.Base, N = L.WordArray, (T = bt.x64 = {}).Word = j.extend({ init: function (t, e) { this.high = t, this.low = e } }), T.WordArray = j.extend({ init: function (t, e) { t = this.words = t || [], this.sigBytes = null != e ? e : 8 * t.length }, toX32: function () { for (var t = this.words, e = t.length, r = [], i = 0; i < e; i++) { var n = t[i]; r.push(n.high), r.push(n.low) } return N.create(r, this.sigBytes) }, clone: function () { for (var t = j.clone.call(this), e = t.words = this.words.slice(0), r = e.length, i = 0; i < r; i++)e[i] = e[i].clone(); return t } }), function (d) { var t = bt, e = t.lib, u = e.WordArray, i = e.Hasher, l = t.x64.Word, r = t.algo, C = [], D = [], E = []; !function () { for (var t = 1, e = 0, r = 0; r < 24; r++) { C[t + 5 * e] = (r + 1) * (r + 2) / 2 % 64; var i = (2 * t + 3 * e) % 5; t = e % 5, e = i } for (t = 0; t < 5; t++)for (e = 0; e < 5; e++)D[t + 5 * e] = e + (2 * t + 3 * e) % 5 * 5; for (var n = 1, o = 0; o < 24; o++) { for (var s = 0, c = 0, a = 0; a < 7; a++) { if (1 & n) { var h = (1 << a) - 1; h < 32 ? c ^= 1 << h : s ^= 1 << h - 32 } 128 & n ? n = n << 1 ^ 113 : n <<= 1 } E[o] = l.create(s, c) } }(); var R = []; !function () { for (var t = 0; t < 25; t++)R[t] = l.create() }(); var n = r.SHA3 = i.extend({ cfg: i.cfg.extend({ outputLength: 512 }), _doReset: function () { for (var t = this._state = [], e = 0; e < 25; e++)t[e] = new l.init; this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32 }, _doProcessBlock: function (t, e) { for (var r = this._state, i = this.blockSize / 2, n = 0; n < i; n++) { var o = t[e + 2 * n], s = t[e + 2 * n + 1]; o = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), s = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), (x = r[n]).high ^= s, x.low ^= o } for (var c = 0; c < 24; c++) { for (var a = 0; a < 5; a++) { for (var h = 0, l = 0, f = 0; f < 5; f++) { h ^= (x = r[a + 5 * f]).high, l ^= x.low } var d = R[a]; d.high = h, d.low = l } for (a = 0; a < 5; a++) { var u = R[(a + 4) % 5], p = R[(a + 1) % 5], _ = p.high, v = p.low; for (h = u.high ^ (_ << 1 | v >>> 31), l = u.low ^ (v << 1 | _ >>> 31), f = 0; f < 5; f++) { (x = r[a + 5 * f]).high ^= h, x.low ^= l } } for (var y = 1; y < 25; y++) { var g = (x = r[y]).high, B = x.low, w = C[y]; l = w < 32 ? (h = g << w | B >>> 32 - w, B << w | g >>> 32 - w) : (h = B << w - 32 | g >>> 64 - w, g << w - 32 | B >>> 64 - w); var k = R[D[y]]; k.high = h, k.low = l } var S = R[0], m = r[0]; S.high = m.high, S.low = m.low; for (a = 0; a < 5; a++)for (f = 0; f < 5; f++) { var x = r[y = a + 5 * f], b = R[y], H = R[(a + 1) % 5 + 5 * f], z = R[(a + 2) % 5 + 5 * f]; x.high = b.high ^ ~H.high & z.high, x.low = b.low ^ ~H.low & z.low } x = r[0]; var A = E[c]; x.high ^= A.high, x.low ^= A.low } }, _doFinalize: function () { var t = this._data, e = t.words, r = (this._nDataBytes, 8 * t.sigBytes), i = 32 * this.blockSize; e[r >>> 5] |= 1 << 24 - r % 32, e[(d.ceil((1 + r) / i) * i >>> 5) - 1] |= 128, t.sigBytes = 4 * e.length, this._process(); for (var n = this._state, o = this.cfg.outputLength / 8, s = o / 8, c = [], a = 0; a < s; a++) { var h = n[a], l = h.high, f = h.low; l = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8), f = 16711935 & (f << 8 | f >>> 24) | 4278255360 & (f << 24 | f >>> 8), c.push(f), c.push(l) } return new u.init(c, o) }, clone: function () { for (var t = i.clone.call(this), e = t._state = this._state.slice(0), r = 0; r < 25; r++)e[r] = e[r].clone(); return t } }); t.SHA3 = i._createHelper(n), t.HmacSHA3 = i._createHmacHelper(n) }(Math), function () { var t = bt, e = t.lib.Hasher, r = t.x64, i = r.Word, n = r.WordArray, o = t.algo; function s() { return i.create.apply(i, arguments) } var mt = [s(1116352408, 3609767458), s(1899447441, 602891725), s(3049323471, 3964484399), s(3921009573, 2173295548), s(961987163, 4081628472), s(1508970993, 3053834265), s(2453635748, 2937671579), s(2870763221, 3664609560), s(3624381080, 2734883394), s(310598401, 1164996542), s(607225278, 1323610764), s(1426881987, 3590304994), s(1925078388, 4068182383), s(2162078206, 991336113), s(2614888103, 633803317), s(3248222580, 3479774868), s(3835390401, 2666613458), s(4022224774, 944711139), s(264347078, 2341262773), s(604807628, 2007800933), s(770255983, 1495990901), s(1249150122, 1856431235), s(1555081692, 3175218132), s(1996064986, 2198950837), s(2554220882, 3999719339), s(2821834349, 766784016), s(2952996808, 2566594879), s(3210313671, 3203337956), s(3336571891, 1034457026), s(3584528711, 2466948901), s(113926993, 3758326383), s(338241895, 168717936), s(666307205, 1188179964), s(773529912, 1546045734), s(1294757372, 1522805485), s(1396182291, 2643833823), s(1695183700, 2343527390), s(1986661051, 1014477480), s(2177026350, 1206759142), s(2456956037, 344077627), s(2730485921, 1290863460), s(2820302411, 3158454273), s(3259730800, 3505952657), s(3345764771, 106217008), s(3516065817, 3606008344), s(3600352804, 1432725776), s(4094571909, 1467031594), s(275423344, 851169720), s(430227734, 3100823752), s(506948616, 1363258195), s(659060556, 3750685593), s(883997877, 3785050280), s(958139571, 3318307427), s(1322822218, 3812723403), s(1537002063, 2003034995), s(1747873779, 3602036899), s(1955562222, 1575990012), s(2024104815, 1125592928), s(2227730452, 2716904306), s(2361852424, 442776044), s(2428436474, 593698344), s(2756734187, 3733110249), s(3204031479, 2999351573), s(3329325298, 3815920427), s(3391569614, 3928383900), s(3515267271, 566280711), s(3940187606, 3454069534), s(4118630271, 4000239992), s(116418474, 1914138554), s(174292421, 2731055270), s(289380356, 3203993006), s(460393269, 320620315), s(685471733, 587496836), s(852142971, 1086792851), s(1017036298, 365543100), s(1126000580, 2618297676), s(1288033470, 3409855158), s(1501505948, 4234509866), s(1607167915, 987167468), s(1816402316, 1246189591)], xt = []; !function () { for (var t = 0; t < 80; t++)xt[t] = s() }(); var c = o.SHA512 = e.extend({ _doReset: function () { this._hash = new n.init([new i.init(1779033703, 4089235720), new i.init(3144134277, 2227873595), new i.init(1013904242, 4271175723), new i.init(2773480762, 1595750129), new i.init(1359893119, 2917565137), new i.init(2600822924, 725511199), new i.init(528734635, 4215389547), new i.init(1541459225, 327033209)]) }, _doProcessBlock: function (t, e) { for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = r[5], h = r[6], l = r[7], f = i.high, d = i.low, u = n.high, p = n.low, _ = o.high, v = o.low, y = s.high, g = s.low, B = c.high, w = c.low, k = a.high, S = a.low, m = h.high, x = h.low, b = l.high, H = l.low, z = f, A = d, C = u, D = p, E = _, R = v, M = y, F = g, P = B, W = w, O = k, I = S, U = m, K = x, X = b, L = H, j = 0; j < 80; j++) { var N, T, q = xt[j]; if (j < 16) T = q.high = 0 | t[e + 2 * j], N = q.low = 0 | t[e + 2 * j + 1]; else { var Z = xt[j - 15], V = Z.high, G = Z.low, J = (V >>> 1 | G << 31) ^ (V >>> 8 | G << 24) ^ V >>> 7, $ = (G >>> 1 | V << 31) ^ (G >>> 8 | V << 24) ^ (G >>> 7 | V << 25), Q = xt[j - 2], Y = Q.high, tt = Q.low, et = (Y >>> 19 | tt << 13) ^ (Y << 3 | tt >>> 29) ^ Y >>> 6, rt = (tt >>> 19 | Y << 13) ^ (tt << 3 | Y >>> 29) ^ (tt >>> 6 | Y << 26), it = xt[j - 7], nt = it.high, ot = it.low, st = xt[j - 16], ct = st.high, at = st.low; T = (T = (T = J + nt + ((N = $ + ot) >>> 0 < $ >>> 0 ? 1 : 0)) + et + ((N += rt) >>> 0 < rt >>> 0 ? 1 : 0)) + ct + ((N += at) >>> 0 < at >>> 0 ? 1 : 0), q.high = T, q.low = N } var ht, lt = P & O ^ ~P & U, ft = W & I ^ ~W & K, dt = z & C ^ z & E ^ C & E, ut = A & D ^ A & R ^ D & R, pt = (z >>> 28 | A << 4) ^ (z << 30 | A >>> 2) ^ (z << 25 | A >>> 7), _t = (A >>> 28 | z << 4) ^ (A << 30 | z >>> 2) ^ (A << 25 | z >>> 7), vt = (P >>> 14 | W << 18) ^ (P >>> 18 | W << 14) ^ (P << 23 | W >>> 9), yt = (W >>> 14 | P << 18) ^ (W >>> 18 | P << 14) ^ (W << 23 | P >>> 9), gt = mt[j], Bt = gt.high, wt = gt.low, kt = X + vt + ((ht = L + yt) >>> 0 < L >>> 0 ? 1 : 0), St = _t + ut; X = U, L = K, U = O, K = I, O = P, I = W, P = M + (kt = (kt = (kt = kt + lt + ((ht = ht + ft) >>> 0 < ft >>> 0 ? 1 : 0)) + Bt + ((ht = ht + wt) >>> 0 < wt >>> 0 ? 1 : 0)) + T + ((ht = ht + N) >>> 0 < N >>> 0 ? 1 : 0)) + ((W = F + ht | 0) >>> 0 < F >>> 0 ? 1 : 0) | 0, M = E, F = R, E = C, R = D, C = z, D = A, z = kt + (pt + dt + (St >>> 0 < _t >>> 0 ? 1 : 0)) + ((A = ht + St | 0) >>> 0 < ht >>> 0 ? 1 : 0) | 0 } d = i.low = d + A, i.high = f + z + (d >>> 0 < A >>> 0 ? 1 : 0), p = n.low = p + D, n.high = u + C + (p >>> 0 < D >>> 0 ? 1 : 0), v = o.low = v + R, o.high = _ + E + (v >>> 0 < R >>> 0 ? 1 : 0), g = s.low = g + F, s.high = y + M + (g >>> 0 < F >>> 0 ? 1 : 0), w = c.low = w + W, c.high = B + P + (w >>> 0 < W >>> 0 ? 1 : 0), S = a.low = S + I, a.high = k + O + (S >>> 0 < I >>> 0 ? 1 : 0), x = h.low = x + K, h.high = m + U + (x >>> 0 < K >>> 0 ? 1 : 0), H = l.low = H + L, l.high = b + X + (H >>> 0 < L >>> 0 ? 1 : 0) }, _doFinalize: function () { var t = this._data, e = t.words, r = 8 * this._nDataBytes, i = 8 * t.sigBytes; return e[i >>> 5] |= 128 << 24 - i % 32, e[30 + (128 + i >>> 10 << 5)] = Math.floor(r / 4294967296), e[31 + (128 + i >>> 10 << 5)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash.toX32() }, clone: function () { var t = e.clone.call(this); return t._hash = this._hash.clone(), t }, blockSize: 32 }); t.SHA512 = e._createHelper(c), t.HmacSHA512 = e._createHmacHelper(c) }(), Z = (q = bt).x64, V = Z.Word, G = Z.WordArray, J = q.algo, $ = J.SHA512, Q = J.SHA384 = $.extend({ _doReset: function () { this._hash = new G.init([new V.init(3418070365, 3238371032), new V.init(1654270250, 914150663), new V.init(2438529370, 812702999), new V.init(355462360, 4144912697), new V.init(1731405415, 4290775857), new V.init(2394180231, 1750603025), new V.init(3675008525, 1694076839), new V.init(1203062813, 3204075428)]) }, _doFinalize: function () { var t = $._doFinalize.call(this); return t.sigBytes -= 16, t } }), q.SHA384 = $._createHelper(Q), q.HmacSHA384 = $._createHmacHelper(Q), bt.lib.Cipher || function () { var t = bt, e = t.lib, r = e.Base, a = e.WordArray, i = e.BufferedBlockAlgorithm, n = t.enc, o = (n.Utf8, n.Base64), s = t.algo.EvpKDF, c = e.Cipher = i.extend({ cfg: r.extend(), createEncryptor: function (t, e) { return this.create(this._ENC_XFORM_MODE, t, e) }, createDecryptor: function (t, e) { return this.create(this._DEC_XFORM_MODE, t, e) }, init: function (t, e, r) { this.cfg = this.cfg.extend(r), this._xformMode = t, this._key = e, this.reset() }, reset: function () { i.reset.call(this), this._doReset() }, process: function (t) { return this._append(t), this._process() }, finalize: function (t) { return t && this._append(t), this._doFinalize() }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function (i) { return { encrypt: function (t, e, r) { return h(e).encrypt(i, t, e, r) }, decrypt: function (t, e, r) { return h(e).decrypt(i, t, e, r) } } } }); function h(t) { return "string" == typeof t ? w : g } e.StreamCipher = c.extend({ _doFinalize: function () { return this._process(!0) }, blockSize: 1 }); var l, f = t.mode = {}, d = e.BlockCipherMode = r.extend({ createEncryptor: function (t, e) { return this.Encryptor.create(t, e) }, createDecryptor: function (t, e) { return this.Decryptor.create(t, e) }, init: function (t, e) { this._cipher = t, this._iv = e } }), u = f.CBC = ((l = d.extend()).Encryptor = l.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize; p.call(this, t, e, i), r.encryptBlock(t, e), this._prevBlock = t.slice(e, e + i) } }), l.Decryptor = l.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize, n = t.slice(e, e + i); r.decryptBlock(t, e), p.call(this, t, e, i), this._prevBlock = n } }), l); function p(t, e, r) { var i, n = this._iv; n ? (i = n, this._iv = void 0) : i = this._prevBlock; for (var o = 0; o < r; o++)t[e + o] ^= i[o] } var _ = (t.pad = {}).Pkcs7 = { pad: function (t, e) { for (var r = 4 * e, i = r - t.sigBytes % r, n = i << 24 | i << 16 | i << 8 | i, o = [], s = 0; s < i; s += 4)o.push(n); var c = a.create(o, i); t.concat(c) }, unpad: function (t) { var e = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= e } }, v = (e.BlockCipher = c.extend({ cfg: c.cfg.extend({ mode: u, padding: _ }), reset: function () { var t; c.reset.call(this); var e = this.cfg, r = e.iv, i = e.mode; this._xformMode == this._ENC_XFORM_MODE ? t = i.createEncryptor : (t = i.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == t ? this._mode.init(this, r && r.words) : (this._mode = t.call(i, this, r && r.words), this._mode.__creator = t) }, _doProcessBlock: function (t, e) { this._mode.processBlock(t, e) }, _doFinalize: function () { var t, e = this.cfg.padding; return this._xformMode == this._ENC_XFORM_MODE ? (e.pad(this._data, this.blockSize), t = this._process(!0)) : (t = this._process(!0), e.unpad(t)), t }, blockSize: 4 }), e.CipherParams = r.extend({ init: function (t) { this.mixIn(t) }, toString: function (t) { return (t || this.formatter).stringify(this) } })), y = (t.format = {}).OpenSSL = { stringify: function (t) { var e = t.ciphertext, r = t.salt; return (r ? a.create([1398893684, 1701076831]).concat(r).concat(e) : e).toString(o) }, parse: function (t) { var e, r = o.parse(t), i = r.words; return 1398893684 == i[0] && 1701076831 == i[1] && (e = a.create(i.slice(2, 4)), i.splice(0, 4), r.sigBytes -= 16), v.create({ ciphertext: r, salt: e }) } }, g = e.SerializableCipher = r.extend({ cfg: r.extend({ format: y }), encrypt: function (t, e, r, i) { i = this.cfg.extend(i); var n = t.createEncryptor(r, i), o = n.finalize(e), s = n.cfg; return v.create({ ciphertext: o, key: r, iv: s.iv, algorithm: t, mode: s.mode, padding: s.padding, blockSize: t.blockSize, formatter: i.format }) }, decrypt: function (t, e, r, i) { return i = this.cfg.extend(i), e = this._parse(e, i.format), t.createDecryptor(r, i).finalize(e.ciphertext) }, _parse: function (t, e) { return "string" == typeof t ? e.parse(t, this) : t } }), B = (t.kdf = {}).OpenSSL = { execute: function (t, e, r, i) { i = i || a.random(8); var n = s.create({ keySize: e + r }).compute(t, i), o = a.create(n.words.slice(e), 4 * r); return n.sigBytes = 4 * e, v.create({ key: n, iv: o, salt: i }) } }, w = e.PasswordBasedCipher = g.extend({ cfg: g.cfg.extend({ kdf: B }), encrypt: function (t, e, r, i) { var n = (i = this.cfg.extend(i)).kdf.execute(r, t.keySize, t.ivSize); i.iv = n.iv; var o = g.encrypt.call(this, t, e, n.key, i); return o.mixIn(n), o }, decrypt: function (t, e, r, i) { i = this.cfg.extend(i), e = this._parse(e, i.format); var n = i.kdf.execute(r, t.keySize, t.ivSize, e.salt); return i.iv = n.iv, g.decrypt.call(this, t, e, n.key, i) } }) }(), bt.mode.CFB = ((Y = bt.lib.BlockCipherMode.extend()).Encryptor = Y.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize; Dt.call(this, t, e, i, r), this._prevBlock = t.slice(e, e + i) } }), Y.Decryptor = Y.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize, n = t.slice(e, e + i); Dt.call(this, t, e, i, r), this._prevBlock = n } }), Y), bt.mode.ECB = ((tt = bt.lib.BlockCipherMode.extend()).Encryptor = tt.extend({ processBlock: function (t, e) { this._cipher.encryptBlock(t, e) } }), tt.Decryptor = tt.extend({ processBlock: function (t, e) { this._cipher.decryptBlock(t, e) } }), tt), bt.pad.AnsiX923 = { pad: function (t, e) { var r = t.sigBytes, i = 4 * e, n = i - r % i, o = r + n - 1; t.clamp(), t.words[o >>> 2] |= n << 24 - o % 4 * 8, t.sigBytes += n }, unpad: function (t) { var e = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= e } }, bt.pad.Iso10126 = { pad: function (t, e) { var r = 4 * e, i = r - t.sigBytes % r; t.concat(bt.lib.WordArray.random(i - 1)).concat(bt.lib.WordArray.create([i << 24], 1)) }, unpad: function (t) { var e = 255 & t.words[t.sigBytes - 1 >>> 2]; t.sigBytes -= e } }, bt.pad.Iso97971 = { pad: function (t, e) { t.concat(bt.lib.WordArray.create([2147483648], 1)), bt.pad.ZeroPadding.pad(t, e) }, unpad: function (t) { bt.pad.ZeroPadding.unpad(t), t.sigBytes-- } }, bt.mode.OFB = (et = bt.lib.BlockCipherMode.extend(), rt = et.Encryptor = et.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize, n = this._iv, o = this._keystream; n && (o = this._keystream = n.slice(0), this._iv = void 0), r.encryptBlock(o, 0); for (var s = 0; s < i; s++)t[e + s] ^= o[s] } }), et.Decryptor = rt, et), bt.pad.NoPadding = { pad: function () { }, unpad: function () { } }, it = bt.lib.CipherParams, nt = bt.enc.Hex, bt.format.Hex = { stringify: function (t) { return t.ciphertext.toString(nt) }, parse: function (t) { var e = nt.parse(t); return it.create({ ciphertext: e }) } }, function () { var t = bt, e = t.lib.BlockCipher, r = t.algo, h = [], l = [], f = [], d = [], u = [], p = [], _ = [], v = [], y = [], g = []; !function () { for (var t = [], e = 0; e < 256; e++)t[e] = e < 128 ? e << 1 : e << 1 ^ 283; var r = 0, i = 0; for (e = 0; e < 256; e++) { var n = i ^ i << 1 ^ i << 2 ^ i << 3 ^ i << 4; n = n >>> 8 ^ 255 & n ^ 99, h[r] = n; var o = t[l[n] = r], s = t[o], c = t[s], a = 257 * t[n] ^ 16843008 * n; f[r] = a << 24 | a >>> 8, d[r] = a << 16 | a >>> 16, u[r] = a << 8 | a >>> 24, p[r] = a; a = 16843009 * c ^ 65537 * s ^ 257 * o ^ 16843008 * r; _[n] = a << 24 | a >>> 8, v[n] = a << 16 | a >>> 16, y[n] = a << 8 | a >>> 24, g[n] = a, r ? (r = o ^ t[t[t[c ^ o]]], i ^= t[t[i]]) : r = i = 1 } }(); var B = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], i = r.AES = e.extend({ _doReset: function () { if (!this._nRounds || this._keyPriorReset !== this._key) { for (var t = this._keyPriorReset = this._key, e = t.words, r = t.sigBytes / 4, i = 4 * (1 + (this._nRounds = 6 + r)), n = this._keySchedule = [], o = 0; o < i; o++)o < r ? n[o] = e[o] : (a = n[o - 1], o % r ? 6 < r && o % r == 4 && (a = h[a >>> 24] << 24 | h[a >>> 16 & 255] << 16 | h[a >>> 8 & 255] << 8 | h[255 & a]) : (a = h[(a = a << 8 | a >>> 24) >>> 24] << 24 | h[a >>> 16 & 255] << 16 | h[a >>> 8 & 255] << 8 | h[255 & a], a ^= B[o / r | 0] << 24), n[o] = n[o - r] ^ a); for (var s = this._invKeySchedule = [], c = 0; c < i; c++) { o = i - c; if (c % 4) var a = n[o]; else a = n[o - 4]; s[c] = c < 4 || o <= 4 ? a : _[h[a >>> 24]] ^ v[h[a >>> 16 & 255]] ^ y[h[a >>> 8 & 255]] ^ g[h[255 & a]] } } }, encryptBlock: function (t, e) { this._doCryptBlock(t, e, this._keySchedule, f, d, u, p, h) }, decryptBlock: function (t, e) { var r = t[e + 1]; t[e + 1] = t[e + 3], t[e + 3] = r, this._doCryptBlock(t, e, this._invKeySchedule, _, v, y, g, l); r = t[e + 1]; t[e + 1] = t[e + 3], t[e + 3] = r }, _doCryptBlock: function (t, e, r, i, n, o, s, c) { for (var a = this._nRounds, h = t[e] ^ r[0], l = t[e + 1] ^ r[1], f = t[e + 2] ^ r[2], d = t[e + 3] ^ r[3], u = 4, p = 1; p < a; p++) { var _ = i[h >>> 24] ^ n[l >>> 16 & 255] ^ o[f >>> 8 & 255] ^ s[255 & d] ^ r[u++], v = i[l >>> 24] ^ n[f >>> 16 & 255] ^ o[d >>> 8 & 255] ^ s[255 & h] ^ r[u++], y = i[f >>> 24] ^ n[d >>> 16 & 255] ^ o[h >>> 8 & 255] ^ s[255 & l] ^ r[u++], g = i[d >>> 24] ^ n[h >>> 16 & 255] ^ o[l >>> 8 & 255] ^ s[255 & f] ^ r[u++]; h = _, l = v, f = y, d = g } _ = (c[h >>> 24] << 24 | c[l >>> 16 & 255] << 16 | c[f >>> 8 & 255] << 8 | c[255 & d]) ^ r[u++], v = (c[l >>> 24] << 24 | c[f >>> 16 & 255] << 16 | c[d >>> 8 & 255] << 8 | c[255 & h]) ^ r[u++], y = (c[f >>> 24] << 24 | c[d >>> 16 & 255] << 16 | c[h >>> 8 & 255] << 8 | c[255 & l]) ^ r[u++], g = (c[d >>> 24] << 24 | c[h >>> 16 & 255] << 16 | c[l >>> 8 & 255] << 8 | c[255 & f]) ^ r[u++]; t[e] = _, t[e + 1] = v, t[e + 2] = y, t[e + 3] = g }, keySize: 8 }); t.AES = e._createHelper(i) }(), function () { var t = bt, e = t.lib, n = e.WordArray, r = e.BlockCipher, i = t.algo, h = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4], l = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32], f = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28], d = [{ 0: 8421888, 268435456: 32768, 536870912: 8421378, 805306368: 2, 1073741824: 512, 1342177280: 8421890, 1610612736: 8389122, 1879048192: 8388608, 2147483648: 514, 2415919104: 8389120, 2684354560: 33280, 2952790016: 8421376, 3221225472: 32770, 3489660928: 8388610, 3758096384: 0, 4026531840: 33282, 134217728: 0, 402653184: 8421890, 671088640: 33282, 939524096: 32768, 1207959552: 8421888, 1476395008: 512, 1744830464: 8421378, 2013265920: 2, 2281701376: 8389120, 2550136832: 33280, 2818572288: 8421376, 3087007744: 8389122, 3355443200: 8388610, 3623878656: 32770, 3892314112: 514, 4160749568: 8388608, 1: 32768, 268435457: 2, 536870913: 8421888, 805306369: 8388608, 1073741825: 8421378, 1342177281: 33280, 1610612737: 512, 1879048193: 8389122, 2147483649: 8421890, 2415919105: 8421376, 2684354561: 8388610, 2952790017: 33282, 3221225473: 514, 3489660929: 8389120, 3758096385: 32770, 4026531841: 0, 134217729: 8421890, 402653185: 8421376, 671088641: 8388608, 939524097: 512, 1207959553: 32768, 1476395009: 8388610, 1744830465: 2, 2013265921: 33282, 2281701377: 32770, 2550136833: 8389122, 2818572289: 514, 3087007745: 8421888, 3355443201: 8389120, 3623878657: 0, 3892314113: 33280, 4160749569: 8421378 }, { 0: 1074282512, 16777216: 16384, 33554432: 524288, 50331648: 1074266128, 67108864: 1073741840, 83886080: 1074282496, 100663296: 1073758208, 117440512: 16, 134217728: 540672, 150994944: 1073758224, 167772160: 1073741824, 184549376: 540688, 201326592: 524304, 218103808: 0, 234881024: 16400, 251658240: 1074266112, 8388608: 1073758208, 25165824: 540688, 41943040: 16, 58720256: 1073758224, 75497472: 1074282512, 92274688: 1073741824, 109051904: 524288, 125829120: 1074266128, 142606336: 524304, 159383552: 0, 176160768: 16384, 192937984: 1074266112, 209715200: 1073741840, 226492416: 540672, 243269632: 1074282496, 260046848: 16400, 268435456: 0, 285212672: 1074266128, 301989888: 1073758224, 318767104: 1074282496, 335544320: 1074266112, 352321536: 16, 369098752: 540688, 385875968: 16384, 402653184: 16400, 419430400: 524288, 436207616: 524304, 452984832: 1073741840, 469762048: 540672, 486539264: 1073758208, 503316480: 1073741824, 520093696: 1074282512, 276824064: 540688, 293601280: 524288, 310378496: 1074266112, 327155712: 16384, 343932928: 1073758208, 360710144: 1074282512, 377487360: 16, 394264576: 1073741824, 411041792: 1074282496, 427819008: 1073741840, 444596224: 1073758224, 461373440: 524304, 478150656: 0, 494927872: 16400, 511705088: 1074266128, 528482304: 540672 }, { 0: 260, 1048576: 0, 2097152: 67109120, 3145728: 65796, 4194304: 65540, 5242880: 67108868, 6291456: 67174660, 7340032: 67174400, 8388608: 67108864, 9437184: 67174656, 10485760: 65792, 11534336: 67174404, 12582912: 67109124, 13631488: 65536, 14680064: 4, 15728640: 256, 524288: 67174656, 1572864: 67174404, 2621440: 0, 3670016: 67109120, 4718592: 67108868, 5767168: 65536, 6815744: 65540, 7864320: 260, 8912896: 4, 9961472: 256, 11010048: 67174400, 12058624: 65796, 13107200: 65792, 14155776: 67109124, 15204352: 67174660, 16252928: 67108864, 16777216: 67174656, 17825792: 65540, 18874368: 65536, 19922944: 67109120, 20971520: 256, 22020096: 67174660, 23068672: 67108868, 24117248: 0, 25165824: 67109124, 26214400: 67108864, 27262976: 4, 28311552: 65792, 29360128: 67174400, 30408704: 260, 31457280: 65796, 32505856: 67174404, 17301504: 67108864, 18350080: 260, 19398656: 67174656, 20447232: 0, 21495808: 65540, 22544384: 67109120, 23592960: 256, 24641536: 67174404, 25690112: 65536, 26738688: 67174660, 27787264: 65796, 28835840: 67108868, 29884416: 67109124, 30932992: 67174400, 31981568: 4, 33030144: 65792 }, { 0: 2151682048, 65536: 2147487808, 131072: 4198464, 196608: 2151677952, 262144: 0, 327680: 4198400, 393216: 2147483712, 458752: 4194368, 524288: 2147483648, 589824: 4194304, 655360: 64, 720896: 2147487744, 786432: 2151678016, 851968: 4160, 917504: 4096, 983040: 2151682112, 32768: 2147487808, 98304: 64, 163840: 2151678016, 229376: 2147487744, 294912: 4198400, 360448: 2151682112, 425984: 0, 491520: 2151677952, 557056: 4096, 622592: 2151682048, 688128: 4194304, 753664: 4160, 819200: 2147483648, 884736: 4194368, 950272: 4198464, 1015808: 2147483712, 1048576: 4194368, 1114112: 4198400, 1179648: 2147483712, 1245184: 0, 1310720: 4160, 1376256: 2151678016, 1441792: 2151682048, 1507328: 2147487808, 1572864: 2151682112, 1638400: 2147483648, 1703936: 2151677952, 1769472: 4198464, 1835008: 2147487744, 1900544: 4194304, 1966080: 64, 2031616: 4096, 1081344: 2151677952, 1146880: 2151682112, 1212416: 0, 1277952: 4198400, 1343488: 4194368, 1409024: 2147483648, 1474560: 2147487808, 1540096: 64, 1605632: 2147483712, 1671168: 4096, 1736704: 2147487744, 1802240: 2151678016, 1867776: 4160, 1933312: 2151682048, 1998848: 4194304, 2064384: 4198464 }, { 0: 128, 4096: 17039360, 8192: 262144, 12288: 536870912, 16384: 537133184, 20480: 16777344, 24576: 553648256, 28672: 262272, 32768: 16777216, 36864: 537133056, 40960: 536871040, 45056: 553910400, 49152: 553910272, 53248: 0, 57344: 17039488, 61440: 553648128, 2048: 17039488, 6144: 553648256, 10240: 128, 14336: 17039360, 18432: 262144, 22528: 537133184, 26624: 553910272, 30720: 536870912, 34816: 537133056, 38912: 0, 43008: 553910400, 47104: 16777344, 51200: 536871040, 55296: 553648128, 59392: 16777216, 63488: 262272, 65536: 262144, 69632: 128, 73728: 536870912, 77824: 553648256, 81920: 16777344, 86016: 553910272, 90112: 537133184, 94208: 16777216, 98304: 553910400, 102400: 553648128, 106496: 17039360, 110592: 537133056, 114688: 262272, 118784: 536871040, 122880: 0, 126976: 17039488, 67584: 553648256, 71680: 16777216, 75776: 17039360, 79872: 537133184, 83968: 536870912, 88064: 17039488, 92160: 128, 96256: 553910272, 100352: 262272, 104448: 553910400, 108544: 0, 112640: 553648128, 116736: 16777344, 120832: 262144, 124928: 537133056, 129024: 536871040 }, { 0: 268435464, 256: 8192, 512: 270532608, 768: 270540808, 1024: 268443648, 1280: 2097152, 1536: 2097160, 1792: 268435456, 2048: 0, 2304: 268443656, 2560: 2105344, 2816: 8, 3072: 270532616, 3328: 2105352, 3584: 8200, 3840: 270540800, 128: 270532608, 384: 270540808, 640: 8, 896: 2097152, 1152: 2105352, 1408: 268435464, 1664: 268443648, 1920: 8200, 2176: 2097160, 2432: 8192, 2688: 268443656, 2944: 270532616, 3200: 0, 3456: 270540800, 3712: 2105344, 3968: 268435456, 4096: 268443648, 4352: 270532616, 4608: 270540808, 4864: 8200, 5120: 2097152, 5376: 268435456, 5632: 268435464, 5888: 2105344, 6144: 2105352, 6400: 0, 6656: 8, 6912: 270532608, 7168: 8192, 7424: 268443656, 7680: 270540800, 7936: 2097160, 4224: 8, 4480: 2105344, 4736: 2097152, 4992: 268435464, 5248: 268443648, 5504: 8200, 5760: 270540808, 6016: 270532608, 6272: 270540800, 6528: 270532616, 6784: 8192, 7040: 2105352, 7296: 2097160, 7552: 0, 7808: 268435456, 8064: 268443656 }, { 0: 1048576, 16: 33555457, 32: 1024, 48: 1049601, 64: 34604033, 80: 0, 96: 1, 112: 34603009, 128: 33555456, 144: 1048577, 160: 33554433, 176: 34604032, 192: 34603008, 208: 1025, 224: 1049600, 240: 33554432, 8: 34603009, 24: 0, 40: 33555457, 56: 34604032, 72: 1048576, 88: 33554433, 104: 33554432, 120: 1025, 136: 1049601, 152: 33555456, 168: 34603008, 184: 1048577, 200: 1024, 216: 34604033, 232: 1, 248: 1049600, 256: 33554432, 272: 1048576, 288: 33555457, 304: 34603009, 320: 1048577, 336: 33555456, 352: 34604032, 368: 1049601, 384: 1025, 400: 34604033, 416: 1049600, 432: 1, 448: 0, 464: 34603008, 480: 33554433, 496: 1024, 264: 1049600, 280: 33555457, 296: 34603009, 312: 1, 328: 33554432, 344: 1048576, 360: 1025, 376: 34604032, 392: 33554433, 408: 34603008, 424: 0, 440: 34604033, 456: 1049601, 472: 1024, 488: 33555456, 504: 1048577 }, { 0: 134219808, 1: 131072, 2: 134217728, 3: 32, 4: 131104, 5: 134350880, 6: 134350848, 7: 2048, 8: 134348800, 9: 134219776, 10: 133120, 11: 134348832, 12: 2080, 13: 0, 14: 134217760, 15: 133152, 2147483648: 2048, 2147483649: 134350880, 2147483650: 134219808, 2147483651: 134217728, 2147483652: 134348800, 2147483653: 133120, 2147483654: 133152, 2147483655: 32, 2147483656: 134217760, 2147483657: 2080, 2147483658: 131104, 2147483659: 134350848, 2147483660: 0, 2147483661: 134348832, 2147483662: 134219776, 2147483663: 131072, 16: 133152, 17: 134350848, 18: 32, 19: 2048, 20: 134219776, 21: 134217760, 22: 134348832, 23: 131072, 24: 0, 25: 131104, 26: 134348800, 27: 134219808, 28: 134350880, 29: 133120, 30: 2080, 31: 134217728, 2147483664: 131072, 2147483665: 2048, 2147483666: 134348832, 2147483667: 133152, 2147483668: 32, 2147483669: 134348800, 2147483670: 134217728, 2147483671: 134219808, 2147483672: 134350880, 2147483673: 134217760, 2147483674: 134219776, 2147483675: 0, 2147483676: 133120, 2147483677: 2080, 2147483678: 131104, 2147483679: 134350848 }], u = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679], o = i.DES = r.extend({ _doReset: function () { for (var t = this._key.words, e = [], r = 0; r < 56; r++) { var i = h[r] - 1; e[r] = t[i >>> 5] >>> 31 - i % 32 & 1 } for (var n = this._subKeys = [], o = 0; o < 16; o++) { var s = n[o] = [], c = f[o]; for (r = 0; r < 24; r++)s[r / 6 | 0] |= e[(l[r] - 1 + c) % 28] << 31 - r % 6, s[4 + (r / 6 | 0)] |= e[28 + (l[r + 24] - 1 + c) % 28] << 31 - r % 6; s[0] = s[0] << 1 | s[0] >>> 31; for (r = 1; r < 7; r++)s[r] = s[r] >>> 4 * (r - 1) + 3; s[7] = s[7] << 5 | s[7] >>> 27 } var a = this._invSubKeys = []; for (r = 0; r < 16; r++)a[r] = n[15 - r] }, encryptBlock: function (t, e) { this._doCryptBlock(t, e, this._subKeys) }, decryptBlock: function (t, e) { this._doCryptBlock(t, e, this._invSubKeys) }, _doCryptBlock: function (t, e, r) { this._lBlock = t[e], this._rBlock = t[e + 1], p.call(this, 4, 252645135), p.call(this, 16, 65535), _.call(this, 2, 858993459), _.call(this, 8, 16711935), p.call(this, 1, 1431655765); for (var i = 0; i < 16; i++) { for (var n = r[i], o = this._lBlock, s = this._rBlock, c = 0, a = 0; a < 8; a++)c |= d[a][((s ^ n[a]) & u[a]) >>> 0]; this._lBlock = s, this._rBlock = o ^ c } var h = this._lBlock; this._lBlock = this._rBlock, this._rBlock = h, p.call(this, 1, 1431655765), _.call(this, 8, 16711935), _.call(this, 2, 858993459), p.call(this, 16, 65535), p.call(this, 4, 252645135), t[e] = this._lBlock, t[e + 1] = this._rBlock }, keySize: 2, ivSize: 2, blockSize: 2 }); function p(t, e) { var r = (this._lBlock >>> t ^ this._rBlock) & e; this._rBlock ^= r, this._lBlock ^= r << t } function _(t, e) { var r = (this._rBlock >>> t ^ this._lBlock) & e; this._lBlock ^= r, this._rBlock ^= r << t } t.DES = r._createHelper(o); var s = i.TripleDES = r.extend({ _doReset: function () { var t = this._key.words; if (2 !== t.length && 4 !== t.length && t.length < 6) throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192."); var e = t.slice(0, 2), r = t.length < 4 ? t.slice(0, 2) : t.slice(2, 4), i = t.length < 6 ? t.slice(0, 2) : t.slice(4, 6); this._des1 = o.createEncryptor(n.create(e)), this._des2 = o.createEncryptor(n.create(r)), this._des3 = o.createEncryptor(n.create(i)) }, encryptBlock: function (t, e) { this._des1.encryptBlock(t, e), this._des2.decryptBlock(t, e), this._des3.encryptBlock(t, e) }, decryptBlock: function (t, e) { this._des3.decryptBlock(t, e), this._des2.encryptBlock(t, e), this._des1.decryptBlock(t, e) }, keySize: 6, ivSize: 2, blockSize: 2 }); t.TripleDES = r._createHelper(s) }(), function () { var t = bt, e = t.lib.StreamCipher, r = t.algo, i = r.RC4 = e.extend({ _doReset: function () { for (var t = this._key, e = t.words, r = t.sigBytes, i = this._S = [], n = 0; n < 256; n++)i[n] = n; n = 0; for (var o = 0; n < 256; n++) { var s = n % r, c = e[s >>> 2] >>> 24 - s % 4 * 8 & 255; o = (o + i[n] + c) % 256; var a = i[n]; i[n] = i[o], i[o] = a } this._i = this._j = 0 }, _doProcessBlock: function (t, e) { t[e] ^= n.call(this) }, keySize: 8, ivSize: 0 }); function n() { for (var t = this._S, e = this._i, r = this._j, i = 0, n = 0; n < 4; n++) { r = (r + t[e = (e + 1) % 256]) % 256; var o = t[e]; t[e] = t[r], t[r] = o, i |= t[(t[e] + t[r]) % 256] << 24 - 8 * n } return this._i = e, this._j = r, i } t.RC4 = e._createHelper(i); var o = r.RC4Drop = i.extend({ cfg: i.cfg.extend({ drop: 192 }), _doReset: function () { i._doReset.call(this); for (var t = this.cfg.drop; 0 < t; t--)n.call(this) } }); t.RC4Drop = e._createHelper(o) }(), bt.mode.CTRGladman = (ot = bt.lib.BlockCipherMode.extend(), st = ot.Encryptor = ot.extend({ processBlock: function (t, e) { var r, i = this._cipher, n = i.blockSize, o = this._iv, s = this._counter; o && (s = this._counter = o.slice(0), this._iv = void 0), 0 === ((r = s)[0] = Et(r[0])) && (r[1] = Et(r[1])); var c = s.slice(0); i.encryptBlock(c, 0); for (var a = 0; a < n; a++)t[e + a] ^= c[a] } }), ot.Decryptor = st, ot), at = (ct = bt).lib.StreamCipher, ht = ct.algo, lt = [], ft = [], dt = [], ut = ht.Rabbit = at.extend({ _doReset: function () { for (var t = this._key.words, e = this.cfg.iv, r = 0; r < 4; r++)t[r] = 16711935 & (t[r] << 8 | t[r] >>> 24) | 4278255360 & (t[r] << 24 | t[r] >>> 8); var i = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], n = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]]; for (r = this._b = 0; r < 4; r++)Rt.call(this); for (r = 0; r < 8; r++)n[r] ^= i[r + 4 & 7]; if (e) { var o = e.words, s = o[0], c = o[1], a = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), h = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8), l = a >>> 16 | 4294901760 & h, f = h << 16 | 65535 & a; n[0] ^= a, n[1] ^= l, n[2] ^= h, n[3] ^= f, n[4] ^= a, n[5] ^= l, n[6] ^= h, n[7] ^= f; for (r = 0; r < 4; r++)Rt.call(this) } }, _doProcessBlock: function (t, e) { var r = this._X; Rt.call(this), lt[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, lt[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, lt[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, lt[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16; for (var i = 0; i < 4; i++)lt[i] = 16711935 & (lt[i] << 8 | lt[i] >>> 24) | 4278255360 & (lt[i] << 24 | lt[i] >>> 8), t[e + i] ^= lt[i] }, blockSize: 4, ivSize: 2 }), ct.Rabbit = at._createHelper(ut), bt.mode.CTR = (pt = bt.lib.BlockCipherMode.extend(), _t = pt.Encryptor = pt.extend({ processBlock: function (t, e) { var r = this._cipher, i = r.blockSize, n = this._iv, o = this._counter; n && (o = this._counter = n.slice(0), this._iv = void 0); var s = o.slice(0); r.encryptBlock(s, 0), o[i - 1] = o[i - 1] + 1 | 0; for (var c = 0; c < i; c++)t[e + c] ^= s[c] } }), pt.Decryptor = _t, pt), yt = (vt = bt).lib.StreamCipher, gt = vt.algo, Bt = [], wt = [], kt = [], St = gt.RabbitLegacy = yt.extend({ _doReset: function () { for (var t = this._key.words, e = this.cfg.iv, r = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], i = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]], n = this._b = 0; n < 4; n++)Mt.call(this); for (n = 0; n < 8; n++)i[n] ^= r[n + 4 & 7]; if (e) { var o = e.words, s = o[0], c = o[1], a = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), h = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8), l = a >>> 16 | 4294901760 & h, f = h << 16 | 65535 & a; i[0] ^= a, i[1] ^= l, i[2] ^= h, i[3] ^= f, i[4] ^= a, i[5] ^= l, i[6] ^= h, i[7] ^= f; for (n = 0; n < 4; n++)Mt.call(this) } }, _doProcessBlock: function (t, e) { var r = this._X; Mt.call(this), Bt[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, Bt[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, Bt[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, Bt[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16; for (var i = 0; i < 4; i++)Bt[i] = 16711935 & (Bt[i] << 8 | Bt[i] >>> 24) | 4278255360 & (Bt[i] << 24 | Bt[i] >>> 8), t[e + i] ^= Bt[i] }, blockSize: 4, ivSize: 2 }), vt.RabbitLegacy = yt._createHelper(St), bt.pad.ZeroPadding = { pad: function (t, e) { var r = 4 * e; t.clamp(), t.sigBytes += r - (t.sigBytes % r || r) }, unpad: function (t) { var e = t.words, r = t.sigBytes - 1; for (r = t.sigBytes - 1; 0 <= r; r--)if (e[r >>> 2] >>> 24 - r % 4 * 8 & 255) { t.sigBytes = r + 1; break } } }, bt });

const $ = new Env('京东资产统计');
const notify = $.isNode() ? require('./sendNotify') : '';
const JXUserAgent = $.isNode() ? (process.env.JX_USER_AGENT ? process.env.JX_USER_AGENT : ``) : ``;
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let NowHour = new Date().getHours();
let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle="";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify="";
let strSubNotify="";
let llPetError=false;
let strGuoqi="";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【极速金币】京东极速版->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【京东赚赚】微信->京东赚赚小程序->底部赚好礼->提现无门槛红包(京东使用)\n';
RemainMessage += '【京东秒杀】京东->首页京东秒杀->点立即签到->可兑换无门槛红包(京东使用)\n';
RemainMessage += '【东东萌宠】京东->我的->东东萌宠,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【领现金】京东->搜玩一玩>领现金(可微信提现或兑换红包)\n';
RemainMessage += '【东东农场】京东->我的->东东农场,完成可兑换无门槛红包,可用于的任意商品\n';
RemainMessage += '【京喜工厂】京喜->我的->京喜工厂,完成是指定商品红包(不兑换会过期)\n';
RemainMessage += '【京东金融】京东金融app->我的->养猪猪,完成是白条支付券,支付方式选白条支付时立减.\n';
RemainMessage += '【其他】京喜红包只能在京喜使用,京东红包有可能在京喜用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror=false;

let doExJxBeans ="false";
let time = new Date().getHours();
if ($.isNode()) {
	if (process.env.WP_APP_TOKEN_ONE) {		
		WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
	}
	if(process.env.BEANCHANGE_ExJxBeans=="true"){
		if (time >= 17){ 
			console.log(`检测到设定了临期京豆转换喜豆...`);
			doExJxBeans = process.env.BEANCHANGE_ExJxBeans;
		} else{
			console.log(`检测到设定了临期京豆转换喜豆,但时间未到17点后，暂不执行转换...`);
		}
	}
}
//if(WP_APP_TOKEN_ONE)
	//console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
//else
	//console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);
		
if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
	intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
	console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
	MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
	MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
	MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
	//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {	
	strSubNotify=process.env.BEANCHANGE_SUBNOTIFY;
	strSubNotify+="\n";
	console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);	
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {	
	strAllNotify=process.env.BEANCHANGE_ALLNOTIFY;
	console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
	strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n"+strAllNotify;
	console.log(strAllNotify+"\n");
	strAllNotify +="\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
	llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;


let decExBean=0;

if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
		console.log = () => {};
} else {
	cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex=-1;
if ($.isNode()) {	
	strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//喜豆查询
let EnableJxBeans=true;
DisableIndex=strDisableList.findIndex((item) => item === "喜豆查询");
if(DisableIndex!=-1){
	console.log("检测到设定关闭喜豆查询");
	EnableJxBeans=false
}
	
//汪汪乐园
let EnableJoyPark=true;
DisableIndex = strDisableList.findIndex((item) => item === "汪汪乐园");
if(DisableIndex!=-1){
	console.log("检测到设定关闭汪汪乐园查询");
	EnableJoyPark=false
}

//京东赚赚
let EnableJdZZ=true;
DisableIndex = strDisableList.findIndex((item) => item === "京东赚赚");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京东赚赚查询");
	EnableJdZZ=false;
}

//京东秒杀
let EnableJdMs=true;
DisableIndex = strDisableList.findIndex((item) => item === "京东秒杀");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京东秒杀查询");
	EnableJdMs=false;	
}
	
//东东农场
let EnableJdFruit=true;
DisableIndex = strDisableList.findIndex((item) => item === "东东农场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东农场查询");
	EnableJdFruit=false;	
}

//极速金币
let EnableJdSpeed=true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if(DisableIndex!=-1){
	console.log("检测到设定关闭极速金币查询");
	EnableJdSpeed=false;	
}

//京喜牧场
let EnableJxMC=true;
DisableIndex= strDisableList.findIndex((item) => item === "京喜牧场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京喜牧场查询");
	EnableJxMC=false;	
}
//京喜工厂
let EnableJxGC=true;
DisableIndex=strDisableList.findIndex((item) => item === "京喜工厂");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京喜工厂查询");
	EnableJxGC=false;	
}

// 京东工厂
let EnableJDGC=true;
DisableIndex=strDisableList.findIndex((item) => item === "京东工厂");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京东工厂查询");
	EnableJDGC=false;	
}
//领现金
let EnableCash=true;
DisableIndex=strDisableList.findIndex((item) => item === "领现金");
if(DisableIndex!=-1){
	console.log("检测到设定关闭领现金查询");
	EnableCash=false;	
}	

//金融养猪
let EnablePigPet=true;
DisableIndex=strDisableList.findIndex((item) => item === "金融养猪");
if(DisableIndex!=-1){
	console.log("检测到设定关闭金融养猪查询");
	EnablePigPet=false;	
}
//东东萌宠
let EnableJDPet=true;
DisableIndex=strDisableList.findIndex((item) => item === "东东萌宠");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东萌宠查询");
	EnableJDPet=false
}

//7天过期京豆
let EnableOverBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "过期京豆");
if(DisableIndex!=-1){
	console.log("检测到设定关闭过期京豆查询");
	EnableOverBean=false
}

//查优惠券
let EnableChaQuan=true;
DisableIndex=strDisableList.findIndex((item) => item === "查优惠券");
if(DisableIndex!=-1){
	console.log("检测到设定关闭优惠券查询");
	EnableChaQuan=false
}

DisableIndex=strDisableList.findIndex((item) => item === "活动攻略");
if(DisableIndex!=-1){
	console.log("检测到设定关闭活动攻略显示");
	RemainMessage="";
}

	
!(async() => {
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
			"open-url": "https://bean.m.jd.com/bean/signIndex.action"
		});
		return;
	}
	for (i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
			$.index = i + 1;
			$.beanCount = 0;
			$.incomeBean = 0;
			$.expenseBean = 0;
			$.todayIncomeBean = 0;
			$.todayOutcomeBean = 0;
			$.errorMsg = '';
			$.isLogin = true;
			$.nickName = '';
			$.levelName = '';
			$.message = '';
			$.balance = 0;
			$.expiredBalance = 0;
			$.JdzzNum = 0;
			$.JdMsScore = 0;
			$.JdFarmProdName = '';
			$.JdtreeEnergy = 0;
			$.JdtreeTotalEnergy = 0;
			$.treeState = 0;
			$.JdwaterTotalT = 0;
			$.JdwaterD = 0;
			$.JDwaterEveryDayT = 0;
			$.JDtotalcash = 0;
			$.JDEggcnt = 0;
			$.Jxmctoken = '';
			$.DdFactoryReceive = '';
			$.jxFactoryInfo = '';
			$.jxFactoryReceive = '';
			$.jdCash = 0;
			$.isPlusVip = 0;
			$.JingXiang = "";
			$.allincomeBean = 0; //月收入
			$.allexpenseBean = 0; //月支出
			$.joylevel = 0;	
			$.beanChangeXi=0;
			$.inJxBean=0;
			$.OutJxBean=0;
			$.todayinJxBean=0;
			$.todayOutJxBean=0;	
			$.xibeanCount = 0;
			$.PigPet = '';
			$.YunFeiTitle="";
			$.YunFeiQuan = 0;
			$.YunFeiQuanEndTime = "";
			$.YunFeiTitle2="";
			$.YunFeiQuan2 = 0;
			$.YunFeiQuanEndTime2 = "";
			TempBaipiao = "";
			strGuoqi="";
			console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);

			await Promise.all([
		        TotalBean(),
		        TotalBean2()])
				
			if (!$.isLogin) {
				await isLoginByX1a0He();
			}
			if (!$.isLogin) {
				$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
					"open-url": "https://bean.m.jd.com/bean/signIndex.action"
				});

				if ($.isNode()) {
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
				}
				continue
			}
			
			await Promise.all([
		         getJoyBaseInfo(), //汪汪乐园
		         getJdZZ(), //京东赚赚
		         getMs(), //京东秒杀
		         getjdfruitinfo(), //东东农场
		         cash(), //极速金币
		         jdJxMCinfo(), //京喜牧场
		         bean(), //京豆查询
		         getJxFactory(), //京喜工厂
		         getDdFactoryInfo(), // 京东工厂
		         jdCash(), //领现金
		         GetJxBeaninfo(), //喜豆查询
		         GetPigPetInfo() //金融养猪
		     ])
			
			await showMsg();
			if (intPerSent > 0) {
				if ((i + 1) % intPerSent == 0) {
					console.log("分段通知条件达成，处理发送通知....");
					if ($.isNode() && allMessage) {
						var TempMessage=allMessage;
						if(strAllNotify)
							allMessage=strAllNotify+`\n`+allMessage;

						await notify.sendNotify(`${$.name}`, `${allMessage}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						}, undefined,TempMessage)
					}
					if ($.isNode() && allMessageMonth) {
						await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						})
					}
					allMessage = "";
					allMessageMonth = "";
				}

			}
		}
	}
	//组1通知
	if (ReceiveMessageGp4) {
		allMessage2Gp4 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp4;
	}
	if (WarnMessageGp4) {
		if (allMessage2Gp4) {
			allMessage2Gp4 = `\n` + allMessage2Gp4;
		}
		allMessage2Gp4 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
	}

	//组2通知
	if (ReceiveMessageGp2) {
		allMessage2Gp2 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp2;
	}
	if (WarnMessageGp2) {
		if (allMessage2Gp2) {
			allMessage2Gp2 = `\n` + allMessage2Gp2;
		}
		allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
	}

	//组3通知
	if (ReceiveMessageGp3) {
		allMessage2Gp3 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp3;
	}
	if (WarnMessageGp3) {
		if (allMessage2Gp3) {
			allMessage2Gp3 = `\n` + allMessage2Gp3;
		}
		allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
	}

	//其他通知
	if (allReceiveMessage) {
		allMessage2 = `【⏰商品白嫖清单⏰】\n` + allReceiveMessage;
	}
	if (allWarnMessage) {
		if (allMessage2) {
			allMessage2 = `\n` + allMessage2;
		}
		allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
	}

	if (intPerSent > 0) {
		//console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
		if (allMessage || allMessageMonth) {
			console.log("分段通知收尾，处理发送通知....");
			if ($.isNode() && allMessage) {
				var TempMessage=allMessage;
				if(strAllNotify)
					allMessage=strAllNotify+`\n`+allMessage;
				
				await notify.sendNotify(`${$.name}`, `${allMessage}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				}, undefined,TempMessage)
			}
			if ($.isNode() && allMessageMonth) {
				await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				})
			}
		}
	} else {

		if ($.isNode() && allMessageGp2) {
			var TempMessage=allMessageGp2;
			if(strAllNotify)
				allMessageGp2=strAllNotify+`\n`+allMessageGp2;
			await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp3) {
			var TempMessage=allMessageGp3;
			if(strAllNotify)
				allMessageGp3=strAllNotify+`\n`+allMessageGp3;
			await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp4) {
			var TempMessage=allMessageGp4;
			if(strAllNotify)
				allMessageGp4=strAllNotify+`\n`+allMessageGp4;
			await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessage) {
			var TempMessage=allMessage;
			if(strAllNotify)
				allMessage=strAllNotify+`\n`+allMessage;
			
			await notify.sendNotify(`${$.name}`, `${allMessage}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}

		if ($.isNode() && allMessageMonthGp2) {
			await notify.sendNotify(`京东月资产统计#2`, `${allMessageMonthGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp3) {
			await notify.sendNotify(`京东月资产统计#3`, `${allMessageMonthGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp4) {
			await notify.sendNotify(`京东月资产统计#4`, `${allMessageMonthGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonth) {
			await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
	}

	if ($.isNode() && allMessage2Gp2) {
		allMessage2Gp2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#2", `${allMessage2Gp2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp3) {
		allMessage2Gp3 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#3", `${allMessage2Gp3}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp4) {
		allMessage2Gp4 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#4", `${allMessage2Gp4}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2) {
		allMessage2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒", `${allMessage2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}

})()
.catch((e) => {
	$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
	$.done();
})
async function showMsg() {
	//if ($.errorMsg)
	//return
	ReturnMessageTitle="";
	ReturnMessage = "";
	var strsummary="";
	if (MessageUserGp2) {
		userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp3) {
		userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp4) {
		userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
	}
	
	if (userIndex2 != -1) {
		IndexGp2 += 1;
		ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}\n`;
	}
	if (userIndex3 != -1) {
		IndexGp3 += 1;
		ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}\n`;
	}
	if (userIndex4 != -1) {
		IndexGp4 += 1;
		ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}\n`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		IndexAll += 1;
		ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}\n`;
	}

	if ($.levelName || $.JingXiang){
		ReturnMessage += `【账号信息】`;
		if ($.levelName) {
			if ($.levelName.length > 2)
				$.levelName = $.levelName.substring(0, 2);

			if ($.levelName == "注册")
				$.levelName = `😊普通`;

			if ($.levelName == "钻石")
				$.levelName = `💎钻石`;

			if ($.levelName == "金牌")
				$.levelName = `🥇金牌`;

			if ($.levelName == "银牌")
				$.levelName = `🥈银牌`;

			if ($.levelName == "铜牌")
				$.levelName = `🥉铜牌`;

			if ($.isPlusVip == 1)
				ReturnMessage += `${$.levelName}Plus`;
			else
				ReturnMessage += `${$.levelName}会员`;
		}

		if ($.JingXiang){
			if ($.levelName) {
				ReturnMessage +=",";
			}
			ReturnMessage += `${$.JingXiang}`;
		}
		ReturnMessage +=`\n`;
	}
	if (llShowMonth) {
		ReturnMessageMonth = ReturnMessage;
		ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
		ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

		console.log(ReturnMessageMonth);

		if (userIndex2 != -1) {
			allMessageMonthGp2 += ReturnMessageMonth + `\n`;
		}
		if (userIndex3 != -1) {
			allMessageMonthGp3 += ReturnMessageMonth + `\n`;
		}
		if (userIndex4 != -1) {
			allMessageMonthGp4 += ReturnMessageMonth + `\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allMessageMonth += ReturnMessageMonth + `\n`;
		}
		if ($.isNode() && WP_APP_TOKEN_ONE) {
			await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
		}

	}

	ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
	strsummary+= `【今日京豆】收${$.todayIncomeBean}豆`;
	if ($.todayOutcomeBean != 0) {
		ReturnMessage += `,支${$.todayOutcomeBean}豆`;
		strsummary += `,支${$.todayOutcomeBean}豆`;
	}
	ReturnMessage += `\n`;
	strsummary+= `\n`;
	ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;
	
	if ($.expenseBean != 0) {
		ReturnMessage += `,支${$.expenseBean}豆`;		
	}
	ReturnMessage += `\n`;	
	
	if ($.beanCount){		
		ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		strsummary+= `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;	
	} else {
		if($.levelName || $.JingXiang)
			ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
		else{
			ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
			strsummary += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		}			
	}
	
	if (EnableJxBeans) {
		ReturnMessage += `【今日喜豆】收${$.todayinJxBean}豆`;		
		if ($.todayOutJxBean != 0) {
			ReturnMessage += `,支${$.todayOutJxBean}豆`;			
		}
		ReturnMessage += `\n`;		
		ReturnMessage += `【昨日喜豆】收${$.inJxBean}豆`;		
		if ($.OutJxBean != 0) {
			ReturnMessage += `,支${$.OutJxBean}豆`;			
		}
		ReturnMessage += `\n`;		
		ReturnMessage += `【当前喜豆】${$.xibeanCount}喜豆(≈${($.xibeanCount/ 100).toFixed(2)}元)\n`;
		strsummary += `【当前喜豆】${$.xibeanCount}喜豆(≈${($.xibeanCount/ 100).toFixed(2)}元)\n`;
	}


	if ($.JDEggcnt) {		
		ReturnMessage += `【京喜牧场】${$.JDEggcnt}枚鸡蛋\n`;
	}
	if ($.JDtotalcash) {
		ReturnMessage += `【极速金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
	}
	if ($.JdzzNum) {
		ReturnMessage += `【京东赚赚】${$.JdzzNum}币(≈${($.JdzzNum / 10000).toFixed(2)}元)\n`;
	}
	if ($.JdMsScore != 0) {
		ReturnMessage += `【京东秒杀】${$.JdMsScore}币(≈${($.JdMsScore / 1000).toFixed(2)}元)\n`;
	}

	if ($.joylevel || $.jdCash) {
		ReturnMessage += `【其他信息】`;
		if ($.joylevel) {
			ReturnMessage += `汪汪:${$.joylevel}级`;
			if ($.jdCash) {
				ReturnMessage += ",";
			}
		}
		if ($.jdCash) {
			ReturnMessage += `领现金:${$.jdCash}元`;
		}

		ReturnMessage += `\n`;

	}

	if ($.JdFarmProdName != "") {
		if ($.JdtreeEnergy != 0) {
			if ($.treeState === 2 || $.treeState === 3) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				TempBaipiao += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				if (userIndex2 != -1) {
					ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
			} else {
				if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
				} else {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

				}
			}
		} else {
			if ($.treeState === 0) {
				TempBaipiao += `【东东农场】水果领取后未重新种植!\n`;

				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}

			} else if ($.treeState === 1) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName}种植中...\n`;
			} else {
				TempBaipiao += `【东东农场】状态异常!\n`;
				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				//ReturnMessage += `【东东农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
			}
		}
	}
	if ($.jxFactoryInfo) {
		ReturnMessage += `【京喜工厂】${$.jxFactoryInfo}\n`
	}
	if ($.ddFactoryInfo) {
		ReturnMessage += `【东东工厂】${$.ddFactoryInfo}\n`
	}
	if ($.DdFactoryReceive) {
		if (userIndex2 != -1) {
			ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.DdFactoryReceive} (东东工厂)\n`;
		}
		if (userIndex3 != -1) {
			ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.DdFactoryReceive} (东东工厂)\n`;
		}
		if (userIndex4 != -1) {
			ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.DdFactoryReceive} (东东工厂)\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.DdFactoryReceive} (东东工厂)\n`;
		}
		TempBaipiao += `【东东工厂】${$.ddFactoryInfo} 可以兑换了!\n`;
	}
	if ($.jxFactoryReceive) {
		if (userIndex2 != -1) {
			ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.jxFactoryReceive} (京喜工厂)\n`;
		}
		if (userIndex3 != -1) {
			ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.jxFactoryReceive} (京喜工厂)\n`;
		}
		if (userIndex4 != -1) {
			ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.jxFactoryReceive} (京喜工厂)\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.jxFactoryReceive} (京喜工厂)\n`;
		}

		TempBaipiao += `【京喜工厂】${$.jxFactoryReceive} 可以兑换了!\n`;

	}
	
	if ($.PigPet) {
		if (userIndex2 != -1) {
			ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.PigPet} (金融养猪)\n`;
		}
		if (userIndex3 != -1) {
			ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.PigPet} (金融养猪)\n`;
		}
		if (userIndex4 != -1) {
			ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.PigPet} (金融养猪)\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.PigPet} (金融养猪)\n`;
		}

		TempBaipiao += `【金融养猪】${$.PigPet} 可以兑换了!\n`;

	}
	if(EnableJDPet){
		llPetError=false;
		var response ="";
		response = await PetRequest('energyCollect');
		if(llPetError)
			response = await PetRequest('energyCollect');
		
		llPetError=false;
		var initPetTownRes = "";
		initPetTownRes = await PetRequest('initPetTown');
		if(llPetError)
			initPetTownRes = await PetRequest('initPetTown');
		
		if(!llPetError && initPetTownRes){
			if (initPetTownRes.code === '0' && initPetTownRes.resultCode === '0' && initPetTownRes.message === 'success') {
				$.petInfo = initPetTownRes.result;
				if ($.petInfo.userStatus === 0) {
					ReturnMessage += `【东东萌宠】活动未开启!\n`;
				} else if ($.petInfo.petStatus === 5) {
					ReturnMessage += `【东东萌宠】${$.petInfo.goodsInfo.goodsName}已可领取!\n`;
					TempBaipiao += `【东东萌宠】${$.petInfo.goodsInfo.goodsName}已可领取!\n`;
					if (userIndex2 != -1) {
						ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.petInfo.goodsInfo.goodsName}可以兑换了! (东东萌宠)\n`;
					}
					if (userIndex3 != -1) {
						ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.petInfo.goodsInfo.goodsName}可以兑换了! (东东萌宠)\n`;
					}
					if (userIndex4 != -1) {
						ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.petInfo.goodsInfo.goodsName}可以兑换了! (东东萌宠)\n`;
					}
					if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
						allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.petInfo.goodsInfo.goodsName}可以兑换了! (东东萌宠)\n`;
					}
				} else if ($.petInfo.petStatus === 6) {
					TempBaipiao += `【东东萌宠】未选择物品! \n`;
					if (userIndex2 != -1) {
						WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】未选择物品! (东东萌宠)\n`;
					}
					if (userIndex3 != -1) {
						WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】未选择物品! (东东萌宠)\n`;
					}
					if (userIndex4 != -1) {
						WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】未选择物品! (东东萌宠)\n`;
					}
					if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
						allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】未选择物品! (东东萌宠)\n`;
					}
				} else if (response.resultCode === '0') {
					ReturnMessage += `【东东萌宠】${$.petInfo.goodsInfo.goodsName}`;
					ReturnMessage += `(${(response.result.medalPercent).toFixed(0)}%,${response.result.medalNum}/${response.result.medalNum+response.result.needCollectMedalNum}块)\n`;
				} else if (!$.petInfo.goodsInfo) {
					ReturnMessage += `【东东萌宠】暂未选购新的商品!\n`;
					TempBaipiao += `【东东萌宠】暂未选购新的商品! \n`;
					if (userIndex2 != -1) {
						WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】暂未选购新的商品! (东东萌宠)\n`;
					}
					if (userIndex3 != -1) {
						WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】暂未选购新的商品! (东东萌宠)\n`;
					}
					if (userIndex4 != -1) {
						WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】暂未选购新的商品! (东东萌宠)\n`;
					}
					if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
						allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】暂未选购新的商品! (东东萌宠)\n`;
					}

				}
			}
		}
	}
	
	if(strGuoqi){		
		ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
		ReturnMessage += `${strGuoqi}`;
	}
	ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
	ReturnMessage += `${$.message}`;
	strsummary +=`${$.message}`;
	
	if($.YunFeiQuan){
		var strTempYF="【免运费券】"+$.YunFeiQuan+"张";
		if($.YunFeiQuanEndTime)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime+")";
		strTempYF+="\n";
		ReturnMessage +=strTempYF
		strsummary +=strTempYF;
	}
	if($.YunFeiQuan2){
		var strTempYF2="【免运费券】"+$.YunFeiQuan2+"张";
		if($.YunFeiQuanEndTime2)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime2+")";
		strTempYF2+="\n";
		ReturnMessage +=strTempYF2
		strsummary +=strTempYF2;
	}
	
	if (userIndex2 != -1) {
		allMessageGp2 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex3 != -1) {
		allMessageGp3 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex4 != -1) {
		allMessageGp4 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		allMessage += ReturnMessageTitle+ReturnMessage + `\n================================\n`;
	}

	console.log(`${ReturnMessageTitle+ReturnMessage}`);

	if ($.isNode() && WP_APP_TOKEN_ONE) {
		var strTitle="京东资产统计";
		ReturnMessage=`【账号名称】${$.nickName || $.UserName}\n`+ReturnMessage;
		
		if (TempBaipiao) {
			strsummary=strSubNotify+TempBaipiao +strsummary;			
			TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
			ReturnMessage = TempBaipiao + `\n` + ReturnMessage;			
		} else {
			strsummary = strSubNotify + strsummary;				
		}
		
		ReturnMessage += RemainMessage;
		
		if(strAllNotify)
			ReturnMessage=strAllNotify+`\n`+ReturnMessage;
		
		await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`,undefined,strsummary);
	}

	//$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {
	// console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
	// console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
	// 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

	//前一天的0:0:0时间戳
	const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
	// 今天0:0:0时间戳
	const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
	let page = 1,
	t = 0,
	yesterdayArr = [],
	todayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(page);
		await $.wait(1000);
		// console.log(`第${page}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			page++;
			let detailList = response.detailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes('扣赠'))) {
						todayArr.push(item);
					} else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes('扣赠'))) {
						//昨日的
						yesterdayArr.push(item);
					} else if (tm > new Date(date).getTime()) {
						//前天的
						t = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				t = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			t = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			t = 1;
		}
	} while (t === 0);
	for (let item of yesterdayArr) {
		if (Number(item.amount) > 0) {
			$.incomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.expenseBean += Number(item.amount);
		}
	}
	for (let item of todayArr) {
		if (Number(item.amount) > 0) {
			$.todayIncomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.todayOutcomeBean += Number(item.amount);
		}
	}
	$.todayOutcomeBean = -$.todayOutcomeBean;
	$.expenseBean = -$.expenseBean;
	
	decExBean =0;
	if (EnableOverBean) {
	    await queryexpirejingdou(); //过期京豆
	    if (decExBean && doExJxBeans == "true") {
	        var jxbeans = await exchangejxbeans(decExBean);
	        if (jxbeans) {
	            $.beanChangeXi = decExBean;
	            console.log(`已为您将` + decExBean + `临期京豆转换成喜豆！`);
	            strGuoqi += `已为您将` + decExBean + `临期京豆转换成喜豆！\n`;
	        }
	    }
	}
	await redPacket();
	if (EnableChaQuan)
	    await getCoupon();
}

async function Monthbean() {
	let time = new Date();
	let year = time.getFullYear();
	let month = parseInt(time.getMonth()); //取上个月
	if (month == 0) {
		//一月份，取去年12月，所以月份=12，年份减1
		month = 12;
		year -= 1;
	}

	//开始时间 时间戳
	let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
	console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

	//结束时间 时间戳
	if (month == 12) {
		//取去年12月，进1个月，所以月份=1，年份加1
		month = 1;
		year += 1;
	}
	let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
	console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

	let allpage = 1,
	allt = 0,
	allyesterdayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(allpage);
		await $.wait(1000);
		// console.log(`第${allpage}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			allpage++;
			let detailList = response.detailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
						//日期区间内的京豆记录
						allyesterdayArr.push(item);
					} else if (start > new Date(date).getTime()) {
						//前天的
						allt = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				allt = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			allt = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			allt = 1;
		}
	} while (allt === 0);

	for (let item of allyesterdayArr) {
		if (Number(item.amount) > 0) {
			$.allincomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.allexpenseBean += Number(item.amount);
		}
	}

}

async function jdJxMCinfo(){
    if (EnableJxMC) {
        llgeterror = false;
        await requestAlgo();
        if (llgeterror) {
            console.log(`等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await requestAlgo();
        }
        await JxmcGetRequest();
    }
	return;
}

async function jdCash() {
	if (!EnableCash)
		return;
	let functionId = "cash_homePage";
	/* let body = {};	  
	console.log(`正在获取领现金任务签名...`);
	isSignError = false;
	let sign = await getSign(functionId, body);
		if (isSignError) {
			console.log(`领现金任务签名获取失败,等待2秒后再次尝试...`)
			await $.wait(2 * 1000);
			isSignError = false;
			sign =await getSign(functionId, body);
		}
		if (isSignError) {
			console.log(`领现金任务签名获取失败,等待2秒后再次尝试...`)
			await $.wait(2 * 1000);
			isSignError = false;
			sign = await getSign(functionId, body);
		}
		if (!isSignError) {
			console.log(`领现金任务签名获取成功...`)
		} else {
			console.log(`领现金任务签名获取失败...`)
			$.jdCash = 0;
			return
		} */
		let sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
		return new Promise((resolve) => {
			$.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`jdCash API请求失败，请检查网路重试`)
					} else {
						if (safeGet(data)) {
							data = JSON.parse(data);
							if (data.code === 0 && data.data.result) {
								$.jdCash = data.data.result.totalMoney || 0;								
								return
							}
						}
					}
				} catch (e) {
					$.logErr(e, resp)
				}
				finally {
					resolve(data);
				}
			})
		})
}
function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}
function getSign(functionId, body) {
  return new Promise(async resolve => {
    let data = {
      functionId,
      body: JSON.stringify(body),
      "client":"apple",
      "clientVersion":"10.3.0"
    }
    let HostArr = ['jdsign.cf', 'signer.nz.lu']
    let Host = HostArr[Math.floor((Math.random() * HostArr.length))]
    let options = {
      url: `https://cdn.nz.lu/ddo`,
      body: JSON.stringify(data),
      headers: {
        Host,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      },
      timeout: 30 * 1000
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err))
          console.log(`${$.name} getSign API请求失败，请检查网路重试`)
        } else {

        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function TotalBean() {
	return new Promise(async resolve => {
		const options = {
			url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
			headers: {
				Cookie: cookie,
				"User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err)
				} else {
					if (data) {
						data = JSON.parse(data);

						if (data['retcode'] === "1001") {
							$.isLogin = false; //cookie过期
							return;
						}
						if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
							$.nickName = data.data.userInfo.baseInfo.nickname;
							$.levelName = data.data.userInfo.baseInfo.levelName;
							$.isPlusVip = data.data.userInfo.isPlusVip;

						}
						if (data['retcode'] === '0' && data.data && data.data['assetInfo']) {
							if ($.beanCount == 0)
								$.beanCount = data.data && data.data['assetInfo']['beanNum'];
						} else {
							$.errorMsg = `数据异常`;
						}
					} else {
						$.log('京东服务器返回空数据,将无法获取等级及VIP信息');
					}
				}
			} catch (e) {
				$.logErr(e)
			}
			finally {
				resolve();
			}
		})
	})
}
function TotalBean2() {
	return new Promise(async(resolve) => {
		const options = {
			url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
			headers: {
				Cookie: cookie,
				'content-type': `application/x-www-form-urlencoded`,
				Connection: `keep-alive`,
				'Accept-Encoding': `gzip,compress,br,deflate`,
				Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
				Host: `wxapp.m.jd.com`,
				'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
			},
			timeout: 10000
		};
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err);
				} else {
					if (data) {						
						data = JSON.parse(data);						
						if (!data.user) {
							return;
						}
						const userInfo = data.user;						
						if (userInfo) {
							if (!$.nickName)
								$.nickName = userInfo.petName;
							if ($.beanCount == 0) {
								$.beanCount = userInfo.jingBean;
							}
							$.JingXiang = userInfo.uclass;
						}
					} else {
						$.log('京东服务器返回空数据');
					}
				}
			} catch (e) {
				$.logErr(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function isLoginByX1a0He() {
	return new Promise((resolve) => {
		const options = {
			url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
			headers: {
				"Cookie": cookie,
				"referer": "https://h5.m.jd.com/",
				"User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (data) {
					data = JSON.parse(data);
					if (data.islogin === "1") {
						console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
					} else if (data.islogin === "0") {
						$.isLogin = false;
						console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
					} else {
						console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
						$.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
					}
				}
			} catch (e) {
				console.log(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function getJingBeanBalanceDetail(page) {
	return new Promise(async resolve => {
		const options = {
			"url": `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
			"body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
			"headers": {
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				'Host': 'api.m.jd.com',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Cookie': cookie,
			}
		}
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						// console.log(data)
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}
function queryexpirejingdou() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=${Date.now()}&g_login_type=1&sceneval=2`,
			"headers": {
				"Accept": "*/*",
				"Accept-Encoding": "gzip, deflate, br",
				"Accept-Language": "zh-cn",
				"Connection": "keep-alive",
				"Cookie": cookie,
				"Host": "wq.jd.com",
				"Referer": "https://wqs.jd.com/promote/201801/bean/mybean.html",
				"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1"
			}
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`queryexpirejingdou API请求失败，请检查网路重试`)
				} else {
					if (data) {
						// console.log(data)
						data = JSON.parse(data.slice(23, -13));
						if (data.ret === 0) {							
							data['expirejingdou'].map(item => {
								if(item['expireamount']!=0){																	
									strGuoqi+=`【${timeFormat(item['time'] * 1000)}】过期${item['expireamount']}豆\n`;
									if (decExBean==0)
										decExBean=item['expireamount'];
								}
							})							
						}
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}
function exchangejxbeans(o) {
    return new Promise(async resolve => {
		var UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');		
		var JXUA = `jdpingou;iPhone;4.13.0;14.4.2;${UUID};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`;
        const options = {
            "url": `https://m.jingxi.com/deal/masset/jd2xd?use=${o}&canpintuan=&setdefcoupon=0&r=${Math.random()}&sceneval=2`,
            "headers": {
                "Host": "m.jingxi.com",
                "Accept": "*/*",
                "Cookie": cookie,
                "Connection": "keep-alive",
                "User-Agent": JXUA,
                "Accept-Language": "zh-cn",
                "Referer": "https://m.jingxi.com/deal/confirmorder/main",
                "Accept-Encoding": "gzip, deflate, br",
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(err);
                } else {
                    data = JSON.parse(data);
                    if (data && data.data && JSON.stringify(data.data) === '{}') {
                        console.log(JSON.stringify(data))
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
function getUUID(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", t = 0) {
    return x.replace(/[xy]/g, function (x) {
        var r = 16 * Math.random() | 0,
        n = "x" == x ? r : 3 & r | 8;
        return uuid = t ? n.toString(36).toUpperCase() : n.toString(36),
        uuid
    })
}

function redPacket() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://m.jingxi.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=1&_=${+new Date()}&sceneval=2&g_login_type=1&g_ty=ls`,
			"headers": {
				'Host': 'm.jingxi.com',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'Accept-Language': 'zh-cn',
				'Referer': 'https://st.jingxi.com/my/redpacket.shtml?newPg=App&jxsid=16156262265849285961',
				'Accept-Encoding': 'gzip, deflate, br',
				"Cookie": cookie,
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
			}
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`redPacket API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data).data;
						$.jxRed = 0,
						$.jsRed = 0,
						$.jdRed = 0,
						$.jdhRed = 0,
						$.jxRedExpire = 0,
						$.jsRedExpire = 0,
						$.jdRedExpire = 0,
						$.jdhRedExpire = 0;
						let t = new Date();
						t.setDate(t.getDate() + 1);
						t.setHours(0, 0, 0, 0);
						t = parseInt((t - 1) / 1000);
						for (let vo of data.useRedInfo.redList || []) {
							if (vo.orgLimitStr && vo.orgLimitStr.includes("京喜")) {
								$.jxRed += parseFloat(vo.balance)
								if (vo['endTime'] === t) {
									$.jxRedExpire += parseFloat(vo.balance)
								}
							} else if (vo.activityName.includes("极速版")) {
								$.jsRed += parseFloat(vo.balance)
								if (vo['endTime'] === t) {
									$.jsRedExpire += parseFloat(vo.balance)
								}
							} else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
								$.jdhRed += parseFloat(vo.balance)
								if (vo['endTime'] === t) {
									$.jdhRedExpire += parseFloat(vo.balance)
								}
							} else {
								$.jdRed += parseFloat(vo.balance)
								if (vo['endTime'] === t) {
									$.jdRedExpire += parseFloat(vo.balance)
								}
							}
						}
						$.jxRed = $.jxRed.toFixed(2);
						$.jsRed = $.jsRed.toFixed(2);
						$.jdRed = $.jdRed.toFixed(2);
						$.jdhRed = $.jdhRed.toFixed(2);
						$.balance = data.balance;
						$.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire).toFixed(2);
						$.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
						if ($.jxRed > 0)
							$.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
						if ($.jsRed > 0)
							$.message += `【极速红包】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元 \n`;
						if ($.jdRed > 0)
							$.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
						if ($.jdhRed > 0)
							$.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function getCoupon() {
    return new Promise(resolve => {
        let options = {
            url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
            headers: {
                'authority': 'wq.jd.com',
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'accept': '*/*',
                'referer': 'https://wqs.jd.com/',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cookie': cookie
            },
			timeout: 10000
        }
        $.get(options, async(err, resp, data) => {
            try {
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
				$.platFormInfo="";
                for (let i = 0; i < useable.length; i++) {
					//console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota < 20 && useable[i].coupontype === 1) {                           
							//$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
							if (useable[i].platFormInfo) 
								$.platFormInfo = useable[i].platFormInfo;
							
							var decquota=parseFloat(useable[i].quota).toFixed(2);
							var decdisc= parseFloat(useable[i].discount).toFixed(2);
							
							$.message += `【全品类券】满${decquota}减${decdisc}元`;
							
							if (useable[i].endTime < $.todayEndTime) {
								$.message += `(今日过期,${$.platFormInfo})\n`;
							} else if (useable[i].endTime < $.tomorrowEndTime) {
								$.message += `(明日将过期,${$.platFormInfo})\n`;
							} else {
								$.message += `(${$.platFormInfo})\n`;
							}
							
                        }
                    }
					if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
					    if (!$.YunFeiTitle) {
					        $.YunFeiTitle = useable[i].couponTitle;
					        $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					        $.YunFeiQuan += 1;
					    } else {
					        if ($.YunFeiTitle == useable[i].couponTitle) {
					            $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					            $.YunFeiQuan += 1;
					        } else {
					            if (!$.YunFeiTitle2)
					                $.YunFeiTitle2 = useable[i].couponTitle;
								
					            if ($.YunFeiTitle2 == useable[i].couponTitle) {
					                $.YunFeiQuanEndTime2 = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					                $.YunFeiQuan2 += 1;
					            }
					        }

					    }

					}
                    /* if (useable[i].couponTitle.indexOf('极速版APP活动') > -1) {						
                        $.couponEndTime = useable[i].endTime;
                        $.startIndex = useable[i].couponTitle.indexOf('-') - 3;
                        $.endIndex = useable[i].couponTitle.indexOf('元') + 1;
                        $.couponName = useable[i].couponTitle.substring($.startIndex, $.endIndex);

                        if ($.couponEndTime < $.todayEndTime) {
                            $.message += `【极速版券】${$.couponName}(今日过期)\n`;
                        } else if ($.couponEndTime < $.tomorrowEndTime) {
                            $.message += `【极速版券】${$.couponName}(明日将过期)\n`;
                        } else {
                            $.couponEndTime = timeFormat(parseInt($.couponEndTime));
                            $.message += `【极速版券】${$.couponName}(有效期至${$.couponEndTime})\n`;
                        }

                    } */
                    //8是支付券， 7是白条券
                    if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                            continue;
                        }
                        
                        if (useable[i].couponStyle == 8) {
                            $.couponType = "支付立减";
                        }else{
							$.couponType = "白条优惠";
						}
						if(useable[i].discount<useable[i].quota)
							$.message += `【${$.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
						else
							$.message += `【${$.couponType}】立减${useable[i].discount}元`;
                        if (useable[i].platFormInfo) 
                            $.platFormInfo = useable[i].platFormInfo;                            
                        
                        //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
						
                        if (useable[i].endTime < $.todayEndTime) {
                            $.message += `(今日过期,${$.platFormInfo})\n`;
                        } else if (useable[i].endTime < $.tomorrowEndTime) {
                            $.message += `(明日将过期,${$.platFormInfo})\n`;
                        } else {
                            $.message += `(${$.platFormInfo})\n`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function getJdZZ() {
	if (!EnableJdZZ)
		return;
	return new Promise(resolve => {
		$.get(taskJDZZUrl("interactTaskIndex"), async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`);
					console.log(`京东赚赚API请求失败，请检查网路重试`);
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);						
						$.JdzzNum = data.data.totalNum;
					}
				}
			} catch (e) {
				//$.logErr(e, resp)
				console.log(`京东赚赚数据获取失败`);
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskJDZZUrl(functionId, body = {}) {
	return {
		url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=9.1.0`,
		headers: {
			'Cookie': cookie,
			'Host': 'api.m.jd.com',
			'Connection': 'keep-alive',
			'Content-Type': 'application/json',
			'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
			'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
			'Accept-Language': 'zh-cn',
			'Accept-Encoding': 'gzip, deflate, br',
		},
		timeout: 10000
	}
}

function getMs() {
	if (!EnableJdMs)
		return;
	return new Promise(resolve => {
		$.post(taskMsPostUrl('homePageV2', {}, 'appid=SecKill2020'), (err, resp, data) => {
			try {
				if (err) {
					console.log(`${err},${jsonParse(resp.body)['message']}`)
					console.log(`getMs API请求失败，请检查网路重试`)
				} else {
					if (safeGet(data)) {
						//console.log("Debug :" + JSON.stringify(data));
						data = JSON.parse(data);						
						if (data.result.assignment.assignmentPoints) {
							$.JdMsScore = data.result.assignment.assignmentPoints || 0
						}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskMsPostUrl(function_id, body = {}, extra = '', function_id2) {
	let url = `${JD_API_HOST}`;
	if (function_id2) {
		url += `?functionId=${function_id2}`;
	}
	return {
		url,
		body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&${extra}`,
		headers: {
			"Cookie": cookie,
			"origin": "https://h5.m.jd.com",
			"referer": "https://h5.m.jd.com/babelDiy/Zeus/2NUvze9e1uWf4amBhe1AV6ynmSuH/index.html",
			'Content-Type': 'application/x-www-form-urlencoded',
			"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
		},
		timeout: 10000
	}
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
	return new Promise(resolve => {
		setTimeout(() => {
			$.get(taskfruitUrl(function_id, body), (err, resp, data) => {
				try {
					if (err) {
						console.log('\n东东农场: API查询请求失败 ‼️‼️')
						console.log(JSON.stringify(err));
						console.log(`function_id:${function_id}`)
						$.logErr(err);
					} else {
						if (safeGet(data)) {
							data = JSON.parse(data);
							$.JDwaterEveryDayT = data.totalWaterTaskInit.totalWaterTaskTimes;
						}
					}
				} catch (e) {
					$.logErr(e, resp);
				}
				finally {
					resolve(data);
				}
			})
		}, timeout)
	})
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        await jdfruitRequest('taskInitForFarm', {
            "version": 14,
            "channel": 1,
            "babelChannel": "120"
        });

        await getjdfruit();
        if (llgeterror) {
            console.log(`东东农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await getjdfruit();
        }
        if (llgeterror) {
            console.log(`东东农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
	return;
}

async function GetJxBeaninfo() {
    await GetJxBean(),
    await jxbean();
	return;
}

async function getjdfruit() {
	return new Promise(resolve => {
		const option = {
			url: `${JD_API_HOST}?functionId=initForFarm`,
			body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
			headers: {
				"accept": "*/*",
				"accept-encoding": "gzip, deflate, br",
				"accept-language": "zh-CN,zh;q=0.9",
				"cache-control": "no-cache",
				"cookie": cookie,
				"origin": "https://home.m.jd.com",
				"pragma": "no-cache",
				"referer": "https://home.m.jd.com/myJd/newhome.action",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			timeout: 10000
		};
		$.post(option, (err, resp, data) => {
			try {
				if (err) {
					if(!llgeterror){
						console.log('\n东东农场: API查询请求失败 ‼️‼️');
						console.log(JSON.stringify(err));
					}
					llgeterror = true;
				} else {
					llgeterror = false;
					if (safeGet(data)) {
						$.farmInfo = JSON.parse(data)
							if ($.farmInfo.farmUserPro) {
								$.JdFarmProdName = $.farmInfo.farmUserPro.name;
								$.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
								$.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
								$.treeState = $.farmInfo.treeState;
								let waterEveryDayT = $.JDwaterEveryDayT;
								let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10; //一共还需浇多少次水
								let waterD = Math.ceil(waterTotalT / waterEveryDayT);

								$.JdwaterTotalT = waterTotalT;
								$.JdwaterD = waterD;
							}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

async function PetRequest(function_id, body = {}) {
	await $.wait(3000);
	return new Promise((resolve, reject) => {
		$.post(taskPetUrl(function_id, body), (err, resp, data) => {
			try {
				if (err) {
					llPetError=true;
					console.log('\n东东萌宠: API查询请求失败 ‼️‼️');
					console.log(JSON.stringify(err));
					$.logErr(err);
				} else {
					data = JSON.parse(data);
				}
			} catch (e) {
				$.logErr(e, resp);
			}
			finally {
				resolve(data)
			}
		})
	})
}
function taskPetUrl(function_id, body = {}) {
	body["version"] = 2;
	body["channel"] = 'app';
	return {
		url: `${JD_API_HOST}?functionId=${function_id}`,
		body: `body=${escape(JSON.stringify(body))}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
		headers: {
			'Cookie': cookie,
			'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
			'Host': 'api.m.jd.com',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		timeout: 10000
	};
}

function taskfruitUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Origin": "https://carry.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://carry.m.jd.com/",
      "Cookie": cookie
    },
    timeout: 10000
  }
}

function safeGet(data) {
	try {
		if (typeof JSON.parse(data) == "object") {
			return true;
		}
	} catch (e) {
		console.log(e);
		console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
		return false;
	}
}

function cash() {
	if (!EnableJdSpeed)
		return;
	return new Promise(resolve => {
		$.get(taskcashUrl('MyAssetsService.execute', {
				"method": "userCashRecord",
				"data": {
					"channel": 1,
					"pageNum": 1,
					"pageSize": 20
				}
			}),
			async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`cash API请求失败，请检查网路重试`)
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.goldBalance)
							$.JDtotalcash = data.data.goldBalance;
						else
							console.log(`领现金查询失败，服务器没有返回具体值.`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

var __Oxb24bc = ["lite-android&", "stringify", "&android&3.1.0&", "&", "&846c4c32dae910ef", "12aea658f76e453faf803d15c40a72e0", "isNode", "crypto-js", "", "api?functionId=", "&body=", "&appid=lite-android&client=android&uuid=846c4c32dae910ef&clientVersion=3.1.0&t=", "&sign=", "api.m.jd.com", "*/*", "RN", "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)", "zh-Hans-CN;q=1, ja-CN;q=0.9", "undefined", "log", "", "", "", "", "jsjia", "mi.com"];

function taskcashUrl(_0x7683x2, _0x7683x3 = {}) {
	let _0x7683x4 = +new Date();
	let _0x7683x5 = `${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;
	let _0x7683x6 = __Oxb24bc[0x5];
	const _0x7683x7 = $[__Oxb24bc[0x6]]() ? require(__Oxb24bc[0x7]) : CryptoJS;
	let _0x7683x8 = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
	return {
		url: `${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,
		headers: {
			'Host': __Oxb24bc[0xd],
			'accept': __Oxb24bc[0xe],
			'kernelplatform': __Oxb24bc[0xf],
			'user-agent': __Oxb24bc[0x10],
			'accept-language': __Oxb24bc[0x11],
			'Cookie': cookie
		},
		timeout: 10000
	}
}
(function (_0x7683x9, _0x7683xa, _0x7683xb, _0x7683xc, _0x7683xd, _0x7683xe) {
	_0x7683xe = __Oxb24bc[0x12];
	_0x7683xc = function (_0x7683xf) {
		if (typeof alert !== _0x7683xe) {
			alert(_0x7683xf)
		};
		if (typeof console !== _0x7683xe) {
			console[__Oxb24bc[0x13]](_0x7683xf)
		}
	};
	_0x7683xb = function (_0x7683x7, _0x7683x9) {
		return _0x7683x7 + _0x7683x9
	};
	_0x7683xd = _0x7683xb(__Oxb24bc[0x14], _0x7683xb(_0x7683xb(__Oxb24bc[0x15], __Oxb24bc[0x16]), __Oxb24bc[0x17]));
	try {
		_0x7683x9 = __encode;
		if (!(typeof _0x7683x9 !== _0x7683xe && _0x7683x9 === _0x7683xb(__Oxb24bc[0x18], __Oxb24bc[0x19]))) {
			_0x7683xc(_0x7683xd)
		}
	} catch (e) {
		_0x7683xc(_0x7683xd)
	}
})({})

async function JxmcGetRequest() {
	let url = ``;
	let myRequest = ``;
	url = `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=7&sceneid=1001&activeid=null&activekey=null&isgift=1&isquerypicksite=1&_stk=channel%2Csceneid&_ste=1`;
	url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
	myRequest = getGetRequest(`GetHomePageInfo`, url);

	return new Promise(async resolve => {
		$.get(myRequest, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`JxmcGetRequest API请求失败，请检查网路重试`)
					$.runFlag = false;
					console.log(`请求失败`)
				} else {
					data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
					if (data.ret === 0) {
						$.JDEggcnt = data.data.eggcnt;
					}
				}
			} catch (e) {
				console.log(data);
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

// 惊喜工厂信息查询
async function getJxFactory() {
	if (!EnableJxGC)
		return;
	return new Promise(async resolve => {
		let infoMsg = "";
		let strTemp = "";
		await $.get(jxTaskurl('userinfo/GetUserInfo', `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&source=`, '_time,materialTuanId,materialTuanPin,pin,sharePin,shareType,source,zone'), async(err, resp, data) => {
			try {
				if (err) {
					$.jxFactoryInfo = "";
					//console.log("jx工厂查询失败"  + err)
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data['ret'] === 0) {
							data = data['data'];
							$.unActive = true; //标记是否开启了京喜活动或者选购了商品进行生产
							if (data.factoryList && data.productionList) {
								const production = data.productionList[0];
								const factory = data.factoryList[0];
								//const productionStage = data.productionStage;
								$.commodityDimId = production.commodityDimId;
								// subTitle = data.user.pin;
								await GetCommodityDetails(); //获取已选购的商品信息
								infoMsg = `${$.jxProductName}(${((production.investedElectric / production.needElectric) * 100).toFixed(0)}%`;
								if (production.investedElectric >= production.needElectric) {
									if (production['exchangeStatus'] === 1) {
										infoMsg = `${$.jxProductName}已可兑换`;
										$.jxFactoryReceive = `${$.jxProductName}`;
									}
									if (production['exchangeStatus'] === 3) {
										if (new Date().getHours() === 9) {
											infoMsg = `兑换超时，请重选商品!`;
										}
									}
									// await exchangeProNotify()
								} else {
									strTemp = `,${((production.needElectric - production.investedElectric) / (2 * 60 * 60 * 24)).toFixed(0)}天)`;
									if (strTemp == ",0天)")
										infoMsg += ",今天)";
									else
										infoMsg += strTemp;
								}
								if (production.status === 3) {
									infoMsg = "商品已失效，请重选商品!";
								}
							} else {
								$.unActive = false; //标记是否开启了京喜活动或者选购了商品进行生产
								if (!data.factoryList) {
									infoMsg = ""
										// $.msg($.name, '【提示】', `京东账号${$.index}[${$.nickName}]京喜工厂活动未开始\n请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动`);
								} else if (data.factoryList && !data.productionList) {
									infoMsg = ""
								}
							}
						}
					} else {
						console.log(`GetUserInfo异常：${JSON.stringify(data)}`)
					}
				}
				$.jxFactoryInfo = infoMsg;
				// console.log(infoMsg);
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

// 惊喜的Taskurl
function jxTaskurl(functionId, body = '', stk) {
	let url = `https://m.jingxi.com/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now() + 2}&_ste=1`
		url += `&h5st=${decrypt(Date.now(), stk, '', url)}`
		if (stk) {
			url += `&_stk=${encodeURIComponent(stk)}`;
		}
		return {
		url,
		headers: {
			'Cookie': cookie,
			'Host': 'm.jingxi.com',
			'Accept': '*/*',
			'Connection': 'keep-alive',
			'User-Agent': functionId === 'AssistFriend' ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36" : 'jdpingou',
			'Accept-Language': 'zh-cn',
			'Referer': 'https://wqsd.jd.com/pingou/dream_factory/index.html',
			'Accept-Encoding': 'gzip, deflate, br',
		},
		timeout: 10000
	}
}

//惊喜查询当前生产的商品名称
function GetCommodityDetails() {
	return new Promise(async resolve => {
		// const url = `/dreamfactory/diminfo/GetCommodityDetails?zone=dream_factory&sceneval=2&g_login_type=1&commodityId=${$.commodityDimId}`;
		$.get(jxTaskurl('diminfo/GetCommodityDetails', `commodityId=${$.commodityDimId}`, `_time,commodityId,zone`), (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`GetCommodityDetails API请求失败，请检查网路重试`)
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data['ret'] === 0) {
							data = data['data'];
							$.jxProductName = data['commodityList'][0].name;
						} else {
							console.log(`GetCommodityDetails异常：${JSON.stringify(data)}`)
						}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

// 东东工厂信息查询
async function getDdFactoryInfo() {
	if (!EnableJDGC)
		return;
	// 当心仪的商品存在，并且收集起来的电量满足当前商品所需，就投入
	let infoMsg = "";
	return new Promise(resolve => {
		$.post(ddFactoryTaskUrl('jdfactory_getHomeData'), async(err, resp, data) => {
			try {
				if (err) {
					$.ddFactoryInfo = "获取失败!"
						/*console.log(`${JSON.stringify(err)}`)
						console.log(`${$.name} API请求失败，请检查网路重试`)*/
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.bizCode === 0) {
							// $.newUser = data.data.result.newUser;
							//let wantProduct = $.isNode() ? (process.env.FACTORAY_WANTPRODUCT_NAME ? process.env.FACTORAY_WANTPRODUCT_NAME : wantProduct) : ($.getdata('FACTORAY_WANTPRODUCT_NAME') ? $.getdata('FACTORAY_WANTPRODUCT_NAME') : wantProduct);
							if (data.data.result.factoryInfo) {
								let {
									totalScore,
									useScore,
									produceScore,
									remainScore,
									couponCount,
									name
								} = data.data.result.factoryInfo;
								if (couponCount == 0) {
									infoMsg = `${name} 没货了,死了这条心吧!`
								} else {
									infoMsg = `${name}(${((remainScore * 1 + useScore * 1) / (totalScore * 1)* 100).toFixed(0)}%,剩${couponCount})`
								}
								if (((remainScore * 1 + useScore * 1) >= totalScore * 1 + 100000) && (couponCount * 1 > 0)) {
									// await jdfactory_addEnergy();
									infoMsg = `${name} 可以兑换了!`
										$.DdFactoryReceive = `${name}`;

								}

							} else {
								infoMsg = ``
							}
						} else {
							$.ddFactoryInfo = ""
						}
					}
				}
				$.ddFactoryInfo = infoMsg;
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

function ddFactoryTaskUrl(function_id, body = {}, function_id2) {
	let url = `${JD_API_HOST}`;
	if (function_id2) {
		url += `?functionId=${function_id2}`;
	}
	return {
		url,
		body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.1.0`,
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Accept-Encoding": "gzip, deflate, br",
			"Accept-Language": "zh-cn",
			"Connection": "keep-alive",
			"Content-Type": "application/x-www-form-urlencoded",
			"Cookie": cookie,
			"Host": "api.m.jd.com",
			"Origin": "https://h5.m.jd.com",
			"Referer": "https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html",
			"User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		},
		timeout: 10000
	}
}

async function getJoyBaseInfo(taskId = '', inviteType = '', inviterPin = '') {
	if (!EnableJoyPark)
		return;
	return new Promise(resolve => {
		$.post(taskPostClientActionUrl(`body={"taskId":"${taskId}","inviteType":"${inviteType}","inviterPin":"${inviterPin}","linkId":"LsQNxL7iWDlXUs6cFl-AAg"}&appid=activities_platform`), async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`汪汪乐园 API请求失败，请检查网路重试`)
				} else {
					data = JSON.parse(data);
					if (data.success) {
						$.joylevel = data.data.level;
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}
function taskPostClientActionUrl(body) {
	return {
		url: `https://api.m.jd.com/client.action?functionId=joyBaseInfo`,
		body: body,
		headers: {
			'User-Agent': $.user_agent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'api.m.jd.com',
			'Origin': 'https://joypark.jd.com',
			'Referer': 'https://joypark.jd.com/?activityId=LsQNxL7iWDlXUs6cFl-AAg&lng=113.387899&lat=22.512678&sid=4d76080a9da10fbb31f5cd43396ed6cw&un_area=19_1657_52093_0',
			'Cookie': cookie,
		},
		timeout: 10000
	}
}

function taskJxUrl(functionId, body = '') {
    let url = ``;
    var UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`;

    if (body) {
        url = `https://m.jingxi.com/activeapi/${functionId}?${body}`;
        url += `&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    } else {
        url = `https://m.jingxi.com/activeapi/${functionId}?_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    }
    return {
        url,
        headers: {
            "Host": "m.jingxi.com",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": UA,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://st.jingxi.com/",
            "Cookie": cookie
        },
		timeout: 10000
    }
}


function GetJxBeanDetailData() {
  return new Promise((resolve) => {
    $.get(taskJxUrl("queryuserjingdoudetail","pagesize=10&type=16"), async (err, resp, data) => {
        try {
          if (err) {
            console.log(JSON.stringify(err));
            console.log(`GetJxBeanDetailData请求失败，请检查网路重试`);
          } else {
            data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);      
            
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      });
  });
}
function GetJxBean() {
    if (!EnableJxBeans)
        return;
    return new Promise((resolve) => {
        $.get(taskJxUrl("querybeanamount"), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    console.log(`GetJxBean请求失败，请检查网路重试`);
                } else {
                    data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                    if (data) {
                        if (data.errcode == 0) {
                            $.xibeanCount = data.data.xibean;
                            if (!$.beanCount) {
                                $.beanCount = data.data.jingbean;
                            }
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve(data);
            }
        });
    });
}
async function jxbean() {
	if (!EnableJxBeans)
        return;
    //前一天的0:0:0时间戳
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
    // 今天0:0:0时间戳
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    var JxYesterdayArr = [],
    JxTodayArr = [];
    var JxResponse = await GetJxBeanDetailData();
    if (JxResponse && JxResponse.ret == "0") {
        var Jxdetail = JxResponse.detail;
        if (Jxdetail && Jxdetail.length > 0) {
            for (let item of Jxdetail) {
                const date = item.createdate.replace(/-/g, '/') + "+08:00";
                if (new Date(date).getTime() >= tm1 && (!item['visibleinfo'].includes("退还") && !item['visibleinfo'].includes('扣赠'))) {
                    JxTodayArr.push(item);
                } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['visibleinfo'].includes("退还") && !item['visibleinfo'].includes('扣赠'))) {
                    //昨日的
                    JxYesterdayArr.push(item);
                } else if (tm > new Date(date).getTime()) {
                    break;
                }
            }
        } else {
            $.errorMsg = `数据异常`;
            $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
        }

        for (let item of JxYesterdayArr) {
            if (Number(item.amount) > 0) {
                $.inJxBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.OutJxBean += Number(item.amount);
            }
        }
        for (let item of JxTodayArr) {
            if (Number(item.amount) > 0) {
                $.todayinJxBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.todayOutJxBean += Number(item.amount);
            }
        }
		$.todayOutJxBean = -$.todayOutJxBean;
		$.OutJxBean = -$.OutJxBean;
    }

}


	
function randomString(e) {
	e = e || 32;
	let t = "0123456789abcdef",
	a = t.length,
	n = "";
	for (let i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

function getGetRequest(type, url) {
	UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`

		const method = `GET`;
	let headers = {
		'Origin': `https://st.jingxi.com`,
		'Cookie': cookie,
		'Connection': `keep-alive`,
		'Accept': `application/json`,
		'Referer': `https://st.jingxi.com/pingou/jxmc/index.html`,
		'Host': `m.jingxi.com`,
		'User-Agent': UA,
		'Accept-Encoding': `gzip, deflate, br`,
		'Accept-Language': `zh-cn`
	};
	return {
		url: url,
		method: method,
		headers: headers,
		timeout: 10000
	};
}

Date.prototype.Format = function (fmt) {
	var e,
	n = this,
	d = fmt,
	l = {
		"M+": n.getMonth() + 1,
		"d+": n.getDate(),
		"D+": n.getDate(),
		"h+": n.getHours(),
		"H+": n.getHours(),
		"m+": n.getMinutes(),
		"s+": n.getSeconds(),
		"w+": n.getDay(),
		"q+": Math.floor((n.getMonth() + 3) / 3),
		"S+": n.getMilliseconds()
	};
	/(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
	for (var k in l) {
		if (new RegExp("(".concat(k, ")")).test(d)) {
			var t,
			a = "S+" === k ? "000" : "00";
			d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
		}
	}
	return d;
}

function decrypt(time, stk, type, url) {
	$.appId = 10028;
	stk = stk || (url ? getJxmcUrlData(url, '_stk') : '')
		if (stk) {
			const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
			let hash1 = '';
			if ($.fingerprint && $.Jxmctoken && $.enCryptMethodJD) {
				hash1 = $.enCryptMethodJD($.Jxmctoken, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
			} else {
				const random = '5gkjB6SpmC9s';
				$.Jxmctoken = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
				$.fingerprint = 5287160221454703;
				const str = `${$.Jxmctoken}${$.fingerprint}${timestamp}${$.appId}${random}`;
				hash1 = $.CryptoJS.SHA512(str, $.Jxmctoken).toString($.CryptoJS.enc.Hex);
			}
			let st = '';
			stk.split(',').map((item, index) => {
				st += `${item}:${getJxmcUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
			})
			const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
			return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.Jxmctoken), "".concat(hash2)].join(";"))
		} else {
			return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
		}
}

async function requestAlgo() {
	$.fingerprint = await generateFp();
	$.appId = 10028;
	const options = {
		"url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
		"headers": {
			'Authority': 'cactus.jd.com',
			'Pragma': 'no-cache',
			'Cache-Control': 'no-cache',
			'Accept': 'application/json',
			'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
			//'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
			'Content-Type': 'application/json',
			'Origin': 'https://st.jingxi.com',
			'Sec-Fetch-Site': 'cross-site',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Dest': 'empty',
			'Referer': 'https://st.jingxi.com/',
			'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
		},
		'body': JSON.stringify({
			"version": "1.0",
			"fp": $.fingerprint,
			"appId": $.appId.toString(),
			"timestamp": Date.now(),
			"platform": "web",
			"expandParams": ""
		})
	}
	new Promise(async resolve => {
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
					llgeterror = true;
				} else {
					if (data) {
						data = JSON.parse(data);
						if (data['status'] === 200) {
							$.Jxmctoken = data.data.result.tk;
							let enCryptMethodJDString = data.data.result.algo;
							if (enCryptMethodJDString)
								$.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
						} else {
							console.log('request_algo 签名参数API请求失败:')
						}
					} else {
						llgeterror = true;
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				llgeterror = true;
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

function generateFp() {
	let e = "0123456789";
	let a = 13;
	let i = '';
	for (; a--; )
		i += e[Math.random() * e.length | 0];
	return (i + Date.now()).slice(0, 16)
}

function getJxmcUrlData(url, name) {
	if (typeof URL !== "undefined") {
		let urls = new URL(url);
		let data = urls.searchParams.get(name);
		return data ? data : '';
	} else {
		const query = url.match(/\?.*/)[0].substring(1)
			const vars = query.split('&')
			for (let i = 0; i < vars.length; i++) {
				const pair = vars[i].split('=')
					if (pair[0] === name) {
						return vars[i].substr(vars[i].indexOf('=') + 1);
					}
			}
			return ''
	}
}

function jsonParse(str) {
	if (typeof str == "string") {
		try {
			return JSON.parse(str);
		} catch (e) {
			console.log(e);
			$.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
			return [];
		}
	}
}
function timeFormat(time) {
	let date;
	if (time) {
		date = new Date(time)
	} else {
		date = new Date();
	}
	return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetPigPetInfo() {
	if (!EnablePigPet)
		return;
    return new Promise(async resolve => {
        const body = {
            "shareId": "",
            "source": 2,
            "channelLV": "juheye",
            "riskDeviceParam": "{}",
        }
        $.post(taskPetPigUrl('pigPetLogin', body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`GetPigPetInfo API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.resultData.resultData.wished && data.resultData.resultData.wishAward) {
							$.PigPet=`${data.resultData.resultData.wishAward.name}`                           
                        }
                    } else {
                        console.log(`GetPigPetInfo: 京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve();
            }
        })
    })
}


function taskPetPigUrl(function_id, body) {
  var UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`;
  return {
    url: `https://ms.jr.jd.com/gw/generic/uc/h5/m/${function_id}?_=${Date.now()}`,
    body: `reqData=${encodeURIComponent(JSON.stringify(body))}`,
    headers: {
      'Accept': `*/*`,
      'Origin': `https://u.jr.jd.com`,
      'Accept-Encoding': `gzip, deflate, br`,
      'Cookie': cookie,
      'Content-Type': `application/x-www-form-urlencoded;charset=UTF-8`,
      'Host': `ms.jr.jd.com`,
      'Connection': `keep-alive`,
      'User-Agent': UA,
      'Referer': `https://u.jr.jd.com/`,
      'Accept-Language': `zh-cn`
    },
    timeout: 10000
  }
}

function GetDateTime(date) {

	var timeString = "";

	var timeString = date.getFullYear() + "-";
	if ((date.getMonth() + 1) < 10)
		timeString += "0" + (date.getMonth() + 1) + "-";
	else
		timeString += (date.getMonth() + 1) + "-";

	if ((date.getDate()) < 10)
		timeString += "0" + date.getDate() + " ";
	else
		timeString += date.getDate() + " ";

	if ((date.getHours()) < 10)
		timeString += "0" + date.getHours() + ":";
	else
		timeString += date.getHours() + ":";

	if ((date.getMinutes()) < 10)
		timeString += "0" + date.getMinutes() + ":";
	else
		timeString += date.getMinutes() + ":";

	if ((date.getSeconds()) < 10)
		timeString += "0" + date.getSeconds();
	else
		timeString += date.getSeconds();

	return timeString;
}

// prettier-ignore
function Env(t, e) {
	"undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
	class s {
		constructor(t) {
			this.env = t
		}
		send(t, e = "GET") {
			t = "string" == typeof t ? {
				url: t
			}
			 : t;
			let s = this.get;
			return "POST" === e && (s = this.post),
			new Promise((e, i) => {
				s.call(this, t, (t, s, r) => {
					t ? i(t) : e(s)
				})
			})
		}
		get(t) {
			return this.send.call(this.env, t)
		}
		post(t) {
			return this.send.call(this.env, t, "POST")
		}
	}
	return new class {
		constructor(t, e) {
			this.name = t,
			this.http = new s(this),
			this.data = null,
			this.dataFile = "box.dat",
			this.logs = [],
			this.isMute = !1,
			this.isNeedRewrite = !1,
			this.logSeparator = "\n",
			this.startTime = (new Date).getTime(),
			Object.assign(this, e),
			this.log("", `🔔${this.name}, 开始!`)
		}
		isNode() {
			return "undefined" != typeof module && !!module.exports
		}
		isQuanX() {
			return "undefined" != typeof $task
		}
		isSurge() {
			return "undefined" != typeof $httpClient && "undefined" == typeof $loon
		}
		isLoon() {
			return "undefined" != typeof $loon
		}
		toObj(t, e = null) {
			try {
				return JSON.parse(t)
			} catch {
				return e
			}
		}
		toStr(t, e = null) {
			try {
				return JSON.stringify(t)
			} catch {
				return e
			}
		}
		getjson(t, e) {
			let s = e;
			const i = this.getdata(t);
			if (i)
				try {
					s = JSON.parse(this.getdata(t))
				} catch {}
			return s
		}
		setjson(t, e) {
			try {
				return this.setdata(JSON.stringify(t), e)
			} catch {
				return !1
			}
		}
		getScript(t) {
			return new Promise(e => {
				this.get({
					url: t
				}, (t, s, i) => e(i))
			})
		}
		runScript(t, e) {
			return new Promise(s => {
				let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i = i ? i.replace(/\n/g, "").trim() : i;
				let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r = r ? 1 * r : 20,
				r = e && e.timeout ? e.timeout : r;
				const[o, h] = i.split("@"),
				n = {
					url: `http://${h}/v1/scripting/evaluate`,
					body: {
						script_text: t,
						mock_type: "cron",
						timeout: r
					},
					headers: {
						"X-Key": o,
						Accept: "*/*"
					}
				};
				this.post(n, (t, e, i) => s(i))
			}).catch(t => this.logErr(t))
		}
		loaddata() {
			if (!this.isNode())
				return {}; {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e);
				if (!s && !i)
					return {}; {
					const i = s ? t : e;
					try {
						return JSON.parse(this.fs.readFileSync(i))
					} catch (t) {
						return {}
					}
				}
			}
		}
		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e),
				r = JSON.stringify(this.data);
				s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
			}
		}
		lodash_get(t, e, s) {
			const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
			let r = t;
			for (const t of i)
				if (r = Object(r)[t], void 0 === r)
					return s;
			return r
		}
		lodash_set(t, e, s) {
			return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
		}
		getdata(t) {
			let e = this.getval(t);
			if (/^@/.test(t)) {
				const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
				r = s ? this.getval(s) : "";
				if (r)
					try {
						const t = JSON.parse(r);
						e = t ? this.lodash_get(t, i, "") : e
					} catch (t) {
						e = ""
					}
			}
			return e
		}
		setdata(t, e) {
			let s = !1;
			if (/^@/.test(e)) {
				const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
				o = this.getval(i),
				h = i ? "null" === o ? null : o || "{}" : "{}";
				try {
					const e = JSON.parse(h);
					this.lodash_set(e, r, t),
					s = this.setval(JSON.stringify(e), i)
				} catch (e) {
					const o = {};
					this.lodash_set(o, r, t),
					s = this.setval(JSON.stringify(o), i)
				}
			} else
				s = this.setval(t, e);
			return s
		}
		getval(t) {
			return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
		}
		setval(t, e) {
			return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
		}
		initGotEnv(t) {
			this.got = this.got ? this.got : require("got"),
			this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
			t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
		}
		get(t, e = (() => {})) {
			t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
			this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.get(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				})) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
					try {
						if (t.headers["set-cookie"]) {
							const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
							s && this.ckjar.setCookieSync(s, null),
							e.cookieJar = this.ckjar
						}
					} catch (t) {
						this.logErr(t)
					}
				}).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				}))
		}
		post(t, e = (() => {})) {
			if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
				this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.post(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				});
			else if (this.isQuanX())
				t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t));
			else if (this.isNode()) {
				this.initGotEnv(t);
				const {
					url: s,
					...i
				} = t;
				this.got.post(s, i).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				})
			}
		}
		time(t, e = null) {
			const s = e ? new Date(e) : new Date;
			let i = {
				"M+": s.getMonth() + 1,
				"d+": s.getDate(),
				"H+": s.getHours(),
				"m+": s.getMinutes(),
				"s+": s.getSeconds(),
				"q+": Math.floor((s.getMonth() + 3) / 3),
				S: s.getMilliseconds()
			};
			/(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
			for (let e in i)
				new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
			return t
		}
		msg(e = t, s = "", i = "", r) {
			const o = t => {
				if (!t)
					return t;
				if ("string" == typeof t)
					return this.isLoon() ? t : this.isQuanX() ? {
						"open-url": t
					}
				 : this.isSurge() ? {
					url: t
				}
				 : void 0;
				if ("object" == typeof t) {
					if (this.isLoon()) {
						let e = t.openUrl || t.url || t["open-url"],
						s = t.mediaUrl || t["media-url"];
						return {
							openUrl: e,
							mediaUrl: s
						}
					}
					if (this.isQuanX()) {
						let e = t["open-url"] || t.url || t.openUrl,
						s = t["media-url"] || t.mediaUrl;
						return {
							"open-url": e,
							"media-url": s
						}
					}
					if (this.isSurge()) {
						let e = t.url || t.openUrl || t["open-url"];
						return {
							url: e
						}
					}
				}
			};
			if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
				let t = ["", "==============📣系统通知📣=============="];
				t.push(e),
				s && t.push(s),
				i && t.push(i),
				console.log(t.join("\n")),
				this.logs = this.logs.concat(t)
			}
		}
		log(...t) {
			t.length > 0 && (this.logs = [...this.logs, ...t]),
			console.log(t.join(this.logSeparator))
		}
		logErr(t, e) {
			const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
			s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		done(t = {}) {
			const e = (new Date).getTime(),
			s = (e - this.startTime) / 1e3;
			this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
			this.log(),
			(this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
		}
	}
	(t, e)
}
