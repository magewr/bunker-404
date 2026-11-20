// BUNKER 404 — 게임 상태, 달력, 경제
'use strict';

const SAVE_KEY = 'bunker404_save_v1';
const TIER_CURVE = [ // [day, t0..t4 가중치]
  [1, 70, 29, 1, 0, 0], [6, 35, 48, 16, 1, 0], [11, 14, 40, 38, 8, 0], [16, 5, 26, 44, 23, 2],
  [21, 1, 14, 40, 38, 7], [26, 0, 8, 30, 46, 16], [31, 0, 4, 24, 48, 24],
];

const Game = {
  s: null,

  /* ───────── 새 게임 / 저장 ───────── */
  newGame(diff) {
    const seed = (Math.random() * 1e9) | 0;
    const s = {
      v: 1, seed, diff: diff || 'normal', day: 1, ap: 3,
      res: { nuts: 40, scrap: 25, powder: 12, circuit: 0, goo: 0, core: 0 },
      inv: [], guns: [{ name: null, slots: {} }, { name: null, slots: {} }, { name: null, slots: {} }],
      bp: {}, up: {}, gateHp: 100, lives: 3, cal: [], flags: {}, uid: 1, shop: null, pity: 0, usedEvents: [],
      stats: { kills: 0, waves: 0, heads: 0, bestCombo: 0, gacha: 0, crafted: 0, bricks: 0, pets: 0 },
      morning: null, won: false, over: false, seen: {}, quest: null, presets: [], heat: 0,
    };
    Game.s = s;
    s.cal = Game.genMonth(1, U.rng(seed));
    // 시작 장비
    const rc = Game.addPart('pipe_pistol', 0);
    s.guns[0].slots.receiver = rc.uid;
    for (const id of ['barrel_pvc', 'mag_tape', 'stock_crutch', 'sight_tp', 'ammo_nail', 'acc_keyring', 'slingshot']) Game.addPart(id, 0);
    Game.startDay(true);
    return s;
  },
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.s)); } catch (e) { /* 저장 불가 환경 */ } },
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || s.v !== 1) return false;
      s.seen = s.seen || {}; s.flags = s.flags || {}; s.stats = s.stats || {}; s.presets = s.presets || []; s.heat = s.heat || 0;
      // 확장 데이터 파일이 빠졌거나 바뀌어도 저장이 깨지지 않도록, 모르는 id 는 걸러 낸다
      s.inv = (s.inv || []).filter(i => PARTS[i.id]);
      if (s.quest && !QUESTS[s.quest.id]) s.quest = null;
      if (s.morning) {
        if (s.morning.event && !EVENTS[s.morning.event]) s.morning.event = null;
        if (s.morning.supply) s.morning.supply = s.morning.supply.filter(c => PARTS[c.id]);
        if (s.morning.supply && !s.morning.supply.length) s.morning.supply = null;
      }
      if (s.shop && s.shop.offers) s.shop.offers = s.shop.offers.filter(o => PARTS[o.id]);
      Game.s = s;
      if (s.pendingNext && !s.over) Game.nextDay();
      return true;
    } catch (e) { return false; }
  },
  wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* noop */ } },

  /* ───────── 달력 ───────── */
  genMonth(startDay, r) {
    const days = [];
    const quiet = new Set([9, 19, 29]);
    const pool = U.shuffle([3, 5, 6, 7, 12, 13, 14, 16, 17, 22, 23, 24, 26, 27], r);
    for (const c of pool) { if (quiet.size >= 7) break; if (!quiet.has(c - 1) && !quiet.has(c + 1)) quiet.add(c); }
    const blood = new Set();
    for (const [a, b] of [[6, 8], [14, 17], [23, 27]]) {
      const opts = []; for (let x = a; x <= b; x++) if (!quiet.has(x)) opts.push(x);
      if (opts.length) blood.add(U.pick(opts, r));
    }
    for (let i = 1; i <= 30; i++) {
      const d = startDay + i - 1;
      let night;
      if (i % 10 === 0) night = { threat: 5, theme: 'mixed', boss: Waves.bossFor(d) };
      else if (quiet.has(i) && d > 2) night = { threat: 0 };
      else {
        let th = Math.round(1 + i / 9 + (r() - 0.5) * 1.6);
        th = U.clamp(th, 1, 4);
        if (d <= 2) th = 1;
        const cands = Object.keys(THEMES).filter(k => THEMES[k].min <= d);
        night = { threat: th, theme: U.pick(cands, r) };
        if (d === 1) night.theme = 'horde';
        if (blood.has(i)) { night.threat = 5; night.blood = true; }
        else if (d >= 5 && r() < 0.13) night.fog = true;
      }
      days.push({ d, night, ev: null });
    }
    const at = i => days[i - 1];
    const avail = id => MERCHANTS[id].min <= startDay + 0; // 월 시작 기준이 아니라 날짜 기준으로 아래에서 재검사
    void avail;
    // 상인
    const fixed = { 2: 'scrap', 9: 'broker', 19: 'doc', 29: 'relic' };
    for (const k in fixed) at(+k).ev = { type: 'merchant', id: fixed[k] };
    let p = 2;
    const mw = { scrap: 3, turnip: 2.5, vending: 2.5, broker: 3, doc: 3, relic: 2.5, ammo: 3.5 };
    while (true) {
      p += r() < 0.55 ? 2 : 3;
      if (p > 30) break;
      if (at(p).ev) continue;
      const d = startDay + p - 1;
      const list = Object.keys(MERCHANTS).filter(id => MERCHANTS[id].min <= d).map(id => ({ id, w: mw[id] || 2.5 }));
      at(p).ev = { type: 'merchant', id: U.wpick(list, r).id };
    }
    const free = () => U.shuffle(days.filter(x => !x.ev && x.d > 1), r);
    let f = free();
    for (let i = 0; i < 3 && f.length; i++) { const x = f.pop(); if (x.d >= 3) x.ev = { type: 'supply' }; }
    f = free();
    for (let i = 0; i < 2 && f.length; i++) { const x = f.pop(); if (x.d >= 5) x.ev = { type: 'rain' }; }
    f = free();
    for (let i = 0; i < 2 && f.length; i++) { const x = f.pop(); if (x.d >= 4) x.ev = { type: 'recycle' }; }
    f = free();
    for (let i = 0; i < 8 && f.length; i++) f.pop().ev = { type: 'event' };
    return days;
  },
  dayObj(d) {
    const s = Game.s;
    while (s.cal.length < d + 31) s.cal = s.cal.concat(Game.genMonth(s.cal.length + 1, U.rng(s.seed + s.cal.length * 7919)));
    return s.cal[d - 1];
  },
  today() { return Game.dayObj(Game.s.day); },
  forecastRange() { return 2 + 3 * (Game.s.up.tower || 0); },

  /* ───────── 인벤토리 ───────── */
  inst(uid) { const inv = Game.s.inv; for (let i = 0; i < inv.length; i++) if (inv[i].uid === uid) return inv[i]; return null; },
  addPart(id, q) {
    const s = Game.s, inst = { uid: s.uid++, id, q: q || 0, isNew: true };
    s.inv.push(inst); s.bp[id] = 1;
    return inst;
  },
  equippedOn(uid) {
    const g = Game.s.guns;
    for (let gi = 0; gi < g.length; gi++) for (const k in g[gi].slots) if (g[gi].slots[k] === uid) return { gi, slot: k };
    return null;
  },
  removePart(uid) {
    const s = Game.s, eq = Game.equippedOn(uid);
    if (eq) delete s.guns[eq.gi].slots[eq.slot];
    s.inv = s.inv.filter(x => x.uid !== uid);
  },
  equip(gi, slotId, uid) {
    const s = Game.s, inst = Game.inst(uid), slot = SLOTS.find(x => x.id === slotId);
    if (!inst || !slot || PARTS[inst.id].slot !== slot.type) return false;
    const eq = Game.equippedOn(uid);
    if (eq) delete s.guns[eq.gi].slots[eq.slot];
    s.guns[gi].slots[slotId] = uid;
    inst.isNew = false;
    return true;
  },
  unequip(gi, slotId) { delete Game.s.guns[gi].slots[slotId]; },
  gunStats(gi) {
    const st = Gun.compute(Game.s.guns[gi], uid => Game.inst(uid));
    if (st && Game.s.up.light) { st.crit = Math.min(100, st.crit + 5); if (st.basic) st.basic.crit = Math.min(100, st.basic.crit + 5); }
    return st;
  },

  /* ───────── 프리셋 (조합 저장) ───────── */
  savePreset(gi, name) {
    const s = Game.s, g = s.guns[gi];
    if (!g.slots.receiver) return false;
    if (s.presets.length >= 10) s.presets.shift();
    s.presets.push({ name: (name || '').slice(0, 20) || '무제', gname: g.name, slots: Object.assign({}, g.slots) });
    Game.save();
    return true;
  },
  // 프리셋에 담긴 파츠 중 아직 가지고 있는 것만 장착한다. 다른 총에 달려 있으면 떼어 온다.
  loadPreset(gi, idx) {
    const s = Game.s, pr = s.presets[idx];
    if (!pr) return null;
    if (!Game.inst(pr.slots.receiver)) return { ok: 0, miss: 1 }; // 몸통이 사라진 프리셋은 지금 총을 건드리지 않는다
    let ok = 0, miss = 0;
    for (const sl of SLOTS) {
      const uid = pr.slots[sl.id];
      if (uid == null) { Game.unequip(gi, sl.id); continue; }
      if (Game.inst(uid) && Game.equip(gi, sl.id, uid)) ok++; else { miss++; Game.unequip(gi, sl.id); }
    }
    s.guns[gi].name = pr.gname || null;
    Game.save();
    return { ok, miss };
  },
  delPreset(idx) { Game.s.presets.splice(idx, 1); Game.save(); },
  presetIds(pr) { const o = {}; for (const k in pr.slots) { const i = Game.inst(pr.slots[k]); if (i) o[k] = i.id; } return o; },
  // 화약 조제: 탄약 경제가 막히지 않도록 언제든 만들 수 있다 (비싸다)
  powderCost() { return { scrap: 6, goo: 1 }; },
  makePowder() { if (!Game.pay(Game.powderCost())) return false; Game.addRes('powder', 4); Game.save(); return true; },

  /* ───────── 자원 ───────── */
  addRes(k, n) { const r = Game.s.res; r[k] = Math.max(0, Math.round((r[k] || 0) + n)); },
  canAfford(cost) { for (const k in cost) if ((Game.s.res[k] || 0) < cost[k]) return false; return true; },
  pay(cost) { if (!Game.canAfford(cost)) return false; for (const k in cost) Game.addRes(k, -cost[k]); return true; },
  gateMax() { return 100 + 60 * (Game.s.up.gate || 0); },
  apMax() { return 3 + (Game.s.up.coffee || 0); },

  /* ───────── 파츠 뽑기 ───────── */
  tierWeights(day, luck) {
    const d = U.clamp(day + (luck || 0) * 4, 1, 31);
    let a = TIER_CURVE[0], b = TIER_CURVE[TIER_CURVE.length - 1];
    for (let i = 0; i < TIER_CURVE.length - 1; i++) if (d >= TIER_CURVE[i][0] && d <= TIER_CURVE[i + 1][0]) { a = TIER_CURVE[i]; b = TIER_CURVE[i + 1]; break; }
    const t = b[0] === a[0] ? 0 : (d - a[0]) / (b[0] - a[0]);
    const out = [];
    for (let i = 0; i < 5; i++) out.push({ tier: i, w: U.lerp(a[i + 1], b[i + 1], t) + 0.001 });
    return out;
  },
  // 날짜별 등장 가능한 최고 등급: 초반에 시제품/유물이 굴러들어와 게임이 터지는 것을 막는다
  tierCap(day) { return day < 8 ? 2 : day < 15 ? 3 : 4; },
  rollPart(o) {
    o = o || {};
    const day = o.day || Game.s.day;
    let tier = o.tiers ? U.pick(o.tiers) : U.wpick(Game.tierWeights(day, o.luck)).tier;
    tier = Math.min(tier, Game.tierCap(day));
    const filt = (useTags, useTier) => PART_LIST.filter(p =>
      (!useTier || p.tier === tier) && (!o.rarity || p.r === o.rarity) && (!o.slot || p.slot === o.slot) &&
      (!useTags || !o.tags || p.tags.some(t => o.tags.includes(t))));
    let c = filt(true, !o.rarity);
    if (!c.length) c = filt(false, !o.rarity);
    if (!c.length) c = filt(false, false);
    if (!c.length) c = PART_LIST;
    if (o.rarity) { const maxT = Game.tierCap(day), c2 = c.filter(p => p.tier <= maxT); if (c2.length) c = c2; }
    return U.wpick(c.map(p => ({ p, w: p.slot === 'receiver' ? 1.5 : 1 }))).p.id;
  },
  rollQ(day) { const x = Math.random(); const b = Math.min(0.25, day * 0.008); return x < 0.04 + b * 0.3 ? 2 : x < 0.18 + b ? 1 : 0; },

  /* ───────── 제작 / 분해 / 강화 ───────── */
  craft(id) {
    const p = PARTS[id];
    if (!p || !Game.s.bp[id] || !Game.pay(partCraftCost(p))) return null;
    Game.s.stats.crafted++;
    return Game.addPart(id, 0);
  },
  dismantleYield(inst) {
    const y = partDismantle(PARTS[inst.id], inst.q);
    const ev = Game.today().ev;
    const m = (ev && ev.type === 'recycle' ? 2 : 1) * (1 + 0.15 * (Game.s.up.bench || 0));
    for (const k in y) y[k] = Math.max(1, Math.round(y[k] * m));
    return y;
  },
  dismantle(uid) {
    const inst = Game.inst(uid);
    if (!inst) return null;
    const y = Game.dismantleYield(inst);
    for (const k in y) Game.addRes(k, y[k]);
    Game.removePart(uid);
    return y;
  },
  enhanceInfo(inst) {
    const p = PARTS[inst.id], q = inst.q, t = p.tier;
    const cost = { scrap: 6 * (q + 1) * (t + 1), nuts: 5 * (q + 1) * (t + 1) };
    if (t >= 1) cost.powder = 2 * (q + 1) * t;
    if (t >= 3) cost.circuit = 2 * (q + 1);
    const chance = Math.min(1, [1, 0.9, 0.75, 0.6, 0.45][q] + 0.08 * (Game.s.up.bench || 0));
    return { cost, chance, max: q >= 5 };
  },
  enhance(uid) {
    const inst = Game.inst(uid);
    if (!inst || inst.q >= 5) return null;
    const info = Game.enhanceInfo(inst);
    if (!Game.pay(info.cost)) return null;
    if (Math.random() < info.chance) {
      const great = inst.q <= 3 && Math.random() < 0.08;
      inst.q += great ? 2 : 1;
      return { ok: true, great };
    }
    let down = false;
    if (inst.q >= 3 && Math.random() < 0.25) { inst.q--; down = true; }
    return { ok: false, down };
  },

  /* ───────── 원정 ───────── */
  scavenge(locId) {
    const s = Game.s, loc = LOCATIONS.find(l => l.id === locId);
    const ev = Game.today().ev;
    if (!loc || s.ap < loc.ap || loc.unlock > s.day || (ev && ev.type === 'rain')) return null;
    s.ap -= loc.ap;
    const res = { loc, loot: {}, part: null, line: U.pick(loc.lines), mishap: null, jackpot: false };
    const scale = 1 + 0.045 * (s.day - 1);
    for (const k in loc.loot) {
      const n = Math.round(U.randi(loc.loot[k][0], loc.loot[k][1]) * scale);
      if (n > 0) { res.loot[k] = n; Game.addRes(k, n); }
    }
    if (U.chance(loc.partChance)) {
      const id = Game.rollPart({ tiers: loc.tiers, tags: loc.tags });
      res.part = Game.addPart(id, Game.rollQ(s.day));
    }
    const roll = Math.random();
    if (roll < loc.danger) {
      const dmg = Math.round(U.randi(6, 14) * (1 + s.day * 0.03));
      s.gateHp = Math.max(1, s.gateHp - dmg);
      res.mishap = `돌아오는 길에 놈들이 따라붙었다. 문이 긁혔다. (문 내구도 -${dmg})`;
    } else if (roll > 0.93) {
      const id = Game.rollPart({ luck: 0.5, tags: loc.tags });
      const inst = Game.addPart(id, Game.rollQ(s.day) + 1);
      res.jackpot = inst;
    }
    Game.save();
    return res;
  },

  /* ───────── 시설 ───────── */
  upLevel(id) { return Game.s.up[id] || 0; },
  buyUpgrade(id) {
    const u = UPGRADES.find(x => x.id === id), lv = Game.upLevel(id);
    if (!u || lv >= u.max || !Game.pay(u.cost(lv))) return false;
    Game.s.up[id] = lv + 1;
    if (id === 'gate') Game.s.gateHp += 60;
    if (id === 'bulkhead') Game.s.lives++;
    if (id === 'coffee') Game.s.ap++;
    Game.save();
    return true;
  },
  repairCost() { return { scrap: 6 + Math.floor(Game.s.day / 3) }; },
  repair() {
    const s = Game.s;
    if (s.ap < 1 || s.gateHp >= Game.gateMax() || !Game.pay(Game.repairCost())) return false;
    s.ap--;
    s.gateHp = Math.min(Game.gateMax(), s.gateHp + Math.ceil(Game.gateMax() * 0.5));
    Game.save();
    return true;
  },

  /* ───────── 상점 ───────── */
  genShop(mid) {
    const m = MERCHANTS[mid], s = Game.s, shop = { id: mid, offers: [], mats: [], greet: U.pick(m.greet) };
    if (m.gacha) { shop.gachaPrice = 28 + s.day * 3; return shop; }
    const seen = {};
    let guard = 0;
    while (shop.offers.length < m.n && guard++ < 80) {
      let tier = U.pick(m.tiers);
      if (mid === 'scrap' && s.day >= 8 && U.chance(0.3)) tier = 2;
      if (tier > 2 && s.day < 8) tier = 2;
      const id = Game.rollPart({ tiers: [tier], tags: m.tags, slot: m.slot });
      if (seen[id]) continue;
      seen[id] = 1;
      const q = U.chance(0.2) ? 1 : 0;
      const price = Math.round(partPrice(PARTS[id]) * m.priceMul * (1 + 0.3 * q) * U.rand(0.9, 1.1));
      shop.offers.push({ id, q, price, sold: false, scam: !!m.scam && U.chance(m.scam) });
    }
    if (m.mats) for (const [res, unit, base] of m.mats) shop.mats.push({ res, qty: unit, price: base, left: 4 });
    return shop;
  },
  buyOffer(i) {
    const s = Game.s, o = s.shop && s.shop.offers[i];
    if (!o || o.sold || s.res.nuts < o.price) return null;
    Game.addRes('nuts', -o.price);
    o.sold = true;
    if (o.scam) { s.stats.bricks++; const inst = Game.addPart('stock_brick', 0); Game.save(); return { inst, scam: true, wanted: o.id }; }
    const inst = Game.addPart(o.id, o.q);
    Game.save();
    return { inst };
  },
  buyMat(i) {
    const s = Game.s, o = s.shop && s.shop.mats[i];
    if (!o || o.left <= 0 || s.res.nuts < o.price) return false;
    Game.addRes('nuts', -o.price); Game.addRes(o.res, o.qty); o.left--;
    return true;
  },
  sellPrice(inst) { return Math.max(2, Math.round(partPrice(PARTS[inst.id]) * 0.4 * (1 + 0.3 * inst.q))); },
  sell(uid) {
    const inst = Game.inst(uid);
    if (!inst) return 0;
    const v = Game.sellPrice(inst);
    Game.addRes('nuts', v); Game.removePart(uid);
    return v;
  },
  gachaRates() { return [['고물', 30], ['일반', 33], ['군용', 22], ['시제품', 9], ['유물', 1.5], ['밈', 4.5]]; },
  gacha(n) {
    const s = Game.s;
    if (!s.shop || !s.shop.gachaPrice) return null;
    const cost = s.shop.gachaPrice * (n >= 10 ? 9 : n);
    if (s.res.nuts < cost) return null;
    Game.addRes('nuts', -cost);
    const out = [];
    for (let i = 0; i < n; i++) {
      s.pity++; s.stats.gacha++;
      let id;
      if (s.pity >= 30) { id = Game.rollPart({ tiers: [4] }); s.pity = 0; }
      else {
        const x = Math.random() * 100;
        if (x < 4.5) id = Game.rollPart({ rarity: 5 });
        else if (x < 6) { id = Game.rollPart({ tiers: [4] }); s.pity = 0; }
        else if (x < 15) id = Game.rollPart({ tiers: [3] });
        else if (x < 37) id = Game.rollPart({ tiers: [2] });
        else if (x < 70) id = Game.rollPart({ tiers: [1] });
        else id = Game.rollPart({ tiers: [0] });
      }
      out.push(Game.addPart(id, 0));
    }
    Game.save();
    return out;
  },

  /* ───────── 하루의 흐름 ───────── */
  startDay(first) {
    const s = Game.s, day = Game.today();
    s.ap = Game.apMax();
    const notes = [];
    if (s.flags.apPenalty) { s.ap = Math.max(0, s.ap - 1); s.flags.apPenalty = 0; notes.push('😤 주민 대표가 아침밥을 안 줬다. (활동력 -1)'); }
    if (!first) {
      const rc = (s.up.recycle || 0) * 5;
      if (rc) { Game.addRes('scrap', rc); notes.push(`♻️ 분리수거장에서 고철 +${rc}`); }
      if (s.flags.dog) { const n = U.randi(2, 5); Game.addRes('scrap', n); notes.push(`🐕 사공사가 고철 ${n}개를 물어왔다.`); }
      if (s.flags.sosDay === s.day) {
        const id = Game.rollPart({ luck: 2, day: s.day + 4 });
        Game.addPart(id, 1); Game.addRes('nuts', 60);
        notes.push(`📻 403 대피소에서 보답이 도착했다! '${PARTS[id].name} +1' 과 너트 60개.`);
      }
    }
    s.shop = null;
    let supply = null, event = null;
    if (day.ev) {
      if (day.ev.type === 'merchant') s.shop = Game.genShop(day.ev.id);
      else if (day.ev.type === 'supply') supply = [0, 1, 2].map(() => ({ id: Game.rollPart({ luck: 1 }), q: Game.rollQ(s.day) }));
      else if (day.ev.type === 'event') {
        if (!day.ev.id) {
          let pool = Object.keys(EVENTS).filter(k => !s.usedEvents.includes(k));
          if (s.flags.dog) pool = pool.filter(k => k !== 'dog');
          if (!pool.length) { s.usedEvents = []; pool = Object.keys(EVENTS).filter(k => k !== 'dog' || !s.flags.dog); }
          day.ev.id = U.pick(pool); s.usedEvents.push(day.ev.id);
        }
        event = day.ev.id;
      }
    }
    // 오늘의 의뢰
    s.quest = null;
    if (s.day >= 2 && day.night.threat > 0) {
      let ids = Object.keys(QUESTS);
      if (!Game.gunStats(1)) ids = ids.filter(k => k !== 'second');
      const id = U.pick(ids), q = QUESTS[id];
      s.quest = { id, n: q.n(s.day), nuts: Math.round((22 + s.day * 9) * (day.night.threat >= 4 ? 1.4 : 1)), part: U.chance(0.3) };
    }
    s.morning = { notes, supply, event, shown: false };
    Game.save();
  },
  broadcastText() {
    const s = Game.s, day = Game.today(), n = day.night, B = BROADCAST, lines = [U.pick(B.intro)];
    if (day.ev) {
      if (day.ev.type === 'merchant') lines.push(B.merchant(day.ev.id));
      else if (B[day.ev.type]) lines.push(U.pick(B[day.ev.type]));
    }
    if (n.boss) lines.push(B.boss[n.boss]);
    else if (n.threat === 0) lines.push(U.pick(B.quiet));
    else {
      lines.push(U.pick(B.wave[n.threat - 1]));
      if (n.blood) lines.push(U.pick(B.blood));
      if (n.fog && !s.up.light) lines.push(U.pick(B.fog));
    }
    const tom = Game.dayObj(s.day + 1).night;
    if (tom.boss) lines.push('그리고 내일 밤은... 큰 놈이 옵니다. 오늘 준비를 끝내 두세요.');
    if (s.day === 1) lines.push('새로 온 총포상 양반, 잘 부탁합니다. 작업대에서 총부터 손보세요. 창고에 부품 몇 개 넣어 뒀습니다.');
    else lines.push('오늘의 생활 정보. ' + U.pick(B.tips));
    if (s.quest) lines.push(`게시판에 ${QUESTS[s.quest.id].who}의 의뢰가 붙었습니다. "${QUESTS[s.quest.id].text(s.quest.n)}". 보상은 너트 ${s.quest.nuts}개${s.quest.part ? '와 파츠 상자' : ''}랍니다.`);
    lines.push(U.pick(B.outro));
    return lines;
  },
  combatConfig() {
    const s = Game.s, day = Game.today();
    const guns = [Game.gunStats(0), Game.gunStats(1)];
    return {
      day: s.day, night: day.night, diff: DIFFS[s.diff] || DIFFS.normal,
      guns, turret: s.up.turret ? Game.gunStats(2) : null, turretRate: s.up.turret >= 2 ? 0.85 : 0.5,
      quest: s.quest ? { id: s.quest.id, n: s.quest.n, text: QUESTS[s.quest.id].text(s.quest.n) } : null,
      up: s.up, gateHp: s.gateHp, gateMax: Game.gateMax(), nuts: s.res.nuts, powder: s.res.powder, heat: s.heat || 0, lives: s.lives, dog: !!s.flags.dog, seen: s.seen,
    };
  },
  // 전투 결과 반영. 반환: {crate: [...]} (승리 시 전리품 3택)
  applyCombat(res) {
    const s = Game.s, day = Game.today();
    s.stats.kills += res.kills; s.stats.heads += res.heads; s.stats.waves++;
    s.stats.bestCombo = Math.max(s.stats.bestCombo, res.maxCombo);
    const out = { crate: null, lost: null, parcels: [] };
    const mult = (day.night.blood ? 1.5 : 1);
    const gradeBonus = { S: 1.3, A: 1.15, B: 1.05, C: 1, D: 1 }[res.grade] || 1;
    res.finalNuts = Math.round(res.nuts * mult * (res.win ? gradeBonus : 0.5));
    res.clearBonus = res.win ? Math.round((15 + s.day * 6) * (day.night.threat / 3) * mult) : 0;
    Game.addRes('nuts', res.finalNuts + res.clearBonus - res.spent);
    if (res.powderSpent) Game.addRes('powder', -res.powderSpent);
    for (const k in res.mats) { res.mats[k] = Math.round(res.mats[k] * mult); Game.addRes(k, res.mats[k]); }
    s.gateHp = Math.max(0, Math.round(res.gateHp));
    // 악명: 완벽하게 막을수록 소문이 퍼져 다음 무리가 커진다(보상도 늘어난다). 고전하면 가라앉는다.
    const heat0 = s.heat || 0;
    if (!res.win) s.heat = Math.max(0, heat0 - 2);
    else if (res.grade === 'S') s.heat = Math.min(6, heat0 + 1);
    else if (res.grade === 'C' || res.grade === 'D') s.heat = Math.max(0, heat0 - 1);
    out.heat = s.heat; out.heatDelta = s.heat - heat0;
    if (res.win) {
      for (let i = 0; i < res.parcels; i++) { const id = Game.rollPart({ luck: 1 }); out.parcels.push(Game.addPart(id, Game.rollQ(s.day))); }
      const luck = (res.grade === 'S' ? 1 : 0) + (day.night.blood ? 1 : 0) + (day.night.boss ? 2 : 0);
      const seen = {}; out.crate = [];
      let guard = 0;
      while (out.crate.length < 3 && guard++ < 50) {
        const id = Game.rollPart({ luck });
        if (seen[id]) continue; seen[id] = 1;
        out.crate.push({ id, q: Game.rollQ(s.day) + (day.night.boss ? 1 : 0) });
      }
      if (s.quest) {
        const q = QUESTS[s.quest.id], ok = q.check(res, s.quest.n, Game.gunStats(0));
        out.quest = { ok, text: q.text(s.quest.n), nuts: s.quest.nuts, part: null };
        if (ok) { Game.addRes('nuts', s.quest.nuts); if (s.quest.part) out.quest.part = Game.addPart(Game.rollPart({ luck: 1 }), Game.rollQ(s.day)); }
      }
      if (day.night.boss === 'boss_redev' && !s.won) { s.won = true; out.victory = true; s.pendingVictory = true; }
      s.gateHp = Math.max(s.gateHp, 1);
    } else {
      s.lives--;
      const lost = {};
      for (const k of ['nuts', 'scrap', 'powder', 'circuit', 'goo']) { const n = Math.floor(s.res[k] * 0.25); if (n > 0) { lost[k] = n; Game.addRes(k, -n); } }
      out.lost = lost;
      s.gateHp = Math.ceil(Game.gateMax() * 0.5);
      if (s.lives <= 0) s.over = true;
      // 최종 보스에게 졌는데 목숨이 남았다면, 조합장은 내일 밤 다시 온다 (엔딩을 놓치지 않도록)
      else if (day.night.boss === 'boss_redev' && !s.won) { Game.dayObj(s.day + 1).night = { threat: 5, theme: 'mixed', boss: 'boss_redev' }; out.rematch = true; }
    }
    // 결과 화면에서 새로고침해도 전투 결과가 되돌려지지 않도록 저장해 둔다 (다음 날 전환은 불러올 때 이어서)
    s.pendingNext = true;
    Game.save();
    return out;
  },
  nextDay() {
    const s = Game.s;
    s.pendingNext = false;
    s.day++;
    // 조용한 밤이면 주민들이 문을 조금 고쳐 둔다
    s.gateHp = Math.min(Game.gateMax(), s.gateHp + Math.ceil(Game.gateMax() * 0.1));
    Game.startDay(false);
  },
};
