// BUNKER 404 — 추가 탄약 36종 그림 (gunart.js 확장). 항목: { c: 탄창 띠 색, d(x, y) 아이콘 (좌상단 기준 약 24x14) }
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext; if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, ln = X.ln, txt = X.txt, cart = X.cart, carts = X.carts, P = X.pal, K = P.K;
  var A = X.AMMO, tm = X.time;

  // 산탄 셸 (좌상단, 6x12)
  function shell(sx, sy, hull, hi) {
    R(sx, sy, 6, 10, K); R(sx - 1, sy + 9, 8, 3, K);
    R(sx + 1, sy + 1, 4, 8, hull); R(sx + 1, sy + 1, 1, 8, hi); R(sx + 2, sy + 1, 3, 1, hi);
    R(sx, sy + 9, 6, 1, P.BR3); R(sx, sy + 10, 6, 1, P.BR2);
  }
  // 대구경탄 (좌상단, 약 9x15)
  function bigcart(bx0, by0, tip, cs, hi, lo) {
    R(bx0 + 2, by0, 3, 2, K); R(bx0 + 1, by0 + 1, 5, 4, K); R(bx0, by0 + 4, 7, 9, K); R(bx0 - 1, by0 + 12, 9, 3, K);
    R(bx0 + 3, by0 + 1, 1, 1, tip); R(bx0 + 2, by0 + 2, 3, 3, tip);
    R(bx0 + 1, by0 + 5, 5, 7, cs); R(bx0 + 1, by0 + 5, 1, 7, hi);
    R(bx0, by0 + 12, 7, 2, lo);
  }
  function ball(cx, cy, r, c, hi) { circ(cx, cy, r, K); circ(cx, cy, r - 1, c); R(cx - r + 2, cy - r + 2, 2, 1, hi || P.WH); }

  /* ───────────── 무료 ───────────── */
  A.ammo_bearing = { c: '#c8d2e0', d: function (x, y) {
    var p = [[5, 9, 4], [14, 5, 4], [21, 10, 3]];
    for (var i = 0; i < p.length; i++) { var cx = x + p[i][0], cy = y + p[i][1], r = p[i][2]; ball(cx, cy, r, P.S3); R(cx + 1, cy + 1, 1, 1, P.S2); }
  } };
  A.ammo_screw = { c: '#a8552c', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var nx = x + 2 + i * 8, ny = y + (i === 1 ? 0 : 1), j;
      R(nx - 2, ny, 7, 3, K); R(nx - 1, ny, 5, 2, P.RU3); R(nx + 1, ny, 1, 1, K);        // 머리 + 일자 홈
      R(nx, ny + 2, 3, 10, K); R(nx + 1, ny + 2, 1, 9, P.RU2);
      for (j = 0; j < 4; j++) R(nx, ny + 4 + j * 2, 3, 1, P.RU1);                         // 나사산
      R(nx + 1, ny + 12, 1, 1, K);
    }
  } };
  A.ammo_rice = { c: '#f0ead0', d: function (x, y) {
    bx(x + 1, y + 4, 12, 10, '#c9a86a', '#e0c890', '#8a6a3a'); R(x + 4, y + 2, 6, 3, K); R(x + 5, y + 3, 4, 1, '#e0c890'); R(x + 3, y + 6, 8, 1, '#8a6a3a');   // 자루
    var g = [[16, 9], [20, 11], [17, 12], [21, 7], [23, 12], [15, 5], [19, 3]];
    for (var i = 0; i < g.length; i++) { R(x + g[i][0] - 1, y + g[i][1] - 1, 4, 3, K); R(x + g[i][0], y + g[i][1], 2, 1, P.WH); }
  } };
  A.ammo_bean = { c: '#4a4a70', d: function (x, y) {
    var p = [[4, 9], [10, 4], [12, 11], [18, 6], [21, 12]];
    for (var i = 0; i < p.length; i++) { var cx = x + p[i][0], cy = y + p[i][1]; circ(cx, cy, 3, K); circ(cx, cy, 2, '#34344e'); R(cx - 1, cy - 2, 2, 1, '#7a7aa8'); R(cx + 1, cy, 1, 2, P.WH); }
  } };
  A.ammo_marble = { c: '#4fc0e8', d: function (x, y) {
    var cs = ['#6fc8e8', '#8fe36a', '#f0b040'], sw = [P.WH, P.PK, P.RD];
    for (var i = 0; i < 3; i++) { var cx = x + 4 + i * 8, cy = y + (i === 1 ? 4 : 9); ball(cx, cy, 4, cs[i]); R(cx - 1, cy, 3, 1, sw[i]); R(cx, cy + 1, 2, 1, sw[i]); }
  } };
  A.ammo_tooth = { c: '#e8dcc0', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var tx = x + 1 + i * 8, ty = y + (i === 1 ? 0 : 2);
      R(tx, ty, 7, 7, K); R(tx + 1, ty + 1, 5, 5, P.BO3); R(tx + 1, ty + 1, 5, 1, P.WH);                                       // 치관
      R(tx, ty + 6, 3, 6, K); R(tx + 4, ty + 6, 3, 6, K); R(tx + 1, ty + 6, 1, 5, P.BO2); R(tx + 5, ty + 6, 1, 5, P.BO2);     // 뿌리
      if (i !== 1) R(tx + 3, ty + 2, 2, 2, '#5a3a1a');                                                                         // 충치
    }
  } };
  A.ammo_pingpong = { c: '#ff9a2c', d: function (x, y) {
    circ(x + 7, y + 6, 6, K); circ(x + 7, y + 6, 5, P.RD); R(x + 4, y + 3, 3, 1, '#ff8a80');     // 라켓
    R(x + 5, y + 11, 5, 4, K); R(x + 6, y + 11, 3, 3, P.W3);                                    // 손잡이
    ball(x + 18, y + 4, 3, P.WH, '#ffffff'); ball(x + 21, y + 11, 3, P.OR, '#ffd0a0');
  } };
  A.ammo_bb = { c: '#ffffff', d: function (x, y) {
    bx(x + 1, y + 3, 11, 11, '#bfe0ea', '#e8f8ff', '#8ab8c8'); bx(x + 4, y, 5, 4, P.OR, '#ffc080');   // 병
    var i, p = [[3, 6], [6, 8], [9, 6], [4, 10], [8, 11], [6, 5]];
    for (i = 0; i < p.length; i++) R(x + p[i][0], y + p[i][1], 2, 2, P.WH);
    var q = [[16, 11], [20, 9], [19, 13], [23, 12], [17, 6]];
    for (i = 0; i < q.length; i++) { R(x + q[i][0] - 1, y + q[i][1] - 1, 4, 4, K); R(x + q[i][0], y + q[i][1], 2, 2, P.WH); }
  } };
  A.ammo_golf = { c: '#b8e0a0', d: function (x, y) {
    var d = '#b8c0c8';
    circ(x + 7, y + 5, 5, K); circ(x + 7, y + 5, 4, P.WH);
    R(x + 5, y + 4, 1, 1, d); R(x + 8, y + 3, 1, 1, d); R(x + 7, y + 6, 1, 1, d); R(x + 9, y + 6, 1, 1, d); R(x + 5, y + 7, 1, 1, d);
    R(x + 4, y + 10, 7, 2, K); R(x + 5, y + 10, 5, 1, P.RD); R(x + 6, y + 11, 3, 4, K); R(x + 7, y + 11, 1, 3, P.RD);   // 티
    circ(x + 19, y + 10, 4, K); circ(x + 19, y + 10, 3, P.WH); R(x + 18, y + 9, 1, 1, d); R(x + 20, y + 11, 1, 1, d); R(x + 20, y + 8, 1, 1, d);
  } };
  A.ammo_shuttle = { c: '#d8e4f4', d: function (x, y) {
    for (var i = 0; i < 2; i++) {
      var sx = x + 1 + i * 12, sy = y + (i ? 2 : 0), j, o;
      for (j = 0; j < 8; j++) { o = (j / 2) | 0; R(sx + o, sy + j, 11 - o * 2, 1, K); }
      for (j = 1; j < 8; j++) { o = (j / 2) | 0; R(sx + o + 1, sy + j, 9 - o * 2, 1, P.WH); }
      R(sx + 3, sy + 1, 1, 5, '#b8c0cc'); R(sx + 7, sy + 1, 1, 5, '#b8c0cc'); R(sx + 5, sy + 1, 1, 7, '#b8c0cc');   // 깃털 결
      R(sx + 3, sy + 4, 5, 1, P.BL);                                                                             // 띠
      circ(sx + 5, sy + 10, 3, K); circ(sx + 5, sy + 10, 2, '#e8d8b0'); R(sx + 3, sy + 8, 5, 1, P.RD);            // 코르크
    }
  } };

  /* ───────────── 저가 ───────────── */
  A.ammo_buck = { c: '#d8423a', d: function (x, y) { for (var i = 0; i < 3; i++) shell(x + 1 + i * 8, y + (i === 1 ? 0 : 2), P.RD, '#ff8a80'); } };
  A.ammo_birdshot = { c: '#5fbf4a', d: function (x, y) {
    shell(x + 1, y + 2, P.GR, '#a8e89a'); shell(x + 9, y, P.GR, '#a8e89a');
    var q = [[18, 2], [21, 5], [18, 7], [22, 10], [19, 12], [16, 11]];
    for (var i = 0; i < q.length; i++) R(x + q[i][0], y + q[i][1], 2, 2, i % 2 ? P.S3 : P.WH);
  } };
  function garlic(gx, gy) {
    R(gx + 3, gy, 3, 3, K); R(gx + 4, gy, 1, 3, '#d8d0b8');
    circ(gx + 4, gy + 7, 5, K); circ(gx + 4, gy + 7, 4, P.WH);
    R(gx + 4, gy + 4, 1, 7, '#c8b0d8'); R(gx + 2, gy + 5, 1, 5, '#dccbe6'); R(gx + 6, gy + 5, 1, 5, '#dccbe6');
    R(gx + 3, gy + 12, 3, 1, '#8a6a3a');
  }
  A.ammo_garlic = { c: '#e8d8f0', d: function (x, y) { garlic(x + 1, y); garlic(x + 13, y + 1); } };
  A.ammo_waterballoon = { c: '#4aa8ff', d: function (x, y) {
    var cs = [P.BL, P.PK, P.GR], hs = ['#9fd0ff', '#ffb0d8', '#a8e89a'];
    for (var i = 0; i < 3; i++) { var cx = x + 4 + i * 8, cy = y + (i === 1 ? 4 : 8); ball(cx, cy, 4, cs[i], hs[i]); R(cx - 1, cy + 4, 3, 2, K); R(cx, cy + 4, 1, 1, cs[i]); }
    R(x + 12, y + 12, 1, 2, '#9fd8ff'); R(x, y + 1, 1, 2, '#9fd8ff'); R(x + 23, y + 1, 1, 2, '#9fd8ff');
  } };
  A.ammo_coin = { c: '#c87a3a', d: function (x, y) {
    circ(x + 19, y + 9, 5, K); circ(x + 19, y + 9, 4, P.S3); R(x + 17, y + 6, 2, 1, P.WH); R(x + 18, y + 9, 3, 2, P.S2);   // 뒤의 은전
    circ(x + 8, y + 7, 7, K); circ(x + 8, y + 7, 6, P.CU); circ(x + 8, y + 7, 5, P.CU2); circ(x + 8, y + 7, 4, P.CU);
    txt('10', x + 5, y + 5, '#4a2a10');
    if (((tm() * 3) | 0) % 2) { R(x + 13, y, 1, 3, P.WH); R(x + 12, y + 1, 3, 1, P.WH); }
  } };
  A.ammo_confetti = { c: '#ff5fc8', d: function (x, y) {
    bx(x + 1, y + 7, 10, 7, P.YE, '#fff3a8', '#c49a2c'); R(x + 4, y + 8, 2, 5, P.RD); R(x + 8, y + 8, 2, 5, P.BL);   // 폭죽 통
    R(x + 5, y + 14, 1, 2, P.S3);                                                                                 // 당기는 끈
    var cs = [P.PK, P.GR, P.BL, P.YE, P.RD, P.PU, P.OR, P.WH];
    var p = [[12, 5], [14, 2], [16, 6], [18, 1], [19, 4], [21, 8], [22, 3], [15, 9], [20, 11], [23, 6], [13, 0], [17, 12]];
    for (var i = 0; i < p.length; i++) R(x + p[i][0], y + p[i][1], i % 3 ? 2 : 1, i % 3 ? 1 : 2, cs[i % cs.length]);
  } };
  A.ammo_flechette = { c: '#7fa8d8', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var fx = x + 3 + i * 8, fy = y + (i === 1 ? 0 : 2);
      R(fx - 1, fy + 1, 3, 9, K); R(fx, fy, 1, 10, P.S3); R(fx, fy, 1, 3, P.WH);                                              // 침
      R(fx - 3, fy + 8, 7, 5, K); R(fx - 2, fy + 9, 2, 3, '#7fa8d8'); R(fx + 1, fy + 9, 2, 3, '#7fa8d8'); R(fx, fy + 8, 1, 5, P.S3);   // 날개
    }
  } };
  A.ammo_frag = { c: '#9ab05a', d: function (x, y) {
    carts(x, y, P.OL3, P.OL2, function (cx, cy, i) {
      R(cx + 2, cy + 1, 1, 4, K); R(cx + 1, cy + 3, 3, 1, K);                                              // 파인애플 홈
      if (i === 1) { R(cx - 2, cy - 2, 2, 2, P.OR); R(cx + 5, cy - 3, 2, 2, P.YE); R(cx + 2, cy - 4, 1, 2, P.OR); }
    });
  } };
  A.ammo_pesticide = { c: '#8fe36a', d: function (x, y) {
    bx(x + 2, y + 3, 11, 11, '#e8e8d8', P.WH, '#b8b8a0'); bx(x + 5, y, 5, 4, P.GR, '#a8e89a');                       // 약통 + 뚜껑
    R(x + 4, y + 6, 7, 6, P.YE); R(x + 6, y + 7, 3, 3, K); R(x + 6, y + 8, 1, 1, P.YE); R(x + 8, y + 8, 1, 1, P.YE); R(x + 7, y + 10, 1, 1, K);   // 해골 경고 딱지
    cart(x + 17, y + 2, '#8fe36a', P.OL2); R(x + 15, y, 1, 2, '#8fe36a'); R(x + 23, y + 4, 1, 2, '#8fe36a');
  } };
  A.ammo_scythe = { c: '#c9b05a', d: function (x, y) {
    R(x + 3, y + 6, 4, 9, K); R(x + 4, y + 7, 2, 7, P.W2); R(x + 4, y + 7, 1, 7, P.W3);                                                    // 자루
    R(x + 3, y + 3, 6, 4, K); R(x + 7, y + 1, 9, 4, K); R(x + 14, y + 2, 6, 4, K); R(x + 18, y + 4, 4, 5, K); R(x + 20, y + 7, 3, 5, K);  // 날 외곽
    R(x + 4, y + 4, 4, 2, P.S3); R(x + 8, y + 2, 7, 2, P.S3); R(x + 15, y + 3, 4, 2, P.S3); R(x + 19, y + 5, 2, 3, P.S3); R(x + 21, y + 8, 1, 3, P.S3);
    R(x + 8, y + 2, 7, 1, P.WH); R(x + 15, y + 3, 4, 1, P.WH);
  } };
  A.ammo_domino = { c: '#e0e0e8', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var dx = x + 1 + i * 8, dy = y + i;
      bx(dx, dy, 7, 12, P.WH, '#ffffff', '#c8c8c0'); R(dx + 1, dy + 5, 5, 1, K);
      R(dx + 3, dy + 2, 1, 1, K);
      if (i === 0) R(dx + 3, dy + 8, 1, 1, K);
      if (i >= 1) { R(dx + 2, dy + 7, 1, 1, K); R(dx + 4, dy + 9, 1, 1, K); }
      if (i === 1) R(dx + 3, dy + 8, 1, 1, K);
      if (i === 2) { R(dx + 4, dy + 7, 1, 1, K); R(dx + 2, dy + 9, 1, 1, K); }
    }
  } };

  /* ───────────── 표준 ───────────── */
  A.ammo_tracer = { c: '#5aff8a', d: function (x, y) {
    carts(x, y, '#5aff8a', P.BR2, function (cx, cy, i) {
      R(cx + 1, cy + 1, 3, 1, '#c8ffd8'); R(cx + 2, cy + 2, 1, 2, '#c8ffd8');
      R(cx + 6, cy + 1, 1, 3, '#5aff8a'); if (i === 1) R(cx - 2, cy + 2, 1, 2, '#5aff8a');     // 빛 번짐
    });
  } };
  A.ammo_subsonic = { c: '#4a5a8a', d: function (x, y) {
    carts(x, y, '#3a4a6a', P.G3, function (cx, cy) { R(cx + 1, cy + 1, 3, 1, '#7a8ab0'); R(cx + 1, cy + 7, 3, 1, '#4a5a8a'); });
    txt('Z', x + 25, y + 1, '#9fb4d9'); R(x + 25, y + 8, 2, 1, '#9fb4d9'); R(x + 26, y + 9, 1, 1, '#9fb4d9'); R(x + 25, y + 10, 2, 1, '#9fb4d9');   // 쉿
  } };
  A.ammo_match = { c: '#3f8fe0', d: function (x, y) {
    cart(x + 1, y + 2, P.WH, P.BR2); cart(x + 8, y, P.WH, P.BR2); R(x + 2, y + 9, 3, 1, P.BL); R(x + 9, y + 7, 3, 1, P.BL);
    circ(x + 19, y + 7, 5, K); circ(x + 19, y + 7, 4, P.WH); circ(x + 19, y + 7, 3, P.RD); circ(x + 19, y + 7, 2, P.WH); circ(x + 19, y + 7, 1, P.RD);   // 과녁
  } };
  A.ammo_billiard = { c: '#2f9a62', d: function (x, y) {
    ln(x, y + 13, x + 10, y + 8, K, 3); ln(x + 1, y + 14, x + 10, y + 9, P.W3, 1);     // 큐대
    var cs = [P.WH, P.YE, P.RD], ys = [4, 9, 4], xs = [5, 13, 20];
    for (var i = 0; i < 3; i++) ball(x + xs[i], y + ys[i], 4, cs[i], i ? P.WH : '#ffffff');
  } };
  A.ammo_tuning = { c: '#f3d566', d: function (x, y) {
    R(x + 4, y, 3, 9, K); R(x + 10, y, 3, 9, K); R(x + 4, y + 7, 9, 3, K); R(x + 7, y + 9, 3, 6, K);              // 외곽
    R(x + 5, y + 1, 1, 7, P.S3); R(x + 11, y + 1, 1, 7, P.S3); R(x + 5, y + 8, 7, 1, P.S3); R(x + 8, y + 9, 1, 5, P.S3);
    var k = ((tm() * 6) | 0) % 2;
    R(x + 15 + k, y + 2, 1, 5, P.BR3); R(x + 18 + k, y + 1, 1, 7, P.BR2); R(x + 21 + k, y, 1, 9, P.BR1);         // 울림
    R(x + 2 - k, y + 2, 1, 5, P.BR3);
  } };
  A.ammo_laststeal = { c: '#a070ff', d: function (x, y) {
    carts(x, y, '#e8d8b0', P.WH, function (cx, cy) {
      R(cx + 1, cy + 2, 3, 2, K); R(cx + 1, cy + 2, 1, 1, P.WH); R(cx + 3, cy + 2, 1, 1, P.WH);     // 복면
      R(cx + 1, cy + 6, 3, 1, K); R(cx + 1, cy + 8, 3, 1, K);                                     // 줄무늬 옷
    });
  } };
  A.ammo_magnet = { c: '#ff5a5a', d: function (x, y) {
    R(x + 1, y + 1, 5, 12, K); R(x + 9, y + 1, 5, 12, K); R(x + 1, y + 8, 13, 6, K);                     // U자 외곽
    R(x + 2, y + 5, 3, 7, P.RD); R(x + 10, y + 5, 3, 7, P.RD); R(x + 2, y + 9, 11, 4, P.RD);
    R(x + 2, y + 2, 3, 3, P.S3); R(x + 10, y + 2, 3, 3, P.S3); R(x + 2, y + 5, 1, 7, '#ff8a80');         // 은색 극 + 하이라이트
    cart(x + 18, y + 2, P.CY, P.TE3);
    var k = ((tm() * 5) | 0) % 2;
    R(x + 15, y + 1 + k, 2, 1, P.CY); R(x + 15, y + 4 - k, 2, 1, P.CY2);
  } };

  /* ───────────── 고급 ───────────── */
  A.ammo_grudge = { c: '#b03048', d: function (x, y) {
    bx(x + 1, y + 1, 12, 13, P.PL2, P.PL3, P.PL1); bx(x + 4, y, 6, 3, P.S2, P.S3);                      // 결재판
    R(x + 3, y + 5, 8, 1, P.S1); R(x + 3, y + 7, 5, 1, P.S1); R(x + 3, y + 9, 4, 1, P.S1);
    R(x + 8, y + 8, 4, 4, P.RD); R(x + 9, y + 9, 2, 2, '#ff8a80');                                     // 빨간 도장
    cart(x + 17, y + 1, P.RD, P.G3); R(x + 18, y + 8, 3, 1, P.RD);
  } };
  A.ammo_am = { c: '#6a7a3a', d: function (x, y) {
    for (var i = 0; i < 2; i++) { var cx = x + 2 + i * 11, cy = y + (i ? 0 : 1); bigcart(cx, cy, P.BK, P.BR2, P.BR3, P.BR1); R(cx + 2, cy + 3, 3, 1, P.YE); R(cx + 1, cy + 8, 5, 1, K); }
  } };
  A.ammo_sabot = { c: '#e0a050', d: function (x, y) {
    R(x + 10, y + 1, 3, 7, K); R(x + 11, y, 1, 8, P.WH);                                                                                        // 관통자
    R(x + 8, y + 7, 7, 6, K); R(x + 7, y + 12, 9, 3, K); R(x + 9, y + 8, 5, 4, P.BR2); R(x + 9, y + 8, 1, 4, P.BR3); R(x + 8, y + 12, 7, 2, P.BR1);   // 탄피
    ln(x + 5, y + 2, x + 2, y + 7, K, 3); ln(x + 6, y + 3, x + 3, y + 8, P.OR, 1);                                                               // 벗겨지는 껍질
    ln(x + 15, y + 2, x + 18, y + 7, K, 3); ln(x + 16, y + 3, x + 19, y + 8, P.OR, 1);
    R(x, y + 11, 2, 1, P.S2); R(x + 21, y + 11, 2, 1, P.S2);
  } };
  A.ammo_cleaver = { c: '#c83a3a', d: function (x, y) {
    bx(x + 7, y + 1, 16, 10, P.S3, P.WH, P.S2); R(x + 20, y + 3, 2, 2, K);                                 // 칼날 + 구멍
    bx(x, y + 3, 8, 5, P.W2, P.W3, P.W1); R(x + 2, y + 5, 1, 1, P.BR3); R(x + 5, y + 5, 1, 1, P.BR3);      // 손잡이 + 리벳
    R(x + 11, y + 11, 2, 2, P.RD); R(x + 16, y + 11, 1, 3, P.RD);                                         // 핏방울
  } };

  /* ───────────── 특수 ───────────── */
  A.ammo_slug = { c: '#5a7ab0', d: function (x, y) {
    for (var i = 0; i < 2; i++) { var cx = x + 2 + i * 11, cy = y + (i ? 1 : 0); bigcart(cx, cy, P.S2, P.TE3, '#6a7a9a', P.TE2); R(cx + 2, cy + 2, 1, 2, P.WH); R(cx + 1, cy + 9, 5, 1, P.CY); }
  } };
  A.ammo_audit = { c: '#7fb8a0', d: function (x, y) {
    bx(x + 1, y, 11, 15, P.WH, '#ffffff', '#c8c8c0');                                                     // 고지서
    for (var j = 0; j < 4; j++) R(x + 3, y + 3 + j * 2, j % 2 ? 5 : 7, 1, P.S2);
    R(x + 3, y + 11, 7, 2, P.RD);                                                                         // 추징 도장
    circ(x + 18, y + 6, 4, K); circ(x + 18, y + 6, 3, '#bfe8ff'); R(x + 16, y + 4, 2, 1, P.WH);            // 돋보기
    ln(x + 21, y + 9, x + 23, y + 13, K, 2);
  } };
  A.ammo_onechamber = { c: '#fff3a8', d: function (x, y) {
    bigcart(x + 8, y, '#fff3a8', '#e8b923', '#fff3a8', '#a87a0c');
    var k = ((tm() * 3) | 0) % 2;
    R(x + 3, y + 3 + k, 1, 3, P.WH); R(x + 2, y + 4 + k, 3, 1, P.WH); R(x + 20, y + 7 - k, 1, 3, P.WH); R(x + 19, y + 8 - k, 3, 1, P.WH);
  } };
  A.ammo_antimatter = { c: '#d070ff', d: function (x, y) {
    bx(x + 4, y + 1, 16, 13, P.TE2, P.TE3, P.TE1); bx(x + 2, y + 3, 4, 9, P.S2, P.S3); bx(x + 18, y + 3, 4, 9, P.S2, P.S3);   // 격납 캡슐
    R(x + 8, y + 4, 8, 7, K); R(x + 9, y + 5, 6, 5, '#2a0a3a');
    var k = ((tm() * 5) | 0) % 3;
    circ(x + 12, y + 7, k === 1 ? 2 : 1, '#d070ff'); R(x + 12, y + 7, 1, 1, P.WH);
    R(x + 6, y + 12, 2, 1, P.YE); R(x + 10, y + 12, 2, 1, P.YE); R(x + 14, y + 12, 2, 1, P.YE);
  } };

  X.clearCache();
})();
