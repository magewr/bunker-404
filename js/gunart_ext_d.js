// BUNKER 404 — 총기 그림 확장 D: 탄창 22종 + 개머리판 22종 (data_parts_d.js 와 짝)
// 탄창: fn(x, y, o, ac) — (x,y) = 위쪽 중앙, ac = 탄약 색 / 개머리판: fn(x, y, o) — (x,y) = 장착점, -x 쪽으로 뻗는다
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext; if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, ln = X.ln, txt = X.txt, P = X.pal, K = P.K;
  var S1 = P.S1, S2 = P.S2, S3 = P.S3, G1 = P.G1, G2 = P.G2, G3 = P.G3, W1 = P.W1, W2 = P.W2, W3 = P.W3;
  var WH = P.WH, RD = P.RD, RD2 = P.RD2, YE = P.YE, GR = P.GR, BL = P.BL, PK = P.PK, OR = P.OR, PU = P.PU, BK = P.BK;
  var RD3 = '#f0736a', YE2 = '#ffe680', YE1 = '#b8901a', SH = '#c9c5b8';
  function T() { return X.time(); }
  var MAG = X.MAG, STK = X.STK;

  /* ═════════════ 탄창 ═════════════ */
  MAG.mag_seedbag = function (x, y, o, ac) {
    bx(x - 5, y + 1, 10, 13, '#d9c9a0', '#efe2c0', '#a8956a');       // 종이 봉지
    R(x - 5, y, 10, 2, K); R(x - 4, y, 8, 1, '#efe2c0');             // 접은 윗단
    R(x - 3, y + 5, 6, 6, '#8fc86a');                                // 그림: 새싹
    R(x - 1, y + 6, 1, 4, '#2f6a2a'); R(x - 2, y + 6, 1, 1, '#2f6a2a'); R(x, y + 7, 2, 1, '#2f6a2a');
    R(x + 1, y + 9, 1, 1, YE);
    if (ac) R(x - 4, y + 12, 8, 1, ac);
  };
  MAG.mag_capsule = function (x, y, o, ac) {
    var dy, hw;
    bx(x - 2, y, 4, 3, G2, G3);
    circ(x, y + 8, 6, K); circ(x, y + 8, 5, '#e8f4ff');              // 투명한 윗반구
    for (dy = 1; dy <= 5; dy++) { hw = Math.floor(Math.sqrt(30.25 - dy * dy)); R(x - hw, y + 8 + dy, hw * 2 + 1, 1, dy >= 4 ? '#b02a5a' : PK); }
    R(x - 5, y + 8, 11, 1, K);                                       // 이음선
    R(x - 3, y + 4, 2, 2, WH);                                       // 반사광
    R(x - 1, y + 5, 3, 2, ac || YE);                                 // 안에 든 것 (꽝)
  };
  MAG.mag_tennis = function (x, y, o, ac) {
    bx(x - 4, y, 9, 3, RD, RD3, RD2);                                // 뚜껑
    bx(x - 4, y + 2, 9, 16, '#dfeef2', '#ffffff', '#a8c0c8');        // 투명 통
    for (var i = 0; i < 3; i++) { circ(x, y + 5 + i * 5, 2, '#c8e83a'); R(x - 1, y + 4 + i * 5, 1, 1, WH); R(x + 1, y + 6 + i * 5, 1, 1, '#8aa820'); }
    if (ac) R(x - 3, y + 16, 7, 1, ac);
  };
  MAG.mag_sock = function (x, y, o, ac) {
    bx(x - 4, y, 8, 12, WH, '#ffffff', SH);                          // 발목
    bx(x - 4, y + 10, 13, 7, WH, '#ffffff', SH);                     // 발
    R(x - 3, y + 10, 6, 2, WH);                                      // 이음매 지우기
    R(x - 3, y + 2, 6, 2, RD); R(x - 3, y + 5, 6, 1, BL);            // 줄무늬
    R(x + 5, y + 11, 3, 5, '#9aa0a6'); R(x - 3, y + 14, 3, 2, '#9aa0a6');   // 발끝, 뒤꿈치
    R(x + 1, y + 13, 2, 2, ac || P.BR2); R(x + 3, y + 12, 1, 1, P.BR3);     // 발가락 쪽에 모인 탄
    R(x - 1, y + 8, 2, 1, SH);
  };
  MAG.mag_ricesack = function (x, y, o, ac) {
    var s1 = '#8a744a', s2 = '#c9b07a', s3 = '#e6d3a0';
    bx(x - 3, y, 6, 5, s2, s3);                                      // 묶은 주둥이
    bx(x - 9, y + 4, 18, 16, s2, s3, s1);                            // 포대
    R(x - 9, y + 4, 2, 1, K); R(x - 9, y + 4, 1, 2, K); R(x + 7, y + 4, 2, 1, K); R(x + 8, y + 4, 1, 2, K);
    R(x - 4, y + 3, 8, 2, K); R(x - 3, y + 3, 6, 1, RD);             // 끈
    R(x - 8, y + 8, 16, 3, RD); R(x - 8, y + 8, 16, 1, RD3);         // 붉은 띠
    txt('20', x - 3, y + 13, K);
    R(x - 7, y + 17, 1, 1, s1); R(x - 4, y + 18, 1, 1, s1); R(x + 5, y + 17, 1, 1, s1); R(x + 6, y + 13, 1, 2, s1);
    if (ac) R(x - 2, y + 1, 4, 1, ac);
  };
  MAG.mag_shuttle = function (x, y, o, ac) {
    bx(x - 4, y, 8, 18, BL, '#7fb8f0', '#2a5f9a');                   // 종이 통
    R(x - 3, y + 3, 6, 1, WH); R(x - 3, y + 14, 6, 1, WH);
    R(x - 2, y + 6, 4, 3, WH); R(x - 2, y + 6, 1, 3, '#d8d8d8'); R(x - 1, y + 9, 2, 1, WH); R(x - 1, y + 10, 2, 2, '#c98a3c');   // 그림: 셔틀콕
    bx(x - 4, y + 17, 8, 3, WH, '#ffffff', SH);                      // 아래 뚜껑
    if (ac) R(x - 3, y + 1, 6, 1, ac);
  };
  MAG.mag_bbbottle = function (x, y, o, ac) {
    var cols = [ac || WH, YE, GR, OR], i;
    bx(x - 2, y, 4, 4, YE, YE2, YE1);                                // 주둥이 뚜껑
    bx(x - 6, y + 3, 12, 15, '#e4f0e8', '#ffffff', '#a8c0b0');       // 투명 통
    for (i = 0; i < 22; i++) R(x - 5 + (i * 7) % 10, y + 8 + (i * 5) % 9, 1, 1, cols[i % 4]);   // 비비탄
    R(x - 5, y + 5, 10, 2, RD); R(x - 3, y + 5, 2, 1, WH); R(x + 1, y + 6, 2, 1, WH);            // 상표 띠
  };
  MAG.mag_cassette = function (x, y, o, ac) {
    var a = ((T() * 4) | 0) % 2;
    bx(x - 3, y, 6, 3, G2, G3);
    bx(x - 9, y + 2, 18, 12, '#2b2b30', G3, '#15151a');              // 케이스
    bx(x - 7, y + 4, 14, 6, WH, '#ffffff');                          // 라벨
    R(x - 6, y + 5, 12, 1, ac || OR);
    R(x - 5, y + 6, 3, 3, K); R(x - 4 + (a ? 0 : -1), y + 7 + (a ? -1 : 0), 1, 1, WH);          // 릴
    R(x + 2, y + 6, 3, 3, K); R(x + 3 + (a ? 0 : 1), y + 7 + (a ? 1 : 0), 1, 1, WH);
    R(x - 1, y + 7, 2, 1, '#5a3a20');                                // 테이프
    R(x - 5, y + 11, 10, 2, S1); R(x - 3, y + 11, 1, 1, S3); R(x + 2, y + 11, 1, 1, S3);
  };
  MAG.mag_eggtray = function (x, y, o, ac) {
    var p1 = '#8a7d68', p2 = '#b8a98c', p3 = '#d4c7aa', r, i, ty, ex;
    bx(x - 2, y, 4, 4, G2, G3);
    for (r = 0; r < 2; r++) {
      ty = y + 2 + r * 7;
      for (i = 0; i < 5; i++) { ex = x - 10 + i * 4; R(ex, ty, 4, 4, K); R(ex + 1, ty + 1, 2, 3, (i + r) % 3 === 1 ? '#e0b088' : WH); R(ex + 1, ty + 1, 1, 1, '#ffffff'); }
      bx(x - 10, ty + 3, 20, 4, p2, p3, p1);                         // 펄프 판
      for (i = 0; i < 4; i++) R(x - 7 + i * 4, ty + 5, 1, 1, p1);
    }
    if (ac) R(x - 9, y + 15, 18, 1, ac);
  };
  MAG.mag_match = function (x, y, o, ac) {
    bx(x - 4, y, 8, 8, S2, S3, S1);                                  // 짧고 반듯한 탄창
    R(x - 3, y + 2, 6, 3, K);
    for (var i = 0; i < 5; i++) R(x - 3 + i, y + 2, 1, 3, i % 2 ? (ac || P.BR2) : P.BR3);    // 딱 다섯 발
    bx(x - 5, y + 7, 10, 3, P.BR2, P.BR3, P.BR1);                    // 금빛 바닥판
  };
  MAG.mag_hopper = function (x, y, o, ac) {
    var cols = [OR, GR, PK, YE, BL], i;
    bx(x - 2, y, 5, 6, G2, G3);                                      // 급탄 목
    R(x - 8, y + 5, 17, 9, K); R(x - 10, y + 7, 21, 5, K);           // 콩 모양 통
    R(x - 7, y + 6, 15, 7, '#2a2d33'); R(x - 9, y + 8, 19, 3, '#2a2d33'); R(x - 7, y + 6, 15, 1, G3);
    R(x - 5, y + 8, 11, 3, '#9fb8c0');                               // 투명 창
    for (i = 0; i < 5; i++) R(x - 5 + i * 2, y + 8 + (i % 2), 2, 2, cols[i]);
    R(x - 5, y + 8, 1, 1, WH);
    if (ac) R(x - 1, y + 2, 3, 1, ac);
  };
  MAG.mag_seedhopper = function (x, y, o, ac) {
    var g1 = '#2f6a2a', g2 = '#4a9a3a', g3 = '#7fc86a', i, hw, yy;
    bx(x - 2, y, 5, 4, YE, YE2, YE1);                                // 노란 급탄관
    for (i = 0; i < 13; i++) { hw = 10 - ((i / 3) | 0); R(x - hw - 1, y + 3 + i, hw * 2 + 3, 1, K); }      // 위가 넓은 통
    for (i = 1; i < 12; i++) { hw = 10 - ((i / 3) | 0); yy = y + 3 + i; R(x - hw, yy, hw * 2 + 1, 1, i === 1 ? g3 : i > 9 ? g1 : g2); }
    R(x - 8, y + 7, 17, 2, YE);                                      // 노란 띠
    for (i = 0; i < 6; i++) R(x - 8 + i * 3, y + 5, 1, 1, '#e6d3a0');                                      // 씨앗
    bx(x - 2, y + 15, 5, 4, S2, S3);                                 // 배출구
    if (ac) R(x - 6, y + 11, 13, 1, ac);
  };
  MAG.mag_gumball = function (x, y, o, ac) {
    var cols = [RD, YE, BL, GR, PK, OR, PU, WH], i, a, rr;
    bx(x - 3, y, 6, 3, RD, RD3, RD2);                                // 뚜껑
    circ(x, y + 8, 7, K); circ(x, y + 8, 6, '#dff0f8');              // 유리구
    for (i = 0; i < 14; i++) { a = i * 2.4; rr = 0.8 + (i % 4); R(x + Math.cos(a) * rr * 1.1 - 1, y + 9 + Math.sin(a) * rr * 0.9 - 1, 2, 2, cols[i % 8]); }
    R(x - 4, y + 4, 2, 2, WH);                                       // 반사광
    bx(x - 6, y + 14, 12, 7, RD, RD3, RD2);                          // 받침
    bx(x - 2, y + 16, 4, 3, S3, WH); R(x - 1, y + 17, 2, 1, K);      // 동전 투입구
    if (ac) R(x - 5, y + 19, 10, 1, ac);
  };
  MAG.mag_filecab = function (x, y, o, ac) {
    R(x - 6, y, 4, 3, K); R(x - 5, y + 1, 2, 2, '#e8c860');          // 삐져나온 서류철
    R(x - 1, y, 4, 3, K); R(x, y + 1, 2, 2, '#e8c860');
    R(x + 4, y, 3, 3, K); R(x + 5, y + 1, 1, 2, WH);
    bx(x - 8, y + 2, 16, 14, P.PL2, P.PL3, P.PL1);                   // 서랍
    R(x - 7, y + 4, 14, 1, P.PL1);
    bx(x - 3, y + 6, 6, 3, WH, '#ffffff'); R(x - 2, y + 7, 3, 1, ac || BL);   // 이름표
    bx(x - 3, y + 11, 6, 3, S2, S3);                                 // 손잡이
    R(x + 5, y + 12, 1, 2, K);                                       // 열쇠 구멍
  };
  MAG.mag_tank = function (x, y, o, ac) {
    var a = 0.5 + Math.sin(T() * 9) * 0.3;
    bx(x - 2, y, 4, 5, S2, S3);                                      // 밸브 목
    R(x - 4, y + 1, 8, 3, K); R(x - 3, y + 2, 6, 1, RD);             // 밸브 손잡이
    bx(x - 6, y + 4, 12, 15, P.PI2, P.PI3, P.PI1);                   // 탱크
    R(x - 6, y + 4, 2, 1, K); R(x - 6, y + 4, 1, 2, K); R(x + 4, y + 4, 2, 1, K); R(x + 5, y + 4, 1, 2, K);
    R(x - 6, y + 18, 2, 1, K); R(x - 6, y + 17, 1, 2, K); R(x + 4, y + 18, 2, 1, K); R(x + 5, y + 17, 1, 2, K);
    R(x - 5, y + 7, 10, 1, P.PI1);                                   // 용접 띠
    circ(x, y + 12, 3, K); circ(x, y + 12, 2, WH); R(x + 1, y + 10, 1, 1, RD); R(x + 2, y + 11, 1, 1, RD);   // 압력계 (빨간 구역)
    ln(x, y + 12, x + Math.cos(a) * 2, y + 12 - Math.sin(a) * 2, RD2, 1);                                    // 떠는 바늘
    if (ac) R(x - 4, y + 16, 8, 1, ac);
  };
  MAG.mag_single = function (x, y, o, ac) {
    var tip = ac || P.CU;
    bx(x - 4, y, 8, 4, G2, G3, G1);                                  // 장전구 덮개
    R(x - 2, y + 3, 5, 10, K); R(x - 1, y + 12, 3, 3, K);            // 큼직한 한 발
    R(x - 1, y + 4, 3, 6, P.BR2); R(x - 1, y + 4, 1, 6, P.BR3); R(x - 1, y + 9, 3, 1, P.BR1);
    R(x - 1, y + 10, 3, 2, tip); R(x, y + 12, 1, 2, tip);
    R(x + 3, y + 5, 3, 1, RD); R(x + 5, y + 5, 1, 4, RD); R(x + 4, y + 8, 1, 2, RD2);    // 붉은 리본
  };
  MAG.mag_backpack = function (x, y, o, ac) {
    var c = ac || P.BR2, i;
    for (i = 0; i < 6; i++) { R(x - 3 - i, y + i, 6, 2, K); R(x - 2 - i, y + i, 4, 1, i % 2 ? c : S3); }    // 급탄 슈트
    bx(x - 16, y + 5, 20, 17, P.OL2, P.OL3, P.OL1);                  // 배낭
    bx(x - 14, y + 3, 16, 5, P.OL2, P.OL3);                          // 덮개
    txt('500', x - 12, y + 9, YE);
    bx(x - 12, y + 15, 12, 6, P.OL1, P.OL2);                         // 앞주머니
    R(x - 7, y + 16, 2, 2, YE);                                      // 버클
    R(x + 1, y + 9, 2, 12, '#2a3020');                               // 어깨끈
  };
  MAG.mag_eggsac = function (x, y, o, ac) {
    var p = Math.sin(T() * 3) > 0 ? 1 : 0, eg = ac || '#f4eeda', pts = [[-3, 8], [1, 7], [3, 11], [-1, 12], [-4, 12]], i;
    bx(x - 3, y, 6, 4, P.FL1, P.FL2);
    circ(x, y + 10, 7 + p, K); circ(x, y + 10, 6 + p, '#b8d88a'); circ(x - 1, y + 9, 4, '#d8f0b0');     // 반투명 막
    for (i = 0; i < pts.length; i++) { circ(x + pts[i][0], y + pts[i][1], 1, eg); R(x + pts[i][0], y + pts[i][1], 1, 1, K); }   // 알
    R(x + 4, y + 6, 1, 3, P.FL2); R(x - 5, y + 9, 1, 2, P.FL2);      // 핏줄
    R(x - 1, y + 17 + p, 1, 2, '#b6ff3c');                           // 점액
  };
  MAG.mag_bowling = function (x, y, o, ac) {
    var ball = ac || '#8a2ad0';
    R(x - 4, y, 9, 1, K); R(x - 5, y + 1, 1, 4, K); R(x + 4, y + 1, 1, 4, K);         // 손잡이
    bx(x - 9, y + 4, 18, 14, '#2a4f9a', '#4f7fd0', '#1a3060');       // 가방
    R(x - 9, y + 4, 2, 1, K); R(x - 9, y + 4, 1, 2, K); R(x + 7, y + 4, 2, 1, K); R(x + 8, y + 4, 1, 2, K);
    R(x - 8, y + 12, 16, 2, WH);                                     // 흰 띠
    circ(x, y + 7, 4, K); circ(x, y + 7, 3, ball);                   // 지퍼 사이로 보이는 공
    R(x - 1, y + 5, 1, 1, K); R(x + 1, y + 5, 1, 1, K); R(x, y + 7, 1, 1, K); R(x - 2, y + 6, 1, 1, WH);
    R(x - 6, y + 15, 3, 2, YE);                                      // 이름표
  };
  MAG.mag_arcade = function (x, y, o, ac) {
    var t = T(), f = ((t * 3) | 0) % 2;
    bx(x - 7, y, 14, 20, '#2a2a6a', '#4a4ab0', '#15153a');           // 캐비닛
    R(x - 5, y + 2, 10, 7, K); R(x - 4, y + 3, 8, 5, '#0a1a2a');     // 화면
    R(x - 3 + f, y + 4, 2, 1, GR); R(x + 1 - f, y + 4, 2, 1, RD); R(x - 1, y + 6, 2, 1, WH);
    R(x - 6, y + 10, 12, 1, '#4a4ab0');
    R(x - 5, y + 11, 3, 1, RD); R(x - 4, y + 12, 1, 2, S3);          // 조이스틱
    R(x, y + 12, 2, 2, YE); R(x + 3, y + 12, 2, 2, RD);              // 버튼
    R(x - 2, y + 15, 4, 3, K); R(x - 1, y + 16, 2, 1, ((t * 2) | 0) % 2 ? YE : OR);     // 깜빡이는 동전 투입구
    if (ac) R(x - 6, y + 18, 12, 1, ac);
  };
  MAG.mag_quantum = function (x, y, o, ac) {
    var f = ((T() * 6) | 0) % 2, c = ac || P.CY, gx = f ? 2 : -2, i;
    R(x - 4 + gx, y + 1, 9, 13, f ? '#1f4f5f' : '#12303a');          // 겹쳐 있는 또 하나의 상태
    for (i = 0; i < 4; i++) { R(x - 4 + gx + i * 2, y + 14, 1, 1, P.CY); R(x - 5 + gx, y + 2 + i * 3, 1, 1, P.CY); R(x + 5 + gx, y + 3 + i * 3, 1, 1, P.CY); }
    bx(x - 4, y, 9, 14, P.TE2, P.TE3, P.TE1);                        // 본체
    R(x - 2, y + 3, 5, 8, '#0a1018');
    R(x - 2 + (f ? 0 : 2), y + 4 + (f ? 0 : 4), 3, 2, c);            // 있다가 없다가 하는 탄
    R(x - 1, y + 12, 3, 1, f ? P.CY2 : P.TE3);
  };
  MAG.mag_cornucopia = function (x, y, o, ac) {
    var h1 = '#7a5230', h2 = '#b8863c', h3 = '#e0b060', i, w, cx, mx = x + 6;
    for (i = 0; i < 14; i++) { w = 3 + ((i * 0.75) | 0); cx = x + ((i * i / 28) | 0); R(cx - (w >> 1) - 1, y + i, w + 2, 1, K); }       // 뿔: 아래로 넓어지며 앞으로 휜다
    for (i = 0; i < 13; i++) { w = 3 + ((i * 0.75) | 0); cx = x + ((i * i / 28) | 0); R(cx - (w >> 1), y + i, w, 1, i % 3 === 2 ? h1 : h2); R(cx - (w >> 1), y + i, 1, 1, h3); }
    R(mx - 7, y + 13, 14, 5, K);                                     // 입구
    R(mx - 6, y + 14, 4, 3, RD); R(mx - 5, y + 14, 1, 1, RD3);       // 사과
    R(mx - 1, y + 14, 3, 4, ac || P.BR2); R(mx - 1, y + 14, 1, 4, P.BR3);              // 쏟아지는 탄
    R(mx + 3, y + 14, 3, 3, PU); R(mx + 4, y + 16, 2, 2, PU); R(mx + 3, y + 14, 1, 1, '#c8a0f0');   // 포도
    R(mx - 4, y + 18, 3, 3, K); R(mx - 3, y + 19, 1, 1, YE);         // 굴러떨어진 낱알
  };

  /* ═════════════ 개머리판 ═════════════ */
  STK.stock_shovel = function (x, y) {
    bx(x - 24, y - 2, 25, 4, W2, W3, W1);                            // 자루
    R(x - 14, y - 1, 1, 2, W1); R(x - 7, y - 1, 1, 2, W1);
    bx(x - 33, y - 6, 4, 12, W2, W3, W1);                            // D자 손잡이
    bx(x - 31, y - 6, 8, 3, S2, S3); bx(x - 31, y + 3, 8, 3, S2, S3);
  };
  STK.stock_hanger = function (x, y) {
    ln(x - 1, y - 2, x - 25, y - 9, K, 3); ln(x - 1, y, x - 25, y + 6, K, 3); R(x - 27, y - 9, 3, 18, K);   // 세모꼴 철사
    ln(x, y - 1, x - 24, y - 8, S3, 1); ln(x, y + 1, x - 24, y + 7, S3, 1); R(x - 26, y - 8, 1, 16, S3);
    bx(x - 3, y - 2, 5, 5, S2, S3);                                  // 꼬아 감은 목
    R(x - 30, y - 1, 4, 3, K); R(x - 29, y, 3, 1, S3);               // 갈고리
    R(x - 32, y - 4, 3, 5, K); R(x - 31, y - 3, 1, 3, S3);
    R(x - 31, y - 6, 5, 3, K); R(x - 30, y - 5, 3, 1, S3);
    bx(x - 15, y - 3, 6, 5, PK, '#ffb0d8');                          // 세탁소 번호표
    R(x - 13, y - 1, 2, 1, WH);
  };
  STK.stock_jumprope = function (x, y) {
    var i, ry;
    bx(x - 16, y - 2, 17, 5, RD, RD3, RD2);                          // 손잡이
    R(x - 12, y - 1, 1, 3, RD2); R(x - 9, y - 1, 1, 3, RD2); R(x - 6, y - 1, 1, 3, RD2);
    bx(x - 19, y - 3, 4, 7, YE, YE2, YE1);                           // 끝 마개
    for (i = 0; i < 10; i++) { ry = y + 3 + Math.round(Math.sin(i / 9 * 3.14) * 8); R(x - 21 - i, ry, 3, 3, K); }     // 늘어진 줄
    for (i = 0; i < 10; i++) { ry = y + 3 + Math.round(Math.sin(i / 9 * 3.14) * 8); R(x - 20 - i, ry + 1, 1, 1, BL); }
    bx(x - 34, y - 6, 4, 12, RD, RD3, RD2);                          // 반대쪽 손잡이
    bx(x - 35, y - 9, 6, 4, YE, YE2, YE1);
  };
  STK.stock_hobbyhorse = function (x, y) {
    var h1 = '#6a4424', h2 = '#a06a34', h3 = '#c98a4c';
    bx(x - 20, y - 1, 21, 4, W2, W3, W1);                            // 막대
    bx(x - 30, y - 8, 12, 10, h2, h3, h1);                           // 목과 머리 (뒤를 본다)
    bx(x - 36, y - 5, 8, 7, h2, h3, h1);                             // 주둥이
    R(x - 30, y - 4, 2, 5, h2);
    R(x - 24, y - 11, 3, 4, K); R(x - 23, y - 10, 1, 3, h2); R(x - 21, y - 11, 3, 4, K); R(x - 20, y - 10, 1, 3, h2);   // 귀
    R(x - 27, y - 6, 2, 2, K); R(x - 27, y - 6, 1, 1, WH);           // 눈
    R(x - 35, y - 3, 1, 1, K); R(x - 35, y, 3, 1, K);                // 콧구멍, 입
    R(x - 19, y - 8, 2, 9, '#2a1808');                               // 갈기
    R(x - 33, y - 4, 1, 5, RD); R(x - 32, y - 2, 12, 1, RD);         // 고삐
  };
  STK.stock_rake = function (x, y) {
    var i, ty;
    bx(x - 26, y - 2, 27, 4, W2, W3, W1);                            // 자루
    for (i = 0; i < 6; i++) { ty = y - 9 + i * 3; R(x - 36, ty, 7, 3, K); R(x - 35, ty + 1, 5, 1, S3); }   // 살
    bx(x - 30, y - 10, 4, 20, S2, S3, S1);                           // 갈퀴 머리
  };
  STK.stock_hockey = function (x, y) {
    var i;
    bx(x - 28, y - 2, 29, 4, '#2a2a30', G3, '#15151a');              // 샤프트
    R(x - 8, y - 1, 5, 2, WH); R(x - 20, y - 1, 2, 2, RD); R(x - 16, y - 1, 2, 2, RD);
    for (i = 0; i < 10; i++) R(x - 31 - (i >> 2), y - 2 + i, 6, 2, K);                                    // 아래로 꺾이는 목
    for (i = 0; i < 10; i++) R(x - 30 - (i >> 2), y - 1 + i, 4, 1, i > 3 ? WH : G3);
    bx(x - 40, y + 7, 10, 5, WH, '#ffffff', SH);                     // 블레이드 (테이프 감음)
    R(x - 38, y + 9, 1, 2, SH); R(x - 35, y + 9, 1, 2, SH);
  };
  STK.stock_teddy = function (x, y) {
    var b1 = '#7a4f28', b2 = '#b07a40', b3 = '#d4a468', be = '#e8cfa0';
    bx(x - 7, y - 1, 8, 4, P.TP1, P.TP2);                            // 테이프 고정
    bx(x - 22, y, 5, 5, b2, b3, b1);                                 // 뒤쪽 팔
    circ(x - 13, y + 3, 7, K); circ(x - 13, y + 3, 6, b2); circ(x - 13, y + 4, 3, be);     // 몸통
    bx(x - 19, y + 8, 5, 4, b2, b3, b1); bx(x - 11, y + 8, 5, 4, b2, b3, b1);              // 발
    circ(x - 17, y - 12, 2, K); circ(x - 17, y - 12, 1, b3); circ(x - 9, y - 12, 2, K); circ(x - 9, y - 12, 1, b3);   // 귀
    circ(x - 13, y - 8, 5, K); circ(x - 13, y - 8, 4, b2);           // 머리
    R(x - 15, y - 9, 1, 1, K); R(x - 12, y - 9, 1, 1, K);            // 눈
    R(x - 15, y - 7, 4, 2, be); R(x - 14, y - 7, 2, 1, K);           // 주둥이
    R(x - 16, y - 3, 6, 1, RD); R(x - 12, y - 3, 2, 3, RD);          // 목 리본
  };
  STK.stock_wire = function (x, y) {
    R(x - 22, y - 3, 20, 3, K); R(x - 22, y - 2, 19, 1, S3);         // 위 철사
    ln(x - 4, y + 1, x - 23, y + 6, K, 3); ln(x - 3, y + 2, x - 22, y + 7, S3, 1);         // 아래 철사
    bx(x - 3, y - 3, 4, 8, P.OL2, P.OL3);                            // 경첩
    bx(x - 26, y - 4, 4, 14, G2, G3, G1);                            // 견착판
  };
  STK.stock_ruler = function (x, y) {
    bx(x - 30, y - 5, 31, 10, S3, WH, S2);                           // 쇠자
    for (var i = 0; i < 14; i++) R(x - 28 + i * 2, y - 3, 1, i % 5 === 0 ? 2 : 1, K);      // 눈금
    txt('30', x - 28, y - 1, S1); txt('20', x - 19, y - 1, S1); txt('10', x - 10, y - 1, S1);
    R(x - 2, y + 1, 1, 1, K);                                        // 걸이 구멍
  };
  STK.stock_plunger = function (x, y) {
    var i, hh;
    bx(x - 22, y - 2, 23, 4, W2, W3, W1);                            // 나무 자루
    for (i = 0; i < 8; i++) { hh = 3 + i; R(x - 23 - i, y - hh - 1, 1, hh * 2 + 3, K); }                  // 고무 컵 (뒤로 벌어진다)
    for (i = 0; i < 8; i++) { hh = 3 + i; R(x - 23 - i, y - hh, 1, hh * 2 + 1, i < 2 ? RD2 : RD); R(x - 23 - i, y - hh, 1, 1, RD3); }
    bx(x - 33, y - 12, 3, 25, RD2, RD);                              // 컵 테두리
  };
  STK.stock_cheek = function (x, y) {
    bx(x - 12, y - 2, 13, 5, P.OL2, P.OL3, P.OL1);                   // 목
    bx(x - 30, y - 4, 19, 14, P.OL2, P.OL3, P.OL1);                  // 몸체
    R(x - 26, y + 1, 10, 6, K);                                      // 경량화 구멍
    R(x - 24, y - 6, 2, 3, S3); R(x - 18, y - 6, 2, 3, S3);          // 높이 조절 기둥
    bx(x - 27, y - 10, 13, 5, G2, G3, G1);                           // 칙패드
    bx(x - 33, y - 5, 4, 16, BK, G3);                                // 버트 패드
    R(x - 22, y + 9, 3, 6, K); R(x - 21, y + 10, 1, 4, S3); R(x - 23, y + 14, 5, 2, K);    // 모노포드
  };
  STK.stock_scythe = function (x, y) {
    var i, by, th;
    bx(x - 26, y - 2, 27, 4, W2, W3, W1);                            // 자루
    bx(x - 7, y + 1, 3, 6, W1, W2);                                  // 보조 손잡이
    for (i = 0; i < 22; i++) { by = y + 1 + Math.round(Math.sin(i / 21 * 1.57) * 13); th = Math.max(1, 5 - ((i / 5) | 0)); R(x - 31 + i, by - 1, 3, th + 2, K); }    // 낫날: 뒤에서 아래-앞으로 크게 휜다
    for (i = 0; i < 22; i++) { by = y + 1 + Math.round(Math.sin(i / 21 * 1.57) * 13); th = Math.max(1, 5 - ((i / 5) | 0)); R(x - 30 + i, by, 1, th, S3); R(x - 30 + i, by + th - 1, 1, 1, WH); }
    bx(x - 31, y - 4, 5, 7, S1, S2);                                 // 날 고정쇠
  };
  STK.stock_golf = function (x, y) {
    R(x - 26, y - 2, 27, 3, K); R(x - 26, y - 1, 26, 1, S3);         // 샤프트
    bx(x - 10, y - 2, 11, 4, BK, G3);                                // 그립
    circ(x - 31, y + 2, 6, K); circ(x - 31, y + 2, 5, '#2a2d33'); circ(x - 32, y + 1, 3, G3);            // 헤드
    bx(x - 27, y - 4, 3, 12, S3, WH);                                // 페이스
    R(x - 35, y + 5, 6, 1, RD);
    txt('1', x - 34, y - 1, WH);                                     // 1번 우드
  };
  STK.stock_hula = function (x, y) {
    var cx = x - 15, n = 28, t = ((T() * 6) | 0), i, a, px, py;
    bx(x - 3, y - 2, 4, 5, G2, G3);
    for (i = 0; i < n; i++) { a = i / n * 6.283; px = cx + Math.cos(a) * 12; py = y + Math.sin(a) * 12; R(px - 2, py - 2, 4, 4, K); }
    for (i = 0; i < n; i++) { a = i / n * 6.283; px = cx + Math.cos(a) * 12; py = y + Math.sin(a) * 12; R(px - 1, py - 1, 2, 2, ((i + t) % 4) < 2 ? PK : WH); }   // 돌아가는 줄무늬
  };
  STK.stock_ironing = function (x, y) {
    ln(x - 8, y + 1, x - 26, y + 11, K, 3); ln(x - 26, y + 1, x - 8, y + 11, K, 3);        // 접이식 X자 다리
    ln(x - 7, y + 2, x - 25, y + 12, S3, 1); ln(x - 25, y + 2, x - 7, y + 12, S3, 1);
    bx(x - 30, y - 3, 31, 6, '#a8c8ea', '#d8ecff', '#6a90b8');       // 판
    R(x - 33, y - 2, 4, 4, K); R(x - 32, y - 1, 3, 2, '#a8c8ea');    // 뾰족한 코
    for (var i = 0; i < 7; i++) R(x - 27 + i * 4, y - 1, 1, 1, WH);
    R(x - 22, y - 11, 8, 3, K); R(x - 21, y - 10, 6, 1, RD);         // 다리미 손잡이
    R(x - 21, y - 9, 2, 2, K); R(x - 17, y - 9, 2, 2, K);
    bx(x - 25, y - 8, 12, 5, S3, WH, S2); R(x - 27, y - 6, 3, 3, K); R(x - 26, y - 5, 2, 1, S3);   // 다리미
  };
  STK.stock_tentacle = function (x, y) {
    var t = T(), n = 16, i, k, px, py, th;
    for (i = 0; i < n; i++) { k = i / (n - 1); px = x - 2 - i * 2; py = y + Math.round(Math.sin(k * 5 + t * 3) * (1 + k * 5)); th = 7 - ((k * 5) | 0); R(px - 1, py - (th >> 1) - 1, 4, th + 2, K); }
    for (i = 0; i < n; i++) {
      k = i / (n - 1); px = x - 2 - i * 2; py = y + Math.round(Math.sin(k * 5 + t * 3) * (1 + k * 5)); th = 7 - ((k * 5) | 0);
      R(px, py - (th >> 1), 2, th, i % 2 ? P.FL2 : '#8a3a9a'); R(px, py - (th >> 1), 2, 1, P.FL3);
      if (i % 3 === 1 && th > 2) R(px, py - (th >> 1) + th - 1, 1, 1, '#f4c8e0');          // 빨판
    }
    bx(x - 3, y - 4, 4, 9, P.FL1, P.FL2);                            // 뿌리
  };
  STK.stock_anvil = function (x, y) {
    var a1 = '#2a2d33', a2 = G3, a3 = S3;
    bx(x - 5, y - 2, 6, 5, G2, G3);
    bx(x - 20, y - 2, 10, 6, a1, a2);                                // 허리
    bx(x - 25, y + 3, 20, 6, a2, a3, a1); R(x - 22, y + 5, 14, 1, a1);                     // 받침
    R(x - 31, y - 7, 6, 5, K); R(x - 30, y - 6, 5, 3, a2); R(x - 30, y - 6, 5, 1, a3);    // 뿔
    R(x - 34, y - 6, 4, 3, K); R(x - 33, y - 5, 3, 1, a3);
    bx(x - 26, y - 8, 22, 7, a2, a3, a1);                            // 윗면
    R(x - 9, y - 7, 2, 2, K);                                        // 하디 홀
  };
  STK.stock_trophy = function (x, y) {
    var g1 = P.BR1, g2 = P.BR2, g3 = P.BR3;
    bx(x - 8, y - 2, 9, 5, G2, G3);
    R(x - 25, y - 11, 4, 2, K); R(x - 25, y - 11, 2, 7, K); R(x - 25, y - 6, 4, 2, K);    // 뒤 손잡이
    R(x - 24, y - 10, 2, 1, g2); R(x - 24, y - 10, 1, 5, g2); R(x - 24, y - 5, 2, 1, g2);
    R(x - 9, y - 11, 4, 2, K); R(x - 7, y - 11, 2, 7, K); R(x - 9, y - 6, 4, 2, K);       // 앞 손잡이
    R(x - 8, y - 10, 2, 1, g2); R(x - 6, y - 10, 1, 5, g2); R(x - 8, y - 5, 2, 1, g2);
    bx(x - 22, y - 13, 14, 11, g2, g3, g1);                          // 컵
    R(x - 20, y - 11, 1, 6, g3);
    txt('1', x - 16, y - 10, g1);
    bx(x - 17, y - 3, 4, 6, g2, g3);                                 // 기둥
    bx(x - 21, y + 2, 12, 4, g2, g3, g1);
    bx(x - 23, y + 5, 16, 5, W1, W2);                                // 받침대
    R(x - 18, y + 7, 6, 1, g3);
  };
  STK.stock_rc = function (x, y) {
    var on = ((T() * 3) | 0) % 2;
    bx(x - 6, y - 2, 7, 5, G2, G3);
    R(x - 25, y - 19, 3, 14, K); R(x - 24, y - 18, 1, 12, S3);       // 안테나
    R(x - 26, y - 21, 5, 3, K); R(x - 25, y - 20, 3, 1, RD);
    bx(x - 24, y - 6, 19, 13, RD, RD3, '#8a1f1f');                   // 본체
    bx(x - 22, y - 4, 15, 4, BK, G3);                                // 조작판
    R(x - 21, y - 10, 4, 2, K); R(x - 20, y - 9, 2, 6, K); R(x - 20, y - 9, 2, 1, S3);    // 스틱 1
    R(x - 13, y - 10, 4, 2, K); R(x - 12, y - 9, 2, 6, K); R(x - 12, y - 9, 2, 1, S3);    // 스틱 2
    R(x - 16, y + 2, 2, 2, on ? GR : '#1f4f1f');                     // LED
    R(x - 22, y + 3, 4, 1, WH); R(x - 11, y + 2, 4, 3, YE);
  };
  STK.stock_recliner = function (x, y) {
    var l1 = '#3a2416', l2 = '#6a4428', l3 = '#9a6a40', b = ((T() * 4) | 0) % 2, i;
    bx(x - 8, y - 1, 9, 4, G2, G3);
    bx(x - 30, y - 16, 9, 24, l2, l3, l1);                           // 등받이
    for (i = 0; i < 4; i++) R(x - 28, y - 13 + i * 5, 5, 1, l1);     // 누빔
    bx(x - 24, y + 1, 18, 8, l2, l3, l1);                            // 좌판
    bx(x - 22, y - 5, 13, 4, l1, l2);                                // 팔걸이
    bx(x - 9, y + 4, 6, 9, l2, l3, l1);                              // 다리 받침
    bx(x - 28, y + 8, 22, 4, BK, G3);                                // 바닥
    R(x - 27, y - 11 + b * 5, 2, 2, P.CY);                           // 오르내리는 안마 롤러
    bx(x - 13, y - 9, 4, 5, G3, S3); R(x - 12, y - 8, 1, 1, RD);     // 리모컨
  };
  STK.stock_scarecrow = function (x, y) {
    var s1 = '#8a744a', s2 = '#c9b07a', s3 = '#e6d3a0', st = '#e8c860';
    bx(x - 14, y - 1, 15, 4, W2, W3, W1);                            // 장대
    bx(x - 35, y - 1, 10, 4, RD, RD3, RD2);                          // 벌린 팔
    R(x - 38, y - 1, 4, 1, st); R(x - 38, y + 1, 4, 1, st); R(x - 37, y, 3, 1, st);        // 손끝 지푸라기
    bx(x - 26, y - 2, 13, 13, RD, RD3, RD2);                         // 체크 셔츠
    R(x - 25, y + 3, 11, 1, RD2); R(x - 22, y - 1, 1, 11, RD2); R(x - 18, y - 1, 1, 11, RD2);
    R(x - 24, y + 10, 2, 3, st); R(x - 20, y + 10, 1, 4, st); R(x - 16, y + 10, 2, 3, st);  // 삐져나온 짚
    bx(x - 24, y - 11, 9, 10, s2, s3, s1);                           // 자루 머리
    R(x - 22, y - 8, 2, 2, K); R(x - 18, y - 8, 2, 2, K);            // 단추 눈
    R(x - 22, y - 4, 5, 1, K); R(x - 21, y - 5, 1, 3, K); R(x - 19, y - 5, 1, 3, K);       // 꿰맨 입
    bx(x - 24, y - 17, 9, 6, st, '#fff0a0', '#b8963a');              // 밀짚모자
    R(x - 28, y - 13, 17, 3, K); R(x - 27, y - 12, 15, 1, st);       // 챙
  };
  STK.stock_ancestor = function (x, y) {
    var d1 = '#3a2010', d2 = '#6a3c1c', d3 = '#96602e', i, top, h;
    for (i = 0; i < 28; i++) { top = y - 3 + ((i / 4) | 0); h = 6 + ((i / 3) | 0); R(x - i - 1, top - 1, 1, h + 2, K); }     // 묵은 호두나무
    for (i = 0; i < 27; i++) { top = y - 3 + ((i / 4) | 0); h = 6 + ((i / 3) | 0); R(x - i - 1, top, 1, h, i % 6 === 2 ? d1 : d2); R(x - i - 1, top, 1, 1, d3); }
    R(x - 31, y + 2, 4, 17, K); R(x - 30, y + 3, 2, 15, P.BR2); R(x - 30, y + 3, 1, 15, P.BR3);       // 놋쇠 끝판
    R(x - 12, y + 1, 1, 1, P.CY2); R(x - 15, y + 3, 2, 1, WH); R(x - 18, y + 5, 1, 1, P.CY2); R(x - 21, y + 4, 2, 2, WH); R(x - 20, y + 8, 1, 1, PK);   // 자개 무늬
    R(x - 8, y + 4, 1, 4, RD); R(x - 9, y + 8, 3, 2, K); R(x - 9, y + 8, 3, 1, YE);                    // 매듭 장식
    R(x - 9, y + 10, 1, 4, RD); R(x - 8, y + 10, 1, 5, RD2); R(x - 7, y + 10, 1, 4, RD);
  };

  X.clearCache();
})();
