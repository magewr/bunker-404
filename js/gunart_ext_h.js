// BUNKER 404 — 총기 그림 확장 H (2차): 총열 10 · 총구 10 · 탄창 10 · 개머리판 10 · 조준기 10 · 부착물 20 (data_parts_h.js 와 짝)
// 총열: { len, th, d(x, y) } (x,y) = 장착점(총강 중심), +x 로 len / 총구: { len, f, d(x, y) } (x,y) = 총열 끝
// 탄창: fn(x, y, o, ac) (x,y) = 위쪽 중앙 / 개머리판: fn(x, y) (x,y) = 장착점, -x 로 뻗음
// 조준기: fn(x, y) (x,y) = 아래 중앙 / 부착물: { w, h, s, d(x, y) } (x,y) = 좌상단, s 1 = 매달림, 2 = 스티커
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext;
  if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, ln = X.ln, tube = X.tube, P = X.pal, K = P.K;
  var BAR = X.BAR, MUZ = X.MUZ, MAG = X.MAG, STK = X.STK, SGT = X.SGT, ACC = X.ACC;
  function T() { return X.time() || 0; }
  // 위로 볼록한 반원 (cx, 바닥 y, 반지름 r)
  function dome(cx, y, r, c) { var dy, hw; for (dy = 0; dy <= r; dy++) { hw = Math.floor(Math.sqrt((r + 0.5) * (r + 0.5) - dy * dy)); R(cx - hw, y - dy, hw * 2 + 1, 1, c); } }

  /* ═════════════ 총열 ═════════════ */
  BAR.barrel_chimney = { len: 26, th: 6, d: function (x, y) {            // 난로 연통
    var i; tube(x, y, 26, 6, '#9aa2a8', '#cfd6da', '#6a7278');
    for (i = 4; i < 24; i += 5) R(x + i, y - 3, 1, 6, '#6a7278');
    R(x + 19, y - 3, 6, 2, '#2a2a2a'); R(x + 22, y - 1, 3, 1, '#2a2a2a'); R(x + 25, y - 2, 1, 5, '#000000');
  } };
  BAR.barrel_ballpen = { len: 24, th: 6, d: function (x, y) {            // 볼펜심 다발
    var i, cs = [P.BL, P.RD, P.BK];
    R(x, y - 4, 24, 8, K);
    for (i = 0; i < 3; i++) { R(x + 1, y - 3 + i * 2, 20, 2, i % 2 ? '#e2e2d8' : '#f6f6ee'); R(x + 21, y - 3 + i * 2, 2, 2, cs[i]); R(x + 2, y - 3 + i * 2, 3, 1, cs[(i + 1) % 3]); }
    bx(x + 8, y - 5, 4, 10, '#c8a05a', '#e8c88a');
  } };
  BAR.barrel_xylophone = { len: 30, th: 4, d: function (x, y) {          // 실로폰 건반
    var i, cs = [P.RD, P.OR, P.YE, P.GR, P.BL, P.PU];
    tube(x, y, 30, 2, P.W2, P.W3, P.W1);
    for (i = 0; i < 6; i++) { R(x + 2 + i * 4, y - 6 + (i >> 1), 4, 12 - i, K); R(x + 3 + i * 4, y - 5 + (i >> 1), 2, 10 - i, cs[i]); R(x + 3 + i * 4, y - 1, 2, 1, '#ffffff'); }
    R(x + 29, y - 1, 1, 2, '#000000');
  } };
  BAR.barrel_pogo = { len: 30, th: 4, d: function (x, y) {               // 스카이콩콩
    var i; tube(x, y, 30, 3, P.RD, '#ff8a80', P.RD2);
    for (i = 0; i < 5; i++) { R(x + 14 + i * 3, y - 4, 2, 8, K); R(x + 14 + i * 3, y - 3, 1, 6, P.S3); }
    bx(x + 5, y - 6, 4, 12, P.BK, P.G3);
    R(x + 29, y - 1, 1, 2, '#000000');
  } };
  BAR.barrel_trombone = { len: 36, th: 4, d: function (x, y) {           // 트롬본 슬라이드
    tube(x, y, 36, 3, P.BR2, P.BR3, P.BR1);
    bx(x + 4, y + 3, 24, 3, P.BR2, P.BR3); bx(x + 4, y, 3, 5, P.BR2, P.BR3); bx(x + 25, y, 3, 5, P.BR2, P.BR3);
    bx(x + 30, y - 4, 6, 8, P.BR2, P.BR3, P.BR1); R(x + 35, y - 2, 1, 4, '#000000');
  } };
  BAR.barrel_irrigation = { len: 34, th: 5, d: function (x, y) {         // 관개 파이프
    var i; tube(x, y, 34, 4, P.PI2, P.PI3, P.PI1);
    for (i = 6; i < 30; i += 8) { bx(x + i, y - 6, 3, 4, P.S2, P.S3); R(x + i + 1, y - 8, 1, 2, '#7fd8ff'); }
    bx(x + 15, y - 4, 3, 8, P.PI1, P.PI2);
    R(x + 33, y - 1, 1, 3, '#000000');
  } };
  BAR.barrel_ski = { len: 40, th: 3, d: function (x, y) {                // 스키 폴
    tube(x, y, 38, 2, '#e8e8f0', '#ffffff', '#9aa0b0');
    R(x + 4, y - 1, 8, 2, P.RD); R(x + 14, y - 1, 3, 2, P.BL);
    circ(x + 32, y, 3, K); circ(x + 32, y, 2, '#3a3a44'); R(x + 32, y, 1, 1, '#e8e8f0');
    R(x + 37, y - 1, 3, 2, K); R(x + 38, y, 2, 1, P.S3);
  } };
  BAR.barrel_rebar = { len: 34, th: 8, d: function (x, y) {              // 철근 다발
    var i, j; R(x, y - 5, 34, 10, K);
    for (j = 0; j < 4; j++) { R(x + 1, y - 4 + j * 2, 32, 2, j % 2 ? P.RU2 : P.RU1); for (i = 3; i < 31; i += 4) R(x + i + (j % 2) * 2, y - 4 + j * 2, 1, 1, P.RU3); }
    bx(x + 7, y - 6, 3, 12, P.S2, P.S3); bx(x + 22, y - 6, 3, 12, P.S2, P.S3);
    R(x + 33, y - 3, 1, 2, '#000000'); R(x + 33, y + 1, 1, 2, '#000000');
  } };
  BAR.barrel_intestine = { len: 28, th: 6, d: function (x, y) {          // 창자 총열 (꿈틀)
    var i, yy, w = Math.sin(T() * 4) > 0 ? 1 : 0;
    for (i = 0; i < 7; i++) { yy = y + ((i % 2) ? 1 : -1) + (i % 3 === 0 ? w : 0); R(x + i * 4, yy - 3, 5, 7, K); R(x + i * 4 + 1, yy - 2, 3, 5, i % 2 ? P.FL2 : P.FL3); R(x + i * 4 + 1, yy - 2, 3, 1, P.FL3); R(x + i * 4 + 1, yy + 2, 3, 1, P.FL1); }
    R(x + 27, y - 1, 1, 3, '#3a0f20');
  } };
  BAR.barrel_horizon = { len: 34, th: 7, d: function (x, y) {            // 사건의 지평선 포신
    var i, k = ((T() * 4) | 0) % 3;
    tube(x, y, 26, 6, P.TE2, P.TE3, P.TE1);
    for (i = 0; i < 3; i++) R(x + 4 + i * 7, y - 4, 2, 8, i === k ? P.CY2 : P.CY);
    circ(x + 29, y, 5, K); circ(x + 29, y, 4, P.OR); circ(x + 29, y, 3, '#000000');
    R(x + 23, y, 12, 1, '#ffd23c'); R(x + 27, y - 1, 4, 1, '#000000');
  } };

  /* ═════════════ 총구 ═════════════ */
  MUZ.muz_popgun = { len: 6, f: 'smoke', d: function (x, y) {            // 코르크 마개 + 끈
    bx(x, y - 3, 6, 6, '#c9a05a', '#e8c88a', '#8a6a34'); R(x + 2, y - 1, 1, 1, '#8a6a34'); R(x + 4, y + 1, 1, 1, '#8a6a34');
    ln(x + 1, y + 3, x - 5, y + 6, '#e8e0c8', 1);
  } };
  MUZ.muz_holepunch = { len: 9, f: 'small', d: function (x, y) {         // 2공 펀치
    bx(x, y - 2, 9, 6, P.G2, P.G3, P.G1); bx(x, y - 6, 8, 4, P.S2, P.S3, P.S1);
    R(x + 2, y + 1, 2, 2, '#000000'); R(x + 6, y + 1, 2, 2, '#000000');
  } };
  MUZ.muz_harmonica = { len: 6, f: 'big', d: function (x, y) {           // 하모니카 (세로)
    var i; bx(x, y - 7, 6, 14, P.S2, P.S3, P.S1);
    for (i = 0; i < 5; i++) R(x + 4, y - 5 + i * 2, 2, 1, '#000000');
    R(x + 1, y - 6, 3, 1, P.RD); R(x + 1, y + 5, 3, 1, P.RD);
  } };
  MUZ.muz_cleats = { len: 8, f: 'small', d: function (x, y) {            // 축구화 스터드
    bx(x, y - 3, 8, 6, P.BK, P.G3); R(x + 2, y - 2, 4, 1, P.WH);
    R(x + 1, y + 3, 2, 3, K); R(x + 5, y + 3, 2, 3, K); R(x + 1, y + 3, 1, 2, P.S3); R(x + 5, y + 3, 1, 2, P.S3);
    R(x + 7, y - 1, 1, 2, '#000000');
  } };
  MUZ.muz_pinwheel = { len: 5, f: 'star', d: function (x, y) {           // 바람개비 (돈다)
    var a = ((T() * 8) | 0) % 2;
    R(x, y - 1, 5, 3, K); R(x, y, 4, 1, P.W3);
    if (a) { R(x + 2, y - 7, 3, 6, P.RD); R(x + 5, y - 1, 6, 3, P.YE); R(x + 2, y + 2, 3, 6, P.BL); R(x - 3, y - 1, 5, 3, P.GR); }
    else { R(x + 5, y - 6, 4, 4, P.RD); R(x + 5, y + 2, 4, 4, P.YE); R(x - 1, y + 2, 4, 4, P.BL); R(x - 1, y - 6, 4, 4, P.GR); }
    R(x + 3, y - 1, 2, 2, K);
  } };
  MUZ.muz_cymbal = { len: 4, f: 'ring', d: function (x, y) {             // 심벌즈
    R(x, y - 1, 2, 3, K); R(x + 1, y - 9, 3, 18, K); R(x + 2, y - 8, 1, 16, P.BR2); R(x + 2, y - 8, 1, 4, P.BR3); R(x + 2, y - 1, 2, 2, P.BR1);
  } };
  MUZ.muz_gasket = { len: 7, f: 'small', d: function (x, y) {            // 배관 플랜지
    bx(x, y - 3, 7, 6, P.PI2, P.PI3, P.PI1); bx(x + 2, y - 6, 3, 12, P.PI2, P.PI3, P.PI1);
    R(x + 3, y - 5, 1, 1, P.S3); R(x + 3, y + 4, 1, 1, P.S3); R(x + 6, y - 1, 1, 2, '#000000');
  } };
  MUZ.muz_beehive = { len: 10, f: 'goo', d: function (x, y) {            // 벌통 (벌이 맴돈다)
    var i, t = T();
    for (i = 0; i < 4; i++) bx(x + (i === 0 ? 2 : 1), y - 7 + i * 3, i === 0 ? 7 : 9, 4, i % 2 ? '#d9a520' : P.YE, '#ffe680');
    R(x + 4, y + 1, 3, 3, '#000000');
    R(x + 12 + Math.round(Math.sin(t * 9) * 2), y - 6 + Math.round(Math.cos(t * 7) * 2), 2, 1, K);
    R(x + 8 + Math.round(Math.cos(t * 8) * 3), y + 7 + Math.round(Math.sin(t * 6)), 2, 1, K);
  } };
  MUZ.muz_syringe = { len: 16, f: 'none', d: function (x, y) {           // 대바늘 주사기
    bx(x, y - 3, 9, 6, '#dff4ff', '#ffffff', '#9fc8e0'); R(x + 2, y - 1, 5, 2, '#8effa0');
    R(x + 3, y - 2, 1, 1, K); R(x + 5, y - 2, 1, 1, K);
    R(x + 9, y - 1, 2, 2, K); R(x + 11, y, 5, 1, P.S3);
  } };
  MUZ.muz_jakdu = { len: 12, f: 'small', d: function (x, y) {            // 작두
    bx(x, y + 1, 12, 4, P.W2, P.W3, P.W1);
    ln(x + 1, y - 1, x + 10, y - 9, K, 2); ln(x + 2, y - 1, x + 10, y - 8, P.S3, 1);
    bx(x + 9, y - 12, 5, 3, P.W1, P.W2);
  } };

  /* ═════════════ 탄창 ═════════════ */
  MAG.mag_can = function (x, y, o, ac) {                                 // 참치 캔
    bx(x - 5, y, 11, 6, P.S2, P.S3, P.S1); R(x - 4, y + 2, 9, 2, ac || P.BL); R(x - 1, y + 2, 3, 2, P.YE);
  };
  MAG.mag_pencilcase = function (x, y, o, ac) {                          // 철제 필통
    bx(x - 4, y, 9, 13, P.BL, '#7fb8f0', '#2a5f9c'); R(x - 3, y + 4, 7, 1, K);
    R(x - 2, y + 6, 1, 5, P.YE); R(x, y + 6, 1, 5, P.RD); R(x + 2, y + 6, 1, 5, ac || P.GR);
  };
  MAG.mag_waterbottle = function (x, y, o, ac) {                         // 스포츠 물통
    bx(x - 2, y, 4, 3, P.BK, P.G3); bx(x - 4, y + 2, 9, 13, P.GR, '#a8e89a', '#3a8a2e');
    R(x - 3, y + 7, 7, 2, P.WH); R(x - 3, y + 11, 7, 1, ac || '#3a8a2e');
  };
  MAG.mag_seedtray = function (x, y, o, ac) {                            // 모판
    var i, j; bx(x - 8, y, 17, 9, P.BK, P.G3, P.G1);
    for (i = 0; i < 5; i++) for (j = 0; j < 2; j++) { R(x - 7 + i * 3, y + 2 + j * 3, 2, 2, '#5a3a24'); R(x - 7 + i * 3, y + 1 + j * 3, 1, 1, ac || '#8fd86a'); }
  };
  MAG.mag_musicbox = function (x, y, o, ac) {                            // 오르골 (태엽이 돈다)
    var a = ((T() * 3) | 0) % 2;
    bx(x - 5, y, 11, 10, P.W2, P.W3, P.W1); bx(x - 3, y + 2, 7, 5, P.BR2, P.BR3, P.BR1);
    R(x - 2, y + 3, 1, 1, K); R(x, y + 5, 1, 1, K); R(x + 2, y + 4, 1, 1, K);
    R(x + 6, y + 4, 3, 1, K); R(x + 8, y + (a ? 2 : 4), 1, 3, K); R(x + 8, y + (a ? 1 : 6), 2, 2, P.BR3);
    if (ac) R(x - 4, y + 8, 9, 1, ac);
  };
  MAG.mag_manifold = function (x, y, o, ac) {                            // 배관 매니폴드
    var i; bx(x - 7, y + 3, 15, 5, P.PI2, P.PI3, P.PI1);
    for (i = 0; i < 3; i++) { bx(x - 6 + i * 5, y, 3, 4, P.PI2, P.PI3); bx(x - 6 + i * 5, y + 7, 3, 6, P.PI2, P.PI3); R(x - 5 + i * 5, y + 12, 1, 1, ac || P.RD); }
  };
  MAG.mag_icebox = function (x, y, o, ac) {                              // 아이스박스
    bx(x - 7, y + 2, 15, 11, P.BL, '#7fb8f0', '#2a5f9c'); bx(x - 7, y, 15, 4, P.WH, '#ffffff', '#c9c5b8');
    R(x - 3, y - 2, 7, 1, K); R(x - 3, y - 2, 1, 3, K); R(x + 3, y - 2, 1, 3, K);
    R(x - 5, y + 9, 11, 1, ac || '#bfe9ff');
  };
  MAG.mag_stomach = function (x, y, o, ac) {                             // 위장 (꿈틀)
    var p = Math.sin(T() * 5) > 0 ? 1 : 0;
    bx(x - 2, y, 4, 4, P.FL2, P.FL3); circ(x - 1, y + 9, 5 + p, K); circ(x - 1, y + 9, 4 + p, P.FL2); circ(x - 2, y + 8, 2, P.FL3);
    R(x + 3, y + 10, 4, 3, K); R(x + 3, y + 11, 3, 1, P.FL1); R(x - 3, y + 11, 4, 1, ac || '#b6ff3c');
  };
  MAG.mag_coffin = function (x, y, o, ac) {                              // 관짝
    bx(x - 3, y, 7, 4, '#3a2a1a', '#5a4026'); bx(x - 5, y + 3, 11, 12, '#3a2a1a', '#5a4026', '#241808');
    R(x, y + 5, 1, 7, ac || P.BR3); R(x - 2, y + 7, 5, 1, ac || P.BR3);
  };
  MAG.mag_printer = function (x, y, o, ac) {                             // 3D 프린터 (헤드가 움직인다)
    var hx = Math.round(Math.sin(T() * 4) * 3);
    bx(x - 7, y, 15, 14, P.TE2, P.TE3, P.TE1); R(x - 5, y + 2, 11, 9, '#0c1018');
    R(x - 5, y + 3, 11, 1, P.S3); R(x - 1 + hx, y + 3, 3, 3, P.OR); R(x + hx, y + 6, 1, 1, P.CY);
    R(x - 2, y + 9, 5, 2, ac || P.CY); R(x - 6, y + 12, 2, 1, P.GR);
  };

  /* ═════════════ 개머리판 ═════════════ */
  STK.stock_broom = function (x, y) {                                    // 싸리 빗자루
    var i; bx(x - 12, y - 2, 13, 4, P.W2, P.W3, P.W1);
    R(x - 22, y - 5, 11, 11, K); for (i = 0; i < 5; i++) R(x - 21, y - 4 + i * 2, 9 - (i % 2), 1, i % 2 ? '#a8862c' : '#d9b84a');
    R(x - 13, y - 4, 2, 9, P.RD2);
  };
  STK.stock_valve = function (x, y) {                                    // 대형 밸브 핸들
    bx(x - 8, y - 2, 9, 4, P.PI2, P.PI3, P.PI1);
    circ(x - 14, y, 7, K); circ(x - 14, y, 6, P.RD); circ(x - 14, y, 4, P.BK);
    R(x - 20, y - 1, 13, 2, P.RD); R(x - 15, y - 6, 2, 13, P.RD); circ(x - 14, y, 1, P.S3);
  };
  STK.stock_trike = function (x, y) {                                    // 세발자전거 핸들
    bx(x - 10, y - 2, 11, 4, P.RD, '#ff8a80', P.RD2);
    bx(x - 13, y - 8, 4, 16, P.S2, P.S3, P.S1); bx(x - 14, y - 10, 6, 4, P.BK, P.G3); bx(x - 14, y + 6, 6, 4, P.BK, P.G3);
    circ(x - 6, y - 5, 2, K); circ(x - 6, y - 5, 1, P.S3);
    R(x - 16, y - 9, 2, 1, P.PK); R(x - 17, y - 7, 2, 1, P.YE);
  };
  STK.stock_tennis = function (x, y) {                                   // 테니스 라켓
    var i; bx(x - 9, y - 2, 10, 4, P.BK, P.G3);
    circ(x - 16, y, 8, K); circ(x - 16, y, 7, '#d8e85a'); circ(x - 16, y, 5, '#f4f4e8');
    for (i = -4; i <= 4; i += 2) { R(x - 16 + i, y - 4, 1, 9, '#b8b8a8'); R(x - 20, y + i, 9, 1, '#b8b8a8'); }
  };
  STK.stock_binder = function (x, y) {                                   // 3공 바인더
    bx(x - 15, y - 6, 16, 12, '#2a5f9c', P.BL, '#1a3f6c'); R(x - 14, y - 4, 2, 8, P.WH);
    R(x - 3, y - 4, 1, 1, P.S3); R(x - 3, y, 1, 1, P.S3); R(x - 3, y + 3, 1, 1, P.S3);
    bx(x - 11, y - 3, 6, 4, P.WH, '#ffffff');
  };
  STK.stock_yoke = function (x, y) {                                     // 지게
    ln(x - 1, y - 1, x - 16, y - 9, K, 3); ln(x, y, x - 15, y - 8, P.W2, 1);
    ln(x - 1, y, x - 16, y + 8, K, 3); ln(x, y + 1, x - 15, y + 9, P.W2, 1);
    bx(x - 13, y - 3, 3, 7, P.W1, P.W2); bx(x - 19, y - 6, 6, 10, '#d9c9a0', '#efe2c0', '#a8956a');
    R(x - 18, y - 2, 4, 1, '#a8956a');
  };
  STK.stock_claw = function (x, y) {                                     // 집게발 (가끔 딱딱)
    var a = Math.sin(T() * 3) > 0.6 ? 1 : 0;
    bx(x - 8, y - 3, 9, 6, '#b03a2a', '#e06a50', '#7a2218');
    bx(x - 19, y - 7 - a, 12, 6, '#b03a2a', '#e06a50', '#7a2218'); bx(x - 19, y + 1 + a, 12, 5, '#b03a2a', '#e06a50', '#7a2218');
    R(x - 18, y - 2 - a, 9, 1, P.WH); R(x - 18, y + 1 + a, 9, 1, P.WH);
  };
  STK.stock_sawedoff = function (x, y) {                                 // 잘라 낸 자리 + 반창고
    bx(x - 5, y - 3, 6, 7, P.W2, P.W3, P.W1); R(x - 6, y - 3, 1, 2, P.W3); R(x - 7, y - 1, 2, 2, P.W3); R(x - 6, y + 1, 1, 2, P.W3);
    R(x - 3, y - 2, 2, 5, P.WH); R(x - 3, y, 2, 1, P.RD);
  };
  STK.stock_cello = function (x, y) {                                    // 첼로 울림통
    bx(x - 6, y - 2, 7, 4, P.BK, P.G3);
    circ(x - 12, y, 6, K); circ(x - 21, y, 7, K); R(x - 18, y - 5, 5, 10, K);
    circ(x - 12, y, 5, '#8a4a22'); circ(x - 21, y, 6, '#8a4a22'); R(x - 17, y - 4, 4, 8, '#8a4a22');
    R(x - 24, y - 4, 7, 1, '#c07a3a'); R(x - 14, y - 3, 4, 1, '#c07a3a');
    R(x - 22, y - 1, 1, 3, K); R(x - 19, y - 1, 1, 3, K); R(x - 27, y, 21, 1, '#e8e0c8');
  };
  STK.stock_exo = function (x, y) {                                      // 외골격 팔
    bx(x - 10, y - 3, 11, 6, P.TE2, P.TE3, P.TE1); circ(x - 12, y, 4, K); circ(x - 12, y, 3, P.S2); R(x - 13, y - 1, 2, 2, P.CY);
    ln(x - 13, y + 2, x - 21, y + 9, K, 4); ln(x - 12, y + 3, x - 19, y + 9, P.TE3, 2);
    bx(x - 24, y + 8, 7, 5, P.TE2, P.TE3); R(x - 22, y + 10, 3, 1, P.CY);
  };

  /* ═════════════ 조준기 ═════════════ */
  SGT.sight_gumring = function (x, y) {                                  // 반지 사탕
    bx(x - 3, y - 4, 6, 4, P.YE, '#fff3a8'); R(x - 1, y - 3, 2, 2, K);
    R(x - 3, y - 9, 6, 6, K); R(x - 2, y - 8, 4, 4, P.PK); R(x - 2, y - 8, 2, 1, '#ffd0e8'); R(x - 1, y - 10, 2, 1, K);
  };
  SGT.sight_protractor = function (x, y) {                               // 각도기
    dome(x, y - 1, 8, K); dome(x, y - 1, 7, '#dff4ff'); dome(x, y - 1, 3, '#9fd0e8');
    R(x, y - 8, 1, 7, P.RD); R(x - 5, y - 5, 1, 1, K); R(x + 5, y - 5, 1, 1, K); R(x - 7, y - 1, 15, 1, K);
  };
  SGT.sight_3dglasses = function (x, y) {                                // 3D 안경
    R(x - 1, y - 3, 2, 3, K);
    bx(x - 8, y - 9, 16, 7, P.WH, '#ffffff'); R(x - 7, y - 8, 6, 5, K); R(x + 1, y - 8, 6, 5, K);
    R(x - 6, y - 7, 4, 3, P.RD); R(x + 2, y - 7, 4, 3, P.BL);
  };
  SGT.sight_birdtape = function (x, y) {                                 // 새 쫓는 반짝이 줄
    var a = ((T() * 6) | 0) % 2;
    R(x - 1, y - 11, 3, 11, K); R(x, y - 10, 1, 10, P.W3);
    R(x + 1, y - 11, 9, 1, K); R(x + 2, y - 10, 2, 4, a ? '#ffffff' : P.S3); R(x + 5, y - 10, 2, 5, a ? P.S3 : '#ffffff'); R(x + 8, y - 10, 1, 3, a ? '#ffe680' : P.S2);
  };
  SGT.sight_antenna = function (x, y) {                                  // 더듬이 (떤다)
    var w = Math.round(Math.sin(T() * 7) * 1.5);
    bx(x - 3, y - 3, 6, 3, P.FL2, P.FL3);
    ln(x - 2, y - 3, x - 5 + w, y - 12, K, 2); ln(x + 1, y - 3, x + 4 + w, y - 12, K, 2);
    ln(x - 1, y - 3, x - 4 + w, y - 12, P.FL1, 1); ln(x + 1, y - 3, x + 4 + w, y - 12, P.FL1, 1);
    R(x - 6 + w, y - 15, 3, 3, K); R(x + 3 + w, y - 15, 3, 3, K); R(x - 5 + w, y - 14, 1, 1, P.FL3); R(x + 4 + w, y - 14, 1, 1, P.FL3);
  };
  SGT.sight_dartboard = function (x, y) {                                // 다트판
    R(x - 1, y - 3, 2, 3, K);
    circ(x, y - 9, 7, K); circ(x, y - 9, 6, P.BK); circ(x, y - 9, 4, P.WH); circ(x, y - 9, 2, P.GR); R(x, y - 9, 1, 1, P.RD);
    ln(x + 2, y - 11, x + 7, y - 15, P.YE, 1); R(x + 7, y - 16, 2, 2, P.RD);
  };
  SGT.sight_tuner = function (x, y) {                                    // 클립 조율기 (바늘이 흔들린다)
    var n = Math.round(Math.sin(T() * 3) * 2);
    bx(x - 2, y - 4, 4, 4, P.BK, P.G3);
    bx(x - 6, y - 12, 12, 9, P.TE2, P.TE3, P.TE1); R(x - 4, y - 10, 8, 5, '#0c2a18');
    R(x + n, y - 10, 1, 4, n === 0 ? P.GR : P.RD); R(x - 4, y - 6, 8, 1, '#3a6a3a');
  };
  SGT.sight_sightglass = function (x, y) {                               // 배관 점검창
    bx(x - 6, y - 5, 12, 5, P.PI2, P.PI3, P.PI1);
    circ(x, y - 9, 5, K); circ(x, y - 9, 4, P.PI3); circ(x, y - 9, 3, '#bfe9ff'); R(x - 2, y - 8, 5, 2, '#5fb8e0'); R(x - 1, y - 11, 2, 1, '#ffffff');
    R(x - 5, y - 9, 1, 1, P.S3); R(x + 5, y - 9, 1, 1, P.S3);
  };
  SGT.sight_cctv = function (x, y) {                                     // 돔형 CCTV (녹화등 깜빡)
    var a = ((T() * 2) | 0) % 2;
    bx(x - 6, y - 4, 12, 4, P.WH, '#ffffff', '#c9c5b8');
    dome(x, y - 4, 6, K); dome(x, y - 4, 5, '#2a2f3a');
    R(x - 1, y - 8, 3, 3, '#0c1018'); R(x, y - 7, 1, 1, a ? P.RD : '#5a1010');
  };
  SGT.sight_blueprint = function (x, y) {                                // 해부 도면
    R(x - 1, y - 3, 2, 3, K);
    bx(x - 7, y - 16, 14, 14, '#2a5f9c', P.BL, '#1a3f6c');
    R(x - 1, y - 14, 2, 2, P.YE); R(x - 2, y - 12, 4, 4, P.WH); R(x - 4, y - 11, 2, 1, P.WH); R(x + 2, y - 11, 2, 1, P.WH);
    R(x - 2, y - 8, 1, 3, P.WH); R(x + 1, y - 8, 1, 3, P.WH); R(x + 3, y - 15, 2, 1, P.RD);
  };

  /* ═════════════ 부착물 ═════════════ */
  ACC.acc_chalk = { w: 8, h: 9, d: function (x, y) {                     // 탄마 가루 주머니
    bx(x, y + 2, 8, 7, '#e8e4d8', '#ffffff', '#b8b4a8'); R(x + 1, y, 6, 3, K); R(x + 2, y + 1, 4, 1, '#ffffff');
    R(x + 6, y - 1, 2, 1, '#ffffff'); R(x + 8, y + 1, 1, 1, '#ffffff');
  } };
  ACC.acc_gloves = { w: 9, h: 10, d: function (x, y) {                   // 빨간 목장갑
    var i; bx(x + 1, y + 6, 7, 4, '#e8e4d8', '#ffffff'); bx(x, y + 2, 9, 6, P.RD, '#f0736a', P.RD2);
    for (i = 0; i < 4; i++) { R(x + i * 2, y - 1, 3, 4, K); R(x + i * 2 + 1, y, 1, 3, P.RD); }
  } };
  ACC.acc_balloon = { w: 9, h: 14, d: function (x, y) {                  // 헬륨 풍선 (살랑)
    var w = Math.round(Math.sin(T() * 2));
    circ(x + 4 + w, y + 4, 4, K); circ(x + 4 + w, y + 4, 3, P.RD); R(x + 2 + w, y + 2, 2, 2, '#ff9a90'); R(x + 3 + w, y + 8, 2, 2, K);
    ln(x + 4 + w, y + 10, x + 4, y + 13, '#e8e0c8', 1);
  } };
  ACC.acc_paperclip = { w: 6, h: 13, s: 1, d: function (x, y) {          // 클립 사슬 (매달림)
    var i; for (i = 0; i < 3; i++) { R(x + (i % 2), y + i * 4, 4, 5, K); R(x + 1 + (i % 2), y + 1 + i * 4, 2, 3, i === 1 ? P.S2 : P.S3); R(x + 2 + (i % 2), y + 2 + i * 4, 1, 1, K); }
  } };
  ACC.acc_pedometer = { w: 8, h: 8, d: function (x, y) {                 // 만보기
    bx(x, y, 8, 8, P.OR, '#ffb86a', '#b05a10'); R(x + 1, y + 2, 6, 3, '#c8e8c0'); R(x + 2, y + 3, 1, 1, K); R(x + 4, y + 3, 1, 1, K); R(x + 6, y + 3, 1, 1, K);
    R(x + 3, y + 6, 2, 1, K);
  } };
  ACC.acc_pepper = { w: 8, h: 13, s: 1, d: function (x, y) {             // 말린 고추 (매달림)
    var i; R(x + 3, y, 1, 3, '#a8956a');
    for (i = 0; i < 3; i++) { R(x + i * 2, y + 2 + i, 3, 8, K); R(x + i * 2 + 1, y + 3 + i, 1, 6, i === 1 ? P.RD2 : P.RD); R(x + i * 2 + 1, y + 2 + i, 1, 1, P.GR); }
  } };
  ACC.acc_slinky = { w: 12, h: 8, d: function (x, y) {                   // 무지개 용수철 (아치)
    var i, cs = [P.RD, P.OR, P.YE, P.GR, P.BL, P.PU], up;
    for (i = 0; i < 6; i++) { up = i < 3 ? 2 - i : i - 3; R(x + i * 2, y + up, 2, 8 - up, K); R(x + i * 2, y + up + 1, 1, 6 - up, cs[i]); }
    R(x + 4, y + 4, 4, 4, K);
  } };
  ACC.acc_ptrap = { w: 11, h: 10, d: function (x, y) {                   // U자 트랩
    bx(x, y, 4, 8, P.PI2, P.PI3, P.PI1); bx(x + 7, y + 2, 4, 6, P.PI2, P.PI3, P.PI1); bx(x, y + 6, 11, 4, P.PI2, P.PI3, P.PI1);
    R(x + 4, y + 8, 3, 1, P.S3); R(x + 1, y + 1, 2, 1, '#000000');
  } };
  ACC.acc_tambourine = { w: 11, h: 11, d: function (x, y) {              // 탬버린 (짤랑)
    var a = ((T() * 6) | 0) % 2;
    circ(x + 5, y + 5, 5, K); circ(x + 5, y + 5, 4, P.W3); circ(x + 5, y + 5, 3, '#f4eeda');
    R(x + a, y + 4, 2, 2, P.BR3); R(x + 9 - a, y + 4, 2, 2, P.BR3); R(x + 4, y + a, 2, 2, P.BR3); R(x + 4, y + 9 - a, 2, 2, P.BR3);
  } };
  ACC.acc_bell = { w: 11, h: 9, d: function (x, y) {                     // 라운드 벨
    dome(x + 5, y + 6, 5, K); dome(x + 5, y + 6, 4, P.BR2); R(x + 3, y + 3, 2, 1, P.BR3);
    bx(x, y + 6, 11, 3, P.W2, P.W3); R(x + 4, y, 3, 2, K); R(x + 5, y, 1, 1, P.RD);
  } };
  ACC.acc_fence = { w: 12, h: 9, d: function (x, y) {                    // 전기 울타리 (찌릿)
    var a = ((T() * 8) | 0) % 3;
    bx(x, y, 3, 9, P.W2, P.W3, P.W1); bx(x + 9, y, 3, 9, P.W2, P.W3, P.W1);
    R(x + 3, y + 2, 6, 1, P.S3); R(x + 3, y + 5, 6, 1, P.S3);
    R(x + 4 + a * 2, y + 1, 1, 3, P.CY); R(x + 8 - a * 2, y + 4, 1, 3, P.YE);
  } };
  ACC.acc_puzzle = { w: 9, h: 9, d: function (x, y) {                    // 큐브 퍼즐 (윗줄만 맞췄다)
    var i, j, cs = [P.RD, P.BL, P.GR, P.WH, P.OR, P.BL, P.RD];
    R(x, y, 9, 9, K);
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) R(x + 1 + i * 3, y + 1 + j * 3, 2, 2, j === 0 ? P.YE : cs[(i * 3 + j * 2) % 7]);
  } };
  ACC.acc_calculator = { w: 8, h: 11, d: function (x, y) {               // 공학용 계산기
    var i, j; bx(x, y, 8, 11, P.G2, P.G3, P.G1); R(x + 1, y + 1, 6, 3, '#b8d8b0'); R(x + 3, y + 2, 3, 1, K);
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) R(x + 1 + i * 2, y + 5 + j * 2, 1, 1, j === 2 && i === 2 ? P.OR : P.S3);
  } };
  ACC.acc_leech = { w: 11, h: 6, d: function (x, y) {                    // 거머리 (늘었다 줄었다)
    var p = Math.sin(T() * 4) > 0 ? 1 : 0;
    R(x, y + 1, 10 + p, 5, K); R(x + 1, y + 2, 8 + p, 3, '#3a2a30'); R(x + 1, y + 2, 8 + p, 1, '#6a4a55'); R(x + 3, y + 4, 2, 1, P.RD2); R(x + 6, y + 4, 2, 1, P.RD2);
    R(x, y + 2, 1, 3, P.RD);
  } };
  ACC.acc_redcard = { w: 6, h: 8, s: 2, d: function (x, y) {             // 레드카드 (스티커)
    R(x, y, 6, 8, K); R(x + 1, y + 1, 4, 6, P.RD); R(x + 1, y + 1, 4, 1, '#ff8a80');
  } };
  ACC.acc_almanac = { w: 9, h: 10, s: 2, d: function (x, y) {            // 농사 달력 (스티커)
    var i, j; R(x, y, 9, 10, K); R(x + 1, y + 1, 7, 8, P.WH); R(x + 1, y + 1, 7, 2, P.RD);
    for (i = 0; i < 3; i++) for (j = 0; j < 2; j++) R(x + 2 + i * 2, y + 4 + j * 2, 1, 1, i === 2 && j === 1 ? P.RD : K);
  } };
  ACC.acc_receipt = { w: 6, h: 14, s: 1, d: function (x, y) {            // 영수증 뭉치 (매달림)
    var i; R(x + 2, y, 2, 2, K); R(x, y + 1, 6, 13, K); R(x + 1, y + 2, 4, 11, P.WH);
    for (i = 0; i < 4; i++) R(x + 2, y + 4 + i * 2, 2 + (i % 2), 1, '#8a8a80');
    R(x + 1, y + 13, 1, 1, K); R(x + 3, y + 13, 1, 1, K);
  } };
  ACC.acc_net = { w: 12, h: 10, d: function (x, y) {                     // 새 그물
    var i; R(x, y, 12, 1, P.W2); R(x, y, 1, 10, P.W2); R(x + 11, y, 1, 10, P.W2);
    for (i = 2; i < 10; i += 3) { R(x + 1, y + i, 10, 1, '#c9c5b8'); R(x + i, y + 1, 1, 9, '#c9c5b8'); }
    R(x + 4, y + 4, 3, 2, P.G3);
  } };
  ACC.acc_tumor = { w: 11, h: 10, d: function (x, y) {                   // 증식하는 살점 (맥동)
    var p = Math.sin(T() * 5) > 0 ? 1 : 0;
    circ(x + 4, y + 5, 4 + p, K); circ(x + 8, y + 3, 3, K); circ(x + 4, y + 5, 3 + p, P.FL2); circ(x + 8, y + 3, 2, P.FL3);
    R(x + 3, y + 4, 2, 2, P.FL3); R(x + 5, y + 6, 1, 1, P.FL1); R(x + 8, y + 3, 1, 1, '#ffe14a');
  } };
  ACC.acc_deadline = { w: 12, h: 9, d: function (x, y) {                 // 마감 시한폭탄 (깜빡)
    var a = ((T() * 2) | 0) % 2, i;
    for (i = 0; i < 3; i++) bx(x + i * 4, y + 2, 4, 7, P.RD, '#ff8a80', P.RD2);
    bx(x + 2, y + 3, 8, 4, P.BK, P.G3); R(x + 3, y + 4, 2, 2, a ? P.RD : '#5a1010'); R(x + 6, y + 4, 3, 2, a ? '#5a1010' : P.RD);
    R(x + 10, y, 1, 3, K); R(x + 11, y - 1, 1, 1, a ? P.YE : P.OR);
  } };

  X.clearCache();
})();
