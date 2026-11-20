#!/usr/bin/env node
// BUNKER 404 — 헤드리스 시뮬레이션 하네스 (Node 코어만 사용, 브라우저 불필요)
//
//   node dev/headless.js waves <일차,일차,...> [skill=1] [repeats=1]
//   node dev/headless.js autoplay [days=30] [skill=1] [runs=1]
//   node dev/headless.js eval "<js 식>"
//
// 게임 스크립트(클래식 <script>)를 vm 컨텍스트 하나에 순서대로 올리고,
// 캔버스·DOM 은 아무것도 그리지 않는 스텁으로 대체한 뒤 dev/sim.js 의 봇을 돌린다.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { performance } = require('perf_hooks');

const ROOT = path.join(__dirname, '..');
const warns = [];

/* ───────── 브라우저 스텁 ───────── */
const noop = function () {};
const GRAD = { addColorStop: noop };
const CTX_METHODS = ['save', 'restore', 'translate', 'rotate', 'scale', 'transform', 'setTransform', 'resetTransform', 'fillRect', 'strokeRect', 'clearRect',
  'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'rect', 'roundRect', 'quadraticCurveTo', 'bezierCurveTo', 'fill', 'stroke', 'clip',
  'fillText', 'strokeText', 'drawImage', 'putImageData', 'setLineDash'];
// 모르는 멤버를 읽으면 noop 함수가 나오는 프로토타입 (자주 쓰는 것은 own property 라 빠르다)
const CTX_FALLBACK = new Proxy({}, { get(t, k) { return typeof k === 'symbol' ? undefined : noop; } });
function makeCtx2d(canvas) {
  const c = {
    canvas, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1, font: '10px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    shadowColor: '', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, lineJoin: 'miter', lineCap: 'butt', miterLimit: 10, lineDashOffset: 0,
    imageSmoothingEnabled: false, globalCompositeOperation: 'source-over', filter: 'none',
    measureText: () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 }),
    createLinearGradient: () => GRAD, createRadialGradient: () => GRAD, createConicGradient: () => GRAD, createPattern: () => ({}),
    getImageData: (x, y, w, h) => ({ data: [], width: w || 0, height: h || 0 }),
    createImageData: (w, h) => ({ data: [], width: w || 0, height: h || 0 }),
    getLineDash: () => [], isPointInPath: () => false, isPointInStroke: () => false,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
  };
  for (const k of CTX_METHODS) c[k] = noop;
  Object.setPrototypeOf(c, CTX_FALLBACK);
  return c;
}
function makeEl(tag, id) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(), id: id || '', width: 300, height: 150, style: {}, dataset: {}, children: [],
    className: '', innerHTML: '', textContent: '', value: '', disabled: false, scrollTop: 0,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
    appendChild: c => c, removeChild: c => c, remove: noop, setAttribute: noop, getAttribute: () => null,
    querySelector: () => null, querySelectorAll: () => [], closest: () => null, focus: noop, select: noop, click: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, x: 0, y: 0, width: el.width || 1, height: el.height || 1, right: el.width || 1, bottom: el.height || 1 }),
    getContext: () => el._ctx || (el._ctx = makeCtx2d(el)),
    toDataURL: () => '',
  };
  return el;
}
const byId = {};
const documentStub = {
  readyState: 'complete', visibilityState: 'visible', scripts: [],
  getElementById(id) { if (!byId[id]) { byId[id] = makeEl(id === 'game-canvas' || id === 'bg-canvas' ? 'canvas' : 'div', id); if (id === 'game-canvas') { byId[id].width = 1280; byId[id].height = 720; } } return byId[id]; },
  createElement: tag => makeEl(tag),
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true,
};
documentStub.body = makeEl('body'); documentStub.head = makeEl('head'); documentStub.documentElement = makeEl('html');

const store = new Map();
const localStorageStub = {
  getItem: k => (store.has(String(k)) ? store.get(String(k)) : null),
  setItem: (k, v) => { store.set(String(k), String(v)); },
  removeItem: k => { store.delete(String(k)); },
  clear: () => store.clear(),
};

// window 용 아주 작은 이벤트 버스: combat.js 의 keydown 리스너(수류탄)를 sim.js 가 dispatchEvent 로 부른다
const listeners = {};
const sandbox = {
  console: { log: (...a) => console.log(...a), info: (...a) => console.log(...a), warn: (...a) => console.warn(...a), error: (...a) => console.error(...a), debug: noop },
  document: documentStub, localStorage: localStorageStub, performance,
  navigator: { userAgent: 'node-headless', language: 'ko-KR' }, location: { href: 'headless://bunker404/', origin: 'headless://bunker404', search: '' },
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  requestAnimationFrame: () => 0, cancelAnimationFrame: noop,       // 절대 호출되지 않는다 — 프레임은 Combat.debug.step 으로만 진행
  setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop, // 프로세스를 붙잡지 않도록 전부 no-op
  addEventListener(type, fn) { if (typeof fn === 'function') (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener(type, fn) { const l = listeners[type]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } },
  dispatchEvent(ev) { const l = listeners[ev && ev.type]; if (l) for (const fn of l.slice()) fn(ev); return !(ev && ev.defaultPrevented); },
  alert: noop, confirm: () => true, prompt: () => null,
};
const context = vm.createContext(sandbox);
vm.runInContext(`
  var window = globalThis, self = globalThis;
  class Event { constructor(type, init) { this.type = type; Object.assign(this, init || {}); this.defaultPrevented = false; } preventDefault() { this.defaultPrevented = true; } stopPropagation() {} stopImmediatePropagation() {} }
  class KeyboardEvent extends Event { constructor(type, init) { super(type, init); if (this.key == null) this.key = ''; } }
  class MouseEvent extends Event { constructor(type, init) { super(type, init); if (this.button == null) this.button = 0; if (this.clientX == null) this.clientX = 0; if (this.clientY == null) this.clientY = 0; } }
  globalThis.Event = Event; globalThis.KeyboardEvent = KeyboardEvent; globalThis.MouseEvent = MouseEvent;
`, context, { filename: 'headless-prelude.js' });

/* ───────── 스크립트 로드 ───────── */
function load(rel, required) {
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) { if (required) throw new Error(`${rel} 이(가) 없습니다`); return false; }
  try { vm.runInContext(fs.readFileSync(f, 'utf8'), context, { filename: rel }); return true; }
  catch (e) { if (required) throw e; warns.push(`${rel} 건너뜀: ${e.message}`); return false; }
}
const ev = (code) => vm.runInContext(code, context, { filename: 'headless-eval.js' });
const jsFiles = fs.readdirSync(path.join(ROOT, 'js'));
const extData = jsFiles.filter(f => /^data_parts_\w+\.js$/.test(f)).sort();
const extArt = jsFiles.filter(f => /^gunart_ext_\w+\.js$/.test(f)).sort();

const tLoad = performance.now();
try {
  load('js/util.js', true);
  load('js/data_parts.js', true);
  for (const f of extData) load('js/' + f, false);
  load('js/data_enemies.js', true);
  load('js/data_world.js', true);
  load('js/data_world2.js', false);
  load('js/gun.js', true);
  // 총기 그림: 전투는 metrics() 만 필요하다. 깨끗하게 올라오면 진짜를 쓰고(그리기는 꺼 둠), 아니면 스텁.
  let artOk = load('js/gunart.js', false);
  if (artOk) for (const f of extArt) load('js/' + f, false);
  if (artOk) artOk = ev(`(function () { try { var m = GunArt.metrics({ receiver: 'ar', barrel: 'barrel_long', mag: 'mag_ext' }); return [m.muzzleX, m.muzzleY, m.minX, m.maxX, m.minY, m.maxY].every(Number.isFinite); } catch (e) { return false; } })()`);
  if (artOk) ev(`GunArt.draw = function () {}; GunArt.iconURL = function () { return ''; }; GunArt.gunURL = function () { return ''; };`);
  else { warns.push('gunart.js 를 쓸 수 없어 GunArt 스텁 사용'); ev(`globalThis.GunArt = { draw() {}, iconURL() { return ''; }, gunURL() { return ''; }, metrics() { return { muzzleX: 30, muzzleY: -6, minX: -20, maxX: 40, minY: -15, maxY: 12 }; } };`); }
  load('js/game.js', true);
  load('js/combat.js', true);
  load('dev/sim.js', true);
  // 스크립트 최상위 const 가 컨텍스트 전체에서 보이는지 확인
  const vis = ev(`[typeof U, typeof PARTS, typeof PART_LIST, typeof ENEMIES, typeof Waves, typeof Gun, typeof Game, typeof Combat, typeof simWave, typeof runAll, typeof autoplay].join(',')`);
  if (vis !== 'object,object,object,object,object,object,object,object,function,function,function') throw new Error('전역 선언이 보이지 않음: ' + vis);
} catch (e) {
  console.error('[headless] 로드 실패:', e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : e);
  process.exit(1);
}
const loadMs = performance.now() - tLoad;

/* ───────── CLI ───────── */
const fmtMs = ms => (ms >= 1000 ? (ms / 1000).toFixed(1) + 's' : Math.round(ms) + 'ms');
const num = (v, d) => { const n = Number(v); return v == null || v === '' || !Number.isFinite(n) ? d : n; };
function header() {
  const n = ev('PART_LIST.length'), e = ev('Object.keys(ENEMIES).length');
  console.log(`[headless] 파츠 ${n}종 · 적 ${e}종 · 확장 데이터 ${extData.length}개 · 로드 ${fmtMs(loadMs)}`);
  for (const w of warns) console.log('[headless] 경고: ' + w);
}
function timed(label, fn) {
  const t0 = performance.now();
  const r = fn();
  console.log(`[headless] ${label} 소요 ${fmtMs(performance.now() - t0)}`);
  return r;
}
function summarize(log) {
  let wins = 0, losses = 0, quiet = 0; const grades = {};
  for (const l of log.split('\n')) {
    if (!/^d\d+ /.test(l)) continue;
    const m = l.match(/\| th\d.*?\b(WIN|LOSE) ([SABCDF])\b/);
    if (m) { if (m[1] === 'WIN') wins++; else losses++; grades[m[2]] = (grades[m[2]] || 0) + 1; }
    else if (/\| quiet/.test(l)) quiet++;
  }
  const hist = ['S', 'A', 'B', 'C', 'D', 'F'].filter(g => grades[g]).map(g => `${g}:${grades[g]}`).join(' ') || '-';
  return { wins, losses, quiet, hist };
}

function cmdWaves(args) {
  const days = String(args[0] || '').split(',').map(s => parseInt(s, 10)).filter(n => n > 0);
  if (!days.length) { console.log('사용법: node dev/headless.js waves <일차,일차,...> [skill=1] [repeats=1]'); return 1; }
  const skill = num(args[1], 1), rep = Math.max(1, Math.round(num(args[2], 1)));
  const known = ev('Object.keys(LOAD).map(Number)').slice().sort((a, b) => a - b);
  const allKnown = days.every(d => known.includes(d));
  console.log(`[headless] waves days=${days.join(',')} skill=${skill} repeats=${rep}`);
  const out = timed('waves', () => {
    if (allKnown) return ev(`runAll(${JSON.stringify(days)}, ${skill}, ${rep})`);
    // LOAD 에 없는 일차는 그 이전의 가장 가까운 장비 구성으로 돌린다
    return ev(`(function (days, skill, n, known) {
      const out = [];
      for (const d of days) for (let i = 0; i < n; i++) {
        let k = known[0]; for (const x of known) if (x <= d) k = x;
        const L = LOAD[k], boss = d % 10 === 0 ? Waves.bossFor(d) : null;
        const r = simWave(d, L[0], L[1], L[2], boss ? 5 : 3, { boss, skill });
        out.push('d' + r.day + ' ' + (r.win ? 'WIN ' : 'LOSE') + ' t=' + r.t + ' k=' + r.kills + ' gate=' + r.gate + ' dps=' + r.dps + '/' + r.sheet + ' nuts=' + r.nuts + (k !== d ? '  (' + k + '일차 장비)' : ''));
      }
      Combat.stop();
      return out.join('\\n') + '\\nERR ' + JSON.stringify([...new Set(window.__errs)].slice(0, 5));
    })(${JSON.stringify(days)}, ${skill}, ${rep}, ${JSON.stringify(known)})`);
  });
  console.log(out);
  return 0;
}
function cmdAutoplay(args) {
  const days = Math.max(1, Math.round(num(args[0], 30))), skill = num(args[1], 1), runs = Math.max(1, Math.round(num(args[2], 1)));
  console.log(`[headless] autoplay days=${days} skill=${skill} runs=${runs}`);
  const sums = [];
  for (let r = 1; r <= runs; r++) {
    const t0 = performance.now();
    const log = ev(`autoplay(${skill}, ${days})`);
    const ms = performance.now() - t0;
    console.log(`── run ${r}/${runs} ──`);
    console.log(log);
    const s = summarize(log), st = ev('({ lives: Game.s.lives, day: Game.s.day, over: !!Game.s.over, won: !!Game.s.won })');
    const line = `요약 run ${r}: 승 ${s.wins} · 패 ${s.losses} · 조용한 밤 ${s.quiet} · 남은 목숨 ${st.lives} · 도달 ${st.day}일차${st.over ? ' · GAME OVER' : ''}${st.won ? ' · 30일 클리어' : ''} · 등급 ${s.hist} · ${fmtMs(ms)}`;
    console.log(line);
    sums.push(line);
  }
  if (runs > 1) { console.log('── 전체 요약 ──'); for (const l of sums) console.log(l); }
  return 0;
}
async function cmdEval(args) {
  const code = args.join(' ');
  if (!code.trim()) { console.log('사용법: node dev/headless.js eval "<js 식>"'); return 1; }
  let r = timed('eval', () => ev(code));
  if (r && typeof r.then === 'function') r = await r;
  if (typeof r === 'string') console.log(r);
  else { try { const j = JSON.stringify(r, null, 2); console.log(j === undefined ? String(r) : j); } catch (e) { console.log(String(r)); } }
  return 0;
}

(async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  header();
  const t0 = performance.now();
  let code = 0;
  try {
    if (cmd === 'waves') code = cmdWaves(args);
    else if (cmd === 'autoplay') code = cmdAutoplay(args);
    else if (cmd === 'eval') code = await cmdEval(args);
    else {
      console.log('사용법:\n  node dev/headless.js waves <일차,일차,...> [skill=1] [repeats=1]\n  node dev/headless.js autoplay [days=30] [skill=1] [runs=1]\n  node dev/headless.js eval "<js 식>"');
      code = cmd ? 1 : 0;
    }
  } catch (e) {
    console.error('[headless] 실행 오류:', e && e.stack ? e.stack.split('\n').slice(0, 6).join('\n') : e);
    code = 1;
  }
  console.log(`[headless] 총 소요 ${fmtMs(performance.now() - t0)} (로드 제외)`);
  process.exit(code);
})();
