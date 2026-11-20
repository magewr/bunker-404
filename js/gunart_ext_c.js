// BUNKER 404 — 총기 그림 확장 C: 새 총열 24종 + 총구 22종 (data_parts_c.js 와 짝)
// 총열: { len, th, d(x, y, o) } — (x,y) = 장착점(총강 중심), +x 로 len 만큼.
// 총구: { len, f(총구 화염 종류), d(x, y, o) } — (x,y) = 총열 끝.
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext;
  if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, tube = X.tube, P = X.pal, K = P.K;
  var BAR = X.BAR, MUZ = X.MUZ;
  function now() { return X.time() || 0; }

  /* ───────────── 총열 ───────────── */
  // 빗물 홈통: 네모난 함석 홈통
  BAR.barrel_drain = { len: 28, th: 6, d: function (x, y) {
    bx(x, y - 4, 28, 8, '#b9c2c8', '#e3eaee', '#7f8a91');
    R(x + 8, y - 3, 1, 6, '#7f8a91'); R(x + 18, y - 3, 1, 6, '#7f8a91');
    bx(x + 11, y - 5, 3, 10, P.S1, P.S2);
    R(x + 21, y + 1, 3, 1, '#6fae3a'); R(x + 22, y + 2, 1, 1, '#6fae3a'); R(x + 4, y - 2, 2, 1, P.RU2);
    R(x + 27, y - 2, 1, 5, '#000');
  } };
  // 대나무 통
  BAR.barrel_bamboo = { len: 30, th: 4, d: function (x, y) {
    var b1 = '#4f7a2a', b2 = '#7fae3c', b3 = '#b8d86a', i;
    tube(x, y, 30, 4, b2, b3, b1);
    for (i = 0; i < 3; i++) { R(x + 7 + i * 8, y - 2, 1, 4, b1); R(x + 8 + i * 8, y - 2, 1, 4, b3); }
    R(x + 15, y - 5, 3, 2, K); R(x + 16, y - 5, 2, 1, b3); R(x + 18, y - 6, 3, 2, K); R(x + 18, y - 6, 2, 1, b2);
    R(x + 29, y - 1, 1, 3, '#000');
  } };
  // 괭이 자루: 끝에 괭이 날이 아래로 달려 있다
  BAR.barrel_hoe = { len: 30, th: 3, d: function (x, y) {
    tube(x, y, 30, 3, P.W2, P.W3, P.W1);
    R(x + 6, y, 4, 1, P.W1); R(x + 15, y - 1, 3, 1, P.W1);
    bx(x + 23, y - 3, 6, 6, P.S1, P.S2);
    bx(x + 24, y + 2, 5, 8, P.S2, P.S3, P.S1); R(x + 25, y + 7, 3, 1, P.RU2);
    R(x + 29, y - 1, 1, 2, '#000');
  } };
  // 물총 총열: 반투명 플라스틱 + 주황 끝
  BAR.barrel_waterpistol = { len: 22, th: 4, d: function (x, y) {
    var w1 = '#1f8fa8', w2 = '#3fd0e8', w3 = '#b0f4ff';
    tube(x, y, 22, 4, w2, w3, w1);
    R(x + 3, y, 12, 2, '#2a6fd8'); R(x + 4, y, 3, 1, '#9fd0ff');
    bx(x + 8, y - 4, 3, 8, P.YE, '#fff0a0');
    bx(x + 18, y - 3, 4, 6, P.OR, '#ffc080'); R(x + 21, y - 1, 1, 2, '#000');
  } };
  // 수영 누들: 굵은 스펀지 봉
  BAR.barrel_poolnoodle = { len: 34, th: 8, d: function (x, y) {
    var n1 = '#c23a7a', n2 = '#ff6fb5', n3 = '#ffb0d8', i;
    bx(x, y - 5, 34, 10, n2, n3, n1);
    for (i = 0; i < 5; i++) R(x + 5 + i * 6, y - 1 + (i % 2), 2, 1, n1);
    bx(x, y - 5, 4, 10, P.TP1, P.TP2);
    R(x + 33, y - 2, 1, 4, '#3a1024');
  } };
  // 청소기 호스: 주름관 + 흡입구
  BAR.barrel_vacuum = { len: 32, th: 5, d: function (x, y) {
    var i;
    R(x + 3, y - 4, 24, 9, K);
    for (i = 0; i < 24; i++) R(x + 3 + i, y - 3, 1, 7, i % 2 ? '#5a5f68' : '#8a9099');
    R(x + 3, y - 3, 24, 1, '#b0b6c0');
    bx(x, y - 4, 4, 9, P.G2, P.G3);
    bx(x + 26, y - 3, 3, 7, P.RD, '#ff8a80');
    bx(x + 28, y - 5, 4, 11, P.G2, P.G3, P.G1); R(x + 31, y - 3, 1, 7, '#000');
  } };
  // 골프채 샤프트: 그립 + 가는 샤프트 + 아이언 헤드
  BAR.barrel_golf = { len: 40, th: 2, d: function (x, y) {
    var i;
    tube(x, y, 35, 2, P.S3, P.WH, P.S2);
    bx(x, y - 3, 9, 6, P.BK, P.G3);
    for (i = 0; i < 3; i++) R(x + 2 + i * 2, y - 1, 1, 3, P.G2);
    bx(x + 33, y - 2, 7, 4, P.S2, P.S3);
    bx(x + 35, y + 1, 5, 7, P.S2, P.S3, P.S1); R(x + 36, y + 3, 3, 1, P.S1); R(x + 36, y + 5, 3, 1, P.S1);
    R(x + 39, y - 1, 1, 2, '#000');
  } };
  // 낚싯대: 코르크 손잡이, 릴, 가이드 고리, 줄과 찌
  BAR.barrel_fishing = { len: 46, th: 2, d: function (x, y) {
    var i, bob = Math.round(Math.sin(now() * 3) * 1);
    tube(x, y, 46, 2, '#2a2a30', '#5a5a66');
    bx(x, y - 3, 8, 6, '#c9a05a', '#e8c88a');
    bx(x + 3, y + 2, 5, 5, P.S2, P.S3); R(x + 5, y + 4, 1, 1, P.RD);
    for (i = 0; i < 4; i++) { R(x + 12 + i * 9, y - 5, 3, 1, P.S3); R(x + 13 + i * 9, y - 4, 1, 3, P.S3); }
    R(x + 45, y + 2, 1, 5 + bob, P.WH);
    circ(x + 45, y + 8 + bob, 1, P.RD); R(x + 45, y + 7 + bob, 1, 1, P.WH);
  } };
  // 농약 분무기 대: 놋쇠 대롱 + 세 갈래 노즐
  BAR.barrel_sprayer = { len: 34, th: 2, d: function (x, y) {
    var i;
    tube(x, y, 30, 2, P.BR2, P.BR3, P.BR1);
    bx(x, y - 3, 6, 6, P.GR, '#9fe08a');
    R(x + 2, y + 3, 3, 4, K); R(x + 3, y + 3, 1, 3, P.YE);
    bx(x + 28, y - 5, 3, 10, P.BR2, P.BR3);
    for (i = 0; i < 3; i++) { R(x + 30, y - 5 + i * 4, 4, 2, K); R(x + 30, y - 5 + i * 4, 3, 1, P.BR3); }
    R(x + 35, y - 4 + (((now() * 6) | 0) % 3) * 4, 1, 1, '#b6ff3c');
  } };
  // 장난감 망원경: 3단으로 굵어지는 알록달록 통
  BAR.barrel_telescope = { len: 30, th: 5, d: function (x, y) {
    bx(x, y - 2, 11, 5, P.YE, '#fff0a0', '#a88a10');
    bx(x + 9, y - 3, 11, 7, P.RD, '#ff8a80', P.RD2);
    bx(x + 18, y - 4, 12, 9, P.BL, '#8fc4ff', '#28609c');
    R(x + 20, y - 3, 1, 7, P.WH);
    R(x + 29, y - 3, 1, 7, '#bfeaff'); R(x + 29, y - 2, 1, 2, P.WH);
  } };
  // 사흘 묵은 바게트
  BAR.barrel_baguette = { len: 36, th: 6, d: function (x, y) {
    var g1 = '#8a5a22', g2 = '#d9a04a', g3 = '#f3cf8a', i;
    R(x, y - 2, 36, 5, K);
    bx(x + 1, y - 4, 34, 8, g2, g3, g1);
    R(x + 1, y - 1, 1, 3, g2); R(x + 34, y - 1, 1, 3, g2);
    for (i = 0; i < 5; i++) { R(x + 5 + i * 6, y - 3, 3, 1, '#fff0c8'); R(x + 6 + i * 6, y - 2, 3, 1, '#fff0c8'); R(x + 7 + i * 6, y - 1, 2, 1, g1); }
    R(x + 35, y - 1, 1, 2, '#000');
  } };
  // 삼연장 총열
  BAR.barrel_triple = { len: 30, th: 11, d: function (x, y) {
    bx(x, y - 7, 30, 5, P.G3, P.S2, P.G2); bx(x, y - 3, 30, 5, P.G3, P.S2, P.G2); bx(x, y + 1, 30, 5, P.G3, P.S2, P.G2);
    R(x + 29, y - 6, 1, 3, '#000'); R(x + 29, y - 2, 1, 3, '#000'); R(x + 29, y + 2, 1, 3, '#000');
    bx(x + 9, y - 7, 3, 13, P.S1, P.S2); bx(x + 21, y - 7, 3, 13, P.S1, P.S2);
    R(x + 26, y - 8, 2, 1, P.BR3);
  } };
  // 경기용 플루트 총열: 홈이 파인 가늘고 긴 총열 + 파란 캡
  BAR.barrel_fluted = { len: 42, th: 4, d: function (x, y) {
    var i;
    tube(x, y, 42, 4, P.S2, P.S3, P.S1);
    for (i = 0; i < 4; i++) { R(x + 6 + i * 8, y - 1, 6, 1, P.G1); R(x + 6 + i * 8, y + 1, 6, 1, P.G1); }
    bx(x, y - 4, 5, 8, P.G2, P.G3);
    bx(x + 38, y - 4, 4, 8, P.BL, '#8fc4ff', '#28609c'); R(x + 41, y - 1, 1, 2, '#000');
  } };
  // 파이프 오르간 관: 길이가 다른 주석 파이프 세 개
  BAR.barrel_organ = { len: 34, th: 11, d: function (x, y) {
    var p1 = '#7f8894', p2 = '#b9c2cc', p3 = '#e8eef4';
    bx(x, y - 7, 27, 5, p2, p3, p1); bx(x, y - 3, 34, 6, p2, p3, p1); bx(x, y + 2, 21, 5, p2, p3, p1);
    R(x + 5, y - 6, 2, 3, K); R(x + 5, y - 2, 2, 4, K); R(x + 5, y + 3, 2, 3, K);
    R(x + 26, y - 6, 1, 3, '#000'); R(x + 33, y - 2, 1, 4, '#000'); R(x + 20, y + 3, 1, 3, '#000');
    bx(x + 10, y - 8, 3, 16, P.W1, P.W2);
  } };
  // 촉수 총열: 꿈틀대는 보라색 촉수 + 빨판
  BAR.barrel_tentacle = { len: 32, th: 5, d: function (x, y) {
    var t1 = '#4f2468', t2 = '#8a4fb0', t3 = '#c08ae0', T = now(), i, w;
    for (i = 3; i < 29; i++) { w = Math.round(Math.sin(i * 0.45 + T * 2.5) * 1.5); R(x + i, y - 3 + w, 1, 7, K); }
    for (i = 3; i < 29; i++) {
      w = Math.round(Math.sin(i * 0.45 + T * 2.5) * 1.5);
      R(x + i, y - 2 + w, 1, 5, t2); R(x + i, y - 2 + w, 1, 1, t3);
      if (i % 4 === 0) R(x + i, y + 2 + w, 1, 1, '#ffb0d8');
    }
    bx(x, y - 4, 4, 8, t1, t2);
    bx(x + 28, y - 3, 4, 6, t2, t3, t1); R(x + 31, y - 1, 1, 2, '#200818');
  } };
  // 스펀지 다트 총열: 주황·파랑 장난감 총열, 다트 끝이 삐죽
  BAR.barrel_dart = { len: 24, th: 6, d: function (x, y) {
    bx(x, y - 4, 22, 8, P.OR, '#ffc080', '#a8540c');
    bx(x + 4, y - 5, 4, 10, P.BL, '#8fc4ff'); bx(x + 14, y - 5, 4, 10, P.BL, '#8fc4ff');
    R(x + 9, y - 2, 4, 1, P.WH);
    R(x + 21, y - 2, 3, 4, K); R(x + 21, y - 1, 2, 2, '#3fd0e8'); R(x + 23, y - 1, 1, 2, P.OR);
  } };
  // 라바콘: 옆으로 누운 주황 꼬깔 (바닥판이 앞)
  BAR.barrel_cone = { len: 26, th: 8, d: function (x, y) {
    var i, h;
    for (i = 0; i < 22; i++) { h = 3 + Math.floor(i * 0.42); R(x + i, y - h - 1, 1, h * 2 + 2, K); }
    for (i = 0; i < 22; i++) {
      h = 3 + Math.floor(i * 0.42);
      R(x + i, y - h, 1, h * 2, (i >= 7 && i < 11) || (i >= 15 && i < 18) ? P.WH : P.OR);
      R(x + i, y - h, 1, 1, (i >= 7 && i < 11) || (i >= 15 && i < 18) ? '#fff' : '#ffc080');
    }
    bx(x + 21, y - 13, 5, 26, '#2a2a2e', P.G3);
    R(x + 25, y - 2, 1, 4, '#000');
  } };
  // 전자기 레일: 위아래 레일 사이로 전류가 흐른다
  BAR.barrel_rail = { len: 40, th: 8, d: function (x, y) {
    var i, k = ((now() * 14) | 0) % 10;
    bx(x, y - 5, 40, 4, P.TE2, P.TE3, P.TE1); bx(x, y + 1, 40, 4, P.TE2, P.TE3, P.TE1);
    R(x + 1, y - 2, 38, 4, '#0e2a38');
    for (i = 0; i < 4; i++) R(x + 2 + ((k + i * 10) % 35), y - 1, 3, 2, i % 2 ? P.CY : P.CY2);
    for (i = 0; i < 4; i++) bx(x + 4 + i * 10, y - 6, 3, 12, P.CU, P.CU2);
    R(x + 39, y - 1, 1, 2, P.CY2);
  } };
  // 콤바인 탈곡통: 빨간 통 속에서 살이 돈다
  BAR.barrel_harvester = { len: 28, th: 10, d: function (x, y, o) {
    var sp = (o && o.spin) || now() * 2, s = ((sp * 3) | 0) % 3, r, i;
    if (s < 0) s += 3;
    bx(x, y - 6, 28, 12, '#b8322a', '#e8605a', '#7a1c18');
    for (r = 0; r < 3; r++) {
      R(x + 3, y - 4 + r * 3, 22, 2, r === s ? P.YE : (r === (s + 1) % 3 ? '#c49a2c' : '#7d5f18'));
      for (i = 0; i < 6; i++) R(x + 4 + i * 4, y - 4 + r * 3, 1, 1, P.S3);
    }
    bx(x, y - 7, 3, 14, P.G2, P.G3); bx(x + 24, y - 7, 4, 14, P.G2, P.G3);
    R(x + 27, y - 1, 1, 2, '#000');
  } };
  // 변이 모기 주둥이: 살점 뿌리에서 뻗은 길고 가는 침
  BAR.barrel_proboscis = { len: 44, th: 2, d: function (x, y) {
    bx(x, y - 4, 7, 8, P.FL2, P.FL3, P.FL1); R(x + 2, y - 2, 2, 2, '#ffd0e0');
    tube(x + 6, y, 22, 3, '#3a2a30', '#6a5560');
    R(x + 12, y - 1, 1, 3, '#1a1014'); R(x + 20, y - 1, 1, 3, '#1a1014');
    R(x + 27, y - 1, 12, 3, K); R(x + 27, y, 12, 1, '#6a5560');
    R(x + 38, y - 1, 5, 2, K); R(x + 38, y, 5, 1, '#8a7580');
    R(x + 43, y, 1, 1 + (((now() * 2) | 0) % 2), P.RD);
  } };
  // 투창: 끈 감은 손잡이 + 뾰족한 창끝
  BAR.barrel_javelin = { len: 50, th: 2, d: function (x, y) {
    var i;
    tube(x, y, 40, 2, '#c8ccd4', P.WH, P.S2);
    bx(x + 14, y - 3, 10, 6, P.WH, '#ffffff', '#b0b0b0');
    for (i = 0; i < 4; i++) R(x + 16 + i * 2, y - 2, 1, 4, P.BL);
    R(x + 39, y - 3, 4, 6, K); R(x + 39, y - 2, 4, 4, P.S3);
    R(x + 43, y - 2, 4, 4, K); R(x + 43, y - 1, 3, 2, P.S3);
    R(x + 47, y - 1, 3, 2, K); R(x + 47, y, 2, 1, P.WH);
  } };
  // 만화경: 알록달록 통 + 돌아가는 색 조각
  BAR.barrel_kaleido = { len: 26, th: 6, d: function (x, y) {
    var cs = [P.RD, P.YE, P.GR, P.BL, P.PK], k = (now() * 4) | 0, i;
    bx(x, y - 4, 26, 8, P.PU, '#c8a0f0', '#5a2f8a');
    for (i = 0; i < 7; i++) R(x + 3 + i * 3, y - 2 + ((i + k) % 3) * 2, 2, 2, cs[(i + k) % 5]);
    bx(x + 22, y - 5, 4, 10, P.BR2, P.BR3, P.BR1);
    R(x + 25, y - 3, 1, 2, cs[k % 5]); R(x + 25, y - 1, 1, 2, cs[(k + 2) % 5]); R(x + 25, y + 1, 1, 2, cs[(k + 4) % 5]);
  } };
  // 범종 포신: 옆으로 누운 청동 종 (용뉴 고리, 띠, 당좌)
  BAR.barrel_templebell = { len: 28, th: 12, d: function (x, y) {
    var b1 = '#3f5a4a', b2 = '#6f9a7a', b3 = '#a8d0b0', i, h;
    bx(x, y - 3, 6, 6, P.BR2, P.BR3, P.BR1);
    for (i = 0; i < 22; i++) { h = 6 + Math.min(4, Math.floor(i / 5)); R(x + 4 + i, y - h - 1, 1, h * 2 + 2, K); }
    for (i = 0; i < 21; i++) {
      h = 6 + Math.min(4, Math.floor(i / 5));
      R(x + 5 + i, y - h, 1, h * 2, b2); R(x + 5 + i, y - h, 1, 1, b3); R(x + 5 + i, y + h - 1, 1, 1, b1);
    }
    R(x + 8, y - 5, 1, 11, b1); R(x + 22, y - 9, 1, 19, b1);
    circ(x + 15, y, 2, P.BR2); R(x + 15, y, 1, 1, P.BR3);
    for (i = 0; i < 3; i++) { R(x + 11 + i * 2, y - 5, 1, 1, P.BR3); R(x + 11 + i * 2, y + 4, 1, 1, P.BR3); }
    bx(x + 25, y - 11, 3, 22, b1, b2); R(x + 27, y - 7, 1, 14, '#0a1410');
  } };
  // 중력 렌즈 포신: 고리 렌즈 네 개와 가운데 특이점
  BAR.barrel_lens = { len: 38, th: 5, d: function (x, y) {
    var i, k = (now() * 6) | 0;
    tube(x, y, 38, 4, P.TE2, P.TE3, P.TE1);
    for (i = 0; i < 4; i++) { bx(x + 4 + i * 9, y - 6, 3, 12, '#2a1848', P.PU); R(x + 5 + i * 9, y - 4 + ((k + i) % 4) * 2, 1, 2, P.CY2); }
    circ(x + 20, y, 2, '#000'); R(x + 18, y - 3, 5, 1, P.PU); R(x + 18, y + 3, 5, 1, P.PU);
    R(x + 37, y - 1, 1, 2, P.CY);
  } };

  /* ───────────── 총구 ───────────── */
  // 호루라기
  MUZ.muz_whistle = { len: 9, f: 'small', d: function (x, y) {
    bx(x, y - 2, 5, 5, P.S3, P.WH);
    circ(x + 7, y + 1, 4, K); circ(x + 7, y + 1, 3, P.S3); R(x + 5, y - 1, 2, 1, P.WH);
    R(x + 7, y - 3, 2, 2, K);
    R(x + 9, y + 5, 1, 3, P.RD); R(x + 8, y + 7, 1, 2, P.RD);
  } };
  // 낫 총검: 총열 밑에 묶은 낫
  MUZ.muz_sickle = { len: 0, d: function (x, y) {
    R(x - 9, y + 2, 12, 4, K); R(x - 8, y + 3, 10, 2, P.W2); R(x - 8, y + 3, 10, 1, P.W3);
    bx(x - 6, y - 3, 4, 9, P.TP1, P.TP2);
    R(x + 2, y + 1, 9, 3, K); R(x + 2, y + 2, 8, 1, P.S3);
    R(x + 9, y + 2, 3, 6, K); R(x + 10, y + 3, 1, 4, P.S3);
    R(x + 6, y + 7, 5, 2, K); R(x + 7, y + 7, 3, 1, P.WH);
  } };
  // 파티 피리: 줄무늬 종이 대롱, 끝이 말려 있다
  MUZ.muz_partyhorn = { len: 12, f: 'star', d: function (x, y) {
    var i;
    bx(x, y - 2, 4, 5, P.YE, '#fff0a0');
    R(x + 3, y - 2, 9, 5, K);
    for (i = 0; i < 9; i++) R(x + 3 + i, y - 1, 1, 3, i % 2 ? P.PK : P.CY);
    R(x + 10, y - 7, 5, 6, K); R(x + 11, y - 6, 3, 4, P.PK); R(x + 12, y - 5, 1, 2, P.CY);
  } };
  // 페트병 소음기
  MUZ.muz_petbottle = { len: 16, f: 'none', d: function (x, y) {
    bx(x, y - 2, 4, 5, '#9fd8e8', '#dff6fc');
    bx(x + 1, y - 3, 3, 7, P.TP1, P.TP2);
    bx(x + 3, y - 5, 13, 10, '#9fd8e8', '#dff6fc', '#5fa8c0');
    R(x + 7, y - 4, 5, 8, P.BL); R(x + 8, y - 2, 3, 1, P.WH); R(x + 8, y, 3, 1, P.WH);
    R(x + 14, y - 3, 1, 6, '#5fa8c0'); R(x + 15, y - 1, 1, 2, '#000');
  } };
  // 오리주둥이 확산기: 납작하게 눌린 두 입술
  MUZ.muz_duckbill = { len: 10, f: 'big', d: function (x, y) {
    bx(x, y - 4, 4, 8, P.OL2, P.OL3, P.OL1);
    R(x + 3, y - 4, 7, 3, K); R(x + 3, y - 3, 6, 1, P.OL3);
    R(x + 3, y + 1, 7, 3, K); R(x + 3, y + 2, 6, 1, P.OL2);
    R(x + 4, y - 1, 6, 2, '#000');
  } };
  // 소염기: 새장형
  MUZ.muz_flashhider = { len: 8, f: 'small', d: function (x, y) {
    bx(x, y - 3, 8, 7, P.G2, P.G3, P.G1);
    R(x + 2, y - 2, 5, 1, K); R(x + 2, y, 5, 1, K); R(x + 2, y + 2, 5, 1, K);
    R(x + 7, y - 1, 1, 2, '#000');
  } };
  // 스프링클러 헤드: 놋쇠 몸통 + 까딱이는 팔
  MUZ.muz_sprinkler = { len: 9, d: function (x, y) {
    var T = now(), up = ((T * 5) | 0) % 2;
    bx(x, y - 2, 4, 5, P.BR2, P.BR3, P.BR1);
    bx(x + 3, y - 4, 3, 9, P.BR2, P.BR3, P.BR1);
    R(x + 5, up ? y - 9 : y + 4, 4, 5, K); R(x + 6, up ? y - 8 : y + 5, 2, 3, P.BR3);
    R(x + 6, y - 1, 3, 3, K); R(x + 6, y, 2, 1, P.S3);
    R(x + 11, y - 5 + (((T * 7) | 0) % 3) * 4, 1, 1, '#9fd8ff');
  } };
  // 골프공 딤플 캡
  MUZ.muz_dimple = { len: 11, d: function (x, y) {
    var d = '#b8b8b0';
    bx(x, y - 2, 3, 5, P.S2, P.S3);
    circ(x + 6, y, 4, K); circ(x + 6, y, 3, P.WH);
    R(x + 4, y - 2, 1, 1, d); R(x + 6, y - 1, 1, 1, d); R(x + 8, y - 2, 1, 1, d); R(x + 5, y + 1, 1, 1, d); R(x + 7, y + 1, 1, 1, d); R(x + 6, y + 2, 1, 1, d);
    R(x + 10, y - 1, 1, 2, '#000');
  } };
  // 카주: 빨간 금속 대롱 + 위의 동그란 떨림판
  MUZ.muz_kazoo = { len: 12, f: 'ring', d: function (x, y) {
    bx(x, y - 3, 12, 6, P.RD, '#ff8a80', P.RD2);
    R(x + 9, y - 2, 2, 4, P.YE);
    circ(x + 5, y - 4, 2, K); circ(x + 5, y - 4, 1, P.BR3);
    R(x + 11, y - 1, 1, 2, '#000');
  } };
  // 다트 핀 총검: 깃 달린 다트를 총열 밑에 묶었다
  MUZ.muz_dart = { len: 0, d: function (x, y) {
    R(x - 11, y + 1, 5, 7, K); R(x - 10, y + 2, 3, 2, P.RD); R(x - 10, y + 5, 3, 2, P.YE);
    R(x - 6, y + 3, 11, 3, K); R(x - 6, y + 4, 11, 1, P.BR2);
    bx(x - 4, y - 3, 3, 9, P.TP1, P.TP2);
    R(x + 5, y + 3, 6, 3, K); R(x + 5, y + 4, 6, 1, P.S3); R(x + 11, y + 4, 2, 1, P.WH);
  } };
  // 예초기 날: 돌아가는 원판 날
  MUZ.muz_mower = { len: 8, d: function (x, y) {
    var k = ((now() * 14) | 0) % 2, i;
    var t4 = k ? [[7, -7], [14, 0], [7, 7], [0, 0]] : [[12, -5], [12, 5], [2, 5], [2, -5]];
    bx(x, y - 2, 4, 5, P.OR, '#ffc080');
    circ(x + 7, y, 6, K); circ(x + 7, y, 5, P.S3); circ(x + 7, y, 2, P.S1);
    for (i = 0; i < 4; i++) { R(x + t4[i][0] - 1, y + t4[i][1] - 1, 3, 3, K); R(x + t4[i][0], y + t4[i][1], 1, 1, P.WH); }
    R(x + 7, y, 1, 1, P.RD);
  } };
  // 농구 골대: 백보드 + 주황 림 + 그물
  MUZ.muz_hoop = { len: 14, d: function (x, y) {
    var i;
    bx(x, y - 9, 3, 13, P.WH, '#ffffff', '#b0b0b0'); R(x + 1, y - 6, 1, 4, P.RD);
    R(x + 2, y - 1, 12, 3, K); R(x + 3, y, 10, 1, P.OR);
    for (i = 0; i < 5; i++) R(x + 4 + i * 2, y + 2, 1, 6 - Math.abs(i - 2), P.WH);
    R(x + 5, y + 4, 7, 1, '#d0d0c8');
  } };
  // 부부젤라: 길쭉한 플라스틱 나팔
  MUZ.muz_vuvuzela = { len: 23, f: 'ring', d: function (x, y) {
    var i, h;
    tube(x, y, 12, 2, P.GR, '#9fe08a', '#2f7f2a');
    for (i = 0; i < 10; i++) { h = Math.floor(i * 0.7); R(x + 11 + i, y - 2 - h, 1, 5 + h * 2, K); }
    for (i = 0; i < 9; i++) { h = Math.floor(i * 0.7); R(x + 12 + i, y - 1 - h, 1, 3 + h * 2, i % 4 === 0 ? P.YE : P.GR); }
    R(x + 21, y - 9, 2, 19, K); R(x + 21, y - 8, 1, 17, P.YE);
  } };
  // 드릴 비트: 노란 척 + 돌아가는 나선 날
  MUZ.muz_drill = { len: 14, d: function (x, y) {
    var k = ((now() * 10) | 0) % 3, i;
    bx(x, y - 3, 4, 7, P.YE, '#fff0a0', '#a88a10');
    R(x + 3, y - 2, 9, 5, K); R(x + 4, y - 1, 8, 3, P.S2);
    for (i = 0; i < 3; i++) R(x + 4 + ((i * 3 + k) % 8), y - 1, 1, 3, P.WH);
    R(x + 12, y - 1, 2, 3, K); R(x + 12, y, 2, 1, P.S3); R(x + 14, y, 1, 1, K);
  } };
  // 고압 세척기 노즐
  MUZ.muz_nozzle = { len: 12, f: 'fizz', d: function (x, y) {
    var k = ((now() * 9) | 0) % 2;
    bx(x, y - 3, 5, 7, P.YE, '#fff0a0', '#a88a10');
    bx(x + 4, y - 2, 5, 5, P.BK, P.G3);
    bx(x + 8, y - 3, 4, 7, P.RD, '#ff8a80');
    R(x + 11, y - 1, 1, 2, '#000');
    R(x + 13 + k, y, 2, 1, '#9fd8ff');
  } };
  // 플라스마 렌즈
  MUZ.muz_plasma = { len: 8, f: 'energy', d: function (x, y) {
    var g = ((now() * 8) | 0) % 2;
    bx(x, y - 4, 4, 9, P.TE2, P.TE3, P.TE1);
    bx(x + 3, y - 6, 4, 13, P.TE2, P.TE3, P.TE1);
    R(x + 6, y - 4, 2, 9, K); R(x + 6, y - 3, 2, 7, g ? '#ff7fe0' : '#c84ad0'); R(x + 6, y - 1, 2, 3, P.WH);
    R(x + 4, y - 7, 2, 1, P.CY); R(x + 4, y + 7, 2, 1, P.CY);
  } };
  // 집속 분사구: 구멍 셋 뚫린 국방색 덩어리
  MUZ.muz_cluster = { len: 10, f: 'big', d: function (x, y) {
    var i;
    bx(x, y - 3, 4, 7, P.OL2, P.OL3, P.OL1);
    bx(x + 3, y - 6, 7, 13, P.OL2, P.OL3, P.OL1);
    R(x + 4, y - 5, 1, 11, P.OL1);
    for (i = 0; i < 3; i++) { R(x + 6, y - 4 + i * 4, 2, 2, P.YE); R(x + 9, y - 4 + i * 4, 1, 2, '#000'); }
  } };
  // 송곳니 총검: 살점 소켓에서 자란 위아래 송곳니
  MUZ.muz_fang = { len: 10, f: 'goo', d: function (x, y) {
    bx(x, y - 4, 5, 9, P.FL2, P.FL3, P.FL1); R(x + 2, y - 1, 2, 2, '#ffd0e0');
    R(x + 4, y - 5, 5, 3, K); R(x + 4, y - 4, 4, 1, P.BO3); R(x + 8, y - 3, 3, 2, K); R(x + 8, y - 3, 2, 1, P.BO2);
    R(x + 4, y + 3, 5, 3, K); R(x + 4, y + 4, 4, 1, P.BO2); R(x + 8, y + 2, 3, 2, K); R(x + 8, y + 3, 2, 1, P.BO3);
  } };
  // 허수아비 머리: 밀짚모자 쓴 자루 얼굴
  MUZ.muz_scarecrow = { len: 12, f: 'smoke', d: function (x, y) {
    R(x - 1, y - 9, 14, 3, K); R(x, y - 8, 12, 1, P.YE);
    R(x + 2, y - 13, 8, 5, K); R(x + 3, y - 12, 6, 3, '#e8c860'); R(x + 3, y - 10, 6, 1, P.RD);
    bx(x + 1, y - 6, 10, 12, '#b89a6a', '#d8c090', '#8a6f44');
    R(x + 3, y - 3, 2, 2, K); R(x + 7, y - 3, 2, 2, K);
    R(x + 3, y + 2, 6, 1, K); R(x + 4, y + 1, 1, 3, K); R(x + 6, y + 1, 1, 3, K); R(x + 8, y + 1, 1, 3, K);
    R(x, y + 5, 2, 3, P.YE); R(x + 10, y + 5, 2, 3, P.YE);
    R(x + 11, y - 1, 1, 2, '#000');
  } };
  // 요요: 줄에 매달려 도는 빨간 요요
  MUZ.muz_yoyo = { len: 12, d: function (x, y) {
    var k = ((now() * 8) | 0) % 4, ox = [2, 0, -2, 0], oy = [0, 2, 0, -2];
    R(x, y - 1, 4, 1, P.WH); R(x + 1, y, 3, 1, P.WH);
    circ(x + 7, y + 1, 5, K); circ(x + 7, y + 1, 4, P.RD); circ(x + 7, y + 1, 2, P.YE); R(x + 7, y + 1, 1, 1, K);
    R(x + 7 + ox[k], y + 1 + oy[k] - 2, 1, 1, '#ff8a80'); R(x + 7 + ox[k], y + 1 + oy[k], 1, 1, P.WH);
  } };
  // 개기일식 조리개: 검은 원반과 코로나
  MUZ.muz_eclipse = { len: 9, f: 'energy', d: function (x, y) {
    var k = ((now() * 6) | 0) % 4, ox = [7, 0, -8, 0], oy = [0, 7, 0, -8];
    bx(x, y - 3, 3, 7, P.TE2, P.TE3);
    circ(x + 7, y, 7, K); circ(x + 7, y, 6, '#ffd76a'); circ(x + 7, y, 5, '#fff3c0'); circ(x + 7, y, 4, '#0a0a12');
    R(x + 7 + ox[k], y + oy[k], 2, 2, '#fff3c0');
    R(x + 6, y - 1, 2, 2, '#1a1a2a');
  } };
  // 컨페티 캐논: 줄무늬 나팔통 + 흩날리는 종이
  MUZ.muz_confetti = { len: 15, f: 'star', d: function (x, y) {
    var cs = [P.PK, P.CY, P.YE, P.GR], st = [P.RD, P.WH, P.BL, P.WH], k = (now() * 6) | 0, i, h;
    bx(x, y - 3, 4, 7, P.S2, P.S3);
    for (i = 0; i < 10; i++) { h = i >> 1; R(x + 3 + i, y - 4 - h, 1, 9 + h * 2, K); }
    for (i = 0; i < 9; i++) { h = i >> 1; R(x + 4 + i, y - 3 - h, 1, 7 + h * 2, st[i % 4]); }
    bx(x + 12, y - 9, 3, 19, P.YE, '#fff0a0', '#a88a10');
    for (i = 0; i < 4; i++) R(x + 16 + ((i * 3 + k) % 6), y - 8 + ((i * 5 + k * 2) % 16), 1, 2, cs[i]);
  } };

  X.clearCache();
})();
