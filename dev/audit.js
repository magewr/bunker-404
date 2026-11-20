// 개발용: 파츠 밸런스 감사.   node dev/audit.js          (전체 표 + 경고)
//                              node dev/audit.js --flags  (경고만)
// 각 파츠(몸통 제외)를 기준 총 6자루에 +0 강화로 달았을 때의 한계 효과를 잰다.
// 기준선은 "그 슬롯을 비운 기준 총"이다 (파츠 자신의 기여분만 보기 위해).
// 역할 화력 = Gun.compute 의 dpsElite/dpsSwarm 에 지속 화력 비율을 곱하고,
//            compute 가 반영하지 않는 것(탄퍼짐·반동·방어 관통·화상·산성·빙결·표식·걸림·일부 특수 효과)을 어림으로 더한 값.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, Date, isNaN, parseFloat, parseInt };
ctx.globalThis = ctx; ctx.window = ctx;
vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8') + '\n;0', ctx, { filename: f });
// --skip=g,h : 해당 확장 파일의 파츠는 경고에서 제외 (아직 작성 중인 파일을 건너뛸 때)
const skipX = ((process.argv.find(a => a.startsWith('--skip=')) || '').slice(7) || '').split(',').filter(Boolean);
const skipIds = new Set();
load('js/util.js'); load('js/data_parts.js');
for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => /^data_parts_\w+\.js$/.test(f)).sort()) {
  const before = new Set(vm.runInContext('PART_LIST.map(p => p.id)', ctx));
  try { load('js/' + f); if (skipX.includes(f.replace(/^data_parts_|\.js$/g, ''))) for (const id of vm.runInContext('PART_LIST.map(p => p.id)', ctx)) if (!before.has(id)) skipIds.add(id); } catch (e) { console.log(`경고: ${f} 로드 실패 (${e.message}) — 건너뜀`); }
}
load('js/gun.js');
vm.runInContext('globalThis.__A = { PARTS, PART_LIST, STATS, FX, Gun, SLOTS };', ctx);
const { PARTS, PART_LIST, STATS, Gun } = ctx.__A;
const flagsOnly = process.argv.includes('--flags');

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const getInst = id => ({ uid: id, id, q: 0 });

const REFS = [
  { n: 'pistol', slots: { receiver: 'pipe_pistol' } },
  { n: 'ar', slots: { receiver: 'ar', barrel: 'barrel_long', mag: 'mag_ext', stock: 'stock_wood', sight: 'sight_reddot' } },
  { n: 'pump', slots: { receiver: 'pump', mag: 'mag_lunch', stock: 'stock_wood' } },
  { n: 'dmr', slots: { receiver: 'dmr', barrel: 'barrel_rifled', sight: 'sight_scope' } },
  { n: 'laser', slots: { receiver: 'laser' } },
  { n: 'lmg', slots: { receiver: 'lmg', mag: 'mag_drum' } },
];
const CAP = [18, 28, 42, 60, 85];
const BAND = [[30, 40], [40, 55], [90, 130], [140, 230], [230, 300]];

// 역할 화력 추정 (대보스 E / 대군중 S)
function value(st) {
  const sps = st.sps, fx = st.fx, sp = st.sp;
  const susK = st.dps > 0 ? st.sustained / st.dps : 1;
  // 대군중 화력은 gun.js 의 dpsSwarm 을 그대로 쓰지 않고 다시 셈한다: 폭발 이득을 반경²(면적)에 비례시켜 작은 폭발을 과대평가하지 않는다.
  const exG = fx.explode ? clamp(Math.pow(fx.explode / 40, 2) * 0.9, 0.05, 1.6) * (st.proj === 'lob' ? 1 : 0.6) : 0;
  let E = st.dpsElite * susK;
  let S = st.dps * Math.max(0.1, 1 + st.swarm / 100) * (1 + Math.min(4, st.pierce) * 0.22 + exG + (fx.shock ? 0.15 * fx.shock : 0) + (fx.bounce ? 0.15 * fx.bounce : 0)) * (1 + (sp.opener || 0) / 250 + (sp.momentum || 0) * 2.5 / 100) * (st.proj === 'flame' || st.proj === 'wave' ? 1.8 : 1) * susK;
  let spread = st.spread + st.recoil * (st.rpm > 300 ? 0.8 : 0.25);
  if (fx.homing) spread *= 1 - 0.4 * Math.min(1, fx.homing);
  E *= clamp(1 - spread * 0.04, 0.4, 1); S *= clamp(1 - spread * 0.015, 0.6, 1);
  const pen = Math.max(-60, st.pen);
  E *= 1 + pen / 100 * 0.35; S *= 1 + pen / 100 * 0.08;
  if (fx.burn) { E += fx.burn * 3; S += fx.burn * 5; }
  if (fx.acid) { E *= 1 + 0.05 * Math.min(6, fx.acid); S *= 1 + 0.02 * Math.min(6, fx.acid); }
  if (fx.freeze) { const f = Math.min(1, fx.freeze); E *= 1 + f * 0.15; S *= 1 + f * 0.3; }
  if (fx.rad) { E *= 1 + 0.04 * Math.min(10, fx.rad * 4); S *= 1 + 0.04 * Math.min(10, fx.rad * 1.5); }
  if (sp.execute) { const k = 1 / (0.65 + 0.35 / (1 + sp.execute / 100)); E *= k; S *= k; }
  if (sp.overkill) S *= 1.15;
  if (st.knock) S *= 1 + Math.min(120, st.knock) / 600;
  if (st.jam) { const k = 1 / (1 + st.jam / 100 * 0.4 * sps); E *= k; S *= k; }
  if (sp.stamp) { const k = 1 + 1.5 / sp.stamp; E *= k; S *= k; }
  if (sp.tax) E *= 1 + sp.tax;
  if (sp.overtime) { E *= 1 + sp.overtime * 0.3; S *= 1 + sp.overtime * 0.3; }
  if (sp.predator) S *= 1 + sp.predator * 0.6;
  if (sp.popcorn) S *= 1 + sp.popcorn * 0.5;
  if (sp.plague) S *= 1.1;
  if (sp.mint) S *= 1.1;
  if (sp.sonic) S *= 1 + 4 / sp.sonic;
  if (sp.fear) S *= 1 + sp.fear * 2;
  if (sp.screech) S *= 1 + sp.screech * 3;
  if (sp.duck) S *= 1 + sp.duck * 4;
  if (sp.freeAmmo) { const k = 1 + sp.freeAmmo * 0.3; E *= k; S *= k; }
  return { E, S, sus: st.sustained };
}
const UTIL_M = ['loot'], UTIL_FX = ['leech', 'gold'], UTIL_SP = ['thermal', 'cheap', 'thorns', 'coupon', 'scrapper', 'feast', 'regen', 'washer', 'horn', 'freeAmmo'];
function hasUtility(p) {
  return (p.m && UTIL_M.some(k => p.m[k] > 0)) || (p.fx && UTIL_FX.some(k => p.fx[k])) || (p.sp && UTIL_SP.some(k => p.sp[k])) || !!p.suppressed;
}
function pureUtility(p) { // 전리품/수리/황금만 주는 파츠
  const mk = Object.keys(p.m || {}).filter(k => p.m[k]), fk = Object.keys(p.fx || {}), sk = Object.keys(p.sp || {});
  return mk.every(k => UTIL_M.includes(k)) && fk.every(k => UTIL_FX.includes(k)) && sk.every(k => UTIL_SP.includes(k)) && (mk.length + fk.length + sk.length > 0);
}
function allGood(p) {
  for (const k in p.m || {}) { const v = p.m[k], meta = STATS[k]; if (!meta || !v) continue; if ((v > 0) !== (meta.good > 0)) return false; }
  return true;
}

const rows = [], flags = { OVER: [], NODOWNSIDE: [], DEAD: [], AMMOCOST: [], RECEIVER: [] };
const pc = v => (v >= 0 ? '+' : '') + Math.round(v) + '%';
for (const p of PART_LIST) {
  if (p.slot === 'receiver' || skipIds.has(p.id)) continue;
  const key = p.slot === 'acc' ? 'acc1' : p.slot;
  let bestE = -1e9, bestS = -1e9, sumSus = 0, cost = 0, cpm = 0, n = 0;
  const per = [];
  for (const ref of REFS) {
    // 고정 수치 효과(화상·절삭 등)가 등급에 안 맞는 약한 총에서 부풀려지는 것을 막는다: T2+ 는 파이프 권총 제외, T3+ 는 펌프 샷건도 제외
    if ((p.tier >= 2 && ref.n === 'pistol') || (p.tier >= 3 && ref.n === 'pump')) continue;
    const baseSlots = Object.assign({}, ref.slots); delete baseSlots[key];
    const withSlots = Object.assign({}, baseSlots); withSlots[key] = p.id;
    const a = Gun.compute({ name: null, slots: baseSlots }, getInst), b = Gun.compute({ name: null, slots: withSlots }, getInst);
    if (!a || !b) continue;
    const va = value(a), vb = value(b);
    const dE = (vb.E / va.E - 1) * 100, dS = (vb.S / va.S - 1) * 100, dSus = (vb.sus / va.sus - 1) * 100;
    bestE = Math.max(bestE, dE); bestS = Math.max(bestS, dS); sumSus += dSus; n++;
    cost = Math.max(cost, b.ammoCost); cpm = Math.max(cpm, b.costPerMin);
    per.push(`${ref.n}:${pc(dE)}/${pc(dS)}`);
  }
  const r = { p, bestE, bestS, mx: Math.max(bestE, bestS), sus: sumSus / n, cost, cpm, per };
  rows.push(r);
  const cap = CAP[p.tier];
  if (p.sp && p.sp.p2w) { /* 과금탄: 발당 너트를 내는 의도된 예외 */ }
  else if (r.mx > cap) flags.OVER.push(`${p.id} (T${p.tier} ${p.slot}) 최대 ${pc(r.mx)} > 상한 +${cap}%   [E ${pc(bestE)} S ${pc(bestS)}]`);
  else if (bestE > cap * 0.6 && bestS > cap * 0.6) flags.OVER.push(`${p.id} (T${p.tier} ${p.slot}) 만능: E ${pc(bestE)} · S ${pc(bestS)} 둘 다 상한의 60% 초과 (상한 +${cap}%)`);
  if (p.tier >= 1 && allGood(p) && !p.cost && !(p.sp && p.sp.p2w) && !pureUtility(p) && r.mx >= cap * 0.5) flags.NODOWNSIDE.push(`${p.id} (T${p.tier} ${p.slot}) 단점 없음 · 최대 ${pc(r.mx)}`);
  if (r.mx < 0 && !hasUtility(p)) flags.DEAD.push(`${p.id} (T${p.tier} ${p.slot}) 어느 총에서도 손해: E ${pc(bestE)} S ${pc(bestS)}`);
  if (p.slot === 'ammo') {
    const c = p.cost || 0, exp = 20 + 250 * c;
    if (p.sp && p.sp.p2w) { /* 너트로 지불 */ }
    else if (c <= 0.04 && r.mx > exp + 20) flags.AMMOCOST.push(`${p.id} (T${p.tier}) 값 ${c} 인데 최대 ${pc(r.mx)} (기대 ≈ +${Math.round(exp)}%) — 너무 싸다`);
    else if (c >= 0.15 && r.mx < exp * 0.45) flags.AMMOCOST.push(`${p.id} (T${p.tier}) 값 ${c} 인데 최대 ${pc(r.mx)} (기대 ≈ +${Math.round(exp)}%) — 비싼데 약하다`);
  }
}
// 몸통: 지속 DPS 대역
const recRows = [];
for (const p of PART_LIST) {
  if (p.slot !== 'receiver' || skipIds.has(p.id)) continue;
  const b = p.base;
  const sps = b.mode === 'charge' ? 1 / (b.charge + 60 / b.rpm) : b.mode === 'burst' ? b.burst / ((b.burst - 1) * 60 / b.rpm + (b.burstDelay || 0.3)) : b.rpm / 60;
  const per = b.dmg * (b.pellets || 1) * (b.ramp ? (1 + b.ramp) / 2 : 1);
  const sus = b.regen ? per * sps * 0.85 : per * b.mag / (b.mag / sps + b.reload);
  const aoe = !!(b.explode || ['wave', 'flame', 'orb', 'saw'].includes(b.proj) || (b.proj === 'arc' && b.shock) || (b.pierce || 0) >= 4);
  const [lo, hi] = BAND[p.tier];
  recRows.push({ p, sus, aoe, lo, hi });
  if (sus > hi * 1.5) flags.RECEIVER.push(`${p.id} (T${p.tier}) 지속 ${Math.round(sus)} > ${Math.round(hi * 1.5)} (대역 ${lo}-${hi})`);
  else if (sus < lo * 0.6 && !aoe) flags.RECEIVER.push(`${p.id} (T${p.tier}) 지속 ${Math.round(sus)} < ${Math.round(lo * 0.6)} (대역 ${lo}-${hi}, 광역 아님)`);
}

if (!flagsOnly) {
  rows.sort((a, b) => a.p.tier - b.p.tier || b.mx - a.mx);
  console.log('── 파츠별 한계 효과 (기준 총 6자루 중 최댓값) ──');
  for (const r of rows) console.log(`T${r.p.tier} ${r.p.slot.padEnd(7)} ${r.p.id.padEnd(22)} E ${pc(r.bestE).padStart(6)}  S ${pc(r.bestS).padStart(6)}  지속평균 ${pc(r.sus).padStart(6)}${r.cost ? `  🧨${r.cost.toFixed(2)}/발 ${Math.round(r.cpm)}/분` : ''}  | ${r.per.join(' ')}`);
  console.log('\n── 몸통 지속 DPS ──');
  recRows.sort((a, b) => a.p.tier - b.p.tier || b.sus - a.sus);
  for (const r of recRows) console.log(`T${r.p.tier} ${r.p.id.padEnd(16)} 지속 ${String(Math.round(r.sus)).padStart(4)}  (대역 ${r.lo}-${r.hi})${r.aoe ? '  광역/제압' : ''}`);
  console.log('');
}
let total = 0;
for (const k of ['OVER', 'NODOWNSIDE', 'DEAD', 'AMMOCOST', 'RECEIVER']) {
  console.log(`[${k}] ${flags[k].length}건`);
  for (const f of flags[k]) console.log('  ' + f);
  total += flags[k].length;
}
console.log(`파츠 ${PART_LIST.length}개 감사 완료 · 경고 ${total}건`);
