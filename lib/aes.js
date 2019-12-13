var SuAES = "object" == typeof exports ? exports : "object" == typeof SuAES ? SuAES : {};
!function(d, g) {
    var m = []
      , f = []
      , h = []
      , u = []
      , v = []
      , p = []
      , S = []
      , x = []
      , k = []
      , y = [];
    !function() {
        for (var r = [], t = 0; t < 256; t++)
            r[t] = t < 128 ? t << 1 : t << 1 ^ 283;
        var n = 0
          , i = 0;
        for (t = 0; t < 256; t++) {
            var o = i ^ i << 1 ^ i << 2 ^ i << 3 ^ i << 4;
            o = o >>> 8 ^ 255 & o ^ 99,
            m[n] = o;
            var s = r[f[o] = n]
              , e = r[s]
              , a = r[e]
              , c = 257 * r[o] ^ 16843008 * o;
            h[n] = c << 24 | c >>> 8,
            u[n] = c << 16 | c >>> 16,
            v[n] = c << 8 | c >>> 24,
            p[n] = c;
            c = 16843009 * a ^ 65537 * e ^ 257 * s ^ 16843008 * n;
            S[o] = c << 24 | c >>> 8,
            x[o] = c << 16 | c >>> 16,
            k[o] = c << 8 | c >>> 24,
            y[o] = c,
            n ? (n = s ^ r[r[r[a ^ s]]],
            i ^= r[r[i]]) : n = i = 1
        }
    }();
    var e = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]
      , b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()*";
    function C(r, t) {
        r = this.w = r || [],
        this.s = t || 4 * r.length
    }
    var r = C.prototype;
    function o(r, t, n, i, o, s, e, a, c) {
        for (var f = r[t] ^ n[0], h = r[t + 1] ^ n[1], u = r[t + 2] ^ n[2], v = r[t + 3] ^ n[3], p = 4, w = 1; w < i; w++) {
            var l = o[f >>> 24] ^ s[h >>> 16 & 255] ^ e[u >>> 8 & 255] ^ a[255 & v] ^ n[p++]
              , A = o[h >>> 24] ^ s[u >>> 16 & 255] ^ e[v >>> 8 & 255] ^ a[255 & f] ^ n[p++]
              , d = o[u >>> 24] ^ s[v >>> 16 & 255] ^ e[f >>> 8 & 255] ^ a[255 & h] ^ n[p++]
              , g = o[v >>> 24] ^ s[f >>> 16 & 255] ^ e[h >>> 8 & 255] ^ a[255 & u] ^ n[p++];
            f = l,
            h = A,
            u = d,
            v = g
        }
        l = (c[f >>> 24] << 24 | c[h >>> 16 & 255] << 16 | c[u >>> 8 & 255] << 8 | c[255 & v]) ^ n[p++],
        A = (c[h >>> 24] << 24 | c[u >>> 16 & 255] << 16 | c[v >>> 8 & 255] << 8 | c[255 & f]) ^ n[p++],
        d = (c[u >>> 24] << 24 | c[v >>> 16 & 255] << 16 | c[f >>> 8 & 255] << 8 | c[255 & h]) ^ n[p++],
        g = (c[v >>> 24] << 24 | c[f >>> 16 & 255] << 16 | c[h >>> 8 & 255] << 8 | c[255 & u]) ^ n[p++];
        r[t] = l,
        r[t + 1] = A,
        r[t + 2] = d,
        r[t + 3] = g
    }
    function E(r) {
        for (var t = unescape(encodeURIComponent(r)), n = t.length, i = [], o = 0; o < n; o++)
            i[o >>> 2] |= (255 & t.charCodeAt(o)) << 24 - o % 4 * 8;
        return new C(i,n)
    }
    function j(r, t, n, i) {
        this.b = n.w,
        this.k = r,
        this.r = t,
        this.p = i
    }
    function w(r, t) {
        this.xorBlock(r, t),
        o(r, t, this.k, this.r, h, u, v, p, m),
        this.b = r.slice(t, t + 4)
    }
    function B(r, t) {
        var n = r.slice(t, t + 4)
          , i = r[t + 1];
        r[t + 1] = r[t + 3],
        r[t + 3] = i,
        o(r, t, this.k, this.r, S, x, k, y, f);
        i = r[t + 1];
        r[t + 1] = r[t + 3],
        r[t + 3] = i,
        this.xorBlock(r, t),
        this.b = n
    }
    function M(r, t) {
        var n = t.w
          , i = t.s
          , o = 4 * Math.ceil(i / 16)
          , s = Math.min(4 * o, i);
        if (o) {
            for (var e = 0; e < o; e += 4)
                r.p(n, e);
            var a = n.splice(0, o);
            t.s -= s
        }
        return new C(a,s)
    }
    function O(r, t, n) {
        for (var i = [], o = 0; o < t; o++)
            if (o < n)
                i[o] = r[o];
            else {
                var s = i[o - 1];
                o % n ? 6 < n && o % n == 4 && (s = m[s >>> 24] << 24 | m[s >>> 16 & 255] << 16 | m[s >>> 8 & 255] << 8 | m[255 & s]) : (s = m[(s = s << 8 | s >>> 24) >>> 24] << 24 | m[s >>> 16 & 255] << 16 | m[s >>> 8 & 255] << 8 | m[255 & s],
                s ^= e[o / n | 0] << 24),
                i[o] = i[o - n] ^ s
            }
        return i
    }
    r.concat = function(r) {
        var t = this.w
          , n = r.w
          , i = this.s
          , o = r.s;
        if (this.clamp(),
        i % 4)
            for (var s = 0; s < o; s++) {
                var e = n[s >>> 2] >>> 24 - s % 4 * 8 & 255;
                t[i + s >>> 2] |= e << 24 - (i + s) % 4 * 8
            }
        else if (65535 < n.length)
            for (s = 0; s < o; s += 4)
                t[i + s >>> 2] = n[s >>> 2];
        else
            t.push.apply(t, n);
        return this.s += o,
        this
    }
    ,
    r.clamp = function() {
        this.w[this.s >>> 2] &= 4294967295 << 32 - this.s % 4 * 8,
        this.w.length = Math.ceil(this.s / 4)
    }
    ,
    j.prototype.xorBlock = function(r, t) {
        for (var n = 0; n < 4; n++)
            r[t + n] ^= this.b[n]
    }
    ,
    SuAES.encrypt = function(r, t, n) {
        t = E(t || d),
        r = E(r);
        var i = new C
          , o = t.w
          , s = t.s / 4
          , e = 6 + s
          , a = O(o, 4 * (1 + e), s);
        i.concat(r);
        for (var c = 16 - i.s % 16, f = c << 24 | c << 16 | c << 8 | c, h = [], u = 0; u < c; u += 4)
            h.push(f);
        return i.concat(new C(h,c)),
        function(r) {
            var t = r.w
              , n = r.s
              , i = b;
            r.clamp();
            for (var o = [], s = 0; s < n; s += 3)
                for (var e = (t[s >>> 2] >>> 24 - s % 4 * 8 & 255) << 16 | (t[s + 1 >>> 2] >>> 24 - (s + 1) % 4 * 8 & 255) << 8 | t[s + 2 >>> 2] >>> 24 - (s + 2) % 4 * 8 & 255, a = 0; a < 4 && s + .75 * a < n; a++)
                    o.push(i.charAt(e >>> 6 * (3 - a) & 63));
            var c = i.charAt(64);
            if (c)
                for (; o.length % 4; )
                    o.push(c);
            return o.join("")
        }(M(new j(a,e,E(n || g),w), i))
    }
    ,
    SuAES.decrypt = function(r, t, n) {
        t = E(t || d);
        var i = new C
          , o = function(r) {
            var t = r.length
              , n = b
              , i = n.charAt(64);
            if (i) {
                var o = r.indexOf(i);
                -1 != o && (t = o)
            }
            for (var s = [], e = 0, a = 0; a < t; a++)
                if (a % 4) {
                    var c = n.indexOf(r.charAt(a - 1)) << a % 4 * 2
                      , f = n.indexOf(r.charAt(a)) >>> 6 - a % 4 * 2;
                    s[e >>> 2] |= (c | f) << 24 - e % 4 * 8,
                    e++
                }
            return new C(s,e)
        }(r)
          , s = o.w;
        1398893684 == s[0] && 1701076831 == s[1] && (s.splice(0, 4),
        o.s -= 16),
        i.concat(o);
        for (var e = t.w, a = t.s / 4, c = 6 + a, f = 4 * (1 + c), h = O(e, f, a), u = [], v = 0; v < f; v++) {
            var p = f - v;
            if (v % 4)
                var w = h[p];
            else
                w = h[p - 4];
            u[v] = v < 4 || p <= 4 ? w : S[m[w >>> 24]] ^ x[m[w >>> 16 & 255]] ^ k[m[w >>> 8 & 255]] ^ y[m[255 & w]]
        }
        var l = M(new j(u,c,E(n || g),B), i)
          , A = 255 & l.w[l.s - 1 >>> 2];
        return l.s -= A,
        function(r) {
            for (var t = r.w, n = r.s, i = [], o = 0; o < n; o++) {
                var s = t[o >>> 2] >>> 24 - o % 4 * 8 & 255;
                i.push(String.fromCharCode(s))
            }
            return decodeURIComponent(escape(i.join("")))
        }(l)
    }
}("www.cnsuning.com", "moc.gninusnc.www");

// var req = JSON.parse(SuAES.decrypt("vA9)OT2qj(MlUg5)LBOsLd8ZNfBNwwo7uINKcU4zvH5weHkhWBlstUPgwiOVwoni6CamIxy9PiUP7NorrW8RZktwyK2l7mfOBBAVLuGet3p8Un8qBi3GcWfz26zab)y3jJ1QjT9na4dy2sYYh2qADM)Zf3WWyBTlJCybr)uPm8J)6)K5jYAe37znAY4xSgtDKtr8TtZZgXWm6SxBd7CrmlZq4qq0LGgUx7(g(ls07k5buS2kqLOBbmMqp9X7NwL7(DQpuSA(h7ghv5EN)o1ejXNDigOOF6mvvNVsmd5ma9cG)HrD9NDDJOPZuv1sNdezC(nCQqRvIW)EqQPBKs6S24BLpSkMjn(l62pmI)Kx7p2NhHGH1FN1atYT8yIoq4AQHqsKZJ)i)gTG)j99CLaNHoiXbHvuAt4STlIObSy6P6w*"));
// console.log(req)

module.exports = SuAES