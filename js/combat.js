// BUNKER 404 — 전투 엔진 (사이드뷰 웨이브 디펜스)
'use strict';

const Combat = (function () {
  const W = 640, H = 360, SC = 2;
  const KB_SCALE = 0.5; // 넉백 이동 거리 배율
  const GROUND = 250, LANE_MIN = 268, LANE_MAX = 338, GATE_X = 124;
  const PX = 86, PY = 196, PIVX = 92, PIVY = 178, GS = 0.5;
  const TUR = [{ x: 46, y: 196 }, { x: 18, y: 196 }];
  const DEG = Math.PI / 180;
  const FONT = '"Do Hyeon","Apple SD Gothic Neo","Malgun Gothic",sans-serif';

  let cv, ctx, low, lctx, bg, bgctx, bgT = -9;
  let raf = 0, last = 0, running = false, paused = false, inited = false;
  let C = null, cfg = null;
  const mouse = { x: 400, y: 280, down: false, pressed: false };
  let aimId = null, lastPT = 'mouse', tb = null; // 터치 조준 중인 손가락 · 마지막 입력 종류 · 화면 버튼
  const isTouch = () => { const st = document.getElementById('stage'); return !!(st && st.classList.contains('touch')); };

  const snd = (n, o) => { try { if (window.Sound) Sound.play(n, o); } catch (e) { /* noop */ } };
  const sgun = p => { try { if (window.Sound) Sound.gun(p); } catch (e) { /* noop */ } };

  /* ───────── 초기화 / 입력 ───────── */
  function init() {
    if (inited) return;
    inited = true;
    cv = document.getElementById('game-canvas');
    ctx = cv.getContext('2d');
    low = document.createElement('canvas'); low.width = W; low.height = H; lctx = low.getContext('2d');
    bg = document.createElement('canvas'); bg.width = W; bg.height = H; bgctx = bg.getContext('2d');
    const pos = ev => {
      const r = cv.getBoundingClientRect();
      mouse.x = (ev.clientX - r.left) / r.width * W;
      mouse.y = (ev.clientY - r.top) / r.height * H;
    };
    cv.addEventListener('mousemove', pos);
    cv.addEventListener('mousedown', ev => { if (ev.button !== 0) return; pos(ev); mouse.down = true; mouse.pressed = true; ev.preventDefault(); });
    window.addEventListener('mouseup', () => { mouse.down = false; });
    cv.addEventListener('contextmenu', ev => { ev.preventDefault(); if (lastPT !== 'mouse') return; pos(ev); if (running && !paused) throwGrenade(); });
    // 터치: 누르고 있는 동안 그 지점을 조준·사격. 손가락이 과녁을 가리지 않게 조준점을 살짝 위로 띄운다
    // (화면 맨 아래 줄도 겨눌 수 있도록 바닥 쪽으로 갈수록 띄우는 양을 줄인다)
    const tpos = ev => {
      const r = cv.getBoundingClientRect(), k = H / r.height;
      const x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) * k;
      const off = ev.pointerType === 'touch' ? 34 * k * U.clamp((H - y) / (H - GROUND), 0, 1) : 0;
      mouse.x = x; mouse.y = y - off;
    };
    cv.addEventListener('pointerdown', ev => {
      lastPT = ev.pointerType;
      if (ev.pointerType === 'mouse') return;
      ev.preventDefault();
      if (aimId !== null) return;
      aimId = ev.pointerId;
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* noop */ }
      tpos(ev); mouse.down = true; mouse.pressed = true;
    });
    cv.addEventListener('pointermove', ev => { if (ev.pointerId === aimId) { ev.preventDefault(); tpos(ev); } });
    const tup = ev => { if (ev.pointerId === aimId) { aimId = null; mouse.down = false; } };
    cv.addEventListener('pointerup', tup); cv.addEventListener('pointercancel', tup);
    // 터치용 화면 버튼 (왼손 엄지 자리). 터치 기기에서만 CSS 로 보인다
    try {
      tb = document.createElement('div'); tb.id = 'tbtns';
      tb.innerHTML = '<button class="tb-pause" data-k="pause">⏸</button><button data-k="swap" style="top:284px">⇄<small>무기 교체</small></button><button data-k="reload" style="top:380px">⟳<small>재장전</small></button><button data-k="gren" style="top:476px">💣<small>수류탄</small></button>';
      document.getElementById('stage').appendChild(tb);
      tb.addEventListener('pointerdown', ev => {
        ev.preventDefault(); ev.stopPropagation();
        const b = ev.target.closest && ev.target.closest('button');
        if (!b || !running) return;
        const k = b.dataset.k;
        if (k === 'pause') { setPaused(!paused); return; }
        if (paused || !C) return;
        if (k === 'swap') { if (C.swapT <= 0) swap(); } else if (k === 'reload') manualReload(); else if (k === 'gren') throwGrenade();
      });
      tb.addEventListener('contextmenu', ev => ev.preventDefault());
      tb.btn = k => tb.querySelector(`[data-k="${k}"]`);
    } catch (e) { tb = null; }
    cv.addEventListener('wheel', ev => { if (running && !paused && C && C.swapT <= 0) swap(); ev.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', ev => {
      if (!running) return;
      // 한글 입력 상태에서도 먹도록 물리 키(code)를 우선 본다
      const k = (ev.key || '').toLowerCase(), c = ev.code || '';
      if (c === 'Escape' || c === 'KeyP' || k === 'escape' || k === 'p') { if (ev.repeat) return; setPaused(!paused); ev.preventDefault(); return; }
      if (paused || !C) return;
      if (c === 'KeyR' || k === 'r' || k === 'ㄱ') manualReload();
      else if (c === 'Digit1' || k === '1') select(0);
      else if (c === 'Digit2' || k === '2') select(1);
      else if (c === 'KeyQ' || c === 'Tab' || k === 'q' || k === 'ㅂ' || k === 'tab') { if (!ev.repeat) swap(); ev.preventDefault(); }
      else if (c === 'Space' || c === 'KeyG' || k === ' ' || k === 'g' || k === 'ㅎ') { throwGrenade(); ev.preventDefault(); }
    });
    window.addEventListener('blur', () => { mouse.down = false; if (running && C && !C.ended && cfg.mode !== 'range') setPaused(true); });
  }

  function mkWeapon(st) {
    return { s: st, ammo: st.mag, reload: 0, cool: 0, idle: 9, bloom: 0, spin: 0, spinPhase: 0, charge: 0, chargeSnd: false, jam: false, shots: 0, burstLeft: 0, burstT: 0, buff: 0, pred: 0, flash: 0, kick: 0, coupon: 0 };
  }

  function start(config) {
    init();
    cfg = config;
    const guns = cfg.guns.filter(g => g);
    C = {
      t: 0, ended: false, endT: 0, win: false, timers: [], slow: 0,
      weapons: guns.map(mkWeapon), cur: 0, swapT: 0, aim: 0,
      turrets: [], enemies: [], projs: [], eprojs: [], parts: [], texts: [], beams: [], rings: [], pools: [], holes: [], mines: [], ducks: [],
      spawns: [], si: 0, total: 0, done: 0, remainFrac: 1, boss: null,
      gateHp: cfg.gateHp, gateMax: cfg.gateMax, gateFlash: 0, alarmT: 0, shake: 0,
      nuts: cfg.nuts || 0, spent: 0,
      stat: { kills: 0, shots: 0, hits: 0, heads: 0, dmg: 0, nuts: 0, mats: {}, parcels: 0, combo: 0, comboT: 0, maxCombo: 0, gateStart: cfg.gateHp, shout: 0 },
      banner: null, hitMark: 0, killMark: 0, dps: [], env: null, fogOff: false, thorns: 0,
    };
    C.grenT = 2;
    C.powder = cfg.powder || 0; C.powderSpent = 0; C.okDepth = 0; C.sid = 0; C.hitSids = new Set();
    C.usesPowder = C.weapons.some(w => w.s.ammoCost > 0) || !!(cfg.turret && cfg.turret.ammoCost > 0);
    C.grenW = mkWeapon({ dmg: 55 + (cfg.day || 1) * 24, pellets: 1, mag: 1, reload: 1, rpm: 60, spread: 0, recoil: 0, vel: 430, pierce: 0, head: 1, crit: 0, pen: 30, knock: 0, jam: 0, loot: 0, regen: 0, spin: 0, ramp: 0, pool: 0, mode: 'semi', proj: 'lob', fx: { explode: 52 }, sp: {}, ids: {}, receiver: { id: 'grenade', name: '수류탄' }, snd: { power: 0.5, kind: 'launcher' }, name: '수류탄' });
    for (const w of C.weapons) { if (w.s.sp.thermal) C.fogOff = true; if (w.s.sp.thorns) C.thorns = Math.max(C.thorns, w.s.sp.thorns); }
    if (cfg.up.light) C.fogOff = true;
    if (cfg.turret) {
      C.turrets.push({ x: TUR[0].x, y: TUR[0].y, w: mkWeapon(cfg.turret), aim: 0.2, target: null });
    }
    if (cfg.mode === 'range') {
      spawnEnemy('dummy', { x: 300, y: 300 });
      spawnEnemy('dummy', { x: 420, y: 282 });
      const a = spawnEnemy('dummy', { x: 540, y: 325 }); a.armor = 0.6; a.label = '철갑';
      banner('시험 사격장', isTouch() ? '⏸: 나가기 · ⇄: 무기 교체 · ⟳: 재장전' : 'ESC: 나가기 · 1/2: 무기 교체 · R: 재장전');
    } else {
      const plan = Waves.plan(cfg.day, cfg.night, cfg.heat || 0);
      C.spawns = plan.list; C.total = plan.list.length;
      const n = (cfg.up.mines || 0) * 2;
      for (let i = 0; i < n; i++) C.mines.push({ x: U.rand(230, 540), y: U.rand(LANE_MIN + 4, LANE_MAX - 4) });
      const nt = cfg.night;
      banner(nt.boss ? '⚠ 보스 접근 중 ⚠' : nt.blood ? '🩸 블러드문 🩸' : `${cfg.day}일차 밤`, nt.boss ? ENEMIES[nt.boss].name + ' — ' + ENEMIES[nt.boss].title : (THEMES[nt.theme] ? THEMES[nt.theme].name : ''));
      snd('wave_start');
      if (cfg.day === 1) { C.timers.push({ t: 4.5, fn: () => banner('머리를 노려라!', '약점 명중은 2배 피해 · 꾹 누르면 연사 · ' + (isTouch() ? '⟳ 버튼 재장전' : 'R 재장전')) }); }
      else if (cfg.day === 2) C.timers.push({ t: 4.5, fn: () => banner('팁', '멀리 있는 적은 탄이 퍼진다 · 조준선이 좁아질 때 쏴라') });
    }
    try { if (window.Sound) Sound.music(cfg.mode === 'range' ? 'base' : cfg.night.boss ? 'boss' : 'combat'); } catch (e) { /* noop */ }
    running = true; paused = false; last = performance.now(); bgT = -9; aimId = null; mouse.down = false;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function setPaused(p) {
    if (!running || !C || C.ended) return;
    paused = p; last = performance.now();
    if (cfg.onPause) cfg.onPause(p);
  }
  function abort() { // 포기 / 사격장 나가기
    if (!C || C.ended) return;
    paused = false;
    if (cfg.mode === 'range') { stop(); if (cfg.onEnd) cfg.onEnd(null); return; }
    C.gateHp = 0; lose();
  }

  // 수류탄: 모든 조합이 쓸 수 있는 비상 광역기 (쿨다운)
  const GREN_CD = 11;
  function throwGrenade() {
    if (!C || C.ended || C.grenT > 0) return;
    C.grenT = GREN_CD;
    const w = C.grenW, tx = U.clamp(mouse.x, 130, W - 4), ty = U.clamp(mouse.y, 30, H - 8);
    const T = Math.max(0.35, Math.hypot(tx - PIVX, ty - PIVY) / 430);
    C.projs.push({ w, kind: 'lob', x: PIVX, y: PIVY - 6, sx: PIVX, sy: PIVY - 6, tx, ty, t: 0, T, dmg: w.s.dmg, age: 0, rot: 0, pierce: 0, bounce: 0, life: 9, dist: 0, maxDist: 0, hit: null });
    snd('whoosh');
  }
  function banner(txt, sub) { C.banner = { txt, sub: sub || '', t: 0 }; }
  function text(x, y, txt, col, size, life) { C.texts.push({ x, y, txt, col: col || '#fff', size: size || 14, t: 0, life: life || 0.8, vx: U.rand(-8, 8), vy: -34 }); }

  /* ───────── 무기 조작 ───────── */
  function curW() { return C.weapons[C.cur]; }
  function select(i) { if (i !== C.cur && C.weapons[i]) { const w = curW(); w.charge = 0; w.burstLeft = 0; C.cur = i; C.swapT = 0.28; snd('equip'); } }
  function swap() { if (C.weapons.length > 1) select((C.cur + 1) % C.weapons.length); }
  function startReload(w, quiet) {
    if (w.reload > 0 || w.ammo >= w.s.mag || w.s.noReload) return;
    w.reload = w.s.reload; w.charge = 0; w.burstLeft = 0;
    if (!quiet) snd('reload_start');
    if (w.s.sp.horn && !quiet) {
      snd('airhorn', { vol: 0.6 });
      C.rings.push({ x: PIVX, y: PIVY + 60, r: 10, max: 150, col: '#ffd76a', t: 0 });
      for (const e of C.enemies) if (!e.dead && e.x < 250 && !e.def.boss) e.kb += 90;
    }
  }
  function manualReload() { const w = curW(); if (w.jam) { clearJam(w); return; } startReload(w); }
  function clearJam(w) { w.jam = false; w.cool = 0.3; snd('jam_clear'); }

  function muzzleOf(w, px, py, ang) {
    let mx = 30, my = -3;
    try { if (window.GunArt) { const m = GunArt.metrics(w.s.ids); mx = m.muzzleX; my = m.muzzleY; } } catch (e) { /* noop */ }
    mx = Math.min(mx, 150) * GS; my *= GS;
    const c = Math.cos(ang), s = Math.sin(ang);
    return { x: px + c * mx - s * my, y: py + s * mx + c * my };
  }

  // 무기 한 프레임 갱신. o: {trigger, pressed, px, py, ang, tx, ty, turret, rate}
  function updWeapon(w, dt, o) {
    const s = w.s;
    w.cool -= dt; w.idle += dt;
    w.bloom = Math.max(0, w.bloom - dt * (5 + w.bloom * 2.2));
    w.flash = Math.max(0, w.flash - dt * 14);
    w.kick = Math.max(0, w.kick - dt * 22);
    if (w.buff > 0) w.buff -= dt;
    if (w.pred > 0) w.pred -= dt;
    if (w.momT > 0) { w.momT -= dt; if (w.momT <= 0) w.momN = 0; }
    if (s.spin) {
      w.spin = o.trigger && w.reload <= 0 ? Math.min(1, w.spin + dt / s.spin) : Math.max(0, w.spin - dt / (s.spin * 1.6));
      w.spinPhase += w.spin * dt * 30;
    }
    if (w.reload > 0) {
      w.reload -= dt;
      if (w.reload <= 0) {
        w.ammo = s.mag;
        if (!o.turret) snd('reload_end');
        if (s.sp.washer) { w.buff = 5; if (!o.turret) { snd('washer_done'); text(PIVX + 10, PIVY - 30, '세탁 완료! 피해 +30%', '#9fd8ff', 13, 1.4); } }
      }
      return;
    }
    if (s.regen && w.idle > 0.45) w.ammo = Math.min(s.mag, w.ammo + s.mag * s.regen * dt);
    if (w.jam) {
      if (o.turret) { w.jamT = (w.jamT || 0) + dt; if (w.jamT > 1) { w.jam = false; w.jamT = 0; } }
      else if (o.pressed) clearJam(w);
      return;
    }
    if (w.ammo < 1) {
      if (!s.noReload) { if (w.idle > 0.12 || o.turret) startReload(w, o.turret); }
      else if (o.pressed) snd('dry');
      w.charge = 0;
      return;
    }
    const gap = 60 / s.rpm / (o.rate || 1);
    if (s.mode === 'charge') {
      if (o.trigger && w.cool <= 0) {
        if (w.charge === 0 && !o.turret) snd('charge', { pitch: 0.6 / Math.max(0.3, s.charge) });
        const before = w.charge;
        w.charge = Math.min(1, w.charge + dt / s.charge);
        if (before < 1 && w.charge >= 1 && !o.turret) snd('charge_full');
        if (o.turret && w.charge >= 1) { shoot(w, o, w.charge); w.charge = 0; w.cool = gap; }
      } else if (w.charge > 0) {
        if (w.charge >= 0.2 && w.cool <= 0) { shoot(w, o, w.charge); w.cool = gap; }
        w.charge = 0;
      }
      return;
    }
    if (s.mode === 'burst') {
      if (w.burstLeft > 0) {
        w.burstT -= dt;
        if (w.burstT <= 0) {
          shoot(w, o, 1); w.burstLeft--; w.burstT = 60 / s.rpm;
          if (w.burstLeft <= 0 || w.ammo < 1) { w.burstLeft = 0; w.cool = s.burstDelay / (o.rate || 1); }
        }
      } else if (o.trigger && w.cool <= 0) { w.burstLeft = s.burst; w.burstT = 0; }
      return;
    }
    if (s.spin && w.spin < 1) return;
    if (o.trigger && w.cool <= 0) {
      let n = 0;
      if (w.cool < -gap) w.cool = 0;
      while (w.cool <= 0 && n < 3 && w.ammo >= 1 && !w.jam) { shoot(w, o, 1); w.cool += gap; n++; }
    }
  }

  function shoot(w, o, power) {
    const s = w.s, sp = s.sp;
    if (s.jam > 0 && Math.random() * 100 < s.jam) {
      w.jam = true; w.burstLeft = 0;
      if (!o.turret) { snd('jam'); text(o.px + 10, o.py - 34, '걸림! [R] 또는 클릭', '#ff7070', 14, 1.2); }
      return;
    }
    if (s.ammoCost > 0 && cfg.mode !== 'range') { // 탄약값: 화약 소모. 떨어지면 무료 재생탄으로 전환
      if (C.powder >= s.ammoCost) { C.powder -= s.ammoCost; C.powderSpent += s.ammoCost; }
      else if (s.basic) {
        w.s = s.basic; w.ammo = Math.min(w.ammo, w.s.mag);
        if (!o.turret) { banner('🧨 화약 소진!', `${s.ammoName} 효과 꺼짐 → 무료 재생탄으로 전환`); snd('dry'); }
        return shoot(w, o, power);
      }
    }
    let dmgMul = 1;
    if (s.mode === 'charge') dmgMul *= 0.25 + 0.75 * power;
    if (sp.p2w) {
      if (C.nuts > 0) { C.nuts--; C.spent++; } else dmgMul *= 0.28;
    }
    if (!(sp.freeAmmo && Math.random() < sp.freeAmmo)) w.ammo -= 1;
    w.shots++; w.idle = 0;
    if (!o.turret) C.stat.shots++;
    const forced = sp.stamp && w.shots % sp.stamp === 0;
    if (forced && !o.turret) text(o.px + 14, o.py - 30, '결재 완료!', '#ff5050', 13, 0.7);
    if (sp.sonic && w.shots % sp.sonic === 0) sonicBlast(w, o);
    const mz = muzzleOf(w, o.px, o.py, o.ang);
    const sprd = (s.spread + w.bloom + (o.turret ? 1.5 : 0)) * DEG;
    const tdist = Math.hypot(o.tx - mz.x, o.ty - mz.y);
    const ground = o.ty > GROUND + 4;
    const sid = o.turret ? 0 : ++C.sid; // 명중률 집계용: 한 번의 격발 = 한 발
    const base = { dmgMul, crit: forced, turret: o.turret, power, sid };
    if (s.proj === 'beam') fireBeam(w, mz, o.ang, base, 900);
    else if (s.proj === 'rail') fireRail(w, mz, o.ang + (Math.random() - 0.5) * sprd, base);
    else if (s.proj === 'arc') fireArc(w, mz, o.ang + (Math.random() - 0.5) * sprd, base, tdist);
    else for (let i = 0; i < s.pellets; i++) {
      const a = o.ang + (Math.random() + Math.random() - 1) * sprd;
      const vel = s.vel * U.rand(0.94, 1.06);
      const p = { w, kind: s.proj, x: mz.x, y: mz.y, px: mz.x, py: mz.y, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel, dmg: s.dmg * dmgMul, pierce: s.pierce + (s.mode === 'charge' && power >= 1 ? 1 : 0), bounce: Math.round(s.fx.bounce || 0), life: 2.6, dist: 0, maxDist: ground && s.proj === 'saw' ? tdist + 10 + U.rand(-4, 6) : 0, crit: forced, turret: o.turret, hit: null, age: 0, rot: 0, sid };
      if (s.proj === 'lob' || s.proj === 'orb') {
        const off = sprd * tdist;
        p.sx = mz.x; p.sy = mz.y;
        p.tx = U.clamp(o.tx + (Math.random() - 0.5) * off * 2, 130, W - 4); p.ty = U.clamp(o.ty + (Math.random() - 0.5) * off, 30, H - 8);
        p.T = Math.max(0.28, Math.hypot(p.tx - mz.x, p.ty - mz.y) / s.vel); p.t = 0;
      } else if (s.proj === 'flame') { p.life = (s.range || 200) / s.vel * U.rand(0.85, 1.1); p.r = 2; p.hit = new Set(); p.maxDist = 0; }
      else if (s.proj === 'wave') { p.ox = mz.x; p.oy = mz.y; p.ang = a; p.rad = 8; p.hit = new Set(); p.range = s.range || 300; }
      else if (s.proj === 'saw') { p.phase = 0; if (!ground) p.maxDist = 0; }
      C.projs.push(p);
    }
    w.flash = 1; w.kick = Math.min(5, 1 + s.recoil * 0.5); w.bloom = Math.min(14, w.bloom + s.recoil * 0.55);
    if (!o.turret) {
      if (s.proj !== 'beam' && s.proj !== 'flame') C.shake = Math.min(7, C.shake + s.snd.power * 1.6);
      sgun(s.snd);
      if (s.cyc) C.timers.push({ t: 0.2, fn: () => snd(s.cyc) });
    } else if (s.proj !== 'beam' && s.proj !== 'flame') snd('turret_fire', { vol: 0.35 + s.snd.power * 0.3, pitch: 1.3 - s.snd.power * 0.5, pan: -0.5 });
    if ((s.proj === 'bullet' || s.proj === 'nail') && C.parts.length < 500) C.parts.push({ x: o.px + 4, y: o.py - 2, vx: U.rand(-40, -10), vy: U.rand(-90, -50), g: 400, life: 0.6, t: 0, col: '#d9b84a', sz: 1.5 });
  }

  function sonicBlast(w, o) {
    snd('sonic_wave');
    C.rings.push({ x: o.px, y: o.py + 40, r: 10, max: 300, col: '#ffd76a', t: 0 });
    const d = w.s.dmg * w.s.pellets * 1.5;
    for (const e of C.enemies.slice()) if (!e.dead && e.state !== 'burrow' && e.x < 400) { e.kb += e.def.boss ? 0 : 70; applyHit(e, d, w, { aoe: true, noFx: true }); }
  }

  /* ───────── 즉발 무기: 빔 / 레일 / 아크 ───────── */
  function rayHits(x1, y1, x2, y2) {
    const out = [];
    for (const e of C.enemies) {
      if (e.dead || e.state === 'burrow') continue;
      const t = U.segRect(x1, y1, x2, y2, e.x - e.w / 2, e.y - e.h, e.w, e.h);
      if (t >= 0) out.push({ e, t, hx: x1 + (x2 - x1) * t, hy: y1 + (y2 - y1) * t });
    }
    for (const p of C.eprojs) {
      if (!p.hp || p.dead) continue;
      const t = U.segRect(x1, y1, x2, y2, p.x - 7, p.y - 7, 14, 14);
      if (t >= 0) out.push({ ep: p, t, hx: p.x, hy: p.y });
    }
    out.sort((a, b) => a.t - b.t);
    return out;
  }
  function isHead(e, hy) { return !e.def.noHead && hy < e.y - e.h * 0.68; }
  function shieldBlocks(e, hy) { return e.shieldHp > 0 && hy > e.y - e.h * 0.7; }
  function hitShield(e, dmg, hx, hy) {
    e.shieldHp -= dmg; e.flash = 0.6; snd('hit_shield');
    spark(hx, hy, '#cfd6da', 3);
    if (e.shieldHp <= 0) { text(e.x, e.y - e.h - 4, '문짝 파괴!', '#cfd6da', 12); burst(e.x - 6, e.y - e.h / 2, '#8a8f93', 10, 90); }
  }
  function fireBeam(w, mz, ang, base, len) {
    const s = w.s, x2 = mz.x + Math.cos(ang) * len, y2 = mz.y + Math.sin(ang) * len;
    const hits = rayHits(mz.x, mz.y, x2, y2);
    let pierce = s.pierce, ex = x2, ey = y2;
    const dmg = s.dmg * s.pellets * base.dmgMul;
    for (const h of hits) {
      if (h.ep) { hitEproj(h.ep, dmg); ex = h.hx; ey = h.hy; break; }
      const e = h.e;
      if (shieldBlocks(e, h.hy)) { hitShield(e, dmg, h.hx, h.hy); ex = h.hx; ey = h.hy; break; }
      let d = dmg;
      if (s.ramp) { e.heat = Math.min(1, (e.heat || 0) + 0.035); e.heatT = 0.3; d *= 1 + (s.ramp - 1) * e.heat; }
      applyHit(e, d, w, { x: h.hx, y: h.hy, head: isHead(e, h.hy), quiet: true, crit: base.crit, sid: base.sid });
      if (pierce-- <= 0) { ex = h.hx; ey = h.hy; break; }
    }
    C.beams.push({ x1: mz.x, y1: mz.y, x2: ex, y2: ey, col: s.beamColor || beamCol(s), w: 2, t: 0, life: 0.05 });
    if (Math.random() < 0.4) spark(ex, ey, s.beamColor || beamCol(s), 1);
  }
  function beamCol(s) { return s.fx.freeze ? '#9fd8ff' : s.fx.burn ? '#ff8a3c' : s.fx.acid ? '#b6ff3c' : s.fx.shock ? '#7fe9ff' : '#ff4a6a'; }
  function fireRail(w, mz, ang, base) {
    const s = w.s, x2 = mz.x + Math.cos(ang) * 800, y2 = mz.y + Math.sin(ang) * 800;
    const dmg = s.dmg * base.dmgMul;
    for (const h of rayHits(mz.x, mz.y, x2, y2)) {
      if (h.ep) { hitEproj(h.ep, dmg); continue; }
      const e = h.e;
      if (shieldBlocks(e, h.hy)) hitShield(e, dmg, h.hx, h.hy);
      applyHit(e, dmg, w, { x: h.hx, y: h.hy, head: isHead(e, h.hy), crit: base.crit, sid: base.sid });
    }
    C.beams.push({ x1: mz.x, y1: mz.y, x2, y2, col: '#bfe9ff', w: 4, t: 0, life: 0.28 });
    C.shake = Math.min(9, C.shake + 3);
  }
  function fireArc(w, mz, ang, base, tdist) {
    const s = w.s, c = Math.cos(ang), sn = Math.sin(ang);
    let best = null, bt = 1e9;
    for (const e of C.enemies) {
      if (e.dead || e.state === 'burrow') continue;
      const dx = e.x - mz.x, dy = e.y - e.h / 2 - mz.y, t = dx * c + dy * sn;
      if (t < 0 || t > 520) continue;
      const perp = Math.abs(-dx * sn + dy * c);
      if (perp < 14 + e.w / 2 && t < bt) { bt = t; best = e; }
    }
    if (best) {
      zap(mz.x, mz.y, best.x, best.y - best.h / 2);
      applyHit(best, s.dmg * s.pellets * base.dmgMul, w, { x: best.x, y: best.y - best.h / 2, crit: base.crit, sid: base.sid });
    } else { const d = Math.min(tdist, 260); zap(mz.x, mz.y, mz.x + c * d, mz.y + sn * d); }
  }
  function zap(x1, y1, x2, y2) { C.beams.push({ x1, y1, x2, y2, col: '#7fe9ff', w: 1, t: 0, life: 0.12, zig: true, seed: Math.random() * 100 }); }

  /* ───────── 피해 처리 ───────── */
  function applyHit(e, dmg, w, o) {
    if (e.dead) return;
    o = o || {};
    const s = w ? w.s : null;
    let mult = 1, crit = false, moon = false;
    const head = !!o.head;
    if (head) mult *= s ? s.head : 2;
    if (s && !o.aoe && !o.dot) {
      if (o.crit) { mult *= 2.5; crit = true; }
      else if (Math.random() * 100 < s.crit) { mult *= 2; crit = true; }
      if (s.sp.moon && Math.random() < s.sp.moon) { mult *= 5; moon = true; }
    }
    if (s && !o.raw) { // raw: 과잉 관통으로 넘어온 피해는 무기 쪽 배율을 다시 받지 않는다
      if (s.sp.salt && e.def.slime) mult *= 2;
      if (s.sp.tax && (e.elite || e.def.boss)) mult *= 1 + s.sp.tax;
      if (s.sp.overtime && C.remainFrac <= 0.3) mult *= 1 + s.sp.overtime;
      if (w.pred > 0 && s.sp.predator) mult *= 1 + s.sp.predator;
      if (w.buff > 0) mult *= 1.3;
      const role = (e.elite || e.def.boss || e.def.heavy) ? s.elite : s.swarm;
      if (role) mult *= Math.max(0.1, 1 + role / 100);
      if (!o.dot) {
        if (s.sp.opener && e.hp >= e.maxHp) mult *= 1 + s.sp.opener / 100;
        if (s.sp.execute && e.hp <= e.maxHp * 0.35) mult *= 1 + s.sp.execute / 100;
        if (s.sp.focus && !o.aoe) { if (w.focusT === e) w.focusN = Math.min(10, (w.focusN || 0) + 1); else { w.focusT = e; w.focusN = 0; } mult *= 1 + s.sp.focus * w.focusN / 100; }
        if (s.sp.momentum && w.momN > 0) mult *= 1 + s.sp.momentum * w.momN / 100;
      }
    }
    if (e.rad) mult *= 1 + 0.04 * e.rad;
    if (e.enrage) mult *= 1.5;
    if (e.frozen > 0) mult *= 1.3;
    if (e.weak) mult *= 2;
    let armor = e.armor || 0;
    if (armor > 0) {
      armor = armor * (1 - (s ? s.pen : 0) / 100) - 0.1 * (e.acid || 0);
      if (head) armor *= 0.5;
      mult *= 1 - U.clamp(armor, 0, 0.9);
    }
    let fin = dmg * mult;
    if (s && s.fx.sunder && !o.dot && !o.aoe) fin += (e.def.dummy ? 1500 : e.maxHp) * s.fx.sunder / 100 * (e.def.boss ? 0.2 : 1) * (s.sunderK || 1);
    e.hp -= fin; e.flash = 1;
    C.stat.dmg += fin; C.dps.push({ t: C.t, d: fin });
    if (!o.dot && !o.aoe) { if (o.sid && !C.hitSids.has(o.sid)) { C.hitSids.add(o.sid); C.stat.hits++; } if (head) C.stat.heads++; C.hitMark = 0.12; }
    if (e.healWin > 0) e.healDmg += fin;
    // 피해 숫자
    if (fin >= 1 || Math.random() < fin) {
      const big = head || crit || moon;
      const col = moon ? '#ff6fb5' : head ? '#ffd23c' : crit ? '#ff8a3c' : o.dot ? '#ffb38a' : armor > 0.3 ? '#9aa39a' : '#ffffff';
      if (!o.quiet || Math.random() < 0.25 || big) text(e.x + U.rand(-5, 5), e.y - e.h - 2, (moon ? '떡상! ' : '') + Math.max(1, Math.round(fin)) + (head ? '!' : ''), col, big ? 15 : 11, 0.7);
    }
    if (moon && s.sp.moonBoom) explosion(e.x, e.y - e.h / 2, 34, fin * 0.5, w, e);
    if (s && s.knock && !o.aoe && !o.dot) e.kb += s.knock * (e.def.heavy ? 0.12 : 1) * 0.45;
    if (!o.dot && !e.def.heavy && !e.def.dummy && !(e.stagCd > 0)) { e.stagger = Math.min(0.14, 0.03 + fin / e.maxHp * 0.25); e.stagCd = 0.35; } // 연사 무기가 적을 영구히 붙잡아 두지 않도록 재발동 대기
    if (s && !o.noFx && !o.dot) applyFx(e, w, fin, o);
    if (e.hp <= 0) kill(e, w, head);
    else if (!o.quiet && !o.dot) {
      if (head) snd('hit_head', { vol: 0.7 }); else if ((e.armor || 0) > 0.3) snd('hit_armor', { vol: 0.5 }); else snd('hit_flesh', { vol: 0.5 });
      if (C.parts.length < 500) burst(o.x || e.x, o.y || e.y - e.h / 2, e.def.blood, head ? 5 : 2, 70);
    }
  }
  const CAN_FX = ['burn', 'freeze', 'shock', 'explode', 'acid'];
  function applyFx(e, w, dmg, o) {
    const s = w.s, sp = s.sp;
    let burn = s.fx.burn, shock = s.fx.shock, acid = s.fx.acid, freeze = s.fx.freeze, explode = s.fx.explode, rad = s.fx.rad;
    if (s.proj === 'can') {
      const k = U.pick(CAN_FX);
      if (k === 'burn') burn = (burn || 0) + 9; else if (k === 'freeze') freeze = (freeze || 0) + 0.45;
      else if (k === 'shock') shock = (shock || 0) + 2; else if (k === 'explode') explode = (explode || 0) + 26; else acid = (acid || 0) + 2;
    }
    if (burn) { e.burn = Math.min(5, (e.burn || 0) + 1); e.burnDps = Math.max(e.burnDps || 0, burn); e.burnT = 3; e.dotW = w; }
    if (acid) { e.acid = Math.min(6, (e.acid || 0) + acid); e.acidT = 5; e.dotW = w; }
    if (rad) { e.rad = Math.min(10, (e.rad || 0) + rad); e.radT = 6; }
    if (freeze) {
      if (e.def.boss) e.chill = Math.min(0.5, (e.chill || 0) + freeze * 0.2);
      else {
        e.chill = (e.chill || 0) + freeze * (e.def.heavy ? 0.5 : 1);
        if (e.chill >= 1 && !(e.frozen > 0)) { e.frozen = 1.7; e.chill = 0; snd('freeze', { vol: 0.6 }); }
      }
    }
    if (sp.mint && !e.minted && !e.def.boss) {
      e.minted = true;
      if (Math.random() < 0.5) { e.frozen = 2.4; text(e.x, e.y - e.h - 10, '민초 최고!', '#7fe9c0', 12, 1); snd('freeze', { vol: 0.5 }); }
      else { e.enrage = true; text(e.x, e.y - e.h - 10, '민초 극혐!!', '#ff5050', 12, 1); }
    }
    if (sp.fear && !e.def.boss && Math.random() < sp.fear) { e.flee = 2.2; text(e.x, e.y - e.h - 10, '줄행랑!', '#ffd76a', 12, 1); }
    if (sp.screech && Math.random() < sp.screech) {
      snd('recorder_squeak'); C.rings.push({ x: e.x, y: e.y - e.h / 2, r: 4, max: 70, col: '#ff6fb5', t: 0 });
      for (const o2 of C.enemies) if (!o2.dead && !o2.def.boss && Math.hypot(o2.x - e.x, o2.y - e.y) < 70) o2.stun = 1.2;
      text(e.x, e.y - e.h - 12, '삑—!', '#ff6fb5', 14, 0.9);
    }
    if (sp.duck && Math.random() < sp.duck) C.ducks.push({ x: e.x, y: -40, ty: e.y, w, t: 0 });
    if (shock && !o.chained) chain(e, dmg * 0.5, Math.round(shock), w);
    if (explode && !o.exploded) explosion(o.x || e.x, o.y || e.y - e.h / 2, explode, dmg * 0.6, w, e);
  }
  function chain(src, dmg, n, w) {
    const list = [];
    for (const e of C.enemies) {
      if (e === src || e.dead || e.state === 'burrow') continue;
      const d = Math.hypot(e.x - src.x, (e.y - e.h / 2) - (src.y - src.h / 2));
      if (d < 85) list.push({ e, d });
    }
    list.sort((a, b) => a.d - b.d);
    let px = src.x, py = src.y - src.h / 2;
    for (let i = 0; i < Math.min(n, list.length); i++) {
      const e = list[i].e;
      zap(px, py, e.x, e.y - e.h / 2);
      if (!e.def.boss) e.stun = Math.max(e.stun || 0, 0.25);
      e.shocked = 0.3;
      applyHit(e, dmg, w, { aoe: true, noFx: true, quiet: true });
      px = e.x; py = e.y - e.h / 2;
    }
    if (list.length) snd('shock', { vol: 0.35 });
  }
  function explosion(x, y, r, dmg, w, exclude, o) {
    o = o || {};
    C.rings.push({ x, y, r: 3, max: r, col: o.col || '#ffd23c', t: 0, fill: true });
    burst(x, y, '#ffb347', Math.min(18, 4 + r / 4), 60 + r * 2);
    burst(x, y, '#5a5a5a', Math.min(8, 2 + r / 8), 40 + r);
    C.shake = Math.min(10, C.shake + r / 14);
    snd(r >= 55 ? 'explode_big' : r >= 26 ? 'explode' : 'pop', { vol: U.clamp(r / 50, 0.35, 1), pan: U.clamp((x - 320) / 320, -1, 1) });
    for (const e of C.enemies.slice()) {
      if (e === exclude || e.dead || e.state === 'burrow') continue;
      const cx = U.clamp(x, e.x - e.w / 2, e.x + e.w / 2), cy = U.clamp(y, e.y - e.h, e.y);
      const d = Math.hypot(cx - x, cy - y);
      if (d <= r) {
        e.kb += (e.def.heavy ? 4 : 30) * (1 - d / r);
        applyHit(e, dmg * (1 - 0.5 * d / r), w, o.full ? { exploded: true, x: e.x, y: e.y - e.h / 2, aoe: false, quiet: true, sid: o.sid } : { aoe: true, noFx: true, quiet: true });
      }
    }
    for (const p of C.eprojs) if (p.hp && Math.hypot(p.x - x, p.y - y) < r + 6) hitEproj(p, dmg);
  }
  function hitEproj(p, dmg) {
    p.hp -= dmg;
    if (p.hp <= 0 && !p.dead) { p.dead = true; text(p.x, p.y - 6, '격추!', '#ffd76a', 12); burst(p.x, p.y, '#cfd6da', 6, 80); snd('hit_armor'); }
  }

  function kill(e, w, head) {
    if (e.dead) return;
    e.dead = true; e.state = 'dying'; e.die = 0;
    if (e.def.dummy) { e.dead = false; e.state = 'walk'; e.hp = e.maxHp; return; }
    const st = C.stat, s = w ? w.s : null, day = cfg.day;
    st.kills++; st.combo++; st.comboT = 2.6; st.maxCombo = Math.max(st.maxCombo, st.combo);
    if (w) w.kills = (w.kills || 0) + 1;
    if (s && s.sp.momentum) { w.momN = Math.min(5, (w.momN || 0) + 1); w.momT = 3; }
    if (s && s.sp.overkill && e.hp < 0 && C.okDepth < 6) {
      const carry = Math.min(-e.hp, e.maxHp * 2); let tgt = null, bd = 75;
      for (const o2 of C.enemies) { if (o2.dead || o2 === e || o2.state === 'burrow') continue; const d2 = Math.hypot(o2.x - e.x, o2.y - e.y); if (d2 < bd) { bd = d2; tgt = o2; } }
      if (tgt && carry > 1) { C.okDepth++; C.beams.push({ x1: e.x, y1: e.y - e.h / 2, x2: tgt.x, y2: tgt.y - tgt.h / 2, col: '#ffd76a', w: 1, t: 0, life: 0.1 }); applyHit(tgt, carry, w, { aoe: true, noFx: true, quiet: true, raw: true }); C.okDepth--; }
    }
    C.killMark = 0.18;
    for (const [n, msg] of COMBO_SHOUTS) if (st.combo === n) { banner(msg, `${n} 연속 처치`); snd('combo', { pitch: 1 + n / 60 }); }
    const lootM = 1 + (s ? s.loot : 0) / 100;
    const baseNuts = e.def.boss ? 150 + day * 20 : e.def.courier ? 15 + day * 2 : e.def.cost * (e.elite ? 3 : 1) * (e.mini ? 0.3 : 1) * Waves.nutRate(day);
    let nuts = baseNuts * (1 + 0.05 * (cfg.heat || 0)) * lootM * (1 + Math.min(st.combo, 30) * 0.01) * (1 + (s && s.fx.gold ? s.fx.gold / 100 : 0));
    st.nuts += nuts;
    if (nuts >= 3 || Math.random() < nuts / 3) { text(e.x, e.y - e.h - 12, '+' + Math.max(1, Math.round(nuts)) + '🔩', '#ffd76a', 11, 0.9); if (Math.random() < 0.3) snd('coin', { vol: 0.3 }); }
    const mat = (k, n) => { st.mats[k] = (st.mats[k] || 0) + n; };
    if (e.def.boss) { mat('core', 1); mat('scrap', 30 + day); mat('powder', 15); mat('circuit', 8 + Math.floor(day / 3)); mat('goo', 10); }
    else if (!e.mini) {
      const m = lootM * (e.elite ? 3 : 1);
      if (Math.random() < 0.22 * m) mat('scrap', U.randi(1, 2));
      if (Math.random() < 0.1 * m) mat('powder', 1);
      if (e.elite) mat('powder', 2);
      if (day >= 6 && Math.random() < 0.045 * m) mat('circuit', 1);
      if (Math.random() < (e.def.slime || e.def.boom ? 0.45 : 0.1) * m) mat('goo', 1);
      if (s && s.sp.scrapper && Math.random() < s.sp.scrapper) mat('scrap', 1);
    }
    if (e.def.courier) { st.parcels++; text(e.x, e.y - e.h - 20, '📦 택배 획득!', '#ffb347', 15, 1.4); snd('pickup'); }
    if (s) {
      let heal = s.fx.leech || 0;
      if (s.sp.feast && Math.random() < s.sp.feast) heal += 3;
      if (s.sp.coupon) { w.coupon++; if (w.coupon >= s.sp.coupon) { w.coupon = 0; heal += 6; text(PX + 20, PY - 40, '🍗 한 마리 서비스!', '#ffb347', 13, 1.2); } }
      if (heal > 0 && C.gateHp < C.gateMax) C.gateHp = Math.min(C.gateMax, C.gateHp + heal);
      if (s.sp.predator) w.pred = 3;
      if (s.sp.popcorn && Math.random() < s.sp.popcorn) C.timers.push({ t: 0.08, fn: () => explosion(e.x, e.y - e.h / 2, 26, e.maxHp * 0.5 + s.dmg, w, e, { col: '#fff3c0' }) });
      if (s.sp.plague) {
        let n = 0;
        for (const o of C.enemies) { if (n >= 2) break; if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 95) { o.rad = Math.min(10, (o.rad || 0) + 3); o.radT = 6; o.acid = Math.min(6, (o.acid || 0) + 2); o.acidT = 5; o.dotW = w; n++; } }
      }
      if (s.ramp) { snd('microwave_ding', { vol: 0.7 }); text(e.x, e.y - e.h - 22, '띵!', '#ffb347', 14, 0.8); }
    }
    if (e.def.boom) {
      const bx = e.x, by = e.y - e.h / 2;
      C.timers.push({ t: 0.22, fn: () => {
        explosion(bx, by, e.def.boom.r, e.maxHp * 0.7, null, e, { col: '#d9e04a' });
        if (bx < GATE_X + 60 && !C.bossDown) gateDamage(e.def.boom.gate * Waves.dmgMul(day) * cfg.diff.dmg);
      } });
    }
    if (e.def.split && !e.mini) for (let i = 0; i < e.def.split; i++) spawnEnemy(e.type, { x: e.x + (i ? 9 : -9), y: U.clamp(e.y + (i ? 5 : -5), LANE_MIN, LANE_MAX), mini: true });
    burst(e.x, e.y - e.h / 2, e.def.blood, e.def.boss ? 40 : head ? 12 : 8, e.def.boss ? 200 : 110);
    if (head) { snd('hit_head'); snd('kill', { vol: 0.6 }); } else snd(e.w > 22 ? 'splat' : 'kill', { vol: 0.7, pitch: U.rand(0.85, 1.2) });
    if (e.def.boss) {
      C.boss = null; C.bossDown = true; C.slow = 1.6; C.shake = 12; snd('explode_big'); snd('boss_roar', { pitch: 0.7 });
      banner(e.def.name + ' 격파!', '대피소 404 는 오늘도 찾을 수 없습니다');
      for (let i = 0; i < 5; i++) C.timers.push({ t: 0.15 + i * 0.22, fn: () => explosion(e.x + U.rand(-e.w / 2, e.w / 2), e.y - U.rand(0, e.h), 40, 0, null, null) });
      for (const o of C.enemies) if (!o.dead && !o.def.boss) C.timers.push({ t: U.rand(0.3, 1.2), fn: () => { if (!o.dead) { o.hp = 0; kill(o, null, false); } } });
      C.spawns.length = C.si;
    }
  }

  /* ───────── 적 ───────── */
  function spawnEnemy(type, o) {
    o = o || {};
    const def = ENEMIES[type], day = cfg.day || 1;
    const sc = (o.elite ? 1.25 : 1) * (o.mini ? 0.6 : 1);
    let hp = def.hp * (def.boss ? cfg.diff.hp * Waves.bossScale(day) : def.dummy ? 1 : Waves.hpMul(day) * cfg.diff.hp);
    if (o.elite) hp *= 3;
    if (o.mini) hp *= 0.35;
    if (cfg.night && cfg.night.blood) hp *= 1.15;
    if (cfg.heat && !def.dummy) hp *= 1 + 0.04 * cfg.heat;
    if (cfg.night && THEMES[cfg.night.theme] && THEMES[cfg.night.theme].flood && !def.boss && !def.dummy) hp *= 0.6;
    const e = {
      def, type, x: o.x != null ? o.x : W + 16 + U.rand(0, 40), y: o.y != null ? o.y : U.rand(LANE_MIN, LANE_MAX),
      w: def.w * sc, h: def.h * sc, hp, maxHp: hp, spd: def.spd * U.rand(0.9, 1.12) * (o.mini ? 1.3 : 1), armor: def.armor || 0,
      shieldHp: def.shield ? def.shield * Waves.hpMul(day) * cfg.diff.hp : 0, shieldMax: 1, state: 'walk', walk: U.rand(0, 6), atk: 0, atkT: 0, flash: 0, die: 0,
      elite: !!o.elite, mini: !!o.mini, seed: Math.random(), kb: 0, fx: {}, t: 0, dotAcc: 0, dotT: 0, cd: U.rand(0.5, 2), phase: 1, weak: false, hpFrac: 1, shield: 1,
    };
    e.shieldMax = e.shieldHp || 1;
    e.stopX = GATE_X + 4 + U.rand(0, 20) + e.w / 2;
    if (def.fly) { e.y = U.rand(80, 175); e.baseY = e.y; e.state = 'fly'; e.hoverX = U.rand(100, 170); }
    if (def.burrow) { e.state = 'burrow'; e.emergeX = U.rand(185, 275); }
    if (def.ranged && !def.fly) e.stopX = GATE_X + def.ranged.range * U.rand(0.75, 1);
    if (def.aura) e.stopX = U.rand(240, 330);
    if (def.boss) {
      e.x = W + def.w / 2 + 10; e.y = 322; e.stopX = GATE_X + def.w / 2 + 4;
      e.ab = def.abilities.map(a => ({ a, t: a.every ? a.every * 0.6 : 0 }));
      C.boss = e;
      snd('boss_roar'); C.shake = 8;
      banner(def.name, def.title);
    }
    if (cfg.seen && !cfg.seen[type] && !def.dummy && !def.boss) { cfg.seen[type] = 1; if (cfg.day > 1 || type !== 'shambler') banner('새로운 적: ' + def.name, def.desc); }
    else if (cfg.seen && def.boss) cfg.seen[type] = 1;
    C.enemies.push(e);
    return e;
  }

  function gateDamage(d, e) {
    if (cfg.mode === 'range' || C.ended || C.bossDown) return;
    C.gateHp -= d; C.gateFlash = 1; C.shake = Math.min(8, C.shake + 1.5 + d * 0.05);
    snd('gate_hit', { vol: U.clamp(0.4 + d / 40, 0.4, 1), pan: -0.6 });
    spark(GATE_X + 2, e ? U.clamp(e.y - e.h / 2, 240, 330) : 290, '#ffb347', 3);
    if (C.gateHp <= 0) { C.gateHp = 0; lose(); }
  }

  function updEnemy(e, dt, auras) {
    e.t += dt; e.flash = Math.max(0, e.flash - dt * 6);
    if (e.dead) { e.die += dt * 2.4; return; }
    const def = e.def, day = cfg.day || 1;
    // 지속 피해
    if (e.burn > 0) { e.burnT -= dt; e.dotAcc += e.burn * e.burnDps * dt; if (e.burnT <= 0) e.burn = 0; }
    if (e.acid > 0) { e.acidT -= dt; e.dotAcc += e.acid * (2 + day * 0.25) * dt; if (e.acidT <= 0) e.acid = 0; }
    if (e.radT > 0) { e.radT -= dt; if (e.radT <= 0) e.rad = 0; }
    if (e.heatT > 0) e.heatT -= dt; else if (e.heat > 0) e.heat = Math.max(0, e.heat - dt * 0.5);
    if (e.shocked > 0) e.shocked -= dt;
    if (e.stagCd > 0) e.stagCd -= dt;
    const ground = !def.fly && e.state !== 'burrow';
    if (ground && cfg.up.wire && e.x < 205) e.dotAcc += (3 * cfg.up.wire + day * 0.7) * dt;
    if (C.thorns && e.state === 'attack' && !def.ranged && !def.aura) e.dotAcc += C.thorns * (1 + day * 0.04) * dt;
    if (e.dotAcc > 0) {
      e.dotT += dt;
      if (e.dotT >= 0.4) { const d = e.dotAcc; e.dotAcc = 0; e.dotT = 0; applyHit(e, d, e.dotW || null, { dot: true }); if (e.dead) return; }
    }
    const fx = e.fx;
    fx.burn = e.burn > 0; fx.freeze = e.frozen > 0 ? 1 : (e.chill || 0); fx.shock = e.shocked > 0; fx.acid = e.acid > 0; fx.mark = e.rad > 0; fx.enrage = !!e.enrage;
    e.hpFrac = Math.max(0, e.hp / e.maxHp); e.shield = Math.max(0, e.shieldHp / e.shieldMax);
    if (e.frozen > 0) { e.frozen -= dt; if (e.frozen <= 0 && Math.random() < 0.5) snd('shatter', { vol: 0.3 }); return; }
    if (e.chill > 0) e.chill = Math.max(0, e.chill - dt * 0.12);
    if (e.stun > 0) { e.stun -= dt; return; }
    if (def.dummy) { e.kb = 0; e.stagger = 0; return; }
    if (e.stagger > 0) { e.stagger -= dt; if (e.kb > 0.5) { e.x += e.kb * KB_SCALE * dt * 7; e.kb *= Math.max(0, 1 - dt * 7); } return; }
    if (e.kb > 0.5) { e.x += e.kb * KB_SCALE * dt * 7; e.kb *= Math.max(0, 1 - dt * 7); }
    if (def.dummy) return;
    let v = e.spd * (1 - 0.6 * Math.min(1, e.chill || 0));
    if (e.enrage) v *= 1.35;
    if (e.elite) v *= 1.1;
    if (!def.aura) {
      let buffed = false;
      for (const a of auras) if (Math.abs(a.x - e.x) < a.def.aura.r && Math.abs(a.y - e.y) < 90) {
        if (a.def.aura.spd > 1 && !buffed) { v *= a.def.aura.spd; e.fx.enrage = true; buffed = true; }
        if (a.def.heal && e.hp < e.maxHp && !def.boss) { e.hp = Math.min(e.maxHp, e.hp + e.maxHp * a.def.heal * dt); e.healed = 0.3; }
      }
    }
    if (e.healed > 0) { e.healed -= dt; if (Math.random() < dt * 6 && C.parts.length < 500) C.parts.push({ x: e.x + U.rand(-5, 5), y: e.y - e.h, vx: 0, vy: -24, g: 0, life: 0.5, t: 0, col: '#8effa0', sz: 2 }); }
    if (ground && cfg.up.wire && e.x < 205) v *= 1 - [0, 0.25, 0.35, 0.45][cfg.up.wire];
    if (e.flee > 0) { e.flee -= dt; e.x += v * 1.5 * dt; e.walk += v * dt * 0.3; e.state = 'flee'; if (e.flee <= 0) e.state = def.fly ? 'fly' : 'walk'; return; }
    const dm = Waves.dmgMul(day) * cfg.diff.dmg * (e.elite ? 1.5 : 1);

    if (def.boss) return updBoss(e, dt, v, dm);
    if (def.fly) {
      e.walk += dt * 14;
      e.y = e.baseY + Math.sin(e.t * 2 + e.seed * 6) * 8;
      if (e.x > e.hoverX) e.x -= v * dt;
      else {
        e.x += Math.sin(e.t * 1.3 + e.seed * 9) * 12 * dt;
        e.cd -= dt;
        if (e.cd <= 0) { e.cd = def.ranged.cd * U.rand(0.8, 1.2); enemyShot(e, def.ranged, dm, e.x, e.y, U.rand(96, 120), 236); snd('squeak', { vol: 0.25, pan: -0.6 }); }
      }
      return;
    }
    if (e.state === 'burrow') {
      e.x -= v * dt; e.walk += dt * 10;
      if (Math.random() < dt * 14 && C.parts.length < 500) C.parts.push({ x: e.x + U.rand(-6, 6), y: e.y - 2, vx: U.rand(-20, 20), vy: U.rand(-60, -20), g: 300, life: 0.4, t: 0, col: '#7a5a3a', sz: 2 });
      if (e.x <= e.emergeX) { e.state = 'walk'; burst(e.x, e.y - 4, '#7a5a3a', 14, 120); snd('thunder', { vol: 0.3 }); e.stun = 0.35; text(e.x, e.y - e.h - 6, '쑥!', '#d9c07a', 12); }
      return;
    }
    if (e.x > e.stopX) {
      e.x -= v * dt; e.walk += v * dt * 0.28; e.state = 'walk'; e.atk = 0;
      if (def.courier && C.parts.length < 500 && Math.random() < dt * 20) C.parts.push({ x: e.x + 8, y: e.y - 2, vx: 30, vy: -20, g: 100, life: 0.3, t: 0, col: '#b8a888', sz: 2 });
      return;
    }
    if (def.courier) { text(e.x, e.y - e.h - 6, '"부재중이시네요~" 📝', '#cfd6da', 12, 1.6); e.dead = true; e.die = 1; snd('sad_trombone', { vol: 0.4 }); return; }
    if (def.boom) { e.hp = 0; kill(e, null, false); return; }
    e.state = 'attack';
    if (def.aura) { e.atkT += dt; e.atk = (e.atkT % 1.2) / 1.2; return; }
    e.atkT += dt;
    if (def.ranged) {
      e.atk = Math.min(1, e.atkT / def.ranged.cd);
      if (e.atkT >= def.ranged.cd) { e.atkT = 0; enemyShot(e, def.ranged, dm, e.x - 6, e.y - e.h * 0.8, GATE_X - 4, U.rand(245, 300)); snd('spit', { vol: 0.4 }); }
      return;
    }
    e.atk = Math.min(1, e.atkT / def.atk);
    if (e.atkT >= def.atk) { e.atkT = 0; gateDamage(def.dmg * dm, e); }
  }
  function enemyShot(e, r, dm, x, y, tx, ty, o) {
    o = o || {};
    const d = Math.hypot(tx - x, ty - y);
    C.eprojs.push({ kind: r.kind, x, y, sx: x, sy: y, tx, ty, t: 0, T: o.T || Math.max(0.5, d / (r.kind === 'poop' ? 160 : 190)), arc: r.kind === 'poop' ? 0 : d * 0.22, dmg: r.dmg * dm, hp: o.hp || 0, rot: 0 });
  }
  function updBoss(e, dt, v, dm) {
    const def = e.def, hpF = e.hp / e.maxHp;
    if (e.phase >= 2 && e.type === 'boss_roach') v *= 2.2;
    if (e.phase >= 3 && e.type === 'boss_redev') v *= 1.7;
    if (e.healWin > 0) {
      e.healWin -= dt; e.atk = 0; e.state = 'stun';
      if (e.healDmg >= e.healNeed) { e.healWin = 0; e.weak = false; e.stun = 2.6; text(e.x, e.y - e.h - 10, '사레들렸다!!', '#ffd23c', 18, 1.6); snd('bonk'); banner('프로틴 차단 성공!', '2.6초간 기절'); }
      else if (e.healWin <= 0) { e.weak = false; const h = e.maxHp * e.healPct; e.hp = Math.min(e.maxHp, e.hp + h); text(e.x, e.y - e.h - 10, '+' + Math.round(h) + ' 근성장', '#8effa0', 16, 1.4); snd('heal'); }
      return;
    }
    for (const ab of e.ab) {
      const a = ab.a;
      if (a.type === 'phase') { for (let i = 0; i < a.at.length; i++) if (hpF <= a.at[i] && e.phase < i + 2) { e.phase = i + 2; snd('boss_roar', { pitch: 1.2 }); C.shake = 8; banner(def.name + (e.type === 'boss_roach' ? '이(가) 날기 시작했다!!' : ' 격분!'), e.type === 'boss_roach' ? '으아아아아악' : `${e.phase}페이즈`); } continue; }
      ab.t -= dt * (e.phase >= 2 ? 1.35 : 1);
      if (ab.t > 0) continue;
      ab.t = a.every;
      if (a.type === 'summon') {
        for (const [t, n] of a.list) if (ENEMIES[t]) for (let i = 0; i < n; i++) spawnEnemy(t, { x: e.x + U.rand(-10, 30) + (ENEMIES[t].group ? 0 : 30), y: U.rand(LANE_MIN, LANE_MAX) });
        snd('growl2');
      } else if (a.type === 'throw') {
        for (let i = 0; i < (a.n || 1); i++) C.timers.push({ t: i * 0.25, fn: () => { if (!e.dead) enemyShot(e, a, dm, e.x - e.w * 0.3, e.y - e.h * 0.8, GATE_X - 6, U.rand(215, 300), { hp: a.hp * Waves.hpMul(cfg.day) * 0.5, T: U.clamp((e.x - GATE_X) / 150, 1.1, 2.6) }); } });
        snd('whoosh');
      } else if (a.type === 'heal') {
        e.healWin = a.dur; e.healDmg = 0; e.healNeed = e.maxHp * a.need; e.healPct = a.pct; e.weak = true;
        banner('프로틴 타임!', '빛나는 쉐이커를 집중 사격해 회복을 끊어라');
        snd('alarm');
      }
    }
    if (e.x > e.stopX) { e.x -= v * dt; e.walk += v * dt * 0.2; e.state = 'walk'; e.atk = 0; e.stompT = (e.stompT || 0) + dt; if (e.stompT > 0.9) { e.stompT = 0; snd('boss_stomp', { vol: 0.5 }); C.shake = Math.min(6, C.shake + 1.2); } return; }
    e.state = 'attack'; e.atkT += dt * (e.phase >= 2 ? 1.3 : 1);
    e.atk = Math.min(1, e.atkT / def.atk);
    if (e.atkT >= def.atk) { e.atkT = 0; gateDamage(def.dmg * dm, e); C.shake = 9; snd('boss_stomp'); }
  }

  /* ───────── 투사체 ───────── */
  function updProj(p, dt) {
    const s = p.w.s;
    p.age += dt;
    if (p.kind === 'lob' || p.kind === 'orb') {
      p.t += dt;
      const k = Math.min(1, p.t / p.T);
      p.x = U.lerp(p.sx, p.tx, k); p.y = U.lerp(p.sy, p.ty, k) - (p.kind === 'lob' ? Math.sin(k * Math.PI) * Math.min(90, p.T * 110) : 0);
      p.rot += dt * 9;
      if (k >= 1) {
        p.dead = true;
        if (p.kind === 'orb') { C.holes.push({ x: p.tx, y: p.ty, t: 0, w: p.w, dmg: p.dmg, tick: 0, sid: p.sid }); snd('blackhole'); }
        else {
          explosion(p.tx, p.ty, s.fx.explode || 30, p.dmg, p.w, null, { full: true, col: s.fx.acid ? '#b6ff3c' : '#ffd23c', sid: p.sid });
          if (s.pool) C.pools.push({ x: p.tx, y: Math.max(p.ty, LANE_MIN), r: (s.fx.explode || 40) * 0.9, t: s.pool, w: p.w, dps: p.dmg * 0.25 });
        }
      }
      return;
    }
    if (p.kind === 'wave') {
      p.rad += s.vel * dt;
      for (const e of C.enemies.slice()) {
        if (e.dead || p.hit.has(e) || e.state === 'burrow') continue;
        const dx = e.x - p.ox, dy = e.y - e.h / 2 - p.oy, d = Math.hypot(dx, dy);
        if (Math.abs(d - p.rad) > 14 + e.w / 2) continue;
        let da = Math.atan2(dy, dx) - p.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.abs(da) > 0.36) continue;
        p.hit.add(e); applyHit(e, p.dmg, p.w, { x: e.x, y: e.y - e.h / 2, sid: p.sid });
      }
      if (p.rad > p.range) p.dead = true;
      return;
    }
    if (p.kind === 'flame') {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 30 * dt; p.r += dt * 26;
      for (const e of C.enemies.slice()) {
        if (e.dead || p.hit.has(e) || e.state === 'burrow') continue;
        if (p.x + p.r > e.x - e.w / 2 && p.x - p.r < e.x + e.w / 2 && p.y + p.r > e.y - e.h && p.y - p.r < e.y) { p.hit.add(e); applyHit(e, p.dmg, p.w, { x: p.x, y: p.y, quiet: true, sid: p.sid }); }
      }
      if (p.age > p.life) p.dead = true;
      return;
    }
    if (p.kind === 'saw' && p.phase === 1) {
      p.x += p.vx * dt; p.rot += dt * 30;
      if (Math.random() < dt * 30) spark(p.x, p.y, '#ffd23c', 1);
      for (const e of C.enemies.slice()) {
        if (e.dead || p.hit.has(e) || e.state === 'burrow' || e.def.fly) continue;
        if (Math.abs(e.x - p.x) < e.w / 2 + 5 && Math.abs(e.y - p.y) < 16) {
          p.hit.add(e); applyHit(e, p.dmg, p.w, { x: p.x, y: e.y - e.h * 0.3, sid: p.sid });
          if (--p.pierce < 0) { p.dead = true; break; }
        }
      }
      if (p.x > W + 20 || p.age > 5) p.dead = true;
      return;
    }
    // 일반 탄
    if (s.fx.homing) {
      let best = null, bd = 240;
      const sp = Math.hypot(p.vx, p.vy), ux = p.vx / sp, uy = p.vy / sp;
      for (const e of C.enemies) {
        if (e.dead || e.state === 'burrow' || (p.hit && p.hit.has(e))) continue;
        const dx = e.x - p.x, dy = e.y - e.h * 0.6 - p.y, d = Math.hypot(dx, dy);
        if (d < bd && (dx * ux + dy * uy) / d > 0.5) { bd = d; best = e; }
      }
      if (best) {
        const want = Math.atan2(best.y - best.h * 0.6 - p.y, best.x - p.x), cur = Math.atan2(p.vy, p.vx);
        let da = want - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        const na = cur + U.clamp(da, -s.fx.homing * 5 * dt, s.fx.homing * 5 * dt);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp; p.maxDist = 0;
      }
    }
    p.px = p.x; p.py = p.y;
    let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
    let step = Math.hypot(nx - p.x, ny - p.y), ended = false;
    if (p.maxDist && p.dist + step >= p.maxDist) { const k = Math.max(0, (p.maxDist - p.dist) / step); nx = p.x + (nx - p.x) * k; ny = p.y + (ny - p.y) * k; ended = true; }
    for (let iter = 0; iter < 4; iter++) {
      let best = null, bt = 2, bep = null;
      for (const e of C.enemies) {
        if (e.dead || e.state === 'burrow' || (p.hit && p.hit.has(e))) continue;
        const t = U.segRect(p.x, p.y, nx, ny, e.x - e.w / 2, e.y - e.h, e.w, e.h);
        if (t >= 0 && t < bt) { bt = t; best = e; bep = null; }
      }
      for (const ep of C.eprojs) {
        if (!ep.hp || ep.dead) continue;
        const t = U.segRect(p.x, p.y, nx, ny, ep.x - 8, ep.y - 8, 16, 16);
        if (t >= 0 && t < bt) { bt = t; bep = ep; best = null; }
      }
      if (bep) { hitEproj(bep, p.dmg); p.dead = true; return; }
      if (!best) break;
      const hx = p.x + (nx - p.x) * bt, hy = p.y + (ny - p.y) * bt, e = best;
      if (!p.hit) p.hit = new Set();
      p.hit.add(e);
      let dmg = p.dmg, through = false;
      if (shieldBlocks(e, hy)) {
        hitShield(e, dmg, hx, hy);
        if (p.pierce > 0) { p.pierce--; dmg *= 0.5; through = true; } else { p.dead = true; p.x = hx; p.y = hy; return; }
      }
      applyHit(e, dmg, p.w, { x: hx, y: hy, head: isHead(e, hy), crit: p.crit, sid: p.sid });
      if (p.kind === 'saw') { if (--p.pierce < 0) { p.dead = true; return; } continue; }
      if (!through && p.pierce > 0) { p.pierce--; p.dmg *= 0.85; continue; }
      if (through) continue;
      if (p.bounce > 0) {
        let tgt = null, bd = 170;
        for (const o of C.enemies) { if (o.dead || o.state === 'burrow' || p.hit.has(o)) continue; const d = Math.hypot(o.x - hx, o.y - o.h / 2 - hy); if (d < bd) { bd = d; tgt = o; } }
        p.bounce--; p.dmg *= 0.8; p.maxDist = 0;
        const sp = Math.hypot(p.vx, p.vy);
        const a = tgt ? Math.atan2(tgt.y - tgt.h / 2 - hy, tgt.x - hx) : Math.atan2(-Math.abs(p.vy) - 60, p.vx * U.rand(-0.5, 1));
        p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; p.x = hx; p.y = hy; p.px = hx; p.py = hy;
        snd('bonk', { vol: 0.2, pitch: 1.6 });
        return;
      }
      p.dead = true; p.x = hx; p.y = hy;
      return;
    }
    p.x = nx; p.y = ny; p.dist += step; p.rot += dt * 12;
    if (!ended && p.vy > 0 && p.y > LANE_MAX + 14) ended = true; // 조준선 너머로 날아가다 화면 아래 땅에 박힘
    if (ended) {
      if (p.kind === 'saw') { p.phase = 1; p.vx = Math.max(160, Math.abs(s.vel) * 0.7); p.vy = 0; p.hit = new Set(); p.y = Math.max(p.y, LANE_MIN - 4); p.age = 0; return; }
      p.dead = true;
      if (s.fx.explode) explosion(p.x, p.y, s.fx.explode, p.dmg * 0.6, p.w, null);
      else if (C.parts.length < 500) C.parts.push({ x: p.x, y: p.y, vx: U.rand(-20, 20), vy: U.rand(-50, -20), g: 200, life: 0.3, t: 0, col: '#8a7a5a', sz: 2 });
      return;
    }
    if (p.x > W + 30 || p.x < -30 || p.y < -40 || p.y > H + 20 || p.age > p.life) p.dead = true;
  }

  /* ───────── 파티클 ───────── */
  function burst(x, y, col, n, spd) {
    for (let i = 0; i < n && C.parts.length < 600; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * spd;
      C.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.3, g: 320, life: U.rand(0.25, 0.6), t: 0, col, sz: U.rand(1, 3) });
    }
  }
  function spark(x, y, col, n) { for (let i = 0; i < n && C.parts.length < 600; i++) C.parts.push({ x, y, vx: U.rand(-70, 70), vy: U.rand(-90, 10), g: 250, life: U.rand(0.1, 0.3), t: 0, col, sz: 1 }); }

  /* ───────── 메인 루프 ───────── */
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    let dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) {
      if (C.slow > 0) { C.slow -= dt; dt *= 0.35; }
      try { update(dt); } catch (err) { console.error('[combat update]', err); }
    }
    try { render(); } catch (err) { console.error('[combat render]', err); }
    mouse.pressed = false;
  }

  function update(dt) {
    C.t += dt;
    const st = C.stat;
    for (let i = C.timers.length - 1; i >= 0; i--) { const tm = C.timers[i]; tm.t -= dt; if (tm.t <= 0) { C.timers.splice(i, 1); tm.fn(); } }
    // 스폰
    if (!C.ended) while (C.si < C.spawns.length && C.spawns[C.si].t <= C.t) { const sp = C.spawns[C.si++]; spawnEnemy(sp.type, { elite: sp.elite }); if (Math.random() < 0.15) snd(U.pick(['growl1', 'growl2', 'growl3']), { vol: 0.3, pan: 0.7 }); }
    // 플레이어 무기
    C.aim = U.clamp(Math.atan2(mouse.y - PIVY, mouse.x - PIVX), -1.3, 1.4);
    if (C.swapT > 0) C.swapT -= dt;
    if (C.grenT > 0) C.grenT -= dt;
    const can = !C.ended && C.swapT <= 0;
    for (let i = 0; i < C.weapons.length; i++) {
      const w = C.weapons[i], active = i === C.cur;
      updWeapon(w, dt, { trigger: active && can && mouse.down, pressed: active && can && mouse.pressed, px: PIVX, py: PIVY, ang: C.aim, tx: mouse.x, ty: mouse.y });
    }
    // 포탑
    for (const tu of C.turrets) {
      let tgt = null, bx = 1e9;
      for (const e of C.enemies) { if (e.dead || e.state === 'burrow' || e.def.dummy && cfg.mode !== 'range') continue; if (e.x < 630 && e.x < bx) { bx = e.x; tgt = e; } }
      const px = tu.x, py = tu.y - 14;
      if (tgt) {
        const ty = tgt.y - tgt.h * (tgt.def.noHead ? 0.5 : 0.6);
        const want = Math.atan2(ty - py, tgt.x - px);
        tu.aim += U.clamp(want - tu.aim, -dt * 6, dt * 6);
        updWeapon(tu.w, dt, { trigger: !C.ended && Math.abs(want - tu.aim) < 0.12, pressed: false, px, py, ang: tu.aim, tx: tgt.x, ty, turret: true, rate: cfg.turretRate });
      } else updWeapon(tu.w, dt, { trigger: false, pressed: false, px, py, ang: tu.aim, tx: 400, ty: 300, turret: true, rate: cfg.turretRate });
    }
    // 적
    const auras = C.enemies.filter(e => !e.dead && e.def.aura);
    for (const e of C.enemies.slice()) updEnemy(e, dt, auras);
    C.enemies = C.enemies.filter(e => !(e.dead && e.die >= 1));
    // 투사체
    for (const p of C.projs) updProj(p, dt);
    C.projs = C.projs.filter(p => !p.dead);
    for (const p of C.eprojs) {
      if (p.dead) continue;
      p.t += dt; p.rot += dt * 6;
      const k = Math.min(1, p.t / p.T);
      p.x = U.lerp(p.sx, p.tx, k); p.y = U.lerp(p.sy, p.ty, k) - Math.sin(k * Math.PI) * p.arc;
      if (k >= 1) { p.dead = true; gateDamage(p.dmg); if (p.kind === 'poop') snd('flyer_bomb', { vol: 0.4 }); else snd('acid', { vol: 0.3 }); burst(p.x, p.y, p.kind === 'poop' ? '#e8e8e8' : '#b6ff3c', 6, 60); }
    }
    C.eprojs = C.eprojs.filter(p => !p.dead);
    // 지뢰 / 웅덩이 / 블랙홀 / 오리
    for (const m of C.mines) {
      if (m.dead) continue;
      for (const e of C.enemies) if (!e.dead && !e.def.fly && e.state !== 'burrow' && Math.abs(e.x - m.x) < 12 && Math.abs(e.y - m.y) < 12) { m.dead = true; explosion(m.x, m.y - 4, 44, 60 + cfg.day * 16, null, null); break; }
    }
    C.mines = C.mines.filter(m => !m.dead);
    for (const pl of C.pools) {
      pl.t -= dt; pl.tick = (pl.tick || 0) + dt;
      if (pl.tick >= 0.4) { pl.tick = 0; for (const e of C.enemies.slice()) if (!e.dead && !e.def.fly && e.state !== 'burrow' && Math.abs(e.x - pl.x) < pl.r && Math.abs(e.y - pl.y) < pl.r * 0.5) { e.acid = Math.min(6, (e.acid || 0) + 1); e.acidT = 4; applyHit(e, pl.dps * 0.4, pl.w, { dot: true }); } }
    }
    C.pools = C.pools.filter(p => p.t > 0);
    for (const h of C.holes) {
      h.t += dt; h.tick += dt;
      const hit = h.tick >= 0.25; if (hit) h.tick = 0;
      for (const e of C.enemies.slice()) {
        if (e.dead || e.state === 'burrow') continue;
        const dx = h.x - e.x, dy = h.y - (e.y - e.h / 2), d = Math.hypot(dx, dy);
        if (d < 115) {
          if (!e.def.heavy && !e.def.dummy) { const f = (1 - d / 115) * 160 * dt; e.x += dx / (d + 1) * f; if (e.def.fly) e.baseY += dy / (d + 1) * f; else e.y = U.clamp(e.y + dy / (d + 1) * f * 0.4, LANE_MIN, LANE_MAX); }
          if (hit && d < 75) { if (h.sid && !C.hitSids.has(h.sid)) { C.hitSids.add(h.sid); C.stat.hits++; } applyHit(e, h.dmg, h.w, { aoe: true, noFx: true, quiet: true }); }
        }
      }
      if (h.t > 3) { h.dead = true; explosion(h.x, h.y, 50, h.dmg * 2, h.w, null, { col: '#c58bff' }); }
    }
    C.holes = C.holes.filter(h => !h.dead);
    for (const d of C.ducks) {
      d.y += 520 * dt;
      if (d.y >= d.ty - 10) { d.dead = true; snd('duck'); snd('bonk', { vol: 0.8 }); explosion(d.x, d.ty - 8, 54, 220 + cfg.day * 30, d.w, null, { col: '#ffe14a' }); text(d.x, d.ty - 50, '꽥!', '#ffe14a', 20, 1.1); }
    }
    C.ducks = C.ducks.filter(d => !d.dead);
    // 파티클류
    for (const p of C.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; }
    C.parts = C.parts.filter(p => p.t < p.life);
    for (const t of C.texts) { t.t += dt; t.x += t.vx * dt; t.y += t.vy * dt; t.vy += 40 * dt; }
    C.texts = C.texts.filter(t => t.t < t.life);
    for (const b of C.beams) b.t += dt;
    C.beams = C.beams.filter(b => b.t < b.life);
    for (const r of C.rings) { r.t += dt; r.r += (r.max - r.r) * Math.min(1, dt * 12); }
    C.rings = C.rings.filter(r => r.t < 0.35);
    C.shake = Math.max(0, C.shake - dt * 22);
    C.gateFlash = Math.max(0, C.gateFlash - dt * 3);
    C.hitMark = Math.max(0, C.hitMark - dt); C.killMark = Math.max(0, C.killMark - dt);
    if (C.banner) { C.banner.t += dt; if (C.banner.t > 2.6) C.banner = null; }
    if (st.comboT > 0) { st.comboT -= dt; if (st.comboT <= 0) st.combo = 0; }
    while (C.dps.length && C.dps[0].t < C.t - 3) C.dps.shift();
    // 진행도
    const alive = C.enemies.filter(e => !e.dead && !e.def.dummy).length;
    const left = alive + (C.spawns.length - C.si);
    C.remainFrac = C.total ? Math.min(1, left / C.total) : 1;
    C.left = left;
    if (cfg.mode !== 'range' && !C.ended) {
      if (C.gateHp < C.gateMax * 0.25) { C.alarmT -= dt; if (C.alarmT <= 0) { C.alarmT = 1.1; snd('alarm', { vol: 0.5 }); } }
      if (left === 0 && C.si >= C.spawns.length && C.t > 2) win();
    }
    if (C.ended) { C.endT -= dt; if (C.endT <= 0) finish(); }
  }

  function win() { C.ended = true; C.win = true; C.endT = 2.2; banner('방어 성공!', '놈들이 물러갔다'); snd('wave_clear'); try { Sound.music('none'); } catch (e) { /* noop */ } }
  function lose() { if (C.ended) return; C.ended = true; C.win = false; C.endT = 2.4; C.slow = 2.4; C.shake = 12; banner('문이 뚫렸다!', U.pick(DEATH_QUIPS)); snd('gate_break'); snd('defeat'); try { Sound.music('none'); } catch (e) { /* noop */ } }
  function finish() {
    stop();
    const st = C.stat;
    const lostFrac = Math.max(0, st.gateStart - C.gateHp) / C.gateMax;
    const grade = !C.win ? 'F' : lostFrac <= 0.02 ? 'S' : lostFrac < 0.2 ? 'A' : lostFrac < 0.45 ? 'B' : lostFrac < 0.7 ? 'C' : 'D';
    const res = { win: C.win, kills: st.kills, shots: st.shots, hits: st.hits, heads: st.heads, maxCombo: st.maxCombo, nuts: st.nuts, mats: st.mats, parcels: st.parcels, gateHp: C.gateHp, grade, spent: C.spent, time: C.t, dmg: st.dmg, wkills: C.weapons.map(x => x.kills || 0), powderSpent: Math.ceil(C.powderSpent), acc: st.shots ? Math.min(100, Math.round(st.hits / st.shots * 100)) : 0 };
    if (cfg.onEnd) cfg.onEnd(res);
  }

  /* ───────── 렌더 ───────── */
  function env() {
    const n = cfg.night || {};
    return { t: C.t, time: cfg.mode === 'range' ? 'dusk' : 'night', moon: n.blood ? 'blood' : 'normal', fog: n.fog && !C.fogOff ? 0.85 : 0, rain: false, gateHp: C.gateHp / C.gateMax, gateLevel: cfg.up.gate || 0, wire: cfg.up.wire || 0, light: !!cfg.up.light };
  }
  function drawGun(g, w, x, y, ang) {
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(ang);
    let ok = false;
    if (window.GunArt) { try { GunArt.draw(g, w.s.ids, { x: 0, y: 0, scale: GS, t: C.t, recoil: w.kick * 2, flash: w.flash, spin: w.spinPhase, charge: w.charge }); ok = true; } catch (e) { /* fallback */ } }
    if (!ok) { g.fillStyle = '#333'; g.fillRect(-4 - w.kick, -3, 26, 5); g.fillRect(-2 - w.kick, 0, 4, 7); if (w.flash > 0.3) { g.fillStyle = '#ffd23c'; g.fillRect(22, -5, 7, 9); } }
    g.restore();
  }
  function drawEnemy(g, e) {
    let ok = false;
    if (window.Art) { try { Art.enemy(g, e, C.t); ok = true; } catch (err) { /* fallback */ } }
    if (!ok) {
      if (e.state === 'burrow') { g.fillStyle = '#7a5a3a'; g.fillRect(e.x - 8, e.y - 5, 16, 5); return; }
      g.globalAlpha = e.dead ? 1 - e.die : 1;
      g.fillStyle = e.flash > 0.3 ? '#fff' : e.def.boss ? '#a03a3a' : e.elite ? '#d94ad9' : '#4a8a3a';
      g.fillRect(e.x - e.w / 2, e.y - e.h, e.w, e.h);
      if (!e.def.noHead) { g.fillStyle = '#c94a4a'; g.fillRect(e.x - e.w / 2 + 2, e.y - e.h, e.w - 4, e.h * 0.3); }
      g.globalAlpha = 1;
    }
  }
  function render() {
    const g = lctx, E = env();
    C.env = E;
    // 배경 (10fps 로 캐시)
    if (C.t - bgT > 0.1 || C.t < bgT) {
      bgT = C.t;
      let ok = false;
      if (window.Art) { try { Art.scene(bgctx, E); ok = true; } catch (err) { /* fallback */ } }
      if (!ok) { bgctx.fillStyle = '#0d1b24'; bgctx.fillRect(0, 0, W, GROUND); bgctx.fillStyle = '#2a2219'; bgctx.fillRect(0, GROUND, W, H - GROUND); bgctx.fillStyle = '#555'; bgctx.fillRect(0, 196, 122, 160); }
    }
    g.drawImage(bg, 0, 0);
    // 바닥 요소
    for (const pl of C.pools) { g.globalAlpha = Math.min(0.55, pl.t * 0.4); g.fillStyle = '#9fd93c'; g.beginPath(); g.ellipse(pl.x, pl.y, pl.r, pl.r * 0.35, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    for (const m of C.mines) { g.fillStyle = '#2a2a2a'; g.fillRect(m.x - 3, m.y - 2, 6, 3); g.fillStyle = Math.sin(C.t * 6 + m.x) > 0 ? '#ff3030' : '#601010'; g.fillRect(m.x - 1, m.y - 3, 2, 1); }
    // 적 (깊이 정렬)
    const list = C.enemies.slice().sort((a, b) => (a.def.fly ? 0 : a.y) - (b.def.fly ? 0 : b.y));
    for (const e of list) {
      drawEnemy(g, e);
      if (!e.dead && e.state !== 'burrow' && !e.def.boss && (e.hp < e.maxHp || e.elite) && !e.def.dummy) {
        const bw = Math.max(10, e.w), bx = Math.round(e.x - bw / 2), by = Math.round(e.y - e.h - 5);
        g.fillStyle = '#000'; g.fillRect(bx - 1, by - 1, bw + 2, 4);
        g.fillStyle = e.elite ? '#ff6fb5' : e.hpFrac > 0.5 ? '#7bd94a' : e.hpFrac > 0.25 ? '#ffd23c' : '#ff5050';
        g.fillRect(bx, by, Math.ceil(bw * e.hpFrac), 2);
        if (e.shieldHp > 0) { g.fillStyle = '#9fd8ff'; g.fillRect(bx, by - 2, Math.ceil(bw * e.shield), 1); }
      }
    }
    for (const p of C.eprojs) {
      let ok = false;
      if (window.Art && Art.projectileEnemy) { try { Art.projectileEnemy(g, p, C.t); ok = true; } catch (err) { /* fallback */ } }
      if (!ok) { g.fillStyle = p.kind === 'poop' ? '#eee' : p.kind === 'spit' ? '#b6ff3c' : '#888'; g.fillRect(p.x - 3, p.y - 3, 6, 6); }
    }
    // 포탑 / 플레이어
    for (const tu of C.turrets) { try { if (window.Art) Art.turret(g, tu.x, tu.y, { t: C.t, aim: tu.aim }); } catch (err) { /* noop */ } drawGun(g, tu.w, tu.x, tu.y - 14, tu.aim); }
    if (cfg.dog) { try { if (window.Art) Art.dog(g, 64, 196, C.t); } catch (err) { /* noop */ } }
    const w = curW();
    let pok = false;
    if (window.Art) { try { Art.player(g, PX, PY, { t: C.t, aim: C.aim, recoil: Math.min(1, w.kick / 4), reloading: w.reload > 0 }); pok = true; } catch (err) { /* fallback */ } }
    if (!pok) { g.fillStyle = '#c9a05a'; g.fillRect(PX - 5, PY - 24, 10, 24); }
    const swapOff = C.swapT > 0 ? Math.sin(C.swapT / 0.28 * Math.PI) * 0.9 : 0;
    drawGun(g, w, PIVX, PIVY, C.aim + swapOff + (w.reload > 0 ? 0.5 * Math.sin(Math.min(1, (1 - w.reload / w.s.reload) * 1.0) * Math.PI) : 0));
    // 투사체
    for (const p of C.projs) drawProj(g, p);
    for (const b of C.beams) {
      const a = 1 - b.t / b.life;
      g.globalAlpha = a; g.strokeStyle = b.col; g.lineWidth = b.w; g.beginPath(); g.moveTo(b.x1, b.y1);
      if (b.zig) { const n = 6; for (let i = 1; i < n; i++) { const k = i / n; g.lineTo(U.lerp(b.x1, b.x2, k) + Math.sin(b.seed + i * 9.1 + C.t * 60) * 5, U.lerp(b.y1, b.y2, k) + Math.cos(b.seed + i * 5.3 + C.t * 50) * 5); } }
      g.lineTo(b.x2, b.y2); g.stroke();
      if (b.w >= 2) { g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, b.w - 2); g.beginPath(); g.moveTo(b.x1, b.y1); g.lineTo(b.x2, b.y2); g.stroke(); }
      g.globalAlpha = 1;
    }
    for (const h of C.holes) {
      const r = 10 + Math.sin(h.t * 9) * 2 + Math.min(8, h.t * 6);
      g.fillStyle = '#000'; g.beginPath(); g.arc(h.x, h.y, r, 0, 7); g.fill();
      g.strokeStyle = '#c58bff'; g.lineWidth = 1;
      for (let i = 0; i < 3; i++) { g.globalAlpha = 0.7 - i * 0.2; g.beginPath(); g.arc(h.x, h.y, r + 5 + i * 9 - (h.t * 30 % 9), h.t * 4 + i, h.t * 4 + i + 4); g.stroke(); }
      g.globalAlpha = 1;
    }
    for (const d of C.ducks) {
      g.fillStyle = '#ffe14a'; g.fillRect(d.x - 14, d.y - 16, 28, 18); g.fillRect(d.x - 2, d.y - 28, 16, 14);
      g.fillStyle = '#ff8a3c'; g.fillRect(d.x + 12, d.y - 22, 8, 4); g.fillStyle = '#000'; g.fillRect(d.x + 7, d.y - 25, 2, 2);
    }
    for (const r of C.rings) {
      const a = 1 - r.t / 0.35;
      g.globalAlpha = a * (r.fill ? 0.5 : 0.9);
      if (r.fill) { g.fillStyle = r.col; g.beginPath(); g.arc(r.x, r.y, r.r, 0, 7); g.fill(); g.globalAlpha = a; }
      g.strokeStyle = r.fill ? '#fff' : r.col; g.lineWidth = 1; g.beginPath(); g.arc(r.x, r.y, r.r, 0, 7); g.stroke();
      g.globalAlpha = 1;
    }
    for (const p of C.parts) { g.globalAlpha = Math.min(1, (1 - p.t / p.life) * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.sz), Math.ceil(p.sz)); }
    g.globalAlpha = 1;
    try { if (window.Art) Art.sceneFront(g, E); } catch (err) { /* noop */ }
    if (C.gateFlash > 0) { g.fillStyle = `rgba(255,40,40,${C.gateFlash * 0.25})`; g.fillRect(0, 0, W, H); }
    // 업스케일
    const sx = (Math.random() - 0.5) * C.shake * 2, sy = (Math.random() - 0.5) * C.shake * 2;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(low, Math.round(sx), Math.round(sy), W * SC, H * SC);
    hud();
  }
  function drawProj(g, p) {
    const s = p.w.s;
    // 몸통별 전용 투사체 그림 (js/projart.js). 처리했으면 true 를 돌려준다.
    if (window.ProjArt) { try { if (ProjArt.draw(g, p, s, C.t)) return; } catch (e) { /* 기본 그림으로 */ } }
    const col = s.fx.burn ? '#ff8a3c' : s.fx.freeze ? '#9fd8ff' : s.fx.acid ? '#b6ff3c' : s.fx.shock ? '#7fe9ff' : s.fx.explode ? '#ffb347' : s.fx.rad ? '#d6ff5c' : '#ffe9a0';
    switch (p.kind) {
      case 'flame': { const k = p.age / p.life; g.globalAlpha = 0.8 * (1 - k); const cold = s.fx.freeze && !s.fx.burn, sour = s.fx.acid && !s.fx.burn; g.fillStyle = k < 0.3 ? (cold ? '#ffffff' : sour ? '#f0ffc0' : '#fff3a0') : k < 0.65 ? (cold ? '#9fd8ff' : sour ? '#b6ff3c' : '#ff9a2c') : (cold ? '#5a8ad0' : sour ? '#5a8a1a' : '#c83a1a'); const r = Math.round(p.r); g.fillRect(Math.round(p.x - r), Math.round(p.y - r), r * 2, r * 2); g.globalAlpha = 1; break; }
      case 'lob': g.fillStyle = s.pool ? '#8a5a3a' : s.receiver.id === 'potato' ? '#c9a05a' : s.receiver.id === 'grenade' ? '#5a7a3a' : '#3a4a3a'; g.fillRect(Math.round(p.x - 3), Math.round(p.y - 3), 6, 6); g.fillStyle = '#000'; g.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2); break;
      case 'orb': g.fillStyle = '#000'; g.beginPath(); g.arc(p.x, p.y, 5, 0, 7); g.fill(); g.strokeStyle = '#c58bff'; g.lineWidth = 1; g.beginPath(); g.arc(p.x, p.y, 7, p.rot, p.rot + 4); g.stroke(); break;
      case 'wave': { g.strokeStyle = '#ffd76a'; g.lineWidth = 2; g.globalAlpha = Math.max(0, 1 - p.rad / p.range); for (let i = 0; i < 3; i++) { const r = p.rad - i * 9; if (r > 4) { g.beginPath(); g.arc(p.ox, p.oy, r, p.ang - 0.34, p.ang + 0.34); g.stroke(); } } g.globalAlpha = 1; break; }
      case 'saw': { g.fillStyle = '#cfd6da'; const c = Math.cos(p.rot) * 5, sn = Math.sin(p.rot) * 5; g.fillRect(Math.round(p.x - 4), Math.round(p.y - 4), 8, 8); g.fillStyle = '#8a8f93'; g.fillRect(Math.round(p.x + c - 1), Math.round(p.y + sn - 1), 3, 3); g.fillRect(Math.round(p.x - c - 1), Math.round(p.y - sn - 1), 3, 3); g.fillRect(Math.round(p.x - sn - 1), Math.round(p.y + c - 1), 3, 3); g.fillRect(Math.round(p.x + sn - 1), Math.round(p.y - c - 1), 3, 3); break; }
      case 'can': g.fillStyle = ['#ff5050', '#50a0ff', '#7bd94a', '#ffd23c'][(p.w.shots + (p.dmg | 0)) % 4]; g.fillRect(Math.round(p.x - 3), Math.round(p.y - 2), 6, 4); g.fillStyle = '#ddd'; g.fillRect(Math.round(p.x + 2), Math.round(p.y - 2), 1, 4); break;
      case 'key': g.fillStyle = '#e6dfc8'; g.fillRect(Math.round(p.x - 2), Math.round(p.y - 2), 4, 4); g.fillStyle = '#555'; g.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2); break;
      case 'bio': g.fillStyle = '#d98fb2'; g.fillRect(Math.round(p.x - 2), Math.round(p.y - 2), 5, 4); g.fillStyle = '#b6ff3c'; g.fillRect(Math.round(p.x), Math.round(p.y - 1), 2, 2); break;
      case 'bullet': if (s.receiver.id === 'bubblegun' || s.ids.muzzle === 'muz_bubble') { // 비눗방울
        const r = 3 + Math.sin(p.age * 9 + p.dmg) * 0.6;
        g.strokeStyle = '#bfe9ff'; g.lineWidth = 1; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.stroke();
        g.fillStyle = '#ffffff'; g.fillRect(Math.round(p.x - 1), Math.round(p.y - 2), 1, 1);
        break;
      }
      // fallthrough
      default: { // 총알: 꼬리 달린 선
        const sp = Math.hypot(p.vx, p.vy) || 1, len = p.kind === 'nail' ? 5 : Math.min(16, sp * 0.014);
        g.strokeStyle = col; g.lineWidth = p.kind === 'nail' ? 1 : 1.5;
        g.beginPath(); g.moveTo(p.x - p.vx / sp * len, p.y - p.vy / sp * len); g.lineTo(p.x, p.y); g.stroke();
        g.fillStyle = '#fff'; g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
      }
    }
  }

  function bar(x, y, w, h, f, col, back) {
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = back || '#2a2a2a'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col; ctx.fillRect(x, y, Math.max(0, w * U.clamp(f, 0, 1)), h);
  }
  function otext(txt, x, y, size, col, align, weight) {
    ctx.font = `${weight || 400} ${size}px ${FONT}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, size / 5); ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round';
    ctx.strokeText(txt, x, y); ctx.fillStyle = col || '#fff'; ctx.fillText(txt, x, y);
  }
  function hud() {
    const st = C.stat, w = curW(), s = w.s, range = cfg.mode === 'range';
    // 피해 숫자
    for (const t of C.texts) { ctx.globalAlpha = Math.min(1, (1 - t.t / t.life) * 3); otext(t.txt, t.x * SC, t.y * SC, t.size * 1.5, t.col, 'center'); }
    ctx.globalAlpha = 1;
    // 문 내구도
    if (!range) {
      const f = C.gateHp / C.gateMax;
      bar(24, 24, 300, 22, f, f > 0.5 ? '#7bd94a' : f > 0.25 ? '#ffd23c' : '#ff5050');
      otext(`🚪 문 ${Math.ceil(C.gateHp)} / ${C.gateMax}`, 32, 36, 17, '#fff');
      otext('❤'.repeat(Math.max(0, cfg.lives)), 24, 66, 20, '#ff5a6a');
      // 웨이브 진행
      const done = C.total ? 1 - C.remainFrac : 0;
      bar(440, 24, 400, 14, done, cfg.night.blood ? '#ff4050' : '#ffb347');
      otext(`${cfg.day}일차 밤${cfg.night.blood ? ' · 블러드문' : ''}${cfg.night.fog ? ' · 안개' : ''}   남은 적 ${C.left || 0}`, 640, 54, 16, '#e6dfc8', 'center');
      otext(`🔩 ${Math.round(st.nuts)}`, 1256, 34, 22, '#ffd76a', 'right');
      const mk = Object.keys(st.mats);
      if (mk.length) otext(mk.map(k => RES[k].icon + st.mats[k]).join('  '), 1256, 62, 15, '#cfd6da', 'right');
      if (st.parcels) otext('📦'.repeat(st.parcels), 1256, 86, 16, '#fff', 'right');
      if (cfg.quest) {
        const q = QUESTS[cfg.quest.id];
        let cur = '';
        if (q.prog) { const v = q.prog({ heads: st.heads, maxCombo: st.maxCombo, wkills: C.weapons.map(x => x.kills || 0) }); cur = ` (${Math.min(v, cfg.quest.n)}/${cfg.quest.n})`; }
        otext('📋 ' + cfg.quest.text + cur, 640, 80, 15, '#8fe3c8', 'center');
      }
      if (st.combo >= 3) { const p = Math.min(1, st.comboT / 2.6); ctx.globalAlpha = 0.5 + p * 0.5; otext(`${st.combo} 연속!`, 1256, 116, 22 + Math.min(14, st.combo / 4), '#ff8a3c', 'right'); ctx.globalAlpha = 1; }
      if (C.boss && !C.boss.dead) {
        const b = C.boss;
        bar(340, 668, 600, 20, b.hp / b.maxHp, b.weak ? '#ffd23c' : '#d94a4a');
        otext(`☠ ${b.def.name} — ${b.def.title}`, 640, 650, 18, '#ffb0b0', 'center');
      }
    } else {
      let sum = 0; for (const d of C.dps) sum += d.d;
      otext('시험 사격장', 24, 36, 24, '#ffd76a');
      otext(`최근 3초 DPS: ${Math.round(sum / 3)}`, 24, 68, 20, '#fff');
      otext(`명중 ${st.hits} / 발사 ${st.shots}`, 24, 96, 16, '#cfd6da');
      otext(isTouch() ? '⏸ 로 나가기' : 'ESC 로 나가기', 1256, 36, 18, '#cfd6da', 'right');
      for (const e of C.enemies) if (e.label) otext(e.label, e.x * SC, (e.y - e.h - 8) * SC, 14, '#9aa39a', 'center');
    }
    if (tb && tb.btn) { const sb = tb.btn('swap'), gb = tb.btn('gren'); if (sb) sb.classList.toggle('hidden', C.weapons.length < 2); if (gb) gb.classList.toggle('cd', C.grenT > 0); }
    // 무기 패널
    const bx = 24, by = 610;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(bx - 8, by - 8, 380, 104);
    otext(s.name, bx, by + 8, 18, '#ffd76a');
    if (C.usesPowder && !range) {
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(bx - 8, by - 40, 250, 28);
      otext('🧨 ' + Math.floor(C.powder) + (s.ammoCost > 0 ? `   ${s.ammoName} -${s.ammoCost.toFixed(2)}/발` : '   재생탄 (무료)'), bx, by - 26, 14, C.powder < 5 ? '#ff5050' : '#ffb347');
    }
    if (w.momN > 0) otext(`연쇄 ×${w.momN}`, bx + 300, by + 26, 13, '#ff8a3c');
    if (w.focusN > 0 && s.sp.focus) otext(`집중 ×${w.focusN}`, bx + 300, by + 44, 13, '#7fe9ff');
    const reloading = w.reload > 0;
    const ammoTxt = w.jam ? '걸림!' : reloading ? '재장전…' : `${Math.floor(w.ammo)}`;
    otext(ammoTxt, bx, by + 46, 40, w.jam ? '#ff5050' : w.ammo / s.mag < 0.25 ? '#ff8a3c' : '#fff');
    if (!w.jam && !reloading) otext(`/ ${s.mag}`, bx + ctx.measureText(ammoTxt).width + 54, by + 52, 18, '#9aa39a');
    if (reloading) bar(bx + 150, by + 40, 200, 10, 1 - w.reload / s.reload, '#7fe9ff');
    else if (s.mode === 'charge' && w.charge > 0) bar(bx + 150, by + 40, 200, 10, w.charge, w.charge >= 1 ? '#fff' : '#ffb347');
    else if (s.spin) bar(bx + 150, by + 40, 200, 10, w.spin, w.spin >= 1 ? '#ff8a3c' : '#9aa39a');
    else if (w.buff > 0) bar(bx + 150, by + 40, 200, 10, w.buff / 5, '#9fd8ff');
    for (let i = 0; i < C.weapons.length; i++) {
      const ww = C.weapons[i], on = i === C.cur;
      ctx.fillStyle = on ? 'rgba(255,215,106,.25)' : 'rgba(255,255,255,.08)'; ctx.fillRect(bx + i * 184, by + 70, 176, 22);
      otext(`[${i + 1}] ${ww.s.receiver.name}`.slice(0, 16) + (ww.reload > 0 ? ' ⟳' : ''), bx + 6 + i * 184, by + 82, 13, on ? '#ffd76a' : '#9aa39a');
    }
    if (C.turrets.length) otext('🤖 ' + C.turrets[0].w.s.receiver.name, bx + 384, by + 82, 13, '#7fe9ff');
    { // 수류탄
      const gx = 416, gy = 628, ready = C.grenT <= 0;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(gx, gy, 132, 44);
      otext('💣', gx + 8, gy + 23, 24, '#fff');
      otext(ready ? (isTouch() ? '💣 버튼' : '우클릭 / Space') : C.grenT.toFixed(1) + 's', gx + 44, gy + 15, 13, ready ? '#8fe36a' : '#9aa39a');
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(gx + 44, gy + 28, 80, 6);
      ctx.fillStyle = ready ? '#8fe36a' : '#ffb347'; ctx.fillRect(gx + 44, gy + 28, 80 * (1 - Math.max(0, C.grenT) / GREN_CD), 6);
    }
    // 배너
    if (C.banner) {
      const b = C.banner, a = Math.min(1, b.t * 5) * Math.min(1, (2.6 - b.t) * 2), yy = 210 - Math.min(1, b.t * 6) * 20;
      ctx.globalAlpha = a;
      otext(b.txt, 640, yy, 54, '#ffd76a', 'center');
      if (b.sub) otext(b.sub, 640, yy + 48, 22, '#e6dfc8', 'center');
      ctx.globalAlpha = 1;
    }
    // 조준선
    const mx = mouse.x * SC, my = mouse.y * SC;
    const d = Math.hypot(mouse.x - PIVX, mouse.y - PIVY);
    const r = Math.max(7, Math.tan(Math.min(40, s.spread + w.bloom) * DEG) * d * SC);
    ctx.lineWidth = 2; ctx.strokeStyle = C.killMark > 0 ? '#ff5050' : '#fff';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.beginPath();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(mx + dx * r, my + dy * r); ctx.lineTo(mx + dx * (r + 9), my + dy * (r + 9)); }
    ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(mx - 1, my - 1, 2, 2);
    if (C.hitMark > 0 || C.killMark > 0) {
      ctx.strokeStyle = C.killMark > 0 ? '#ff5050' : '#fff'; ctx.beginPath();
      for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { ctx.moveTo(mx + dx * 5, my + dy * 5); ctx.lineTo(mx + dx * 12, my + dy * 12); }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    if (!reloading && !w.jam && !s.noReload && w.ammo / s.mag <= 0.25 && s.mag > 3) otext(isTouch() ? '탄 부족 [⟳]' : '탄 부족 [R]', mx, my + r + 26, 13, '#ff8a3c', 'center');
    if (w.jam) otext(isTouch() ? '걸림! [⟳]' : '걸림! [R]', mx, my + r + 26, 15, '#ff5050', 'center');
    if (reloading) { ctx.strokeStyle = '#7fe9ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, r + 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - w.reload / s.reload)); ctx.stroke(); }
    if (paused) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, 1280, 720); }
  }

  // 디버그/자동 테스트용: 프레임을 수동으로 진행한다
  const debug = {
    state: () => C, mouse,
    step(n, dt) { let errs = 0; for (let i = 0; i < n; i++) { try { update(dt || 1 / 60); } catch (e) { errs++; console.error('[step]', e); } mouse.pressed = false; if (!running) break; } try { render(); } catch (e) { errs++; console.error('[render]', e); } return errs; },
  };
  return { start, stop, abort, setPaused, isRunning: () => running, isPaused: () => paused, debug };
})();
