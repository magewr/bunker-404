// BUNKER 404 — 총기 조립 → 스탯 계산
'use strict';

const MODE_NAME = { semi: '단발', auto: '연발', burst: '점사', charge: '충전', beam: '조사' };
const SP_COUNT_KEYS = { stamp: 1, coupon: 1, sonic: 1 }; // 값이 작을수록 좋은 "N발마다" 류

const Gun = {
  // build.slots: {slotId: uid}. getInst(uid) → {uid,id,q}
  insts(build, getInst) {
    const out = {};
    for (const s of SLOTS) {
      const uid = build.slots[s.id];
      const inst = uid != null ? getInst(uid) : null;
      if (inst && PARTS[inst.id]) out[s.id] = inst;
    }
    return out;
  },
  ids(build, getInst) {
    const insts = Gun.insts(build, getInst), out = {};
    for (const k in insts) out[k] = insts[k].id;
    return out;
  },

  // opt.noAmmo: 탄약 파츠를 뺀 '재생탄' 상태의 스탯 (화약이 떨어졌을 때 쓰인다)
  compute(build, getInst, opt) {
    const insts = Gun.insts(build, getInst);
    if (opt && opt.noAmmo) delete insts.ammo;
    const rc = insts.receiver;
    if (!rc) return null;
    const rp = PARTS[rc.id], b = rp.base;
    const mul = { dmg: 1, rpm: 1, mag: 1, reload: 1, spread: 1, recoil: 1, vel: 1 };
    const add = { pellets: 0, pierce: 0, head: 0, crit: 0, pen: 0, knock: 0, jam: 0, loot: 0, elite: 0, swarm: 0, blast: 0 };
    const fx = {}, sp = {}, tagCount = {}, sum = { dmg: 0, rpm: 0 };
    let pm = 1, spin = b.spin || 0, suppressed = false, totalQ = 0;
    for (const k in FX) if (b[k]) fx[k] = b[k];
    const applyMods = (m, qm) => {
      for (const k in m) {
        let v = m[k];
        const meta = STATS[k];
        if (!meta) continue;
        if ((v > 0) === (meta.good > 0)) v *= qm;
        // 피해·연사 보정은 서로 더한다(+20% 두 개 = +40%). 곱으로 쌓이면 파츠 9칸에서 화력이 폭주한다.
        if (k === 'dmg' || k === 'rpm') sum[k] += v;
        else if (meta.mul) mul[k] *= Math.max(0.05, 1 + v); else add[k] += v;
      }
    };
    const ids = {};
    for (const s of SLOTS) {
      const inst = insts[s.id];
      if (!inst) continue;
      const p = PARTS[inst.id], q = inst.q || 0, qm = 1 + 0.1 * q;
      ids[s.id] = inst.id;
      totalQ += q;
      for (const t of p.tags) tagCount[t] = (tagCount[t] || 0) + 1;
      if (s.id === 'receiver') { // 몸통도 역할 보정(m)과 특수 효과(sp)를 가질 수 있다 (강화 배율은 base 피해에만 적용)
        if (p.m) applyMods(p.m, 1);
        if (p.sp) for (const k in p.sp) { if (SP_COUNT_KEYS[k]) sp[k] = sp[k] ? Math.min(sp[k], p.sp[k]) : p.sp[k]; else sp[k] = (sp[k] || 0) + p.sp[k]; }
        continue;
      }
      if (p.m) applyMods(p.m, qm);
      if (p.fx) for (const k in p.fx) fx[k] = (fx[k] || 0) + p.fx[k] * qm;
      if (p.sp) for (const k in p.sp) {
        if (SP_COUNT_KEYS[k]) sp[k] = sp[k] ? Math.min(sp[k], p.sp[k]) : p.sp[k];
        else sp[k] = (sp[k] || 0) + p.sp[k];
      }
      if (p.pm) pm *= p.pm;
      if (p.spin) spin += p.spin;
      if (p.suppressed) suppressed = true;
    }
    // 세트 효과
    const sets = [];
    for (const tag in tagCount) {
      const defs = SETS[tag];
      if (!defs) continue;
      const setSp = {}; // 같은 세트의 상위 단계는 하위 단계 값을 대체하고, 파츠가 준 값과는 합쳐진다
      for (const tier of defs) {
        if (tagCount[tag] >= tier.n) {
          sets.push({ tag, n: tier.n, name: tier.name, text: tier.text });
          if (tier.m) applyMods(tier.m, 1);
          if (tier.fx) for (const k in tier.fx) fx[k] = (fx[k] || 0) + tier.fx[k];
          if (tier.sp) for (const k in tier.sp) setSp[k] = tier.sp[k];
        }
      }
      for (const k in setSp) {
        if (SP_COUNT_KEYS[k]) sp[k] = sp[k] ? Math.min(sp[k], setSp[k]) : setSp[k];
        else if (k === 'fxMul') sp[k] = Math.max(sp[k] || 0, setSp[k]);
        else sp[k] = (sp[k] || 0) + setSp[k];
      }
    }
    mul.dmg = Math.max(0.1, 1 + sum.dmg); mul.rpm = Math.max(0.15, 1 + sum.rpm);
    if (sp.fxMul) for (const k of ['burn', 'acid', 'freeze']) if (fx[k]) fx[k] *= sp.fxMul;
    if (fx.explode && add.blast) fx.explode *= Math.max(0.3, 1 + add.blast / 100);

    const s = {
      valid: true, ids, insts, tagCount, sets, fx, sp, suppressed, totalQ,
      receiver: rp, mode: b.mode, proj: b.proj, cyc: b.cyc || null,
      burst: b.burst || 1, burstDelay: b.burstDelay || 0.3, charge: b.charge || 0,
      spin, range: b.range || 0, ramp: b.ramp || 0, pool: b.pool || 0, regen: (b.regen || 0) + (sp.regen || 0), noReload: !!b.regen,
      beamColor: b.beamColor || null, snd: Object.assign({ power: 0.4, kind: 'bullet' }, b.snd || {}),
    };
    s.snd.suppressed = suppressed;
    s.dmg = b.dmg * mul.dmg * (1 + 0.08 * (rc.q || 0));
    s.rpm = U.clamp(b.rpm * mul.rpm, 10, 2400);
    s.mag = Math.max(1, Math.round(b.mag * mul.mag));
    s.reload = Math.max(0.25, b.reload * mul.reload);
    // 탄환 수를 늘리는 파츠는 '한 발을 여러 갈래로 쪼개는' 것: 추가 1발당 총 피해 +15% 만 주고 나머지는 나눠 갖는다.
    // (그러지 않으면 단발 총에 산탄 파츠를 달 때 화력이 2~3배로 뛴다)
    const basePel = b.pellets || 1, pel = Math.max(1, Math.round(basePel + add.pellets));
    const pelNorm = pel === basePel ? 1 : basePel / pel * (pel > basePel ? 1 + 0.15 * (pel - basePel) : 1 - 0.04 * (basePel - pel));
    s.dmg *= pelNorm;
    s.pellets = Math.max(1, Math.round(pel * pm));
    // 빔·전격·레일·음파·특이점은 갈래가 의미 없으므로 한 줄기로 합치고 갈래당 +25%
    if (['beam', 'arc', 'rail', 'orb', 'wave'].includes(b.proj) && s.pellets > 1) { s.dmg *= 1 + (s.pellets - 1) * 0.25; s.pellets = 1; }
    s.spread = Math.max(0, b.spread * mul.spread);
    if (s.pellets > 1 && s.proj !== 'beam') s.spread = Math.max(s.spread, 2.5 + s.pellets * 0.3);
    s.recoil = Math.max(0, b.recoil * mul.recoil);
    s.vel = b.vel * mul.vel;
    s.pierce = (b.pierce || 0) + add.pierce;
    s.head = Math.max(1, (b.head || 2.0) + add.head);
    s.crit = U.clamp(add.crit, 0, 100);
    s.pen = U.clamp(add.pen, -60, 100);
    s.knock = (b.knock || 0) + add.knock;
    s.jam = U.clamp(add.jam, 0, 20);
    s.loot = add.loot;
    s.elite = Math.max(-90, add.elite); s.swarm = Math.max(-90, add.swarm); s.blast = add.blast;
    // 탄약값: 탄약 파츠의 cost × 구경 보정. 빔·화염은 틱당이라 훨씬 싸게.
    const ap = insts.ammo ? PARTS[insts.ammo.id] : null;
    let cal = U.clamp(Math.sqrt(b.dmg * (b.pellets || 1) / 16), 0.4, 4);
    if (b.proj === 'beam' || b.proj === 'flame') cal *= 0.15;
    s.ammoCost = ap && ap.cost ? ap.cost * cal * Math.max(0.1, 1 - (sp.cheap || 0)) : 0;
    s.ammoName = ap ? ap.name : '재생탄';
    // DPS 추정
    let sps;
    if (s.mode === 'charge') sps = 1 / (s.charge + 60 / s.rpm);
    else if (s.mode === 'burst') sps = s.burst / ((s.burst - 1) * 60 / s.rpm + s.burstDelay);
    else sps = s.rpm / 60;
    s.sps = sps;
    s.sunderK = Math.min(1, 2 / sps) / s.pellets; // 절삭은 느리고 굵은 한 발일수록 온전히 들어간다
    let per = s.dmg * s.pellets * (1 + s.crit / 100);
    if (s.ramp) per *= (1 + s.ramp) / 2;
    if (fx.explode) per *= 1.25;
    if (fx.shock) per *= 1 + 0.25 * Math.min(4, fx.shock);
    if (sp.p2w) per *= 1;
    if (sp.moon) per *= 1 + sp.moon * 4;
    s.perShot = s.dmg * s.pellets;
    s.dps = per * sps;
    s.dot = (fx.burn || 0) * 3;
    const magTime = s.mag / sps;
    s.sustained = s.noReload ? s.dps * 0.85 : per * s.mag / (magTime + s.reload);
    s.acc = Math.round(U.clamp(100 - s.spread * 7, 0, 100));
    // 역할별 화력 추정 (UI 표시용)
    const sunderRef = fx.sunder ? fx.sunder / 100 * 1500 * s.pellets * sps * s.sunderK * 0.5 : 0;
    s.dpsElite = s.dps * Math.max(0.1, 1 + s.elite / 100) * (1 + (sp.focus || 0) * 6 / 100) * (1 + Math.max(0, s.head - 2) * 0.15) + sunderRef;
    s.dpsSwarm = s.dps * Math.max(0.1, 1 + s.swarm / 100) * (1 + Math.min(4, s.pierce) * 0.22 + (fx.explode ? 0.5 + fx.explode / 60 : 0) + (fx.shock ? 0.15 * fx.shock : 0) + (fx.bounce ? 0.15 * fx.bounce : 0) + Math.min(8, s.pellets - 1) * 0.05) * (1 + (sp.opener || 0) / 250 + (sp.momentum || 0) * 2.5 / 100) * (s.proj === 'flame' || s.proj === 'wave' ? 1.8 : 1);
    s.costPerMin = s.ammoCost * sps * 60;
    s.name = build.name || Gun.autoName(s);
    if (s.ammoCost > 0 && !(opt && opt.noAmmo)) s.basic = Gun.compute(build, getInst, { noAmmo: true });
    return s;
  },

  autoName(s) {
    const fx = s.fx, sp = s.sp;
    let adj = '';
    const cand = [
      [sp.p2w, '과금'], [sp.mint, '민초'], [sp.duck, '꽥꽥'], [fx.explode, '터지는'], [fx.burn, '불타는'], [fx.shock, '찌릿한'],
      [fx.freeze, '시원한'], [fx.acid, '삭은'], [fx.rad, '수상한'], [fx.bounce, '통통 튀는'], [fx.homing, '눈치 빠른'],
      [fx.gold, '번쩍이는'], [fx.leech, '알뜰한'],
    ];
    for (const [v, a] of cand) if (v) { adj = a; break; }
    if (!adj) {
      if (s.pellets >= 6) adj = '흩뿌리는';
      else if (s.rpm >= 800) adj = '수다스러운';
      else if (s.spread <= 0.6) adj = '꼼꼼한';
      else if (s.spread >= 6) adj = '기분파';
      else if (s.mag >= 60) adj = '넉넉한';
      else if (s.recoil >= 4) adj = '성깔 있는';
      else if ((s.tagCount.junk || 0) >= 3) adj = '녹슨';
      else if ((s.tagCount.mil || 0) >= 3) adj = '제식';
      else adj = '수제';
    }
    let name = adj + ' ' + s.receiver.name;
    if (s.sets.length) name += ' ‘' + s.sets[s.sets.length - 1].name + '’';
    return name;
  },

  // 파츠 효과 줄 목록 (UI용): [{t:text, g: 1|-1|0}]
  modLines(p, q) {
    const lines = [];
    const qm = p.slot === 'receiver' ? 1 : 1 + 0.1 * (q || 0); // 몸통의 역할 보정은 강화로 늘지 않는다
    if (p.slot === 'receiver') {
      const b = p.base, dq = 1 + 0.08 * (q || 0);
      lines.push({ t: `피해 ${Math.round(b.dmg * dq * 10) / 10}${b.pellets ? ' ×' + b.pellets : ''} · 연사 ${b.rpm} · ${MODE_NAME[b.mode]}`, g: 0 });
      lines.push({ t: `장탄 ${b.mag} · 재장전 ${b.reload}s · 탄퍼짐 ${b.spread}°`, g: 0 });
      const ex = [];
      if (b.pierce) ex.push('관통 ' + (b.pierce >= 99 ? '∞' : b.pierce));
      if (b.head) ex.push('약점 ×' + b.head);
      for (const k in FX) if (b[k]) ex.push(FX[k].icon + FX[k].name);
      if (ex.length) lines.push({ t: ex.join(' · '), g: 1 });
    }
    if (p.m) for (const k in p.m) {
      const meta = STATS[k]; let v = p.m[k];
      if (!meta || !v) continue;
      const good = (v > 0) === (meta.good > 0);
      if (good) v *= qm;
      let txt;
      if (meta.mul) txt = `${meta.name} ${v > 0 ? '+' : ''}${Math.round(v * 100)}%`;
      else txt = `${meta.name} ${v > 0 ? '+' : ''}${meta.dec ? v.toFixed(1) : Math.round(v)}${meta.unit || ''}`;
      lines.push({ t: txt, g: good ? 1 : -1 });
    }
    if (p.pm) lines.push({ t: `탄환 수 ×${p.pm}`, g: 1 });
    if (p.fx) for (const k in p.fx) lines.push({ t: FX[k].icon + ' ' + FX[k].desc(p.fx[k] * qm), g: 1, fx: k });
    if (p.note) lines.push({ t: '★ ' + p.note, g: 2 });
    if (p.suppressed) lines.push({ t: '🤫 소음기', g: 0 });
    if (p.slot === 'ammo') lines.push({ t: p.cost ? `🧨 탄약값 ${p.cost} /발 (구경 보정)` : '🧨 무료 탄약', g: p.cost ? -1 : 1 });
    return lines;
  },
};
