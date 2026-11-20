// 개발용: 파츠 데이터/그림 검증.  node dev/validate.js [b c d ...]   (인자 없으면 존재하는 확장 파일 전부)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map, Date, isNaN, parseFloat, parseInt };
ctx.globalThis = ctx; ctx.window = ctx;
vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8') + '\n;0', ctx, { filename: f });
load('js/util.js'); load('js/data_parts.js');
vm.runInContext('globalThis.__P = { PARTS, PART_LIST, STATS, FX, TAGS, SETS, SLOTS, RARITY, partPrice, partCraftCost };', ctx);
const { PARTS, PART_LIST, STATS, FX, TAGS } = ctx.__P;
const baseCount = PART_LIST.length;
let exts = process.argv.slice(2);
if (!exts.length) exts = fs.readdirSync(path.join(root, 'js')).map(f => (f.match(/^data_parts_(\w+)\.js$/) || [])[1]).filter(Boolean);
const errs = [], warn = [];
const E = m => errs.push(m);
for (const x of exts) { try { load(`js/data_parts_${x}.js`); } catch (e) { E(`data_parts_${x}.js 로드 실패: ${e.message}`); } }
const MODES = ['semi', 'auto', 'burst', 'charge', 'beam'];
const PROJS = ['bullet', 'nail', 'key', 'bio', 'can', 'lob', 'flame', 'beam', 'arc', 'saw', 'orb', 'wave', 'rail'];
const SND = ['bullet', 'shotgun', 'nail', 'energy', 'beam', 'flame', 'launcher', 'arc', 'sonic', 'saw', 'can'];
const SLOTT = ['receiver', 'barrel', 'mag', 'stock', 'sight', 'muzzle', 'ammo', 'acc'];
const PREFIX = { barrel: 'barrel_', mag: 'mag_', stock: 'stock_', sight: 'sight_', muzzle: 'muz_', ammo: 'ammo_', acc: 'acc_' };
const SPK = ['focus', 'opener', 'execute', 'momentum', 'overkill', 'cheap', 'screech', 'fear', 'salt', 'popcorn', 'plague', 'mint', 'p2w', 'tax', 'stamp', 'thorns', 'duck', 'horn', 'coupon', 'regen', 'washer', 'thermal', 'scrapper', 'feast', 'overtime', 'freeAmmo', 'predator', 'sonic', 'moon', 'moonBoom', 'fxMul'];
const BASEK = ['dmg', 'rpm', 'mag', 'reload', 'spread', 'recoil', 'vel', 'mode', 'proj', 'snd', 'pellets', 'pierce', 'head', 'knock', 'range', 'explode', 'burn', 'shock', 'acid', 'freeze', 'rad', 'bounce', 'homing', 'leech', 'gold', 'sunder', 'spin', 'ramp', 'pool', 'regen', 'charge', 'burst', 'burstDelay', 'cyc', 'beamColor'];
const seen = {};
for (const p of PART_LIST) {
  const w = `[${p.id}]`;
  if (seen[p.id]) E(`${w} 중복 id`); seen[p.id] = 1;
  if (!SLOTT.includes(p.slot)) E(`${w} slot '${p.slot}'`);
  if (PREFIX[p.slot] && !p.id.startsWith(PREFIX[p.slot])) E(`${w} id 는 '${PREFIX[p.slot]}' 로 시작해야 함`);
  if (!(p.r >= 0 && p.r <= 5)) E(`${w} r`);
  if (!(p.tier >= 0 && p.tier <= 4)) E(`${w} tier ${p.tier}`);
  if (!p.name || !p.desc) E(`${w} name/desc 없음`);
  for (const t of p.tags || []) if (!TAGS[t]) E(`${w} 모르는 태그 '${t}'`);
  if (p.m) for (const k in p.m) { if (!STATS[k]) E(`${w} 모르는 스탯 m.${k}`); else if (typeof p.m[k] !== 'number') E(`${w} m.${k} 숫자 아님`); else if (STATS[k].mul && Math.abs(p.m[k]) > 4) warn.push(`${w} m.${k}=${p.m[k]} (배율 스탯은 0.15=15%)`); else if (!STATS[k].mul && k !== 'head' && k !== 'pierce' && k !== 'pellets' && Math.abs(p.m[k]) < 1 && p.m[k] !== 0) warn.push(`${w} m.${k}=${p.m[k]} (가산 스탯은 %p 단위 정수)`); }
  if (p.fx) for (const k in p.fx) if (!FX[k]) E(`${w} 모르는 fx.${k}`);
  if (p.sp) { for (const k in p.sp) if (!SPK.includes(k)) E(`${w} 모르는 sp.${k}`); if (!p.note) E(`${w} sp 가 있으면 note 필수`); }
  if (p.slot === 'receiver') {
    const b = p.base;
    if (!b) { E(`${w} base 없음`); continue; }
    for (const k of ['dmg', 'rpm', 'mag', 'reload', 'spread', 'recoil', 'vel']) if (typeof b[k] !== 'number') E(`${w} base.${k}`);
    if (!MODES.includes(b.mode)) E(`${w} mode '${b.mode}'`);
    if (!PROJS.includes(b.proj)) E(`${w} proj '${b.proj}'`);
    if (b.mode === 'beam' && b.proj !== 'beam') E(`${w} beam 모드는 proj beam`);
    if (b.proj === 'beam' && b.mode !== 'beam') E(`${w} proj beam 은 mode beam`);
    if (b.mode === 'charge' && !b.charge) E(`${w} charge 시간 없음`);
    if (b.mode === 'burst' && !b.burst) E(`${w} burst 수 없음`);
    if (!b.snd || !SND.includes(b.snd.kind)) E(`${w} snd.kind`);
    for (const k in b) if (!BASEK.includes(k)) E(`${w} 모르는 base.${k}`);
    if (b.cyc && !['pump', 'bolt'].includes(b.cyc)) E(`${w} cyc`);
  } else if (p.base) E(`${w} 몸통이 아닌데 base 가 있음`);
  if (p.slot === 'ammo' && p.cost != null && !(p.cost >= 0 && p.cost <= 3)) E(`${w} cost`);
  if (p.slot !== 'ammo' && p.cost != null) E(`${w} cost 는 탄약만`);
}
// 그림 검증
let artOk = 0, artMiss = [];
try {
  load('js/gun.js'); load('js/gunart.js');
  for (const x of exts) { if (fs.existsSync(path.join(root, `js/gunart_ext_${x}.js`))) { try { load(`js/gunart_ext_${x}.js`); } catch (e) { E(`gunart_ext_${x}.js 로드 실패: ${e.message}`); } } else warn.push(`gunart_ext_${x}.js 없음`); }
  const X = ctx.GunArt._ext, TBL = { receiver: X.REC, barrel: X.BAR, muzzle: X.MUZ, mag: X.MAG, stock: X.STK, sight: X.SGT, ammo: X.AMMO, acc: X.ACC };
  for (const p of PART_LIST) {
    if (!TBL[p.slot][p.id]) { artMiss.push(p.id); continue; }
    artOk++;
    const parts = { receiver: 'ar' };
    if (p.slot === 'receiver') parts.receiver = p.id; else if (p.slot === 'acc') { parts.acc1 = p.id; } else parts[p.slot] = p.id;
    try {
      const m = ctx.GunArt.metrics(parts);
      if (![m.muzzleX, m.muzzleY, m.minX, m.maxX, m.minY, m.maxY].every(Number.isFinite)) E(`[${p.id}] metrics 값 이상 ${JSON.stringify(m)}`);
      if (p.slot === 'acc') ctx.GunArt.metrics({ receiver: 'pipe_pistol', acc2: p.id });
      if (p.slot === 'receiver') ctx.GunArt.metrics({ receiver: p.id, barrel: 'barrel_long', mag: 'mag_ext', stock: 'stock_wood', sight: 'sight_scope', muzzle: 'muz_brake', ammo: 'ammo_fmj', acc1: 'acc_bipod', acc2: 'acc_duck' });
    } catch (e) { E(`[${p.id}] 그리기 오류: ${e.message}`); }
  }
} catch (e) { E('그림 검증 실패: ' + e.message); }
console.log(`파츠 ${PART_LIST.length}개 (기본 ${baseCount} + 확장 ${PART_LIST.length - baseCount}) · 그림 등록 ${artOk}개 · 그림 없음 ${artMiss.length}개`);
if (artMiss.length) console.log('그림 없음(슬롯 기본 모양으로 대체됨): ' + artMiss.join(', '));
for (const w of warn) console.log('경고 ' + w);
for (const e of errs) console.log('오류 ' + e);
console.log(errs.length ? `실패: 오류 ${errs.length}개` : '통과');
process.exit(errs.length ? 1 : 0);
