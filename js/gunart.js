// BUNKER 404 — 총기 파츠 픽셀아트 (절차적 렌더링)
// 단위: 1 unit = 1px (scale 1). 총은 +x 를 향하고, 원점(0,0)은 손잡이(피벗).
(function () {
  'use strict';
  var K = '#15120f';                 // 외곽선
  var C = null, B = null, T = 0;     // 현재 ctx / 측정용 경계 / 시간
  var SN = 0, OX = 0, OY = 0;        // 아이콘 렌더용 스냅 배율·오프셋 (0 = 끔)
  var ZERO = { t: 0 };

  function R(x, y, w, h, c) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    if (B) { if (x < B.x0) B.x0 = x; if (y < B.y0) B.y0 = y; if (x + w > B.x1) B.x1 = x + w; if (y + h > B.y1) B.y1 = y + h; }
    if (C) {
      C.fillStyle = c;
      if (SN) {   // 아이콘용: 변환 없이 장치 픽셀에 맞춰 찍는다 (비정수 배율에서도 또렷하게)
        var x0 = Math.round(x * SN), y0 = Math.round(y * SN);
        C.fillRect(OX + x0, OY + y0, Math.max(1, Math.round((x + w) * SN) - x0), Math.max(1, Math.round((y + h) * SN) - y0));
      } else C.fillRect(x, y, w, h);
    }
  }
  // 외곽선 상자 (+윗면 하이라이트 hi, 아랫면 그림자 sh)
  function bx(x, y, w, h, c, hi, sh) {
    R(x, y, w, h, K); R(x + 1, y + 1, w - 2, h - 2, c);
    if (hi && h > 3) R(x + 1, y + 1, w - 2, 1, hi);
    if (sh && h > 4) R(x + 1, y + h - 2, w - 2, 1, sh);
  }
  function circ(cx, cy, r, c) {
    cx = Math.round(cx); cy = Math.round(cy);
    var rr = (r + 0.5) * (r + 0.5);
    for (var dy = -r; dy <= r; dy++) { var hw = Math.floor(Math.sqrt(rr - dy * dy)); R(cx - hw, cy + dy, hw * 2 + 1, 1, c); }
  }
  function ln(x1, y1, x2, y2, c, th) {
    th = th || 1;
    var dx = x2 - x1, dy = y2 - y1, n = Math.max(Math.abs(dx), Math.abs(dy)) | 0;
    if (n === 0) { R(x1, y1, th, th, c); return; }
    for (var i = 0; i <= n; i++) R(x1 + dx * i / n, y1 + dy * i / n, th, th, c);
  }
  // 수평 관 (y = 중심선, th = 안쪽 두께)
  function tube(x, y, len, th, c, hi, sh) { bx(x, y - (th >> 1) - 1, len, th + 2, c, hi, sh); }
  // 뒤로 기운 권총 손잡이
  function grip(x, y, w, h, c, hi) {
    var i, gx;
    for (i = 0; i <= h; i++) R(x - ((i / 3) | 0) - 1, y + i, w + 2, 1, K);
    for (i = 0; i < h; i++) { gx = x - ((i / 3) | 0); R(gx, y + i, w, 1, c); if (hi) R(gx + 1, y + i, 1, 1, hi); }
  }
  function trig(x, y) { R(x, y + 4, 8, 1, K); R(x + 7, y, 1, 5, K); R(x + 1, y, 2, 3, K); }
  var FONT = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', 'A': '010101111101101', 'I': '111010010010111', 'G': '111100101101111', 'M': '101111111101101',
    'O': '111101101101111', 'N': '101111111111101', 'Z': '111001010100111', 'R': '110101110101101', 'E': '111100110100111', 'C': '111100100100111'
  };
  function txt(s, x, y, c) {
    for (var k = 0; k < s.length; k++) {
      var g = FONT[s.charAt(k)];
      if (g) for (var i = 0; i < 15; i++) if (g.charAt(i) === '1') R(x + (i % 3), y + ((i / 3) | 0), 1, 1, c);
      x += 4;
    }
  }

  // ── 팔레트 ──
  var S1 = '#3a3f47', S2 = '#5a626e', S3 = '#8a94a3';
  var G1 = '#23262b', G2 = '#343840', G3 = '#4d535e';
  var RU1 = '#5e321d', RU2 = '#8f4e2a', RU3 = '#b86a36';
  var W1 = '#4f321a', W2 = '#7a5230', W3 = '#a2754a';
  var OL1 = '#35402a', OL2 = '#55683c', OL3 = '#73894f';
  var BR1 = '#7d5f18', BR2 = '#c49a2c', BR3 = '#f3d566';
  var FL1 = '#6e2a48', FL2 = '#b04a70', FL3 = '#e58aa6';
  var BO1 = '#9d9477', BO2 = '#d9d0b3', BO3 = '#f4eeda';
  var PI1 = '#2a504e', PI2 = '#3f7f7a', PI3 = '#6bb3ab';
  var PL1 = '#8f8771', PL2 = '#cfc7ae', PL3 = '#efe9d6';
  var TE1 = '#161b26', TE2 = '#262f40', TE3 = '#3a475e', CY = '#5fe6ff', CY2 = '#b6f6ff';
  var TP1 = '#8e8e80', TP2 = '#bdbdae';
  var WH = '#f2efe6', RD = '#d8423a', RD2 = '#9c2a26', YE = '#f2c230', GR = '#5fbf4a', BL = '#3f8fe0';
  var PK = '#ff6fb5', OR = '#f08a2c', PU = '#9a5fd0', BK = '#1b1b1f', CU = '#b87333', CU2 = '#e0a060';

  var REC = {}, BAR = {}, MUZ = {}, MAG = {}, STK = {}, SGT = {}, AMMO = {}, ACC = {};

  /* ───────────── 몸통 ─────────────
     a: bx,by 총열 장착점 / bt 총구 굵기 / sx,sy 개머리판 / mx,my 탄창(위 중앙) / tx,ty 조준기(아래 중앙)
        a1 [x,y] 하부 부착 고정점(선택) / a2x,a2y 상부 뒤쪽 / hx,hy 뒤에 매다는 장식 / st 스티커 자리 / bot 앞쪽 바닥 y */
  REC._g = { a: { bx: 16, by: -7, bt: 3, sx: -8, sy: -7, mx: 13, my: -3, tx: 3, ty: -11, a2x: -4, a2y: -11, hx: -6, hy: -3 }, d: function () {
    grip(-3, -3, 6, 11, G1, G3); bx(-8, -11, 24, 9, G2, G3, G1); trig(3, -3);
  } };

  REC.pipe_pistol = { a: { bx: 14, by: -8, bt: 4, sx: -11, sy: -8, mx: -4, my: 9, tx: 2, ty: -12, a2x: -5, a2y: -12, hx: -8, hy: -4, bot: -4 }, d: function () {
    grip(-3, -4, 6, 13, TP1, TP2); R(-4, 0, 7, 1, TP2); R(-5, 4, 7, 1, TP2);
    bx(-9, -12, 22, 8, PI2, PI3, PI1);
    bx(10, -13, 4, 10, PI1, PI2); bx(-11, -13, 4, 10, RU2, RU3, RU1);
    R(-3, -9, 2, 2, RU2); R(3, -9, 4, 1, PI3);
    trig(3, -4);
  } };

  REC.nailgun = { f: 'small', a: { bx: 21, by: -6, bt: 3, sx: -9, sy: -8, mx: 13, my: -2, tx: 3, ty: -14, a2x: -5, a2y: -14, hx: -7, hy: -3, bot: -2 }, d: function () {
    grip(-3, -3, 6, 12, G1, G3);
    bx(-9, -14, 24, 12, YE, '#ffe27a', '#b98f14');
    bx(-9, -14, 9, 5, G2, G3);
    R(-7, -12, 1, 2, K); R(-5, -12, 1, 2, K); R(-3, -12, 1, 2, K);
    bx(14, -9, 7, 6, S2, S3, S1); R(19, -7, 2, 2, K);
    R(2, -8, 8, 1, K); R(2, -6, 8, 1, '#b98f14'); R(4, -11, 4, 2, K);
    trig(3, -3);
  } };

  REC.slingshot = { f: 'small', a: { bx: 12, by: -13, bt: 3, sx: -3, sy: -3, mx: 7, my: -10, tx: 4, ty: -18, a2x: -2, a2y: -18, hx: -2, hy: 9, st: [0, 2], bot: -10 }, d: function (o) {
    var ch = o.charge || 0, px = -9 - Math.round(ch * 7);
    bx(-3, -6, 6, 15, W2, W3, W1); R(-2, 0, 4, 1, TP2); R(-2, 3, 4, 1, TP2);
    bx(-4, -10, 9, 5, W2, W3, W1);
    bx(-4, -18, 3, 9, W2, W3); bx(2, -18, 4, 9, W2, W3);
    bx(3, -15, 9, 5, S2, S3, S1);
    ln(-3, -17, px, -13, RD, 1); ln(3, -17, px, -12, RD2, 1);
    bx(px - 2, -15, 4, 5, W1, W2); R(px - 1, -14, 2, 2, S3);
    if (ch > 0.95) { R(px - 4, -16, 1, 1, WH); R(px - 3, -11, 1, 1, WH); }
  } };

  REC.revolver = { a: { bx: 17, by: -9, bt: 4, sx: -7, sy: -7, mx: 13, my: -4, tx: 5, ty: -13, a2x: -4, a2y: -12, hx: -6, hy: -4, bot: -4 }, d: function () {
    grip(-4, -4, 6, 13, W2, W3); R(-5, 2, 2, 2, BR2);
    bx(-7, -12, 24, 8, S2, S3, S1);
    bx(12, -12, 5, 6, S2, S3, S1);
    bx(1, -13, 10, 10, S1, S2); R(2, -10, 8, 1, S3); R(2, -7, 8, 1, G1); R(2, -5, 8, 1, S3);
    R(-8, -14, 3, 3, K); R(-7, -13, 1, 1, S3);
    trig(3, -4);
  } };

  REC.pump = { f: 'big', a: { bx: 17, by: -9, bt: 4, sx: -11, sy: -7, mx: 13, my: -3, tx: 4, ty: -12, a1: [33, -1], a2x: -6, a2y: -12, hx: -9, hy: -4 }, d: function (o) {
    grip(-4, -4, 6, 12, W2, W3);
    bx(-11, -12, 28, 9, G2, G3, G1);
    R(2, -10, 6, 2, K); R(5, -6, 7, 2, K);
    bx(16, -6, 18, 5, S1, S2);
    var p = (o.recoil || 0) > 1 ? 3 : 0;
    bx(20 - p, -7, 11, 7, W2, W3, W1); R(22 - p, -5, 1, 3, W1); R(25 - p, -5, 1, 3, W1); R(28 - p, -5, 1, 3, W1);
    trig(3, -4);
  } };

  REC.boltrifle = { a: { bx: 17, by: -9, bt: 3, sx: -11, sy: -5, mx: 13, my: -2, tx: 3, ty: -12, a1: [22, -2], a2x: -6, a2y: -12, hx: -9, hy: -2 }, d: function () {
    grip(-5, -3, 6, 9, W2, W3);
    bx(-11, -8, 37, 7, W2, W3, W1);
    bx(-9, -12, 27, 6, S2, S3, S1);
    R(-2, -10, 7, 2, K);
    R(8, -9, 2, 3, K); bx(7, -7, 4, 4, S2, S3);
    R(20, -6, 1, 3, W1); R(23, -6, 1, 3, W1);
    trig(2, -2);
  } };

  REC.smg = { a: { bx: 22, by: -7, bt: 3, sx: -10, sy: -7, mx: 14, my: 0, tx: 3, ty: -12, a2x: -6, a2y: -12, hx: -8, hy: -3, bot: -3 }, d: function () {
    grip(-3, -3, 6, 12, G1, G3);
    bx(-10, -12, 26, 10, G3, S2, G2);
    for (var i = 0; i < 7; i++) R(-8 + i * 3, -7 + (i % 2), 2, 1, i % 3 ? RU3 : S3);
    bx(15, -11, 8, 8, S1, S2); R(17, -9, 1, 1, K); R(20, -9, 1, 1, K); R(17, -6, 1, 1, K); R(20, -6, 1, 1, K);
    R(-4, -10, 6, 2, K);
    bx(11, -3, 7, 4, G2, G3);
    trig(3, -3);
  } };

  REC.stapler = { f: 'small', a: { bx: 21, by: -7, bt: 3, sx: -12, sy: -8, mx: 14, my: -3, tx: 4, ty: -15, a2x: -6, a2y: -15, hx: -9, hy: -3 }, d: function () {
    grip(-3, -3, 6, 11, G2, G3);
    bx(-9, -6, 30, 4, G3, S2, G2);
    bx(-11, -15, 31, 6, RD, '#f0736a', RD2);
    R(19, -14, 1, 1, K); R(19, -11, 1, 1, K);
    bx(-12, -11, 5, 7, G1, G3);
    R(-4, -9, 20, 1, S3); for (var i = 0; i < 6; i++) R(-3 + i * 3, -9, 1, 3, S1);
    R(16, -8, 4, 2, S3);
    trig(3, -3);
  } };

  REC.potato = { f: 'smoke', a: { bx: 11, by: -9, bt: 5, sx: -15, sy: -9, mx: 8, my: -5, tx: 0, ty: -15, a2x: -5, a2y: -15, hx: -10, hy: -3, bot: -5 }, d: function () {
    grip(-3, -4, 6, 12, TP1, TP2);
    bx(-13, -15, 18, 12, PL2, PL3, PL1);
    bx(-15, -14, 3, 10, S2, S3);
    bx(-12, -18, 4, 4, RD, '#ff8a80');
    bx(4, -13, 7, 8, PL1, PL2);
    R(-8, -10, 9, 1, BL); R(-8, -8, 5, 1, PL1);
    trig(3, -4);
  } };

  REC.ar = { a: { bx: 34, by: -7, bt: 3, sx: -11, sy: -7, mx: 15, my: 1, tx: 6, ty: -13, a2x: -6, a2y: -13, hx: -9, hy: -3, bot: -3 }, d: function () {
    grip(-3, -3, 6, 12, G1, G3);
    bx(-11, -12, 34, 10, G2, G3, G1);
    R(-10, -7, 32, 1, G1);
    R(6, -10, 7, 2, K); R(-9, -10, 3, 1, S2);
    for (var i = 0; i < 10; i++) R(-9 + i * 3, -13, 2, 1, G3);
    bx(22, -11, 12, 8, OL2, OL3, OL1); R(24, -8, 2, 1, K); R(28, -8, 2, 1, K); R(24, -6, 2, 1, K); R(28, -6, 2, 1, K);
    bx(11, -3, 9, 4, G2, G3);
    trig(3, -3);
  } };

  REC.autoshotgun = { f: 'big', a: { bx: 19, by: -8, bt: 3, sx: -11, sy: -7, mx: 14, my: -3, tx: 4, ty: -13, a1: [30, -1], a2x: -6, a2y: -13, hx: -9, hy: -3 }, d: function () {
    grip(-3, -3, 6, 12, BK, G3);
    bx(-11, -13, 30, 11, G2, G3, G1);
    bx(18, -13, 14, 4, G3, S2); R(20, -12, 2, 1, K); R(24, -12, 2, 1, K); R(28, -12, 2, 1, K);
    bx(18, -6, 16, 5, S1, S2);
    for (var i = 0; i < 3; i++) { bx(-8 + i * 4, -10, 4, 6, RD, '#ff8a80'); R(-7 + i * 4, -6, 2, 1, BR3); }
    R(6, -10, 7, 2, K);
    trig(3, -3);
  } };

  REC.dmr = { a: { bx: 38, by: -7, bt: 3, sx: -11, sy: -6, mx: 14, my: -2, tx: 6, ty: -12, a2x: -6, a2y: -11, hx: -9, hy: -3, bot: -4 }, d: function () {
    grip(-3, -2, 6, 11, OL1, OL3);
    bx(-7, -6, 22, 5, G2, G3);
    bx(-11, -11, 36, 7, OL2, OL3, OL1);
    bx(24, -10, 14, 6, OL1, OL2); R(26, -8, 3, 1, K); R(31, -8, 3, 1, K);
    R(4, -9, 8, 2, K);
    for (var i = 0; i < 9; i++) R(-8 + i * 3, -12, 2, 1, G3);
    trig(3, -2);
  } };

  REC.lmg = { a: { bx: 36, by: -7, bt: 4, sx: -13, sy: -7, mx: 14, my: -2, tx: 6, ty: -16, a2x: -8, a2y: -13, hx: -11, hy: -3, bot: -3 }, d: function () {
    grip(-3, -2, 6, 12, BK, G3);
    bx(-13, -13, 38, 12, G2, G3, G1);
    bx(-1, -16, 15, 4, G3, S2);
    R(17, -17, 11, 1, K); R(17, -16, 1, 3, K); R(27, -16, 1, 3, K);
    bx(24, -11, 12, 8, S1, S2);
    for (var i = 0; i < 3; i++) { R(26 + i * 3, -9, 1, 1, K); R(26 + i * 3, -6, 1, 1, K); }
    R(2, -9, 9, 3, K); R(3, -8, 7, 1, BR2);
    trig(3, -2);
  } };

  REC.gl = { f: 'smoke', a: { bx: 30, by: -7, bt: 6, sx: -9, sy: -7, mx: 17, my: 1, tx: -3, ty: -11, a2x: 17, a2y: -15, hx: -7, hy: -4, bot: -3 }, d: function () {
    grip(-3, -4, 6, 12, BK, G3);
    bx(-9, -11, 19, 8, G2, G3, G1);
    bx(24, -11, 6, 8, G2, G3, G1);
    trig(3, -4);
    bx(9, -15, 16, 16, OL2, OL3, OL1);
    circ(14, -10, 2, K); circ(20, -10, 2, K); circ(14, -4, 2, K); circ(20, -4, 2, K); R(14, -10, 1, 1, BR2); R(20, -4, 1, 1, BR2);
    bx(25, -3, 5, 8, BK, G3);
  } };

  REC.burstrifle = { a: { bx: 22, by: -7, bt: 3, sx: -11, sy: -7, mx: 14, my: -3, tx: 6, ty: -16, a2x: -7, a2y: -12, hx: -9, hy: -3 }, d: function () {
    grip(-3, -3, 6, 12, G1, G3);
    bx(-11, -12, 33, 10, '#b59a6a', '#d4bc8c', '#8a744c');
    R(-10, -7, 31, 1, '#8a744c');
    bx(-3, -16, 18, 3, G2, G3); R(-2, -13, 2, 2, K); R(12, -13, 2, 2, K);
    R(13, -10, 1, 2, WH); R(15, -10, 1, 2, WH); R(17, -10, 1, 2, WH);
    R(2, -10, 7, 2, K);
    trig(3, -3);
  } };

  REC.keyboard = { f: 'small', a: { bx: 32, by: -8, bt: 3, sx: -11, sy: -8, mx: 15, my: -3, tx: 8, ty: -14, a2x: -6, a2y: -14, hx: -9, hy: -3, st: [14, -1] }, d: function (o) {
    grip(-3, -3, 6, 11, TP1, TP2);
    bx(-11, -14, 43, 12, '#2b2d33', '#454851', '#1c1d21');
    for (var r = 0; r < 3; r++) for (var c = 0; c < 13; c++) {
      var col = (r + c) % 2 ? '#d5d0c0' : '#e8e4d8';
      if (r === 0 && c === 0) col = RD; else if ((r === 1 && c === 2) || (r === 2 && c >= 1 && c <= 3)) col = CY;
      R(-9 + c * 3, -12 + r * 3, 2, 2, col);
    }
    R(-13, -9, 2, 2, K); R(-15, -8, 2, 2, K);
    if (o.flash > 0) { var k = ((T * 14) | 0) % 13; R(-9 + k * 3, -12 + (k % 3) * 3, 2, 2, YE); }
    trig(3, -3);
  } };

  REC.gauss = { f: 'energy', a: { bx: 34, by: -7, bt: 3, sx: -11, sy: -7, mx: 14, my: -3, tx: 4, ty: -12, a2x: -7, a2y: -12, hx: -9, hy: -3 }, d: function (o) {
    var ch = o.charge || 0, g = ch > 0.66 ? CY2 : ch > 0.33 ? CY : '#2f7f93', i;
    grip(-3, -3, 6, 12, TE1, TE3);
    bx(-11, -12, 30, 10, TE2, TE3, TE1);
    for (i = 0; i < 3; i++) bx(-8 + i * 5, -10, 4, 6, (ch > 0 && i / 3 < ch) ? g : '#1f4f5f');
    bx(18, -12, 16, 3, TE3, '#55657f'); bx(18, -5, 16, 3, TE3, '#55657f');
    for (i = 0; i < 4; i++) R(20 + i * 4, -9, 2, 4, CU);
    if (ch > 0) R(19, -8, Math.round(14 * ch), 2, g);
    R(8, -10, 6, 1, CY);
    trig(3, -3);
  } };

  REC.tesla = { f: 'elec', a: { bx: 20, by: -7, bt: 3, sx: -10, sy: -7, mx: 13, my: -3, tx: 3, ty: -12, a2x: -6, a2y: -15, hx: -8, hy: -3 }, d: function () {
    grip(-3, -3, 6, 12, TE1, TE3);
    bx(-10, -12, 22, 10, TE2, TE3, TE1);
    bx(-10, -15, 8, 4, G3, S2); R(-8, -14, 1, 1, GR);
    bx(11, -14, 9, 14, '#8a5324', '#d08a4a', '#5e3414');
    for (var i = 0; i < 6; i++) R(12, -13 + i * 2, 7, 1, CU);
    bx(19, -11, 7, 3, S2, S3); bx(19, -5, 7, 3, S2, S3);
    R(25, -11, 2, 3, S3); R(25, -5, 2, 3, S3);
    if (((T * 14) | 0) % 3 !== 0) { R(24, -8, 2, 1, CY2); R(25, -7, 2, 1, CY); R(23, -7, 1, 1, CY); }
    R(-4, -9, 9, 3, K); R(-3, -8, 3 + (((T * 6) | 0) % 5), 1, CY);
    trig(3, -3);
  } };

  REC.flamer = { f: 'fire', a: { bx: 28, by: -8, bt: 4, sx: -9, sy: -8, mx: 14, my: -4, tx: 3, ty: -12, a1: [37, -4], a2x: -5, a2y: -12, hx: -7, hy: -4 }, d: function () {
    grip(-3, -4, 6, 12, BK, G3);
    bx(-9, -12, 37, 8, S2, S3, S1);
    bx(19, -5, 14, 8, RD, '#f0736a', RD2); R(18, -3, 1, 4, K); R(33, -3, 1, 4, K);
    R(22, -2, 6, 2, WH); R(24, -3, 2, 4, YE);
    bx(11, -15, 5, 4, BR2, BR3); R(13, -11, 1, 1, K);
    R(-6, -10, 14, 1, S1); R(-6, -8, 14, 1, S1);
    var f = ((T * 10) | 0) % 2; R(25, -14 - f, 2, 2 + f, BL); R(25, -13, 2, 1, CY2);
    trig(3, -4);
  } };

  REC.minigun = { a: { bx: 29, by: -6, bt: 7, sx: -11, sy: -7, mx: 13, my: -1, tx: 4, ty: -13, a2x: -6, a2y: -13, hx: -9, hy: -2, bot: -1 }, d: function (o) {
    grip(-3, -2, 6, 11, BK, G3);
    bx(-11, -13, 32, 13, G2, G3, G1);
    R(-12, -10, 2, 6, K);
    bx(10, -11, 9, 9, S1, S2); circ(14, -7, 2, S3); R(14, -7, 1, 1, K);
    R(-7, -8, 13, 1, YE); R(-7, -6, 13, 1, K);
    var s = (((o.spin || 0) * 3) | 0) % 3; if (s < 0) s += 3;
    bx(20, -12, 10, 12, G1);
    for (var r = 0; r < 3; r++) R(21, -11 + r * 3 + (r === 2 ? 1 : 0), 8, 3, r === s ? S3 : (r === (s + 1) % 3 ? S2 : S1));
    bx(23, -13, 3, 14, G2, G3);
    trig(3, -2);
  } };

  REC.laser = { f: 'energy', a: { bx: 26, by: -7, bt: 3, sx: -10, sy: -7, mx: 14, my: -3, tx: 3, ty: -12, a2x: -6, a2y: -12, hx: -8, hy: -3 }, d: function () {
    grip(-3, -3, 6, 12, PL2, WH);
    bx(-10, -12, 28, 10, WH, '#ffffff', '#c9c5b8');
    bx(-8, -10, 10, 6, TE2, TE3); R(-7, -8, 8, 2, ((T * 4) | 0) % 2 ? RD : '#ff8a80');
    bx(18, -11, 8, 8, S2, S3, S1); R(24, -9, 2, 4, RD);
    R(4, -10, 12, 1, RD); R(4, -5, 12, 1, '#c9c5b8');
    trig(3, -3);
  } };

  REC.microwave = { f: 'heat', a: { bx: 25, by: -9, bt: 4, sx: -13, sy: -9, mx: 14, my: -2, tx: 4, ty: -19, a2x: -8, a2y: -19, hx: -10, hy: -2, st: [6, -4], bot: -2 }, d: function (o) {
    grip(-3, -2, 6, 11, G2, G3);
    bx(-13, -19, 38, 18, PL2, PL3, PL1);
    var on = o.flash > 0 || ((T * 2) | 0) % 2, i, j;
    bx(-11, -17, 24, 14, BK, G3); R(-9, -15, 20, 10, on ? '#ffb347' : '#5a3d1e');
    for (i = 0; i < 5; i++) for (j = 0; j < 3; j++) R(-8 + i * 4, -14 + j * 3, 1, 1, K);
    R(-3, -9, 8, 2, on ? '#fff0b0' : '#7a5a30'); R(-1, -8, 4, 3, '#c98a4a');
    bx(15, -17, 8, 14, PL1, PL2); R(17, -15, 4, 2, GR);
    R(17, -11, 1, 1, K); R(19, -11, 1, 1, K); R(17, -9, 1, 1, K); R(19, -9, 1, 1, K); R(17, -6, 4, 2, RD);
    trig(3, -2);
  } };

  REC.sawgun = { f: 'small', a: { bx: 24, by: -7, bt: 3, sx: -10, sy: -7, mx: 14, my: 0, tx: -3, ty: -12, a2x: 15, a2y: -17, hx: -8, hy: -3, bot: 0 }, d: function (o) {
    grip(-3, -3, 6, 12, OR, '#ffb060');
    bx(-10, -12, 22, 10, OR, '#ffb060', '#b05f14');
    bx(-8, -10, 8, 3, BK, G3);
    var a = T * 10 + (o.flash > 0 ? 1 : 0);
    circ(15, -8, 8, K); circ(15, -8, 7, S3);
    for (var i = 0; i < 8; i++) { var an = a + i * 0.785; R(15 + Math.cos(an) * 8 - 0.5, -8 + Math.sin(an) * 8 - 0.5, 2, 2, S1); }
    circ(15, -8, 2, G1); R(15, -8, 1, 1, S3);
    bx(8, -17, 15, 4, OR, '#ffb060');
    bx(8, -4, 17, 4, G2, G3);
    trig(3, -3);
  } };

  REC.tuba = { f: 'ring', a: { bx: 27, by: -6, bt: 5, sx: -12, sy: -6, mx: 14, my: 3, tx: 2, ty: -12, a2x: -7, a2y: -12, hx: -9, hy: 3, st: [4, 0], bot: 3 }, d: function () {
    grip(-3, -2, 6, 11, W1, W2);
    bx(-10, -12, 24, 6, BR2, BR3, BR1);
    bx(-10, -2, 30, 5, BR2, BR3, BR1);
    bx(-12, -12, 5, 15, BR2, BR3, BR1);
    bx(12, -14, 9, 18, BR2, BR3, BR1); R(14, -12, 2, 14, BR3);
    for (var i = 0; i < 3; i++) { bx(-4 + i * 5, -8, 4, 7, S3, WH); R(-3 + i * 5, -9, 2, 1, WH); }
    R(-14, -11, 2, 3, S3);
    bx(20, -16, 4, 20, BR2, BR3, BR1); bx(23, -18, 4, 24, BR2, BR3, BR1); R(25, -16, 1, 20, '#3a2a08');
    trig(3, -2);
  } };

  REC.heartgun = { f: 'goo', a: { bx: 20, by: -8, bt: 4, sx: -10, sy: -8, mx: 13, my: -2, tx: 3, ty: -17, a2x: -6, a2y: -14, hx: -8, hy: -3, bot: -2 }, d: function () {
    var p = Math.sin(T * 5) > 0.3 ? 1 : 0, v = '#5a2bb0';
    grip(-3, -3, 6, 12, FL1, FL2);
    bx(-10 - p, -14 - p, 28 + p * 2, 12 + p * 2, FL2, FL3, FL1);
    bx(-2, -17, 9, 5, FL2, FL3);
    bx(15, -11, 6, 6, FL1, FL2); R(19, -9, 2, 2, K);
    R(-1, -11, 1, 6, v); R(0, -6, 5, 1, v); R(6, -12, 1, 5, v); R(7, -8, 6, 1, v); R(12, -7, 1, 3, v);
    bx(-8, -12, 6, 6, BO3, WH); R(-6, -10, 2, 2, K);
    R(8, -5, 2, 2, '#d8e84a'); R(2, -4, 1, 1, '#d8e84a');
    trig(3, -3);
  } };

  REC.railcannon = { f: 'energy', a: { bx: 42, by: -8, bt: 4, sx: -13, sy: -8, mx: 14, my: -1, tx: 4, ty: -15, a2x: -8, a2y: -15, hx: -11, hy: -2, bot: -1 }, d: function () {
    grip(-3, -2, 6, 12, TE1, TE3);
    bx(-13, -15, 32, 14, OL1, OL2, '#252d1c');
    bx(-11, -13, 9, 9, TE1, TE3); circ(-7, -9, 3, ((T * 3) | 0) % 2 ? CY : CY2); circ(-7, -9, 1, WH);
    bx(18, -14, 24, 4, TE2, TE3); bx(18, -6, 24, 4, TE2, TE3);
    for (var i = 0; i < 5; i++) bx(20 + i * 4, -15, 3, 14, CU, CU2);
    R(19, -9, 22, 2, ((T * 8) | 0) % 2 ? CY : '#2f7f93');
    R(1, -13, 13, 1, YE); R(1, -12, 13, 1, K); txt('404', 2, -9, WH);
    trig(3, -2);
  } };

  REC.blackhole = { f: 'energy', a: { bx: 28, by: -7, bt: 4, sx: -11, sy: -8, mx: 13, my: 1, tx: -2, ty: -13, a2x: 18, a2y: -15, hx: -9, hy: -2, bot: 1 }, d: function () {
    grip(-3, -2, 6, 12, TE1, TE3);
    bx(-11, -13, 20, 12, TE2, TE3, TE1);
    txt('MON', -9, -9, RD);
    R(8, -15, 20, 1, K); R(8, -14, 20, 1, S2); R(8, 0, 20, 1, K); R(8, -1, 20, 1, S2);
    bx(8, -13, 4, 13, S2, S3); bx(24, -13, 4, 13, S2, S3);
    circ(18, -7, 7, '#3a1f6e'); circ(18, -7, 5, '#12061f'); circ(18, -7, 3, '#000000');
    for (var i = 0; i < 6; i++) { var an = T * 4 + i * 1.047, r = 4 + (i % 2) * 2; R(18 + Math.cos(an) * r, -7 + Math.sin(an) * r * 0.8, 1 + (i % 2), 1, i % 2 ? PU : '#e0c8ff'); }
    trig(3, -2);
  } };

  REC.kimchi = { f: 'smoke', a: { bx: 27, by: -9, bt: 8, sx: -9, sy: -6, mx: 13, my: 0, tx: -4, ty: -9, a2x: 14, a2y: -21, hx: -7, hy: -2, st: [12, -6], bot: 0 }, d: function () {
    var c1 = '#6b4226', c2 = '#8a5a34', c3 = '#a8744a';
    grip(-3, -3, 6, 12, W1, W2);
    bx(-9, -9, 14, 8, W2, W3, W1);
    bx(4, -15, 20, 14, c2, c3, c1); bx(2, -12, 24, 9, c2, c3, c1);
    bx(6, -18, 16, 4, c2, c3, c1);
    bx(22, -14, 5, 11, c1, c2); R(25, -12, 2, 7, '#2a1408');
    R(8, -10, 2, 6, c1); R(12, -11, 1, 7, c1); R(16, -10, 2, 6, c1);
    bx(9, -21, 10, 4, c2, c3);
    R(24, -6, 3, 2, RD); R(26, -4, 1, 2, RD);
    R(5, -2, 16, 2, TP2); R(5, 0, 16, 1, K);
    trig(3, -3);
  } };

  REC.vending = { f: 'fizz', a: { bx: 23, by: -6, bt: 4, sx: -11, sy: -9, mx: 14, my: -1, tx: 5, ty: -23, a2x: -6, a2y: -23, hx: -9, hy: -2, st: [14, -4], bot: -1 }, d: function () {
    var cc = [BL, GR, YE, OR, PK, CY], r, c;
    grip(-3, -2, 6, 11, G2, G3);
    bx(-11, -23, 32, 22, RD, '#f0736a', RD2);
    bx(-9, -21, 20, 13, TE1, TE3);
    for (r = 0; r < 3; r++) for (c = 0; c < 6; c++) { R(-8 + c * 3, -20 + r * 4, 2, 3, cc[(r * 2 + c) % 6]); R(-8 + c * 3, -20 + r * 4, 2, 1, S3); }
    bx(13, -21, 6, 13, PL1, PL2); R(15, -19, 2, 2, GR); R(15, -16, 2, 1, K); R(15, -13, 2, 3, K);
    bx(-9, -7, 20, 5, BK, G2); R(-4 + (((T * 3) | 0) % 3) * 2, -5, 3, 2, cc[((T * 3) | 0) % 6]);
    R(-9, -8, 28, 1, ((T * 2) | 0) % 2 ? YE : WH);
    bx(19, -9, 4, 6, S2, S3);
    trig(3, -2);
  } };

  /* ───────────── 총열: d(x, y) — (x,y) = 장착점(총강 중심), +x 로 len 만큼 ───────────── */
  var BAR_G = { len: 20, th: 3, d: function (x, y) { tube(x, y, 20, 3, G3, S2, G2); } };
  BAR.barrel_pvc = { len: 26, th: 4, d: function (x, y) {
    tube(x, y, 26, 4, PL2, PL3, PL1); bx(x + 9, y - 4, 4, 8, PL1, PL2); R(x + 15, y - 1, 8, 1, BL); R(x + 15, y + 1, 5, 1, PL1); R(x + 25, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_rust = { len: 24, th: 4, d: function (x, y) {
    tube(x, y, 24, 4, RU2, RU3, RU1); R(x + 5, y - 1, 3, 2, RU1); R(x + 11, y, 4, 1, '#d08a4a'); R(x + 15, y - 2, 2, 2, RU1);
    for (var i = 0; i < 3; i++) R(x + 18 + i * 2, y - 2, 1, 4, RU1);
    bx(x, y - 4, 3, 8, S1, S2); R(x + 23, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_short = { len: 9, th: 4, d: function (x, y) {
    tube(x, y, 8, 4, G3, S2, G2); R(x + 8, y - 3, 1, 2, K); R(x + 8, y, 1, 1, K); R(x + 8, y + 2, 1, 1, K); R(x + 6, y - 2, 1, 1, S3); R(x + 6, y + 1, 1, 1, S3);
  } };
  BAR.barrel_long = { len: 44, th: 3, d: function (x, y) {
    tube(x, y, 44, 3, G3, S2, G2); bx(x, y - 3, 6, 6, G2, G3); R(x + 39, y - 5, 2, 3, K); R(x + 38, y - 3, 4, 1, K); R(x + 43, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_double = { len: 30, th: 8, d: function (x, y) {
    bx(x, y - 5, 30, 5, G3, S2, G2); bx(x, y - 1, 30, 5, G3, S2, G2);
    R(x + 29, y - 4, 1, 3, '#000'); R(x + 29, y, 1, 3, '#000');
    bx(x + 12, y - 5, 3, 9, S1, S2); R(x + 26, y - 6, 2, 1, BR3);
  } };
  BAR.barrel_hose = { len: 32, th: 4, d: function (x, y) {
    var i, w;
    for (i = 3; i < 28; i++) { w = Math.round(Math.sin(i * 0.5 + T * 3) * 1.5); R(x + i, y - 3 + w, 1, 6, K); }
    for (i = 3; i < 28; i++) { w = Math.round(Math.sin(i * 0.5 + T * 3) * 1.5); R(x + i, y - 2 + w, 1, 4, i % 7 === 0 ? RD2 : RD); R(x + i, y - 2 + w, 1, 1, '#f0736a'); }
    bx(x, y - 4, 4, 8, BR2, BR3, BR1); bx(x + 27, y - 3, 5, 6, BR2, BR3, BR1); R(x + 31, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_heavy = { len: 30, th: 5, d: function (x, y) {
    tube(x, y, 30, 5, G3, S2, G2); for (var i = 0; i < 4; i++) R(x + 5 + i * 5, y, 4, 1, G1);
    bx(x + 26, y - 4, 4, 8, G2, G3); R(x + 29, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_rifled = { len: 36, th: 3, d: function (x, y) {
    tube(x, y, 36, 3, S2, S3, S1); for (var i = 0; i < 7; i++) R(x + 3 + i * 4, y - 1 + (i % 3), 2, 1, WH);
    bx(x + 31, y - 3, 3, 6, BR2, BR3); R(x + 35, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_trumpet = { len: 26, th: 4, d: function (x, y) {
    tube(x, y, 17, 3, BR2, BR3, BR1);
    for (var i = 0; i < 3; i++) { bx(x + 3 + i * 4, y - 7, 3, 6, BR2, BR3); R(x + 3 + i * 4, y - 8, 3, 1, WH); }
    R(x + 1, y + 2, 14, 4, K); R(x + 2, y + 3, 12, 2, BR2); R(x + 2, y + 3, 12, 1, BR3);
    bx(x + 16, y - 4, 4, 8, BR2, BR3, BR1); bx(x + 19, y - 6, 4, 12, BR2, BR3, BR1); bx(x + 22, y - 8, 4, 16, BR2, BR3, BR1); R(x + 24, y - 6, 1, 12, '#3a2a08');
  } };
  BAR.barrel_bone = { len: 28, th: 3, d: function (x, y) {
    tube(x + 3, y, 22, 3, BO2, BO3, BO1);
    bx(x, y - 4, 5, 5, BO2, BO3); bx(x, y, 5, 5, BO2, BO3);
    bx(x + 23, y - 4, 5, 5, BO2, BO3); bx(x + 23, y, 5, 5, BO2, BO3);
    R(x + 27, y - 1, 1, 2, '#000'); R(x + 10, y, 3, 1, BO1); R(x + 16, y - 1, 2, 1, BO1);
  } };
  BAR.barrel_gatling = { len: 34, th: 9, d: function (x, y, o) {
    var s = (((o.spin || 0) * 3) | 0) % 3, r; if (s < 0) s += 3;
    bx(x, y - 6, 34, 12, G1);
    for (r = 0; r < 3; r++) { R(x + 1, y - 5 + r * 3 + (r === 2 ? 1 : 0), 32, 3, r === s ? S3 : (r === (s + 1) % 3 ? S2 : S1)); R(x + 33, y - 4 + r * 3 + (r === 2 ? 1 : 0), 1, 1, '#000'); }
    bx(x + 4, y - 7, 4, 14, G2, G3); bx(x + 19, y - 7, 4, 14, G2, G3); bx(x + 29, y - 7, 3, 14, G2, G3);
  } };
  BAR.barrel_coil = { len: 32, th: 4, d: function (x, y) {
    tube(x, y, 32, 4, TE2, TE3, TE1);
    for (var i = 0; i < 5; i++) { bx(x + 2 + i * 6, y - 4, 3, 8, CU, CU2); R(x + 5 + i * 6, y - 1, 3, 1, (((T * 10) | 0) + i) % 5 === 0 ? CY2 : '#2f7f93'); }
    R(x + 31, y - 1, 1, 2, CY);
  } };
  BAR.barrel_lamp = { len: 120, th: 3, d: function (x, y) {
    var p1 = '#56655d', p2 = '#7d8f86', p3 = '#a9bab0';
    tube(x, y, 120, 3, p2, p3, p1);
    bx(x, y - 4, 8, 8, p1, p2);
    R(x + 13, y - 1, 6, 3, WH); R(x + 14, y, 3, 1, RD);
    R(x + 60, y - 1, 2, 3, p1);
    R(x + 103, y - 13, 3, 12, K); R(x + 104, y - 12, 1, 11, p2);
    R(x + 103, y - 14, 17, 3, K); R(x + 104, y - 13, 15, 1, p2);
    bx(x + 108, y - 12, 12, 5, p1, p2); R(x + 109, y - 8, 10, 2, ((T * 7) | 0) % 9 ? '#ffe9a0' : '#8a7f50');
    R(x + 119, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_gold = { len: 30, th: 4, d: function (x, y) {
    var g1 = '#a87a0c', g2 = '#e8b923', g3 = '#fff3a8';
    tube(x, y, 30, 4, g2, g3, g1);
    bx(x + 5, y - 4, 3, 8, g2, g3); bx(x + 22, y - 4, 3, 8, g2, g3);
    R(x + 10, y - 1, 10, 1, g1); R(x + 12, y, 6, 1, g1); R(x + 29, y - 1, 1, 2, '#000');
    var k = ((T * 5) | 0) % 4; R(x + 4 + k * 7, y - 6, 1, 3, WH); R(x + 3 + k * 7, y - 5, 3, 1, WH);
  } };
  BAR.barrel_recorder = { len: 36, th: 4, d: function (x, y) {
    var r1 = '#c4b88f', r2 = '#efe6c8', r3 = '#fffbe8';
    tube(x, y, 34, 4, r2, r3, r1);
    bx(x, y - 4, 5, 8, '#7a4a2a', '#a06a40'); bx(x + 23, y - 4, 3, 8, '#7a4a2a', '#a06a40');
    for (var i = 0; i < 6; i++) R(x + 6 + i * 3 + (i > 4 ? 6 : 0), y - 2, 2, 2, K);
    bx(x + 32, y - 4, 4, 8, r2, r3); R(x + 35, y - 1, 1, 2, '#000');
  } };
  BAR.barrel_straw = { len: 30, th: 3, d: function (x, y) {
    tube(x, y, 30, 3, PK, '#ffb0d8', '#c94a8a');
    for (var i = 0; i < 6; i++) { R(x + 2 + i * 5, y - 1, 2, 1, WH); R(x + 3 + i * 5, y, 2, 1, WH); R(x + 4 + i * 5, y + 1, 2, 1, WH); }
    circ(x + 9, y, 1, '#2a1a10'); circ(x + 20, y, 1, '#2a1a10'); R(x + 29, y - 1, 1, 3, '#2a1a10');
  } };

  /* ───────────── 총구: d(x, y) — (x,y) = 총열 끝. len = 탄이 나가는 끝까지, f = 총구 화염 종류 ───────────── */
  var MUZ_G = { len: 6, d: function (x, y) { bx(x, y - 3, 6, 6, G3, S2); R(x + 5, y - 1, 1, 2, '#000'); } };
  MUZ.muz_fork = { len: 0, d: function (x, y) {
    R(x - 9, y + 2, 12, 4, K); R(x - 8, y + 3, 10, 2, S3);
    bx(x - 6, y - 3, 4, 9, TP1, TP2);
    bx(x + 2, y + 1, 3, 6, S2, S3);
    for (var i = 0; i < 3; i++) { R(x + 4, y + 1 + i * 2, 7, 2, K); R(x + 4, y + 1 + i * 2, 6, 1, S3); }
  } };
  MUZ.muz_oil = { len: 14, f: 'none', d: function (x, y) {
    bx(x, y - 5, 14, 10, BL, '#7fb8f0', '#2a5f9c'); R(x + 3, y - 3, 7, 6, WH); R(x + 4, y - 2, 5, 1, RD); R(x + 4, y, 5, 1, RD);
    bx(x, y - 5, 3, 10, S1, S2); R(x + 12, y - 4, 1, 8, '#2a5f9c'); R(x + 13, y - 1, 1, 2, '#000');
  } };
  MUZ.muz_funnel = { len: 10, d: function (x, y) {
    var i;
    bx(x, y - 2, 5, 5, S2, S3);
    for (i = 0; i < 6; i++) R(x + 4 + i, y - 3 - i, 1, 7 + i * 2, K);
    for (i = 0; i < 5; i++) R(x + 4 + i, y - 2 - i, 1, 5 + i * 2, i % 2 ? '#e8833a' : OR);
    R(x + 9, y - 7, 1, 15, '#7a3f10'); R(x + 5, y - 2, 4, 1, '#ffb878');
  } };
  MUZ.muz_brake = { len: 8, d: function (x, y) { bx(x, y - 4, 8, 8, S2, S3, S1); R(x + 2, y - 3, 1, 6, K); R(x + 5, y - 3, 1, 6, K); R(x + 7, y - 1, 1, 2, '#000'); } };
  MUZ.muz_comp = { len: 9, d: function (x, y) { bx(x, y - 3, 9, 7, G3, S2, G2); R(x + 2, y - 3, 2, 2, K); R(x + 5, y - 3, 2, 2, K); R(x + 8, y - 1, 1, 2, '#000'); } };
  MUZ.muz_supp = { len: 20, f: 'none', d: function (x, y) {
    bx(x, y - 4, 20, 8, G1, G3, '#111'); for (var i = 0; i < 4; i++) R(x + 4 + i * 4, y - 3, 1, 6, G2);
    bx(x, y - 4, 3, 8, G2, G3); R(x + 19, y - 1, 1, 2, '#000');
  } };
  MUZ.muz_choke = { len: 7, d: function (x, y) {
    bx(x, y - 4, 6, 8, S2, S3, S1); R(x + 2, y - 3, 1, 6, BR2);
    for (var i = 0; i < 4; i++) { R(x + 6, y - 4 + i * 2, 2, 1, K); R(x + 6, y - 3 + i * 2, 1, 1, S3); }
  } };
  MUZ.muz_shower = { len: 11, d: function (x, y) {
    var i;
    bx(x, y - 2, 5, 5, S3, WH);
    bx(x + 4, y - 5, 4, 10, S3, WH, S2);
    bx(x + 7, y - 8, 4, 16, S3, WH, S2);
    for (i = 0; i < 6; i++) R(x + 10, y - 7 + i * 2 + (i % 2), 1, 1, BL);
    for (i = 0; i < 4; i++) R(x + 8, y - 6 + i * 4, 1, 2, S1);
  } };
  MUZ.muz_torch = { len: 10, f: 'fire', d: function (x, y) {
    bx(x, y - 3, 8, 6, BR2, BR3, BR1); bx(x + 7, y - 2, 3, 4, S2, S3);
    bx(x + 1, y + 2, 6, 8, BL, '#7fb8f0'); R(x + 2, y + 6, 4, 1, YE);
    bx(x + 3, y - 6, 3, 4, RD, '#ff8a80');
    var f = ((T * 12) | 0) % 2; R(x + 10, y - 1, 3 + f, 2, BL); R(x + 10, y - 1, 2, 1, CY2);
  } };
  MUZ.muz_megaphone = { len: 16, f: 'ring', d: function (x, y) {
    var i;
    bx(x, y - 3, 5, 6, G2, G3);
    bx(x + 3, y + 3, 4, 6, G1, G3);
    for (i = 0; i < 9; i++) R(x + 4 + i, y - 4 - i, 1, 8 + i * 2, K);
    for (i = 0; i < 8; i++) R(x + 5 + i, y - 4 - i, 1, 8 + i * 2, i % 3 === 0 ? PL1 : WH);
    bx(x + 13, y - 13, 3, 26, RD, '#ff8a80'); R(x + 15, y - 11, 1, 22, '#5a1410');
  } };
  MUZ.muz_tesla = { len: 11, f: 'elec', d: function (x, y) {
    R(x, y - 2, 10, 4, K); R(x, y - 1, 10, 2, S3);
    for (var i = 0; i < 4; i++) bx(x + 1 + i * 2, y - 4 + (i % 2), 3, 8 - (i % 2) * 2, CU, CU2);
    circ(x + 10, y, 2, K); circ(x + 10, y, 1, S3);
    if (((T * 15) | 0) % 3) { R(x + 9, y - 5, 1, 2, CY2); R(x + 11, y - 6, 1, 2, CY); R(x + 12, y + 3, 1, 2, CY2); }
  } };
  MUZ.muz_stinger = { len: 13, f: 'goo', d: function (x, y) {
    bx(x, y - 4, 7, 8, '#7a3f9c', '#a86fcf', '#4f2468');
    R(x + 6, y - 3, 3, 6, K); R(x + 6, y - 2, 3, 4, '#4f2468'); R(x + 9, y - 2, 2, 4, K); R(x + 9, y - 1, 2, 2, '#2a1040'); R(x + 11, y - 1, 2, 2, K);
    R(x + 2, y - 2, 2, 2, '#d8e84a'); R(x + 12, y + 1, 1, 2 + (((T * 3) | 0) % 2), '#b6ff3c');
  } };
  MUZ.muz_firework = { len: 10, f: 'star', d: function (x, y) {
    var cs = [RD, BL, YE];
    for (var i = 0; i < 3; i++) { bx(x, y - 6 + i * 4, 9, 5, cs[i], WH); R(x + 3, y - 5 + i * 4, 1, 3, WH); R(x + 6, y - 5 + i * 4, 1, 3, WH); R(x + 9, y - 4 + i * 4, 2, 1, '#555'); }
    bx(x + 1, y - 7, 3, 15, TP1, TP2);
    if (((T * 8) | 0) % 2) R(x + 11, y - 4, 1, 1, OR);
  } };
  MUZ.muz_bubble = { len: 12, f: 'bubble', d: function (x, y) {
    R(x, y - 2, 5, 4, K); R(x, y - 1, 5, 2, PK);
    circ(x + 8, y, 5, K); circ(x + 8, y, 4, PK); circ(x + 8, y, 3, '#bfeaff'); R(x + 6, y - 2, 2, 1, WH); R(x + 9, y + 1, 1, 1, '#e8c8ff');
    var b = (T * 6) % 8, b2 = (b + 4) % 8;
    R(x + 14 + b, y - 3 - b * 0.6, 2, 2, '#bfeaff'); R(x + 14 + b, y - 3 - b * 0.6, 1, 1, WH);
    R(x + 13 + b2, y + 4 - b2 * 0.3, 2, 2, '#bfeaff'); R(x + 13 + b2, y + 4 - b2 * 0.3, 1, 1, WH);
  } };

  /* ───────────── 탄창: fn(x, y, o, ac) — (x,y) = 위쪽 중앙, ac = 탄약 색 ───────────── */
  function MAG_G(x, y, o, ac) { bx(x - 3, y, 7, 11, G2, G3, G1); if (ac) R(x - 2, y + 2, 5, 2, ac); }
  MAG.mag_tape = function (x, y, o, ac) {
    bx(x - 3, y, 7, 13, G2, G3, G1); bx(x + 3, y + 2, 6, 13, G3, S2, G2);
    R(x - 3, y + 5, 12, 3, K); R(x - 3, y + 6, 12, 1, TP2); R(x - 3, y + 10, 12, 2, TP1);
    if (ac) { R(x + 4, y + 13, 4, 1, ac); R(x - 2, y + 1, 5, 1, ac); }
  };
  MAG.mag_pet = function (x, y, o, ac) {
    bx(x - 2, y, 5, 5, WH, '#ffffff');
    bx(x - 4, y + 4, 9, 13, GR, '#a8e89a', '#3a8a2c');
    R(x - 3, y + 8, 7, 3, WH); R(x - 2, y + 9, 3, 1, BL);
    R(x - 2, y + 13, 2, 2, ac || BR2); R(x + 1, y + 12, 2, 2, ac || BR2); R(x - 3, y + 5, 1, 3, '#d8ffd0');
  };
  MAG.mag_lunch = function (x, y, o, ac) {
    bx(x - 8, y, 16, 10, '#d9bd5a', '#f3e08a', '#a88a2c');
    R(x - 7, y + 3, 14, 1, '#a88a2c'); bx(x - 2, y + 2, 4, 3, S3, WH);
    R(x + 3, y + 6, 2, 2, '#a88a2c'); R(x - 6, y + 7, 1, 1, '#a88a2c');
    if (ac) R(x - 6, y + 5, 3, 1, ac);
  };
  MAG.mag_ext = function (x, y, o, ac) {
    var i, mx;
    for (i = 0; i < 20; i++) R(x - 4 + ((i / 6) | 0), y + i, 9, 1, K);
    for (i = 0; i < 19; i++) { mx = x - 3 + ((i / 6) | 0); R(mx, y + i, 7, 1, i % 5 === 4 ? G1 : G3); R(mx, y + i, 1, 1, S2); }
    if (ac) R(x - 3, y + 2, 7, 2, ac);
  };
  MAG.mag_quick = function (x, y, o, ac) {
    bx(x - 4, y, 8, 10, OL2, OL3, OL1);
    R(x - 1, y + 9, 2, 5, K); R(x - 3, y + 13, 6, 1, OR); R(x - 3, y + 14, 1, 3, OR); R(x + 2, y + 14, 1, 3, OR); R(x - 3, y + 17, 6, 1, OR);
    R(x - 3, y + 3, 6, 2, ac || YE);
  };
  MAG.mag_kimchi = function (x, y, o, ac) {
    bx(x - 7, y + 2, 14, 11, RD, '#f0736a', RD2);
    bx(x - 8, y, 16, 4, WH, '#ffffff', '#c9c5b8');
    R(x - 5, y + 6, 10, 4, WH); R(x - 4, y + 7, 3, 2, RD); R(x, y + 7, 4, 1, GR);
    R(x + 6, y + 4, 1, 4, '#b6ff3c');
    if (ac) R(x - 6, y + 11, 12, 1, ac);
  };
  MAG.mag_drum = function (x, y, o, ac) {
    bx(x - 3, y, 6, 5, G2, G3);
    circ(x, y + 11, 8, K); circ(x, y + 11, 7, G3); circ(x, y + 11, 5, G2); circ(x, y + 11, 2, S3);
    for (var i = 0; i < 6; i++) R(x + Math.cos(i * 1.047) * 6, y + 11 + Math.sin(i * 1.047) * 6, 1, 1, S3);
    if (ac) R(x - 2, y + 2, 4, 2, ac);
  };
  MAG.mag_belt = function (x, y, o, ac) {
    bx(x - 8, y + 5, 16, 11, OL2, OL3, OL1); R(x - 6, y + 8, 12, 1, OL1); txt('404', x - 5, y + 10, YE);
    var c = ac || BR2;
    for (var i = 0; i < 7; i++) { var px = x + 2 + i, py = y + 4 - Math.round(Math.sin(i / 6 * 3.14) * 4) - i; R(px, py, 2, 4, K); R(px, py + 1, 1, 2, i % 2 ? c : BR3); }
  };
  MAG.mag_cell = function (x, y, o, ac) {
    bx(x - 4, y, 9, 14, TE2, TE3, TE1);
    var lv = 1 + (((T * 3) | 0) % 4);
    for (var i = 0; i < 4; i++) R(x - 2, y + 11 - i * 3, 5, 2, i < lv ? (ac || CY) : '#1f4f5f');
  };
  MAG.mag_gland = function (x, y, o, ac) {
    var p = Math.sin(T * 4) > 0 ? 1 : 0;
    bx(x - 3, y, 6, 4, FL1, FL2);
    bx(x - 5 - p, y + 3, 10 + p * 2, 10 + p, FL2, FL3, FL1);
    R(x - 3, y + 6, 1, 5, '#5a2bb0'); R(x + 2, y + 5, 1, 3, '#5a2bb0');
    bx(x - 1, y + 8, 4, 4, ac || '#d8e84a', WH);
    R(x + 3 + p, y + 13 + p, 1, 2, '#b6ff3c');
  };
  MAG.mag_buffet = function (x, y, o, ac) {
    bx(x - 7, y, 14, 4, S3, WH, S2);
    bx(x - 6, y + 3, 12, 8, S2, S3, S1);
    R(x - 4, y + 5, 3, 1, BR3); R(x - 4, y + 7, 3, 1, BR3); R(x - 5, y + 6, 1, 1, BR3); R(x - 1, y + 6, 1, 1, BR3);
    R(x, y + 5, 3, 1, BR3); R(x, y + 7, 3, 1, BR3); R(x + 3, y + 6, 1, 1, BR3);
    R(x - 8, y + 5, 2, 2, K); R(x + 6, y + 5, 2, 2, K);
    var s = ((T * 2) | 0) % 2; R(x - 2 + s, y - 3, 1, 2, WH); R(x + 2 - s, y - 4, 1, 2, WH);
    if (ac) R(x - 5, y + 9, 10, 1, ac);
  };
  MAG.mag_washer = function (x, y, o, ac) {
    bx(x - 8, y, 16, 18, WH, '#ffffff', '#c9c5b8');
    R(x - 7, y + 4, 14, 1, '#c9c5b8'); R(x - 6, y + 2, 4, 1, BL); R(x + 2, y + 1, 2, 2, K); R(x + 5, y + 1, 1, 2, RD);
    circ(x, y + 10, 5, K); circ(x, y + 10, 4, S3); circ(x, y + 10, 3, ac || '#4fa8e8');
    var an = T * 6; R(x + Math.cos(an) * 2, y + 10 + Math.sin(an) * 2, 2, 1, WH); R(x - Math.cos(an) * 2, y + 10 - Math.sin(an) * 2, 1, 1, '#d8f0ff');
    R(x - 7, y + 17, 3, 2, K); R(x + 4, y + 17, 3, 2, K);
  };
  MAG.mag_piggy = function (x, y, o, ac) {
    var p2 = '#ffb0d8', p3 = '#c94a8a';
    bx(x - 2, y, 4, 3, PK, p2);
    R(x - 7, y + 11, 3, 3, K); R(x - 6, y + 11, 1, 2, PK); R(x + 2, y + 11, 3, 3, K); R(x + 3, y + 11, 1, 2, PK);
    bx(x - 8, y + 2, 15, 10, PK, p2, p3);
    bx(x + 6, y + 5, 4, 5, p2, WH); R(x + 8, y + 6, 1, 1, K); R(x + 8, y + 8, 1, 1, K);
    R(x + 3, y + 4, 2, 2, K); R(x + 3, y + 4, 1, 1, WH);
    R(x, y + 2, 3, 2, p3); R(x - 4, y + 4, 5, 1, K);
    R(x - 10, y + 5, 2, 1, p3); R(x - 10, y + 6, 1, 2, p3);
    if (ac) R(x - 3, y + 4, 3, 1, ac);
  };

  /* ───────────── 개머리판: fn(x, y) — (x,y) = 장착점, -x 쪽으로 뻗는다 ───────────── */
  function STK_G(x, y) { bx(x - 16, y - 3, 17, 7, G2, G3, G1); }
  STK.stock_crutch = function (x, y) {
    R(x - 24, y - 3, 25, 3, K); R(x - 24, y - 2, 24, 1, S3);
    R(x - 24, y + 2, 25, 3, K); R(x - 24, y + 3, 24, 1, S3);
    bx(x - 12, y - 3, 3, 8, S2, S3);
    bx(x - 28, y - 6, 5, 14, G3, S2, G2); R(x - 27, y - 4, 1, 10, '#6a707c');
  };
  STK.stock_wrench = function (x, y) {
    bx(x - 20, y - 2, 21, 5, RD, '#f0736a', RD2); R(x - 14, y, 6, 1, RD2);
    bx(x - 22, y - 2, 4, 5, S1, S2);
    bx(x - 27, y - 6, 9, 5, S2, S3, S1); bx(x - 27, y + 2, 7, 4, S2, S3, S1);
    R(x - 26, y - 1, 4, 3, K); R(x - 25, y, 1, 1, S3);
  };
  STK.stock_spring = function (x, y) {
    var i, a;
    for (i = 0; i < 7; i++) { a = i % 2 ? 4 : -4; ln(x - i * 3 - 1, y + a - 1, x - i * 3 - 4, y - a - 1, K, 3); }
    for (i = 0; i < 7; i++) { a = i % 2 ? 4 : -4; ln(x - i * 3, y + a, x - i * 3 - 3, y - a, S3, 1); }
    bx(x - 26, y - 6, 4, 13, G2, G3);
    bx(x - 2, y - 3, 3, 7, G2, G3);
  };
  STK.stock_wood = function (x, y) {
    var i, top, h;
    for (i = 0; i < 24; i++) { top = y - 3 + ((i / 5) | 0); h = 6 + ((i / 4) | 0); R(x - i - 1, top - 1, 1, h + 2, K); }
    for (i = 0; i < 23; i++) { top = y - 3 + ((i / 5) | 0); h = 6 + ((i / 4) | 0); R(x - i - 1, top, 1, h, i % 7 === 3 ? W1 : W2); R(x - i - 1, top, 1, 1, W3); }
    R(x - 26, y, 3, 13, K); R(x - 25, y + 1, 1, 11, G3);
  };
  STK.stock_bat = function (x, y) {
    bx(x - 4, y - 2, 5, 5, W1, W2);
    bx(x - 13, y - 2, 10, 4, TP1, TP2);
    bx(x - 22, y - 3, 10, 6, W2, W3, W1);
    bx(x - 32, y - 4, 11, 8, W2, W3, W1); R(x - 30, y - 1, 6, 1, W1);
  };
  STK.stock_chair = function (x, y) {
    R(x - 12, y - 1, 13, 3, K); R(x - 12, y, 12, 1, S3);
    R(x - 12, y - 6, 2, 6, K);
    bx(x - 9, y + 2, 3, 6, G2, G3); circ(x - 8, y + 9, 2, K); R(x - 8, y + 9, 1, 1, S3);
    bx(x - 20, y - 12, 8, 20, BK, G3, '#000000');
    for (var i = 0; i < 6; i++) R(x - 18, y - 10 + i * 3, 4, 1, G2);
  };
  STK.stock_guitar = function (x, y) {
    var g1 = '#8a5a20', g2 = '#c98a3c', g3 = '#e8b060';
    bx(x - 12, y - 2, 13, 4, W1, W2); for (var i = 0; i < 4; i++) R(x - 3 - i * 3, y - 1, 1, 2, S3);
    bx(x - 24, y - 6, 13, 12, g2, g3, g1);
    bx(x - 36, y - 8, 14, 16, g2, g3, g1);
    R(x - 24, y - 5, 2, 10, g2);
    circ(x - 19, y, 2, '#2a1808'); R(x - 34, y - 1, 12, 1, WH); R(x - 34, y + 1, 12, 1, WH); bx(x - 31, y - 3, 3, 6, W1, W2);
  };
  STK.stock_tactical = function (x, y) {
    bx(x - 14, y - 2, 15, 5, G2, G3);
    bx(x - 26, y - 4, 13, 13, G2, G3, G1); R(x - 23, y + 1, 7, 5, K);
    bx(x - 24, y - 7, 10, 4, G3, S2);
    R(x - 28, y - 3, 3, 11, K); R(x - 27, y - 2, 1, 9, '#6a707c');
  };
  STK.stock_spine = function (x, y) {
    for (var i = 0; i < 6; i++) {
      var vx = x - 4 - i * 4, vy = y - 2 + ((i * i / 9) | 0);
      R(vx + 1, vy - 2, 3, 3, K); R(vx + 2, vy - 2, 1, 2, BO3);
      bx(vx, vy, 5, 6, BO2, BO3, BO1); R(vx + 2, vy + 3, 1, 1, RD2);
    }
    bx(x - 31, y - 2, 6, 12, BO2, BO3, BO1); R(x - 29, y + 2, 2, 3, K);
    R(x - 1, y - 1, 2, 4, FL2);
  };
  STK.stock_gyro = function (x, y) {
    bx(x - 10, y - 2, 11, 5, TE2, TE3);
    bx(x - 24, y - 6, 15, 13, TE2, TE3, TE1);
    var a = T * 8; circ(x - 17, y, 4, K); circ(x - 17, y, 3, '#12303a');
    R(x - 17 + Math.cos(a) * 3, y + Math.sin(a) * 3, 2, 2, CY2); R(x - 17 - Math.cos(a) * 3, y - Math.sin(a) * 3, 2, 2, CY); R(x - 17, y, 1, 1, WH);
    R(x - 26, y - 5, 2, 11, K); R(x - 12, y - 4, 1, 1, GR);
  };
  STK.stock_pillow = function (x, y) {
    bx(x - 4, y - 2, 5, 5, G2, G3);
    var s = '#cfcabb', st = '#a8c8ea';
    bx(x - 24, y - 9, 11, 19, WH, '#ffffff', s); bx(x - 13, y - 9, 11, 19, WH, '#ffffff', s);       // 테이프에 졸려 두 덩이가 된 베개
    R(x - 24, y - 9, 1, 1, '#3b3f3a'); R(x - 3, y - 9, 1, 1, '#3b3f3a'); R(x - 24, y + 9, 1, 1, '#3b3f3a'); R(x - 3, y + 9, 1, 1, '#3b3f3a');
    R(x - 22, y - 5, 7, 1, st); R(x - 22, y, 7, 1, st); R(x - 22, y + 5, 7, 1, st);
    R(x - 11, y - 5, 7, 1, st); R(x - 11, y, 7, 1, st); R(x - 11, y + 5, 7, 1, st);
    R(x - 16, y - 7, 1, 2, s); R(x - 11, y + 6, 1, 2, s);
    bx(x - 15, y - 6, 4, 13, TP1, TP2);
    var z = ((T * 1.5) | 0) % 3; txt('Z', x - 22 - z, y - 16 - z * 2, '#9fd8ff');
  };
  STK.stock_brick = function (x, y) {
    var m = '#d8cdb8';
    bx(x - 3, y - 2, 4, 5, G2, G3);
    bx(x - 19, y - 5, 17, 11, '#b5482f', '#d4694a', '#7f2f1c');
    R(x - 18, y - 1, 15, 1, m); R(x - 11, y - 4, 1, 3, m); R(x - 15, y, 1, 5, m); R(x - 7, y, 1, 5, m);
    bx(x - 13, y - 6, 4, 13, TP1, TP2);
  };

  /* ───────────── 조준기: fn(x, y) — (x,y) = 아래 중앙 (레일 위에 얹힌다) ───────────── */
  function SGT_G(x, y) { bx(x - 3, y - 4, 6, 5, G2, G3); }
  SGT.sight_nail = function (x, y) { R(x - 1, y - 7, 4, 8, K); R(x, y - 6, 2, 6, S3); R(x - 2, y - 9, 6, 3, K); R(x - 1, y - 8, 4, 1, WH); };
  SGT.sight_tp = function (x, y) {
    var c1 = '#8a7248', c2 = '#b89a6a', c3 = '#d4b888';
    bx(x - 8, y - 8, 16, 8, c2, c3, c1);
    R(x - 5, y - 7, 1, 6, c1); R(x - 1, y - 7, 1, 6, c1); R(x + 3, y - 7, 1, 6, c1);
    R(x + 6, y - 6, 1, 4, '#3a2a14'); R(x - 7, y - 6, 1, 4, '#3a2a14');
    bx(x - 4, y - 9, 3, 10, TP1, TP2); bx(x + 2, y - 9, 3, 10, TP1, TP2);
  };
  SGT.sight_binoc = function (x, y) {
    R(x - 2, y - 2, 5, 3, K);
    bx(x - 8, y - 8, 9, 7, BK, G3); bx(x, y - 10, 8, 10, BK, G3); R(x + 6, y - 9, 1, 8, '#4fa8e8'); R(x + 6, y - 8, 1, 2, WH);
    bx(x - 10, y - 7, 3, 5, G2, G3); R(x - 3, y - 12, 4, 3, K); R(x - 2, y - 12, 2, 1, RU2);
  };
  SGT.sight_mirror = function (x, y) {
    R(x - 1, y - 4, 3, 5, K); R(x, y - 4, 1, 4, G3);
    bx(x - 9, y - 11, 18, 8, BK, G3); R(x - 7, y - 9, 14, 4, '#9fd0e8'); R(x - 6, y - 9, 3, 1, WH); R(x - 2, y - 8, 2, 1, WH); R(x + 3, y - 7, 3, 2, '#6fa8c8');
  };
  SGT.sight_magnify = function (x, y) {
    bx(x - 2, y - 5, 4, 6, W2, W3);
    circ(x, y - 10, 6, K); circ(x, y - 10, 5, BR2); circ(x, y - 10, 4, '#bfe8ff'); R(x - 2, y - 13, 2, 1, WH); R(x - 3, y - 12, 1, 2, WH);
  };
  SGT.sight_laserp = function (x, y) {
    bx(x - 7, y - 5, 14, 5, S3, WH, S2); R(x - 2, y - 6, 3, 2, RD); R(x + 6, y - 4, 2, 3, K); R(x + 7, y - 3, 1, 1, RD);
    R(x - 6, y - 4, 2, 3, BL);
    if (((T * 9) | 0) % 4) R(x + 8, y - 3, 7, 1, '#ff4040');
  };
  SGT.sight_reddot = function (x, y) {
    bx(x - 5, y - 3, 10, 4, G2, G3);
    bx(x - 4, y - 11, 8, 9, BK, G3); R(x - 2, y - 9, 4, 5, '#3f6f7a'); R(x - 1, y - 7, 2, 2, '#ff3030'); R(x - 2, y - 9, 1, 1, '#8fc8d8');
  };
  SGT.sight_scope = function (x, y) {
    bx(x - 6, y - 3, 3, 4, G2, G3); bx(x + 3, y - 3, 3, 4, G2, G3);
    bx(x - 9, y - 8, 18, 6, BK, G3, '#000000');
    bx(x + 7, y - 9, 5, 8, BK, G3); R(x + 10, y - 8, 1, 6, '#4fa8e8'); R(x + 10, y - 7, 1, 2, WH);
    bx(x - 12, y - 8, 4, 6, BK, G3); bx(x - 2, y - 11, 4, 4, G2, G3);
  };
  SGT.sight_sniper = function (x, y) {
    bx(x - 8, y - 3, 3, 4, G2, G3); bx(x + 5, y - 3, 3, 4, G2, G3);
    bx(x - 14, y - 9, 30, 6, BK, G3, '#000000');
    bx(x + 10, y - 11, 10, 10, BK, G3); R(x + 18, y - 10, 1, 8, '#b06fe0'); R(x + 18, y - 9, 1, 3, WH);
    bx(x - 17, y - 10, 5, 8, BK, G3); R(x - 16, y - 8, 1, 4, '#4fa8e8');
    bx(x - 3, y - 13, 5, 5, G2, G3); bx(x + 3, y - 12, 3, 4, G2, G3); R(x - 2, y - 14, 3, 1, WH);
  };
  SGT.sight_thermal = function (x, y) {
    var hc = ['#2a0a5a', '#b02a8a', '#ff7030', '#ffe060'], i, j;
    R(x - 5, y - 14, 1, 4, K); R(x - 6, y - 16, 3, 3, K); R(x - 5, y - 15, 1, 1, RD);
    bx(x - 8, y - 10, 17, 10, TE2, TE3, TE1);
    bx(x + 8, y - 9, 4, 8, BK, G3); R(x + 10, y - 8, 1, 6, '#ff6030');
    for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) R(x - 6 + i * 2, y - 8 + j * 2, 2, 2, hc[(i * 3 + j * 5 + ((T * 4) | 0)) % 4]);
    R(x + 3, y - 8, 2, 1, GR); R(x + 3, y - 5, 2, 1, RD);
  };
  SGT.sight_eye = function (x, y) {
    bx(x - 3, y - 4, 6, 5, FL2, FL3, FL1);
    circ(x, y - 9, 5, K); circ(x, y - 9, 4, WH);
    var bl = Math.sin(T * 1.3) > 0.96, lx = Math.round(Math.sin(T * 1.7) * 2);
    if (bl) { circ(x, y - 9, 4, FL2); R(x - 4, y - 9, 9, 1, K); }
    else { circ(x + lx + 1, y - 9, 2, GR); R(x + lx + 1, y - 10, 2, 2, K); R(x + lx, y - 11, 1, 1, WH); R(x - 4, y - 7, 2, 1, RD); R(x + 2, y - 12, 2, 1, RD); }
  };
  SGT.sight_aimbot = function (x, y) {
    R(x - 6, y - 14, 1, 5, K); R(x - 7, y - 16, 3, 3, K); R(x - 6, y - 15, 1, 1, ((T * 5) | 0) % 2 ? GR : '#1f5f1f');
    bx(x - 8, y - 9, 16, 9, TE2, TE3, TE1);
    circ(x + 4, y - 5, 3, K); circ(x + 4, y - 5, 2, ((T * 3) | 0) % 2 ? '#ff3030' : '#a01010'); R(x + 3, y - 6, 1, 1, WH);
    txt('AI', x - 6, y - 7, CY);
  };
  SGT.sight_glasses = function (x, y) {
    R(x - 1, y - 3, 2, 4, K);
    circ(x - 5, y - 7, 4, K); circ(x - 5, y - 7, 3, BR3); circ(x - 5, y - 7, 2, '#d8f0ff');
    circ(x + 5, y - 7, 4, K); circ(x + 5, y - 7, 3, BR3); circ(x + 5, y - 7, 2, '#d8f0ff');
    R(x - 2, y - 8, 4, 1, BR2); R(x - 6, y - 8, 1, 1, WH); R(x + 4, y - 8, 1, 1, WH);
    for (var i = 0; i < 5; i++) R(x - 10 - (i % 2), y - 5 + i * 2, 1, 1, BR3);
  };
  SGT.sight_selfie = function (x, y) {
    bx(x - 3, y - 3, 6, 4, G2, G3);
    ln(x - 1, y - 4, x + 8, y - 17, K, 3); ln(x, y - 4, x + 9, y - 16, S3, 1);
    bx(x + 5, y - 27, 9, 12, BK, G3); R(x + 6, y - 25, 7, 8, '#8fe0ff'); R(x + 8, y - 23, 1, 1, K); R(x + 10, y - 23, 1, 1, K); R(x + 8, y - 20, 3, 1, K);
    var h = ((T * 2) | 0) % 3, hy = y - 28 - h * 2;
    R(x + 15, hy, 2, 1, PK); R(x + 18, hy, 2, 1, PK); R(x + 15, hy + 1, 5, 2, PK); R(x + 16, hy + 3, 3, 1, PK); R(x + 17, hy + 4, 1, 1, PK);
  };

  /* ───────────── 탄약: { c: 대표 색, d(x, y) 아이콘 (좌상단 기준 약 24x14) } ───────────── */
  function cart(x, y, tip, cs) {
    R(x + 1, y, 3, 1, K); R(x, y + 1, 5, 11, K); R(x - 1, y + 10, 7, 2, K);
    R(x + 1, y + 1, 3, 4, tip); R(x + 1, y + 5, 3, 5, cs || BR2); R(x + 1, y + 5, 1, 5, BR3); R(x, y + 10, 5, 1, BR1);
  }
  function carts(x, y, tip, cs, deco) {
    for (var i = 0; i < 3; i++) { var cx = x + 1 + i * 8, cy = y + (i === 1 ? 0 : 2); cart(cx, cy, tip, cs); if (deco) deco(cx, cy, i); }
  }
  AMMO.ammo_nail = { c: '#b8bcc4', d: function (x, y) {
    for (var i = 0; i < 3; i++) { var nx = x + 2 + i * 8; R(nx - 2, y, 7, 3, K); R(nx - 1, y, 5, 2, S3); R(nx, y + 2, 3, 11, K); R(nx + 1, y + 2, 1, 10, S3); R(nx + 1, y + 12, 1, 2, K); }
  } };
  AMMO.ammo_acid = { c: '#b6ff3c', d: function (x, y) { carts(x, y, '#b6ff3c', OL2, function (cx, cy, i) { if (i !== 1) R(cx + 4, cy + 3, 1, 3, '#b6ff3c'); }); } };
  AMMO.ammo_rubber = { c: '#ff7ab8', d: function (x, y) {
    var cs = [RD, BL, YE];
    for (var i = 0; i < 3; i++) { var cx = x + 4 + i * 8, cy = y + 9 - (i === 1 ? 5 : 0); circ(cx, cy, 4, K); circ(cx, cy, 3, cs[i]); R(cx - 2, cy - 2, 2, 1, WH); R(cx, cy + 1, 2, 1, WH); }
  } };
  AMMO.ammo_salt = { c: '#f4f4f4', d: function (x, y) {
    var s = '#c9d3dc';
    bx(x + 1, y + 5, 7, 8, WH, '#ffffff', s); bx(x + 9, y + 1, 9, 12, WH, '#ffffff', s); bx(x + 19, y + 7, 5, 6, WH, '#ffffff', s);
    R(x + 12, y + 4, 2, 2, s); R(x + 3, y + 8, 1, 2, s);
  } };
  AMMO.ammo_popcorn = { c: '#ffe9a8', d: function (x, y) {
    var p = [[6, 3], [10, 1], [14, 2], [8, 0], [12, 4], [16, 4]], i;
    for (i = 0; i < p.length; i++) bx(x + p[i][0] - 1, y + p[i][1] - 1, 5, 5, '#fff6d0', WH);
    bx(x + 5, y + 5, 14, 9, WH); for (i = 0; i < 3; i++) R(x + 7 + i * 4, y + 6, 2, 7, RD);
    bx(x, y + 10, 4, 4, YE, '#fff3a8'); bx(x + 21, y + 11, 3, 3, YE);
  } };
  AMMO.ammo_fmj = { c: '#8a94a3', d: function (x, y) { carts(x, y, S3, BR2, function (cx, cy) { R(cx + 1, cy + 4, 3, 1, K); }); } };
  AMMO.ammo_hp = { c: '#d98a4a', d: function (x, y) { carts(x, y, '#d98a4a', BR2, function (cx, cy) { R(cx + 2, cy + 1, 1, 2, K); }); } };
  AMMO.ammo_fire = { c: '#ff8a3c', d: function (x, y) { carts(x, y, OR, BR2, function (cx, cy, i) { R(cx + 1, cy + 1, 3, 1, YE); if (i === 1) { R(cx + 1, cy - 3, 3, 3, OR); R(cx + 2, cy - 4, 1, 2, YE); } }); } };
  AMMO.ammo_shock = { c: '#7fe9ff', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var cx = x + 1 + i * 8, cy = y + (i === 1 ? 0 : 2);
      R(cx + 1, cy, 3, 2, K); R(cx + 2, cy, 1, 1, S3); bx(cx - 1, cy + 1, 7, 12, BK, G3); R(cx, cy + 2, 5, 3, '#c9762c');
      R(cx + 2, cy + 7, 2, 1, YE); R(cx + 1, cy + 8, 2, 1, YE); R(cx + 2, cy + 9, 2, 1, YE);
    }
  } };
  AMMO.ammo_explosive = { c: '#ffd23c', d: function (x, y) { carts(x, y, YE, OL2, function (cx, cy) { R(cx + 1, cy + 2, 3, 1, K); R(cx + 1, cy + 4, 3, 1, K); R(cx + 1, cy + 7, 3, 1, RD); }); } };
  AMMO.ammo_cryo = { c: '#9fd8ff', d: function (x, y) { carts(x, y, '#9fd8ff', '#5a8fb8', function (cx, cy, i) { R(cx + 1, cy + 1, 1, 1, WH); R(cx + 3, cy + 6, 1, 1, WH); if (i === 1) { R(cx + 2, cy - 4, 1, 3, WH); R(cx + 1, cy - 3, 3, 1, WH); } }); } };
  AMMO.ammo_du = { c: '#d6ff5c', d: function (x, y) { carts(x, y, ((T * 3) | 0) % 2 ? '#a8d83c' : '#d6ff5c', S1, function (cx, cy) { R(cx + 1, cy + 7, 3, 1, YE); R(cx + 2, cy + 8, 1, 1, YE); }); } };
  AMMO.ammo_spore = { c: '#b06fd0', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var cx = x + 1 + i * 8, cy = y + (i === 1 ? 0 : 3);
      bx(cx + 1, cy + 4, 4, y + 14 - (cy + 4), BO2, BO3);
      bx(cx - 1, cy, 8, 6, PU, '#c89af0', '#5f2f8a'); R(cx + 1, cy + 2, 1, 1, WH); R(cx + 4, cy + 1, 1, 1, WH); R(cx + 3, cy + 3, 1, 1, WH);
    }
  } };
  AMMO.ammo_hot = { c: '#ff3b1f', d: function (x, y) {
    bx(x + 3, y + 5, 8, 9, RD, '#ff8a80', RD2); bx(x + 5, y + 1, 4, 5, RD, '#ff8a80'); bx(x + 5, y, 4, 2, GR, '#a8e89a');
    R(x + 5, y + 8, 4, 4, YE); R(x + 6, y + 9, 2, 3, OR); R(x + 7, y + 7, 1, 2, OR);
    ln(x + 14, y + 11, x + 20, y + 5, K, 4); ln(x + 15, y + 12, x + 21, y + 6, RD, 2); R(x + 21, y + 2, 3, 3, K); R(x + 22, y + 3, 1, 2, GR);
  } };
  AMMO.ammo_mint = { c: '#7fe0c0', d: function (x, y) {
    var ch = '#4a2a18', j;
    for (var i = 0; i < 2; i++) {
      var cx = x + 6 + i * 11, cy = y + 5 - i * 2;
      for (j = 0; j < 5; j++) R(cx - 4 + j, cy + 4 + j, 9 - j * 2, 1, K);
      for (j = 0; j < 4; j++) R(cx - 3 + j, cy + 4 + j, 7 - j * 2, 1, j % 2 ? '#c89850' : '#e0b470');
      circ(cx, cy, 5, K); circ(cx, cy, 4, '#7fe0c0'); R(cx - 2, cy - 3, 2, 1, WH); R(cx - 2, cy, 2, 2, ch); R(cx + 1, cy - 2, 2, 1, ch); R(cx + 1, cy + 2, 1, 1, ch);
    }
  } };
  AMMO.ammo_p2w = { c: '#ffd76a', d: function (x, y) { carts(x, y, '#fff3a8', '#e8b923', function (cx, cy, i) { R(cx + 2, cy + 6, 1, 3, '#a87a0c'); if (i === ((T * 3) | 0) % 3) { R(cx + 5, cy - 1, 1, 3, WH); R(cx + 4, cy, 3, 1, WH); } }); } };
  AMMO.ammo_glitter = { c: '#ff9be0', d: function (x, y) { carts(x, y, PK, PU, function (cx, cy, i) { var k = (((T * 4) | 0) + i) % 3; R(cx + 1 + k, cy + 2 + k * 3, 1, 1, WH); R(cx + 3 - k, cy + 6 + k, 1, 1, '#fff3a8'); if (k === 0) { R(cx + 6, cy, 1, 3, WH); R(cx + 5, cy + 1, 3, 1, WH); } }); } };

  /* ───────────── 부착물: { w, h, s, d(x, y) } — (x,y) = 상자 좌상단. s: 1 = 끈에 매달린 장식, 2 = 몸통에 붙이는 스티커류 ───────────── */
  var ACC_G = { w: 6, h: 6, d: function (x, y) { bx(x, y, 6, 6, G3, S2); } };
  ACC.acc_keyring = { w: 8, h: 14, s: 1, d: function (x, y) {
    R(x + 3, y, 2, 3, K); circ(x + 4, y + 4, 2, K); circ(x + 4, y + 4, 1, S3); R(x + 4, y + 4, 1, 1, K);
    bx(x, y + 6, 8, 8, GR, '#a8e89a', '#3a8a2c'); R(x + 1, y + 9, 6, 1, WH); R(x + 2, y + 11, 4, 1, WH);
  } };
  ACC.acc_sticker = { w: 14, h: 7, s: 2, d: function (x, y) {
    bx(x, y, 14, 7, YE, '#fff3a8');
    R(x + 2, y + 2, 2, 1, K); R(x + 2, y + 2, 1, 3, K); R(x + 2, y + 4, 2, 1, K); R(x + 5, y + 2, 1, 3, K); R(x + 5, y + 3, 2, 1, K);
    R(x + 8, y + 2, 2, 1, K); R(x + 9, y + 2, 1, 3, K); R(x + 8, y + 4, 2, 1, K);
    R(x + 11, y + 2, 1, 2, RD); R(x + 11, y + 5, 1, 1, RD);
  } };
  ACC.acc_cup = { w: 9, h: 13, d: function (x, y) {
    bx(x + 1, y + 3, 7, 10, WH, '#ffffff', '#cfcabb'); R(x + 2, y + 6, 5, 3, '#8a5a2c');
    bx(x, y + 2, 9, 2, '#3a2a1e');
    bx(x - 1, y + 9, 11, 3, G2, G3);
    var s = ((T * 2) | 0) % 2; R(x + 3 + s, y - 1, 1, 2, '#e8e8e8'); R(x + 5 - s, y - 2, 1, 2, '#e8e8e8');
  } };
  ACC.acc_dice = { w: 13, h: 16, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(T * 3));
    ln(x + 6, y, x + 3 + sw, y + 5, K, 1); ln(x + 6, y, x + 9 + sw, y + 8, K, 1);
    bx(x + sw, y + 5, 7, 7, WH, '#ffffff', '#cfcabb'); R(x + 2 + sw, y + 7, 1, 1, K); R(x + 4 + sw, y + 9, 1, 1, K);
    bx(x + 6 + sw, y + 8, 7, 7, RD, '#ff8a80', RD2); R(x + 8 + sw, y + 10, 1, 1, WH); R(x + 10 + sw, y + 12, 1, 1, WH); R(x + 8 + sw, y + 12, 1, 1, WH); R(x + 10 + sw, y + 10, 1, 1, WH);
  } };
  ACC.acc_flash = { w: 16, h: 7, d: function (x, y) {
    bx(x, y + 1, 11, 5, BK, G3); bx(x + 10, y, 5, 7, G2, G3); R(x + 14, y + 1, 1, 5, '#ffe9a0'); R(x + 3, y, 3, 2, RD);
    if (((T * 11) | 0) % 7) R(x + 15, y + 2, 2, 3, '#fff6c8');
  } };
  ACC.acc_energy = { w: 6, h: 13, d: function (x, y) {
    bx(x, y, 6, 13, BL, '#7fb8f0', '#2a5f9c'); R(x + 1, y, 4, 2, S3); R(x + 1, y + 11, 4, 1, S3);
    R(x + 3, y + 3, 2, 2, YE); R(x + 2, y + 5, 2, 2, YE); R(x + 3, y + 7, 1, 2, YE);
  } };
  ACC.acc_dumbbell = { w: 16, h: 9, d: function (x, y) {
    R(x + 2, y + 3, 12, 3, K); R(x + 3, y + 4, 10, 1, S3);
    bx(x, y, 5, 9, G2, G3, G1); bx(x + 11, y, 5, 9, G2, G3, G1); R(x + 1, y + 4, 2, 1, WH); R(x + 12, y + 4, 2, 1, WH);
  } };
  ACC.acc_gauge = { w: 11, h: 13, d: function (x, y) {
    bx(x + 4, y + 9, 3, 4, BR2, BR3);
    circ(x + 5, y + 5, 5, K); circ(x + 5, y + 5, 4, BR2); circ(x + 5, y + 5, 3, WH);
    R(x + 7, y + 3, 2, 2, RD);
    var j = ((T * 9) | 0) % 2; ln(x + 5, y + 5, x + 7 + j, y + 3 + j, K, 1);
  } };
  ACC.acc_bipod = { w: 14, h: 15, d: function (x, y) {
    bx(x + 4, y, 6, 4, G2, G3);
    ln(x + 6, y + 3, x + 1, y + 13, K, 3); ln(x + 7, y + 3, x + 11, y + 13, K, 3);
    ln(x + 7, y + 3, x + 2, y + 13, S2, 1); ln(x + 8, y + 3, x + 12, y + 13, S2, 1);
    R(x, y + 13, 4, 2, K); R(x + 10, y + 13, 4, 2, K);
  } };
  ACC.acc_lasersight = { w: 10, h: 6, d: function (x, y) {
    bx(x, y, 9, 6, BK, G3); R(x + 8, y + 2, 2, 2, '#ff3030'); R(x + 2, y + 2, 3, 1, RD);
    if (((T * 13) | 0) % 5) R(x + 10, y + 2, 8, 1, '#ff5050');
  } };
  ACC.acc_charm = { w: 7, h: 15, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(T * 2.5));
    R(x + 3, y, 1, 3, RD);
    bx(x + sw, y + 2, 7, 13, YE, '#fff3a8');
    R(x + 2 + sw, y + 4, 3, 1, RD); R(x + 3 + sw, y + 4, 1, 4, RD); R(x + 1 + sw, y + 6, 5, 1, RD);
    R(x + 2 + sw, y + 9, 3, 1, RD); R(x + 1 + sw, y + 11, 1, 2, RD); R(x + 5 + sw, y + 11, 1, 2, RD); R(x + 3 + sw, y + 10, 1, 3, RD);
  } };
  ACC.acc_blackbox = { w: 10, h: 9, d: function (x, y) {
    R(x + 4, y, 2, 3, K);
    bx(x, y + 2, 10, 7, BK, G3); circ(x + 7, y + 5, 2, K); R(x + 7, y + 5, 1, 1, '#4fa8e8'); R(x + 6, y + 4, 1, 1, WH);
    R(x + 2, y + 4, 2, 2, ((T * 2) | 0) % 2 ? '#ff3030' : '#5a1010');
  } };
  ACC.acc_protein = { w: 7, h: 13, d: function (x, y) {
    bx(x, y + 3, 7, 10, '#e8f0f0', '#ffffff', '#b8c8c8'); R(x + 1, y + 8, 5, 4, '#f0a8c8');
    bx(x, y, 7, 4, BK, G3);
    R(x + 5, y + 5, 1, 1, K); R(x + 5, y + 7, 1, 1, K); R(x + 5, y + 9, 1, 1, K);
  } };
  ACC.acc_tax = { w: 11, h: 9, s: 2, d: function (x, y) {
    bx(x, y, 11, 9, WH, '#ffffff'); R(x + 2, y + 2, 5, 1, K); R(x + 2, y + 4, 7, 1, '#8a8a8a'); R(x + 2, y + 6, 4, 1, '#8a8a8a');
    bx(x + 6, y + 4, 5, 5, RD, '#ff8a80'); R(x + 8, y + 6, 1, 1, WH);
    R(x + 4, y - 1, 3, 2, TP2);
  } };
  ACC.acc_stamp = { w: 8, h: 12, d: function (x, y) {
    bx(x + 2, y, 4, 5, W2, W3); bx(x + 1, y + 4, 6, 4, W1, W2); bx(x, y + 7, 8, 5, RD, '#ff8a80', RD2);
  } };
  ACC.acc_letter = { w: 12, h: 8, s: 2, d: function (x, y) {
    bx(x, y, 12, 8, '#f4e8c8', '#fff8e0', '#c8b890'); ln(x + 1, y + 1, x + 5, y + 4, '#c8b890', 1); ln(x + 10, y + 1, x + 6, y + 4, '#c8b890', 1);
    R(x + 4, y + 3, 2, 1, RD); R(x + 6, y + 3, 2, 1, RD); R(x + 4, y + 4, 4, 1, RD); R(x + 5, y + 5, 2, 1, RD);
  } };
  ACC.acc_chainsaw = { w: 34, h: 8, d: function (x, y) {
    bx(x, y, 12, 8, OR, '#ffb060', '#b05f14'); R(x + 2, y + 2, 4, 2, K); R(x + 8, y + 2, 2, 4, WH);
    bx(x + 11, y + 1, 23, 6, S3, WH, S2); R(x + 14, y + 3, 16, 1, S1);
    var k = ((T * 16) | 0) % 3;
    for (var i = 0; i < 7; i++) { R(x + 12 + i * 3 + k, y, 1, 2, K); R(x + 14 + i * 3 - k, y + 6, 1, 2, K); }
  } };
  ACC.acc_wifi = { w: 14, h: 13, d: function (x, y) {
    R(x + 2, y, 2, 8, K); R(x + 10, y, 2, 8, K); R(x + 6, y + 2, 2, 6, K); R(x + 2, y, 2, 1, CY);
    bx(x, y + 7, 14, 6, WH, '#ffffff', '#c9c5b8');
    for (var i = 0; i < 4; i++) R(x + 2 + i * 3, y + 10, 1, 1, (((T * 6) | 0) + i) % 3 ? GR : '#1f5f1f');
  } };
  ACC.acc_fridge = { w: 9, h: 13, d: function (x, y) {
    bx(x, y, 9, 13, WH, '#ffffff', '#c9c5b8'); R(x + 1, y + 4, 7, 1, '#9a968a'); R(x + 6, y + 1, 1, 2, S1); R(x + 6, y + 6, 1, 4, S1);
    R(x + 2, y + 6, 2, 2, RD); R(x + 2, y + 9, 2, 1, YE);
    if (((T * 2) | 0) % 2) R(x + 2, y - 2, 1, 1, '#9fd8ff');
  } };
  ACC.acc_parasite = { w: 18, h: 9, d: function (x, y) {
    for (var i = 0; i < 7; i++) { var sy = Math.round(Math.sin(i * 0.9 + T * 5) * 2); bx(x + i * 2, y + 2 + sy, 4, 5, i % 2 ? FL2 : FL3, FL3); }
    var hy = Math.round(Math.sin(6.3 + T * 5) * 2); bx(x + 13, y + 1 + hy, 5, 6, FL1, FL2); R(x + 17, y + 3 + hy, 1, 2, WH); R(x + 15, y + 2 + hy, 1, 1, K);
  } };
  ACC.acc_rgb = { w: 20, h: 4, s: 2, d: function (x, y) {
    R(x, y, 20, 4, K);
    for (var i = 0; i < 9; i++) R(x + 1 + i * 2, y + 1, 2, 2, 'hsl(' + (((i * 40 + T * 200) % 360) | 0) + ',100%,60%)');
  } };
  ACC.acc_duck = { w: 13, h: 12, d: function (x, y) {
    var d1 = '#c49a1c', d3 = '#fff3a8';
    if (Math.sin(T * 3) > 0) y += 1;
    bx(x, y + 5, 12, 7, YE, d3, d1);
    bx(x + 6, y, 7, 7, YE, d3);
    R(x + 12, y + 3, 3, 3, K); R(x + 12, y + 4, 2, 1, OR);
    R(x + 9, y + 2, 2, 2, K); R(x + 9, y + 2, 1, 1, WH);
    R(x + 2, y + 8, 4, 2, d1); R(x - 1, y + 5, 2, 2, K);
  } };
  ACC.acc_spinner = { w: 13, h: 13, d: function (x, y) {
    var cx = x + 6, cy = y + 6, a = T * 12, cs = [RD, BL, GR];
    for (var i = 0; i < 3; i++) { var an = a + i * 2.094, lx = Math.round(cx + Math.cos(an) * 4), ly = Math.round(cy + Math.sin(an) * 4); circ(lx, ly, 2, K); circ(lx, ly, 1, cs[i]); }
    circ(cx, cy, 2, K); circ(cx, cy, 1, S3);
  } };
  ACC.acc_horn = { w: 16, h: 9, d: function (x, y) {
    circ(x + 3, y + 4, 3, K); circ(x + 3, y + 4, 2, '#333333'); R(x + 2, y + 3, 1, 1, '#777777');
    bx(x + 5, y + 3, 6, 4, BR2, BR3); bx(x + 10, y + 1, 3, 8, BR2, BR3); bx(x + 12, y, 3, 9, BR2, BR3, BR1); R(x + 14, y + 1, 1, 7, '#3a2a08');
  } };
  ACC.acc_coupon = { w: 12, h: 9, s: 2, d: function (x, y) {
    bx(x + 2, y, 10, 7, '#e8b923'); bx(x + 1, y + 1, 10, 7, YE); bx(x, y + 2, 10, 7, YE, '#fff3a8');
    R(x + 2, y + 4, 4, 3, '#b5632a'); R(x + 3, y + 4, 2, 1, '#e08a4a'); R(x + 6, y + 5, 2, 1, WH); R(x + 7, y + 4, 1, 3, WH);
  } };

  /* ───────────── 조립 ───────────── */
  function layout(parts) {
    var rec = REC[parts.receiver] || REC._g, a = rec.a;
    var bar = parts.barrel ? (BAR[parts.barrel] || BAR_G) : null;
    var muz = parts.muzzle ? (MUZ[parts.muzzle] || MUZ_G) : null;
    var blen = bar ? bar.len : 0;
    return { rec: rec, a: a, bar: bar, muz: muz, blen: blen, mzx: a.bx + blen, mzy: a.by, tipX: a.bx + blen + (muz ? muz.len : (bar ? 0 : 2)) };
  }
  function drawAcc(id, slot, L, o) {
    if (!id) return;
    var d = ACC[id] || ACC_G, a = L.a, p;
    if (d.s === 2) {                      // 스티커류: 몸통 옆면에 붙인다
      p = a.st || [a.tx, a.ty + 6];
      d.d(slot === 1 ? p[0] + 1 : p[0] - d.w - 1, p[1] - (d.h >> 1), o);
      return;
    }
    if (slot === 1) {                     // 총열/핸드가드 아래
      p = a.a1 || (L.blen >= 14 ? [a.bx + Math.min(10, L.blen >> 1), a.by + ((L.bar.th + 1) >> 1) + 1] : [a.bx - 5, a.bot != null ? a.bot : a.by + 4]);
      if (d.s === 1) { d.d(p[0] - (d.w >> 1), p[1], o); return; }
      R(p[0] - 2, p[1] - 1, 4, 3, K); R(p[0] - 1, p[1], 2, 1, S2);     // 클램프
      d.d(p[0] - (d.w >> 1), p[1] + 2, o);
    } else if (d.s === 1) {               // 뒤쪽에 대롱대롱
      d.d(a.hx - (d.w >> 1), a.hy, o);
    } else {                              // 윗면 뒤쪽에 얹기
      d.d(a.a2x - (d.w >> 1), a.a2y - d.h, o);
    }
  }
  function render(parts, o) {
    var L = layout(parts), a = L.a;
    var am = parts.ammo ? AMMO[parts.ammo] : null, ac = am ? am.c : null;
    if (parts.stock) (STK[parts.stock] || STK_G)(a.sx, a.sy, o);
    if (L.bar) L.bar.d(a.bx, a.by, o);
    else { tube(a.bx - 2, a.by, 4, a.bt || 3, G3, S2); R(a.bx + 1, a.by - 1, 1, 2, '#000000'); }
    if (L.muz) L.muz.d(L.mzx, L.mzy, o);
    if (parts.mag) (MAG[parts.mag] || MAG_G)(a.mx, a.my, o, ac);
    L.rec.d(o);
    if (!parts.mag && ac) { R(a.tx - 3, a.ty + 3, 6, 4, K); R(a.tx - 2, a.ty + 4, 4, 2, ac); }   // 탄종 표시 띠
    else if (ac && parts.ammo === 'ammo_glitter' && ((T * 4) | 0) % 2) R(a.mx + 3, a.my + 3, 1, 1, WH);
    if (parts.sight) (SGT[parts.sight] || SGT_G)(a.tx, a.ty, o);
    drawAcc(parts.acc1, 1, L, o);
    drawAcc(parts.acc2, 2, L, o);
    return L;
  }

  /* ───────────── 총구 화염 ───────────── */
  function flash(x, y, kind, f) {
    if (kind === 'none' || !(f > 0)) return;
    var s = Math.max(1, Math.ceil(f * 3)), i, an, cs;
    switch (kind) {
      case 'small':
        R(x, y - 1, 3 + s * 2, 3, '#ffd23c'); R(x, y - 1, 2 + s, 2, '#fff6c8'); R(x + 2, y - 2 - s, 2, 2, YE); R(x + 2, y + 1 + s, 2, 2, YE);
        break;
      case 'big':
        R(x, y - 3 - s, 6 + s * 3, 7 + s * 2, '#ffb030'); R(x, y - 2, 10 + s * 5, 4, '#ffd23c'); R(x + 2, y - 5 - s * 2, 4, 11 + s * 4, '#ffd23c');
        R(x, y - 2 - s, 5 + s * 2, 4 + s * 2, '#fff6c8'); R(x + 7 + s * 2, y - 5 - s, 2, 2, YE); R(x + 7 + s * 2, y + 3 + s, 2, 2, YE);
        break;
      case 'elec':
        cs = [CY2, CY, WH];
        for (i = 0; i < 4; i++) { an = (i - 1.5) * 0.5 + Math.sin(T * 40 + i) * 0.3; ln(x, y, x + Math.cos(an) * (5 + s * 3), y + Math.sin(an) * (5 + s * 3), cs[i % 3], 1); }
        R(x, y - 1, 3, 3, WH);
        break;
      case 'fire':
        R(x, y - 2, 6 + s * 4, 5, OR); R(x, y - 1, 5 + s * 3, 3, YE); R(x + 6 + s * 4, y - 1, 3, 2, RD); R(x, y - 1, 3, 2, '#fff6c8');
        break;
      case 'energy':
        R(x, y - 1, 8 + s * 5, 2, CY2); R(x + 1, y - 3 - s, 2, 6 + s * 2, CY); R(x + 4 + s, y - 2 - s, 2, 4 + s * 2, CY); R(x, y - 2, 4, 4, WH);
        break;
      case 'heat':
        for (i = 0; i < 3; i++) { R(x + 2 + i * 4, y - 3 - i, 1, 7 + i * 2, '#ffb347'); R(x + 3 + i * 4, y - 2 - i, 1, 5 + i * 2, '#ffd98a'); }
        break;
      case 'ring':
        for (i = 0; i < 3; i++) { R(x + 3 + i * 5, y - 4 - i * 3, 2, 3 + i * 2, WH); R(x + 3 + i * 5, y + 2 + i, 2, 3 + i * 2, WH); }
        break;
      case 'smoke':
        circ(x + 3, y, 2 + s, '#9a9a9a'); circ(x + 7 + s, y - 2, 1 + s, '#c8c8c8'); circ(x + 6 + s, y + 3, s, '#b0b0b0'); R(x, y - 1, 4, 3, OR); R(x, y - 1, 2, 2, YE);
        break;
      case 'goo':
        circ(x + 2, y, 1 + s, '#b6ff3c'); R(x + 5 + s, y - 3, 2, 2, '#b6ff3c'); R(x + 4 + s, y + 2, 2, 2, '#8ad82c'); R(x + 7 + s * 2, y, 2, 1, '#d8ff8a');
        break;
      case 'fizz':
        R(x, y - 1, 4 + s * 2, 3, WH); for (i = 0; i < 5; i++) R(x + 3 + ((i * 7 + s * 3) % 11), y - 5 + ((i * 5) % 10), 1 + (i % 2), 1 + (i % 2), i % 2 ? CY2 : WH);
        break;
      case 'star':
        cs = [RD, YE, BL, GR, PK];
        for (i = 0; i < 8; i++) { an = i * 0.785; R(x + 4 + Math.cos(an) * (3 + s * 2), y + Math.sin(an) * (3 + s * 2), 2, 2, cs[i % 5]); }
        R(x + 2, y - 2, 4, 4, WH);
        break;
      case 'bubble':
        for (i = 0; i < 4; i++) { R(x + 2 + i * 4, y - 4 + ((i * 5) % 8), 3, 3, '#bfeaff'); R(x + 2 + i * 4, y - 4 + ((i * 5) % 8), 1, 1, WH); }
        break;
      default:
        R(x, y - 1, 6 + s * 4, 3, '#ffd23c'); R(x + 1, y - 2 - s * 2, 3 + s, 5 + s * 4, '#ffb030'); R(x, y - 1 - s, 3 + s * 2, 3 + s * 2, '#fff6c8');
        R(x + 4 + s, y - 4 - s, 2, 2, YE); R(x + 4 + s, y + 2 + s, 2, 2, YE);
    }
  }

  /* ───────────── 공개 API ───────────── */
  var PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var mCache = {}, iCache = {}, gCache = {};
  function key(p) { return [p.receiver, p.barrel, p.mag, p.stock, p.sight, p.muzzle, p.ammo, p.acc1, p.acc2].join('|'); }

  // drawFn 을 그리지 않고 실행해 경계만 잰다
  function measure(drawFn) {
    var pc = C, pb = B, pt = T, res = null;
    C = null; B = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; T = 0;
    try { res = drawFn(); } catch (e) { res = null; }
    var b = B; C = pc; B = pb; T = pt;
    b.res = res; b.ok = b.x0 <= b.x1;
    return b;
  }

  function draw(ctx, parts, o) {
    if (!ctx) return;
    parts = parts || {}; o = o || ZERO;
    var pc = C, pb = B, pt = T, sc = o.scale || 1;
    ctx.save();
    try {
      ctx.translate(o.x || 0, o.y || 0); ctx.scale(sc, sc);
      if (o.recoil) ctx.translate(-o.recoil, 0);
      C = ctx; B = null; T = o.t || 0;
      var L = render(parts, o);
      if (o.flash > 0) flash(L.tipX, L.mzy, (L.muz && L.muz.f) || L.rec.f || 'std', o.flash);
    } catch (e) { /* 그리기 실패는 조용히 무시 */ }
    C = pc; B = pb; T = pt;
    ctx.restore();
  }

  function metrics(parts) {
    parts = parts || {};
    var k = key(parts), m = mCache[k];
    if (m) return m;
    var b = measure(function () { return render(parts, ZERO); });
    if (!b.ok || !b.res) m = { muzzleX: 20, muzzleY: -7, minX: -10, maxX: 20, minY: -12, maxY: 9 };
    else m = { muzzleX: b.res.tipX, muzzleY: b.res.mzy, minX: b.x0, maxX: b.x1, minY: b.y0, maxY: b.y1 };
    mCache[k] = m;
    return m;
  }

  // drawFn 결과를 w×h 캔버스에 맞춰 가운데 정렬해 data URL 로
  function fitURL(drawFn, w, h, pad, maxScale) {
    if (typeof document === 'undefined' || !document.createElement) return PLACEHOLDER;
    try {
      var b = measure(drawFn);
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      var ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return PLACEHOLDER;
      if (b.ok) {
        var bw = b.x1 - b.x0, bh = b.y1 - b.y0;
        var s = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
        if (s >= 1) s = Math.floor(s * 2) / 2;      // 1, 1.5, 2, 2.5 ...
        if (s > maxScale) s = maxScale;
        var pc = C, pb = B, pt = T;
        C = ctx; B = null; T = 0;
        SN = s; OX = Math.round((w - bw * s) / 2 - b.x0 * s); OY = Math.round((h - bh * s) / 2 - b.y0 * s);
        try { drawFn(); } catch (e) { /* ignore */ }
        SN = 0; OX = 0; OY = 0;
        C = pc; B = pb; T = pt;
      }
      return cv.toDataURL('image/png');
    } catch (e) { return PLACEHOLDER; }
  }

  function partFn(id) {
    if (REC[id] && id !== '_g') return function () { render({ receiver: id }, ZERO); };
    if (BAR[id]) return function () { BAR[id].d(0, 0, ZERO); };
    if (MUZ[id]) return function () { tube(-6, 0, 7, 3, G3, S2); MUZ[id].d(0, 0, ZERO); };
    if (MAG[id]) return function () { MAG[id](0, 0, ZERO, null); };
    if (STK[id]) return function () { STK[id](0, 0, ZERO); };
    if (SGT[id]) return function () { SGT[id](0, 0, ZERO); };
    if (AMMO[id]) return function () { AMMO[id].d(0, 0, ZERO); };
    if (ACC[id]) return function () { ACC[id].d(0, 0, ZERO); };
    var slot = null;
    try { if (typeof PARTS !== 'undefined' && PARTS[id]) slot = PARTS[id].slot; } catch (e) { slot = null; }
    return function () {
      if (slot === 'barrel') BAR_G.d(0, 0, ZERO);
      else if (slot === 'muzzle') MUZ_G.d(0, 0, ZERO);
      else if (slot === 'mag') MAG_G(0, 0, ZERO, null);
      else if (slot === 'stock') STK_G(0, 0, ZERO);
      else if (slot === 'sight') SGT_G(0, 0, ZERO);
      else if (slot === 'ammo') carts(0, 0, S3, BR2);
      else if (slot === 'acc') ACC_G.d(0, 0, ZERO);
      else render({ receiver: null }, ZERO);
    };
  }

  function iconURL(partId) {
    var u = iCache[partId];
    if (u) return u;
    u = fitURL(partFn(partId), 56, 32, 2, 3);
    if (u !== PLACEHOLDER) iCache[partId] = u;
    return u;
  }

  function gunURL(parts, w, h) {
    parts = parts || {}; w = w || 180; h = h || 80;
    var k = key(parts) + '@' + w + 'x' + h, u = gCache[k];
    if (u) return u;
    u = fitURL(function () { render(parts, ZERO); }, w, h, 4, 4);
    if (u !== PLACEHOLDER) gCache[k] = u;
    return u;
  }

  var root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  root.GunArt = { draw: draw, metrics: metrics, iconURL: iconURL, gunURL: gunURL,
    // 확장 파일(gunart_ext_*.js)이 새 파츠 그림을 등록할 수 있도록 내부 표와 그리기 도구를 노출한다
    _ext: {
      REC: REC, BAR: BAR, MUZ: MUZ, MAG: MAG, STK: STK, SGT: SGT, AMMO: AMMO, ACC: ACC,
      R: R, bx: bx, circ: circ, ln: ln, tube: tube, grip: grip, trig: trig, txt: txt, cart: cart, carts: carts,
      time: function () { return T; },
      clearCache: function () { mCache = {}; iCache = {}; gCache = {}; },
      pal: { K: K, S1: S1, S2: S2, S3: S3, G1: G1, G2: G2, G3: G3, RU1: RU1, RU2: RU2, RU3: RU3, W1: W1, W2: W2, W3: W3, OL1: OL1, OL2: OL2, OL3: OL3, BR1: BR1, BR2: BR2, BR3: BR3, FL1: FL1, FL2: FL2, FL3: FL3, BO1: BO1, BO2: BO2, BO3: BO3, PI1: PI1, PI2: PI2, PI3: PI3, PL1: PL1, PL2: PL2, PL3: PL3, TE1: TE1, TE2: TE2, TE3: TE3, CY: CY, CY2: CY2, TP1: TP1, TP2: TP2, WH: WH, RD: RD, RD2: RD2, YE: YE, GR: GR, BL: BL, PK: PK, OR: OR, PU: PU, BK: BK, CU: CU, CU2: CU2 },
    } };
})();
