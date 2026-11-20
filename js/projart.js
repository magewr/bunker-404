// BUNKER 404 — 투사체 그림: 몸통·탄약마다 날아가는 물건이 다르게 보이도록
// combat.js 의 drawProj 가 먼저 ProjArt.draw(g, p, s, t) 를 부른다. true 를 돌려주면 기본 그림을 생략한다.
'use strict';
(function () {
  var root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  var G = null, ux = 1, uy = 0, H = 0, T = 0;   // 현재 ctx / 진행 방향 단위벡터 / 투사체별 난수 / 전투 시간
  var PAINT = ['#ff4fa0', '#4fd0ff', '#ffe14a', '#7bff6a', '#ff8a3c', '#c58bff'];
  var CONF = ['#ff5a6a', '#ffd23c', '#6fe0c8', '#6fb7ff', '#ff6fb5', '#b6ff3c'];
  var BALL = ['#ff5a6a', '#ffd23c', '#6fb7ff', '#7bff6a', '#ff6fb5', '#ff9a2c'];
  var MARB = ['#6fb7ff', '#7bff9a', '#ffb347', '#c58bff'];
  var BILL = ['#f4f2ea', '#ffd23c', '#d8423a'];

  /* ── 그리기 도구 ── */
  function px(x, y, w, h, c) { G.fillStyle = c; G.fillRect(Math.round(x), Math.round(y), w, h); }
  function dot(x, y, sz, c) { G.fillStyle = c; G.fillRect(Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz); }
  function ball(x, y, c) { var X = Math.round(x), Y = Math.round(y); G.fillStyle = c; G.fillRect(X - 1, Y - 2, 2, 4); G.fillRect(X - 2, Y - 1, 4, 2); }
  function oval(x, y, c) { var X = Math.round(x), Y = Math.round(y); G.fillStyle = c; G.fillRect(X - 3, Y - 1, 6, 2); G.fillRect(X - 2, Y - 2, 4, 4); }
  function ln(x1, y1, x2, y2, c, w) { G.strokeStyle = c; G.lineWidth = w || 1; G.beginPath(); G.moveTo(x1, y1); G.lineTo(x2, y2); G.stroke(); }
  function fxCol(s) { var f = s.fx || {}; return f.burn ? '#ff8a3c' : f.freeze ? '#9fd8ff' : f.acid ? '#b6ff3c' : f.shock ? '#7fe9ff' : f.explode ? '#ffb347' : f.rad ? '#d6ff5c' : null; }
  // 곡사 투사체의 진행 방향 (combat.js 의 포물선 식을 미분)
  function dirLob(p) {
    var Tt = p.T || 1, k = Math.min(1, (p.t || 0) / Tt), hh = Math.min(90, Tt * 110);
    var dx = (p.tx - p.sx) / Tt, dy = (p.ty - p.sy) / Tt - Math.cos(k * Math.PI) * Math.PI * hh / Tt;
    var d = Math.sqrt(dx * dx + dy * dy) || 1; ux = dx / d; uy = dy / d;
  }
  // 꼬리 쪽 좌우 1칸씩 (깃·날개·미늘)
  function fins(p, back, wide, c) {
    px(p.x - ux * back - uy * wide - 0.5, p.y - uy * back + ux * wide - 0.5, 1, 1, c);
    px(p.x - ux * back + uy * wide - 0.5, p.y - uy * back - ux * wide - 0.5, 1, 1, c);
  }
  function arcs(p, col, lw, n, gap) {
    var g = G; g.strokeStyle = col; g.lineWidth = lw; g.globalAlpha = Math.max(0, 1 - p.rad / (p.range || 300));
    for (var i = 0; i < n; i++) { var r = p.rad - i * gap; if (r > 4) { g.beginPath(); g.arc(p.ox, p.oy, r, p.ang - 0.34, p.ang + 0.34); g.stroke(); } }
  }
  function note(x, y, c) { px(x, y, 2, 2, c); px(x + 1, y - 4, 1, 4, c); px(x + 2, y - 4, 2, 1, c); }
  // 묵직한 탄두 + 충격파 다이아몬드 꼬리
  function slug(p, s, body, len) {
    var c = fxCol(s) || '#ffe9a0';
    G.globalAlpha = 0.45; ln(p.x - ux * (len + 20), p.y - uy * (len + 20), p.x - ux * len, p.y - uy * len, c, 1); G.globalAlpha = 1;
    for (var i = 1; i <= 3; i++) { var d = len + i * 6 - 2; dot(p.x - ux * d, p.y - uy * d, i === 3 ? 1 : 2, i % 2 ? c : '#ffffff'); }
    ln(p.x - ux * len, p.y - uy * len, p.x, p.y, body, 3); dot(p.x + ux, p.y + uy, 2, '#ffffff');
    return true;
  }

  /* ───────────── 탄약별 모양 (평범한 총알 총에 적용) ───────────── */
  var AMMO = {};
  AMMO.ammo_nail = function (p) { ln(p.x - ux * 5, p.y - uy * 5, p.x, p.y, '#c8ccd4', 1); dot(p.x - ux * 5, p.y - uy * 5, 2, '#8a94a3'); return true; };
  AMMO.ammo_rubber = function (p) { ball(p.x, p.y, BALL[H % 6]); px(p.x - 1, p.y - 2, 1, 1, '#ffffff'); return true; };
  AMMO.ammo_salt = function (p) { dot(p.x, p.y, 2, '#ffffff'); px(p.x - ux * 3 - 0.5, p.y - uy * 3 - 0.5, 1, 1, '#dfe8f0'); return true; };
  AMMO.ammo_popcorn = function (p) { dot(p.x, p.y, 2, '#ffd23c'); px(p.x - 0.5, p.y - 2.5, 1, 1, '#fff3c0'); return true; };
  AMMO.ammo_glitter = function (p) {
    dot(p.x, p.y, 2, CONF[(H + (T * 30 | 0)) % 6]);
    if ((T * 20 + H | 0) % 2) { px(p.x - 2.5, p.y - 0.5, 5, 1, '#ffffff'); px(p.x - 0.5, p.y - 2.5, 1, 5, '#ffffff'); }
    dot(p.x - ux * 4, p.y - uy * 4, 1, CONF[(H + 2) % 6]); return true;
  };
  AMMO.ammo_p2w = function (p) { // 황금 너트
    G.globalAlpha = 0.5; ln(p.x - ux * 8, p.y - uy * 8, p.x - ux * 2, p.y - uy * 2, '#ffe9a0', 1); G.globalAlpha = 1;
    dot(p.x, p.y, 4, '#ffd23c'); dot(p.x, p.y, 2, '#7a5a10'); return true;
  };
  AMMO.ammo_mint = function (p) { ball(p.x, p.y, '#8fe8c8'); px(p.x - 1, p.y - 1, 1, 1, '#5a3a22'); px(p.x, p.y + 1, 1, 1, '#5a3a22'); return true; };
  AMMO.ammo_hot = function (p) { // 소스 덩어리
    G.globalAlpha = 0.6; dot(p.x - ux * 4, p.y - uy * 4, 2, '#ff8a3c'); dot(p.x - ux * 7, p.y - uy * 7 + 1, 1, '#e0301a'); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#e0301a'); px(p.x - 1, p.y - 1, 1, 1, '#ff9a6a'); return true;
  };
  AMMO.ammo_spore = function (p) {
    G.globalAlpha = 0.5; dot(p.x - ux * 4 + Math.sin(p.age * 20) * 1.5, p.y - uy * 4, 1, '#d6ff5c'); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#8aa040'); px(p.x - 2, p.y, 1, 1, '#d6ff5c'); px(p.x + 1, p.y - 2, 1, 1, '#d6ff5c'); return true;
  };
  AMMO.ammo_bearing = function (p) {
    G.globalAlpha = 0.35; ln(p.x - ux * 5, p.y - uy * 5, p.x, p.y, '#cfd6da', 1); G.globalAlpha = 1;
    dot(p.x, p.y, 2, '#dfe6ec'); px(p.x - 1, p.y - 1, 1, 1, '#ffffff'); return true;
  };
  AMMO.ammo_screw = function (p) { var c = Math.cos(p.rot) * 2.5, sn = Math.sin(p.rot) * 2.5; ln(p.x - c, p.y - sn, p.x + c, p.y + sn, '#b86a36', 1); dot(p.x + c, p.y + sn, 2, '#8f4e2a'); return true; };
  AMMO.ammo_rice = function (p) { px(p.x - 1, p.y - 0.5, 2, 1, '#f6f2e2'); return true; };
  AMMO.ammo_bean = function (p) { dot(p.x, p.y, 3, '#2a1f33'); px(p.x - 1.5, p.y - 1.5, 1, 1, '#9a8ab0'); px(p.x + 0.5, p.y - 0.5, 1, 1, '#f2efe6'); return true; };
  AMMO.ammo_marble = function (p) { ball(p.x, p.y, MARB[H % 4]); px(p.x - 1, p.y - 1, 1, 1, '#ffffff'); px(p.x, p.y, 1, 1, '#e8f6ff'); return true; };
  AMMO.ammo_tooth = function (p) {
    var f = Math.sin(p.age * 22 + H) > 0;
    px(p.x - 1.5, p.y - 2, 3, 3, '#f8f4e6'); px(p.x - 1.5, p.y + 1, 1, f ? 2 : 1, '#e0d8c0'); px(p.x + 0.5, p.y + 1, 1, f ? 1 : 2, '#e0d8c0'); return true;
  };
  AMMO.ammo_pingpong = function (p) { ball(p.x, p.y, H % 2 ? '#ff9a2c' : '#ffffff'); return true; };
  AMMO.ammo_bb = function (p) { dot(p.x, p.y, 2, '#e6f24a'); return true; };
  AMMO.ammo_golf = function (p) {
    G.globalAlpha = 0.3; ln(p.x - ux * 8, p.y - uy * 8, p.x, p.y, '#ffffff', 1); G.globalAlpha = 1;
    ball(p.x, p.y, '#ffffff'); px(p.x, p.y, 1, 1, '#b8c0c8'); px(p.x - 1, p.y - 1, 1, 1, '#d8dee4'); return true;
  };
  AMMO.ammo_shuttle = function (p) { // 코르크가 앞, 깃털 치마가 뒤
    var ax = p.x - ux * 5 - uy * 2.5, ay = p.y - uy * 5 + ux * 2.5, bx = p.x - ux * 5 + uy * 2.5, by = p.y - uy * 5 - ux * 2.5;
    ln(ax, ay, p.x, p.y, '#f2efe6', 1); ln(bx, by, p.x, p.y, '#f2efe6', 1); ln(ax, ay, bx, by, '#cfd6da', 1);
    dot(p.x + ux, p.y + uy, 2, '#e8dcc0'); return true;
  };
  AMMO.ammo_buck = function (p) { G.globalAlpha = 0.5; ln(p.x - ux * 4, p.y - uy * 4, p.x, p.y, '#9a9a90', 1); G.globalAlpha = 1; dot(p.x, p.y, 2, '#e0e0d8'); return true; };
  AMMO.ammo_birdshot = function (p) { G.globalAlpha = 0.4; px(p.x - ux * 2 - 0.5, p.y - uy * 2 - 0.5, 1, 1, '#b8b8b0'); G.globalAlpha = 1; px(p.x - 0.5, p.y - 0.5, 1, 1, '#f0f0e8'); return true; };
  AMMO.ammo_garlic = function (p) { ball(p.x, p.y, '#f4eee0'); px(p.x - 1, p.y - 3, 1, 1, '#b8a070'); px(p.x, p.y + 1, 1, 1, '#c9a0d0'); return true; };
  AMMO.ammo_waterballoon = function (p) {
    var c = BALL[H % 6], w = Math.sin(p.age * 30 + H) > 0 ? 1 : 0;
    px(p.x - 2 - w, p.y - 2 + w, 4 + w * 2, 4 - w, c); px(p.x - 1, p.y - 2 + w, 1, 1, '#ffffff'); px(p.x - ux * 3 - 0.5, p.y - uy * 3 - 0.5, 1, 1, c); return true;
  };
  AMMO.ammo_coin = function (p) { // 뱅글뱅글 도는 동전
    var w = 1 + Math.round(Math.abs(Math.cos(p.age * 28 + H)) * 3), gold = H % 3 !== 0;
    px(p.x - w / 2, p.y - 2, w, 4, gold ? '#ffd23c' : '#dfe6ec'); if (w > 2) px(p.x - 0.5, p.y - 1, 1, 2, gold ? '#b8860b' : '#8a94a3'); return true;
  };
  AMMO.ammo_confetti = function (p) {
    for (var i = 0; i < 3; i++) {
      var f = Math.sin(p.age * 26 + i * 2 + H) > 0;
      px(p.x - ux * i * 3 + Math.sin(p.age * 17 + i * 3 + H) * 2, p.y - uy * i * 3 + Math.cos(p.age * 13 + i * 5) * 2, f ? 2 : 1, f ? 1 : 2, CONF[(H + i * 2) % 6]);
    }
    return true;
  };
  AMMO.ammo_flechette = function (p) { ln(p.x - ux * 7, p.y - uy * 7, p.x, p.y, '#e8eef2', 1); fins(p, 7, 1.5, '#8a94a3'); return true; };
  AMMO.ammo_scythe = function (p) { G.strokeStyle = '#e8eef2'; G.lineWidth = 1.5; G.beginPath(); G.arc(p.x, p.y, 3, p.rot * 2, p.rot * 2 + 3.4); G.stroke(); return true; };
  AMMO.ammo_domino = function (p) {
    var f = Math.sin(p.rot * 1.5) > 0, w = f ? 2 : 4, h = f ? 4 : 2;
    px(p.x - w / 2, p.y - h / 2, w, h, '#f4f2ea');
    px(p.x - (f ? 0.5 : 1.5), p.y - (f ? 1.5 : 0.5), 1, 1, '#1b1b1f'); px(p.x + (f ? -0.5 : 0.5), p.y + (f ? 0.5 : -0.5), 1, 1, '#1b1b1f'); return true;
  };
  AMMO.ammo_tracer = function (p) { // 예광탄: 아군 포탑은 초록, 내 총은 빨강
    var c = p.turret ? '#5aff7a' : '#ff4a3a';
    G.globalAlpha = 0.45; ln(p.x - ux * 26, p.y - uy * 26, p.x - ux * 10, p.y - uy * 10, c, 1); G.globalAlpha = 1;
    ln(p.x - ux * 10, p.y - uy * 10, p.x, p.y, c, 2); dot(p.x, p.y, 2, '#ffffff'); return true;
  };
  AMMO.ammo_subsonic = function (p) { G.globalAlpha = 0.7; ln(p.x - ux * 4, p.y - uy * 4, p.x, p.y, '#9aa0a8', 1); G.globalAlpha = 1; px(p.x - 0.5, p.y - 0.5, 1, 1, '#d8dce0'); return true; };
  AMMO.ammo_billiard = function (p) { var c = BILL[H % 3]; ball(p.x, p.y, c); px(p.x - 0.5, p.y - 0.5, 1, 1, H % 3 ? '#ffffff' : '#d8423a'); return true; };
  AMMO.ammo_tuning = function (p) { // 소리굽쇠: 자루 + 떨리는 두 갈래
    var v = 1.5 + Math.sin(p.age * 60) * 0.6;
    ln(p.x - ux * 6, p.y - uy * 6, p.x - ux * 3, p.y - uy * 3, '#cfd6da', 1);
    ln(p.x - ux * 3 - uy * v, p.y - uy * 3 + ux * v, p.x - uy * v, p.y + ux * v, '#e8eef2', 1);
    ln(p.x - ux * 3 + uy * v, p.y - uy * 3 - ux * v, p.x + uy * v, p.y - ux * v, '#e8eef2', 1); return true;
  };
  AMMO.ammo_magnet = function (p) { ln(p.x - ux * 4, p.y - uy * 4, p.x - ux, p.y - uy, '#3f8fe0', 2); ln(p.x - ux, p.y - uy, p.x + ux * 2, p.y + uy * 2, '#d8423a', 2); return true; };
  AMMO.ammo_am = function (p, s) { return slug(p, s, '#d9b84a', 6); };
  AMMO.ammo_slug = function (p) {
    G.globalAlpha = 0.5; ln(p.x - ux * 10, p.y - uy * 10, p.x - ux * 3, p.y - uy * 3, '#9aa0a8', 1); G.globalAlpha = 1;
    ln(p.x - ux * 3, p.y - uy * 3, p.x, p.y, '#5a626e', 3); dot(p.x + ux, p.y + uy, 2, '#cfd6da'); return true;
  };
  AMMO.ammo_sabot = function (p) { // 가는 관통자 + 갓 떨어져 나가는 이탈피
    ln(p.x - ux * 8, p.y - uy * 8, p.x, p.y, '#ffffff', 1);
    if (p.age < 0.12) { var o = 2 + p.age * 50; px(p.x - ux * 6 - uy * o, p.y - uy * 6 + ux * o, 2, 1, '#8a94a3'); px(p.x - ux * 6 + uy * o, p.y - uy * 6 - ux * o, 2, 1, '#8a94a3'); }
    return true;
  };
  AMMO.ammo_cleaver = function (p) { // 빙글빙글 식칼
    var g = G; g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(p.rot * 2);
    g.fillStyle = '#e8eef2'; g.fillRect(-1, -3, 4, 4); g.fillStyle = '#8a94a3'; g.fillRect(-1, 0, 4, 1); g.fillStyle = '#7a5230'; g.fillRect(-3, -2, 2, 2);
    g.restore(); return true;
  };
  AMMO.ammo_audit = function (p) { // 펄럭이는 고지서
    var f = Math.sin(p.age * 20 + H) > 0;
    px(p.x - (f ? 1.5 : 1), p.y - (f ? 1 : 2), f ? 3 : 2, f ? 2 : 4, '#f4f2ea'); px(p.x - 0.5, p.y - 0.5, 1, 1, '#d8423a'); return true;
  };
  AMMO.ammo_onechamber = function (p) { // 단 한 발: 금빛 궤적
    G.globalAlpha = 0.4; ln(p.x - ux * 24, p.y - uy * 24, p.x - ux * 8, p.y - uy * 8, '#ffe9a0', 1); G.globalAlpha = 1;
    ln(p.x - ux * 8, p.y - uy * 8, p.x, p.y, '#ffd23c', 2); dot(p.x + ux, p.y + uy, 2, '#ffffff');
    var k = (T * 25 + H | 0) % 4, sd = k % 2 ? 2 : -2;
    dot(p.x - ux * (6 + k * 4) - uy * sd, p.y - uy * (6 + k * 4) + ux * sd, 1, '#ffffff'); return true;
  };
  AMMO.ammo_antimatter = function (p) {
    dot(p.x, p.y, 4, '#12001f');
    G.strokeStyle = (T * 20 + H | 0) % 2 ? '#ff5fe0' : '#c58bff'; G.lineWidth = 1; G.beginPath(); G.arc(p.x, p.y, 3.5, p.rot * 2, p.rot * 2 + 4.2); G.stroke();
    px(p.x - 0.5, p.y - 0.5, 1, 1, '#ffffff'); return true;
  };

  /* ───────────── 몸통별 모양 ───────────── */
  var REC = {};
  // ── 곡사 (lob) ──
  REC.potato = function (p) {
    oval(p.x, p.y, '#b98a4a'); px(p.x - 3, p.y, 1, 1, '#8a6230');
    dot(p.x + Math.cos(p.rot) * 1.6, p.y + Math.sin(p.rot) * 1.2, 1, '#5a3d1c');
    dot(p.x - Math.cos(p.rot + 1.3) * 1.6, p.y - Math.sin(p.rot + 1.3) * 1.2, 1, '#e6cc8c'); return true;
  };
  REC.gl = function (p) { // 유탄: 진행 방향으로 선 탄두
    dirLob(p); ln(p.x - ux * 3, p.y - uy * 3, p.x + ux * 2, p.y + uy * 2, '#55683c', 3);
    dot(p.x + ux * 3, p.y + uy * 3, 2, '#d9b84a'); dot(p.x - ux * 3, p.y - uy * 3, 2, '#2f3a26'); return true;
  };
  REC.grenade = function (p) { // 우클릭 수류탄
    oval(p.x, p.y, '#4f6b34'); px(p.x - 1, p.y - 3, 2, 1, '#cfd6da');
    dot(p.x + Math.cos(p.rot) * 1.6, p.y + Math.sin(p.rot) * 1.2, 1, '#9fd36a'); return true;
  };
  REC.kimchi = function (p) { // 옹기 항아리가 빙글빙글, 국물이 뚝뚝
    var g = G; g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(p.rot * 0.5);
    g.fillStyle = '#3a2416'; g.fillRect(-4, -5, 8, 10);
    g.fillStyle = '#8a5a3a'; g.fillRect(-3, -3, 6, 7); g.fillRect(-4, -1, 8, 3);
    g.fillStyle = '#b07a4e'; g.fillRect(-2, -2, 1, 4);
    g.fillStyle = '#5a3a22'; g.fillRect(-3, -5, 6, 2);
    g.restore();
    if ((H + (T * 20 | 0)) % 3 === 0) dot(p.x - 3 + (H % 6), p.y + 6, 1, '#e0402a');
    return true;
  };
  REC.ricecooker = function (p) { // 전기밥솥: 뚜껑이 들썩, 김이 모락
    var g = G, flap = Math.sin(p.age * 26) > 0 ? 1 : 0;
    g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(Math.sin(p.rot * 0.6) * 0.5);
    g.fillStyle = '#2a2a2a'; g.fillRect(-5, -3, 10, 7);
    g.fillStyle = '#f2efe6'; g.fillRect(-4, -2, 8, 5);
    g.fillStyle = '#d04a3a'; g.fillRect(-4, 1, 8, 1);
    g.fillStyle = '#cfd6da'; g.fillRect(-4, -4 - flap * 2, 8, 2);
    g.fillStyle = '#2a2a2a'; g.fillRect(-1, -5 - flap * 2, 2, 1);
    g.restore();
    G.globalAlpha = 0.6; dot(p.x + Math.sin(p.age * 9) * 2, p.y - 8 - (p.age * 20 % 5), 2, '#ffffff'); G.globalAlpha = 1;
    return true;
  };
  REC.tshirt = function (p) { // 펄럭이는 흰 티셔츠
    var g = G, f = Math.sin(p.age * 24) > 0 ? 1 : 0;
    g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(p.rot * 0.35);
    g.fillStyle = '#f4f2ea'; g.fillRect(-3, -3, 6, 7); g.fillRect(-5, -3 + f, 2, 3); g.fillRect(3, -2 - f, 2, 3);
    g.fillStyle = '#1b1b1f'; g.fillRect(-1, -3, 2, 1);
    g.fillStyle = '#ffb347'; g.fillRect(-1, 0, 3, 2);
    g.restore(); return true;
  };
  REC.bottlerocket = function (p) { // 페트병 로켓 + 물보라
    dirLob(p);
    for (var i = 1; i <= 3; i++) dot(p.x - ux * (5 + i * 3) + Math.sin(p.age * 40 + i) * 1.5, p.y - uy * (5 + i * 3) + Math.cos(p.age * 33 + i) * 1.5, i === 3 ? 1 : 2, i === 1 ? '#ffffff' : '#bfe9ff');
    ln(p.x - ux * 4, p.y - uy * 4, p.x + ux * 3, p.y + uy * 3, '#8fd8e8', 3);
    ln(p.x - ux * 4 - uy * 2.5, p.y - uy * 4 + ux * 2.5, p.x - ux * 4 + uy * 2.5, p.y - uy * 4 - ux * 2.5, '#d04a3a', 1);
    dot(p.x + ux * 4, p.y + uy * 4, 2, '#3f8fe0'); return true;
  };
  REC.fireworks = function (p) { // 폭죽 로켓: 색이 도는 불꽃 꼬리
    dirLob(p);
    for (var i = 1; i <= 4; i++) dot(p.x - ux * (4 + i * 3) + Math.sin(p.age * 50 + i * 2 + H) * 2, p.y - uy * (4 + i * 3) + Math.cos(p.age * 41 + i * 3) * 2, 1, CONF[(H + i + (T * 20 | 0)) % 6]);
    ln(p.x - ux * 6, p.y - uy * 6, p.x + ux, p.y + uy, '#a2754a', 1);
    ln(p.x, p.y, p.x + ux * 3, p.y + uy * 3, CONF[(H + (T * 12 | 0)) % 6], 3);
    dot(p.x + ux * 4, p.y + uy * 4, 1, '#ffffff'); return true;
  };
  REC.flaregun = function (p) { // 조명탄: 붉은 빛무리 + 연기
    dirLob(p);
    G.globalAlpha = 0.5; for (var i = 1; i <= 3; i++) dot(p.x - ux * i * 5 + Math.sin(p.age * 8 + i) * 1.5, p.y - uy * i * 5 - i, 2, '#a8a8a8');
    G.globalAlpha = 0.22; dot(p.x, p.y, 9, '#ff3020'); G.globalAlpha = 0.45; dot(p.x, p.y, 5, '#ff5a3a'); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#fff0d0'); return true;
  };
  // ── 톱날 (saw) ──
  REC.weedwhacker = function (p) { // 예초기 줄날: 초록 줄이 빙빙, 풀 조각이 튄다
    var c = Math.cos(p.rot * 2) * 5, sn = Math.sin(p.rot * 2) * 5;
    ln(p.x - c, p.y - sn, p.x + c, p.y + sn, '#7bff6a', 1); ln(p.x + sn, p.y - c, p.x - sn, p.y + c, '#3fae3a', 1);
    dot(p.x, p.y, 3, '#ffb347'); dot(p.x, p.y, 1, '#2a2a2a');
    if (p.phase === 1) for (var i = 0; i < 2; i++) dot(p.x - 4 - ((p.age * 60 + i * 5 + H) % 9), p.y - 1 - ((p.age * 40 + i * 7) % 6), 1, i ? '#b6ff3c' : '#5fbf4a');
    return true;
  };
  // ── 음파 (wave) ──
  REC.karaoke = function (p) { // 분홍 음파 위에 음표가 실려 간다
    arcs(p, '#ff8fd0', 2, 3, 9);
    for (var i = 0; i < 3; i++) {
      var a = p.ang + (i - 1) * 0.22 + Math.sin(p.age * 6 + i) * 0.04, r = p.rad - 4 - i * 5;
      if (r > 6) note(p.ox + Math.cos(a) * r, p.oy + Math.sin(a) * r + Math.sin(p.age * 14 + i * 2) * 2, i === 1 ? '#ffffff' : '#ffe14a');
    }
    G.globalAlpha = 1; return true;
  };
  REC.leafblower = function (p) { // 바람결 + 낙엽
    arcs(p, '#e8f0f0', 1, 4, 7);
    for (var i = 0; i < 4; i++) {
      var a = p.ang + ((H + i * 37) % 60 - 30) / 100, r = p.rad - ((H * 3 + i * 11) % 14);
      if (r > 6) { var fl = Math.sin(p.age * 18 + i * 2) > 0; px(p.ox + Math.cos(a) * r, p.oy + Math.sin(a) * r + Math.sin(p.age * 10 + i) * 2, fl ? 3 : 2, fl ? 1 : 2, i % 2 ? '#d98a2c' : '#a8632a'); }
    }
    G.globalAlpha = 1; return true;
  };
  // ── 직사 (bullet) ──
  REC.capgun = function (p) { // 화약 딱지: 불똥 + 연기
    G.globalAlpha = 0.5; dot(p.x - ux * 5, p.y - uy * 5 - 1, 2, '#b8b8b8'); G.globalAlpha = 1;
    dot(p.x - ux * 2, p.y - uy * 2, 1, '#ff5a3a'); dot(p.x, p.y, 2, '#ffd23c'); return true;
  };
  REC.pitching = function (p) { // 야구공: 빨간 실밥이 돈다
    G.globalAlpha = 0.35; ln(p.x - ux * 9, p.y - uy * 9, p.x, p.y, '#ffffff', 2); G.globalAlpha = 1;
    ball(p.x, p.y, '#f4f2ea');
    var c = Math.cos(p.rot * 2) * 1.2, sn = Math.sin(p.rot * 2) * 1.2;
    dot(p.x + c, p.y + sn, 1, '#d8423a'); dot(p.x - c, p.y - sn, 1, '#d8423a'); return true;
  };
  REC.harpoon = function (p) { // 작살 + 뒤따르는 밧줄
    var tx = p.x - ux * 10, ty = p.y - uy * 10;
    ln(tx - ux * 12, ty - uy * 12 + Math.sin(p.age * 20) * 2, tx, ty, '#c9a878', 1);
    ln(tx, ty, p.x, p.y, '#8a94a3', 2);
    fins(p, 3, 2, '#cfd6da'); dot(p.x + ux, p.y + uy, 2, '#f2efe6'); return true;
  };
  REC.paintball = function (p) { // 발사마다 색이 바뀌는 물감 공
    var c = PAINT[(p.sid || H) % 6];
    G.globalAlpha = 0.4; dot(p.x - ux * 4, p.y - uy * 4, 2, c); G.globalAlpha = 1;
    dot(p.x, p.y, 3, c); px(p.x - 1.5, p.y - 1.5, 1, 1, '#ffffff'); return true;
  };
  REC.slotmachine = function (p) { // 도는 동전, 가끔 빨간 7
    if (H % 4 === 0) {
      var X = Math.round(p.x), Y = Math.round(p.y); G.fillStyle = '#ff4040';
      G.fillRect(X - 2, Y - 2, 4, 1); G.fillRect(X + 1, Y - 1, 1, 1); G.fillRect(X, Y, 1, 1); G.fillRect(X - 1, Y + 1, 1, 2); return true;
    }
    var w = 1 + Math.round(Math.abs(Math.cos(p.age * 25 + H)) * 3);
    px(p.x - w / 2, p.y - 2, w, 4, '#ffd23c'); if (w > 2) px(p.x - 0.5, p.y - 1, 1, 2, '#b8860b'); return true;
  };
  // 산탄: 긴 예광선 대신 동그란 알갱이 (탄약이 눈에 보이는 물건이면 그 모양을 뿌린다)
  function shot(p, s) {
    var a = AMMO[s.ids && s.ids.ammo];
    if (a && a(p, s)) return true;
    var c = fxCol(s);
    G.globalAlpha = 0.5; ln(p.x - ux * 4, p.y - uy * 4, p.x, p.y, c || '#9a9a90', 1); G.globalAlpha = 1;
    dot(p.x, p.y, 2, c ? '#ffffff' : '#e0e0d8'); return true;
  }
  REC.pump = REC.autoshotgun = REC.doublebarrel = REC.streetsweeper = shot;
  REC.flakgun = function (p) { // 대공 포탄 파편: 검은 쇳조각 + 불꼬리
    G.globalAlpha = 0.6; ln(p.x - ux * 5, p.y - uy * 5, p.x, p.y, '#ff8a3c', 1); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#3a3a3a'); px(p.x - 0.5, p.y - 0.5, 1, 1, '#ffd23c'); return true;
  };
  REC.amr = function (p, s) { return slug(p, s, '#d9b84a', 7); };
  REC.piledriver = function (p, s) { return slug(p, s, '#8a94a3', 11); };   // 말뚝
  REC.combine = function (p) { // 낟알 + 날리는 검불
    for (var i = 0; i < 2; i++) { var o = Math.sin(p.age * 30 + i * 3 + H) * 3; px(p.x - ux * (3 + i * 4) - uy * o, p.y - uy * (3 + i * 4) + ux * o, 2, 1, i ? '#c9a05a' : '#f3d98a'); }
    dot(p.x, p.y, 2, '#e6c458'); return true;
  };
  REC.sprinkler = function (p) { // 물방울
    G.globalAlpha = 0.6; dot(p.x - ux * 3, p.y - uy * 3, 1, '#bfe9ff'); G.globalAlpha = 1;
    dot(p.x, p.y, 2, '#8fd0ff'); px(p.x - 1, p.y - 1, 1, 1, '#ffffff'); return true;
  };
  REC.slingshot = function (p, s) { // 조약돌 (구슬 같은 탄약을 넣으면 그게 날아간다)
    var a = AMMO[s.ids && s.ids.ammo];
    if (a && a(p, s)) return true;
    dot(p.x, p.y, 3, '#a8a8a0'); px(p.x - 1 + (Math.sin(p.age * 30) > 0 ? 1 : 0), p.y - 1, 1, 1, '#6a6a64'); return true;
  };
  // ── 못·핀류 (nail) ──
  REC.stapler = function (p) { // ㄷ자 철심
    var ax = p.x - uy * 2, ay = p.y + ux * 2, bx = p.x + uy * 2, by = p.y - ux * 2;
    ln(ax, ay, bx, by, '#e8eef2', 1); ln(ax, ay, ax - ux * 2.5, ay - uy * 2.5, '#b8c0c8', 1); ln(bx, by, bx - ux * 2.5, by - uy * 2.5, '#b8c0c8', 1); return true;
  };
  REC.bbgun = function (p) { dot(p.x, p.y, 2, H % 2 ? '#f2f240' : '#ffffff'); return true; };
  REC.seeder = function (p) { // 씨앗, 가끔 싹이 튼 것
    dot(p.x, p.y, 2, H % 3 ? '#c9a05a' : '#8a6230'); if (H % 3 === 0) px(p.x - 0.5, p.y - 2.5, 1, 1, '#7bd94a'); return true;
  };
  REC.riceplanter = function (p) { // 모종: 흙뿌리가 앞, 잎이 뒤로
    ln(p.x - ux * 5 - uy * 1.5, p.y - uy * 5 + ux * 1.5, p.x, p.y, '#5fbf4a', 1); ln(p.x - ux * 5 + uy * 1.5, p.y - uy * 5 - ux * 1.5, p.x, p.y, '#9fe36a', 1);
    dot(p.x, p.y, 2, '#7a5230'); return true;
  };
  REC.dartgun = function (p) { // 다트: 빨간 깃
    ln(p.x - ux * 5, p.y - uy * 5, p.x, p.y, '#cfd6da', 1); fins(p, 5, 1.5, '#ff4040');
    dot(p.x - ux * 5, p.y - uy * 5, 1, '#ffd23c'); dot(p.x + ux, p.y + uy, 1, '#ffffff'); return true;
  };
  REC.crossbow = function (p) { // 석궁 볼트: 나무 자루 + 쇠촉 + 흰 깃
    ln(p.x - ux * 8, p.y - uy * 8, p.x - ux * 2, p.y - uy * 2, '#a2754a', 1); ln(p.x - ux * 2, p.y - uy * 2, p.x + ux, p.y + uy, '#e8eef2', 2);
    fins(p, 8, 1.5, '#f2efe6'); return true;
  };
  REC.rubberband = function (p) { // 꿈틀거리는 고무줄 고리
    var w = 4 + Math.round(Math.sin(p.age * 34 + H) * 2), h = 8 - w;
    G.strokeStyle = '#e0a060'; G.lineWidth = 1; G.strokeRect(Math.round(p.x - w / 2) + 0.5, Math.round(p.y - h / 2) + 0.5, w, h); return true;
  };

  /* ───────────── 2차 확장분 (data_parts_g/h) — 해당 id 가 없으면 그냥 쓰이지 않는다 ───────────── */
  function sheet(p, c) { var f = Math.sin(p.age * 20 + H) > 0; px(p.x - (f ? 2 : 1.5), p.y - (f ? 1.5 : 2), f ? 4 : 3, f ? 3 : 4, '#f4f2ea'); px(p.x - 1, p.y - 0.5, 2, 1, c || '#8a94a3'); return true; }
  function bigball(p, c, hi) { var X = Math.round(p.x), Y = Math.round(p.y); G.fillStyle = c; G.fillRect(X - 2, Y - 3, 4, 6); G.fillRect(X - 3, Y - 2, 6, 4); G.fillStyle = hi; G.fillRect(X - 2, Y - 2, 1, 1); }
  REC.homi = function (p) { // 빙글빙글 호미
    var c = Math.cos(p.rot * 2) * 3, sn = Math.sin(p.rot * 2) * 3;
    ln(p.x - c, p.y - sn, p.x + c, p.y + sn, '#a2754a', 1); ln(p.x + c, p.y + sn, p.x + c - sn, p.y + sn + c, '#cfd6da', 2); return true;
  };
  REC.topgun = function (p) { // 팽이
    var c1 = BALL[H % 6], X = Math.round(p.x), Y = Math.round(p.y);
    G.fillStyle = c1; G.fillRect(X - 3, Y - 4, 6, 2); G.fillRect(X - 1, Y, 2, 2);
    G.fillStyle = '#f4f2ea'; G.fillRect(X - 2, Y - 2, 4, 2); G.fillRect(X - 3 + ((p.rot * 3 | 0) % 6), Y - 4, 1, 2);
    G.fillStyle = '#cfd6da'; G.fillRect(X, Y + 2, 1, 1); G.fillRect(X, Y - 6, 1, 2); return true;
  };
  REC.bowling = function (p) { // 볼링공: 손가락 구멍이 구른다
    bigball(p, '#2a3a8a', '#8fa8ff');
    var c = Math.cos(p.rot) * 1.5, sn = Math.sin(p.rot) * 1.5; dot(p.x + c, p.y + sn, 1, '#0a0a1a'); dot(p.x + c - sn * 0.8, p.y + sn + c * 0.8, 1, '#0a0a1a'); return true;
  };
  REC.putter = function (p, s) { return AMMO.ammo_golf(p, s); };
  REC.printer = function (p) { return sheet(p, '#5a626e'); };
  REC.scarecrowbow = REC.crossbow;
  REC.compoundbow = function (p) { ln(p.x - ux * 9, p.y - uy * 9, p.x, p.y, '#3a3f47', 1); dot(p.x + ux, p.y + uy, 2, '#e8eef2'); fins(p, 9, 1.5, '#7bff6a'); return true; };
  REC.tiller = function (p) { // 흙덩이
    G.globalAlpha = 0.5; dot(p.x - ux * 4, p.y - uy * 4 + 1, 2, '#8a7a5a'); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#7a5230'); px(p.x - 0.5, p.y - 1.5, 1, 1, '#a2754a'); return true;
  };
  REC.pressurecooker = function (p) { // 압력: 흰 탄두 + 김
    G.globalAlpha = 0.5; for (var i = 1; i <= 3; i++) dot(p.x - ux * i * 6 + Math.sin(p.age * 30 + i) * 1.5, p.y - uy * i * 6 - i, 2, '#ffffff'); G.globalAlpha = 1;
    ln(p.x - ux * 6, p.y - uy * 6, p.x, p.y, '#e8eef2', 2); dot(p.x + ux, p.y + uy, 2, '#ffffff'); return true;
  };
  REC.dronehive = function (p) { // 초소형 드론
    var X = Math.round(p.x), Y = Math.round(p.y), f = (T * 30 + H | 0) % 2;
    G.fillStyle = '#2a2f38'; G.fillRect(X - 1, Y - 1, 3, 2);
    G.fillStyle = '#9aa3ad'; G.fillRect(X - 3 + f, Y - 2, 2, 1); G.fillRect(X + 2 - f, Y - 2, 2, 1);
    G.fillStyle = f ? '#ff4040' : '#5fe6ff'; G.fillRect(X, Y, 1, 1); return true;
  };
  REC.sewerpump = function (p) { // 오수 덩어리
    G.globalAlpha = 0.6; dot(p.x - ux * 4, p.y - uy * 4 + 1, 2, '#4a5a2a'); G.globalAlpha = 1;
    dot(p.x, p.y, 4, '#6a7a3a'); px(p.x - 1, p.y - 2, 1, 1, '#a8b85a'); px(p.x, p.y, 1, 1, '#3a4a22'); return true;
  };
  REC.papershredder = function (p) { // 종이 가루
    var k = p.life ? p.age / p.life : 0, r = p.r || 3;
    G.globalAlpha = Math.max(0, 0.9 * (1 - k));
    for (var i = 0; i < 3; i++) { var f = (H + i) % 2; px(p.x + Math.sin(p.age * 25 + i * 2 + H) * r, p.y + Math.cos(p.age * 19 + i * 3 + H) * r, f ? 3 : 1, f ? 1 : 3, i ? '#f4f2ea' : '#d8dee4'); }
    G.globalAlpha = 1; return true;
  };
  REC.tambourine = function (p) { // 짤랑이
    arcs(p, '#ffd76a', 1, 3, 7);
    for (var i = 0; i < 3; i++) { var a = p.ang + (i - 1) * 0.24, r = p.rad - 3 - (i % 2) * 5; if (r > 6) dot(p.ox + Math.cos(a) * r, p.oy + Math.sin(a) * r + Math.sin(p.age * 40 + i * 2) * 1.5, 2, i % 2 ? '#ffffff' : '#e8eef2'); }
    G.globalAlpha = 1; return true;
  };
  REC.organ = function (p) { // 장엄한 화음
    arcs(p, '#ffd76a', 2, 4, 8);
    for (var i = 0; i < 4; i++) { var a = p.ang + (i - 1.5) * 0.17, r = p.rad - 5 - (i % 2) * 7; if (r > 6) note(p.ox + Math.cos(a) * r, p.oy + Math.sin(a) * r + Math.sin(p.age * 10 + i * 2) * 2, i % 2 ? '#ffffff' : '#ffe9a0'); }
    G.globalAlpha = 1; return true;
  };
  REC.spinewhip = function (p) { // 척추 마디가 휩쓴다
    arcs(p, '#f4eeda', 2, 1, 6);
    for (var i = -3; i <= 3; i++) { var a = p.ang + i * 0.1; dot(p.ox + Math.cos(a) * p.rad, p.oy + Math.sin(a) * p.rad, i % 2 ? 2 : 3, i % 2 ? '#d9d0b3' : '#f4eeda'); }
    G.globalAlpha = 1; return true;
  };
  AMMO.ammo_gravel = function (p) { dot(p.x, p.y, 2, H % 2 ? '#a8a8a0' : '#8a8a84'); return true; };
  AMMO.ammo_acorn = function (p) { dot(p.x, p.y, 3, '#a2754a'); px(p.x - 1.5, p.y - 2.5, 3, 1, '#5e321d'); px(p.x - 0.5, p.y + 1.5, 1, 1, '#7a5230'); return true; };
  AMMO.ammo_gonggi = function (p) { dot(p.x, p.y, 3, BALL[H % 6]); px(p.x - 1.5, p.y - 1.5, 1, 1, '#ffffff'); return true; };
  AMMO.ammo_mugwort = function (p) {
    G.globalAlpha = 0.5; dot(p.x - ux * 4, p.y - uy * 4 - 1, 2, '#c8c8c8'); dot(p.x - ux * 8, p.y - uy * 8 - 3, 1, '#c8c8c8'); G.globalAlpha = 1;
    dot(p.x, p.y, 3, '#6a8a4a'); px(p.x + ux - 0.5, p.y + uy - 0.5, 1, 1, '#ff8a3c'); return true;
  };
  AMMO.ammo_puck = function (p) { px(p.x - 2, p.y - 1, 4, 2, '#1b1b1f'); px(p.x - 2, p.y - 1, 4, 1, '#6a6a72'); return true; };
  AMMO.ammo_gum = function (p) { ball(p.x, p.y, '#ff8fc0'); px(p.x - 1, p.y - 1, 1, 1, '#ffffff'); G.globalAlpha = 0.6; ln(p.x - ux * 5, p.y - uy * 5, p.x, p.y, '#ff8fc0', 1); G.globalAlpha = 1; return true; };
  AMMO.ammo_tack = function (p) { ln(p.x - ux * 3, p.y - uy * 3, p.x, p.y, '#e8eef2', 1); dot(p.x - ux * 3, p.y - uy * 3, 2, '#ffd23c'); return true; };
  AMMO.ammo_seedbomb = function (p) { ball(p.x, p.y, '#7a5230'); px(p.x - 1, p.y - 3, 1, 1, '#7bd94a'); px(p.x + 1, p.y - 2, 1, 1, '#9fe36a'); return true; };
  AMMO.ammo_epee = function (p) { ln(p.x - ux * 11, p.y - uy * 11, p.x, p.y, '#e8eef2', 1); dot(p.x - ux * 11, p.y - uy * 11, 2, '#cfd6da'); dot(p.x, p.y, 1, '#ffffff'); return true; };
  AMMO.ammo_reject = function (p) { return sheet(p, '#d8423a'); };
  AMMO.ammo_snapper = function (p) { dot(p.x, p.y, 2, '#f4f2ea'); px(p.x - ux * 2 - 0.5, p.y - uy * 2 - 0.5, 1, 1, '#d8c8a0'); return true; };
  AMMO.ammo_scalpel = function (p) { ln(p.x - ux * 6, p.y - uy * 6, p.x - ux * 2, p.y - uy * 2, '#8a94a3', 1); ln(p.x - ux * 2, p.y - uy * 2, p.x + ux * 2, p.y + uy * 2, '#ffffff', 2); return true; };
  AMMO.ammo_shotput = function (p) { bigball(p, '#3a3f47', '#9aa3ad'); return true; };
  AMMO.ammo_hive = function (p) {
    dot(p.x, p.y, 4, '#c9a05a'); px(p.x - 2, p.y - 0.5, 4, 1, '#8a6230');
    for (var i = 0; i < 2; i++) dot(p.x + Math.sin(p.age * 40 + i * 3 + H) * 4, p.y + Math.cos(p.age * 33 + i * 2) * 4, 1, '#ffe14a'); return true;
  };
  AMMO.ammo_meteor = function (p) {
    G.globalAlpha = 0.6; ln(p.x - ux * 12, p.y - uy * 12, p.x, p.y, '#ff8a3c', 2); G.globalAlpha = 1;
    dot(p.x - ux * 4, p.y - uy * 4, 2, '#ffd23c'); dot(p.x, p.y, 3, '#3a2a22'); px(p.x - 0.5, p.y - 0.5, 1, 1, '#ff5a3a'); return true;
  };
  AMMO.ammo_lotto = function (p) { ball(p.x, p.y, BALL[H % 6]); px(p.x - 0.5, p.y - 0.5, 1, 1, '#ffffff'); return true; };

  /* ───────────── 진입점 ───────────── */
  function draw(g, p, s, t) {
    if (!g || !p || !s) return false;
    var k = p.kind, rid = s.receiver && s.receiver.id, ids = s.ids, f;
    G = g; T = t || 0;
    H = p._h; if (H === undefined) H = p._h = (Math.random() * 4096) | 0;
    if (k === 'bullet' || k === 'nail' || k === 'saw') {
      var vx = p.vx || 0, vy = p.vy || 0, sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 0) { ux = vx / sp; uy = vy / sp; } else { ux = 1; uy = 0; }
    }
    if (k === 'bullet' && ids && ids.muzzle === 'muz_bubble') return false;   // 비눗방울 총구는 combat.js 가 그린다
    f = REC[rid];
    if (f) return f(p, s) === true;
    if (k === 'bullet' && ids) { f = AMMO[ids.ammo]; if (f) return f(p, s) === true; }
    return false;
  }

  root.ProjArt = { draw: draw, REC: REC, AMMO: AMMO };
})();
