/* ============================================================
 * BUNKER 404 — art.js
 * Procedural pixel art for the combat scene (Canvas2D, 640x360).
 * Classic script: defines window.Art. No assets, no modules.
 * ============================================================ */
(function (root) {
  'use strict';

  var W = 640, H = 360;
  var R = Math.round, FL = Math.floor, sin = Math.sin, cos = Math.cos, abs = Math.abs,
      max = Math.max, min = Math.min, PI = Math.PI, sqrt = Math.sqrt;
  var G = null;                       // current 2d context
  var OUTLINE = '#0a0c0f';
  var NOFX = {}, NOOPT = {};

  function clamp01(v) { return v > 0 ? (v > 1 ? 1 : v) : 0; }
  function hash(n) { var x = sin(n * 127.1 + 311.7) * 43758.5453; return x - FL(x); }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- colours
  var rgbCache = {};
  function rgb(hex) {
    var v = rgbCache[hex];
    if (v) return v;
    var h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var n = parseInt(h, 16) || 0;
    v = rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return v;
  }
  function hex2(n) { n = R(n); if (n < 0) n = 0; if (n > 255) n = 255; return (n < 16 ? '0' : '') + n.toString(16); }
  var mixCache = {}, mixCount = 0;
  function mix(a, b, k) {
    var key = a + b + k, v = mixCache[key];
    if (v) return v;
    var A = rgb(a), B = rgb(b);
    v = '#' + hex2(A[0] + (B[0] - A[0]) * k) + hex2(A[1] + (B[1] - A[1]) * k) + hex2(A[2] + (B[2] - A[2]) * k);
    if (mixCount++ > 6000) { mixCache = {}; mixCount = 0; }
    mixCache[key] = v;
    return v;
  }
  function amb(hex, P) { return P.ambK > 0 ? mix(hex, P.amb, P.ambK) : hex; }

  // per-sprite tint state: flash -> white, freeze -> icy blue, enrage -> red
  var TK = 0, T_FLASH = 0, T_FREEZE = 0, T_ENR = 0, T_SIL = null;
  var tintCache = {}, tintCount = 0;
  function setTint(flash, freeze, enrage) {
    var fq = flash > 0 ? min(4, max(1, R(flash * 4))) : 0;
    var zq = freeze > 0 ? min(3, max(1, R(freeze * 3))) : 0;
    T_FLASH = fq / 4; T_FREEZE = zq / 3; T_ENR = enrage ? 1 : 0;
    TK = fq + zq * 5 + T_ENR * 20;
  }
  function tint(hex) {
    if (T_SIL) return T_SIL;
    if (TK === 0) return hex;
    var key = TK + hex, v = tintCache[key];
    if (v !== undefined) return v;
    var c = rgb(hex), r0 = c[0], g0 = c[1], b0 = c[2], k;
    if (T_ENR) { r0 = r0 + (240 - r0) * 0.40; g0 = g0 * 0.70; b0 = b0 * 0.66; }
    if (T_FREEZE > 0) { k = 0.25 + 0.45 * T_FREEZE; r0 += (150 - r0) * k; g0 += (208 - g0) * k; b0 += (255 - b0) * k; }
    if (T_FLASH > 0) { k = T_FLASH; r0 += (255 - r0) * k; g0 += (255 - g0) * k; b0 += (255 - b0) * k; }
    v = '#' + hex2(r0) + hex2(g0) + hex2(b0);
    if (tintCount++ > 5000) { tintCache = {}; tintCount = 0; }
    tintCache[key] = v;
    return v;
  }

  // ---------------------------------------------------------------- raw pixel helpers (any ctx)
  function mk(w, h) {
    var c;
    try {
      if (typeof document !== 'undefined' && document.createElement) {
        c = document.createElement('canvas'); c.width = w; c.height = h;
        if (c.getContext) return c;
      }
    } catch (e) { /* ignore */ }
    try { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h); } catch (e2) { /* ignore */ }
    return null;
  }
  function F(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function disc(c, cx, cy, rad, col) {
    c.fillStyle = col;
    for (var dy = -rad; dy <= rad; dy++) {
      var dx = FL(sqrt(rad * rad - dy * dy) + 0.5);
      c.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  }
  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (var dy = -ry; dy <= ry; dy++) {
      var dx = FL(rx * sqrt(max(0, 1 - (dy * dy) / (ry * ry + 0.25))) + 0.5);
      c.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  }
  function pline(c, x0, y0, x1, y1, col, th) {
    c.fillStyle = col; th = th || 1;
    var dx = x1 - x0, dy = y1 - y0, n = max(abs(dx), abs(dy)) | 0, i;
    if (n < 1) n = 1;
    for (i = 0; i <= n; i++) c.fillRect(R(x0 + dx * i / n), R(y0 + dy * i / n), th, th);
  }
  function ring(c, cx, cy, rad, col) {
    c.fillStyle = col;
    var x = rad, y = 0, err = 1 - rad;
    while (x >= y) {
      c.fillRect(cx + x, cy + y, 1, 1); c.fillRect(cx - x, cy + y, 1, 1);
      c.fillRect(cx + x, cy - y, 1, 1); c.fillRect(cx - x, cy - y, 1, 1);
      c.fillRect(cx + y, cy + x, 1, 1); c.fillRect(cx - y, cy + x, 1, 1);
      c.fillRect(cx + y, cy - x, 1, 1); c.fillRect(cx - y, cy - x, 1, 1);
      y++;
      if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
    }
  }
  function poly(c, pts) {
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath(); c.fill();
  }

  // ---------------------------------------------------------------- sprite pen (scaled, sheared, outlined)
  var PX = 0, PY = 0, SX = 1, SY = 1, SH = 0, OX = 0, PASS = 1, EXP = 1, OUTC = OUTLINE;
  var HX = 0, HY = 0;                 // head-top anchor (local) set by sprite functions
  // body part: outlined in pass 0, filled in pass 1. Local coords: origin = feet centre, y up is negative.
  function r(x, y, w, h, col) {
    var xs = x + OX + SH * (y + h * 0.5);
    var x0 = R(PX + xs * SX), x1 = R(PX + (xs + w) * SX);
    var y0 = R(PY + y * SY), y1 = R(PY + (y + h) * SY), q;
    if (x1 < x0) { q = x0; x0 = x1; x1 = q; }
    if (y1 < y0) { q = y0; y0 = y1; y1 = q; }
    if (x1 === x0) x1 = x0 + 1;
    if (y1 === y0) y1 = y0 + 1;
    if (PASS === 0) { G.fillStyle = OUTC; G.fillRect(x0 - EXP, y0 - EXP, x1 - x0 + EXP * 2, y1 - y0 + EXP * 2); }
    else { G.fillStyle = tint(col); G.fillRect(x0, y0, x1 - x0, y1 - y0); }
  }
  // detail: only in the fill pass
  function d(x, y, w, h, col) { if (PASS === 1) r(x, y, w, h, col); }
  // thick limb between two points
  function seg(x0, y0, x1, y1, th, col) {
    var dx = x1 - x0, dy = y1 - y0, len = max(abs(dx), abs(dy)), n = max(1, Math.ceil(len / max(1, th * 0.6))), i, hf = th / 2;
    for (i = 0; i <= n; i++) r(x0 + dx * i / n - hf, y0 + dy * i / n - hf, th, th, col);
  }
  function dseg(x0, y0, x1, y1, th, col) { if (PASS === 1) seg(x0, y0, x1, y1, th, col); }

  // ================================================================= ENEMIES
  function dShambler(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI);
    var bob = s > 0 ? 0 : 1, l = R(s * 2.5);
    var skin = '#72a03c', skinD = '#4f7528', shirt = '#d2ccb2', shirtD = '#a09b82', pants = '#2c3246', shoe = '#15171c';
    SH = 0.10 + sw * 0.06; OX = 1;
    r(-1 - R(sw * 3), -19 + bob, 2, 8, skinD);                       // far arm
    r(-4 + l, -10, 3, 8, pants); r(-5 + l, -2, 4, 2, shoe);          // legs
    r(1 - l, -10, 3, 8, pants);  r(0 - l, -2, 4, 2, shoe);
    r(-5, -21 + bob, 9, 12, shirt);                                  // shirt
    d(2, -21 + bob, 2, 12, shirtD);
    d(-5, -11 + bob, 2, 2, skin); d(0, -10 + bob, 2, 1, skin);       // torn hem
    d(-2, -13 + bob, 2, 1, '#8a3030');
    var tw = R(s * 1);
    d(-4, -21 + bob, 2, 2, '#b3262a'); d(-4 + tw, -19 + bob, 2, 5, '#b3262a'); d(-4 + tw, -14 + bob, 1, 1, '#7d1519'); // tie
    d(0, -18 + bob, 2, 3, '#ececec'); d(0, -18 + bob, 2, 1, '#3a6fd0');   // staff ID card
    r(-6, -29 + bob, 8, 8, skin);                                    // head
    d(-6, -22 + bob, 8, 1, skinD);
    d(-4, -30 + bob, 2, 1, '#22262a'); d(-1, -30 + bob, 3, 1, '#22262a'); d(1, -29 + bob, 1, 3, '#22262a'); // comb-over
    d(-5, -28 + bob, 4, 4, '#f4f2da'); d(-5, -27 + bob, 2, 2, '#16181c'); d(-2, -28 + bob, 1, 1, '#c8c4a8');   // one big eye
    d(-5, -23 + bob, 4, 1, '#1c2412'); d(-4, -23 + bob, 1, 1, '#ecebc8');
    var ay = -19 + bob - R(sw * 6), ax = -R(sw * 2);
    r(-9 + ax, ay, 6, 3, shirt);                                     // near arm reaching
    r(-12 + ax, ay + (a > 0.5 ? 2 : 0), 3, 3, skin);
    HX = -2; HY = -30 + bob;
  }

  function dRunner(e, t) {
    var s = sin(e.walk || 0), c = cos(e.walk || 0), a = e.atk || 0, sw = sin(a * PI);
    var bob = abs(s) > 0.7 ? -1 : 0, l = R(s * 4), k = R(c * 2);
    var skin = '#97ac58', skinD = '#6f823e', suit = '#2f62b8', suitD = '#1f4484', stripe = '#ececec';
    SH = 0.20; OX = 3;
    r(1 + R(s * 3), -17 + bob, 2, 7, skinD);                         // far arm
    r(-2 + l, -9, 3, 7 - max(0, k), suit); r(-3 + l, -2 - max(0, k), 4, 2, '#dcdcdc');
    r(-1 - l, -9, 3, 7 - max(0, -k), suitD); r(-2 - l, -2 - max(0, -k), 4, 2, '#b8b8b8');
    r(-3, -19 + bob, 7, 10, suit);                                   // track jacket
    d(-3, -19 + bob, 1, 10, stripe); d(2, -19 + bob, 2, 10, suitD);
    d(-1, -11 + bob, 2, 2, skin); d(0, -16 + bob, 3, 1, stripe);
    r(-4, -26 + bob, 6, 7, skin);                                    // head
    d(-4, -25 + bob, 6, 1, '#d8343a'); d(2, -25 + bob, 2 + (s > 0 ? 1 : 0), 1, '#d8343a');     // headband
    d(-4, -23 + bob, 2, 1, '#f4f0c8'); d(-4, -23 + bob, 1, 1, '#111111');
    d(-4, -21 + bob, 3, 1, '#1c2412');
    var ax = -8 - R(s * 3) - R(sw * 2), ay = -18 + bob - R(sw * 3);
    r(ax + 2, ay, 6, 2, suit); r(ax, ay, 3, 2, skin); r(ax - 1, ay + 1, 1, 2, skin);   // long near arm
    HX = -1; HY = -27 + bob;
  }

  function dRoach(e, t) {
    var k = sin((e.walk || 0) * 2) > 0 ? 1 : 0;
    var shell = '#74401c', shellL = '#a05e2c', dark = '#2a1608';
    r(-3 + k, -1, 1, 1, dark); r(0 - k, -1, 1, 1, dark); r(3 + k, -1, 1, 1, dark);
    r(-3, -4, 7, 3, shell); r(-2, -5, 5, 1, shell);
    d(-1, -5, 3, 1, shellL); d(1, -4, 1, 3, dark); d(3, -3, 1, 1, shellL);
    r(-5, -4, 2, 2, dark);
    d(-5, -4, 1, 1, '#b8f03a');
    d(-6, -5 - k, 1, 1, dark); d(-7, -6 + k, 1, 1, dark);
    HX = -4; HY = -6;
  }

  function dBloater(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI);
    var bob = s > 0 ? 0 : 1, l = R(s * 2), wob = sin((e.walk || 0) * 2) > 0 ? 1 : 0;
    var skin = '#8a9a4e', skinD = '#667636', skinL = '#a8ba66';
    var boil = sin(t * 5 + (e.seed || 0) * 9) > 0 ? '#dcff4a' : '#a8d832';
    r(-6 + l, -5, 4, 5, skinD); r(-7 + l, -1, 5, 1, '#3a2c1c');
    r(3 - l, -5, 4, 5, skinD);  r(2 - l, -1, 5, 1, '#3a2c1c');
    r(-8, -9 + bob, 16, 5, '#5a4630');                               // shorts
    r(-9, -26 + bob, 18, 3, skin);                                   // belly (stacked rows)
    r(-11 - wob, -23 + bob, 22 + wob, 4, skin);
    r(-13 - wob, -19 + bob, 25 + wob, 7, skin);
    r(-12 - wob, -12 + bob, 23 + wob, 3, skin);
    d(-12, -12 + bob, 23, 2, skinD); d(6, -24 + bob, 5, 12, skinD); d(-9, -24 + bob, 6, 2, skinL);
    d(-7, -26 + bob, 12, 3, '#d8d0b8'); d(-8, -23 + bob, 4, 1, '#d8d0b8');   // undersized vest
    d(-6, -13 + bob, 1, 2, '#4a5626');
    d(-11, -19 + bob, 3, 3, boil); d(-10, -19 + bob, 1, 1, '#f6ffc8');       // acid boils
    d(-2, -18 + bob, 4, 4, boil);  d(-1, -18 + bob, 1, 1, '#f6ffc8');
    d(3, -22 + bob, 2, 2, boil); d(-6, -22 + bob, 2, 2, boil); d(5, -15 + bob, 3, 2, boil);
    r(-6, -32 + bob, 6, 6, skin);                                    // tiny head
    d(-6, -30 + bob, 2, 1, '#f4f0c8'); d(-6, -30 + bob, 1, 1, '#111111'); d(-3, -30 + bob, 1, 1, '#111111');
    d(-5, -28 + bob, 3, 1, '#2a3016'); d(-4, -33 + bob, 1, 1, '#22262a');
    r(-15 - wob, -21 + bob - R(sw * 4), 3, 2, skin);                 // tiny arms
    r(11, -21 + bob, 3, 2, skinD);
    HX = -3; HY = -33 + bob;
  }

  function dShell(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI);
    var bob = s > 0 ? 0 : 1, l = R(s * 2);
    var skin = '#718862', skinD = '#4e6244', iron = '#4d525a', ironL = '#787f8a', ironD = '#30343a';
    r(-4 + l, -8, 4, 7, skinD); r(-5 + l, -2, 5, 2, '#2a2420');
    r(3 - l, -8, 4, 7, skinD);  r(2 - l, -2, 5, 2, '#2a2420');
    r(-6, -18 + bob, 13, 11, skin);
    r(-1, -24 + bob, 9, 2, iron); r(-3, -22 + bob, 13, 10, iron); r(-1, -12 + bob, 9, 2, iron);   // manhole cover
    d(-1, -24 + bob, 9, 1, ironL); d(-3, -21 + bob, 1, 7, ironL);
    d(1, -21 + bob, 1, 8, ironD); d(4, -21 + bob, 1, 8, ironD); d(7, -21 + bob, 1, 8, ironD);
    d(-1, -19 + bob, 10, 1, ironD); d(-1, -16 + bob, 10, 1, ironD);
    r(-9, -19 + bob, 6, 6, '#c8302a'); d(-8, -17 + bob, 4, 2, '#f2f2f2');                          // road-sign pauldron
    r(-11, -25 + bob, 7, 6, skin);                                   // head
    r(-12, -27 + bob, 8, 3, '#8a9099'); d(-12, -27 + bob, 8, 1, '#bcc2cc'); r(-4, -26 + bob, 3, 1, '#8a9099'); // pot helmet
    d(-11, -23 + bob, 2, 2, '#f4d03a'); d(-11, -23 + bob, 1, 1, '#111111');
    d(-10, -20 + bob, 4, 1, '#22301a');
    var ax = -11 - R(sw * 3), ay = -13 + bob - R(sw * 5);
    r(ax, ay, 4, 3, skin); r(ax - 2, ay, 2, 1, '#e8e0c0'); r(ax - 2, ay + 2, 2, 1, '#e8e0c0');
    HX = -8; HY = -28 + bob;
  }

  function dSpitter(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0;
    var bob = s > 0 ? 0 : 1, l = R(s * 2), sac = R(3 + a * 4), open = a > 0.7 ? 2 : 0;
    var skin = '#5f9074', skinD = '#42684f', sacC = a > 0.6 ? '#e6ff5c' : '#b4dc48';
    r(-3 + l, -8, 2, 8, skinD); r(-5 + l, -1, 4, 1, skinD);
    r(2 - l, -8, 2, 8, skinD);  r(0 - l, -1, 4, 1, skinD);
    r(-4, -15 + bob, 9, 8, skin); d(2, -15 + bob, 3, 8, skinD);
    d(-2, -12 + bob, 1, 1, '#35543f'); d(1, -10 + bob, 1, 1, '#35543f'); d(-1, -14 + bob, 1, 1, '#35543f');
    r(5, -11 + bob, 3, 2, skinD);
    r(-3, -24 + bob, 3, 10, skin);                                   // neck
    r(-3 - sac, -19 + bob - (sac >> 1), sac + 1, sac + 1, sacC);     // throat sac
    d(-2 - sac, -19 + bob - (sac >> 1), 1, 1, '#f8ffd0');
    r(-7, -28 + bob, 8, 4, skin);                                    // head
    r(-7, -24 + bob + open, 6, 2, skinD);
    d(-6, -24 + bob, 5, max(1, open), '#16241a');
    d(-3, -27 + bob, 2, 2, '#f4e040'); d(-3, -27 + bob, 1, 2, '#111111');
    d(-7, -22 + bob + open, 1, 1 + R(abs(sin(t * 3 + (e.seed || 0) * 7)) * 2), '#b4dc48');   // drool
    r(-6, -13 + bob, 3, 2, skinD);
    HX = -3; HY = -29 + bob;
  }

  function dPigeon(e, t) {
    var sd = e.seed || 0, f = sin(t * 22 + sd * 10), bob = R(sin(t * 6 + sd * 6));
    var body = '#7f8996', bodyD = '#5a626e', wing = '#9ca6b2';
    r(4, -7 + bob, 4, 2, bodyD);
    r(-4, -8 + bob, 9, 5, body); d(-3, -4 + bob, 7, 1, bodyD);
    d(-4, -8 + bob, 2, 3, '#4fae7a'); d(-3, -6 + bob, 1, 1, '#8a5ac8');
    r(-7, -11 + bob, 4, 4, body);
    d(-7, -10 + bob, 1, 1, '#ff3a2a'); d(-5, -11 + bob, 1, 1, '#ff3a2a'); d(-5, -9 + bob, 1, 1, '#ff3a2a');   // three eyes
    r(-9, -9 + bob, 2, 1, '#e8a02a');
    if (f > 0.3) { r(-2, -13 + bob, 6, 5, wing); d(-1, -13 + bob, 4, 1, '#c4ccd4'); }
    else if (f > -0.3) { r(-2, -9 + bob, 7, 3, wing); }
    else { r(-2, -6 + bob, 6, 5, wing); d(-1, -2 + bob, 4, 1, bodyD); }
    d(-1, -3 + bob, 1, 2, '#e8a02a'); d(2, -3 + bob, 1, 2, '#e8a02a');
    HX = -5; HY = -12 + bob;
  }

  function dBurrower(e, t) {
    var sd = e.seed || 0, i;
    if (e.state === 'burrow') {
      var k = sin((e.walk || 0) * 2) > 0 ? 1 : 0, dirt = '#54402b', dirtL = '#76603f', dirtD = '#2e2216';
      d(-8, -2, 16, 2, dirtD);
      d(-7, -4, 13, 2, dirt); d(-5 + k, -6, 9, 2, dirt); d(-3 + k, -7, 4, 1, dirtL);
      d(-6, -4, 3, 1, dirtL); d(3, -3, 2, 1, dirtL);
      for (i = 0; i < 4; i++) {
        var ph = (t * 3 + i * 0.25 + sd) % 1;
        d(-8 + i * 5 + R(sin(i * 7 + sd * 5) * 2), -6 - R(ph * 10) + R(ph * ph * 7), 1 + (i & 1), 1, (i & 1) ? dirt : dirtL);
      }
      HX = 0; HY = -8;
      return;
    }
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI), bob = s > 0 ? 0 : 1, l = R(s * 2);
    var fur = '#6f4f36', furD = '#4a3322', furL = '#8e6a48', claw = '#eadfc0';
    r(-3 + l, -2, 4, 2, furD); r(4 - l, -2, 4, 2, furD);
    r(-5, -12 + bob, 13, 11, fur); r(-3, -13 + bob, 9, 1, fur);
    d(4, -12 + bob, 4, 11, furD); d(-4, -7 + bob, 7, 5, furL);
    r(-9, -18 + bob, 8, 7, fur);                                     // head
    r(-11, -14 + bob, 3, 2, '#e88a9a'); d(-11, -14 + bob, 1, 1, '#ffc4cc');
    d(-7, -15 + bob, 2, 1, '#111111');
    d(-9, -12 + bob, 4, 1, furD); d(-8, -11 + bob, 1, 1, '#f2f2e2');
    r(-9, -20 + bob, 8, 2, '#f0c020'); r(-11, -18 + bob, 11, 1, '#f0c020'); d(-8, -20 + bob, 6, 1, '#fff08a');   // hard hat
    d(-10, -20 + bob, 2, 2, sin(t * 8 + sd * 4) > -0.5 ? '#fffbd0' : '#c8b060');
    var cy = -8 + bob - R(sw * 6), cx = -10 - R(sw * 2);
    r(cx, cy, 5, 3, furD);
    r(cx - 3, cy - 1, 3, 1, claw); r(cx - 3, cy + 1, 3, 1, claw); r(cx - 3, cy + 3, 3, 1, claw);
    HX = -5; HY = -21 + bob;
  }

  function dShield(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI), bob = s > 0 ? 0 : 1, l = R(s * 2);
    var sh = e.shield == null ? 1 : e.shield;
    var skin = '#82a04c', skinD = '#5c7434', ov = '#3d5c80', ovD = '#2a4260';
    r(-2 + l, -10, 4, 8, ov); r(-3 + l, -2, 5, 2, '#1c1c20');
    r(4 - l, -10, 4, 8, ovD); r(3 - l, -2, 5, 2, '#1c1c20');
    r(-2, -22 + bob, 10, 12, ov); d(5, -22 + bob, 3, 12, ovD);
    d(0, -22 + bob, 1, 5, '#c8a03a'); d(4, -22 + bob, 1, 5, '#c8a03a'); d(1, -17 + bob, 3, 3, ovD);
    r(7, -20 + bob, 3, 8, skinD);
    r(-3, -30 + bob, 8, 8, skin);                                    // head peeking over the door
    d(-3, -28 + bob, 3, 2, '#f4f0c8'); d(-3, -27 + bob, 1, 1, '#111111');
    d(1, -28 + bob, 2, 2, '#f4f0c8'); d(1, -27 + bob, 1, 1, '#111111');
    d(-2, -24 + bob, 5, 1, '#22301a'); d(-1, -24 + bob, 1, 1, '#ecebc8');
    r(-3, -31 + bob, 8, 2, '#c8302a'); r(-5, -30 + bob, 2, 1, '#c8302a');
    if (sh > 0) {
      var dx = -10 - R(sw * 2), dy = -25 + bob, door = '#aa4a2e', doorD = '#7c3220', doorL = '#cc683e';
      r(dx, dy + 8, 7, 16, door);
      r(dx + 1, dy, 6, 8, door);
      d(dx + 2, dy + 1, 4, 6, sh < 0.5 ? '#7a9aa8' : '#9cc4d4');
      if (sh < 0.5) { d(dx + 3, dy + 2, 1, 3, '#eaf6fa'); d(dx + 4, dy + 4, 1, 2, '#eaf6fa'); d(dx + 2, dy + 5, 2, 1, '#eaf6fa'); }
      else d(dx + 2, dy + 1, 1, 2, '#dcf2fa');
      d(dx, dy + 8, 1, 16, doorL);
      d(dx + 4, dy + 10, 2, 1, '#d4d4d4');
      d(dx + 1, dy + 19, 5, 1, doorD);
      d(dx + 2, dy + 14, 2, 2, '#6a3a1a');
      if (sh < 0.7) d(dx + 3, dy + 16, 3, 2, doorD);
      if (sh < 0.35) { d(dx + 1, dy + 11, 2, 2, '#1c1c20'); d(dx + 4, dy + 21, 2, 2, '#1c1c20'); }
      d(dx + 6, dy + 12, 2, 2, skin);
    } else {
      r(-8 - R(sw * 3), -20 + bob - R(sw * 4), 6, 3, skin);
    }
    HX = 1; HY = -32 + bob;
  }

  function dJelly(e, t) {
    var sd = e.seed || 0, wob = sin(t * 5 + sd * 10) * 0.08 + sin((e.walk || 0) * 2) * 0.05;
    var sx0 = SX, sy0 = SY, a0 = G.globalAlpha;
    var body = '#58d890', rim = '#2a9860', hi = '#d0ffe6', bone = '#f2ecda';
    SX *= 1 + wob; SY *= 1 - wob;
    G.globalAlpha = a0 * 0.62;
    r(-5, -18, 10, 2, body); r(-8, -16, 16, 3, body); r(-10, -13, 20, 9, body); r(-9, -4, 18, 3, body); r(-7, -1, 14, 1, body);
    G.globalAlpha = a0 * 0.9;
    r(-5, -18, 10, 1, rim); r(-8, -16, 3, 1, rim); r(5, -16, 3, 1, rim); r(-8, -15, 1, 2, rim); r(7, -15, 1, 2, rim);
    r(-10, -13, 2, 1, rim); r(8, -13, 2, 1, rim); r(-10, -12, 1, 8, rim); r(9, -12, 1, 8, rim);
    r(-9, -4, 1, 3, rim); r(8, -4, 1, 3, rim); r(-7, -1, 14, 1, rim);
    G.globalAlpha = a0;
    if (!e.mini) {
      r(1, -8, 6, 1, bone); r(0, -9, 1, 3, bone); r(7, -9, 1, 3, bone);                    // bone
      r(2, -14, 4, 3, bone); r(3, -13, 1, 1, '#1a3a2a'); r(5, -13, 1, 1, '#1a3a2a'); r(3, -11, 3, 1, bone);   // skull
    }
    r(-7, -11, 2, 3, '#0e2a1c'); r(-3, -11, 2, 3, '#0e2a1c'); r(-7, -11, 1, 1, '#ffffff'); r(-3, -11, 1, 1, '#ffffff');
    r(-6, -6, 3, 1, '#0e2a1c');
    r(-4, -16, 3, 1, hi); r(-7, -14, 1, 2, hi);
    SX = sx0; SY = sy0;
    HX = 0; HY = -19;
  }

  function dHowler(e, t) {
    var s = sin(e.walk || 0), bob = s > 0 ? 0 : 1, l = R(s * 2);
    var cheer = sin(t * 9 + (e.seed || 0) * 5) > 0 ? 2 : 0;
    var skin = '#86a24c', skinD = '#607836', uni = '#f07a1a', uniD = '#b85a10', white = '#f4f0e0';
    r(-3 + l, -11, 3, 9, white); r(-4 + l, -2, 4, 2, '#d8343a');
    r(2 - l, -11, 3, 9, '#d0ccb8'); r(1 - l, -2, 4, 2, '#b02a2e');
    r(-4, -23 + bob, 9, 12, uni); d(3, -23 + bob, 2, 12, uniD);
    d(-4, -19 + bob, 9, 1, white); d(0, -23 + bob, 1, 12, white);
    var py = -31 + bob - cheer;
    r(5, -26 + bob - cheer, 2, 5, skinD);                            // raised arm + pom-pom
    r(3, py - 1, 5, 5, '#ff4fa0'); d(4, py - 2, 2, 1, '#ffe04a'); d(3, py + 1, 1, 1, '#ffe04a'); d(7, py, 1, 2, '#ffe04a'); d(5, py + 2, 2, 1, '#ffffff');
    r(-5, -31 + bob, 7, 8, skin);                                    // head
    d(-5, -30 + bob, 7, 1, white); d(-5, -30 + bob, 2, 1, '#d8343a');
    d(-4, -28 + bob, 2, 2, '#f4f0c8'); d(-4, -28 + bob, 1, 1, '#111111');
    d(-5, -25 + bob, 4, 2, '#1c2412');
    d(-1, -32 + bob, 3, 1, '#22262a');
    r(-6, -22 + bob, 3, 2, skin);
    r(-8, -26 + bob, 3, 3, '#f4d03a'); r(-11, -28 + bob, 3, 7, '#f4d03a'); r(-12, -29 + bob, 1, 9, '#d8343a');   // megaphone
    d(-11, -28 + bob, 3, 1, '#fff08a');
    HX = -2; HY = -33 + bob;
  }

  function dBrute(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, bob = s > 0 ? 0 : 1, l = R(s * 2);
    var skin = '#b8744c', skinD = '#8a5236', skinL = '#d8946a', vein = '#7ad04a', tank = '#e8e03a', tankD = '#b0a820';
    var shx = -11, shy = -33 + bob, ex, ey, hx, hy, k;
    if (a <= 0) { ex = shx - 2; ey = shy + 9; hx = ex - 1 + R(s * 2); hy = ey + 8; }
    else if (a < 0.5) { k = a / 0.5; ex = shx - 2 - 2 * k; ey = shy + 9 - 10 * k; hx = ex + 1; hy = ey + 8 - 17 * k; }
    else { k = (a - 0.5) / 0.5; ex = shx - 4 - 2 * k; ey = shy - 1 + 6 * k; hx = ex + 1 - 7 * k; hy = ey - 9 + 19 * k; }
    // far arm mirrors (darker)
    seg(11, shy, 11 - (ex - shx), ey, 5, skinD); seg(11 - (ex - shx), ey, 11 - (hx - shx) * 0.6, hy, 4, skinD);
    r(-4 + l, -12, 3, 10, skinD); r(-5 + l, -2, 5, 2, '#ececec');    // tiny legs (skipped leg day)
    r(2 - l, -12, 3, 10, skinD);  r(1 - l, -2, 5, 2, '#d0d0d0');
    r(-6, -16 + bob, 12, 5, '#30343c'); d(-6, -16 + bob, 12, 1, '#e84a4a');
    r(-6, -22 + bob, 12, 6, skin);                                   // V torso
    r(-9, -28 + bob, 18, 6, skin);
    r(-12, -37 + bob, 24, 9, skin);
    d(-5, -35 + bob, 10, 19, tank); d(3, -35 + bob, 2, 19, tankD);   // stringer tank top
    d(-2, -35 + bob, 4, 4, skin);
    d(-10, -29 + bob, 4, 1, skinD); d(6, -29 + bob, 4, 1, skinD);
    d(8, -36 + bob, 4, 8, skinD);
    r(-4, -39 + bob, 8, 2, skin);                                    // traps
    r(-3, -44 + bob, 6, 6, skin);                                    // tiny head
    d(-3, -43 + bob, 6, 1, '#e84a4a');
    d(-3, -41 + bob, 2, 1, '#111111'); d(0, -41 + bob, 2, 1, '#111111'); d(-2, -39 + bob, 3, 1, '#f2f2e2');
    seg(shx, shy, ex, ey, 6, skinL);                                 // near arm
    seg(ex, ey, hx, hy, 5, skin);
    r(hx - 3, hy - 3, 6, 6, skinL);
    d(shx - 2, shy - 2, 1, 4, vein); d(shx, shy + 2, 3, 1, vein); d(ex - 1, ey + 1, 1, 3, vein);
    HX = 0; HY = -45 + bob;
  }

  function dCourier(e, t) {
    var s = sin(e.walk || 0), c = cos(e.walk || 0), a = e.atk || 0, sw = sin(a * PI);
    var bob = abs(s) > 0.7 ? -1 : 0, l = R(s * 4), k = R(c * 2), i;
    var skin = '#93aa52', skinD = '#6a7c38', uni = '#1f8a8a', uniD = '#156464', box = '#c89a5a', boxD = '#9a7240';
    SH = 0.20; OX = 2;
    if (PASS === 1 && e.state !== 'attack' && !T_SIL) {
      var ga = G.globalAlpha; G.globalAlpha = ga * 0.5;
      for (i = 0; i < 3; i++) r(10 + i * 2 + R((t * 40 + i * 7) % 6), -7 - i * 8, 7 - i, 1, '#ffffff');
      G.globalAlpha = ga;
    }
    r(-2 + l, -10, 3, 8 - max(0, k), '#2a2e3a'); r(-3 + l, -2 - max(0, k), 5, 2, '#f0f0f0');
    r(0 - l, -10, 3, 8 - max(0, -k), '#1e222c'); r(-1 - l, -2 - max(0, -k), 5, 2, '#c8c8c8');
    r(2, -25 + bob, 8, 10, box); d(2, -21 + bob, 8, 2, '#e8dcc0'); d(8, -25 + bob, 2, 10, boxD); d(4, -18 + bob, 3, 2, '#d8343a');
    r(-3, -22 + bob, 7, 12, uni); d(-3, -17 + bob, 7, 1, '#f4f060'); d(2, -22 + bob, 2, 12, uniD);
    r(2 + R(s * 3), -19 + bob, 2, 6, skinD);
    r(-4, -29 + bob, 6, 7, skin);
    r(-4, -30 + bob, 6, 2, uni); r(-7, -29 + bob, 3, 1, uniD);
    d(-4, -26 + bob, 2, 1, '#f4f0c8'); d(-4, -26 + bob, 1, 1, '#111111');
    d(-4, -24 + bob, 3, 1, '#1c2412');
    var ax = -6 - R(s * 3), ay = -19 + bob - R(sw * 3);
    r(ax, ay, 5, 2, uni); r(ax - 2, ay, 2, 2, skin);
    HX = -1; HY = -31 + bob;
  }

  function dDummy(e, t) {
    var wob = (e.flash || 0) > 0 ? sin(t * 40) * 0.06 : 0;
    var wood = '#7a5632', woodD = '#553a20', straw = '#e0c060', sack = '#c8ac78', sackD = '#a08858';
    SH = wob;
    r(-6, -2, 12, 2, woodD); r(-1, -22, 2, 20, wood);
    r(-9, -24, 18, 2, wood);
    d(-10, -25, 2, 1, straw); d(-10, -22, 2, 1, straw); d(8, -25, 2, 1, straw); d(9, -22, 1, 2, straw);
    r(-5, -25, 10, 13, '#a83c32');
    d(-5, -25, 10, 1, '#c85a4a'); d(-5, -19, 10, 1, '#8a2c26'); d(3, -25, 2, 13, '#8a2c26');
    d(-5, -13, 2, 2, straw); d(1, -12, 3, 2, straw); d(-2, -12, 1, 2, straw);
    d(-4, -23, 8, 8, '#f4f0e0'); d(-3, -22, 6, 6, '#d8343a'); d(-2, -21, 4, 4, '#f4f0e0'); d(-1, -20, 2, 2, '#d8343a');   // bullseye
    r(-4, -33, 8, 8, sack); d(2, -33, 2, 8, sackD);
    d(-3, -31, 1, 1, '#1c1c1c'); d(-2, -30, 1, 1, '#1c1c1c'); d(-2, -31, 1, 1, sackD); d(-3, -30, 1, 1, sackD);
    d(-3, -31, 2, 2, '#1c1c1c'); d(1, -31, 2, 2, '#1c1c1c');
    d(-3, -27, 6, 1, '#1c1c1c'); d(-3, -28, 1, 1, '#1c1c1c'); d(2, -28, 1, 1, '#1c1c1c'); d(-1, -27, 1, 2, sackD);
    r(-5, -35, 10, 3, '#8a9099'); d(-5, -35, 10, 1, '#bcc2cc'); r(-6, -33, 12, 1, '#6a7078');
    HX = 0; HY = -36;
  }

  // ---- bosses
  function dBossRoach(e, t) {
    var ph = e.phase || 1, fly = ph >= 2, a = e.atk || 0, sw = sin(a * PI), wk = e.walk || 0, s = sin(wk);
    var hov = fly ? -4 + R(sin(t * 5) * 2) : (s > 0 ? 0 : 1), i;
    var shell = '#74401c', shellD = '#4c260e', shellL = '#a8652e', dark = '#2c1608', belly = '#c9a060', bellyD = '#96703a';
    var weak = !!e.weak, gl = sin(t * 10) > 0;
    var lp = fly ? sin(t * 9) * 0.3 : s;
    var roots = [-22, -4, 16], feet = [-32, -8, 26];
    // far legs
    for (i = 0; i < 3; i++) {
      var q = (i === 1 ? lp : -lp) * 5, rx = roots[i] + 3, ry = -19 + hov;
      if (fly) { seg(rx, ry, rx - 2, ry + 7 + R(sin(t * 9 + i) * 1), 2, dark); }
      else { seg(rx, ry, (rx + feet[i] + q) / 2 + 3, ry - 5, 2, dark); seg((rx + feet[i] + q) / 2 + 3, ry - 5, feet[i] + q + 5, -1, 2, dark); }
    }
    // wings
    if (fly && PASS === 1 && !T_SIL) {
      var up = sin(t * 30) > 0, ga = G.globalAlpha;
      G.globalAlpha = ga * 0.5;
      if (up) {
        r(-8, -48 + hov, 36, 4, '#d8b060'); r(0, -52 + hov, 36, 4, '#ecd088'); r(8, -56 + hov, 34, 4, '#ecd088'); r(18, -60 + hov, 28, 4, '#ecd088'); r(28, -63 + hov, 18, 3, '#fff4c8');
        r(2, -51 + hov, 30, 1, '#fff4c8'); r(12, -55 + hov, 26, 1, '#b89040'); r(22, -59 + hov, 20, 1, '#b89040');
      } else {
        r(-6, -47 + hov, 44, 3, '#d8b060'); r(6, -50 + hov, 40, 3, '#ecd088'); r(18, -52 + hov, 30, 2, '#ecd088'); r(10, -49 + hov, 30, 1, '#b89040');
      }
      G.globalAlpha = ga;
    }
    // abdomen
    r(-8, -44 + hov, 38, 2, shell);
    r(-16, -42 + hov, 54, 4, shell);
    r(-20, -38 + hov, 62, 12, shell);
    r(-18, -26 + hov, 58, 4, shellD);
    r(-14, -22 + hov, 48, 4, belly);
    d(-10, -43 + hov, 30, 1, shellL); d(-14, -40 + hov, 22, 2, shellL);
    d(-18, -31 + hov, 58, 1, shellD);
    d(30, -38 + hov, 12, 12, shellD); d(34, -42 + hov, 4, 4, shellD);
    for (i = 0; i < 6; i++) d(-12 + i * 8, -22 + hov, 1, 4, bellyD);
    if (weak) {
      d(-14, -22 + hov, 48, 4, gl ? '#f6ff7a' : '#c8f03a');
      for (i = 0; i < 6; i++) d(-12 + i * 8, -22 + hov, 1, 4, '#8aa820');
      if (PASS === 1 && !T_SIL) { var g2 = G.globalAlpha; G.globalAlpha = g2 * 0.25; r(-17, -25 + hov, 54, 10, '#e8ff5a'); G.globalAlpha = g2; }
    }
    // thorax
    r(-32, -45 + hov, 14, 23, shellD);
    d(-32, -45 + hov, 3, 23, '#c89a4a'); d(-29, -45 + hov, 11, 2, shellL);
    // head
    r(-43, -46 + hov, 12, 14, dark);
    d(-41, -41 + hov, 5, 6, '#0a0a0c'); d(-41, -41 + hov, 2, 2, '#b8f03a');
    d(-45, -44 + hov, 6, 5, '#15151a'); d(-44, -43 + hov, 4, 3, '#e8f4f8'); d(-44, -43 + hov, 1, 1, '#ffffff');      // tiny glasses
    d(-38, -44 + hov, 5, 5, '#15151a'); d(-37, -43 + hov, 3, 3, '#e8f4f8'); d(-39, -42 + hov, 1, 1, '#15151a');
    r(-45, -34 + hov, 3, 2, shellD); r(-41, -33 + hov, 3, 2, shellD);
    // mortarboard
    r(-47, -50 + hov, 17, 2, '#15151a'); r(-43, -48 + hov, 10, 2, '#24242c');
    d(-31, -49 + hov, 1, 5, '#f4d03a'); d(-32, -45 + hov, 3, 2, '#f4d03a');
    // antennae
    var aw = R(sin(t * 3) * 2);
    seg(-43, -45 + hov, -50, -40 + hov + aw, 1, dark); seg(-50, -40 + hov + aw, -53, -30 + hov - aw, 1, dark);
    // tie
    var tw = R(sin(wk) * 1.5);
    r(-34, -32 + hov, 3, 3, '#c8302a'); r(-35 + tw, -29 + hov, 5, 9, '#c8302a');
    d(-35 + tw, -27 + hov, 5, 1, '#f4d03a'); d(-35 + tw, -24 + hov, 5, 1, '#f4d03a'); r(-34 + tw, -20 + hov, 3, 2, '#c8302a');
    // near legs
    for (i = 0; i < 3; i++) {
      var q2 = (i === 1 ? -lp : lp) * 5, rx2 = roots[i], ry2 = -18 + hov;
      if (fly) { seg(rx2, ry2, rx2 - 4, ry2 + 5, 2, shellD); seg(rx2 - 4, ry2 + 5, rx2 - 2 + R(sin(t * 9 + i * 2) * 2), ry2 + 11, 2, shellD); }
      else { seg(rx2, ry2, (rx2 + feet[i] + q2) / 2, ry2 - 6, 3, shellD); seg((rx2 + feet[i] + q2) / 2, ry2 - 6, feet[i] + q2, -1, 2, shellD); }
    }
    // pointer arm
    var hx = -42 - sw * 5, hy = -29 + hov + sw * 12;
    seg(-34, -24 + hov, hx, hy, 2, dark);
    seg(hx, hy, hx - 12 - sw * 2, hy - 12 + sw * 22, 1, '#e8dcc0');
    HX = -38; HY = -51 + hov;
  }

  function dBossGym(e, t) {
    var ph = e.phase || 1, a = e.atk || 0, wk = e.walk || 0, s = sin(wk), bob = s > 0 ? 0 : 1, l = R(s * 3), i;
    var skin = ph >= 3 ? '#d85a3c' : (ph === 2 ? '#c86a4a' : '#c07a52');
    var skinD = mix(skin, '#000000', 0.28), skinL = mix(skin, '#ffffff', 0.22), vein = '#7ad04a';
    var weak = !!e.weak, gl = sin(t * 10) > 0;
    // barbell position: idle on the shoulders, raise, slam down in front (left)
    var bx, by, k;
    if (a <= 0) { bx = 0; by = -76 + bob; }
    else if (a < 0.45) { k = a / 0.45; bx = -2 * k; by = -76 - 22 * k; }
    else if (a < 0.75) { k = (a - 0.45) / 0.3; bx = -2 - 30 * k; by = -98 + 78 * k * k; }
    else { k = (a - 0.75) / 0.25; bx = -32 + 32 * k; by = -20 - 56 * k; }
    var L = 34;
    // legs
    r(-15 + l, -32, 12, 26, skin); r(-17 + l, -6, 15, 6, '#ececec'); d(-17 + l, -2, 15, 2, '#c0c0c8');
    r(4 - l, -32, 12, 26, skinD);  r(3 - l, -6, 15, 6, '#d0d0d0');  d(3 - l, -2, 15, 2, '#a8a8b0');
    d(-12 + l, -20, 6, 1, skinD); d(-9 + l, -30, 1, 8, vein);
    // shorts + belt
    r(-17, -42 + bob, 34, 13, '#22252c'); d(-17, -31 + bob, 34, 2, '#e84a4a'); d(-1, -42 + bob, 2, 13, '#15171c');
    r(-17, -49 + bob, 34, 8, '#6a4424'); d(-17, -49 + bob, 34, 1, '#8a5c32'); d(-4, -48 + bob, 8, 6, '#d8c040'); d(-2, -46 + bob, 4, 2, '#6a4424');
    // torso V
    r(-15, -58 + bob, 30, 10, skin);
    r(-20, -68 + bob, 40, 10, skin);
    r(-26, -82 + bob, 52, 14, skin);
    d(12, -82 + bob, 14, 14, skinD); d(10, -68 + bob, 10, 20, skinD);
    d(-22, -69 + bob, 20, 1, skinD); d(-1, -80 + bob, 1, 12, skinD);        // pec line, sternum
    for (i = 0; i < 3; i++) { d(-8, -64 + bob + i * 5, 14, 1, skinD); }
    d(-1, -66 + bob, 1, 16, skinD);
    d(-12, -82 + bob, 3, 26, '#e8e03a'); d(8, -82 + bob, 3, 26, '#b0a820'); d(-12, -58 + bob, 23, 3, '#e8e03a');    // stringer straps
    d(-22, -78 + bob, 1, 6, vein); d(-21, -73 + bob, 4, 1, vein); d(-17, -62 + bob, 1, 5, vein);
    // traps + tiny head
    r(-10, -85 + bob, 20, 3, skin);
    r(-5, -90 + bob, 10, 7, skin);
    d(-5, -89 + bob, 10, 2, '#e84a4a'); d(5, -88 + bob, 3, 1, '#e84a4a');
    d(-5, -87 + bob, 4, 2, '#f4f0e0'); d(-5, -86 + bob, 2, 1, '#c8242a'); d(0, -87 + bob, 3, 2, '#f4f0e0'); d(0, -86 + bob, 2, 1, '#c8242a');
    d(-5, -88 + bob, 4, 1, '#3a2014'); d(0, -88 + bob, 3, 1, '#3a2014');
    d(-4, -84 + bob, 6, 1, '#f4f0e0'); d(-2, -84 + bob, 1, 1, '#3a2014'); d(0, -84 + bob, 1, 1, '#3a2014');
    // protein shaker on the belt (weak point)
    var shk = weak ? (gl ? '#ffffff' : '#fff6a0') : '#e4e4ee';
    if (weak && PASS === 1 && !T_SIL) { var g0 = G.globalAlpha; G.globalAlpha = g0 * 0.3; r(-27, -54 + bob, 13, 20, '#ffe84a'); G.globalAlpha = g0; }
    r(-24, -48 + bob, 7, 12, shk); r(-24, -51 + bob, 7, 3, '#3aa0e8'); r(-22, -53 + bob, 3, 2, '#3aa0e8');
    d(-23, -43 + bob, 5, 6, weak ? '#ff8ac0' : '#e8a0c0'); d(-23, -47 + bob, 1, 4, '#ffffff');
    // far arm, barbell, near arm
    var gx1 = bx + 9, gx0 = bx - 9;
    seg(20, -78 + bob, (20 + gx1) / 2 + 5, (-78 + bob + by) / 2 + 3, 8, skinD); seg((20 + gx1) / 2 + 5, (-78 + bob + by) / 2 + 3, gx1, by, 7, skinD);
    r(bx - L, by - 1, L * 2, 3, '#b8bec8'); d(bx - L, by - 1, L * 2, 1, '#e4e8ee');
    r(bx - L - 2, by - 10, 6, 21, '#26282e'); r(bx - L + 4, by - 8, 3, 17, '#c8302a'); d(bx - L - 2, by - 10, 1, 21, '#4a4e58');
    r(bx + L - 4, by - 10, 6, 21, '#26282e'); r(bx + L - 7, by - 8, 3, 17, '#c8302a'); d(bx + L - 4, by - 10, 1, 21, '#4a4e58');
    var ex = (-21 + gx0) / 2 - 6, ey = (-78 + bob + by) / 2 + 4;
    seg(-21, -78 + bob, ex, ey, 9, skinL); seg(ex, ey, gx0, by, 8, skin);
    r(gx0 - 4, by - 4, 8, 8, skinL);
    d(-24, -80 + bob, 1, 5, vein); d(ex - 1, ey - 2, 1, 5, vein);
    // steam
    if (ph >= 2 && PASS === 1 && !T_SIL) {
      var ga = G.globalAlpha;
      for (i = 0; i < 6; i++) {
        var p = (t * 0.9 + i / 6 + (e.seed || 0)) % 1, sz = 2 + R(p * 4);
        G.globalAlpha = ga * (1 - p) * 0.5;
        r(-24 + i * 9 + R(sin(t * 2 + i * 2) * 2), -84 + bob - p * 18 - sz, sz, sz, i & 1 ? '#ff8a6a' : '#ffe0d0');
      }
      G.globalAlpha = ga;
    }
    HX = 0; HY = -91 + bob;
  }

  function dBossRedev(e, t) {
    var ph = e.phase || 1, a = e.atk || 0, sw = sin(a * PI), wk = e.walk || 0, i;
    var ylw = '#c08a2a', ylwD = '#8a5e1c', ylwL = '#e0aa44', rust = '#7a4420', steel = '#3a3e46', steelD = '#22242a', steelL = '#6a7078';
    var weak = !!e.weak, gl = sin(t * 10) > 0, jit = (ph >= 2 && sin(t * 37) > 0.6) ? 1 : 0;
    var live = PASS === 1 && !T_SIL, ga;
    // banner flag at the back
    r(50, -106, 2, 56, steelL);
    for (i = 0; i < 12; i++) {
      var fy = -105 + R(sin(t * 5 - i * 0.6) * (0.5 + i * 0.12));
      r(48 - i * 2, fy, 2, 14, i % 4 === 3 ? '#b01c22' : '#d8242a');
      d(48 - i * 2, fy + 3, 2, 2, (i % 3) ? '#f4f0e0' : '#d8242a');
      d(48 - i * 2, fy + 8, 2, 2, (i % 5 > 1) ? '#f4d03a' : '#d8242a');
    }
    // tracks
    r(-50, -16, 100, 12, steelD); r(-46, -20, 92, 20, steelD);
    for (i = 0; i < 12; i++) {
      var tx = -46 + ((i * 8 + wk * 4) % 92 + 92) % 92;
      d(tx, -20, 3, 2, steelL); d(-46 + (92 - (tx + 46)) % 92, -2, 3, 2, steel);
    }
    for (i = 0; i < 4; i++) { d(-41 + i * 25, -15, 9, 9, steel); d(-38 + i * 25, -12, 3, 3, steelL); }
    d(-46, -10, 92, 1, '#15161a');
    // turntable + house
    r(-22, -26, 44, 6, steel);
    r(-12, -62 + jit, 64, 36, ylw);
    d(-12, -62 + jit, 64, 2, ylwL); d(-12, -30 + jit, 64, 4, ylwD);
    d(8, -56 + jit, 22, 2, '#4a3210'); d(8, -52 + jit, 22, 2, '#4a3210'); d(8, -48 + jit, 22, 2, '#4a3210');     // vents
    d(34, -58 + jit, 9, 6, rust); d(-6, -40 + jit, 12, 5, rust); d(20, -38 + jit, 6, 3, rust); d(44, -44 + jit, 5, 9, rust);
    for (i = 0; i < 8; i++) d(-12 + i * 8, -30 + jit, 4, 4, i & 1 ? '#e8c020' : '#1c1c20');                       // hazard skirt
    r(42, -52 + jit, 12, 22, ylwD);                                  // counterweight
    r(32, -76 + jit, 4, 14, steel); r(31, -78 + jit, 6, 2, steelD);  // exhaust
    // cabin
    r(-40, -98 + jit, 30, 72, ylw);
    d(-40, -98 + jit, 30, 2, ylwL); d(-12, -98 + jit, 2, 72, ylwD); d(-40, -56 + jit, 28, 2, ylwD);
    d(-36, -50 + jit, 8, 4, rust); d(-30, -38 + jit, 14, 2, ylwD); d(-22, -46 + jit, 6, 6, '#1c1c20');
    // cockpit glass = weak point
    var glass = weak ? (gl ? '#f4ffff' : '#9af0ff') : '#7fb4c8';
    if (weak && live) { ga = G.globalAlpha; G.globalAlpha = ga * 0.3; r(-41, -99 + jit, 32, 44, '#8af4ff'); G.globalAlpha = ga; }
    d(-38, -95 + jit, 24, 36, '#1c1c20');
    d(-37, -94 + jit, 22, 34, glass);
    // the union boss inside: white hard hat, suit, tie, gold tooth
    d(-31, -91 + jit, 13, 4, '#f6f6f6'); d(-34, -87 + jit, 17, 1, '#d8d8d8'); d(-27, -93 + jit, 5, 2, '#f6f6f6');
    d(-31, -86 + jit, 11, 9, '#84a44c'); d(-31, -86 + jit, 2, 9, '#a2c466');
    d(-30, -84 + jit, 3, 2, '#f4d03a'); d(-30, -84 + jit, 1, 2, '#111111'); d(-25, -84 + jit, 2, 2, '#f4d03a');
    d(-30, -80 + jit, 7, 2, '#1c2412'); d(-29, -80 + jit, 1, 1, '#f4f0e0'); d(-27, -80 + jit, 1, 1, '#f4d03a'); d(-25, -80 + jit, 1, 1, '#f4f0e0');
    d(-34, -77 + jit, 19, 17, '#24262e'); d(-29, -77 + jit, 5, 9, '#f2f2f2'); d(-27, -76 + jit, 2, 8, '#c8302a');
    d(-36, -68 + jit, 5, 4, '#84a44c');                               // hand on the lever
    d(-37, -72 + jit, 1, 10, '#1c1c20'); d(-38, -73 + jit, 3, 2, '#c8302a');
    if (ph >= 2) { d(-24, -94 + jit, 1, 9, '#eaf8ff'); d(-23, -86 + jit, 4, 1, '#eaf8ff'); d(-20, -85 + jit, 1, 7, '#eaf8ff'); d(-34, -66 + jit, 6, 1, '#eaf8ff'); }
    else { d(-36, -93 + jit, 2, 8, '#d4f0fa'); d(-33, -93 + jit, 1, 4, '#d4f0fa'); }
    // boom + stick + bucket
    var px = 0, py = -62 + jit;
    var elx = -18 - 16 * sw, ely = -110 + 22 * sw;
    var bkx = -58 - 8 * sw, bky = -86 + 68 * sw;
    dseg(px + 14, py + 12, (px + elx) / 2 + 3, (py + ely) / 2 + 2, 2, '#c4cad2');       // hydraulic ram
    seg(px, py, elx, ely, 7, ylw); dseg(px + 1, py - 2, elx + 1, ely - 2, 1, ylwL);
    seg(elx, ely, bkx, bky - 8, 5, ylwD);
    r(elx - 3, ely - 3, 7, 7, steel);
    r(bkx - 9, bky - 8, 16, 12, steel); r(bkx - 11, bky - 2, 6, 8, steel);
    d(bkx - 9, bky - 8, 16, 2, steelL); d(bkx - 7, bky - 4, 10, 6, steelD);
    r(bkx - 12, bky + 6, 2, 4, '#dcdcdc'); r(bkx - 8, bky + 6, 2, 4, '#dcdcdc'); r(bkx - 4, bky + 4, 2, 4, '#dcdcdc');
    // exhaust smoke / damage
    if (live) {
      ga = G.globalAlpha;
      var n = ph >= 3 ? 9 : (ph === 2 ? 5 : 3);
      for (i = 0; i < n; i++) {
        var p = (t * 0.6 + i / n) % 1, sz = 3 + R(p * (ph >= 3 ? 9 : 5));
        G.globalAlpha = ga * (1 - p) * (ph >= 3 ? 0.7 : 0.45);
        r(33 + R(sin(t * 1.6 + i * 2.1) * 3) + p * 10 - sz / 2, -80 - p * 30 - sz / 2, sz, sz, ph >= 3 ? '#1a1a1e' : '#8a8a90');
      }
      G.globalAlpha = ga;
      if (ph >= 3) {
        for (i = 0; i < 9; i++) {
          var fh = 3 + R(abs(sin(t * 17 + i * 2.3)) * 7), fx0 = -6 + i * 7 + R(sin(t * 9 + i) * 1);
          r(fx0, -62 - fh, 4, fh, '#ff7a1a'); r(fx0 + 1, -62 - fh + 2, 2, max(1, fh - 3), '#ffe04a');
        }
        for (i = 0; i < 3; i++) { var fh2 = 3 + R(abs(sin(t * 15 + i * 4.1)) * 5); r(-38 + i * 10, -98 - fh2, 4, fh2, '#ff7a1a'); r(-37 + i * 10, -98 - fh2 + 2, 2, max(1, fh2 - 3), '#ffe04a'); }
      }
    }
    HX = -25; HY = -99 + jit;
  }

  // ---- second batch: rat / sniper / balloon / knight / medic
  function dRat(e, t) {
    var wk = e.walk || 0, k = sin(wk * 2) > 0 ? 1 : 0, tw = R(sin(wk * 1.3) * 2), sg = tw > 0 ? 1 : (tw < 0 ? -1 : 0);
    var fur = '#6e665c', furD = '#474139', furL = '#958c7e', pink = '#ee93a4', pinkD = '#b9677a';
    d(3, -3, 2, 1, pinkD); d(5, -3 - sg, 1, 1, pink); d(6, -3 - tw, 1, 1, pink); d(7, -3 - tw - sg, 1, 1, pink);   // whipping tail
    r(-2 + k, -1, 1, 1, furD); r(1 - k, -1, 1, 1, furD); r(3 + k, -1, 1, 1, furD);                                  // scuttling legs
    r(-3, -4, 6, 3, fur); r(-1, -5, 4, 1, fur);                                                                    // body + haunch
    d(-1, -5, 3, 1, furL); d(0, -2, 3, 1, furD);
    r(-5, -3, 2, 2, fur);                                                                                          // head
    d(-3, -5, 1, 1, pink);                                                                                         // ear
    d(-5, -3, 1, 1, sin(t * 7 + (e.seed || 0) * 9) > -0.6 ? '#f4ff5a' : '#9ab82a');                                // glowing eye
    d(-6, -2, 1, 1, pink);                                                                                         // nose
    HX = -3; HY = -6;
  }

  function dSniper(e, t) {
    var att = e.state === 'attack', s = sin(e.walk || 0), a = att ? (e.atk || 0) : 0;
    var bob = att ? 0 : (s > 0 ? 0 : 1), l = att ? 0 : R(s * 2);
    var skin = '#8fa650', skinD = '#667a38', vest = '#7b6c44', vestD = '#574b2e', pants = '#353a2a', pantsD = '#272b1f';
    var cap = '#a63a2c', capD = '#782720', capL = '#d8694a', wood = '#a8743e', woodD = '#77502a', band = '#e9dfb8';
    // band pull: rests between the prongs, drawn back to the cheek as atk goes 0 -> 1, twangs right after release
    var twang = (att && a < 0.08) ? (sin(t * 70) > 0 ? 1 : -1) : 0;
    var px = -10 + R(a * 11) + twang, py = -22 + bob + R(a * 1);
    SH = att ? 0.03 : 0.10; OX = 1;
    r(-8, -19 + bob, 6, 2, skinD);                                   // fork arm (far side), held straight out
    r(-3 + l, -11, 2, 10, pants); r(-4 + l, -1, 4, 1, '#17181b');    // lanky legs
    r(1 - l, -11, 2, 10, pantsD); r(0 - l, -1, 4, 1, '#17181b');
    r(-3, -20 + bob, 6, 9, vest);                                    // hunting vest
    d(1, -20 + bob, 2, 9, vestD); d(-3, -18 + bob, 2, 2, '#e8842a'); d(-2, -15 + bob, 3, 2, vestD); d(-3, -12 + bob, 6, 1, '#2a2418');
    r(2, -13 + bob, 3, 3, '#5a4630'); d(2, -13 + bob, 3, 1, '#7a6444'); d(3, -14 + bob, 1, 1, '#b8b8b0');   // pebble bag
    r(-4, -26 + bob, 6, 6, skin);                                    // head
    d(-4, -21 + bob, 6, 1, skinD);
    if (a > 0.3) { d(-4, -24 + bob, 2, 1, '#111111'); d(-5, -22 + bob, 1, 1, '#e86a7a'); }               // squint + tongue while aiming
    else { d(-4, -24 + bob, 2, 1, '#f4f0c8'); d(-4, -24 + bob, 1, 1, '#111111'); }
    d(-4, -22 + bob, 3, 1, '#1c2412');
    r(-5, -28 + bob, 7, 2, cap); r(-7, -26 + bob, 3, 1, capD);       // hunting cap + brim
    d(1, -26 + bob, 1, 3, capD);                                     // ear flap
    d(-4, -28 + bob, 1, 1, capL); d(-2, -27 + bob, 1, 1, capL); d(0, -28 + bob, 1, 1, capL);
    r(-10, -19 + bob, 2, 5, wood); r(-12, -20 + bob, 6, 1, wood);    // big slingshot: handle + yoke
    r(-12, -24 + bob, 1, 4, wood); r(-7, -24 + bob, 1, 4, wood);     // prongs
    d(-10, -16 + bob, 2, 1, woodD); d(-12, -24 + bob, 1, 1, '#d8343a'); d(-7, -24 + bob, 1, 1, '#d8343a');
    r(-10, -18 + bob, 3, 2, skinD);                                  // fork hand
    dseg(-12, -24 + bob, px, py, 1, band); dseg(-7, -24 + bob, px, py, 1, band);   // rubber bands
    var ex = min(5, px + 4), ey = -19 + bob;
    seg(0, -19 + bob, ex, ey, 2, vest);                              // pulling arm: sleeve, forearm, hand on the pouch
    seg(ex, ey, px + 1, py + 1, 2, skin);
    r(px, py, 2, 2, a > 0.04 ? '#b8b8b0' : '#5a4630');
    HX = -1; HY = -29 + bob;
  }

  function dBalloon(e, t) {
    var sd = e.seed || 0, wob = sin(t * 4 + sd * 7) * 0.05, sx0 = SX, sy0 = SY;
    var sway = R(sin(t * 3 + sd * 5)), flap = sin(t * 11 + sd * 3) > 0 ? 1 : 0;
    var skin = '#b6ba4c', skinD = '#868a32', skinL = '#d6da70', shine = '#f2f6b8';
    var boil = sin(t * 5 + sd * 9) > 0 ? '#e4ff52' : '#aad834';
    SX *= 1 + wob; SY *= 1 - wob;
    r(-6 + sway, -8, 3, 5, skinD); r(-7 + sway, -3, 4, 2, '#3a2c1c');     // stubby dangling legs
    r(3 + sway, -8, 3, 5, skinD);  r(2 + sway, -3, 4, 2, '#3a2c1c');
    r(-1, -9, 3, 3, skinD); r(-2, -6, 5, 1, skinL);                       // knotted navel
    d(0, -5, 1, 2, '#e8e0c8'); d(sway, -3, 1, 3, '#e8e0c8');              // string
    r(-14, -18 - flap, 3, 2, skin); r(11, -18 + flap, 3, 2, skinD);       // tiny flapping arms
    r(-6, -28, 12, 2, skin); r(-9, -26, 18, 3, skin); r(-11, -23, 22, 4, skin);   // inflated body (stacked rows)
    r(-12, -19, 24, 7, skin); r(-11, -12, 22, 3, skin); r(-7, -9, 14, 1, skin);
    d(-11, -12, 22, 2, skinD); d(-7, -10, 14, 2, skinD); d(7, -24, 4, 12, skinD); d(10, -19, 2, 7, skinD);
    d(-8, -26, 5, 1, shine); d(-10, -23, 1, 3, shine); d(-9, -24, 2, 1, shine);   // balloon shine
    d(-1, -10, 3, 1, '#5e6220');                                           // seam above the knot
    d(-9, -20, 3, 3, '#f4f0c8'); d(-9, -19, 1, 1, '#111111');              // bulging eyes
    d(-5, -20, 2, 2, '#f4f0c8'); d(-5, -19, 1, 1, '#111111');
    d(-9, -15, 3, 1, '#2a3016'); d(-10, -16, 1, 1, '#2a3016');             // pursed mouth (holding its breath)
    d(-11, -18, 1, 2, '#d89a5a'); d(-4, -17, 1, 1, '#d89a5a');             // puffed cheeks
    d(-2, -24, 3, 3, boil); d(-1, -24, 1, 1, '#f8ffd0');                   // glowing boils
    d(2, -16, 3, 3, boil);  d(3, -16, 1, 1, '#f8ffd0');
    d(-5, -13, 2, 2, boil); d(4, -26, 2, 2, boil); d(-1, -28, 2, 1, boil); d(7, -13, 2, 1, boil);
    SX = sx0; SY = sy0;
    HX = 0; HY = -29;
  }

  function dKnight(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI), bob = s > 0 ? 0 : 1, l = R(s * 2), i, j;
    var iron = '#5b5f66', ironL = '#8d949e', ironD = '#34383e', rust = '#8a4f2c';
    var buck = '#8a9099', buckL = '#bcc2cc', buckD = '#626872', pipe = '#6a7078', valve = '#b83a2a';
    var eye = sin(t * 6 + (e.seed || 0) * 8) > -0.7 ? '#ffe04a' : '#b89a2a';
    r(7, -24 + bob, 4, 10, ironD); r(6, -27 + bob, 6, 4, ironD);       // far arm + shoulder
    r(-7 + l, -11, 6, 9, iron); d(-7 + l, -11, 6, 2, ironL); d(-3 + l, -9, 2, 7, ironD); r(-8 + l, -2, 8, 2, '#1f1d1c');   // stomping greaves
    r(2 - l, -11, 6, 9, ironD); d(2 - l, -11, 6, 1, iron); r(1 - l, -2, 8, 2, '#1f1d1c');
    r(-8, -25 + bob, 17, 15, ironD);                                   // torso
    d(-8, -12 + bob, 17, 2, '#22252a');
    r(-5, -25 + bob, 9, 1, iron); r(-7, -24 + bob, 13, 2, iron); r(-8, -22 + bob, 15, 7, iron);   // chest manhole cover
    r(-7, -15 + bob, 13, 2, iron); r(-5, -13 + bob, 9, 1, iron);
    d(-5, -25 + bob, 9, 1, ironL); d(-7, -24 + bob, 2, 1, ironL); d(-8, -22 + bob, 1, 5, ironL);
    d(-5, -13 + bob, 9, 1, ironD); d(5, -15 + bob, 1, 2, ironD); d(6, -21 + bob, 1, 6, ironD);
    for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) d(-6 + i * 3 + (j & 1), -22 + bob + j * 3, 1, 1, ((i + j) & 1) ? ironL : ironD);   // studs
    d(-2, -20 + bob, 3, 3, ironD); d(-1, -19 + bob, 1, 1, rust);
    d(2, -15 + bob, 2, 1, rust); d(-6, -17 + bob, 1, 2, rust);
    r(-5, -34 + bob, 8, 2, buck); r(-6, -32 + bob, 10, 8, buck);       // bucket helmet
    d(-5, -34 + bob, 8, 1, buckL); d(-6, -32 + bob, 1, 8, buckL); d(2, -32 + bob, 2, 8, buckD); d(-6, -25 + bob, 10, 1, buckD);
    d(-6, -30 + bob, 7, 2, '#0c0e11'); d(-5, -30 + bob, 1, 1, eye); d(-2, -30 + bob, 1, 1, eye);   // eye slit
    d(-4, -27 + bob, 1, 1, buckL); d(0, -27 + bob, 1, 1, buckL); d(1, -33 + bob, 2, 1, buckD);
    d(4, -31 + bob, 1, 5, '#4a4f58');                                  // bucket handle
    r(-3, -35 + bob, 5, 1, '#c8302a'); r(-1, -37 + bob, 1, 2, '#c8a060');   // plunger crest
    var ay = -15 + bob - R(sw * 8), ax = -13 - R(sw * 2);
    seg(-9, -23 + bob, ax + 2, ay + 1, 4, ironD);                      // near arm
    if (a > 0.45) {                                                    // slam: valve-wheel mace swings forward
      r(ax - 11, ay + 1, 12, 2, pipe); r(ax - 15, ay - 2, 5, 7, valve);
      d(ax - 15, ay - 2, 5, 1, '#e0624a'); d(ax - 13, ay, 1, 3, '#7a2018');
    } else {                                                           // carried upright / raised
      r(ax + 1, ay - 13, 2, 13, pipe); r(ax - 2, ay - 17, 7, 5, valve);
      d(ax - 2, ay - 17, 7, 1, '#e0624a'); d(ax, ay - 15, 3, 1, '#7a2018');
    }
    r(ax, ay, 5, 5, iron); d(ax, ay, 5, 1, ironL);                     // gauntlet
    r(-11, -28 + bob, 5, 1, iron); r(-12, -27 + bob, 7, 4, iron); r(-11, -23 + bob, 5, 1, iron);   // near shoulder: small manhole cover
    d(-11, -28 + bob, 5, 1, ironL); d(-10, -26 + bob, 1, 1, ironD); d(-8, -25 + bob, 1, 1, ironD); d(-10, -24 + bob, 1, 1, ironL); d(-7, -26 + bob, 1, 1, rust);
    HX = -1; HY = -38 + bob;
  }

  function dMedic(e, t) {
    var att = e.state === 'attack', s = sin(e.walk || 0), a = e.atk || 0, sw = sin(a * PI), sd = e.seed || 0;
    var bob = s > 0 ? 0 : 1, l = att ? 0 : R(s * 2), lift = att ? R(sw * 2) : 0;
    var skin = '#9cba8c', skinD = '#73906a', coat = '#eef0ea', coatD = '#c2c6be', green = '#2fae5a', greenL = '#7dffa0', hair = '#3a2a3a';
    r(-3 + l, -9, 2, 8, skinD); r(-4 + l, -1, 4, 1, '#f2f2f2');        // legs + nurse shoes
    r(1 - l, -9, 2, 8, '#5f7858'); r(0 - l, -1, 4, 1, '#cfcfcf');
    r(4, -19 + bob, 3, 6, '#c89a5a'); d(4, -18 + bob, 2, 4, '#f6f6f0'); d(4, -19 + bob, 3, 1, '#8a8f93');   // clipboard
    r(-4, -21 + bob, 9, 12, coat); r(-5, -10 + bob, 11, 2, coat);      // white coat
    d(3, -21 + bob, 2, 12, coatD); d(4, -10 + bob, 2, 2, coatD); d(0, -21 + bob, 1, 13, coatD);
    d(-3, -19 + bob, 3, 1, green); d(-2, -20 + bob, 1, 3, green);      // green cross
    d(1, -17 + bob, 1, 1, '#8a8f93'); d(1, -14 + bob, 1, 1, '#8a8f93');
    d(-3, -12 + bob, 2, 1, '#9ad04a'); d(-2, -11 + bob, 1, 1, '#6aa01a');   // slime stain
    r(-4, -29 + bob, 7, 8, skin);                                      // head
    r(3, -28 + bob, 2, 3, hair);                                       // hair bun
    d(-4, -29 + bob, 7, 1, hair);
    r(-4, -31 + bob, 7, 2, '#f6f6f2'); d(-2, -30 + bob, 3, 1, green); d(-1, -31 + bob, 1, 2, green);   // nurse cap
    d(-4, -27 + bob, 2, 2, '#f4f0c8'); d(-4, -27 + bob, 1, 1, '#111111');   // cat-eye glasses
    d(-1, -27 + bob, 2, 2, '#f4f0c8'); d(-1, -27 + bob, 1, 1, '#111111');
    d(-2, -27 + bob, 1, 1, '#c8302a'); d(-5, -28 + bob, 1, 1, '#c8302a');
    d(-4, -24 + bob, 5, 2, '#cfe8e0'); d(1, -24 + bob, 2, 1, '#9fc0b8');     // surgical mask
    var y0 = -19 + bob - lift, lv = att ? 2 + R((1 - a) * 5) : 6;
    r(-7, -19 + bob, 4, 2, coat);                                      // sleeve
    r(-9, y0 - 10, 3, 10, '#dff6f2');                                  // giant syringe barrel
    d(-9, y0 - lv, 3, lv, sin(t * 6 + sd * 4) > 0 ? '#5ae07a' : '#48c868');
    d(-9, y0 - 10, 1, 10, '#ffffff'); d(-8, y0 - 8, 2, 1, '#9ab8b4'); d(-8, y0 - 5, 2, 1, '#9ab8b4');
    r(-10, y0, 5, 1, '#8a9099');                                       // flange, plunger rod, thumb rest
    r(-8, y0 + 1, 1, 3, '#8a9099'); r(-9, y0 + 4, 3, 1, '#8a9099');
    r(-8, y0 - 14, 1, 4, '#e8eef0');                                   // needle
    if (att) { var dp = (t * 2 + sd) % 1; d(-8, y0 - 15 - R(dp * 4), 1, 1, greenL); d(-9 - (dp > 0.5 ? 1 : 0), y0 - 15 - R(dp * 2), 1, 1, greenL); }
    else d(-8, y0 - 15, 1, 1, sin(t * 3 + sd) > 0.4 ? greenL : '#e8eef0');
    r(-8, y0 - 1, 3, 2, skin);                                         // gripping hand
    HX = -1; HY = -32 + bob;
  }

  // ---- third batch: gnat / bomber / helmet / fridge
  function dGnat(e, t) {
    var sd = e.seed || 0, f = sin(t * 46 + sd * 20), bob = R(sin(t * 7 + sd * 8)), tw = R(sin(t * 5 + sd * 4));
    var body = '#6a7040', bodyD = '#3c4226', tail = '#a8ae78', wing = '#d8f0e8';
    var glow = sin(t * 9 + sd * 11) > -0.5 ? '#eaff6a' : '#a8c83a';
    d(2, -3 + bob, 1, 1, bodyD);                                       // long trailing tail filaments
    d(3, -3 + bob + tw, 1, 1, tail); d(4, -4 + bob + tw, 1, 1, tail);
    d(3, -2 + bob, 1, 1, tail); d(4, -1 + bob - tw, 1, 1, tail);
    r(-2, -4 + bob, 4, 2, body); d(0, -3 + bob, 2, 1, bodyD);          // thorax + abdomen
    r(-4, -4 + bob, 2, 2, bodyD);                                      // head
    d(-4, -4 + bob, 1, 1, glow);                                       // glowing dot eye
    if (PASS === 1) {                                                  // translucent, fast-beating wings
      var ga = G.globalAlpha; G.globalAlpha = ga * 0.65;
      if (f > 0) { r(-2, -7 + bob, 2, 3, wing); r(0, -6 + bob, 2, 2, wing); }
      else { r(-2, -5 + bob, 5, 1, wing); r(-1, -2 + bob, 3, 1, wing); }
      G.globalAlpha = ga;
    }
    HX = -2; HY = -7 + bob;
  }

  function dBomber(e, t) {
    var s = sin(e.walk || 0), c = cos(e.walk || 0), a = e.atk || 0, sw = sin(a * PI), sd = e.seed || 0;
    var bob = abs(s) > 0.7 ? -1 : 0, l = R(s * 4), k = R(c * 2);
    var skin = '#93aa52', skinD = '#6a7c38', uni = '#c8502a', uniD = '#8f3418', cyl = '#9aa2aa', cylD = '#6a727a', cylL = '#ccd4da';
    var fl = sin(t * 31 + sd * 9) > 0;
    SH = 0.22; OX = 2;
    r(-2 + l, -10, 3, 8 - max(0, k), '#2a2e3a'); r(-3 + l, -2 - max(0, k), 5, 2, '#e8e8e8');     // pumping legs
    r(0 - l, -10, 3, 8 - max(0, -k), '#1e222c'); r(-1 - l, -2 - max(0, -k), 5, 2, '#bcbcbc');
    r(3, -23 + bob, 7, 13, cyl); r(4, -25 + bob, 5, 2, cyl);                                       // LPG cylinder on the back
    d(8, -23 + bob, 2, 13, cylD); d(3, -23 + bob, 1, 13, cylL); d(4, -25 + bob, 2, 1, cylL);
    d(3, -11 + bob, 7, 1, cylD); d(3, -20 + bob, 7, 1, cylD);                                      // foot ring + weld seam
    d(4, -18 + bob, 4, 4, '#f2c230'); d(5, -17 + bob, 2, 2, '#1c1c20'); d(6, -18 + bob, 1, 1, '#1c1c20');   // hazard sticker
    r(5, -27 + bob, 3, 2, '#d8343a'); d(5, -27 + bob, 3, 1, '#ff6a5a');                            // red valve cap
    d(7, -28 + bob, 1, 1, '#3a2a1a');                                                              // lit fuse + flickering spark
    d(7 + (fl ? 1 : 0), -29 + bob, 1, 1, fl ? '#fff6a0' : '#ff8a1a'); d(8, -30 + bob, 1, 1, fl ? '#ff8a1a' : '#fff6a0');
    if (hash(FL(t * 14) + sd * 7) > 0.5) d(9, -31 + bob, 1, 1, '#ffd23a');
    r(2 + R(s * 3), -17 + bob, 2, 6, skinD);                                                       // far arm
    r(-3, -20 + bob, 7, 11, uni); d(2, -20 + bob, 2, 11, uniD);                                    // delivery jacket
    d(-3, -17 + bob, 7, 1, '#22262a'); d(0, -20 + bob, 1, 11, '#22262a');                          // cylinder straps
    d(-3, -12 + bob, 3, 1, '#f4f060');                                                             // reflective tape
    r(-4, -27 + bob, 6, 7, skin);                                                                  // head
    d(-4, -24 + bob, 2, 1, '#f4f0c8'); d(-4, -24 + bob, 1, 1, '#111111');
    d(-4, -22 + bob, 3, 1, '#1c2412'); d(-3, -22 + bob, 1, 1, '#ecebc8');                          // manic grin
    r(-5, -29 + bob, 8, 3, '#ece8dc'); r(-6, -27 + bob, 2, 1, '#22262a');                          // delivery helmet + visor lip
    d(-5, -27 + bob, 8, 1, '#c8302a'); d(-5, -29 + bob, 3, 1, '#ffffff'); d(2, -26 + bob, 1, 3, '#22262a');
    var ax = -6 - R(s * 3), ay = -17 + bob - R(sw * 3);
    r(ax, ay, 5, 2, uni); r(ax - 2, ay, 2, 2, skin);                                               // near arm pumping
    HX = -1; HY = -30 + bob;
  }

  function dHelmet(e, t) {
    var sd = e.seed || 0, f = sin(t * 22 + sd * 10), bob = R(sin(t * 6 + sd * 6));
    var body = '#7f8996', bodyD = '#5a626e', wing = '#9ca6b2', hat = '#f2c230', hatD = '#c4962a', hatL = '#ffe680', steel = '#aab2bc', steelD = '#6a727c';
    r(4, -7 + bob, 4, 2, bodyD);                                                                   // tail
    r(-4, -8 + bob, 9, 5, body); d(-3, -4 + bob, 7, 1, bodyD);                                     // body
    d(-4, -8 + bob, 4, 4, steel); d(-4, -5 + bob, 4, 1, steelD); d(-1, -8 + bob, 1, 4, steelD);    // riveted chest plate
    d(-4, -8 + bob, 1, 1, '#e8eef4'); d(-2, -8 + bob, 1, 1, '#3a4048'); d(-4, -6 + bob, 1, 1, '#3a4048'); d(-2, -6 + bob, 1, 1, '#3a4048');
    r(-7, -10 + bob, 4, 4, body);                                                                  // head
    d(-7, -9 + bob, 1, 1, '#ff3a2a'); d(-5, -9 + bob, 1, 1, '#ff3a2a');                            // eyes (the third one is under the hat)
    r(-9, -8 + bob, 2, 1, '#e8a02a');                                                              // beak
    d(-4, -10 + bob, 1, 4, '#22262a');                                                             // chin strap
    r(-7, -13 + bob, 5, 2, hat); r(-9, -11 + bob, 7, 1, hat);                                      // hard hat: dome + brim
    d(-7, -13 + bob, 2, 1, hatL); d(-5, -13 + bob, 1, 2, hatD); d(-3, -13 + bob, 1, 2, hatD); d(-6, -11 + bob, 4, 1, hatD);
    if (f > 0.3) { r(-2, -13 + bob, 6, 5, wing); d(-1, -13 + bob, 4, 1, '#c4ccd4'); }
    else if (f > -0.3) { r(-2, -9 + bob, 7, 3, wing); }
    else { r(-2, -6 + bob, 6, 5, wing); d(-1, -2 + bob, 4, 1, bodyD); }
    d(-1, -3 + bob, 1, 2, '#e8a02a'); d(2, -3 + bob, 1, 2, '#e8a02a');
    HX = -5; HY = -14 + bob;
  }

  function dFridge(e, t) {
    var s = sin(e.walk || 0), a = e.atk || 0, sd = e.seed || 0, bob = s > 0 ? 0 : 1, l = R(s * 2), i;
    var steel = '#b4bcc6', steelL = '#e2e8ee', steelD = '#7e8894', dark = '#23272e', arm = '#59616c', armD = '#3d444e', armL = '#7c8692';
    var glow = sin(t * 5 + sd * 8) > 0 ? '#e4fcff' : '#9fe8fb', glowD = '#5fc4e6';
    // both arms: hang at rest, rise together, slam down in front (left)
    var shx = -12, shy = -28 + bob, ex, ey, hx, hy, k;
    if (a <= 0) { ex = shx - 2; ey = shy + 9; hx = ex - 1 + R(s * 2); hy = ey + 9; }
    else if (a < 0.5) { k = a / 0.5; ex = shx - 2 - 2 * k; ey = shy + 9 - 12 * k; hx = ex + 1; hy = ey + 9 - 22 * k; }
    else { k = (a - 0.5) / 0.5; ex = shx - 4 - 2 * k; ey = shy - 3 + 8 * k; hx = ex + 1 - 6 * k; hy = ey - 13 + 26 * k; }
    seg(12, shy, 12 - (ex - shx), ey, 5, armD); seg(12 - (ex - shx), ey, 12 - (hx - shx) * 0.6, hy, 5, armD);   // far arm (darker mirror)
    r(-9 + l, -7, 7, 5, arm); r(-10 + l, -2, 9, 2, dark);                                          // stubby stomping legs
    r(3 - l, -7, 7, 5, armD); r(2 - l, -2, 9, 2, dark);
    r(-11, -39 + bob, 22, 33, steel);                                                              // cabinet
    d(-11, -39 + bob, 22, 1, steelL); d(-11, -39 + bob, 1, 33, steelL); d(8, -38 + bob, 3, 32, steelD); d(-11, -7 + bob, 22, 1, steelD);
    d(-10, -9 + bob, 20, 2, dark); for (i = 0; i < 6; i++) d(-9 + i * 3, -9 + bob, 1, 2, steelD);  // kick-plate vent
    d(-1, -38 + bob, 2, 28, glowD); d(-1, -38 + bob, 1, 28, glow);                                 // door gap leaking cold light
    d(-3, -31 + bob, 1, 15, '#4a525c'); d(2, -31 + bob, 1, 15, '#4a525c');                         // door handles
    d(-3, -31 + bob, 1, 1, steelL); d(2, -31 + bob, 1, 1, steelL);
    d(-8, -35 + bob, 4, 2, glow); d(4, -35 + bob, 4, 2, glow);                                     // frosted eyes on the freezer half
    d(-7, -35 + bob, 2, 1, '#103a52'); d(5, -35 + bob, 2, 1, '#103a52');
    d(-9, -37 + bob, 3, 1, dark); d(-6, -36 + bob, 2, 1, dark); d(6, -37 + bob, 3, 1, dark); d(4, -36 + bob, 2, 1, dark);   // angry brows
    d(-9, -24 + bob, 2, 2, '#e8483a'); d(-6, -19 + bob, 2, 2, '#f2c230'); d(-8, -14 + bob, 3, 2, '#5fbf4a'); d(5, -26 + bob, 2, 2, '#3f8fe0');   // fridge magnets
    d(4, -21 + bob, 5, 6, '#f6f2d8'); d(5, -19 + bob, 3, 1, '#8a8a80'); d(5, -17 + bob, 2, 1, '#8a8a80'); d(5, -22 + bob, 3, 1, '#d8cfa0');     // taped note
    d(-11, -12 + bob, 3, 1, '#8a4f2c'); d(7, -30 + bob, 2, 1, '#8a4f2c');                          // rust
    if (PASS === 1 && !T_SIL) {                                                                    // frost puffs drifting out of the gap
      var ga = G.globalAlpha;
      for (i = 0; i < 3; i++) { var p = (t * 0.7 + i / 3 + sd) % 1; G.globalAlpha = ga * (1 - p) * 0.7; r(-2 - R(p * 6) - i, -30 + bob + i * 7 - R(p * 5), 2 + (i & 1), 2, '#f2fcff'); }
      G.globalAlpha = ga;
    }
    seg(shx, shy, ex, ey, 6, arm); seg(ex, ey, hx, hy, 5, arm);                                    // near arm
    r(hx - 3, hy - 3, 7, 7, armL); d(hx - 3, hy - 3, 7, 1, steelL); d(hx - 1, hy, 3, 1, armD);     // fist
    d(shx - 2, shy - 2, 5, 1, glowD); d(ex - 2, ey, 4, 1, glowD);                                  // frosty joints
    HX = 0; HY = -40 + bob;
  }

  var BASE = {
    shambler: [16, 30], runner: [14, 26], roach: [10, 6], bloater: [26, 32], shell: [22, 26], spitter: [16, 28],
    pigeon: [16, 12], burrower: [18, 20], shield: [20, 30], jelly: [20, 18], howler: [16, 32], brute: [30, 44],
    courier: [16, 30], dummy: [18, 34], boss_roach: [90, 50], boss_gym: [60, 90], boss_redev: [120, 110],
    rat: [9, 6], sniper: [14, 28], balloon: [24, 28], knight: [24, 34], medic: [16, 30],
    gnat: [8, 6], bomber: [16, 28], helmet: [16, 13], fridge: [30, 40]
  };
  var DRAW = {
    shambler: dShambler, runner: dRunner, roach: dRoach, bloater: dBloater, shell: dShell, spitter: dSpitter,
    pigeon: dPigeon, burrower: dBurrower, shield: dShield, jelly: dJelly, howler: dHowler, brute: dBrute,
    courier: dCourier, dummy: dDummy, boss_roach: dBossRoach, boss_gym: dBossGym, boss_redev: dBossRedev,
    rat: dRat, sniper: dSniper, balloon: dBalloon, knight: dKnight, medic: dMedic,
    gnat: dGnat, bomber: dBomber, helmet: dHelmet, fridge: dFridge
  };

  // status overlays in screen space, inside the hitbox
  function fxOverlay(e, t, w, h, fx, type) {
    var c = G, x0 = R(e.x - w / 2), y0 = R(e.y - h), sd = e.seed || 0, i, ga = c.globalAlpha, n, k;
    if (fx.freeze >= 1) {
      c.globalAlpha = ga * 0.28; F(c, x0 - 1, y0 - 1, R(w) + 2, R(h) + 2, '#c4ecff');
      c.globalAlpha = ga * 0.9;
      F(c, x0 - 1, y0 - 1, max(2, R(w * 0.4)), 1, '#ffffff'); F(c, x0 - 1, y0 - 1, 1, max(2, R(h * 0.3)), '#ffffff');
      n = max(2, min(7, R(w / 6)));
      for (i = 0; i < n; i++) { var ix = x0 + R((i + 0.5) / n * w), il = 2 + R(hash(i * 3.3 + sd * 17) * 3); F(c, ix, R(e.y - h * 0.45), 1, il, '#e4f6ff'); F(c, ix, R(e.y) - 1, 2, 1, '#e4f6ff'); }
      c.globalAlpha = ga;
    }
    if (fx.burn) {
      n = max(2, min(9, R(w / 5)));
      for (i = 0; i < n; i++) {
        var bx = x0 + R((i + 0.5) / n * w + sin(t * 9 + i * 3) * 1);
        var by = R(e.y - h * (0.25 + 0.65 * hash(i * 1.7 + sd * 31)));
        var fh = 2 + R(abs(sin(t * 18 + i * 2.1 + sd * 9)) * 3);
        F(c, bx, by - fh, 2, fh, '#ff7a1a'); F(c, bx, by - fh + 1, 1, max(1, fh - 2), '#ffe04a');
        if (hash(FL(t * 12) + i * 5.1) > 0.7) F(c, bx + (i & 1 ? 2 : -1), by - fh - 2, 1, 1, '#ffb03a');
      }
    }
    if (fx.acid) {
      n = max(2, min(6, R(w / 6)));
      for (i = 0; i < n; i++) {
        var ax = x0 + R(hash(i * 2.9 + sd * 13) * (w - 1)), ay = y0 + R(((t * 14 + i * 9 + sd * 30) % max(4, h)));
        F(c, ax, ay, 1, 2, '#b8f03a'); F(c, ax, ay + 2, 1, 1, '#6aa01a');
      }
      k = FL(t * 5); F(c, x0 + R(hash(k + sd) * w), y0 + R(hash(k * 1.7) * h * 0.4), 2, 2, '#dcff7a');
    }
    if (fx.shock) {
      k = FL(t * 16);
      for (i = 0; i < 2; i++) {
        var zx = x0 + R(hash(k + i * 3.1 + sd) * w), zy = y0 + R(hash(k * 1.3 + i * 7.7) * h * 0.6), j;
        for (j = 0; j < 4; j++) { var nx = zx + (hash(k + i + j * 1.9) > 0.5 ? 2 : -2); pline(c, zx, zy, nx, zy + 3, j & 1 ? '#fff6a0' : '#ffffff'); zx = nx; zy += 3; if (zy > e.y) break; }
      }
    }
    if (fx.mark) {
      k = FL(t * 4);
      for (i = 0; i < 3; i++) {
        var mx = x0 + R(hash(k + i * 4.3 + sd * 3) * w), my = y0 + R(hash(k * 2.1 + i * 9.1) * h * 0.8);
        var big = ((t * 4) % 1) < 0.5;
        F(c, mx, my, 1, 1, '#ffffff');
        if (big) { F(c, mx - 1, my, 3, 1, i === 1 ? '#ff9ad8' : '#fff6a0'); F(c, mx, my - 1, 1, 3, i === 1 ? '#ff9ad8' : '#fff6a0'); F(c, mx, my, 1, 1, '#ffffff'); }
      }
    }
    if (fx.enrage) {
      for (i = 0; i < 3; i++) {
        var p = (t * 1.4 + i / 3 + sd) % 1, sz = 1 + R(p * 2);
        c.globalAlpha = ga * (1 - p) * 0.6;
        F(c, x0 + R(w * (0.25 + i * 0.25) + sin(t * 3 + i) * 1), y0 - R(p * 9) - sz, sz, sz, '#ffd0c0');
      }
      c.globalAlpha = ga;
      // anger mark
      var qx = PX + R((HX + 5) * SX), qy = PY + R((HY + 1) * SY);
      if (sin(t * 8) > -0.4) { F(c, qx, qy - 1, 1, 2, '#ff2a1a'); F(c, qx + 3, qy - 1, 1, 2, '#ff2a1a'); F(c, qx + 1, qy - 2, 2, 1, '#ff2a1a'); F(c, qx + 1, qy + 1, 2, 1, '#ff2a1a'); }
    }
  }

  function drawEnemyCore(e, t, sil) {
    var type = DRAW[e.type] ? e.type : 'shambler', b = BASE[type], fn = DRAW[type];
    var w = e.w > 0 ? e.w : b[0], h = e.h > 0 ? e.h : b[1];
    var fx = e.fx || NOFX, st = e.state, sd = e.seed || 0, i;
    var die = st === 'dying' ? clamp01(e.die) : 0;
    var sx = w / b[0], sy = h / b[1], alpha = 1;
    if (die > 0) { sy *= 1 - 0.62 * die; sx *= 1 + 0.3 * die; alpha = 1 - die * die; }
    if (st === 'flee') sx = -sx;
    PX = R(e.x); PY = R(e.y); SX = sx; SY = sy; SH = 0; OX = 0; EXP = 1; HX = 0; HY = -b[1];
    var ga = G.globalAlpha;
    if (sil) { T_SIL = sil; PASS = 1; G.globalAlpha = ga * alpha; fn(e, t); T_SIL = null; G.globalAlpha = ga; SH = 0; OX = 0; return; }
    var burrowed = type === 'burrower' && st === 'burrow';
    var flying = type === 'pigeon' || type === 'balloon' || type === 'gnat' || type === 'helmet' || st === 'fly' || (type === 'boss_roach' && (e.phase || 1) >= 2);
    // ground shadow
    if (!flying && !burrowed && type !== 'roach' && type !== 'rat') {
      G.globalAlpha = ga * alpha * 0.3;
      F(G, R(e.x - w * 0.42), R(e.y) - 1, max(2, R(w * 0.84)), 2, '#000000');
    }
    G.globalAlpha = ga * alpha;
    setTint(e.flash, fx.freeze, fx.enrage);
    if (type === 'jelly' || burrowed) { PASS = 1; fn(e, t); }
    else {
      if (e.elite && die <= 0) {
        PASS = 0; EXP = 2; OUTC = sin(t * 6 + sd * 9) > 0 ? '#ffd23a' : '#ff8a1a';
        G.globalAlpha = ga * 0.6; fn(e, t); G.globalAlpha = ga * alpha; EXP = 1; SH = 0; OX = 0;
      }
      OUTC = OUTLINE; PASS = 0; fn(e, t);
      PASS = 1; SH = 0; OX = 0; fn(e, t);
    }
    TK = 0;
    if (die <= 0 && !burrowed) {
      if (e.hpFrac < 0.5 && type !== 'jelly' && type !== 'dummy' && h >= 12) {      // wounds
        var nw = e.hpFrac < 0.25 ? 4 : 2;
        for (i = 0; i < nw; i++) F(G, R(e.x - w * 0.3 + hash(i * 3.7 + sd * 23) * w * 0.6), R(e.y - h * (0.25 + hash(i * 5.3 + sd * 41) * 0.45)), 2, 1 + (i & 1), i & 1 ? '#7a1418' : '#b0242a');
      }
      if (e.elite) {                                                 // crown-ish spikes
        d(HX - 3, HY - 1, 7, 1, '#ffd23a'); d(HX - 3, HY - 3, 1, 2, '#ffd23a'); d(HX, HY - 4, 1, 3, '#fff08a'); d(HX + 3, HY - 3, 1, 2, '#ffd23a'); d(HX, HY - 1, 1, 1, '#ff3a5a');
      }
      if (st === 'stun') {
        for (i = 0; i < 3; i++) { var an = t * 6 + i * 2.094; d(HX + cos(an) * 5, HY - 3 + sin(an) * 1.5, 1, 1, i ? '#ffe04a' : '#ffffff'); }
      }
      if (type === 'howler') {
        for (i = 0; i < 2; i++) {
          var ph = (t * 0.9 + i * 0.5 + sd) % 1;
          G.globalAlpha = ga * (1 - ph) * 0.55;
          ring(G, PX + R(-10 * SX), PY + R(-25 * SY), R(4 + ph * 22), i ? '#ffe04a' : '#ff4fa0');
        }
        G.globalAlpha = ga;
      }
      if (type === 'medic' && st === 'attack') {                     // healing pulse: green rings + rising plus signs
        for (i = 0; i < 2; i++) {
          var mp = (t * 0.8 + i * 0.5 + sd) % 1;
          G.globalAlpha = ga * (1 - mp) * 0.5;
          ring(G, PX, PY + R(-12 * SY), R(5 + mp * 20), i ? '#8effa0' : '#3ad06a');
        }
        for (i = 0; i < 3; i++) {
          var pp = (t * 0.7 + i / 3 + sd * 1.7) % 1;
          var qx2 = PX + R((-9 + i * 8 + sin(t * 2 + i * 2) * 2) * SX), qy2 = PY + R((-10 - pp * 22) * SY);
          G.globalAlpha = ga * (1 - pp) * 0.9;
          F(G, qx2 - 1, qy2, 3, 1, '#8effa0'); F(G, qx2, qy2 - 1, 1, 3, '#8effa0');
        }
        G.globalAlpha = ga;
      }
      fxOverlay(e, t, w, h, fx, type);
    }
    G.globalAlpha = ga; SH = 0; OX = 0; PASS = 1;
  }

  function enemy(ctx, e, t) {
    if (!ctx || !e) return;
    ctx.save();
    try { G = ctx; drawEnemyCore(e, t || 0, null); } catch (err) { /* never throw */ }
    TK = 0; T_SIL = null; PASS = 1; SH = 0; OX = 0; EXP = 1;
    ctx.restore();
  }

  function projectileEnemy(ctx, p, t) {
    if (!ctx || !p) return;
    ctx.save();
    try {
      var c = ctx, x = R(p.x), y = R(p.y), rot = p.rot || 0, k = p.kind, i;
      t = t || 0;
      if (k === 'spit') {
        var vx = typeof p.vx === 'number' ? p.vx : -1, vy = typeof p.vy === 'number' ? p.vy : 0, vl = sqrt(vx * vx + vy * vy) || 1;
        vx /= vl; vy /= vl;
        F(c, R(x - vx * 5) - 1, R(y - vy * 5) - 1, 2, 2, '#6aa01a'); F(c, R(x - vx * 8), R(y - vy * 8), 1, 1, '#6aa01a');
        F(c, x - 3, y - 2, 6, 4, '#1c3a10'); F(c, x - 2, y - 3, 4, 6, '#1c3a10');
        F(c, x - 2, y - 2, 4, 4, '#a8e03a'); F(c, x - 2, y - 2, 2, 1, '#e8ff9a'); F(c, x, y + 1, 2, 1, '#6aa01a');
      } else if (k === 'poop') {
        F(c, x - 2, y - 3, 4, 6, '#1c1c20'); F(c, x - 3, y - 1, 6, 4, '#1c1c20');
        F(c, x - 1, y - 2, 2, 4, '#f6f6ee'); F(c, x - 2, y, 4, 2, '#f6f6ee'); F(c, x, y, 1, 1, '#9ab04a');
        F(c, x, y - 5, 1, 2, '#f6f6ee');
      } else if (k === 'barbell') {
        var cx = cos(rot), sy = sin(rot), L = 8;
        pline(c, R(x - cx * L) - 1, R(y - sy * L) - 1, R(x + cx * L) - 1, R(y + sy * L) - 1, '#15171c', 3);
        pline(c, R(x - cx * L), R(y - sy * L), R(x + cx * L), R(y + sy * L), '#c4cad2', 1);
        for (i = -1; i <= 1; i += 2) {
          var ex = R(x + cx * L * i), ey = R(y + sy * L * i);
          F(c, ex - 4, ey - 4, 8, 8, '#15171c'); F(c, ex - 3, ey - 3, 6, 6, '#2c2e36'); F(c, ex - 1, ey - 1, 2, 2, '#c8302a');
        }
      } else if (k === 'notice') {
        var wv = cos(rot), pw = max(2, R(abs(wv) * 7) + 1), hx = pw >> 1;
        F(c, x - hx - 1, y - 6, pw + 2, 12, '#1c1c20');
        F(c, x - hx, y - 5, pw, 10, wv > 0 ? '#f6f2e4' : '#dcd6c4');
        if (pw >= 5) {
          F(c, x - hx + 1, y - 4, pw - 2, 1, '#c8302a');
          F(c, x - hx + 1, y - 2, pw - 2, 1, '#7a7a7a'); F(c, x - hx + 1, y, pw - 3, 1, '#7a7a7a');
          F(c, x + hx - 3, y + 2, 2, 2, '#c8302a');
        }
      } else { // rock
        var q = (FL(rot / (PI / 2)) % 4 + 4) % 4;
        F(c, x - 4, y - 3, 8, 6, '#15171c'); F(c, x - 3, y - 4, 6, 8, '#15171c');
        F(c, x - 3, y - 3, 6, 6, '#7a7f88'); F(c, x - 3, y - 3, 3, 2, '#a4aab4');
        F(c, x + (q & 1 ? -2 : 1), y + (q & 2 ? -2 : 1), 2, 2, '#4d525a'); F(c, x + (q & 2 ? 1 : -3), y, 2, 1, '#4d525a');
      }
    } catch (err) { /* never throw */ }
    ctx.restore();
  }

  // ================================================================= PLAYER / TURRET / DOG
  function playerBody(o) {
    var t = o.t || 0, aim = o.aim || 0, rec = clamp01(o.recoil), rl = !!o.reloading;
    var ca = cos(aim), sa = sin(aim), kx = -R(rec * 2), br = sin(t * 2.4) > 0.5 ? 1 : 0;
    var skin = '#e2aa7c', skinD = '#b9825a', hair = '#3b2a22', denim = '#3f5878', denimD = '#2c4059',
        shirt = '#7c8a56', shirtD = '#5c6840', apron = '#8f5e2e', apronD = '#6b4420', boot = '#2b1d15', metal = '#aab2ba';
    var gx = 6 + kx, gy = -18;
    // far arm -> support hand on the handguard
    var fhx = gx + ca * (8 - rec * 2), fhy = gy + sa * (8 - rec * 2) + 1;
    if (rl) { var k = 0.5 + 0.5 * sin(t * 9); fhx += (3 + kx - fhx) * k; fhy += (-10 - fhy) * k; }
    seg(1 + kx, -19 + br, fhx, fhy, 2, shirtD);
    r(fhx - 1, fhy - 1, 3, 3, skinD);
    // legs, braced stance
    r(-5, -10, 4, 8, denimD); r(-6, -3, 5, 3, boot);
    r(1, -10, 4, 8, denim);   r(1, -3, 6, 3, boot);
    d(-6, -1, 5, 1, '#150e0a'); d(1, -1, 6, 1, '#150e0a'); d(2, -7, 2, 2, denimD);
    // torso
    r(-4 + kx, -21 + br, 9, 12 - br, shirt);
    d(-4 + kx, -21 + br, 2, 12 - br, shirtD);
    d(-2 + kx, -18 + br, 6, 9 - br, denim); d(-2 + kx, -21 + br, 1, 3, denim); d(3 + kx, -21 + br, 1, 3, denim);
    r(0 + kx, -16, 5, 9, apron); d(0 + kx, -16, 5, 1, '#b07a40'); d(4 + kx, -15, 1, 8, apronD);
    d(1 + kx, -12, 3, 3, apronD); d(2 + kx, -13, 1, 2, '#f4d03a');
    d(-4 + kx, -11, 9, 2, '#33241a'); d(1 + kx, -11, 2, 2, '#c8a03a');             // tool belt
    r(-6 + kx, -10, 2, 6, metal); r(-7 + kx, -5, 4, 2, metal); d(-6 + kx, -10, 1, 6, '#dce2e8');   // wrench
    d(-3 + kx, -9, 3, 3, '#5a3c20');
    d(-3 + kx, -22 + br, 7, 2, '#c8302a'); r(-5 + kx, -21 + br + (sin(t * 6) > 0 ? 1 : 0), 2, 3, '#a02428');   // scarf
    // head
    r(-3 + kx, -28 + br, 7, 7, skin);
    d(-1 + kx, -23 + br, 5, 2, '#c99870');
    r(-4 + kx, -30 + br, 8, 3, hair); d(-4 + kx, -27 + br, 2, 3, hair); d(1 + kx, -31 + br, 2, 1, hair); d(-2 + kx, -31 + br, 1, 1, hair);
    d(-3 + kx, -26 + br, 7, 1, '#22222a');                                         // goggle strap
    d(1 + kx, -27 + br, 3, 3, '#c8a03a'); d(2 + kx, -26 + br, 1, 1, sin(t * 1.7) > 0.95 ? '#ffffff' : '#6af0c8');
    d(-2 + kx, -27 + br, 2, 3, '#a8842c'); d(-2 + kx, -26 + br, 1, 1, '#3aa888');
    d(4 + kx, -25 + br, 1, 2, skinD); d(2 + kx, -23 + br, 2, 1, '#7a4a30'); d(4 + kx, -23 + br, 2, 1, '#c8ccd0');   // screw between lips
    // near arm -> grip hand
    var ghx = gx - ca * (1 + rec * 2), ghy = gy - sa * (1 + rec * 2) + 1;
    var ex = (-2 + kx + ghx) / 2 - 1, ey = (-19 + br + ghy) / 2 + 3;
    seg(-2 + kx, -19 + br, ex, ey, 3, shirt); seg(ex, ey, ghx, ghy, 2, skin);
    r(ghx - 1, ghy - 1, 3, 3, '#5a4a3a');
  }
  function player(ctx, x, y, o) {
    if (!ctx) return;
    o = o || NOOPT;
    ctx.save();
    try {
      G = ctx; TK = 0; T_SIL = null;
      PX = R(x); PY = R(y); SX = 1; SY = 1; SH = 0; OX = 0; EXP = 1; OUTC = OUTLINE;
      ctx.globalAlpha = ctx.globalAlpha * 0.3; F(ctx, PX - 7, PY - 1, 15, 2, '#000000'); ctx.globalAlpha = ctx.globalAlpha / 0.3;
      PASS = 0; playerBody(o); PASS = 1; playerBody(o);
    } catch (err) { /* never throw */ }
    PASS = 1;
    ctx.restore();
  }

  function turretBody(o) {
    var t = o.t || 0, aim = o.aim || 0;
    var m = '#59616b', mD = '#3b4249', mL = '#8a949e';
    seg(0, -9, -6, -1, 2, mD); seg(0, -9, 6, -1, 2, mD); r(-1, -9, 2, 9, '#2a2e34');
    r(-8, -1, 4, 1, mL); r(5, -1, 4, 1, mL);
    r(-2, -12, 4, 4, m);
    r(-5, -16, 2, 6, m); r(3, -16, 2, 6, m);
    r(-5, -11, 10, 2, mL);
    r(-11, -15, 5, 6, '#4f6034'); d(-11, -13, 5, 1, '#e8c83a'); d(-11, -15, 5, 1, '#6a7e48'); d(-7, -16, 3, 1, '#c8a03a');
    d(4, -10, 1, 1, sin(t * 6) > 0 ? '#ff3a2a' : '#5a1a14');
    d(-1 + R(cos(aim) * 1), -12 + R(sin(aim) * 1), 2, 2, '#6af0c8');
  }
  function turret(ctx, x, y, o) {
    if (!ctx) return;
    o = o || NOOPT;
    ctx.save();
    try {
      G = ctx; TK = 0; T_SIL = null;
      PX = R(x); PY = R(y); SX = 1; SY = 1; SH = 0; OX = 0; EXP = 1; OUTC = OUTLINE;
      PASS = 0; turretBody(o); PASS = 1; turretBody(o);
    } catch (err) { /* never throw */ }
    PASS = 1;
    ctx.restore();
  }

  function dogBody(t) {
    var fur = '#b48e5c', furD = '#7c5c38', furL = '#dcbc8c';
    var wag = sin(t * 11) > 0 ? 1 : 0, pant = sin(t * 3.1) > 0, blink = sin(t * 0.9) > 0.985;
    r(-8 - wag, -8 + wag, 2, 3, fur); r(-9 - wag, -10 + wag * 2, 2, 2, furL);       // tail
    r(-6, -5, 6, 5, fur);                                                           // haunch
    r(-4, -9, 6, 8, fur);                                                           // chest
    r(0, -4, 2, 4, furL); r(-2, -1, 3, 1, furL);                                    // front legs
    d(0, -8, 2, 3, furL); d(-5, -3, 1, 1, furL); d(-3, -6, 1, 1, furD); d(-6, -2, 2, 1, furD);
    r(0, -13, 6, 5, fur);                                                           // head
    r(5, -11, 3, 3, furL); d(7, -11, 1, 1, '#111111');
    r(0, -15, 2, 3, furD); r(3, -14, 2, 2, furD);                                   // ears
    d(2, -13, 2, 2, furD);                                                          // eye patch
    if (!blink) d(3, -12, 1, 1, '#111111');
    d(0, -9, 5, 1, '#c8302a'); d(3, -8, 1, 1, '#f4d03a');                           // collar + tag
    if (pant) d(6, -8, 1, 2, '#e86a8a');
  }
  function dog(ctx, x, y, t) {
    if (!ctx) return;
    ctx.save();
    try {
      G = ctx; TK = 0; T_SIL = null; t = t || 0;
      PX = R(x); PY = R(y); SX = 1; SY = 1; SH = 0; OX = 0; EXP = 1; OUTC = OUTLINE;
      PASS = 0; dogBody(t); PASS = 1; dogBody(t);
    } catch (err) { /* never throw */ }
    PASS = 1;
    ctx.restore();
  }

  // ================================================================= SCENE
  var PAL = {
    night: { id: 'night', top: '#040912', mid: '#0a1a28', bot: '#15393c', glow: '#4a9a3e', glowA: 0.5, halo: '#9ad84e',
      celC: '#bfe470', celD: '#96c050', celL: '#e0f8a8', star: '#d8f0e8', starN: 120, tw: true,
      far: ['#12303a', '#0c2029', '#071218'], win: '#0a1820', lit: '#e8c860',
      gTop: '#222c26', gBase: '#161d19', gDark: '#0c110e', gLite: '#28332c', road: '#1a2020', roadL: '#262e2d',
      line: '#6a6a44', crack: '#080b0a', puddle: '#2a7038', puddleL: '#8af07a',
      smog: '#2a5a50', smogA: 0.10, fog: '#7fb8a8', amb: '#081420', ambK: 0.40, cloud: '#081018' },
    blood: { id: 'blood', top: '#0e0306', mid: '#2c0a10', bot: '#5a1a16', glow: '#c0381e', glowA: 0.5, halo: '#d8382a',
      celC: '#e85a40', celD: '#b83228', celL: '#ffa080', star: '#f0c0b8', starN: 90, tw: true,
      far: ['#30101a', '#1e080e', '#100406'], win: '#12040a', lit: '#ffb060',
      gTop: '#2c1a1a', gBase: '#1c1213', gDark: '#100a0a', gLite: '#342020', road: '#201617', roadL: '#2e2222',
      line: '#6a5040', crack: '#0a0606', puddle: '#70282a', puddleL: '#f07a6a',
      smog: '#6a2020', smogA: 0.12, fog: '#c08878', amb: '#240808', ambK: 0.40, cloud: '#140408' },
    day: { id: 'day', top: '#b87a34', mid: '#dca552', bot: '#f2d48a', glow: '#fff0b0', glowA: 0.45, halo: '#fff6d0',
      celC: '#fffbe0', celD: '#ffeeb0', celL: '#ffffff', star: '#ffffff', starN: 0, tw: false,
      far: ['#c69250', '#a06c34', '#704622'], win: '#8a5a2a', lit: null,
      gTop: '#9a7a4a', gBase: '#7a5e3a', gDark: '#5a4428', gLite: '#a88a58', road: '#6e6050', roadL: '#857562',
      line: '#d8c890', crack: '#3e3020', puddle: '#6a8a3a', puddleL: '#d8f08a',
      smog: '#fff0c0', smogA: 0.10, fog: '#f0d8a0', amb: '#f0b860', ambK: 0.14, cloud: '#f8e0a8' },
    dusk: { id: 'dusk', top: '#140c2a', mid: '#5c2648', bot: '#e07838', glow: '#ffb050', glowA: 0.5, halo: '#ffc070',
      celC: '#ffb858', celD: '#f09040', celL: '#ffe0a0', star: '#f0e0f0', starN: 50, tw: true,
      far: ['#4a2440', '#2e1630', '#180c1c'], win: '#10081a', lit: '#ffd070',
      gTop: '#3a2428', gBase: '#241a20', gDark: '#140e14', gLite: '#46302e', road: '#2a2026', roadL: '#3a2c30',
      line: '#8a6a4a', crack: '#0c080c', puddle: '#7a4a3a', puddleL: '#ffb070',
      smog: '#a04a50', smogA: 0.10, fog: '#d09080', amb: '#2a1230', ambK: 0.34, cloud: '#2a1230' }
  };
  function palFor(env) {
    var tm = env.time;
    if (tm === 'day') return PAL.day;
    if (tm === 'dusk') return PAL.dusk;
    return env.moon === 'blood' ? PAL.blood : PAL.night;
  }
  var DEF_ENV = { t: 0, time: 'night', moon: 'normal', fog: 0, rain: false, gateHp: 1, gateLevel: 0, wire: 0, light: false };

  // twinkle stars + puddles (fixed positions)
  var TW = (function () { var rnd = rng(99), a = [], i; for (i = 0; i < 18; i++) a.push([FL(rnd() * W), FL(rnd() * 170), 1.5 + rnd() * 3, rnd() * 6.28]); return a; })();
  var PUDDLES = [[236, 286, 11], [470, 330, 14], [562, 276, 9]];
  var FIRES = [[352, 201], [598, 222]];

  function drawSky(c, P, fancy) {
    var bands = 25, bh = 10, i, x, k, col;
    for (i = 0; i < bands; i++) {
      k = i / (bands - 1);
      col = k < 0.55 ? mix(P.top, P.mid, R(k / 0.55 * 100) / 100) : mix(P.mid, P.bot, R((k - 0.55) / 0.45 * 100) / 100);
      F(c, 0, i * bh, W, bh, col);
      if (fancy && i > 0) {
        for (x = (i & 1); x < W; x += 2) c.fillRect(x, i * bh - 1, 1, 1);
        for (x = (i & 1) * 2; x < W; x += 4) c.fillRect(x, i * bh - 2, 1, 1);
      }
    }
  }
  function drawStars(c, P) {
    var rnd = rng(7), i, x, y, b;
    c.fillStyle = P.star;
    for (i = 0; i < P.starN; i++) {
      x = FL(rnd() * W); y = FL(rnd() * 200); b = rnd();
      c.globalAlpha = (0.25 + b * 0.6) * (1 - y / 260);
      c.fillRect(x, y, 1, 1);
      if (b > 0.94) { c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
    c.globalAlpha = 1;
  }
  function drawCelestial(c, P) {
    var cx, cy, rad, dy, dx;
    if (P.id === 'day') {
      cx = 470; cy = 64; rad = 24;
      c.globalAlpha = 0.10; disc(c, cx, cy, rad + 34, P.halo); c.globalAlpha = 0.14; disc(c, cx, cy, rad + 18, P.halo);
      c.globalAlpha = 0.25; disc(c, cx, cy, rad + 7, P.halo); c.globalAlpha = 1;
      disc(c, cx, cy, rad, P.celC); disc(c, cx - 3, cy - 3, rad - 8, P.celL);
      return;
    }
    if (P.id === 'dusk') {
      cx = 430; cy = 216; rad = 54;
      c.globalAlpha = 0.10; disc(c, cx, cy, rad + 30, P.halo); c.globalAlpha = 0.16; disc(c, cx, cy, rad + 14, P.halo); c.globalAlpha = 1;
      disc(c, cx, cy, rad, P.celD); disc(c, cx, cy, rad - 8, P.celC); disc(c, cx, cy - 2, rad - 22, P.celL);
      c.globalAlpha = 0.5; F(c, cx - 60, cy - 16, 120, 3, P.mid); F(c, cx - 60, cy + 6, 120, 2, P.mid); F(c, cx - 60, cy + 18, 120, 4, P.mid); c.globalAlpha = 1;
      return;
    }
    cx = 468; cy = 84; rad = 44;
    c.globalAlpha = 0.06; disc(c, cx, cy, rad + 26, P.halo); c.globalAlpha = 0.09; disc(c, cx, cy, rad + 13, P.halo);
    c.globalAlpha = 0.16; disc(c, cx, cy, rad + 4, P.halo); c.globalAlpha = 1;
    disc(c, cx, cy, rad, P.celC);
    // shadowed limb (right/bottom)
    c.fillStyle = P.celD; c.globalAlpha = 0.55;
    for (dy = -rad; dy <= rad; dy++) { dx = FL(sqrt(rad * rad - dy * dy) + 0.5); var wdt = max(0, R(6 + (dy + rad) * 0.12)); if (wdt > dx * 2) wdt = dx * 2; c.fillRect(cx + dx - wdt + 1, cy + dy, wdt, 1); }
    c.globalAlpha = 1;
    // craters: a grumpy face
    disc(c, cx - 16, cy - 12, 7, P.celD); disc(c, cx + 13, cy - 15, 5, P.celD);
    disc(c, cx - 15, cy + 20, 3, P.celD); disc(c, cx - 7, cy + 15, 3, P.celD); disc(c, cx + 3, cy + 14, 3, P.celD); disc(c, cx + 12, cy + 18, 3, P.celD);
    disc(c, cx + 27, cy + 3, 4, P.celD); disc(c, cx - 31, cy + 5, 3, P.celD); disc(c, cx + 2, cy - 33, 3, P.celD); disc(c, cx - 3, cy + 33, 4, P.celD);
    F(c, cx - 21, cy - 17, 4, 2, P.celL); F(c, cx + 10, cy - 19, 3, 1, P.celL); F(c, cx - 28, cy - 22, 9, 2, P.celL); F(c, cx - 34, cy - 12, 3, 6, P.celL);
    F(c, cx - 24, cy - 20, 9, 2, mix(P.celD, '#000000', 0.25)); F(c, cx + 8, cy - 22, 9, 2, mix(P.celD, '#000000', 0.25));   // eyebrows
  }
  function cloudBand(c, x, y, w, col, a) {
    c.globalAlpha = a; c.fillStyle = col;
    c.fillRect(x, y, w, 4); c.fillRect(x + 10, y - 2, w - 34, 2); c.fillRect(x + 18, y + 4, w - 44, 2); c.fillRect(x - 12, y + 1, 12, 2); c.fillRect(x + w, y + 2, 16, 1);
    c.globalAlpha = 1;
  }
  var COLH = [];
  function skyline(c, rnd, col, colWin, lit, baseY, hMin, hMax, wMin, wMax, skip) {
    var x = -8 - FL(rnd() * 10), i, n;
    while (x < W + 8) {
      var w = wMin + FL(rnd() * (wMax - wMin)), h = hMin + FL(rnd() * (hMax - hMin));
      if (rnd() < skip) { x += w; continue; }
      var broken = rnd(), cw = 2 + FL(rnd() * 2), dir = rnd() < 0.5 ? 1 : -1, slope = 0.3 + rnd() * 1.2, bk = FL(rnd() * w);
      c.fillStyle = col; n = 0;
      for (i = 0; i < w; i += cw) {
        var hh = h;
        if (broken < 0.6) { var dd = dir > 0 ? (i - bk) : (bk - i); if (dd > 0) hh -= dd * slope; hh -= FL(rnd() * 4); }
        else if (broken < 0.8) hh -= FL(rnd() * 3);
        if (hh < 4) hh = 4 + FL(rnd() * 4);
        hh = FL(hh); COLH[n++] = hh;
        c.fillRect(x + i, baseY - hh, min(cw, w - i), hh);
      }
      if (rnd() < 0.5) c.fillRect(x + 2 + FL(rnd() * max(1, w - 4)), baseY - h - 3 - FL(rnd() * 6), 1, 8);
      if (colWin) {
        for (var wy = baseY - h + 5; wy < baseY - 5; wy += 6) for (var wx = 2; wx < w - 3; wx += 5) {
          var rr = rnd();
          if (rr < 0.4 && COLH[FL(wx / cw)] > baseY - wy + 2 && COLH[FL((wx + 1) / cw)] > baseY - wy + 2) {
            c.fillStyle = (lit && rr < 0.012) ? lit : colWin; c.fillRect(x + wx, wy, 2, 3);
          }
        }
      }
      x += w + FL(rnd() * 8) - 2;
    }
  }
  function pylon(c, bx, baseY, hgt, tilt, col) {
    function X(x, y) { return R(x + (baseY - y) * tilt); }
    var steps = 6, i, y0, y1, w0, w1, ya;
    for (i = 0; i < steps; i++) {
      y0 = baseY - hgt * i / steps; y1 = baseY - hgt * (i + 1) / steps; w0 = 9 - 7 * i / steps; w1 = 9 - 7 * (i + 1) / steps;
      pline(c, X(bx - w0, y0), R(y0), X(bx - w1, y1), R(y1), col);
      pline(c, X(bx + w0, y0), R(y0), X(bx + w1, y1), R(y1), col);
      pline(c, X(bx - w0, y0), R(y0), X(bx + w1, y1), R(y1), col);
      pline(c, X(bx + w0, y0), R(y0), X(bx - w1, y1), R(y1), col);
    }
    for (i = 0; i < 2; i++) {
      ya = baseY - hgt * (0.7 + i * 0.2);
      pline(c, X(bx - 15 + i * 4, ya), R(ya), X(bx + 15 - i * 4, ya), R(ya), col);
      c.fillRect(X(bx - 15 + i * 4, ya), R(ya), 1, 4); c.fillRect(X(bx + 15 - i * 4, ya), R(ya), 1, 4);
    }
    // snapped cables
    var ax = X(bx + 15, baseY - hgt * 0.7), ay = R(baseY - hgt * 0.7) + 4;
    for (i = 0; i < 40; i++) c.fillRect(ax + i * 2, ay + R(i * i * 0.028), 2, 1);
    ax = X(bx - 15, baseY - hgt * 0.7);
    for (i = 0; i < 22; i++) c.fillRect(ax - i, ay + R(i * i * 0.1), 1, 1);
  }
  function crane(c, x, baseY, h, col) {
    var i, top = baseY - h;
    c.fillStyle = col;
    c.fillRect(x, top, 1, h); c.fillRect(x + 3, top, 1, h);
    for (i = 0; i < h; i += 4) { c.fillRect(x + 1, top + i, 2, 1); c.fillRect(x + 1 + ((i >> 2) & 1), top + i + 2, 1, 1); }
    c.fillRect(x - 20, top, 78, 2);                                   // jib
    for (i = 0; i < 56; i += 4) c.fillRect(x + 4 + i, top - 2 - (i < 28 ? 1 : 0), 2, 2);
    c.fillRect(x - 22, top + 2, 9, 5);                                // counterweight
    c.fillRect(x - 1, top - 9, 6, 9);                                 // cat head
    pline(c, x + 2, top - 9, x + 56, top, col); pline(c, x + 2, top - 9, x - 20, top, col);
    c.fillRect(x + 4, top + 2, 5, 4);                                 // cab
    c.fillRect(x + 44, top + 2, 1, 26); c.fillRect(x + 43, top + 28, 3, 2); c.fillRect(x + 45, top + 30, 1, 2);   // hook
  }
  function billboard(c, x, baseY, P) {
    var col = P.far[1], i;
    c.fillStyle = col;
    c.fillRect(x + 7, baseY - 34, 2, 34); c.fillRect(x + 35, baseY - 34, 2, 34);
    pline(c, x + 8, baseY - 8, x + 36, baseY - 30, col);
    for (i = 0; i < 44; i += 2) { var miss = (i > 30) ? R((i - 30) * 0.9) : 0; c.fillRect(x + i, baseY - 58, 2, 26 - miss); }
    // faded picture: happy new apartments
    c.fillStyle = P.far[0];
    c.fillRect(x + 4, baseY - 50, 7, 15); c.fillRect(x + 13, baseY - 54, 6, 19); c.fillRect(x + 21, baseY - 47, 6, 12);
    c.fillStyle = col;
    for (i = 0; i < 4; i++) { c.fillRect(x + 6, baseY - 48 + i * 3, 1, 1); c.fillRect(x + 8, baseY - 48 + i * 3, 1, 1); c.fillRect(x + 15, baseY - 52 + i * 4, 2, 1); c.fillRect(x + 23, baseY - 45 + i * 3, 2, 1); }
    c.fillRect(x - 2, baseY - 60, 48, 2);
    c.fillRect(x + 4, baseY - 63, 2, 3); c.fillRect(x + 20, baseY - 63, 2, 3); c.fillRect(x + 36, baseY - 63, 2, 3);
  }
  function tree(c, x, y, len, ang, col, depth, rnd) {
    var x1 = x + cos(ang) * len, y1 = y + sin(ang) * len;
    pline(c, R(x), R(y), R(x1), R(y1), col, depth > 2 ? 2 : 1);
    if (depth <= 0 || len < 3) return;
    tree(c, x1, y1, len * (0.62 + rnd() * 0.15), ang - 0.35 - rnd() * 0.5, col, depth - 1, rnd);
    tree(c, x1, y1, len * (0.55 + rnd() * 0.2), ang + 0.3 + rnd() * 0.5, col, depth - 1, rnd);
    if (rnd() < 0.4) tree(c, (x + x1) / 2, (y + y1) / 2, len * 0.5, ang + (rnd() < 0.5 ? -0.9 : 0.9), col, depth - 2, rnd);
  }
  function nearLayer(c, P, rnd) {
    var col = P.far[2], i, x;
    c.fillStyle = col;
    // rubble ridge
    x = 0;
    while (x < W) { var w = 6 + FL(rnd() * 22), h = 1 + FL(rnd() * 6); c.fillRect(x, 250 - h, w, h + 1); if (rnd() < 0.3) c.fillRect(x + 2, 250 - h - 2, FL(w / 2), 2); if (rnd() < 0.2) c.fillRect(x + FL(w / 2), 250 - h - 6, 1, 6); x += w - 1; }
    // wrecked bus
    var bx = 324, by = 249;
    c.fillRect(bx, by - 15, 40, 14); c.fillRect(bx + 2, by - 17, 37, 2); c.fillRect(bx + 40, by - 12, 14, 13); c.fillRect(bx + 40, by - 14, 12, 2);
    disc(c, bx + 9, by - 1, 3, col); disc(c, bx + 44, by + 1, 3, col);
    c.fillStyle = P.far[0];
    for (i = 0; i < 5; i++) if (i !== 2) c.fillRect(bx + 4 + i * 7, by - 13, 5, 4);
    c.fillRect(bx + 43, by - 9, 5, 4);
    c.fillStyle = col;
    c.fillRect(bx + 12, by - 13, 1, 4);
    // bent street lamp
    c.fillRect(300, 216, 2, 34); pline(c, 300, 216, 290, 208, col, 2); c.fillRect(284, 208, 7, 2); c.fillRect(284, 210, 3, 2);
    // road sign
    c.fillRect(586, 226, 1, 24); c.fillRect(581, 220, 11, 8);
    // fence posts with sagging wire
    for (i = 0; i < 7; i++) { c.fillRect(150 + i * 14, 240 - (i % 3 === 1 ? 2 : 0), 1, 10 + (i % 3 === 1 ? 2 : 0)); if (i < 6) { c.fillRect(151 + i * 14, 243, 6, 1); c.fillRect(157 + i * 14, 244, 7, 1); } }
    // dead trees
    tree(c, 204, 250, 17, -PI / 2 - 0.1, col, 4, rnd);
    tree(c, 508, 250, 22, -PI / 2 + 0.15, col, 4, rnd);
    tree(c, 622, 250, 14, -PI / 2 - 0.25, col, 3, rnd);
    tree(c, 412, 250, 10, -PI / 2 + 0.2, col, 3, rnd);
  }
  function drawGround(c, P, rnd) {
    var i, x, y, j;
    F(c, 0, 250, W, 110, P.gBase);
    F(c, 0, 250, W, 2, P.gTop); F(c, 0, 252, W, 6, P.gLite);
    for (x = 0; x < W; x += 2) if (rnd() < 0.5) F(c, x, 252 + FL(rnd() * 6), 2, 1, P.gBase);
    F(c, 0, 258, W, 92, P.road);
    F(c, 0, 350, W, 10, P.gDark);
    // asphalt texture
    for (i = 0; i < 520; i++) { x = FL(rnd() * W); y = 259 + FL(rnd() * 90); c.globalAlpha = 0.5; F(c, x, y, 1 + FL(rnd() * 3), 1, rnd() < 0.5 ? P.roadL : P.gDark); }
    c.globalAlpha = 1;
    // depth bands
    c.globalAlpha = 0.18; F(c, 0, 258, W, 14, P.gLite); c.globalAlpha = 0.10; F(c, 0, 272, W, 16, P.gLite);
    c.globalAlpha = 0.16; F(c, 0, 330, W, 20, P.gDark); c.globalAlpha = 1;
    // curbs
    for (x = 0; x < W; x += 9) { if (rnd() < 0.82) F(c, x, 258, 8, 1, P.roadL); if (rnd() < 0.8) F(c, x, 349, 8, 1, mix(P.gDark, '#000000', 0.4)); }
    // lane dashes
    c.globalAlpha = 0.55;
    for (x = 138; x < W; x += 46) { if (rnd() < 0.78) { F(c, x, 302, 22, 2, P.line); if (rnd() < 0.6) F(c, x + 4 + FL(rnd() * 12), 302, 3, 2, P.road); } }
    c.globalAlpha = 1;
    // patches
    c.globalAlpha = 0.5;
    for (i = 0; i < 7; i++) F(c, 130 + FL(rnd() * 480), 264 + FL(rnd() * 78), 10 + FL(rnd() * 16), 3 + FL(rnd() * 4), P.gDark);
    c.globalAlpha = 1;
    // cracks
    for (i = 0; i < 11; i++) {
      x = 130 + FL(rnd() * 490); y = 264 + FL(rnd() * 80);
      var segs = 3 + FL(rnd() * 4);
      for (j = 0; j < segs; j++) { var nx = x + 4 + FL(rnd() * 10), ny = y + FL(rnd() * 7) - 3; pline(c, x, y, nx, ny, P.crack); if (rnd() < 0.3) pline(c, x, y, x + FL(rnd() * 6) - 3, y + 4, P.crack); x = nx; y = ny; }
    }
    // open manhole (someone took the cover...)
    ell(c, 318, 322, 9, 3, P.roadL); ell(c, 318, 322, 8, 2, '#040506'); F(c, 322, 320, 1, 3, P.roadL); F(c, 322, 320, 3, 1, P.roadL);
    // puddles
    for (i = 0; i < PUDDLES.length; i++) { var pd = PUDDLES[i]; ell(c, pd[0], pd[1], pd[2] + 1, 3, mix(P.puddle, '#000000', 0.45)); ell(c, pd[0], pd[1], pd[2], 2, P.puddle); c.globalAlpha = 0.6; F(c, pd[0] - (pd[2] >> 1), pd[1] - 1, pd[2] >> 1, 1, P.puddleL); c.globalAlpha = 1; }
    // debris
    var brick = amb('#7a3c2c', P), can = amb('#8a9098', P), bone = amb('#d8d4bc', P), dk = mix(P.gDark, '#000000', 0.35);
    for (i = 0; i < 16; i++) { x = 132 + FL(rnd() * 500); y = 262 + FL(rnd() * 84); F(c, x, y, 4, 2, brick); F(c, x, y + 2, 4, 1, dk); }
    for (i = 0; i < 40; i++) { x = 128 + FL(rnd() * 510); y = 260 + FL(rnd() * 96); F(c, x, y, 1 + FL(rnd() * 2), 1, rnd() < 0.5 ? P.roadL : dk); }
    for (i = 0; i < 5; i++) { x = 140 + FL(rnd() * 480); y = 264 + FL(rnd() * 80); F(c, x, y, 2, 3, can); F(c, x, y, 2, 1, amb('#c8302a', P)); }
    // bones + skull
    F(c, 198, 342, 6, 1, bone); F(c, 197, 341, 1, 3, bone); F(c, 204, 341, 1, 3, bone);
    F(c, 402, 268, 5, 4, bone); F(c, 403, 272, 3, 1, bone); F(c, 403, 269, 1, 2, dk); F(c, 405, 269, 1, 2, dk);
    F(c, 409, 270, 5, 1, bone); F(c, 410, 272, 4, 1, bone); F(c, 409, 274, 5, 1, bone);
    F(c, 546, 336, 5, 1, bone); F(c, 545, 335, 1, 3, bone);
    // tire + tipped traffic cone
    ell(c, 520, 343, 6, 3, dk); ell(c, 520, 343, 3, 1, P.road);
    F(c, 168, 347, 3, 4, amb('#e8742a', P)); F(c, 171, 348, 3, 2, amb('#e8742a', P)); F(c, 174, 349, 2, 1, amb('#f4f0e0', P)); F(c, 166, 346, 2, 6, amb('#b85a1a', P));
    // dead grass along the curbs
    c.fillStyle = mix(P.gLite, '#7a7a44', 0.35);
    for (i = 0; i < 46; i++) { x = 126 + FL(rnd() * 512); y = rnd() < 0.5 ? 258 : 351 + FL(rnd() * 6); c.fillRect(x, y - 2 - FL(rnd() * 2), 1, 3); c.fillRect(x + 1, y - 1, 1, 2); if (rnd() < 0.5) c.fillRect(x - 1, y - 3, 1, 3); }
    // foreground rubble
    c.fillStyle = mix(P.gDark, '#000000', 0.55);
    x = 126;
    while (x < W) { var rw = 5 + FL(rnd() * 18), rh = 1 + FL(rnd() * 5); if (rnd() < 0.7) c.fillRect(x, 360 - rh, rw, rh); if (rnd() < 0.15) c.fillRect(x + 2, 360 - rh - 5, 1, 6); x += rw; }
  }
  function buildBg(c, P, fancy) {
    var i;
    drawSky(c, P, fancy);
    if (P.starN) drawStars(c, P);
    drawCelestial(c, P);
    cloudBand(c, 56, 46, 150, P.cloud, 0.5); cloudBand(c, 372, 136, 200, P.cloud, 0.45);
    cloudBand(c, 176, 172, 120, P.cloud, 0.35); cloudBand(c, 520, 28, 100, P.cloud, 0.4); cloudBand(c, 250, 96, 90, P.cloud, 0.3);
    for (i = 0; i < 12; i++) { c.globalAlpha = P.glowA * 0.5 * Math.pow((i + 1) / 12, 1.7); F(c, 0, 154 + i * 8, W, 8, P.glow); }
    c.globalAlpha = 1;
    skyline(c, rng(11), P.far[0], P.win, P.lit, 250, 28, 104, 16, 44, 0.12);
    c.globalAlpha = 0.16; F(c, 0, 210, W, 40, P.glow); c.globalAlpha = 1;
    skyline(c, rng(23), P.far[1], P.win, P.lit, 250, 12, 62, 14, 40, 0.32);
    crane(c, 446, 250, 148, P.far[1]);
    pylon(c, 258, 250, 86, 0.2, P.far[1]);
    billboard(c, 540, 250, P);
    c.globalAlpha = 0.10; F(c, 0, 226, W, 24, P.glow); c.globalAlpha = 1;
    nearLayer(c, P, rng(31));
    drawGround(c, P, rng(57));
  }

  // ---- bunker
  var GLY = { '4': [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1], '0': [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1] };
  function glyph(c, ch, x, y, s, col, sten, ins) {
    var g = GLY[ch], j, row;
    if (!g) return;
    ins = ins || 0;
    c.fillStyle = col;
    for (j = 0; j < 15; j++) if (g[j]) { row = (j / 3) | 0; c.fillRect(x + (j % 3) * s + ins, y + row * s + ins, s - ins * 2, ((sten && (row === 1 || row === 3)) ? s - 1 : s) - ins * 2); }
  }
  function text404(c, x, y, s, col, sten) { glyph(c, '4', x, y, s, col, sten); glyph(c, '0', x + 4 * s, y, s, col, sten); glyph(c, '4', x + 8 * s, y, s, col, sten); }
  function hazard(c, P, x, y, w, h) {
    var yy, xx, a, b;
    c.fillStyle = amb('#e8c020', P); c.fillRect(x, y, w, h);
    c.fillStyle = amb('#1c1c20', P);
    for (yy = 0; yy < h; yy++) for (xx = -(yy % 8) - 8; xx < w; xx += 8) { a = max(0, xx); b = min(w, xx + 4); if (b > a) c.fillRect(x + a, y + yy, b - a, 1); }
  }
  var GATE_SLAT = ['#8a6248', '#7b838d', '#808a96', '#687380', '#56616e', '#465468'];
  function drawBunker(c, P, lv) {
    function f(x, y, w, h, col) { c.fillStyle = amb(col, P); c.fillRect(x, y, w, h); }
    var con = '#69727c', conD = '#515962', conDD = '#3b4249', conL = '#87919c', conLL = '#a3adb8', i, y, x;
    var rnd = rng(404);
    // contact shadow
    c.globalAlpha = 0.35; F(c, 0, 344, 136, 5, '#000000'); c.globalAlpha = 1;
    // antenna mast + guy wire
    f(4, 128, 1, 61, conDD); f(1, 134, 7, 1, conDD); f(2, 140, 5, 1, conDD);
    pline(c, 4, 150, 16, 189, amb(conDD, P));
    // back railing
    f(0, 180, 96, 1, conDD); for (x = 10; x < 96; x += 22) f(x, 180, 1, 9, conDD);
    // floodlight post
    f(116, 150, 2, 40, conDD); f(111, 145, 11, 7, '#2a2e34'); f(111, 145, 11, 1, '#4a5058'); f(114, 152, 5, 2, conDD);
    // walkway (top face)
    f(0, 189, 121, 9, '#7b8590'); f(0, 189, 121, 1, '#566069');
    for (x = 8; x < 120; x += 16) f(x, 190, 1, 8, '#6a737e');
    f(40, 196, 13, 2, '#4a515a'); f(41, 196, 1, 1, conLL); f(51, 196, 1, 1, conLL);
    f(12, 196, 13, 2, '#4a515a'); f(13, 196, 1, 1, conLL); f(23, 196, 1, 1, conLL);
    // ammo crate on the walkway
    f(28, 190, 9, 6, '#4f6034'); f(28, 190, 9, 1, '#6a7e48'); f(31, 192, 3, 2, '#e8c83a');
    // wall face
    f(0, 202, 122, 144, con);
    for (i = 0; i < 90; i++) { x = FL(rnd() * 120); y = 204 + FL(rnd() * 140); f(x, y, 1 + FL(rnd() * 2), 1, rnd() < 0.5 ? conD : conL); }
    f(0, 232, 62, 1, conD); f(30, 203, 1, 143, conD); f(61, 203, 1, 31, conD); f(92, 203, 1, 31, conD); f(0, 290, 62, 1, conD);
    c.globalAlpha = 0.25; F(c, 0, 318, 122, 28, amb('#20242a', P)); c.globalAlpha = 0.15; F(c, 0, 300, 122, 18, amb('#20242a', P)); c.globalAlpha = 1;
    f(119, 202, 3, 144, conL); f(122, 198, 1, 149, '#1a1d22');
    // parapet lip
    f(0, 198, 123, 4, conL); f(0, 198, 123, 1, conLL); f(0, 202, 122, 1, conDD);
    for (x = 5; x < 120; x += 12) f(x, 200, 1, 1, conDD);
    // drip stains under the lip
    c.globalAlpha = 0.35;
    for (i = 0; i < 9; i++) { x = 4 + FL(rnd() * 112); F(c, x, 203, 1 + FL(rnd() * 2), 6 + FL(rnd() * 22), amb('#2c3238', P)); }
    c.globalAlpha = 1;
    // sandbags
    var bags = [[97, 193], [105, 193], [113, 193], [101, 188], [110, 188], [106, 184]];
    for (i = 0; i < bags.length; i++) {
      x = bags[i][0]; y = bags[i][1];
      f(x, y, 9, 5, '#9a8a5e'); f(x + 1, y, 7, 1, '#b8a876'); f(x, y + 4, 9, 1, '#6e6240'); f(x + 4, y + 1, 1, 3, '#6e6240'); f(x, y, 1, 1, '#6e6240'); f(x + 8, y, 1, 1, '#6e6240');
    }
    // rusty pipe + valve + toxic drip
    f(0, 211, 54, 4, '#8a5230'); f(0, 211, 54, 1, '#b87444'); f(0, 214, 54, 1, '#5c341c');
    f(12, 210, 3, 6, '#5c341c'); f(40, 210, 3, 6, '#5c341c');
    f(51, 211, 4, 21, '#8a5230'); f(51, 211, 1, 21, '#b87444'); f(50, 230, 6, 3, '#5c341c');
    f(24, 207, 5, 2, '#c0302a'); f(26, 209, 1, 2, conDD);
    f(13, 216, 1, 7, '#7fe06a'); f(13, 225, 1, 2, '#7fe06a'); f(12, 228, 3, 1, '#4f9a3a');
    // slit window (light added per frame)
    f(8, 238, 26, 9, '#22262c'); f(10, 240, 22, 5, '#0d0f12');
    // "no mutants" sign
    f(38, 240, 14, 14, '#d8d4c4');
    f(42, 245, 6, 5, '#5aa03a'); f(43, 244, 4, 1, '#5aa03a'); f(43, 246, 1, 1, '#111111'); f(46, 246, 1, 1, '#111111'); f(44, 248, 2, 1, '#111111');
    for (i = 0; i < 12; i++) f(39 + i, 252 - i, 2, 1, '#c0302a');
    f(38, 240, 14, 1, '#c0302a'); f(38, 253, 14, 1, '#c0302a'); f(38, 240, 1, 14, '#c0302a'); f(51, 240, 1, 14, '#c0302a');
    // tally marks (days survived)
    for (i = 0; i < 3; i++) {
      var tx = 8 + i * 14, nm = i === 2 ? 2 : 4, j;
      for (j = 0; j < nm; j++) f(tx + j * 2, 262, 1, 7, conLL);
      if (i < 2) pline(c, tx - 1, 267, tx + 7, 263, amb(conLL, P));
    }
    // vent + rust streaks
    f(36, 300, 18, 11, '#22262c'); for (i = 0; i < 4; i++) f(37, 302 + i * 2, 16, 1, conD);
    c.globalAlpha = 0.5; F(c, 40, 311, 1, 12, amb('#7a4a2a', P)); F(c, 47, 311, 1, 7, amb('#7a4a2a', P)); c.globalAlpha = 1;
    // cracks
    var ck = amb(conDD, P);
    pline(c, 72, 205, 76, 212, ck); pline(c, 76, 212, 74, 220, ck); pline(c, 74, 220, 79, 228, ck);
    pline(c, 18, 334, 25, 326, ck); pline(c, 25, 326, 23, 317, ck); pline(c, 23, 317, 28, 312, ck);
    pline(c, 100, 204, 104, 210, ck);
    // warning triangle above the gate
    for (i = 0; i < 7; i++) f(107 - i, 211 + i, 1 + i * 2, 1, '#e8c020');
    f(107, 213, 1, 3, '#1c1c20'); f(107, 217, 1, 1, '#1c1c20');
    // keypad
    f(56, 280, 5, 9, '#22262c'); f(57, 281, 3, 2, '#4af07a'); f(57, 284, 1, 1, conLL); f(59, 284, 1, 1, conLL); f(57, 286, 1, 1, conLL); f(59, 286, 1, 1, conLL);
    // props at the foot of the wall
    f(6, 322, 12, 25, '#3a6a6a'); f(6, 322, 12, 2, '#5a8a8a'); f(6, 329, 12, 1, '#284a4a'); f(6, 339, 12, 1, '#284a4a'); f(16, 322, 2, 25, '#284a4a');
    f(10, 332, 4, 4, '#e8c83a'); f(11, 333, 2, 2, '#1c1c20'); f(8, 343, 3, 2, '#7a4a2a');
    f(22, 331, 18, 16, '#7a5a34'); f(22, 331, 18, 2, '#5a4024'); f(22, 345, 18, 2, '#5a4024'); f(22, 331, 2, 16, '#5a4024'); f(38, 331, 2, 16, '#5a4024');
    pline(c, 24, 344, 37, 333, amb('#5a4024', P));
    f(42, 343, 17, 3, '#4a5058'); f(44, 340, 14, 2, '#8a9098'); f(46, 337, 10, 2, '#6a7078'); f(44, 340, 1, 2, '#22262c'); f(46, 337, 1, 2, '#22262c');
    // ---- gate
    var gx = 64, gy = 236, gw = 56, gh = 106;
    var slat = GATE_SLAT[lv] || GATE_SLAT[0], slatH = mix(slat, '#ffffff', 0.22), slatS = mix(slat, '#000000', 0.35);
    f(gx - 3, gy - 3, gw + 6, gh + 3, '#2a2e34'); f(gx - 3, gy - 3, gw + 6, 1, '#4a5058');
    f(gx, gy, gw, gh, '#30343a');
    hazard(c, P, gx, gy, gw, 8);
    for (y = gy + 9; y < gy + gh - 9; y += 6) { f(gx + 3, y, gw - 6, 6, slat); f(gx + 3, y, gw - 6, 1, slatH); f(gx + 3, y + 5, gw - 6, 1, slatS); }
    hazard(c, P, gx, gy + gh - 8, gw, 8);
    f(gx, gy + 8, 3, gh - 16, '#3a4048'); f(gx + gw - 3, gy + 8, 3, gh - 16, '#3a4048'); f(gx, gy + 8, 1, gh - 16, conD);
    // stencil 404
    text404(c, gx + 6, gy + 20, 4, amb('#ece6d0', P), true);
    c.fillStyle = amb(slat, P);
    for (i = 0; i < 26; i++) c.fillRect(gx + 6 + FL(rnd() * 44), gy + 20 + FL(rnd() * 20), 1, 1);
    if (lv === 0) {
      f(gx + 8, gy + 52, 9, 4, '#5c3a22'); f(gx + 30, gy + 72, 14, 5, '#5c3a22'); f(gx + 12, gy + 88, 7, 3, '#5c3a22'); f(gx + 40, gy + 60, 5, 8, '#6e4630');
      f(gx + 34, gy + 46, 13, 11, '#6e7780'); f(gx + 34, gy + 46, 13, 1, '#8a949e'); f(gx + 35, gy + 47, 1, 1, conDD); f(gx + 45, gy + 47, 1, 1, conDD); f(gx + 35, gy + 55, 1, 1, conDD); f(gx + 45, gy + 55, 1, 1, conDD);
      f(gx + 14, gy + 91, 1, 6, '#5c3a22');
    }
    if (lv >= 1) {
      for (i = 0; i < 2; i++) { y = gy + 46 + i * 32; f(gx + 1, y, gw - 2, 4, '#9099a4'); f(gx + 1, y, gw - 2, 1, '#b4bdc8'); f(gx + 1, y + 3, gw - 2, 1, '#5d6670'); for (x = gx + 4; x < gx + gw - 4; x += 12) f(x, y + 1, 2, 2, conDD); }
    }
    if (lv >= 2) {
      f(gx + 3, gy + 9, 9, 9, '#59626c'); f(gx + gw - 12, gy + 9, 9, 9, '#59626c'); f(gx + 3, gy + gh - 18, 9, 9, '#59626c'); f(gx + gw - 12, gy + gh - 18, 9, 9, '#59626c');
      f(gx + 6, gy + 12, 2, 2, conLL); f(gx + gw - 9, gy + 12, 2, 2, conLL); f(gx + 6, gy + gh - 15, 2, 2, conLL); f(gx + gw - 9, gy + gh - 15, 2, 2, conLL);
      for (y = gy + 12; y < gy + gh - 10; y += 8) { f(gx + 1, y, 1, 1, conLL); f(gx + gw - 2, y, 1, 1, conLL); }
    }
    if (lv >= 3) {
      f(gx + 6, gy + 52, gw - 12, 24, '#5a6570'); f(gx + 6, gy + 52, gw - 12, 1, '#8490a0'); f(gx + 6, gy + 75, gw - 12, 1, '#363e48'); f(gx + 6, gy + 52, 1, 24, '#8490a0');
      f(gx + 8, gy + 54, 2, 2, conDD); f(gx + gw - 10, gy + 54, 2, 2, conDD); f(gx + 8, gy + 72, 2, 2, conDD); f(gx + gw - 10, gy + 72, 2, 2, conDD);
      disc(c, gx + 28, gy + 64, 6, amb('#363e48', P)); disc(c, gx + 28, gy + 64, 4, amb('#8490a0', P)); disc(c, gx + 28, gy + 64, 2, amb('#363e48', P));
      f(gx + 21, gy + 64, 15, 1, '#363e48'); f(gx + 28, gy + 57, 1, 15, '#363e48');
      f(gx + 6, gy + 82, gw - 12, 10, '#5a6570'); f(gx + 6, gy + 82, gw - 12, 1, '#8490a0'); f(gx + 8, gy + 84, 2, 2, conDD); f(gx + gw - 10, gy + 84, 2, 2, conDD);
    }
    if (lv >= 4) {
      for (y = gy + 12; y < gy + gh - 8; y += 12) { f(120, y, 3, 5, '#b4bdc8'); f(123, y + 1, 2, 3, '#b4bdc8'); f(125, y + 2, 2, 1, '#dce4ec'); f(120, y + 4, 3, 1, '#5d6670'); }
      for (x = gx - 1; x < gx + gw; x += 8) { f(x, gy - 6, 3, 3, '#9099a4'); f(x + 1, gy - 8, 1, 2, '#dce4ec'); }
    }
    if (lv >= 5) {
      f(gx + 3, gy + 9, 1, gh - 18, '#3ad8f0'); f(gx + gw - 4, gy + 9, 1, gh - 18, '#3ad8f0');
      f(gx + 1, gy + 28, 4, 5, '#bff8ff'); f(gx + gw - 5, gy + 28, 4, 5, '#bff8ff'); f(gx + 1, gy + 70, 4, 5, '#bff8ff'); f(gx + gw - 5, gy + 70, 4, 5, '#bff8ff');
      f(gx + 6, gy + 44, gw - 12, 1, '#3ad8f0'); f(gx + 6, gy + 79, gw - 12, 1, '#3ad8f0');
    }
    // lamp housing above the gate
    f(87, 224, 10, 3, '#2a2e34'); f(88, 227, 8, 5, '#1c1c20');
  }

  function sparks(c, x, y, t, n) {
    var k = FL(t * 14), i, a, dd;
    if (hash(k * 1.3 + x) < 0.45) return;
    for (i = 0; i < n; i++) {
      a = hash(k + i * 7.1 + x) * PI * 2; dd = 2 + hash(k * 3 + i) * 7;
      c.fillStyle = i & 1 ? '#fff6b0' : '#ffb03a';
      c.fillRect(R(x + cos(a) * dd), R(y + sin(a) * dd * 0.7), 1, 1 + (i & 1));
    }
    c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 1, 2, 2);
  }
  function smoke(c, x, y, t, n, col, a0) {
    var i, ph, s;
    c.fillStyle = col;
    for (i = 0; i < n; i++) {
      ph = (t * 0.45 + i / n) % 1; s = 3 + FL(ph * 6);
      c.globalAlpha = (1 - ph) * (a0 || 0.45);
      c.fillRect(R(x + sin(t * 1.3 + i * 2.2) * 3 + ph * 8) - (s >> 1), R(y - ph * 34) - (s >> 1), s, s);
    }
    c.globalAlpha = 1;
  }
  function dent(c, x, y, s, dk, hi) {
    F(c, x - s, y - s + 1, s * 2, s * 2 - 2, dk); F(c, x - s + 1, y - s, s * 2 - 2, s * 2, dk);
    F(c, x - s + 1, y + s - 1, s * 2 - 2, 1, hi); F(c, x + s - 1, y - s + 2, 1, s * 2 - 3, hi);
  }
  function gateDamage(c, P, hp, t, lv) {
    var dk = amb('#1a1d22', P), dk2 = amb('#3a4048', P), hi = amb('#aeb7c2', P), slat = amb(GATE_SLAT[lv] || GATE_SLAT[0], P), i;
    if (hp <= 0) {
      F(c, 70, 250, 46, 92, '#050607'); F(c, 67, 268, 4, 74, '#050607'); F(c, 114, 276, 3, 66, '#050607');
      for (i = 0; i < 8; i++) F(c, 70 + i * 6, 250, 5, 3 + ((i * 7) % 5) * 2, slat);
      for (i = 0; i < 6; i++) F(c, 67, 270 + i * 12, 3 + ((i * 5) % 4) * 2, 4, slat);
      F(c, 72, 256, 3, 20, dk2); F(c, 75, 274, 9, 3, dk2); F(c, 106, 254, 3, 28, dk2); F(c, 98, 280, 9, 3, dk2); F(c, 88, 252, 3, 12, dk2);
      c.globalAlpha = 0.14 + 0.07 * sin(t * 6); F(c, 74, 296, 38, 46, '#ff3a1a'); c.globalAlpha = 1;
      F(c, 74, 337, 14, 5, dk2); F(c, 96, 335, 10, 7, slat); F(c, 124, 341, 9, 3, dk2); F(c, 84, 340, 9, 2, hi);
      sparks(c, 80, 258, t, 5); sparks(c, 108, 264, t + 3.3, 5);
      smoke(c, 92, 250, t, 6, amb('#2a2e34', P), 0.55);
      return;
    }
    if (hp < 0.85) dent(c, 98, 298, 4, dk, hi);
    if (hp < 0.7) { dent(c, 80, 318, 5, dk, hi); pline(c, 104, 262, 100, 270, dk); pline(c, 100, 270, 104, 277, dk); pline(c, 104, 277, 99, 286, dk); }
    if (hp < 0.55) {
      dent(c, 106, 322, 3, dk, hi);
      pline(c, 76, 284, 82, 290, dk); pline(c, 82, 290, 79, 298, dk); pline(c, 79, 298, 85, 306, dk); pline(c, 85, 306, 82, 314, dk);
      F(c, 86, 311, 24, 2, dk); F(c, 88, 313, 18, 1, hi);
      c.globalAlpha = 0.3; F(c, 74, 326, 30, 8, '#000000'); c.globalAlpha = 1;
    }
    if (hp < 0.4) {
      F(c, 92, 300, 12, 9, '#050607'); F(c, 90, 303, 16, 4, '#050607'); F(c, 92, 299, 3, 2, slat); F(c, 100, 308, 4, 2, slat);
      pline(c, 104, 300, 110, 294, dk); pline(c, 90, 306, 84, 310, dk);
      sparks(c, 98, 304, t, 3);
    }
    if (hp < 0.25) {
      F(c, 72, 318, 9, 10, '#050607'); F(c, 70, 321, 13, 5, '#050607'); F(c, 78, 317, 3, 2, slat);
      F(c, 106, 282, 9, 2, dk); F(c, 108, 284, 6, 5, dk2);
      sparks(c, 76, 322, t + 1.7, 3);
      smoke(c, 96, 298, t, 5, amb('#2a2e34', P), 0.5);
    }
  }
  function bunkerFx(c, P, env, t, lv) {
    var hp = env.gateHp == null ? 1 : env.gateHp, i;
    // slit window: warm light, someone pacing inside
    var fl = 0.6 + 0.25 * sin(t * 7.3) * sin(t * 2.1) - (hash(FL(t * 9)) > 0.93 ? 0.3 : 0);
    c.globalAlpha = clamp01(fl) * (P.id === 'day' ? 0.35 : 0.95); F(c, 10, 240, 22, 5, '#ffc95a'); c.globalAlpha = 1;
    var px = (t * 3) % 44; if (px < 20) F(c, 10 + R(px), 241, 2, 4, '#3a2a18');
    F(c, 17, 240, 1, 5, amb('#22262c', P)); F(c, 24, 240, 1, 5, amb('#22262c', P));
    if (P.id !== 'day') { c.globalAlpha = 0.08 * clamp01(fl); F(c, 6, 236, 30, 13, '#ffc95a'); c.globalAlpha = 1; }
    // antenna beacon
    if (sin(t * 3) > 0.2) { F(c, 3, 126, 3, 3, '#ff3a2a'); c.globalAlpha = 0.2; F(c, 1, 124, 7, 7, '#ff3a2a'); c.globalAlpha = 1; }
    else F(c, 3, 126, 3, 3, amb('#5a1a14', P));
    // tattered flag
    for (i = 0; i < 7; i++) {
      var fy = 141 + R(sin(t * 4 - i * 0.8) * (i * 0.3));
      F(c, 5 + i * 2, fy, 2, i > 4 ? 4 : 6, amb(i % 3 === 2 ? '#c85a1a' : '#e8742a', P));
    }
    // gate lamp
    var on = hp < 0.3 ? sin(t * 14) > 0 : sin(t * 2.4) > -0.3;
    if (hp <= 0) on = sin(t * 23) > 0.6;
    F(c, 89, 228, 6, 4, on ? '#ff7a2a' : amb('#5a2412', P));
    if (on) { F(c, 90, 228, 2, 1, '#ffd0a0'); c.globalAlpha = 0.18; F(c, 85, 225, 14, 10, '#ff7a2a'); c.globalAlpha = 0.07; F(c, 76, 221, 32, 26, '#ff7a2a'); c.globalAlpha = 1; }
    // floodlight lens
    F(c, 120, 146, 2, 5, env.light ? '#fff6c0' : amb('#6a6a50', P));
    if (env.light && P.id !== 'day') { c.globalAlpha = 0.25; F(c, 118, 144, 6, 9, '#fff6c0'); c.globalAlpha = 1; }
    // lv5 energy pulse
    if (lv >= 5 && hp > 0) {
      c.globalAlpha = 0.12 + 0.1 * sin(t * 5); F(c, 65, 244, 54, 90, '#3ad8f0');
      c.globalAlpha = 0.7; var ey = 246 + ((t * 40) % 84); F(c, 67, R(ey), 1, 4, '#e0ffff'); F(c, 116, R(246 + ((t * 40 + 40) % 84)), 1, 4, '#e0ffff');
      c.globalAlpha = 1;
    }
    gateDamage(c, P, hp, t, lv);
  }
  function wire(c, P, n) {
    var col = amb('#aab4be', P), colD = amb('#5a626c', P), post = amb('#6a4a2a', P), k, y, x, i;
    for (k = 0; k < n; k++) {
      var bx = 142 + k * 24;
      for (i = 0; i < 3; i++) {
        y = 266 + i * 39; x = bx - R((y - 262) * 0.08);
        pline(c, x - 4, y + 4, x + 4, y - 6, post, 2); pline(c, x + 4, y + 4, x - 4, y - 6, post, 2);
      }
      for (y = 262; y <= 345; y += 7) {
        x = bx - R((y - 262) * 0.08) + (((y / 7) | 0) & 1);
        c.fillStyle = (((y / 7) | 0) & 1) ? col : colD;
        c.fillRect(x - 3, y - 4, 7, 1); c.fillRect(x - 3, y + 4, 7, 1); c.fillRect(x - 5, y - 2, 1, 5); c.fillRect(x + 5, y - 2, 1, 5);
        c.fillRect(x - 4, y - 3, 1, 1); c.fillRect(x + 4, y - 3, 1, 1); c.fillRect(x - 4, y + 3, 1, 1); c.fillRect(x + 4, y + 3, 1, 1);
        c.fillStyle = col;
        c.fillRect(x - 6, y - 1, 1, 1); c.fillRect(x + 6, y + 1, 1, 1); c.fillRect(x, y - 5, 1, 1); c.fillRect(x + 1, y + 5, 1, 1);
      }
    }
  }
  function floodCone(c, P, t) {
    var fl = 0.92 + 0.08 * sin(t * 31) * (hash(FL(t * 6)) > 0.8 ? 1 : 0.2);
    c.fillStyle = '#fff2b0';
    c.globalAlpha = 0.05 * fl; poly(c, [122, 146, 540, 232, 580, 354, 150, 354]);
    c.globalAlpha = 0.045 * fl; poly(c, [122, 147, 440, 250, 460, 348, 170, 348]);
    c.globalAlpha = 0.045 * fl; ell(c, 330, 304, 180, 42, '#fff2b0'); ell(c, 300, 304, 110, 26, '#fff2b0');
    c.globalAlpha = 1;
  }
  function skyFx(c, P, t, fog) {
    var i, s, a, x, y, w;
    if (P.tw) {
      c.fillStyle = P.star;
      for (i = 0; i < TW.length; i++) {
        s = TW[i]; a = 0.5 + 0.5 * sin(t * s[2] + s[3]);
        if (a > 0.6) { c.globalAlpha = (a - 0.6) * 2; c.fillRect(s[0], s[1], 1, 1); if (a > 0.92) { c.fillRect(s[0] - 1, s[1], 3, 1); c.fillRect(s[0], s[1] - 1, 1, 3); } }
      }
    }
    c.fillStyle = P.smog; c.globalAlpha = P.smogA;
    for (i = 0; i < 5; i++) {
      w = 120 + i * 22; x = R(((i * 173 + t * (3 + i * 1.7)) % (W + 220)) - 220); y = 150 + i * 19 + R(sin(t * 0.2 + i) * 2);
      c.fillRect(x, y, w, 4); c.fillRect(x + 12, y - 2, w - 40, 2); c.fillRect(x + 24, y + 4, w - 50, 2);
    }
    c.globalAlpha = P.glowA * (0.12 + 0.08 * sin(t * 0.9)); c.fillStyle = P.glow; c.fillRect(0, 236, W, 14); c.fillRect(0, 244, W, 6);
    // distant fires
    if (P.id !== 'day') {
      for (i = 0; i < FIRES.length; i++) {
        var fh = 1 + (hash(FL(t * 9) + i * 3) > 0.5 ? 1 : 0);
        c.globalAlpha = 0.9; F(c, FIRES[i][0], FIRES[i][1] - fh, 2, fh + 1, '#ff8a2a'); F(c, FIRES[i][0], FIRES[i][1] - fh, 1, 1, '#ffe04a');
        c.globalAlpha = 0.15; F(c, FIRES[i][0] - 2, FIRES[i][1] - 4, 6, 6, '#ff8a2a');
      }
    }
    if (fog > 0.01) { c.globalAlpha = fog * 0.22; F(c, 0, 150, W, 100, P.fog); c.globalAlpha = fog * 0.12; F(c, 0, 250, W, 30, P.fog); }
    c.globalAlpha = 1;
    // puddle shimmer
    c.fillStyle = P.puddleL; c.globalAlpha = 0.5;
    for (i = 0; i < PUDDLES.length; i++) { var pd = PUDDLES[i]; c.fillRect(pd[0] + R(sin(t * 1.7 + i * 2) * pd[2] * 0.5), pd[1], 3, 1); }
    c.globalAlpha = 1;
  }

  var bgCache = {}, bkCache = {};
  function getBg(P) {
    var e = bgCache[P.id];
    if (e === undefined) {
      var cv = mk(W, H);
      if (cv) { try { buildBg(cv.getContext('2d'), P, true); } catch (err) { cv = null; } }
      e = bgCache[P.id] = cv || null;
    }
    return e;
  }
  var BK_Y = 110, BK_W = 136;
  function getBunker(P, lv) {
    var key = P.id + lv, e = bkCache[key];
    if (e === undefined) {
      var cv = mk(BK_W, H - BK_Y);
      if (cv) { try { var c = cv.getContext('2d'); c.translate(0, -BK_Y); drawBunker(c, P, lv); } catch (err) { cv = null; } }
      e = bkCache[key] = cv || null;
    }
    return e;
  }

  function scene(ctx, env) {
    if (!ctx) return;
    env = env || DEF_ENV;
    ctx.save();
    try {
      G = ctx;
      var P = palFor(env), t = env.t || 0, lv = env.gateLevel | 0;
      if (lv < 0) lv = 0; if (lv > 5) lv = 5;
      var bg = getBg(P);
      if (bg) ctx.drawImage(bg, 0, 0); else buildBg(ctx, P, false);
      skyFx(ctx, P, t, clamp01(env.fog));
      if (env.wire > 0) wire(ctx, P, min(3, env.wire | 0));
      if (env.light && P.id !== 'day') floodCone(ctx, P, t);
      var bk = getBunker(P, lv);
      if (bk) ctx.drawImage(bk, 0, BK_Y); else drawBunker(ctx, P, lv);
      bunkerFx(ctx, P, env, t, lv);
    } catch (err) { /* never throw */ }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- front layer: fog, rain, vignette
  var vigCache;
  function buildVignette(c) {
    var bs = 4, bx, by, nx = W / bs, ny = H / bs, run, q, lastQ, x0;
    c.fillStyle = '#000000';
    for (by = 0; by < ny; by++) {
      lastQ = 0; x0 = 0;
      for (bx = 0; bx <= nx; bx++) {
        q = 0;
        if (bx < nx) {
          var dx = (bx + 0.5 - nx / 2) / (nx / 2), dy = (by + 0.5 - ny / 2) / (ny / 2), dd = sqrt(dx * dx + dy * dy * 0.9);
          run = (dd - 0.78) / 0.62; if (run < 0) run = 0; if (run > 1) run = 1;
          q = R(run * 7);
          if (q > 0 && q < 7 && ((bx + by) & 1) && (run * 7 - FL(run * 7)) > 0.25 && (run * 7 - FL(run * 7)) < 0.75) q = FL(run * 7) + ((bx ^ by) & 1);   // dithered steps
        }
        if (q !== lastQ) {
          if (lastQ > 0) { c.globalAlpha = lastQ * 0.075; c.fillRect(x0 * bs, by * bs, (bx - x0) * bs, bs); }
          lastQ = q; x0 = bx;
        }
      }
    }
    c.globalAlpha = 1;
  }
  function sceneFront(ctx, env) {
    if (!ctx) return;
    env = env || DEF_ENV;
    ctx.save();
    try {
      var c = ctx, P = palFor(env), t = env.t || 0, fog = clamp01(env.fog), i, x, y, h, off;
      if (fog > 0.01) {
        c.fillStyle = P.fog;
        for (i = 0; i < 6; i++) {
          y = 232 + i * 21 + R(sin(t * 0.3 + i * 1.7) * 4); h = 12 + (i % 3) * 4;
          off = (t * (6 + i * 3) + i * 97) % 170;
          c.globalAlpha = fog * (0.09 + 0.04 * (i % 2));
          for (x = -170 + off; x < W; x += 170) { var xr = R(x); c.fillRect(xr, y, 118, h); c.fillRect(xr + 18, y - 3, 66, 3); c.fillRect(xr + 30, y + h, 74, 3); c.fillRect(xr - 14, y + 3, 14, h - 6); }
        }
        c.globalAlpha = fog * 0.10; c.fillRect(0, 0, W, H);
      }
      if (env.rain) {
        c.fillStyle = '#a6f04e';
        for (i = 0; i < 90; i++) {
          var sp = 0.8 + hash(i * 1.1) * 0.5;
          x = (((hash(i * 7.3) * (W + 80) - t * 130 * sp) % (W + 80)) + (W + 80)) % (W + 80) - 20;
          y = ((hash(i * 3.9) * (H + 30) + t * 560 * sp) % (H + 30)) - 15;
          c.globalAlpha = 0.25 + hash(i * 9.1) * 0.3;
          c.fillRect(R(x), R(y), 1, 4); c.fillRect(R(x) - 1, R(y) + 4, 1, 4);
        }
        var k = FL(t * 14);
        c.globalAlpha = 0.5;
        for (i = 0; i < 12; i++) { x = 124 + FL(hash(k + i * 3.3) * 516); y = 256 + FL(hash(k * 1.7 + i * 5.9) * 100); c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 1); }
        for (i = 0; i < 4; i++) { x = FL(hash(k + i * 8.3) * 118); c.fillRect(x, 188, 2, 1); }
        c.globalAlpha = 0.06; c.fillStyle = '#6ab02a'; c.fillRect(0, 0, W, H);
      }
      c.globalAlpha = 1;
      if (vigCache === undefined) {
        var cv = mk(W, H);
        if (cv) { try { buildVignette(cv.getContext('2d')); } catch (err) { cv = null; } }
        vigCache = cv || null;
      }
      if (vigCache) c.drawImage(vigCache, 0, 0);
      else { c.fillStyle = '#000000'; for (i = 0; i < 5; i++) { c.globalAlpha = 0.07; c.fillRect(0, 0, W, 8 - i); c.fillRect(0, H - 8 + i, W, 8 - i); c.fillRect(0, 0, 10 - i * 2, H); c.fillRect(W - 10 + i * 2, 0, 10 - i * 2, H); } }
    } catch (err2) { /* never throw */ }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- title backdrop
  var TITLE_ENV = { t: 0, time: 'dusk', moon: 'normal', fog: 0.3, rain: false, gateHp: 1, gateLevel: 2, wire: 1, light: false };
  var TITLE_MOBS = (function () {
    var types = ['shambler', 'runner', 'shambler', 'bloater', 'shambler', 'brute', 'shambler', 'spitter', 'howler', 'shambler', 'shield', 'courier', 'shambler', 'shell'];
    var rnd = rng(1234), a = [], i;
    for (i = 0; i < types.length; i++) {
      var sc = 0.5 + rnd() * 0.35, b = BASE[types[i]];
      a.push({ type: types[i], x: 0, y: 0, w: b[0] * sc, h: b[1] * sc, walk: 0, atk: 0, flash: 0, state: 'walk', die: 0, hpFrac: 1, elite: false, fx: NOFX, shield: 1, phase: 1, weak: false, seed: rnd(), mini: false,
        _x0: rnd() * 520, _sp: 2.5 + rnd() * 3.5, _y: 251 + FL(rnd() * 9) });
    }
    return a;
  })();
  function title(ctx, t) {
    if (!ctx) return;
    t = t || 0;
    TITLE_ENV.t = t;
    scene(ctx, TITLE_ENV);
    ctx.save();
    try {
      G = ctx;
      var P = PAL.dusk, c = ctx, i, m;
      // far shambling silhouettes on the ridge
      for (i = 0; i < TITLE_MOBS.length; i++) {
        m = TITLE_MOBS[i];
        m.x = 150 + (((m._x0 - t * m._sp) % 520) + 520) % 520;
        m.y = m._y; m.walk = t * m._sp * 0.9 + i;
        drawEnemyCore(m, t, i % 3 === 0 ? P.far[1] : P.far[2]);
      }
      TK = 0; T_SIL = null; PASS = 1;
      // flickering 404 sign on a scaffold
      var dk = amb('#2a2e34', P), dk2 = amb('#3b4249', P);
      F(c, 12, 150, 2, 39, dk2); F(c, 62, 150, 2, 39, dk2); pline(c, 13, 188, 62, 152, dk2); pline(c, 13, 152, 62, 188, dk2);
      F(c, 5, 110, 68, 40, dk); F(c, 5, 110, 68, 1, amb('#59616b', P)); F(c, 4, 149, 70, 2, dk2);
      for (i = 0; i < 9; i++) F(c, 8 + i * 8, 112, 1, 1, sin(t * 6 + i) > 0 ? '#ffe04a' : '#6a5a2a');
      var on0 = hash(FL(t * 11)) > 0.08, on1 = sin(t * 1.3) > -0.7 ? hash(FL(t * 17) + 5) > 0.1 : hash(FL(t * 9)) > 0.6, on2 = hash(FL(t * 7) + 9) > 0.04;
      var lit = '#ff7a3a', off = '#4a2620', core = '#ffe0b0';
      var st = [on0, on1, on2], chs = ['4', '0', '4'];
      for (i = 0; i < 3; i++) {
        var gx = 11 + i * 20;
        if (st[i]) { c.globalAlpha = 0.16; F(c, gx - 4, 114, 23, 33, lit); c.globalAlpha = 0.14; F(c, gx - 2, 116, 19, 29, lit); c.globalAlpha = 1; }
        glyph(c, chs[i], gx, 118, 5, st[i] ? lit : off, false, 0);
        if (st[i]) glyph(c, chs[i], gx, 118, 5, core, false, 2);
        else glyph(c, chs[i], gx, 118, 5, '#6a3a2c', false, 2);
      }
    } catch (err) { /* never throw */ }
    TK = 0; T_SIL = null; PASS = 1; SH = 0; OX = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
    player(ctx, 86, 196, { t: t, aim: 0.05, recoil: 0, reloading: false });
    dog(ctx, 64, 196, t);
    sceneFront(ctx, TITLE_ENV);
  }

  var Art = {
    W: W, H: H,
    scene: scene, sceneFront: sceneFront,
    player: player, turret: turret, dog: dog,
    enemy: enemy, projectileEnemy: projectileEnemy,
    title: title,
    BASE: BASE
  };
  root.Art = Art;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
