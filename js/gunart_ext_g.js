// BUNKER 404 — 총기 픽셀아트 확장 G: 몸통 18종 + 탄약 16종 (data_parts_g.js 와 짝)
// gunart.js 의 REC / AMMO 표에 같은 형식으로 등록한다.
'use strict';
(function () {
  var X = window.GunArt && window.GunArt._ext; if (!X) return;
  var R = X.R, bx = X.bx, circ = X.circ, ln = X.ln, grip = X.grip, trig = X.trig, carts = X.carts, P = X.pal, K = P.K;
  var S1 = P.S1, S2 = P.S2, S3 = P.S3, G1 = P.G1, G2 = P.G2, G3 = P.G3, W1 = P.W1, W2 = P.W2, W3 = P.W3;
  var OL2 = P.OL2, BR2 = P.BR2, BR3 = P.BR3, PI1 = P.PI1, PI2 = P.PI2, PI3 = P.PI3, PL1 = P.PL1, PL2 = P.PL2, PL3 = P.PL3;
  var TE1 = P.TE1, TE2 = P.TE2, TE3 = P.TE3, CY = P.CY, FL1 = P.FL1, FL2 = P.FL2, BO2 = P.BO2, BO3 = P.BO3;
  var WH = P.WH, RD = P.RD, RD2 = P.RD2, YE = P.YE, GR = P.GR, BL = P.BL, PK = P.PK, OR = P.OR, BK = P.BK, RU2 = P.RU2, RU3 = P.RU3;
  var REC = X.REC, AM = X.AMMO, T = X.time;
  // 고정점 묶음: 총열(bx,by,bt) 개머리판(sx,sy) 탄창(mx,my) 조준기(tx,ty) 상부 뒤(a2x,a2y) 장식(hx,hy) 앞바닥(bot)
  function A(bxx, by, bt, sx, sy, mx, my, tx, ty, a2x, a2y, hx, hy, bot) {
    return { bx: bxx, by: by, bt: bt, sx: sx, sy: sy, mx: mx, my: my, tx: tx, ty: ty, a2x: a2x, a2y: a2y, hx: hx, hy: hy, bot: bot };
  }
  function ball(cx, cy, r, c, hi) { circ(cx, cy, r, K); circ(cx, cy, r - 1, c); R(cx - r + 2, cy - r + 2, 2, 1, hi || WH); }

  /* ═════════════ 몸통 ═════════════ */
  // 호미 투척기: 나무 틀 위에 얹힌 호미 (ㄱ자 날)
  REC.homi = { f: 'none', a: A(18, -8, 3, -9, -7, 10, -3, -3, -11, -6, -11, -7, -3, -3), d: function () {
    grip(-3, -3, 6, 12, W1, W2);
    bx(-9, -11, 27, 8, W2, W3, W1); R(-6, -7, 20, 1, W1);
    bx(2, -16, 13, 3, W2, W3, W1);
    R(13, -21, 3, 7, K); R(14, -20, 1, 5, S2); R(15, -22, 6, 4, K); R(16, -21, 4, 2, S3); R(19, -19, 2, 4, K); R(19, -19, 1, 3, S2);
    R(-8, -14, 3, 4, K); R(-7, -13, 1, 2, RD);
    trig(3, -3);
  } };

  // 팽이 발사기: 파란 몸통 위에서 도는 쇠팽이 + 당김줄
  REC.topgun = { f: 'small', a: A(16, -8, 3, -8, -7, 10, -3, -4, -11, -5, -11, -6, -3, -3), d: function () {
    var w = ((T() * 10) | 0) % 2;
    grip(-3, -3, 6, 12, RD2, RD);
    bx(-8, -11, 24, 8, BL, '#7fb8f0', '#2a5f9c');
    bx(3, -19, 10, 4, YE, '#ffe27a', '#b98f14'); R(5, -15, 6, 2, K); R(6, -15, 4, 1, RD); R(7, -13, 2, 2, K); R(7 + w, -12, 1, 1, S3); R(7, -21, 2, 2, K);
    R(3 + w * 8, -18, 1, 2, WH);
    R(-9, -8, 3, 2, K); ln(-9, -7, -13, -3, WH, 1); circ(-13, -2, 1, WH);
    trig(3, -3);
  } };

  // 노래방 탬버린: 둥근 테 + 징글
  REC.tambourine = { f: 'ring', a: A(14, -10, 3, -6, -6, 8, -2, 4, -19, -3, -17, -5, -2, -2), d: function () {
    var j = [[-3, -16], [4, -19], [11, -16], [13, -9], [-5, -9]], i, sh = ((T() * 8) | 0) % 2;
    grip(-3, -3, 6, 12, W1, W2);
    circ(4, -10, 9, K); circ(4, -10, 8, W2); circ(4, -10, 6, K); circ(4, -10, 5, '#f0e6c8');
    R(1, -12, 3, 1, '#d8c8a0'); R(4, -9, 4, 1, '#d8c8a0');
    for (i = 0; i < j.length; i++) { R(j[i][0] - 1, j[i][1] - 1 + (i % 2 ? sh : 0), 3, 3, K); R(j[i][0], j[i][1] + (i % 2 ? sh : 0), 1, 1, BR3); }
    trig(3, -3);
  } };

  // 골프 퍼터건: 은빛 샤프트 + 퍼터 헤드 + 티 위의 공
  REC.putter = { f: 'small', a: A(19, -8, 3, -10, -7, 9, -4, -3, -11, -7, -11, -8, -3, -3), d: function () {
    grip(-3, -3, 6, 12, BK, G3);
    bx(-10, -11, 23, 7, S2, S3, S1); R(-8, -8, 18, 1, S1);
    bx(12, -14, 7, 11, S3, WH, S2); R(13, -5, 5, 1, RD);
    circ(6, -15, 3, K); circ(6, -15, 2, WH); R(5, -16, 1, 1, '#d0d0d0'); R(5, -12, 2, 1, W3);
    trig(3, -3);
  } };

  // 사무실 프린터: 베이지 본체 + 급지대 + 배출 용지 + 걸림 경고등
  REC.printer = { f: 'small', a: A(20, -8, 3, -11, -8, 6, -3, 10, -16, 13, -16, -9, -3, -3), d: function () {
    grip(-3, -3, 6, 12, PL1, PL2);
    bx(-11, -16, 31, 13, PL2, PL3, PL1);
    R(-8, -21, 14, 6, K); R(-7, -20, 12, 4, WH); R(-6, -18, 10, 1, '#c8c8c8');
    R(9, -9, 11, 3, K); R(10, -8, 10, 1, WH);
    R(12, -14, 2, 2, GR); R(15, -14, 2, 2, (((T() * 3) | 0) % 2) ? RD : '#5a1a1a');
    R(-9, -5, 26, 1, PL1);
    trig(3, -3);
  } };

  // 하수구 펌프: 청록 하우징 + 임펠러 + 플랜지 + 빨간 밸브
  REC.sewerpump = { f: 'goo', a: A(20, -8, 4, -10, -7, 12, -3, 4, -17, -9, -17, -8, -3, -3), d: function () {
    grip(-3, -3, 6, 12, PI1, PI2);
    bx(-10, -11, 22, 8, PI2, PI3, PI1);
    circ(4, -9, 7, K); circ(4, -9, 6, PI2); circ(4, -9, 3, PI1); R(3, -10, 2, 2, S3);
    bx(12, -11, 7, 7, S2, S3, S1); R(18, -12, 2, 9, K); R(18, -11, 1, 7, S3);
    R(-9, -15, 3, 5, K); R(-8, -14, 1, 3, RD); R(-11, -17, 7, 3, K); R(-10, -16, 5, 1, RD);
    R(8, -2, 2, 3, '#7a8a2a');
    trig(3, -3);
  } };

  // 허수아비 석궁: 세로 활대 + 시위 + 밀짚모자 쓴 허수아비 머리
  REC.scarecrowbow = { f: 'none', a: A(20, -8, 2, -10, -7, 9, -4, 6, -11, 8, -11, -8, -3, -4), d: function (o) {
    var pull = o && o.charge ? Math.round(o.charge * 4) : 0;
    grip(-3, -3, 6, 12, W1, W2);
    bx(-10, -10, 30, 6, W2, W3, W1);
    R(15, -20, 3, 24, K); R(16, -19, 1, 22, W3);
    ln(16, -19, 3 - pull, -8, '#e8e0c0', 1); ln(16, 3, 3 - pull, -8, '#e8e0c0', 1);
    circ(-3, -15, 4, K); circ(-3, -15, 3, '#e8d8a0'); R(-5, -16, 1, 1, K); R(-2, -16, 1, 1, K); R(-4, -13, 3, 1, RD2);
    R(-9, -19, 13, 2, K); R(-8, -19, 11, 1, '#d9b84a'); R(-6, -22, 7, 3, K); R(-5, -21, 5, 2, '#d9b84a');
    trig(3, -3);
  } };

  // 컴파운드 보우: 라이저 + 위아래 캠(도르래) + 걸린 화살
  REC.compoundbow = { f: 'none', a: A(22, -9, 2, -6, -8, 6, -5, 2, -11, -3, -11, -5, -3, -5), d: function (o) {
    var pull = o && o.charge ? Math.round(o.charge * 5) : 0;
    grip(-3, -3, 6, 12, BK, G3);
    bx(-6, -11, 22, 5, G2, G3, G1);
    R(12, -22, 4, 28, K); R(13, -21, 2, 26, OL2); R(13, -12, 2, 8, BK);
    circ(14, -22, 3, K); circ(14, -22, 2, S3); circ(14, 6, 3, K); circ(14, 6, 2, S3);
    ln(14, -22, 2 - pull, -9, WH, 1); ln(14, 6, 2 - pull, -9, WH, 1);
    R(2 - pull, -10, 19 + pull, 1, '#d9c07a'); R(19, -11, 3, 3, K); R(20, -10, 2, 1, S3); R(1 - pull, -11, 2, 3, RD);
    trig(3, -3);
  } };

  // 볼링공 발사기: 나무 레인 + 남색 공(구멍 셋) + 핀 하나
  REC.bowling = { f: 'smoke', a: A(20, -7, 5, -10, -7, 10, -3, 9, -11, 12, -11, -8, -3, -3), d: function () {
    grip(-3, -3, 6, 12, W1, W2);
    bx(-10, -10, 30, 7, W2, W3, W1); R(-8, -10, 26, 1, '#f0e0b0');
    circ(0, -16, 7, K); circ(0, -16, 6, '#2a2a6a'); R(-3, -20, 2, 2, '#5a5ab0'); R(1, -18, 1, 1, K); R(3, -17, 1, 1, K); R(2, -15, 1, 1, K);
    R(13, -15, 4, 5, K); R(14, -14, 2, 3, WH); R(14, -13, 2, 1, RD); R(14, -17, 2, 2, K); R(14, -16, 1, 1, WH);
    trig(3, -3);
  } };

  // 서류 파쇄기: 회색 통 + 투입구의 서류 + 아래로 늘어진 가닥
  REC.papershredder = { f: 'none', a: A(19, -8, 4, -10, -8, 4, -3, 12, -15, 14, -15, -8, -3, 2), d: function () {
    var i;
    grip(-3, -3, 6, 12, G1, G3);
    bx(-10, -15, 29, 12, G3, S2, G2);
    R(-6, -17, 20, 3, K); R(-4, -20, 14, 5, K); R(-3, -19, 12, 3, WH); R(-2, -18, 8, 1, '#c8c8c8');
    R(-7, -10, 22, 1, G1); R(14, -13, 3, 2, GR);
    for (i = 0; i < 4; i++) { R(8 + i * 3, -3, 2, 4 + ((i * 3) % 4), K); R(8 + i * 3, -3, 1, 3 + ((i * 3) % 4), WH); }
    trig(3, -3);
  } };

  // 전자기타 앰프: 검은 캐비닛 + 그릴 천 + 노브 + 전원등 + 케이블
  REC.amp = { f: 'elec', a: A(18, -8, 3, -10, -8, 9, -3, 6, -16, 12, -16, -8, -3, -3), d: function () {
    var i;
    grip(-3, -3, 6, 12, BK, G3);
    bx(-10, -16, 28, 13, BK, G3, '#000000');
    bx(-8, -12, 20, 8, '#6a5a3a', '#8a7a5a', '#4a3a22');
    for (i = 0; i < 5; i++) R(-7 + i * 4, -11, 1, 6, '#4a3a22');
    R(-8, -15, 22, 2, S2);
    for (i = 0; i < 4; i++) { R(-6 + i * 5, -16, 2, 2, K); R(-6 + i * 5, -16, 1, 1, WH); }
    R(14, -11, 2, 2, (((T() * 6) | 0) % 2) ? RD : RD2);
    ln(-10, -6, -14, -1, BK, 1);
    trig(3, -3);
  } };

  // 경운기 엔진포: 빨간 엔진 블록 + 연료통 + 도는 플라이휠 + 배기통
  REC.tiller = { f: 'big', a: A(20, -8, 4, -11, -8, 2, -3, -2, -18, -4, -18, -9, -3, -3), d: function (o) {
    var sp = o && o.spin ? o.spin : T() * 4;
    grip(-3, -3, 6, 12, BK, G3);
    bx(-11, -12, 31, 9, RD2, RD, '#5a1a16');
    bx(-8, -18, 12, 6, RD, '#f06a5a', RD2); R(-4, -20, 3, 2, K); R(-3, -20, 1, 1, S3);
    circ(10, -8, 5, K); circ(10, -8, 4, S2); R(10 + Math.round(Math.cos(sp) * 3), -8 + Math.round(Math.sin(sp) * 3), 1, 1, K); R(10, -8, 1, 1, K);
    R(14, -19, 3, 8, K); R(15, -18, 1, 7, S1); R(13, -21, 5, 3, K); R(14, -20, 3, 1, '#9a9a9a');
    trig(3, -3);
  } };

  // 압력밥솥 저격총: 은빛 총몸 위의 솥 + 뚜껑 + 압력추 (충전 시 김)
  REC.pressurecooker = { f: 'heat', a: A(20, -6, 3, -11, -6, 12, -3, 14, -9, -9, -9, -9, -3, -3), d: function (o) {
    var ch = o && o.charge ? o.charge : 0;
    grip(-3, -3, 6, 12, BK, G3);
    bx(-11, -9, 31, 6, S2, S3, S1);
    bx(-6, -18, 16, 10, S3, WH, S2); R(-8, -20, 20, 3, K); R(-7, -19, 18, 1, S3);
    R(-10, -15, 4, 2, K); R(10, -15, 4, 2, K);
    R(1, -23, 3, 4, K); R(2, -22, 1, 2, ch > 0.9 ? RD : S3);
    if (ch > 0.3) { R(2, -26 - Math.round(ch * 3), 1, 2, WH); R(4, -25, 1, 1, WH); R(0, -26, 1, 1, WH); }
    trig(3, -3);
  } };

  // 드론 군집 통제기: 남색 도킹 박스 + 위에 떠 있는 드론 3기
  REC.dronehive = { f: 'energy', a: A(19, -7, 3, -10, -7, 10, -3, 14, -11, 16, -11, -8, -3, -3), d: function () {
    var i, dx, dy;
    grip(-3, -3, 6, 12, TE1, TE3);
    bx(-10, -11, 29, 8, TE2, TE3, TE1); R(-8, -8, 24, 1, CY);
    for (i = 0; i < 3; i++) {
      dx = -6 + i * 8; dy = -17 - (((T() * 4 + i) | 0) % 2);
      R(dx - 3, dy, 7, 1, K); R(dx - 2, dy + 1, 5, 3, K); R(dx - 1, dy + 2, 3, 1, CY); R(dx - 3, dy - 1, 2, 1, S3); R(dx + 2, dy - 1, 2, 1, S3);
    }
    trig(3, -3);
  } };

  // 파이프 오르간: 나무 콘솔 + 높이가 다른 금빛 파이프 여섯 + 건반
  REC.organ = { f: 'ring', a: A(20, -7, 4, -11, -7, 10, -3, 18, -10, -13, -10, -9, -3, -3), d: function () {
    var hs = [8, 12, 16, 13, 9, 6], i, px, h;
    grip(-3, -3, 6, 12, W1, W2);
    bx(-11, -10, 31, 7, W2, W3, W1);
    for (i = 0; i < 6; i++) { px = -9 + i * 5; h = hs[i]; R(px - 1, -10 - h, 5, h + 1, K); R(px, -9 - h, 3, h, BR2); R(px, -9 - h, 1, h, BR3); R(px, -13, 3, 1, K); }
    R(-9, -5, 26, 1, WH);
    for (i = 0; i < 8; i++) R(-8 + i * 3, -5, 1, 1, K);
    trig(3, -3);
  } };

  // 장난감 기차포: 선로 위의 빨간 기관차 + 파란 운전실 + 굴뚝 + 노란 바퀴
  REC.railtrain = { f: 'smoke', a: A(16, -9, 3, -10, -9, 4, -2, 0, -12, -6, -17, -8, -3, -2), d: function () {
    grip(-3, -2, 6, 11, W1, W2);
    R(-11, -4, 32, 2, K); R(-10, -4, 30, 1, S2);
    bx(-9, -12, 20, 7, RD, '#f06a5a', RD2);
    bx(-10, -17, 9, 6, BL, '#7fb8f0', '#2a5f9c'); R(-8, -15, 4, 3, '#bfe9ff');
    R(6, -17, 4, 6, K); R(7, -16, 2, 4, BK); R(5, -19, 6, 3, K); R(6, -18, 4, 1, YE);
    if (((T() * 3) | 0) % 2) { R(7, -22, 2, 2, '#c8c8c8'); R(9, -24, 2, 2, '#e0e0e0'); }
    circ(-5, -5, 2, K); circ(2, -5, 2, K); circ(9, -5, 2, K); R(-5, -5, 1, 1, YE); R(2, -5, 1, 1, YE); R(9, -5, 1, 1, YE);
    R(11, -10, 5, 6, K); R(12, -9, 3, 4, YE);
    trig(3, -2);
  } };

  // 위성 레이저 포인터: 은색 포인터 펜 + 접시 안테나 + 깜빡이는 급전부
  REC.satellite = { f: 'energy', a: A(20, -7, 2, -10, -7, 10, -3, 10, -11, 13, -11, -8, -3, -3), d: function () {
    grip(-3, -3, 6, 12, TE1, TE3);
    bx(-10, -10, 30, 6, S3, WH, S2); R(-6, -8, 4, 2, RD); R(16, -9, 3, 4, K); R(17, -8, 1, 2, RD);
    R(-1, -13, 2, 4, K);
    R(-8, -21, 3, 9, K); R(-5, -20, 3, 7, K); R(-2, -18, 3, 4, K); R(-7, -20, 2, 7, S3); R(-4, -19, 2, 5, WH); R(-1, -17, 1, 2, S3);
    ln(-3, -16, 4, -22, S2, 1); R(4, -23, 2, 2, (((T() * 5) | 0) % 2) ? RD : CY);
    trig(3, -3);
  } };

  // 척추 채찍: 꿈틀대는 등뼈 마디 + 살점 손잡이
  REC.spinewhip = { f: 'goo', a: A(21, -8, 3, -10, -7, 8, -3, 2, -13, -6, -13, -8, -3, -3), d: function () {
    var i, vx, vy;
    grip(-3, -3, 6, 12, FL1, FL2);
    R(-9, -8, 29, 2, K); R(-8, -8, 27, 1, FL2);
    for (i = 0; i < 6; i++) {
      vx = -10 + i * 5; vy = -10 + Math.round(Math.sin(T() * 5 + i * 0.9) * 1.2);
      R(vx, vy - 2, 5, 7, K); R(vx + 1, vy - 1, 3, 5, BO2); R(vx + 1, vy - 1, 3, 1, BO3); R(vx + 2, vy - 4, 1, 2, K); R(vx + 2, vy + 5, 1, 2, K);
    }
    R(19, -9, 3, 3, K); R(20, -8, 1, 1, RD);
    trig(3, -3);
  } };

  /* ═════════════ 탄약 (좌상단 기준 약 24x14) ═════════════ */
  AM.ammo_gravel = { c: '#9a958a', d: function (x, y) {
    var g = [[2, 6, 7, 6, '#8a857a'], [10, 2, 6, 5, '#aaa59a'], [12, 8, 8, 6, '#7a756a'], [19, 3, 4, 4, '#9a958a']], i;
    for (i = 0; i < g.length; i++) { R(x + g[i][0] - 1, y + g[i][1] - 1, g[i][2] + 2, g[i][3] + 2, K); R(x + g[i][0], y + g[i][1], g[i][2], g[i][3], g[i][4]); R(x + g[i][0], y + g[i][1], 2, 1, '#c8c4ba'); }
  } };
  AM.ammo_acorn = { c: '#a8743a', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var cx = x + 1 + i * 8, cy = y + (i === 1 ? 0 : 2);
      R(cx, cy + 2, 6, 4, K); R(cx + 1, cy + 3, 4, 2, '#6a4a22'); R(cx + 2, cy, 2, 3, K); R(cx + 1, cy + 3, 4, 1, '#8a6a3a');
      R(cx, cy + 5, 6, 6, K); R(cx + 1, cy + 5, 4, 5, '#c9924a'); R(cx + 1, cy + 5, 1, 4, '#e0b070'); R(cx + 2, cy + 10, 2, 2, K);
    }
  } };
  AM.ammo_gonggi = { c: '#ff9fd0', d: function (x, y) {
    var cs = [RD, YE, BL, GR, PK], p = [[2, 8], [7, 3], [12, 9], [17, 4], [20, 10]], i;
    for (i = 0; i < 5; i++) { R(x + p[i][0] - 1, y + p[i][1] - 1, 5, 5, K); R(x + p[i][0], y + p[i][1], 3, 3, cs[i]); R(x + p[i][0], y + p[i][1], 1, 1, WH); }
  } };
  AM.ammo_mugwort = { c: '#7fa85a', d: function (x, y) {
    carts(x, y, '#7fa85a', OL2, function (cx, cy, i) { if (i !== 1) { R(cx + 5, cy + 1, 2, 1, '#5f8a3a'); R(cx + 6, cy, 1, 1, '#5f8a3a'); } });
    R(x + 10, y - 2, 1, 2, '#c8c8c8'); R(x + 11, y - 3, 1, 1, '#e0e0e0');
  } };
  AM.ammo_puck = { c: '#2a2a30', d: function (x, y) {
    for (var i = 0; i < 2; i++) {
      var px = x + 1 + i * 12, py = y + 3 + i * 3;
      R(px, py, 10, 6, K); R(px - 1, py + 1, 12, 4, K); R(px + 1, py + 1, 8, 2, '#4a4a55'); R(px, py + 3, 10, 2, '#2a2a30'); R(px + 2, py + 1, 3, 1, '#7a7a88');
    }
    R(x + 13, y + 1, 6, 1, '#bfe9ff');
  } };
  AM.ammo_gum = { c: '#ff8fc8', d: function (x, y) {
    ball(x + 7, y + 7, 6, '#ff8fc8', '#ffd0e8'); R(x + 9, y + 9, 2, 1, '#e06aa8');
    bx(x + 15, y + 5, 8, 6, '#ffe27a', '#fff3b0', '#b98f14'); R(x + 14, y + 6, 1, 4, RD); R(x + 23, y + 6, 1, 4, RD); R(x + 17, y + 7, 4, 2, PK);
  } };
  AM.ammo_tack = { c: '#e0c040', d: function (x, y) {
    var cs = [RD, YE, BL];
    for (var i = 0; i < 3; i++) {
      var tx = x + 3 + i * 8, ty = y + (i === 1 ? 1 : 3);
      R(tx - 3, ty, 7, 4, K); R(tx - 2, ty + 1, 5, 2, cs[i]); R(tx - 2, ty + 1, 2, 1, WH);
      R(tx - 1, ty + 4, 3, 6, K); R(tx, ty + 4, 1, 5, S3); R(tx, ty + 10, 1, 1, K);
    }
  } };
  AM.ammo_seedbomb = { c: '#6fbf4a', d: function (x, y) {
    ball(x + 8, y + 8, 6, '#8a6a3a', '#b08a5a'); R(x + 6, y + 9, 2, 2, '#5a4222'); R(x + 10, y + 6, 2, 2, '#5a4222');
    R(x + 8, y - 1, 1, 4, K); R(x + 8, y, 1, 2, GR); R(x + 9, y - 1, 3, 2, K); R(x + 9, y - 1, 2, 1, GR); R(x + 5, y, 3, 2, K); R(x + 6, y, 2, 1, GR);
    R(x + 17, y + 10, 2, 2, K); R(x + 20, y + 7, 2, 2, K); R(x + 17, y + 10, 1, 1, '#c9a86a'); R(x + 20, y + 7, 1, 1, '#c9a86a');
  } };
  AM.ammo_epee = { c: '#c8d2e0', d: function (x, y) {
    for (var i = 0; i < 3; i++) {
      var ex = x + 3 + i * 8, ey = y + (i === 1 ? 0 : 1);
      R(ex - 1, ey, 3, 3, K); R(ex, ey + 1, 1, 1, RD);
      R(ex - 1, ey + 3, 3, 9, K); R(ex, ey + 3, 1, 8, S3);
      R(ex - 3, ey + 11, 7, 3, K); R(ex - 2, ey + 12, 5, 1, BR2);
    }
  } };
  AM.ammo_reject = { c: '#f0ead8', d: function (x, y) {
    bx(x + 2, y + 1, 12, 13, WH, '#ffffff', '#c8c8c8'); R(x + 4, y + 3, 7, 1, '#9a9a9a'); R(x + 4, y + 5, 5, 1, '#9a9a9a');
    ln(x + 4, y + 7, x + 11, y + 12, RD, 1); ln(x + 11, y + 7, x + 4, y + 12, RD, 1);
    X.cart(x + 17, y + 2, RD, BR2);
  } };
  AM.ammo_snapper = { c: '#f2efe6', d: function (x, y) {
    var p = [[4, 8], [12, 5], [19, 9]], i;
    for (i = 0; i < 3; i++) { ball(x + p[i][0], y + p[i][1], 3, WH, '#ffffff'); R(x + p[i][0] + 2, y + p[i][1] - 4, 2, 2, K); R(x + p[i][0] + 3, y + p[i][1] - 5, 1, 2, WH); R(x + p[i][0] - 1, y + p[i][1] + 1, 2, 1, '#c8c8c8'); }
    R(x + 8, y + 1, 1, 1, YE); R(x + 16, y + 2, 1, 1, OR);
  } };
  AM.ammo_scalpel = { c: '#b8e0e8', d: function (x, y) {
    for (var i = 0; i < 2; i++) {
      var sx = x + 3 + i * 11, sy = y + i * 1;
      R(sx, sy, 4, 7, K); R(sx + 1, sy + 1, 2, 5, S3); R(sx + 1, sy + 1, 1, 3, WH); R(sx + 3, sy + 2, 1, 4, K);
      R(sx, sy + 6, 4, 8, K); R(sx + 1, sy + 7, 2, 6, '#3fa0a8'); R(sx + 1, sy + 8, 2, 1, '#8fd8e0');
    }
    R(x + 19, y + 11, 3, 2, RD);
  } };
  AM.ammo_shotput = { c: '#6a727e', d: function (x, y) {
    ball(x + 9, y + 7, 7, S2, S3); R(x + 10, y + 9, 3, 2, S1); R(x + 6, y + 4, 2, 2, WH);
    R(x + 18, y + 11, 5, 2, K); R(x + 19, y + 10, 3, 1, '#c8c8c8');
  } };
  AM.ammo_hive = { c: '#e0b030', d: function (x, y) {
    var i;
    R(x + 2, y + 2, 12, 12, K); R(x + 4, y, 8, 3, K);
    for (i = 0; i < 4; i++) R(x + 3, y + 3 + i * 3, 10, 2, i % 2 ? '#b98a14' : '#e8c040');
    R(x + 5, y + 1, 6, 2, '#e8c040'); R(x + 7, y + 9, 3, 3, K);
    for (i = 0; i < 2; i++) { var wx = x + 17 + i * 4, wy = y + 3 + i * 6 + (((T() * 8 + i) | 0) % 2); R(wx - 1, wy - 1, 5, 4, K); R(wx, wy, 3, 2, YE); R(wx + 1, wy, 1, 2, K); R(wx, wy - 2, 2, 1, WH); }
  } };
  AM.ammo_meteor = { c: '#ff7a2c', d: function (x, y) {
    R(x, y + 1, 9, 2, OR); R(x + 2, y + 4, 8, 2, YE); R(x + 1, y + 8, 7, 2, OR); R(x + 4, y + 11, 5, 1, RD);
    R(x + 9, y, 13, 13, K); R(x + 10, y + 1, 11, 11, '#4a3a36'); R(x + 10, y + 1, 4, 3, '#6a5a52'); R(x + 17, y + 8, 3, 3, '#2a2220');
    R(x + 13, y + 5, 4, 1, OR); R(x + 15, y + 6, 1, 4, OR); R(x + 12, y + 9, 3, 1, YE); R(x + 18, y + 3, 2, 2, YE);
  } };
  AM.ammo_lotto = { c: '#ffd23c', d: function (x, y) {
    var cs = [RD, BL, YE, GR, '#9a5fd0'], i;
    bx(x + 1, y + 2, 22, 11, '#fff3c0', WH, '#d8c070'); R(x + 3, y + 4, 10, 1, RD); R(x + 3, y + 11, 18, 1, '#c8b060');
    for (i = 0; i < 5; i++) { R(x + 3 + i * 4, y + 6, 3, 3, K); R(x + 3 + i * 4, y + 6, 2, 2, cs[i]); }
  } };

  X.clearCache();
})();
