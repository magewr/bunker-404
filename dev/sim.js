// 개발용: 봇으로 전투를 돌려 밸런스를 확인한다. 게임에는 포함되지 않는다.
// 콘솔에서: runAll([1,4,7,10,15,20,25,30], 1)
'use strict';
window.__errs = [];
(function () {
  const oe = console.error;
  console.error = function () { window.__errs.push(Array.from(arguments).map(a => a && a.stack ? a.stack.split('\n').slice(0, 3).join(' | ') : String(a)).join(' ')); oe.apply(console, arguments); };
})();
window.simWave = function (day, guns, turret, up, threat, opts) {
  opts = opts || {};
  Game.newGame('normal');
  const s = Game.s; s.day = day; s.inv = []; s.guns = [{ name: null, slots: {} }, { name: null, slots: {} }, { name: null, slots: {} }]; s.up = Object.assign({}, up || {}); s.gateHp = Game.gateMax();
  const put = (gi, def) => { if (!def) return; const [rec, parts, q] = def; const a = Game.addPart(rec, q); s.guns[gi].slots.receiver = a.uid; for (const k in parts) { const i = Game.addPart(parts[k], q); s.guns[gi].slots[k] = i.uid; } };
  put(0, guns[0]); put(1, guns[1]); put(2, turret);
  const cfg = Game.combatConfig();
  cfg.night = opts.night || { threat: threat || 3, theme: opts.theme || 'mixed', boss: opts.boss || null };
  let res = null; cfg.onEnd = r => { res = r; }; cfg.onPause = () => {};
  const skill = opts.skill == null ? 1 : opts.skill;
  Combat.start(cfg);
  const D = Combat.debug; let tgt = null, rt = 0, idle = 0, nx = 0, ny = 0, frames = 0;
  while (Combat.isRunning() && frames < 60 * 260) {
    const C = D.state(); rt -= 1 / 60;
    if (rt <= 0 || !tgt || tgt.dead) {
      rt = 0.45; let best = null, bx = 1e9;
      for (const e of C.enemies) { if (e.dead || e.state === 'burrow') continue; const pr = e.x - (e.def.aura ? 200 : 0) - (e.def.ranged ? 120 : 0); if (pr < bx) { bx = pr; best = e; } }
      tgt = best;
      if (C.eprojs.length && Math.random() < 0.5) { const ep = C.eprojs.find(p => p.hp > 0); if (ep) tgt = { x: ep.x, y: ep.y + 6, h: 12, def: { noHead: true }, get dead() { return ep.dead; } }; }
      nx = U.rand(-9, 9) * skill; ny = U.rand(-9, 9) * skill; idle = Math.random() < 0.35 * skill ? 0.45 : 0;
    }
    if (tgt) { D.mouse.x = tgt.x + nx; D.mouse.y = tgt.y - tgt.h * (tgt.def.noHead ? 0.5 : 0.75) + ny; }
    const w = C.weapons[C.cur]; const fire = !!tgt && idle <= 0 && tgt.x < 600; idle -= 1 / 60;
    if (w.s.mode === 'charge') D.mouse.down = fire && w.charge < 1; else D.mouse.down = fire;
    D.mouse.pressed = fire && (frames % 8 === 0);
    D.step(1, 1 / 60); frames++;
  }
  const C = D.state();
  return { day, win: res && res.win, t: Math.round(C.t), kills: C.stat.kills, gate: Math.round(C.gateHp) + '/' + C.gateMax, acc: res ? res.acc : 0, dps: Math.round(C.stat.dmg / C.t), sheet: Math.round(cfg.guns[0].dps), nuts: Math.round(C.stat.nuts) };
};
window.LOAD = {
  1: [[['pipe_pistol', { barrel: 'barrel_pvc', mag: 'mag_tape', stock: 'stock_crutch', sight: 'sight_tp', ammo: 'ammo_nail', acc1: 'acc_keyring' }, 0]], null, {}],
  2: [[['pipe_pistol', { barrel: 'barrel_pvc', mag: 'mag_tape', stock: 'stock_crutch', sight: 'sight_tp', ammo: 'ammo_nail', acc1: 'acc_keyring' }, 0]], null, {}],
  4: [[['revolver', { barrel: 'barrel_long', mag: 'mag_tape', stock: 'stock_wood', sight: 'sight_binoc', acc1: 'acc_dice' }, 0]], null, { gate: 1 }],
  5: [[['nailgun', { barrel: 'barrel_rust', mag: 'mag_pet', stock: 'stock_crutch', sight: 'sight_tp', ammo: 'ammo_nail', acc1: 'acc_keyring' }, 0]], null, {}],
  7: [[['smg', { barrel: 'barrel_long', mag: 'mag_lunch', stock: 'stock_wood', sight: 'sight_mirror', muzzle: 'muz_oil', ammo: 'ammo_acid', acc1: 'acc_dice', acc2: 'acc_energy' }, 1]], null, { gate: 1, wire: 1 }],
  10: [[['ar', { barrel: 'barrel_heavy', mag: 'mag_ext', stock: 'stock_tactical', sight: 'sight_reddot', muzzle: 'muz_comp', ammo: 'ammo_hp', acc1: 'acc_dice', acc2: 'acc_protein' }, 1]], ['smg', { barrel: 'barrel_long', mag: 'mag_lunch' }, 0], { gate: 2, wire: 1, turret: 1, mines: 1 }],
  11: [[['smg', { barrel: 'barrel_long', mag: 'mag_lunch', stock: 'stock_wood', sight: 'sight_mirror', muzzle: 'muz_oil', ammo: 'ammo_acid', acc1: 'acc_dice', acc2: 'acc_energy' }, 1]], null, { gate: 1, wire: 1 }],
  15: [[['ar', { barrel: 'barrel_heavy', mag: 'mag_ext', stock: 'stock_tactical', sight: 'sight_reddot', muzzle: 'muz_comp', ammo: 'ammo_fire', acc1: 'acc_bipod', acc2: 'acc_protein' }, 2]], ['ar', { barrel: 'barrel_long', mag: 'mag_ext' }, 1], { gate: 3, wire: 2, turret: 1, mines: 2 }],
  20: [[['minigun', { barrel: 'barrel_heavy', mag: 'mag_drum', stock: 'stock_gyro', sight: 'sight_reddot', muzzle: 'muz_brake', ammo: 'ammo_fire', acc1: 'acc_bipod', acc2: 'acc_protein' }, 2]], ['lmg', { barrel: 'barrel_heavy', mag: 'mag_drum', ammo: 'ammo_fmj' }, 2], { gate: 4, wire: 2, turret: 2, mines: 2 }],
  21: [[['ar', { barrel: 'barrel_heavy', mag: 'mag_ext', stock: 'stock_tactical', sight: 'sight_reddot', muzzle: 'muz_comp', ammo: 'ammo_fire', acc1: 'acc_bipod', acc2: 'acc_protein' }, 2]], ['ar', { barrel: 'barrel_long', mag: 'mag_ext' }, 1], { gate: 3, wire: 2, turret: 1, mines: 2 }],
  25: [[['minigun', { barrel: 'barrel_coil', mag: 'mag_belt', stock: 'stock_gyro', sight: 'sight_thermal', muzzle: 'muz_tesla', ammo: 'ammo_explosive', acc1: 'acc_bipod', acc2: 'acc_protein' }, 3]], ['lmg', { barrel: 'barrel_heavy', mag: 'mag_drum', ammo: 'ammo_fmj' }, 3], { gate: 5, wire: 3, turret: 2, mines: 3 }],
  30: [[['minigun', { barrel: 'barrel_coil', mag: 'mag_belt', stock: 'stock_gyro', sight: 'sight_aimbot', muzzle: 'muz_tesla', ammo: 'ammo_explosive', acc1: 'acc_stamp', acc2: 'acc_protein' }, 4]], ['railcannon', { barrel: 'barrel_coil', mag: 'mag_cell', ammo: 'ammo_du' }, 3], { gate: 5, wire: 3, turret: 2, mines: 3 }],
};
window.runAll = function (days, skill, n) {
  const out = [];
  for (const d of days) for (let i = 0; i < (n || 1); i++) { const L = LOAD[d]; const boss = d % 10 === 0 ? Waves.bossFor(d) : null; const r = simWave(d, L[0], L[1], L[2], boss ? 5 : 3, { boss, skill }); out.push(`d${r.day} ${r.win ? 'WIN ' : 'LOSE'} t=${r.t} k=${r.kills} gate=${r.gate} dps=${r.dps}/${r.sheet} nuts=${r.nuts}`); }
  Combat.stop();
  return out.join('\n') + '\nERR ' + JSON.stringify([...new Set(window.__errs)].slice(0, 5));
};

// ── 전체 캠페인 자동 플레이 (경제 + 전투) ──
window.botFight = function (cfg, skill) {
  let res = null; cfg.onEnd = r => { res = r; }; cfg.onPause = () => {};
  Combat.start(cfg);
  const D = Combat.debug; let tgt = null, rt = 0, idle = 0, nx = 0, ny = 0, frames = 0;
  while (Combat.isRunning() && frames < 60 * 300) {
    const C = D.state(); rt -= 1 / 60;
    if (rt <= 0 || !tgt || tgt.dead) {
      rt = 0.45; let best = null, bx = 1e9;
      for (const e of C.enemies) { if (e.dead || e.state === 'burrow') continue; const pr = e.x - (e.def.aura ? 200 : 0) - (e.def.ranged ? 120 : 0); if (pr < bx) { bx = pr; best = e; } }
      tgt = best;
      if (C.eprojs.length && Math.random() < 0.5) { const ep = C.eprojs.find(p => p.hp > 0); if (ep) tgt = { x: ep.x, y: ep.y + 6, h: 12, def: { noHead: true }, get dead() { return ep.dead; } }; }
      nx = U.rand(-9, 9) * skill; ny = U.rand(-9, 9) * skill; idle = Math.random() < 0.35 * skill ? 0.45 : 0;
      if (C.grenT <= 0 && C.enemies.filter(e => !e.dead).length >= 5 && Math.random() < 0.5) window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    }
    if (tgt) { D.mouse.x = tgt.x + nx; D.mouse.y = tgt.y - tgt.h * (tgt.def.noHead ? 0.5 : 0.75) + ny; }
    const w = C.weapons[C.cur]; const fire = !!tgt && idle <= 0 && tgt.x < 600; idle -= 1 / 60;
    if (w.s.mode === 'charge') D.mouse.down = fire && w.charge < 1; else D.mouse.down = fire;
    D.mouse.pressed = fire && (frames % 8 === 0);
    D.step(1, 1 / 60); frames++;
  }
  if (!res) { Combat.stop(); res = { win: false, kills: 0, shots: 0, hits: 0, heads: 0, maxCombo: 0, nuts: 0, mats: {}, parcels: 0, gateHp: 0, grade: 'F', spent: 0, time: 300, dmg: 0, acc: 0, wkills: [0, 0] }; }
  return res;
};
window.gunScore = gs => gs ? gs.sustained * (0.55 + gs.acc / 220) * (gs.fx.explode ? 1.3 : 1) * (gs.mode === 'charge' ? 0.7 : 1) : 0;
window.autoEquip = function (gi) {
  const s = Game.s, g = s.guns[gi];
  for (let pass = 0; pass < 3; pass++) for (const sl of SLOTS) {
    let best = g.slots[sl.id], bestV = gunScore(Game.gunStats(gi));
    const prev = g.slots[sl.id];
    for (const inst of s.inv) {
      if (PARTS[inst.id].slot !== sl.type) continue;
      const eq = Game.equippedOn(inst.uid);
      if (eq && !(eq.gi === gi && eq.slot === sl.id)) continue;
      g.slots[sl.id] = inst.uid;
      const v = gunScore(Game.gunStats(gi));
      if (v > bestV * 1.001) { bestV = v; best = inst.uid; }
    }
    if (best == null) delete g.slots[sl.id]; else g.slots[sl.id] = best;
    void prev;
  }
};
// cont=true 면 현재 진행 중인 게임을 이어서 days 일만큼 더 돌린다 (도구 타임아웃 회피용)
window.autoplay = function (skill, days, cont) {
  if (!cont) Game.newGame('normal');
  const log = [], start = Game.s.day;
  for (let d = start; d < start + (days || 30); d++) {
    const s = Game.s, day = Game.today(), ev = day.ev;
    if (s.morning.event) { const e = EVENTS[s.morning.event]; const c = e.choices.find(c => !c.can || c.can(Game)); if (c) c.run(Game); s.morning.event = null; }
    if (s.morning.supply) { const c = s.morning.supply.slice().sort((a, b) => PARTS[b.id].tier - PARTS[a.id].tier)[0]; Game.addPart(c.id, c.q); s.morning.supply = null; }
    if (s.gateHp < Game.gateMax() * 0.6) Game.repair();
    while (s.ap > 0) { if (ev && ev.type === 'rain') break; const locs = LOCATIONS.filter(l => l.unlock <= s.day && l.ap <= s.ap); if (!locs.length) break; if (!Game.scavenge(locs[locs.length - 1].id)) break; }
    if (s.shop) {
      if (s.shop.gachaPrice) { const n = Math.floor(s.res.nuts * 0.5 / s.shop.gachaPrice); if (n >= 10) Game.gacha(10); else for (let i = 0; i < n; i++) Game.gacha(1); }
      else { const order = s.shop.offers.map((o, i) => ({ o, i })).sort((a, b) => PARTS[b.o.id].tier - PARTS[a.o.id].tier); let budget = s.res.nuts * 0.7; for (const { o, i } of order) if (o.price <= budget) { budget -= o.price; Game.buyOffer(i); } }
    }
    for (const id of ['turret', 'gate', 'wire', 'mines', 'coffee', 'light', 'tower', 'recycle', 'bench']) Game.buyUpgrade(id);
    autoEquip(0); if (s.up.turret) autoEquip(2);
    for (const k of ['receiver', 'barrel', 'ammo', 'mag']) { const inst = Game.inst(s.guns[0].slots[k]); if (inst && inst.q < Math.min(4, Math.floor(d / 5))) Game.enhance(inst.uid); }
    // 안 쓰는 저티어 분해
    for (const inst of s.inv.slice()) if (!Game.equippedOn(inst.uid) && PARTS[inst.id].tier <= Math.max(0, Math.floor(d / 8) - 1)) Game.dismantle(inst.uid);
    const gs = Game.gunStats(0);
    let line = `d${d} ${gs.receiver.id} dps=${Math.round(gs.dps)}/${Math.round(gs.sustained)} nuts=${s.res.nuts} scrap=${s.res.scrap}`;
    if (day.night.threat > 0) {
      const res = botFight(Game.combatConfig(), skill == null ? 1 : skill);
      const out = Game.applyCombat(res);
      if (out.crate) { const c = out.crate.slice().sort((a, b) => PARTS[b.id].tier - PARTS[a.id].tier)[0]; Game.addPart(c.id, c.q); }
      line += ` | th${day.night.threat}${day.night.boss ? ' BOSS' : ''} ${res.win ? 'WIN' : 'LOSE'} ${res.grade} t=${Math.round(res.time)} gate=${Math.round(res.gateHp)}/${Game.gateMax()} +${res.finalNuts + res.clearBonus} lives=${s.lives}`;
      if (s.over) { log.push(line + ' GAME OVER'); break; }
    } else line += ' | quiet';
    log.push(line);
    Game.nextDay();
  }
  return log.join('\n') + '\nERR ' + JSON.stringify([...new Set(window.__errs)].slice(0, 5));
};
