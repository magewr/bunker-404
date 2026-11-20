// BUNKER 404 — 총기 그림 확장 E: 조준기 22종 + 부착물 34종 (data_parts_e.js 와 짝)
// 조준기: fn(x, y) — (x,y) = 아래 중앙.  부착물: { w, h, s, d(x, y) } — (x,y) = 좌상단, s 1 = 매달린 장식, 2 = 스티커류
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext;
  if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, ln = X.ln, txt = X.txt, P = X.pal, K = P.K;
  var S1 = P.S1, S2 = P.S2, S3 = P.S3, G1 = P.G1, G2 = P.G2, G3 = P.G3, W1 = P.W1, W2 = P.W2, W3 = P.W3;
  var BR1 = P.BR1, BR2 = P.BR2, BR3 = P.BR3, RU2 = P.RU2, RU3 = P.RU3, FL1 = P.FL1, FL2 = P.FL2, FL3 = P.FL3;
  var PI1 = P.PI1, PI2 = P.PI2, PI3 = P.PI3, OL2 = P.OL2, CY = P.CY;
  var WH = P.WH, RD = P.RD, RD2 = P.RD2, YE = P.YE, GR = P.GR, BL = P.BL, PK = P.PK, OR = P.OR, PU = P.PU, BK = P.BK;
  var WH2 = '#ffffff', WH0 = '#c9c5b8', GLASS = '#9fd0e8', YE3 = '#fff3a8', YE1 = '#c49a1c', RD3 = '#ff8a80', BL3 = '#7fb8f0', BL1 = '#2a5f9c';
  function t() { return X.time(); }
  var SGT = X.SGT, ACC = X.ACC;

  /* ═════════════ 조준기 ═════════════ */
  SGT.sight_pipe = function (x, y) {
    bx(x - 4, y - 4, 8, 5, PI2, PI3, PI1);                 // 받침 플랜지
    bx(x - 3, y - 11, 6, 8, PI2, PI3, PI1);                // 세로 관
    bx(x - 3, y - 13, 11, 6, PI2, PI3, PI1);               // 꺾인 가로 관
    R(x + 6, y - 11, 1, 2, '#000000');                     // 구멍
    R(x - 1, y - 8, 1, 1, RU3); R(x + 1, y - 6, 1, 1, RU2); R(x + 2, y - 11, 1, 1, RU3);
  };
  SGT.sight_goggles = function (x, y) {
    R(x - 1, y - 3, 2, 4, K);
    bx(x - 9, y - 9, 8, 7, BL, BL3, BL1); bx(x + 1, y - 9, 8, 7, BL, BL3, BL1);
    R(x - 7, y - 7, 4, 3, '#bfe8ff'); R(x + 3, y - 7, 4, 3, '#bfe8ff'); R(x - 7, y - 7, 1, 1, WH2); R(x + 3, y - 7, 1, 1, WH2);
    R(x - 1, y - 7, 2, 2, K);
    R(x - 13, y - 7, 4, 3, K); R(x - 12, y - 6, 3, 1, YE);  // 끈
  };
  SGT.sight_scarecrow = function (x, y) {
    var st = '#e0c060', st2 = '#a8862c';
    R(x - 1, y - 12, 3, 13, K); R(x, y - 11, 1, 11, st);
    R(x - 6, y - 9, 13, 3, K); R(x - 5, y - 8, 11, 1, st);
    R(x - 7, y - 8, 1, 2, st2); R(x + 7, y - 8, 1, 2, st2);                          // 삐져나온 짚
    R(x - 4, y - 14, 9, 2, K); R(x - 2, y - 17, 5, 4, K); R(x - 1, y - 16, 3, 2, st); R(x - 3, y - 14, 7, 1, st2);   // 밀짚모자
  };
  SGT.sight_toybinoc = function (x, y) {
    R(x - 1, y - 2, 3, 3, K);
    bx(x - 8, y - 10, 16, 5, RD, RD3, RD2);
    bx(x - 8, y - 6, 16, 5, YE, YE3, YE1);
    bx(x + 6, y - 11, 4, 11, BL, BL3); R(x + 8, y - 9, 1, 3, '#bfe8ff'); R(x + 8, y - 5, 1, 3, '#bfe8ff');
    bx(x - 10, y - 9, 3, 7, BL, BL3);
  };
  SGT.sight_archery = function (x, y) {
    bx(x - 3, y - 3, 6, 4, G2, G3);
    R(x - 1, y - 16, 3, 14, K); R(x, y - 15, 1, 12, S3);                              // 세로 조절대
    R(x - 3, y - 17, 7, 3, K); R(x - 2, y - 16, 5, 1, BL);
    R(x + 1, y - 12, 5, 3, K); R(x + 2, y - 11, 3, 1, S2);                            // 가로 암
    circ(x + 9, y - 11, 4, K); circ(x + 9, y - 11, 3, YE); circ(x + 9, y - 11, 2, RD); R(x + 9, y - 11, 1, 1, YE3);
  };
  SGT.sight_level = function (x, y) {
    var b = Math.round(Math.sin(t() * 2.2) * 1.4);
    bx(x - 11, y - 7, 22, 7, YE, YE3, YE1);
    bx(x - 5, y - 6, 10, 5, '#a8f090', '#d8ffc8');
    R(x - 3, y - 5, 1, 3, '#3a7a2a'); R(x + 2, y - 5, 1, 3, '#3a7a2a');               // 눈금
    R(x - 1 + b, y - 5, 2, 2, WH2);                                                   // 기포
    R(x - 9, y - 4, 2, 2, K); R(x + 7, y - 4, 2, 2, K);
  };
  SGT.sight_tractor = function (x, y) {
    R(x - 1, y - 6, 3, 7, K); R(x, y - 5, 1, 5, S3);
    ln(x, y - 6, x - 4, y - 9, K, 2);
    circ(x - 6, y - 13, 5, K); circ(x - 6, y - 13, 4, RD2); circ(x - 6, y - 13, 3, GLASS);
    R(x - 8, y - 15, 2, 1, WH2); R(x - 5, y - 12, 2, 2, '#6fa8c8');
  };
  SGT.sight_periscope = function (x, y) {
    bx(x - 3, y - 16, 7, 16, WH, WH2, WH0);
    R(x - 2, y - 11, 5, 3, BL); R(x - 1, y - 10, 3, 1, WH2);                          // 우유팩 무늬
    bx(x + 3, y - 17, 5, 6, WH, WH2); R(x + 6, y - 15, 1, 3, GLASS);                  // 위쪽 창
    bx(x - 7, y - 6, 5, 6, WH, WH2); R(x - 6, y - 4, 1, 3, GLASS);                    // 아래쪽 창
    R(x - 2, y - 15, 2, 1, S2); R(x, y - 14, 2, 1, S2); R(x - 1, y - 3, 2, 1, S2);    // 비스듬한 거울
  };
  SGT.sight_racket = function (x, y) {
    bx(x - 2, y - 5, 4, 6, BK, G3); R(x - 1, y - 3, 2, 1, WH);                        // 그립
    R(x - 1, y - 9, 3, 5, K); R(x, y - 9, 1, 4, S3);                                  // 샤프트
    circ(x, y - 15, 6, K); circ(x, y - 15, 5, BL); circ(x, y - 15, 4, '#e8f4ff');
    for (var i = -3; i <= 3; i += 2) { R(x + i, y - 19, 1, 9, '#9ab0c4'); R(x - 4, y - 15 + i, 9, 1, '#9ab0c4'); }
  };
  SGT.sight_colander = function (x, y) {
    bx(x - 2, y - 3, 4, 4, S2, S3);
    R(x - 9, y - 11, 3, 3, K); R(x + 7, y - 11, 3, 3, K); R(x - 8, y - 10, 1, 1, S3); R(x + 8, y - 10, 1, 1, S3);   // 손잡이
    circ(x, y - 9, 6, K); circ(x, y - 9, 5, S3); circ(x, y - 9, 4, '#c9d2dc');
    for (var i = -3; i <= 3; i += 2) for (var j = -3; j <= 3; j += 2) if (Math.abs(i) + Math.abs(j) < 6) R(x + i, y - 9 + j, 1, 1, K);
  };
  SGT.sight_golf = function (x, y) {
    bx(x - 4, y - 3, 8, 4, G2, G3);
    bx(x - 8, y - 12, 16, 10, WH, WH2, WH0); R(x - 7, y - 6, 14, 2, GR);
    bx(x + 6, y - 11, 4, 7, BK, G3); R(x + 8, y - 10, 1, 5, '#ff8a3c');               // 대물렌즈
    R(x - 6, y - 10, 6, 3, K); R(x - 5, y - 9, 1, 1, GR); R(x - 3, y - 9, 2, 1, GR);  // 표시창
    R(x - 2, y - 18, 1, 6, K); R(x - 1, y - 18, 4, 3, K); R(x - 1, y - 17, 3, 1, RD); // 깃발
  };
  SGT.sight_plumb = function (x, y) {
    var sw = Math.round(Math.sin(t() * 2) * 1.5);
    R(x - 6, y - 15, 3, 16, K); R(x - 5, y - 14, 1, 14, W3);                          // 기둥
    R(x - 6, y - 17, 12, 3, K); R(x - 5, y - 16, 10, 1, W3);                          // 가로대
    ln(x + 3, y - 14, x + 3 + sw, y - 9, '#d8d8d8', 1);                               // 줄
    R(x + 1 + sw, y - 9, 5, 4, K); R(x + 2 + sw, y - 8, 3, 2, BR3);                   // 추
    R(x + 2 + sw, y - 5, 3, 2, K); R(x + 3 + sw, y - 5, 1, 1, BR2); R(x + 3 + sw, y - 3, 1, 1, K);
  };
  SGT.sight_spyglass = function (x, y) {
    bx(x - 4, y - 3, 3, 4, W2, W3); bx(x + 4, y - 3, 3, 4, W2, W3);
    bx(x - 13, y - 8, 10, 5, BR2, BR3, BR1); R(x - 13, y - 7, 1, 3, '#3a2a08');
    bx(x - 5, y - 9, 10, 7, W2, W3, W1);
    bx(x + 3, y - 10, 10, 9, BR2, BR3, BR1); R(x + 11, y - 9, 1, 7, GLASS); R(x + 11, y - 8, 1, 2, WH2);
  };
  SGT.sight_ring = function (x, y) {
    bx(x - 4, y - 3, 8, 4, G2, G3);
    circ(x, y - 10, 7, K); circ(x, y - 10, 6, OL2); circ(x, y - 10, 5, K); circ(x, y - 10, 4, '#2c3a3a');
    R(x, y - 11, 1, 3, '#ff5040'); R(x - 1, y - 10, 3, 1, '#ff5040');
    R(x - 3, y - 13, 2, 1, '#6f8a8a');
  };
  SGT.sight_kaleido = function (x, y) {
    var cs = [RD, YE, GR, BL, PK, PU], k = (t() * 4) | 0, i;
    bx(x - 5, y - 3, 3, 4, G2, G3); bx(x + 2, y - 3, 3, 4, G2, G3);
    bx(x - 10, y - 10, 18, 8, PU, '#c08af0', '#5f3a8c');
    for (i = 0; i < 5; i++) R(x - 8 + i * 3, y - 8, 2, 3, cs[(i + k) % 6]);
    bx(x + 7, y - 11, 5, 10, YE, YE3);
    for (i = 0; i < 3; i++) R(x + 9, y - 9 + i * 2, 1, 2, cs[(i * 2 + k) % 6]);
  };
  SGT.sight_iris = function (x, y) {
    R(x - 1, y - 4, 2, 5, K); R(x - 9, y - 10, 19, 2, K);                              // 테
    bx(x - 11, y - 14, 8, 10, WH, WH2, WH0);                                           // 눈가리개
    circ(x + 4, y - 9, 5, K); circ(x + 4, y - 9, 4, S3); circ(x + 4, y - 9, 3, BK); circ(x + 4, y - 9, 1, '#9fe8ff');   // 조리개
    R(x + 9, y - 10, 3, 2, K);
  };
  SGT.sight_vane = function (x, y) {
    var f = Math.sin(t() * 1.2) >= 0;
    R(x - 1, y - 12, 2, 13, K); R(x - 4, y - 2, 8, 2, K);                              // 기둥과 받침
    R(x - 8, y - 11, 16, 1, K); R(f ? x + 6 : x - 8, y - 12, 2, 3, K); R(f ? x - 8 : x + 7, y - 13, 1, 5, K);   // 화살
    bx(x - 4, y - 17, 8, 5, RU2, RU3);                                                 // 몸통
    bx(f ? x + 2 : x - 6, y - 21, 4, 6, RU2, RU3);                                     // 머리
    R(f ? x + 3 : x - 5, y - 23, 2, 2, RD);                                            // 볏
    R(f ? x + 6 : x - 8, y - 19, 2, 1, YE);                                            // 부리
    R(f ? x - 6 : x + 4, y - 20, 2, 5, K); R(f ? x - 7 : x + 6, y - 21, 1, 3, K);      // 꼬리
  };
  SGT.sight_blaster = function (x, y) {
    var k = (t() * 6) | 0;
    bx(x - 8, y - 8, 16, 8, OR, '#ffb060', '#b05f14');
    bx(x - 6, y - 11, 6, 4, BL, BL3);
    R(x + 1, y - 6, 3, 3, K); R(x + 2, y - 5, 1, 1, k % 2 ? '#5a1010' : RD);
    R(x + 4, y - 6, 3, 3, K); R(x + 5, y - 5, 1, 1, k % 2 ? GR : '#1f5f1f');
    R(x - 6, y - 5, 5, 3, K); R(x - 5, y - 4, 3, 1, k % 3 ? CY : WH2);
    R(x + 4, y - 13, 1, 5, K); circ(x + 4, y - 14, 1, k % 2 ? RD : YE);
  };
  SGT.sight_compound = function (x, y) {
    var k = (t() * 3) | 0, i, j;
    bx(x - 4, y - 4, 8, 5, FL2, FL3, FL1);
    circ(x, y - 10, 7, K); circ(x, y - 10, 6, '#3a1a2a');
    for (i = -2; i <= 2; i++) for (j = -2; j <= 2; j++) if (i * i + j * j <= 5) R(x + i * 2 + (j & 1), y - 11 + j * 2, 1, 1, ((i + j + k + 30) % 3) ? '#c8402a' : '#ffb060');
    R(x - 4, y - 14, 2, 1, FL3);
  };
  SGT.sight_microscope = function (x, y) {
    bx(x - 7, y - 3, 14, 4, BK, G3);                                                   // 받침
    R(x + 3, y - 15, 3, 13, K); R(x + 4, y - 14, 1, 11, S3);                           // 기둥
    bx(x - 6, y - 7, 10, 3, S2, S3);                                                   // 재물대
    bx(x - 3, y - 17, 5, 8, WH, WH2, WH0);                                             // 경통
    bx(x - 2, y - 20, 3, 4, BK, G3); R(x - 2, y - 10, 3, 3, K); R(x - 1, y - 9, 1, 1, S3);   // 접안·대물렌즈
    R(x + 5, y - 12, 2, 3, K); R(x + 5, y - 11, 1, 1, S3); R(x - 2, y - 6, 2, 1, CY);  // 조절 나사·시료
  };
  SGT.sight_monocle = function (x, y) {
    var sw = Math.round(Math.sin(t() * 2.4));
    R(x - 1, y - 4, 3, 5, K); R(x, y - 3, 1, 3, BR2);
    circ(x, y - 10, 6, K); circ(x, y - 10, 5, BR3); circ(x, y - 10, 4, '#d8f4ff'); R(x - 2, y - 13, 2, 1, WH2); R(x - 3, y - 12, 1, 2, WH2);
    for (var i = 0; i < 6; i++) R(x + 6 + ((i + 1) >> 1) + (i > 2 ? sw : 0), y - 9 + i * 2, 1, 1, BR3);   // 금줄
  };
  SGT.sight_crystal = function (x, y) {
    var a = t() * 2;
    bx(x - 6, y - 4, 12, 5, RD2, RD, '#5e1410'); R(x - 4, y - 6, 8, 3, K); R(x - 3, y - 5, 6, 1, BR3);
    circ(x, y - 11, 6, K); circ(x, y - 11, 5, '#6a4ab8'); circ(x, y - 11, 4, '#9a7ae8');
    R(x - 3, y - 14, 2, 2, '#e8dcff');
    R(Math.round(x + Math.cos(a) * 3), Math.round(y - 11 + Math.sin(a) * 3), 1, 1, WH2);
    R(Math.round(x + Math.cos(a + 2.5) * 2), Math.round(y - 11 + Math.sin(a + 2.5) * 2), 1, 1, '#ffd0ff');
  };

  /* ═════════════ 부착물: 스포츠 ═════════════ */
  ACC.acc_sweatband = { w: 8, h: 9, d: function (x, y) {
    bx(x, y, 8, 9, WH, WH2, WH0); R(x + 1, y + 3, 6, 1, RD); R(x + 1, y + 5, 6, 1, BL);
    R(x + 2, y + 1, 1, 1, WH0); R(x + 5, y + 7, 1, 1, WH0);
  } };
  ACC.acc_whistle = { w: 11, h: 13, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 3));
    ln(x + 5, y, x + 4 + sw, y + 5, RD, 1);
    bx(x + 5 + sw, y + 5, 6, 4, S3, WH2);                                              // 취구
    circ(x + 3 + sw, y + 8, 4, K); circ(x + 3 + sw, y + 8, 3, S3); R(x + 2 + sw, y + 6, 2, 1, WH2); R(x + 3 + sw, y + 8, 2, 2, K);
  } };
  ACC.acc_stopwatch = { w: 11, h: 13, d: function (x, y) {
    var a = t() * 6 - 1.57;
    bx(x + 4, y, 3, 3, S2, S3); R(x + 1, y + 2, 2, 2, K);
    circ(x + 5, y + 7, 5, K); circ(x + 5, y + 7, 4, S3); circ(x + 5, y + 7, 3, WH2);
    ln(x + 5, y + 7, Math.round(x + 5 + Math.cos(a) * 2.6), Math.round(y + 7 + Math.sin(a) * 2.6), RD, 1); R(x + 5, y + 7, 1, 1, K);
  } };
  ACC.acc_shuttle = { w: 9, h: 11, d: function (x, y) {
    R(x, y, 9, 6, K); R(x + 1, y, 7, 1, WH2);
    R(x + 1, y + 1, 1, 4, WH); R(x + 3, y + 1, 1, 5, WH); R(x + 5, y + 1, 1, 5, WH); R(x + 7, y + 1, 1, 4, WH);    // 깃털
    R(x + 1, y + 5, 7, 3, K); R(x + 2, y + 5, 5, 2, '#e8e8e8');
    bx(x + 2, y + 7, 5, 4, '#d9b88a', '#f0d8b0'); R(x + 3, y + 8, 3, 1, RD);                                       // 코르크
  } };
  ACC.acc_jumprope = { w: 14, h: 11, d: function (x, y) {
    var d = Math.round(Math.sin(t() * 9) * 2);
    bx(x, y, 3, 6, RD, RD3); bx(x + 11, y, 3, 6, RD, RD3);
    ln(x + 1, y + 6, x + 4, y + 8 + d, YE, 1); ln(x + 4, y + 8 + d, x + 9, y + 8 + d, YE, 1); ln(x + 9, y + 8 + d, x + 12, y + 6, YE, 1);
  } };
  ACC.acc_bowlingpin = { w: 7, h: 15, d: function (x, y) {
    bx(x + 2, y, 3, 4, WH, WH2);                                                       // 머리
    R(x + 1, y + 3, 5, 4, K); R(x + 2, y + 3, 3, 4, WH); R(x + 2, y + 4, 3, 1, RD); R(x + 2, y + 6, 3, 1, RD);     // 목과 줄무늬
    bx(x, y + 7, 7, 8, WH, WH2, WH0);                                                  // 배
  } };
  ACC.acc_scoreboard = { w: 13, h: 10, d: function (x, y) {
    var n = ((t() / 3) | 0) % 6;
    bx(x, y, 13, 9, '#1f5a34', '#3a8a54'); R(x + 6, y + 1, 1, 7, WH);
    txt(String(n), x + 2, y + 2, WH2); txt(String((n + 3) % 6), x + 8, y + 2, YE);
    R(x + 2, y + 9, 2, 1, K); R(x + 9, y + 9, 2, 1, K);
  } };
  ACC.acc_medal = { w: 9, h: 15, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 2.2));
    R(x + 2, y, 5, 6, K); R(x + 3, y, 1, 5, BL); R(x + 4, y, 1, 5, WH2); R(x + 5, y, 1, 5, RD);
    circ(x + 4 + sw, y + 10, 4, K); circ(x + 4 + sw, y + 10, 3, BR3); circ(x + 4 + sw, y + 10, 2, BR2);
    R(x + 4 + sw, y + 9, 1, 3, BR3); R(x + 3 + sw, y + 9, 1, 1, BR3);
  } };

  /* ═════════════ 부착물: 농기구 ═════════════ */
  ACC.acc_strawhat = { w: 16, h: 7, d: function (x, y) {
    var st = '#e0c060', st3 = '#f4dc90', st1 = '#b8963a';
    bx(x + 4, y, 8, 5, st, st3, st1); R(x + 5, y + 3, 6, 1, RD);
    bx(x, y + 4, 16, 3, st, st3); R(x + 2, y + 5, 1, 1, st1); R(x + 7, y + 5, 1, 1, st1); R(x + 12, y + 5, 1, 1, st1);
  } };
  ACC.acc_hoe = { w: 13, h: 10, d: function (x, y) {
    bx(x, y + 3, 8, 4, W2, W3);                                                        // 자루
    R(x + 7, y + 1, 5, 4, K); R(x + 8, y + 2, 3, 2, S2);                               // 목
    R(x + 9, y + 3, 4, 7, K); R(x + 10, y + 4, 2, 4, S3); R(x + 10, y + 8, 1, 1, S2);  // 날
  } };
  ACC.acc_sickle = { w: 13, h: 12, d: function (x, y) {
    bx(x, y + 8, 7, 4, W2, W3);                                                        // 자루
    R(x + 5, y + 5, 3, 4, K); R(x + 6, y + 6, 1, 3, S2);
    R(x + 5, y, 7, 3, K); R(x + 10, y + 2, 3, 6, K); R(x + 4, y + 1, 3, 5, K);         // 초승달 날
    R(x + 6, y + 1, 5, 1, S3); R(x + 11, y + 3, 1, 4, S3); R(x + 5, y + 2, 1, 3, S3);
  } };
  ACC.acc_cowbell = { w: 9, h: 14, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 5));
    R(x + 3, y, 3, 4, K); R(x + 4, y, 1, 3, W3);
    bx(x + 1 + sw, y + 3, 7, 3, BR2, BR3); bx(x + sw, y + 5, 9, 6, BR2, BR3, BR1);
    R(x + 3 + sw * 2, y + 10, 3, 4, K); R(x + 4 + sw * 2, y + 11, 1, 2, S3);            // 추
  } };
  ACC.acc_scarecrow = { w: 11, h: 15, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 2.6)), st = '#e0c060';
    R(x + 5, y, 1, 2, K);
    R(x + 2 + sw, y + 3, 7, 1, K); R(x + 3 + sw, y + 1, 5, 2, K); R(x + 4 + sw, y + 1, 3, 1, st);                  // 모자
    bx(x + 3 + sw, y + 3, 5, 5, '#f0d8b0', '#fff0d0'); R(x + 4 + sw, y + 5, 1, 1, K); R(x + 6 + sw, y + 5, 1, 1, K); // 얼굴
    R(x + sw, y + 8, 11, 3, K); R(x + 1 + sw, y + 9, 9, 1, RD); R(x + sw, y + 9, 1, 1, st); R(x + 10 + sw, y + 9, 1, 1, st);   // 벌린 팔
    bx(x + 3 + sw, y + 10, 5, 5, BL, BL3);
  } };
  ACC.acc_fertilizer = { w: 10, h: 12, d: function (x, y) {
    R(x + 2, y, 6, 2, K); R(x + 3, y, 4, 1, '#d8d2c0');                                // 묶은 주둥이
    bx(x, y + 1, 10, 11, WH, WH2, WH0);
    R(x + 1, y + 4, 8, 5, GR); txt('N', x + 4, y + 4, WH2);
    R(x + 1, y + 10, 8, 1, RD);
  } };
  ACC.acc_makgeolli = { w: 14, h: 12, d: function (x, y) {
    var c2 = '#e8c040', c3 = '#fff0a0', c1 = '#b08a18';
    R(x + 2, y, 8, 2, K); R(x + 3, y, 6, 1, c1); R(x + 2, y + 1, 1, 3, K); R(x + 9, y + 1, 1, 3, K);               // 손잡이
    bx(x + 1, y + 3, 10, 9, c2, c3, c1); R(x + 5, y + 2, 3, 2, K); R(x + 6, y + 2, 1, 1, c3);                      // 몸통·뚜껑 꼭지
    R(x + 10, y + 5, 4, 3, K); R(x + 11, y + 6, 3, 1, c2);                                                          // 주둥이
    R(x + 3, y + 7, 2, 2, c1);                                                                                      // 찌그러진 자국
  } };
  ACC.acc_sprayer = { w: 15, h: 13, d: function (x, y) {
    var k = (t() * 8) | 0;
    bx(x + 2, y, 4, 3, WH, WH2);
    bx(x, y + 2, 8, 11, '#3f9a4a', '#7fd08a', '#256a30'); R(x + 2, y + 6, 4, 3, YE); R(x + 3, y + 7, 2, 1, K);
    R(x + 7, y + 9, 4, 2, K); R(x + 10, y + 5, 2, 5, K); R(x + 10, y + 4, 5, 2, K); R(x + 11, y + 4, 3, 1, S3);     // 호스와 노즐
    R(x + 15, y + 3 + (k % 3), 1, 1, '#b6ff3c'); R(x + 16, y + 5 - (k % 2), 1, 1, '#b6ff3c');
  } };
  ACC.acc_rooster = { w: 13, h: 13, d: function (x, y) {
    var b = Math.sin(t() * 4) > 0.5 ? 1 : 0;
    R(x, y + 2, 4, 8, K); R(x + 1, y + 3, 2, 6, '#2a6a4a'); R(x + 1, y + 3, 1, 2, '#3f9a6a');                        // 꼬리
    bx(x + 2, y + 5, 8, 6, WH, WH2, WH0);                                                                           // 몸
    bx(x + 7, y + 1 + b, 5, 6, WH, WH2);                                                                            // 머리
    R(x + 8, y - 1 + b, 3, 2, RD); R(x + 12, y + 3 + b, 2, 1, YE); R(x + 10, y + 3 + b, 1, 1, K); R(x + 10, y + 6 + b, 1, 2, RD);   // 볏·부리·눈·턱볏
    R(x + 4, y + 11, 1, 2, YE); R(x + 7, y + 11, 1, 2, YE);                                                          // 다리
  } };

  /* ═════════════ 부착물: 완구 ═════════════ */
  ACC.acc_top = { w: 9, h: 11, d: function (x, y) {
    var k = (t() * 10) | 0;
    R(x + 4, y, 1, 3, K);
    bx(x, y + 2, 9, 4, RD, RD3, RD2); R(x + 1 + (k % 3) * 2, y + 3, 2, 2, YE);
    R(x + 1, y + 5, 7, 2, K); R(x + 2, y + 5, 5, 1, BL); R(x + 2, y + 7, 5, 2, K); R(x + 3, y + 7, 3, 1, BL); R(x + 4, y + 9, 1, 2, K);
  } };
  ACC.acc_yoyo = { w: 9, h: 16, s: 1, d: function (x, y) {
    var d = Math.round((Math.sin(t() * 4) + 1) * 2.5);
    R(x + 4, y, 1, 4 + d, WH);
    circ(x + 4, y + 7 + d, 4, K); circ(x + 4, y + 7 + d, 3, BL); circ(x + 4, y + 7 + d, 1, YE); R(x + 2, y + 5 + d, 2, 1, '#9fd0ff');
  } };
  ACC.acc_capgun = { w: 12, h: 9, d: function (x, y) {
    circ(x + 4, y + 4, 4, K); circ(x + 4, y + 4, 3, RD); circ(x + 4, y + 4, 1, '#f0d8b0');
    R(x + 3, y + 2, 1, 1, K); R(x + 6, y + 4, 1, 1, K); R(x + 2, y + 5, 1, 1, K);
    bx(x + 6, y + 6, 6, 3, RD, RD3); R(x + 8, y + 7, 1, 1, K); R(x + 10, y + 7, 1, 1, K);                            // 풀려나온 화약 종이
  } };
  ACC.acc_slime = { w: 9, h: 14, d: function (x, y) {
    var d = ((t() * 3) | 0) % 4;
    bx(x, y, 9, 3, PK, '#ffb0d8');
    bx(x + 1, y + 2, 7, 8, '#d8f8e0', WH2); R(x + 2, y + 5, 5, 4, '#6fe04a'); R(x + 3, y + 4, 2, 1, '#6fe04a'); R(x + 3, y + 6, 1, 1, WH2);
    R(x + 6, y + 10, 2, 1 + d, '#6fe04a');                                                                          // 흘러내리는 덩어리
  } };
  ACC.acc_blocks = { w: 12, h: 10, d: function (x, y) {
    R(x + 1, y, 2, 3, K); R(x + 5, y, 2, 3, K); R(x + 1, y + 1, 2, 1, RD3); R(x + 5, y + 1, 2, 1, RD3);
    bx(x, y + 2, 8, 4, RD, RD3, RD2);
    R(x + 5, y + 4, 2, 3, K); R(x + 9, y + 4, 2, 3, K); R(x + 5, y + 5, 2, 1, YE3); R(x + 9, y + 5, 2, 1, YE3);
    bx(x + 4, y + 6, 8, 4, YE, YE3, YE1);
  } };
  ACC.acc_teddy = { w: 11, h: 13, d: function (x, y) {
    var b1 = '#8a5a34', b2 = '#b07a4a', b3 = '#d8a878';
    bx(x, y, 4, 4, b2, b3); bx(x + 7, y, 4, 4, b2, b3);                                                             // 귀
    bx(x + 1, y + 1, 9, 7, b2, b3, b1); R(x + 3, y + 4, 1, 1, K); R(x + 7, y + 4, 1, 1, K); R(x + 4, y + 5, 3, 2, b3); R(x + 5, y + 5, 1, 1, K);   // 얼굴
    bx(x + 2, y + 7, 7, 6, b2, b3, b1); R(x + 4, y + 9, 3, 2, b3);                                                  // 몸
    bx(x, y + 8, 3, 3, b2, b3); bx(x + 8, y + 8, 3, 3, b2, b3);                                                     // 팔
  } };
  ACC.acc_robot = { w: 11, h: 14, d: function (x, y) {
    var k = (t() * 5) | 0;
    R(x + 5, y, 1, 2, K); R(x + 4, y - 1, 3, 1, k % 2 ? YE : RD);                                                    // 안테나
    bx(x + 2, y + 2, 7, 5, S3, WH2, S2); R(x + 3, y + 4, 2, 1, k % 4 === 3 ? K : CY); R(x + 6, y + 4, 2, 1, k % 4 === 3 ? K : CY);
    bx(x + 1, y + 6, 9, 6, BL, BL3, BL1); R(x + 3, y + 8, 2, 2, RD); R(x + 6, y + 8, 2, 2, YE);
    R(x + 2, y + 12, 2, 2, K); R(x + 7, y + 12, 2, 2, K);
    R(x - 2, y + 8, 3, 1, K); R(x - 3, y + 7 + (k % 2), 1, 2, BR3);                                                  // 태엽
  } };
  ACC.acc_rc = { w: 14, h: 12, d: function (x, y) {
    var k = (t() * 4) | 0;
    ln(x + 11, y + 5, x + 13, y, K, 1); R(x + 13, y - 1, 1, 1, RD);                                                  // 안테나
    bx(x, y + 5, 14, 7, S2, S3, S1);
    circ(x + 3, y + 8, 2, K); R(x + 3 + (k % 2 ? 1 : -1), y + 7, 1, 2, RD);
    circ(x + 10, y + 8, 2, K); R(x + 10, y + 7 + (k % 3 ? 0 : 1), 1, 2, YE);
    R(x + 6, y + 7, 2, 1, k % 2 ? '#1f5f1f' : GR);
  } };
  ACC.acc_ttakji = { w: 10, h: 10, s: 2, d: function (x, y) {
    bx(x, y, 10, 10, RD, RD3);
    for (var i = 0; i < 4; i++) { R(x + 1 + i, y + 1 + i, 8 - i * 2, 1, BL); R(x + 1 + i, y + 8 - i, 8 - i * 2, 1, BL); }
    ln(x + 1, y + 1, x + 8, y + 8, K, 1); ln(x + 8, y + 1, x + 1, y + 8, K, 1);
    if (((t() * 3) | 0) % 3 === 1) { R(x + 10, y - 2, 1, 3, YE); R(x + 9, y - 1, 3, 1, YE); }                        // 번쩍
  } };

  /* ═════════════ 부착물: 그 밖 ═════════════ */
  ACC.acc_ducttape = { w: 10, h: 10, d: function (x, y) {
    circ(x + 4, y + 5, 4, K); circ(x + 4, y + 5, 3, '#2f8f80'); circ(x + 4, y + 5, 1, '#d8c8a0'); R(x + 2, y + 3, 2, 1, '#6fd0c0');
    bx(x + 6, y + 6, 4, 4, '#2f8f80', '#6fd0c0');                                                                   // 풀린 끝
  } };
  ACC.acc_memo = { w: 9, h: 9, s: 2, d: function (x, y) {
    bx(x, y, 9, 9, '#ffe95a', '#fff8b0'); R(x + 2, y + 3, 5, 1, K); R(x + 2, y + 5, 4, 1, K); R(x + 6, y + 6, 2, 2, '#d8b830');
  } };
  ACC.acc_earplug = { w: 10, h: 12, s: 1, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 2.8));
    ln(x + 4, y, x + 1 + sw, y + 6, BL, 1); ln(x + 5, y, x + 8 + sw, y + 6, BL, 1);
    bx(x + sw, y + 6, 4, 6, OR, '#ffb060'); bx(x + 6 + sw, y + 6, 4, 6, OR, '#ffb060');
  } };
  ACC.acc_mixcoffee = { w: 6, h: 14, d: function (x, y) {
    var s = ((t() * 2) | 0) % 2;
    bx(x, y, 6, 14, YE, YE3, YE1); R(x + 1, y + 1, 4, 3, RD); R(x + 1, y + 9, 4, 3, '#7a4a24'); R(x + 2, y + 5, 2, 3, WH2);
    R(x + 1 + s * 2, y - 2, 1, 2, '#e8e8e8');                                                                        // 김
  } };
  ACC.acc_metronome = { w: 11, h: 14, d: function (x, y) {
    var sw = Math.round(Math.sin(t() * 6) * 3), i, hw;
    for (i = 0; i < 12; i++) { hw = 1 + ((i * 4 / 12) | 0); R(x + 4 - hw, y + i, hw * 2 + 3, 1, K); }
    for (i = 1; i < 12; i++) { hw = 1 + ((i * 4 / 12) | 0); R(x + 5 - hw, y + i, hw * 2 + 1, 1, i < 3 ? W3 : W2); }
    R(x, y + 12, 11, 2, K); R(x + 1, y + 12, 9, 1, W1);
    ln(x + 5, y + 11, x + 5 + sw, y + 2, S3, 1); R(x + 4 + Math.round(sw * 0.6), y + 5, 3, 2, BR3);                  // 추
  } };
  ACC.acc_shredder = { w: 12, h: 13, d: function (x, y) {
    var k = ((t() * 6) | 0) % 3, i;
    bx(x + 3, y - 1 + k, 6, 4, WH, WH2); R(x + 4, y + k, 3, 1, '#8a8a8a');                                           // 들어가는 문서
    bx(x, y + 2, 12, 6, G3, S2, G1); R(x + 2, y + 3, 8, 1, K); R(x + 9, y + 5, 2, 1, GR);
    for (i = 0; i < 4; i++) R(x + 2 + i * 2, y + 8, 1, 3 + ((i + k) % 3), WH);                                       // 잘려 나온 종이
  } };
  ACC.acc_thirdhand = { w: 14, h: 10, d: function (x, y) {
    var w = Math.round(Math.sin(t() * 5)), sk = '#e8b898', sk3 = '#f8d8c0', sk1 = '#b88868';
    bx(x, y + 2, 7, 6, FL2, FL3, FL1); R(x + 2, y + 5, 2, 1, FL1);                                                   // 팔뚝
    R(x + 7, y - 1, 3, 3, K); R(x + 8, y, 1, 2, sk);                                                                 // 엄지
    bx(x + 6, y + 1, 5, 8, sk, sk3, sk1);                                                                            // 손바닥
    R(x + 10, y + 1, 4 + (w > 0 ? 1 : 0), 2, K); R(x + 10, y + 1, 3 + (w > 0 ? 1 : 0), 1, sk);                       // 손가락 셋
    R(x + 10, y + 4, 4 + (w < 0 ? 1 : 0), 2, K); R(x + 10, y + 4, 3 + (w < 0 ? 1 : 0), 1, sk);
    R(x + 10, y + 7, 4, 2, K); R(x + 10, y + 7, 3, 1, sk);
  } };
  ACC.acc_redbutton = { w: 12, h: 10, d: function (x, y) {
    var p = ((t() * 3) | 0) % 2, i;
    bx(x, y + 5, 12, 5, YE, YE3); for (i = 0; i < 4; i++) R(x + 1 + i * 3, y + 7, 2, 2, K);                          // 경고 줄무늬 받침
    R(x + 2, y + 1 + p, 8, 5 - p, K); R(x + 3, y + 2 + p, 6, 3 - p, p ? RD2 : RD); R(x + 4, y + 2 + p, 2, 1, RD3);   // 눌리는 버튼
  } };

  X.clearCache();
})();
