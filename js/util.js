// BUNKER 404 — 공용 유틸
'use strict';
const U = {
  // 시드 기반 난수 (달력 생성용)
  rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  rand(a, b) { return a + Math.random() * (b - a); },
  randi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(arr, r) { return arr[Math.floor((r ? r() : Math.random()) * arr.length)]; },
  chance(p) { return Math.random() < p; },
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); },
  shuffle(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((r ? r() : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  // 가중치 선택: [{w:1, ...}]
  wpick(list, r) {
    let tot = 0;
    for (const it of list) tot += it.w;
    let x = (r ? r() : Math.random()) * tot;
    for (const it of list) { x -= it.w; if (x <= 0) return it; }
    return list[list.length - 1];
  },
  fmt(n) {
    if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
    return String(Math.round(n));
  },
  pct(v) { return (v > 0 ? '+' : '') + Math.round(v * 100) + '%'; },
  // 선분-사각형 교차 (slab). 교차 시 진입 t(0..1), 아니면 -1
  segRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const dx = x2 - x1, dy = y2 - y1;
    let t0 = 0, t1 = 1;
    const p = [-dx, dx, -dy, dy];
    const q = [x1 - rx, rx + rw - x1, y1 - ry, ry + rh - y1];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return -1; }
      else {
        const t = q[i] / p[i];
        if (p[i] < 0) { if (t > t1) return -1; if (t > t0) t0 = t; }
        else { if (t < t0) return -1; if (t < t1) t1 = t; }
      }
    }
    return t0;
  },
  esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
};
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
