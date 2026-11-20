// BUNKER 404 — DOM UI (기지 화면, 모달, 타이틀)
'use strict';

const UI = (function () {
  const st = { roleF: 'all', tab: 'bench', gi: 0, slot: 'receiver', filter: 'all', invSel: null, invTab: 'parts', calSel: null, calMonth: null, diff: 'normal', shopSeen: 0 };
  const el = id => document.getElementById(id);
  const esc = U.esc;
  let lastPT = 'mouse';
  let stage, curModal = null, bgTimer = 0, bgMode = 'title', pvRaf = 0, pvFlash = 0, pvT0 = performance.now();
  const snd = (n, o) => { try { if (window.Sound) Sound.play(n, o); } catch (e) { /* noop */ } };
  const music = m => { try { if (window.Sound) Sound.music(m); } catch (e) { /* noop */ } };

  /* ───────── 공용 조각 ───────── */
  const iconURL = id => { try { return window.GunArt ? GunArt.iconURL(id) : null; } catch (e) { return null; } };
  const slotIcon = type => (SLOTS.find(s => s.type === type) || {}).icon || '🔩';
  function partImg(id, cls, alt) {
    const u = iconURL(id);
    return u ? `<img class="${cls}" src="${u}" alt="" draggable="false">` : `<div class="${alt}">${slotIcon(PARTS[id].slot)}</div>`;
  }
  function costHTML(cost) {
    const out = [];
    for (const k in cost) { if (!cost[k]) continue; out.push(`<span class="${(Game.s.res[k] || 0) < cost[k] ? 'no' : ''}">${RES[k].icon}${cost[k]}</span>`); }
    return `<span class="cost">${out.join('')}</span>`;
  }
  const lootHTML = loot => Object.keys(loot).filter(k => loot[k]).map(k => `<span>${RES[k].icon} ${loot[k] > 0 ? '+' : ''}${loot[k]}</span>`).join('');
  const linesHTML = (p, q) => Gun.modLines(p, q).map(l => `<span class="g${l.g}">${esc(l.t)}</span>`).join('');
  const tagsText = p => p.tags.map(t => TAGS[t].icon + TAGS[t].name).join(' ');
  const qTxt = q => q ? `<span class="q">+${q}</span>` : '';
  // 파츠의 성향(대보스/대군중)을 한눈에 보여 주는 배지
  const roleCache = {};
  function roleOf(p) {
    if (roleCache[p.id] !== undefined) return roleCache[p.id];
    const m = p.m || {}, sp = p.sp || {}, fx = p.fx || {}, b = p.base || {};
    let e = (m.elite || 0) - Math.min(0, m.swarm || 0) * 0.5 + (fx.sunder || b.sunder ? 30 : 0) + (sp.focus ? 30 : 0) + (sp.execute ? 10 : 0) + (m.head || 0) * 15 + (m.pen || 0) * 0.3 + (b.ramp ? 20 : 0) + (b.dmg >= 70 && b.rpm <= 130 ? 20 : 0);
    let w = (m.swarm || 0) - Math.min(0, m.elite || 0) * 0.5 + (m.pellets || 0) * 8 + (m.pierce || 0) * 8 + (fx.explode ? 20 : 0) + (sp.opener ? 20 : 0) + (sp.momentum ? 25 : 0) + (sp.overkill ? 25 : 0) + (fx.bounce ? 12 : 0) + (fx.shock ? 10 : 0) + (m.blast || 0) * 0.4 + ((b.pellets || 1) >= 5 ? 20 : 0) + (b.explode ? 25 : 0) + (b.proj === 'flame' || b.proj === 'wave' ? 30 : 0);
    return (roleCache[p.id] = e - w > 12 ? 'elite' : w - e > 12 ? 'swarm' : null);
  }
  const roleChip = p => { const r = roleOf(p); return r === 'elite' ? '<span class="role e">🎯 대보스</span>' : r === 'swarm' ? '<span class="role s">🐜 대군중</span>' : ''; };
  // o: {uid, cls, tagx, right, act, attrs, desc, isNew}
  function partCard(id, q, o) {
    o = o || {};
    const p = PARTS[id];
    return `<div class="pc r${p.r} ${o.cls || ''}" ${o.act ? `data-act="${o.act}"` : ''} ${o.uid != null ? `data-uid="${o.uid}"` : ''} ${o.attrs || ''}>
      ${partImg(id, 'pi', 'pe')}
      <div class="pb"><div class="pn">${esc(p.name)}${qTxt(q)}</div>
      <div class="pt">${roleChip(p)}${RARITY[p.r].name} · ${SLOT_TYPE_NAME[p.slot]}${p.tags.length ? ' · ' + tagsText(p) : ''}</div>
      <div class="pl">${linesHTML(p, q)}</div>${o.desc ? `<div class="pdesc">${esc(p.desc)}</div>` : ''}</div>
      ${o.right || ''}${o.tagx ? `<div class="tagx">${o.tagx}</div>` : ''}${o.isNew ? '<div class="new">NEW</div>' : ''}</div>`;
  }
  function toast(msg, bad) {
    const t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg;
    el('toasts').appendChild(t);
    setTimeout(() => t.remove(), 2700);
    if (bad) snd('ui_error');
  }
  function modal(html, acts, cls) {
    const o = el('overlay');
    o.innerHTML = `<div class="modal ${cls || ''}">${html}</div>`;
    o.classList.remove('hidden');
    curModal = { acts: acts || {}, t: performance.now() };
  }
  function closeModal() { el('overlay').classList.add('hidden'); el('overlay').innerHTML = ''; curModal = null; }
  const okFoot = (label, cls) => `<div class="foot"><button class="btn ${cls || 'primary'}" data-act="ok">${label || '확인'}</button></div>`;

  /* ───────── 배경 캔버스 ───────── */
  function startBg(mode) {
    bgMode = mode;
    clearInterval(bgTimer);
    const c = el('bg-canvas'), g = c.getContext('2d'), t0 = performance.now();
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      try {
        if (!window.Art) { g.fillStyle = '#1a1510'; g.fillRect(0, 0, 640, 360); return; }
        if (bgMode === 'title') Art.title(g, t);
        else {
          const s = Game.s, ev = s ? Game.today().ev : null;
          Art.scene(g, { t, time: 'day', moon: 'normal', fog: 0, rain: !!(ev && ev.type === 'rain'), gateHp: s ? s.gateHp / Game.gateMax() : 1, gateLevel: s ? s.up.gate || 0 : 0, wire: s ? s.up.wire || 0 : 0, light: false });
          Art.player(g, 86, 196, { t, aim: 0.25 + Math.sin(t * 0.7) * 0.1, recoil: 0, reloading: false });
          if (s && s.up.turret) Art.turret(g, 46, 196, { t, aim: 0.2 });
          if (s && s.flags.dog) Art.dog(g, 64, 196, t);
          Art.sceneFront(g, { t, time: 'day', fog: 0, rain: !!(ev && ev.type === 'rain') });
        }
      } catch (e) { /* 배경은 장식일 뿐 */ }
    };
    draw();
    bgTimer = setInterval(draw, 100);
  }
  function stopBg() { clearInterval(bgTimer); }

  /* ───────── 타이틀 ───────── */
  function showTitle() {
    stage.classList.remove('combat');
    el('screen-base').classList.add('hidden');
    el('screen-title').classList.remove('hidden');
    stopPreview(); startBg('title'); music('title');
    const has = Game.hasSave();
    let day = 0;
    if (has) { try { day = JSON.parse(localStorage.getItem(SAVE_KEY)).day; } catch (e) { /* noop */ } }
    el('title-btns').innerHTML = `
      ${has ? `<button class="btn primary big" data-act="continue">이어하기 <small>(${day}일차)</small></button>` : ''}
      <div class="diff-pick">${Object.keys(DIFFS).map(k => `<button class="btn ${k === st.diff ? 'sel' : ''}" data-act="diff" data-d="${k}">${DIFFS[k].name}</button>`).join('')}</div>
      <div class="diff-desc">${DIFFS[st.diff].desc}</div>
      <button class="btn ${has ? '' : 'primary'} big" data-act="newgame">새 게임</button>
      <div class="row"><button class="btn small" data-act="settings">🔊 소리 설정</button><button class="btn small" data-act="howto">❔ 게임 방법</button></div>${fsBtn()}`;
  }
  const HOWTO = `<h1>게임 방법</h1>
    <p>당신은 <b>404 대피소</b>의 하나뿐인 총포상. 정부 기록에 이 대피소는 "찾을 수 없음(404)"이라 구조대는 오지 않는다.</p>
    <h3>☀️ 낮 — 준비</h3>
    <p>🔧 <b>작업대</b>에서 파츠를 조합해 총을 만든다. 같은 계열 3개 이상이면 <b>세트 효과</b>.<br>🗺️ <b>원정</b>(활동력 소모)으로 재료와 파츠를 줍고, 🛒 <b>상인</b>이 오는 날엔 거래한다.<br>📦 한 번 얻은 파츠는 도면이 등록되어 <b>제작·강화·분해</b>할 수 있다.<br>💊 <b>특수 탄약</b>은 쏠 때마다 화약🧨을 쓴다. 한 발이 강하고 비싼 탄은 보스·정예에게, 싸고 넓게 퍼지는 탄은 잡몹 떼에게. 조합은 <b>프리셋</b>으로 저장해 두고 그날 적에 맞춰 바꿔 끼우자.<br>📅 <b>달력</b>에서 다가올 습격과 상인 방문을 보고 미리 계획하라.</p>
    <h3>🌙 밤 — 방어</h3>
    <p>마우스로 조준하고 눌러서 쏜다. <b>머리</b>를 맞히면 큰 피해. <b>우클릭/Space</b> 수류탄, <b>R</b> 재장전, <b>1·2·Q</b> 무기 교체, <b>ESC</b> 일시정지.<br>📱 터치: 누르고 있는 동안 그 지점을 조준·사격(조준점이 손가락 살짝 위에 뜬다). 왼쪽 버튼으로 💣 수류탄 · ⟳ 재장전 · ⇄ 교체 · ⏸ 일시정지. 설명은 길게 눌러 본다.<br>문이 뚫리면 목숨(❤)을 하나 잃고 자원의 25%를 털린다. 목숨이 다하면 끝.</p>
    <h3>🎯 목표</h3><p>30일을 버티고 재개발 조합장을 막아내라. 10일·20일·30일에는 보스가 온다.</p>`;

  /* ───────── 기지 화면 ───────── */
  function showBase() {
    stage.classList.remove('combat');
    el('screen-title').classList.add('hidden');
    el('screen-base').classList.remove('hidden');
    el('pause').classList.add('hidden');
    startBg('base'); music('base');
    const ev = Game.today().ev;
    if (st.tab === 'shop' && !Game.s.shop) st.tab = 'bench';
    void ev;
    render();
    if (Game.s.pendingVictory) return victory(true);
    morning();
  }
  const EV_LABEL = { supply: '📦 보급 투하', rain: '☔ 산성비 · 원정 불가', recycle: '♻️ 분리수거의 날 · 분해 2배', event: '❗ 사건 발생' };
  function evLabel(ev) { if (!ev) return ''; if (ev.type === 'merchant') return `${MERCHANTS[ev.id].emoji} ${MERCHANTS[ev.id].name} 방문`; return EV_LABEL[ev.type] || ''; }
  function topbar() {
    const s = Game.s, gm = Game.gateMax(), f = s.gateHp / gm, apm = Math.max(Game.apMax(), s.ap);
    let ap = ''; for (let i = 0; i < apm; i++) ap += `<i class="${i < s.ap ? 'on' : ''}">⚡</i>`;
    el('topbar').innerHTML = `<div class="day">DAY ${s.day}<small>${evLabel(Game.today().ev) || '평범한 하루'}</small></div>
      <div class="ap" title="활동력: 원정·수리에 사용">${ap}</div>
      <div class="gatebar ${f < 0.3 ? 'low' : f < 0.6 ? 'mid' : ''}"><div style="width:${f * 100}%"></div><span>🚪 ${Math.ceil(s.gateHp)} / ${gm}</span></div>
      <div class="lives" title="목숨: 문이 뚫릴 때마다 하나씩 잃는다">${'❤'.repeat(Math.max(0, s.lives))}</div>
      ${s.heat ? `<div class="heat" title="악명 ${s.heat}단계: 흠집 없이 막을수록(S) 소문이 퍼져 무리가 커진다. 적 수 +${s.heat * 8}% · 체력 +${s.heat * 4}% · 너트 +${s.heat * 5}%. 고전하면 가라앉는다.">🔥${s.heat}</div>` : ''}
      <div class="res">${RES_KEYS.map(k => `<span title="${RES[k].name}: ${RES[k].desc}">${RES[k].icon}<b>${U.fmt(s.res[k] || 0)}</b></span>`).join('')}</div>`;
  }
  const NAV = [['bench', '🔧 작업대'], ['inv', '📦 창고·제작'], ['shop', '🛒 상점'], ['scav', '🗺️ 원정'], ['fac', '🏗️ 시설'], ['cal', '📅 달력'], ['codex', '📖 도감']];
  function nightForecast(n, known) {
    if (n.boss) return `☠️ <b>보스: ${ENEMIES[n.boss].name}</b>`;
    if (!n.threat) return '😴 <b>조용한 밤</b>';
    return `<span class="skull">${(n.blood ? '🩸' : '💀').repeat(n.threat)}</span><br><b>${known && THEMES[n.theme] ? THEMES[n.theme].name : '???'}</b>${n.fog ? ' 🌫️' : ''}`;
  }
  function nav() {
    const s = Game.s, newN = s.inv.filter(i => i.isNew).length;
    let h = '';
    for (const [id, label] of NAV) {
      const off = id === 'shop' && !s.shop;
      const badge = id === 'shop' && s.shop && st.shopSeen !== s.day ? '<span class="badge">!</span>' : id === 'inv' && newN ? `<span class="badge">${newN}</span>` : '';
      h += `<button class="navb ${st.tab === id ? 'sel' : ''} ${off ? 'off' : ''}" data-act="tab" data-tab="${id}">${label}${badge}</button>`;
    }
    h += `<div class="nav-foot"><div class="row" style="gap:4px"><button class="btn small grow" data-act="settings">⚙️ 설정</button><button class="btn small grow" data-act="howto" title="게임 방법">❔</button><button class="btn small grow" data-act="glossary" title="용어 사전">📖</button></div><button class="btn small" data-act="totitle">🚪 타이틀로</button></div>`;
    el('nav').innerHTML = h;
    const n = Game.today().night;
    const qs = Game.s.quest;
    el('night').innerHTML = `${qs ? `<div class="fc quest" title="오늘의 의뢰: ${esc(QUESTS[qs.id].text(qs.n))} — 달성 시 너트 ${qs.nuts}${qs.part ? ' + 파츠 상자' : ''}"><span class="qt">📋 ${esc(QUESTS[qs.id].text(qs.n))}</span><span style="color:var(--amber)">🔩${qs.nuts}${qs.part ? ' +📦' : ''}</span></div>` : ''}<div class="fc">오늘 밤<br>${nightForecast(n, true)}</div><button class="btn primary" data-act="night">🌙 밤 맞이</button>`;
  }
  function render() {
    if (!Game.s) return;
    topbar(); nav();
    const m = el('main'), sc = {};
    for (const x of $$('[data-scroll]', m)) sc[x.dataset.scroll] = x.scrollTop;
    m.innerHTML = TABS[st.tab]();
    for (const x of $$('[data-scroll]', m)) if (sc[x.dataset.scroll]) x.scrollTop = sc[x.dataset.scroll];
    if (st.tab === 'bench') startPreview(); else stopPreview();
    if (st.tab === 'cal' || st.tab === 'codex') drawEnemyIcons();
  }

  /* ───────── 작업대 ───────── */
  const fmt1 = v => (Math.round(v * 10) / 10).toString();
  const STAT_ROWS = [
    ['피해', s => s.pellets > 1 ? `${fmt1(s.dmg)}×${s.pellets}` : fmt1(s.dmg), s => s.dmg * s.pellets, 1],
    ['연사 (RPM)', s => Math.round(s.rpm), s => s.rpm, 1],
    ['장탄', s => s.mag, s => s.mag, 1],
    ['재장전', s => s.noReload ? '자동' : s.reload.toFixed(2) + 's', s => s.reload, -1],
    ['정확도', s => s.acc, s => s.acc, 1],
    ['반동', s => s.recoil.toFixed(1), s => s.recoil, -1],
    ['관통', s => s.pierce >= 99 ? '∞' : s.pierce, s => Math.min(99, s.pierce), 1],
    ['약점 배율', s => '×' + s.head.toFixed(1), s => s.head, 1],
    ['치명타', s => Math.round(s.crit) + '%', s => s.crit, 1],
    ['방어 관통', s => Math.round(s.pen) + '%', s => s.pen, 1],
    ['걸림', s => s.jam.toFixed(1) + '%', s => s.jam, -1],
    ['전리품', s => '+' + Math.round(s.loot) + '%', s => s.loot, 1],
    ['정예·보스 피해', s => (s.elite >= 0 ? '+' : '') + Math.round(s.elite) + '%', s => s.elite, 1],
    ['일반 적 피해', s => (s.swarm >= 0 ? '+' : '') + Math.round(s.swarm) + '%', s => s.swarm, 1],
    ['탄약값 /발', s => s.ammoCost ? '🧨' + s.ammoCost.toFixed(2) : '무료', s => s.ammoCost, -1],
    ['탄약값 /분', s => s.costPerMin ? '🧨' + Math.round(s.costPerMin) : '-', s => s.costPerMin, -1],
  ];
  function statsHTML(gs, cmp) {
    if (!gs && !cmp) return `<p class="sub" style="margin-top:20px;text-align:center">몸통이 없으면 총이 아닙니다.<br>그건 그냥 부품 더미입니다.</p>`;
    const base = gs || cmp, show = cmp || gs;
    const dl = (a, b, good, dec) => {
      if (!cmp || !gs) return '<span class="d"></span>';
      const d = b - a;
      if (Math.abs(d) < 0.005) return '<span class="d"></span>';
      return `<span class="d ${(d > 0) === (good > 0) ? 'g1' : 'g-1'}">${d > 0 ? '▲' : '▼'}${Math.abs(d) >= 10 || !dec ? Math.round(Math.abs(d)) : Math.abs(d).toFixed(1)}</span>`;
    };
    let h = `<div class="dpsbox"><div><div class="n">${Math.round(show.dps)} ${dl(base.dps, show.dps, 1)}</div><div class="l">순간 DPS</div></div><div><div class="n">${Math.round(show.sustained)} ${dl(base.sustained, show.sustained, 1)}</div><div class="l">지속 DPS (재장전 포함)</div></div></div>
      <div class="dpsbox role"><div title="정예·보스 상대 추정 화력: 약점 배율·정예 피해·절삭·집중 반영"><div class="n" style="color:#ffb0a0">${Math.round(show.dpsElite)} ${dl(base.dpsElite, show.dpsElite, 1)}</div><div class="l">🎯 대보스 화력</div></div><div title="잡몹 무리 상대 추정 화력: 관통·폭발·연쇄·일반 적 피해 반영"><div class="n" style="color:#b8f0a0">${Math.round(show.dpsSwarm)} ${dl(base.dpsSwarm, show.dpsSwarm, 1)}</div><div class="l">🐜 대군중 화력</div></div></div><div class="stats">`;
    for (const [k, f, v, good] of STAT_ROWS) h += `<div class="st"><span class="k">${k}</span><span class="v">${f(show)}</span>${dl(v(base), v(show), good, true)}</div>`;
    h += '</div><div class="fxs">';
    h += `<span class="fxb">${MODE_NAME[show.mode]}</span>`;
    for (const k in show.fx) if (show.fx[k]) h += `<span class="fxb" style="--fc:${FX[k].color}" title="${esc(FX[k].desc(show.fx[k]))}">${FX[k].icon} ${esc(FX[k].desc(show.fx[k]))}</span>`;
    if (show.suppressed) h += '<span class="fxb">🤫 소음기</span>';
    h += '</div>';
    if (show.ammoCost > 0) {
      const pw = Game.s.res.powder, shots = Math.floor(pw / show.ammoCost), secs = Math.floor(shots / show.sps);
      h += `<div class="setline" style="color:${secs < 40 ? 'var(--red)' : 'var(--dim)'}">🧨 ${esc(show.ammoName)}: 보유 화약 ${pw}개로 ${shots}발 (연사 약 ${secs}초). 떨어지면 무료 재생탄으로 바뀝니다.</div>`;
    }
    for (const sset of show.sets) h += `<div class="setline">${TAGS[sset.tag].icon} <b>${sset.name}</b> (${TAGS[sset.tag].name} ${sset.n}) — ${esc(sset.text)}</div>`;
    for (const sl of SLOTS) { const inst = show.insts[sl.id]; if (inst && PARTS[inst.id].note) h += `<div class="setline" style="color:var(--teal)">★ ${esc(PARTS[inst.id].name)}: ${esc(PARTS[inst.id].note)}</div>`; }
    return h;
  }
  function cmpStats(uid) {
    const s = Game.s, g = s.guns[st.gi], slots = Object.assign({}, g.slots);
    for (const k in slots) if (slots[k] === uid) delete slots[k];
    if (g.slots[st.slot] !== uid) slots[st.slot] = uid;
    const r = Gun.compute({ name: g.name, slots }, id => Game.inst(id));
    if (r && s.up.light) { r.crit = Math.min(100, r.crit + 5); if (r.basic) r.basic.crit = Math.min(100, r.basic.crit + 5); }
    return r;
  }
  function tabBench() {
    const s = Game.s, g = s.guns[st.gi], gs = Game.gunStats(st.gi);
    const slotDef = SLOTS.find(x => x.id === st.slot);
    let left = `<div class="gunsel">${['주무기', '보조', '포탑'].map((n, i) => `<button class="btn ${i === st.gi ? 'sel' : ''}" data-act="gun" data-gi="${i}">${i === 2 ? '🤖' : '[' + (i + 1) + ']'} ${n}</button>`).join('')}</div>`;
    if (st.gi === 2 && !s.up.turret) left += `<div class="sub" style="margin-bottom:6px;color:var(--amber)">⚠ 시설에서 '자동 포탑'을 지어야 이 총이 발사됩니다.</div>`;
    for (const sl of SLOTS) {
      const inst = Game.inst(g.slots[sl.id]), p = inst && PARTS[inst.id];
      left += `<div class="slot ${sl.id === st.slot ? 'sel' : ''} ${p ? 'r' + p.r : ''}" data-act="slot" data-slot="${sl.id}">${p ? partImg(p.id, 'si', 'se') : `<div class="se">${sl.icon}</div>`}<div><div class="sn">${sl.name}</div><div class="sp">${p ? esc(p.name) + (inst.q ? ' +' + inst.q : '') : '— 비어 있음 —'}</div></div></div>`;
    }
    let chips = '';
    if (gs) for (const t in TAGS) { const n = gs.tagCount[t]; if (n) chips += `<span class="chip ${n >= 3 ? 'on' : ''}" style="--cc:${TAGS[t].color}" title="${SETS[t].map(x => `${x.n}개: ${x.text}`).join(' / ')}">${TAGS[t].icon} ${TAGS[t].name} ${n}</span>`; }
    const center = `<div class="preview" data-act="dryfire" title="클릭: 격발 테스트"><canvas id="pv" width="420" height="196"></canvas></div>
      <div class="gname" data-act="rename" title="이름 바꾸기">${gs ? esc(gs.name) : '(총 없음)'}</div>
      <div class="chips">${chips || '<span class="sub">계열 파츠 3개 이상 → 세트 효과</span>'}</div>
      <div id="statbox">${statsHTML(gs, null)}</div><button class="btn small" style="margin-top:8px" data-act="glossary">📖 스탯·키워드 뜻 보기</button>`;
    // 후보 목록
    const candsAll = s.inv.filter(i => PARTS[i.id].slot === slotDef.type);
    const cands = candsAll.filter(i => st.roleF === 'all' || roleOf(PARTS[i.id]) === st.roleF || g.slots[st.slot] === i.uid).sort((a, b) => (PARTS[b.id].tier - PARTS[a.id].tier) || (b.q - a.q) || (a.id < b.id ? -1 : 1));
    let right = '';
    for (const inst of cands) {
      const eq = Game.equippedOn(inst.uid);
      const here = eq && eq.gi === st.gi && eq.slot === st.slot;
      const tagx = here ? '✔ 장착 중' : eq ? `${['주무기', '보조', '포탑'][eq.gi]}에 장착됨` : '';
      right += partCard(inst.id, inst.q, { uid: inst.uid, act: 'equip', cls: here ? 'sel' : eq ? 'eq' : '', tagx, isNew: inst.isNew, attrs: 'data-cmp="1"' });
    }
    if (!cands.length) right = `<p class="sub" style="text-align:center;margin-top:30px">이 슬롯에 맞는 파츠가 없습니다.<br>원정·상인·제작으로 구해 보세요.</p>`;
    return `<div class="bench">
      <div class="panel scroll" data-scroll="slots">${left}<div class="row" style="gap:4px;margin-top:4px"><button class="btn small teal grow" data-act="range" ${gs ? '' : 'disabled'}>🎯 시험 사격</button><button class="btn small" data-act="randgun" title="창고의 미장착 파츠로 아무렇게나 조립한다">🎲 아무거나</button></div>${presetsHTML(gs)}</div>
      <div class="panel scroll" data-scroll="center">${center}</div>
      <div class="panel" style="display:flex;flex-direction:column;"><h2>${slotDef.icon} ${slotDef.name} <small>${candsAll.length}개 보유 · 클릭해서 장착/해제</small><span class="grow"></span>${[['all', '전체'], ['elite', '🎯'], ['swarm', '🐜']].map(([k, n]) => `<button class="btn small ${st.roleF === k ? 'sel' : ''}" style="${st.roleF === k ? 'border-color:var(--amber);color:var(--amber)' : ''}" data-act="rolef" data-f="${k}" title="${k === 'elite' ? '대보스 성향만' : k === 'swarm' ? '대군중 성향만' : '전부 보기'}">${n}</button>`).join('')}</h2><div class="cands scroll grow" data-scroll="cands">${right}</div></div>
    </div>`;
  }
  function presetsHTML(gs) {
    const s = Game.s;
    let h = `<div class="sub" style="margin:9px 0 4px;color:var(--teal);font-family:var(--f-head);font-size:15px">💾 프리셋 <span class="sub">— 적에 맞춰 조합을 바꿔 끼우자</span></div>`;
    s.presets.forEach((p, i) => {
      let thumb = '';
      try { const u = window.GunArt && GunArt.gunURL ? GunArt.gunURL(Game.presetIds(p), 150, 44) : ''; if (u) thumb = `<img src="${u}" alt="" style="width:75px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:4px">`; } catch (e) { /* noop */ }
      h += `<div class="row" style="gap:4px;margin-bottom:4px"><button class="btn small grow" style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" data-act="pload" data-i="${i}" title="이 조합 불러오기">${thumb}${esc(p.name)}</button><button class="btn small danger" data-act="pdel" data-i="${i}" title="삭제">✕</button></div>`;
    });
    return h + `<button class="btn small" style="width:100%" data-act="psave" ${gs ? '' : 'disabled'}>＋ 지금 조합을 프리셋으로 저장</button>`;
  }
  function startPreview() {
    cancelAnimationFrame(pvRaf);
    const draw = () => {
      const c = el('pv');
      if (!c || st.tab !== 'bench') return;
      pvRaf = requestAnimationFrame(draw);
      const g = c.getContext('2d'), t = (performance.now() - pvT0) / 1000;
      g.clearRect(0, 0, c.width, c.height);
      const gs = Game.gunStats(st.gi);
      if (!gs || !window.GunArt) return;
      try {
        const m = GunArt.metrics(gs.ids), w = m.maxX - m.minX, h = m.maxY - m.minY;
        const sc = U.clamp(Math.floor(Math.min(390 / w, 165 / h)), 1, 5);
        const x = 210 - (m.minX + m.maxX) / 2 * sc, y = 100 - (m.minY + m.maxY) / 2 * sc + Math.round(Math.sin(t * 1.6) * 3);
        g.imageSmoothingEnabled = false;
        pvFlash = Math.max(0, pvFlash - 0.07);
        GunArt.draw(g, gs.ids, { x: Math.round(x), y: Math.round(y), scale: sc, t, recoil: pvFlash * 5, flash: pvFlash, spin: t * 3, charge: 0 });
      } catch (e) { /* noop */ }
    };
    pvRaf = requestAnimationFrame(draw);
  }
  function stopPreview() { cancelAnimationFrame(pvRaf); }

  /* ───────── 창고 · 제작 ───────── */
  function filterBar() {
    const types = [['all', '전체'], ['receiver', '몸통'], ['barrel', '총열'], ['mag', '탄창'], ['stock', '개머리판'], ['sight', '조준기'], ['muzzle', '총구'], ['ammo', '탄약'], ['acc', '부착물']];
    return `<div class="filters">${types.map(([k, n]) => `<button class="btn small ${st.filter === k ? 'sel' : ''}" data-act="filter" data-f="${k}">${n}</button>`).join('')}</div>`;
  }
  function tabInv() {
    const s = Game.s, known = Object.keys(s.bp).length;
    const head = `<div class="filters" style="margin-bottom:6px"><button class="btn ${st.invTab === 'parts' ? 'primary' : ''}" data-act="invtab" data-t="parts">📦 보유 파츠 (${s.inv.length})</button><button class="btn ${st.invTab === 'craft' ? 'primary' : ''}" data-act="invtab" data-t="craft">📐 도면 제작 (${known}/${PART_LIST.length})</button>
      <span class="grow"></span>${st.invTab === 'parts' ? '<button class="btn small danger" data-act="bulk">🗑️ 미장착 고물 일괄 분해</button>' : ''}</div>`;
    let list = '', detail = '';
    if (st.invTab === 'parts') {
      const items = s.inv.filter(i => st.filter === 'all' || PARTS[i.id].slot === st.filter).sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || (PARTS[b.id].tier - PARTS[a.id].tier) || (a.id < b.id ? -1 : 1));
      for (const inst of items) {
        const eq = Game.equippedOn(inst.uid);
        list += partCard(inst.id, inst.q, { uid: inst.uid, act: 'invsel', cls: (st.invSel === inst.uid ? 'sel ' : '') + (eq ? 'eq' : ''), tagx: eq ? ['주무기', '보조', '포탑'][eq.gi] : '', isNew: inst.isNew });
      }
      if (!items.length) list = '<p class="sub">해당하는 파츠가 없습니다.</p>';
      const inst = Game.inst(st.invSel);
      if (inst) {
        const p = PARTS[inst.id], eq = Game.equippedOn(inst.uid), info = Game.enhanceInfo(inst), y = Game.dismantleYield(inst);
        const u = iconURL(inst.id);
        detail = `<div class="detail r${p.r}">${u ? `<img class="big" src="${u}" alt="">` : ''}<div class="dn">${esc(p.name)}${inst.q ? ' +' + inst.q : ''}</div>
          <div class="sub"><span class="rar">${RARITY[p.r].name}</span>${SLOT_TYPE_NAME[p.slot]} · ${tagsText(p) || '무소속'}</div>
          <div class="pl" style="margin-top:6px;font-size:14px;display:flex;flex-wrap:wrap;gap:2px 10px">${linesHTML(p, inst.q)}</div><div class="pdesc">“${esc(p.desc)}”</div>
          ${eq ? `<div class="note">✔ ${['주무기', '보조무기', '포탑'][eq.gi]}에 장착 중</div>` : ''}
          <div class="acts">
            <div class="actbox"><div class="t"><span>⚒️ 강화 ${info.max ? '(최대)' : `+${inst.q} → +${inst.q + 1}`}</span>${info.max ? '' : `<button class="btn small primary" data-act="enhance" data-uid="${inst.uid}" ${Game.canAfford(info.cost) ? '' : 'disabled'}>강화</button>`}</div>
              ${info.max ? '<span class="sub">더 이상 강화할 수 없습니다. 장인의 혼이 깃들었습니다.</span>' : `${costHTML(info.cost)} <span class="sub">· 성공률 ${Math.round(info.chance * 100)}%${inst.q >= 3 ? ' · 실패 시 25% 확률로 하락' : ''}</span>`}</div>
            <div class="actbox"><div class="t"><span>🔨 분해</span><button class="btn small danger" data-act="dismantle" data-uid="${inst.uid}" ${eq ? 'disabled' : ''}>분해</button></div><span class="cost">${lootHTML(y)}</span>${eq ? ' <span class="sub">· 장착 해제 후 가능</span>' : ''}</div>
          </div></div>`;
      } else detail = '<p class="sub" style="text-align:center;margin-top:60px">파츠를 선택하면<br>강화하거나 분해할 수 있습니다.</p>';
    } else {
      const items = PART_LIST.filter(p => s.bp[p.id] && (st.filter === 'all' || p.slot === st.filter)).sort((a, b) => a.tier - b.tier);
      for (const p of items) {
        const cost = partCraftCost(p);
        list += partCard(p.id, 0, { right: `<div class="price">${costHTML(cost)}<button class="btn small primary" data-act="craft" data-id="${p.id}" ${Game.canAfford(cost) ? '' : 'disabled'}>제작</button></div>` });
      }
      if (!items.length) list = '<p class="sub">등록된 도면이 없습니다.</p>';
      detail = `<h2>📐 도면</h2><p class="sub" style="line-height:1.6">한 번이라도 손에 넣은 파츠는 도면이 등록되어 재료만 있으면 다시 만들 수 있습니다.<br><br>세트 효과용 파츠를 하나 더 만들거나, 포탑용 총을 한 자루 더 조립할 때 쓰세요.<br><br>등록: <b style="color:var(--amber)">${known}</b> / ${PART_LIST.length}</p>`;
    }
    return `<div class="row" style="height:100%"><div class="panel grow" style="display:flex;flex-direction:column">${head}${filterBar()}<div class="${st.invTab === 'parts' ? 'grid2' : 'cands'} scroll grow" data-scroll="inv${st.invTab}">${list}</div></div>
      <div class="panel scroll" style="width:320px;" data-scroll="invd">${detail}</div></div>`;
  }

  /* ───────── 상점 ───────── */
  function tabShop() {
    const s = Game.s, shop = s.shop;
    if (!shop) return `<div class="panel"><h2>🛒 상점</h2><p class="sub">오늘은 상인이 오지 않았습니다. 달력에서 다음 방문일을 확인하세요.</p></div>`;
    st.shopSeen = s.day;
    const m = MERCHANTS[shop.id];
    const head = `<div class="merch"><div class="face">${m.emoji}</div><div><div class="mn">${m.name}</div><div class="mg">${esc(shop.greet)}</div></div></div>`;
    let body;
    if (shop.gachaPrice) {
      const rates = Game.gachaRates();
      body = `<div class="gacha"><div class="machine" id="gmachine">🤖</div>
        <div class="rates">${rates.map(([n, p], i) => `<span class="r${i}">${n} ${p}%</span>`).join('')}</div>
        <p class="sub">30회 안에 유물이 안 나오면 다음 뽑기는 최고 등급 확정 (천장). 현재 ${s.pity}/30${Game.tierCap(s.day) < 4 ? `<br>※ 자판기 재고 사정으로 ${Game.tierCap(s.day) < 3 ? '8일차 전에는 시제품·유물이, 15일차 전에는 유물이' : '15일차 전에는 유물이'} 한 등급 낮게 나옵니다. 삐빅.` : ''}</p>
        <button class="btn primary big" data-act="gacha" data-n="1" ${s.res.nuts >= shop.gachaPrice ? '' : 'disabled'}>1회 뽑기 🔩${shop.gachaPrice}</button>
        <button class="btn teal big" data-act="gacha" data-n="10" ${s.res.nuts >= shop.gachaPrice * 9 ? '' : 'disabled'}>10연차 🔩${shop.gachaPrice * 9} <small>(1회 무료)</small></button></div>`;
    } else {
      body = '<div class="grid2">';
      shop.offers.forEach((o, i) => {
        body += partCard(o.id, o.q, { cls: o.sold ? 'dim' : '', desc: true, right: `<div class="price">${o.sold ? '품절' : `🔩${o.price}<button class="btn small primary" data-act="buy" data-i="${i}" ${s.res.nuts >= o.price ? '' : 'disabled'}>구매</button>`}</div>` });
      });
      body += '</div>';
      if (shop.mats.length) body += `<h2 style="margin-top:10px">재료</h2><div class="row">${shop.mats.map((o, i) => `<div class="actbox grow"><div class="t"><span>${RES[o.res].icon} ${RES[o.res].name} ×${o.qty}</span><button class="btn small primary" data-act="buymat" data-i="${i}" ${o.left > 0 && s.res.nuts >= o.price ? '' : 'disabled'}>🔩${o.price}</button></div><span class="sub">남은 수량 ${o.left}</span></div>`).join('')}</div>`;
    }
    let sell = '';
    for (const inst of s.inv.filter(i => !Game.equippedOn(i.uid)).sort((a, b) => PARTS[a.id].tier - PARTS[b.id].tier)) {
      const p = PARTS[inst.id];
      sell += `<div class="pc r${p.r}" data-act="sell" data-uid="${inst.uid}">${partImg(inst.id, 'pi', 'pe')}<div class="pb"><div class="pn">${esc(p.name)}${qTxt(inst.q)}</div><div class="pt">${SLOT_TYPE_NAME[p.slot]}</div></div><div class="price">🔩${Game.sellPrice(inst)}</div></div>`;
    }
    return `<div class="row" style="height:100%"><div class="panel grow scroll" data-scroll="shop">${head}${body}</div>
      <div class="panel" style="width:330px;display:flex;flex-direction:column;"><h2>💰 팔기 <small>클릭하면 바로 판매</small></h2><div class="cands scroll grow" data-scroll="sell">${sell || '<p class="sub">팔 수 있는 미장착 파츠가 없습니다.</p>'}</div></div></div>`;
  }

  /* ───────── 원정 ───────── */
  function tabScav() {
    const s = Game.s, ev = Game.today().ev, rain = ev && ev.type === 'rain';
    let h = `<div class="panel" style="height:100%;overflow-y:auto"><h2>🗺️ 원정 <small>활동력 ⚡을 써서 재료와 파츠를 주워 온다 · 남은 활동력 ${s.ap}</small></h2>`;
    if (rain) h += `<p style="color:var(--red)">☔ 산성비가 내려 오늘은 나갈 수 없습니다. 우산은 3초 만에 녹습니다.</p>`;
    h += '<div class="grid2">';
    for (const loc of LOCATIONS) {
      const lock = loc.unlock > s.day;
      const loot = Object.keys(loc.loot).map(k => `${RES[k].icon}${loc.loot[k][0]}~${loc.loot[k][1]}`).join(' ');
      h += `<div class="loc ${lock ? 'lock' : ''}"><div class="em">${lock ? '🔒' : loc.emoji}</div><div class="grow"><div class="ln">${loc.name} <span class="sub">${'⚡'.repeat(loc.ap)}</span></div>
        <div class="sub">${lock ? `${loc.unlock}일차에 길이 열립니다.` : esc(loc.desc)}</div>
        ${lock ? '' : `<div class="sub" style="margin-top:3px">${loot} · 파츠 ${Math.round(loc.partChance * 100)}% (${loc.tags.map(t => TAGS[t].icon).join('')}) · 위험 <span class="dmeter"><i style="width:${loc.danger * 250}%"></i></span></div>`}</div>
        <button class="btn primary" data-act="scav" data-id="${loc.id}" ${lock || rain || s.ap < loc.ap ? 'disabled' : ''}>출발</button></div>`;
    }
    return h + '</div></div>';
  }

  /* ───────── 시설 ───────── */
  function tabFac() {
    const s = Game.s, gm = Game.gateMax(), rc = Game.repairCost();
    let h = `<div class="panel" style="height:100%;overflow-y:auto"><h2>🏗️ 시설</h2>
      <div class="upg" style="margin-bottom:8px;border-color:var(--line2)"><div class="em">🛠️</div><div class="grow"><div class="un">문 수리 <span class="sub">⚡1</span></div><div class="sub">문 내구도를 최대치의 50% 회복한다. 현재 ${Math.ceil(s.gateHp)} / ${gm}</div></div>${costHTML(rc)}<button class="btn primary" data-act="repair" ${s.ap >= 1 && s.gateHp < gm && Game.canAfford(rc) ? '' : 'disabled'}>수리</button></div>`;
    h += `<div class="upg" style="margin-bottom:8px"><div class="em">🧨</div><div class="grow"><div class="un">화약 조제 <span class="sub">현재 🧨${s.res.powder}</span></div><div class="sub">고철과 점액을 섞어 화약 4개를 만든다. 특수 탄약은 쏠 때마다 화약을 먹는다 — 비싼 탄은 보스에게, 싼 탄은 잡몹에게.</div></div>${costHTML(Game.powderCost())}<button class="btn primary" data-act="mkpowder" ${Game.canAfford(Game.powderCost()) ? '' : 'disabled'}>조제</button></div>`;
    if (s.flags.dog) h += `<div class="upg" style="margin-bottom:8px"><div class="em">🐕</div><div class="grow"><div class="un">사공사 <span class="sub">대피소 마스코트</span></div><div class="sub">매일 아침 고철을 물어온다. 쓰다듬은 횟수: ${s.stats.pets}</div></div><button class="btn teal" data-act="pet">쓰다듬기</button></div>`;
    h += '<div class="grid2">';
    for (const u of UPGRADES) {
      const lv = Game.upLevel(u.id), max = lv >= u.max, cost = max ? {} : u.cost(lv);
      let pips = ''; for (let i = 0; i < u.max; i++) pips += `<i class="${i < lv ? 'on' : ''}"></i>`;
      h += `<div class="upg"><div class="em">${u.emoji}</div><div class="grow"><div class="un">${u.name} <span class="pips">${pips}</span></div><div class="sub">${max ? '최대 레벨' : esc(u.desc(lv))}</div>${max ? '' : `<div style="margin-top:2px">${costHTML(cost)}</div>`}</div>
        ${max ? '' : `<button class="btn primary" data-act="upg" data-id="${u.id}" ${Game.canAfford(cost) ? '' : 'disabled'}>건설</button>`}</div>`;
    }
    return h + '</div></div>';
  }

  /* ───────── 달력 ───────── */
  const EV_ICON = { supply: '📦', rain: '☔', recycle: '♻️', event: '❗' };
  function tabCal() {
    const s = Game.s;
    if (st.calMonth == null) st.calMonth = Math.floor((s.day - 1) / 30);
    if (st.calSel == null) st.calSel = s.day;
    const m0 = st.calMonth * 30, range = Game.forecastRange();
    let grid = '';
    for (let i = 1; i <= 30; i++) {
      const d = m0 + i, day = Game.dayObj(d), n = day.night, known = d <= s.day + range;
      const cls = (d < s.day ? 'past ' : '') + (d === s.day ? 'today ' : '') + (d === st.calSel ? 'sel ' : '') + (n.boss ? 'boss ' : '') + (n.blood ? 'blood' : '');
      const ev = day.ev ? (day.ev.type === 'merchant' ? MERCHANTS[day.ev.id].emoji : EV_ICON[day.ev.type]) : '';
      let nt;
      if (n.boss) nt = `☠️<span class="th" style="color:#ff8a7a">${ENEMIES[n.boss].name}</span>`;
      else if (!n.threat) nt = `😴<span class="th">조용한 밤</span>`;
      else nt = `<span class="skull">${(n.blood ? '🩸' : '💀').repeat(n.threat)}</span>${n.fog ? '🌫️' : ''}<span class="th">${known ? THEMES[n.theme].name : '???'}</span>`;
      grid += `<div class="cday ${cls}" data-act="calsel" data-d="${d}"><span class="dn">${d}</span><span class="ev">${ev}</span><div class="nt">${nt}</div></div>`;
    }
    // 상세
    const d = st.calSel, day = Game.dayObj(d), n = day.night, known = d <= s.day + range;
    const rel = d === s.day ? '오늘' : d === s.day + 1 ? '내일' : d > s.day ? `D-${d - s.day}` : '지난 날';
    let det = `<h2>${d}일차 <small>${rel}</small></h2><h3 style="margin:4px 0;color:var(--teal);font-family:var(--f-head);font-weight:400">☀️ 낮</h3>`;
    if (!day.ev) det += '<p class="sub">특별한 일 없음. 평화롭게 고물을 줍는 날.</p>';
    else if (day.ev.type === 'merchant') {
      const m = MERCHANTS[day.ev.id];
      det += `<p style="margin:2px 0">${m.emoji} <b>${m.name}</b> 방문</p><p class="sub">${m.gacha ? '확률형 파츠 뽑기. 천장 30회.' : m.scam ? '반값 직거래. 다만 가끔 벽돌이 온다.' : `취급: ${m.slot === 'ammo' ? '탄약 · 화약 대량' : (m.tags || []).map(t => TAGS[t].name).join('·') || '잡화'} / ${[...new Set(m.tiers)].map(t => RARITY[t].name).join('·')} 등급`}</p>`;
    } else det += `<p style="margin:2px 0">${evLabel(day.ev)}</p><p class="sub">${{ supply: '파츠 3개 중 1개를 골라 가진다.', rain: '원정을 나갈 수 없다. 총 정비의 날.', recycle: '파츠 분해 시 재료 2배.', event: '무슨 일이 생길지는 그날 가 봐야 안다.' }[day.ev.type]}</p>`;
    det += `<h3 style="margin:10px 0 4px;color:var(--teal);font-family:var(--f-head);font-weight:400">🌙 밤</h3>`;
    if (!n.threat) det += '<p class="sub">😴 습격 없음. 주민들이 문을 조금 고쳐 둔다.</p>';
    else {
      det += `<p style="margin:2px 0">위협도 <span class="skull">${(n.blood ? '🩸' : '💀').repeat(n.threat)}</span>${n.blood ? ' <b style="color:var(--red)">블러드문</b> (적 강화 · 전리품 1.5배)' : ''}${n.fog ? ' · 🌫️ 안개' : ''}</p>`;
      if (!known) det += `<p class="sub">감시탑 범위(${range}일) 밖이라 구성은 알 수 없다. 시설에서 감시탑을 올리면 더 멀리 본다.</p>`;
      else {
        det += `<p style="margin:2px 0;color:var(--amber);font-family:var(--f-head);font-size:17px">${n.boss ? '보스전' : THEMES[n.theme].name}</p>`;
        const hint = n.boss ? '🎯 대보스 화력 + 졸개 처리용 보조무기' : THEMES[n.theme].hint;
        if (hint) det += `<p class="sub" style="margin:0 0 4px;color:var(--teal)">추천: ${hint}</p>`;
        det += '<div class="elist">';
        const types = [];
        if (n.boss) types.push(n.boss);
        for (const t in THEMES[n.theme].types) if (ENEMIES[t].unlock <= d) types.push(t);
        for (const t of types.slice(0, 6)) det += `<div class="eitem"><canvas width="64" height="64" data-enemy="${t}"></canvas><div><div class="en">${ENEMIES[t].name}</div><div class="ed">${esc(ENEMIES[t].desc)}</div></div></div>`;
        det += '</div>';
      }
    }
    return `<div class="row" style="height:100%"><div class="panel grow"><h2>📅 ${st.calMonth + 1}번째 달 <small>날짜를 눌러 예보 확인</small><span class="grow"></span>
      <button class="btn small" data-act="calmon" data-m="-1" ${st.calMonth > 0 ? '' : 'disabled'}>◀</button><button class="btn small" data-act="calmon" data-m="1">▶</button></h2>
      <div class="cal">${grid}</div><p class="sub" style="margin-top:8px">💀 위협도 · 🩸 블러드문 · ☠️ 보스 · 😴 조용한 밤 · 🧔🥕🤖🎒🪖👩‍🔬🧙‍♀️ 상인 · 📦 보급 · ❗ 사건 · ☔ 산성비 · ♻️ 분리수거</p></div>
      <div class="panel scroll" style="width:330px;" data-scroll="cald">${det}</div></div>`;
  }
  function drawEnemyIcons() {
    if (!window.Art) return;
    for (const c of $$('canvas[data-enemy]')) {
      const def = ENEMIES[c.dataset.enemy], g = c.getContext('2d');
      const k = Math.min(2, 58 / def.w, 58 / def.h);
      g.imageSmoothingEnabled = false;
      g.save(); g.translate(32, 60 - (58 - def.h * k) / 2); g.scale(k, k);
      try { Art.enemy(g, { def, type: def.id, x: 0, y: def.fly ? -4 : 0, w: def.w, h: def.h, walk: 1, atk: 0, flash: 0, state: def.fly ? 'fly' : 'walk', die: 0, hpFrac: 1, elite: false, fx: {}, shield: 1, phase: 1, weak: false, seed: 0.4, mini: false }, 1.3); } catch (e) { /* noop */ }
      g.restore();
    }
  }

  /* ───────── 도감 ───────── */
  function tabCodex() {
    const s = Game.s, known = Object.keys(s.bp).length;
    let h = `<div class="panel" style="height:100%;overflow-y:auto"><h2>📖 도감 <small>파츠 ${known} / ${PART_LIST.length}</small></h2>
      <div class="rs" style="grid-template-columns:repeat(6,1fr)"><div><div class="n">${s.stats.kills}</div><div class="l">총 처치</div></div><div><div class="n">${s.stats.heads}</div><div class="l">헤드샷</div></div><div><div class="n">${s.stats.bestCombo}</div><div class="l">최대 연속 처치</div></div><div><div class="n">${s.stats.gacha}</div><div class="l">뽑기 횟수</div></div><div><div class="n">${s.stats.bricks}</div><div class="l">받은 벽돌</div></div><div><div class="n">${s.stats.crafted}</div><div class="l">제작한 파츠</div></div></div>`;
    for (const sl of ['receiver', 'barrel', 'mag', 'stock', 'sight', 'muzzle', 'ammo', 'acc']) {
      h += `<h2 style="margin-top:10px;font-size:16px">${SLOT_TYPE_NAME[sl]}</h2><div class="codex">`;
      for (const p of PART_LIST.filter(x => x.slot === sl)) {
        const u = s.bp[p.id] ? iconURL(p.id) : null;
        h += s.bp[p.id] ? `<div class="cx r${p.r}" title="${esc(p.name)} — ${esc(p.desc)}">${u ? `<img src="${u}" alt="">` : esc(p.name.slice(0, 3))}</div>` : `<div class="cx unk" title="미발견">?</div>`;
      }
      h += '</div>';
    }
    h += `<h2 style="margin-top:14px">☣️ 돌연변이 도감</h2><div class="grid2">`;
    for (const k in ENEMIES) {
      const e = ENEMIES[k];
      if (e.dummy) continue;
      const seen = (s.seen || {})[k];
      h += `<div class="eitem">${seen ? `<canvas width="64" height="64" data-enemy="${k}"></canvas>` : '<div style="width:64px;height:64px;font-size:34px;text-align:center;line-height:64px;opacity:.4">❓</div>'}<div><div class="en">${seen ? e.name + (e.title ? ` <span class="sub">${e.title}</span>` : '') : '???'}</div><div class="ed">${seen ? esc(e.desc) : '아직 마주친 적 없음.'}</div></div></div>`;
    }
    return h + '</div></div>';
  }
  const TABS = { bench: tabBench, inv: tabInv, shop: tabShop, scav: tabScav, fac: tabFac, cal: tabCal, codex: tabCodex };

  /* ───────── 아침 ───────── */
  function morning() {
    const s = Game.s, m = s.morning;
    if (m && m.shown) { if (m.supply) supplyModal(m.supply); else if (m.event) eventModal(m.event); return; }
    if (!m) return;
    m.shown = true; Game.save();
    snd('day_start');
    const lines = Game.broadcastText();
    modal(`<div class="bc"><div class="face">👴</div><div class="lines"><h1>📢 ${s.day}일차 아침 방송</h1>${lines.map((l, i) => `<p style="animation-delay:${0.15 + i * 0.3}s">${esc(l)}</p>`).join('')}${m.notes.map(n => `<div class="note">${esc(n)}</div>`).join('')}</div></div>${okFoot('알겠습니다')}`,
      { ok() { closeModal(); if (m.supply) supplyModal(m.supply); else if (m.event) eventModal(m.event); else if (s.day === 1) firstHelp(); } });
  }
  function firstHelp() { modal(HOWTO + okFoot('문은 내가 지킨다'), { ok: closeModal }); }
  function crateHTML(list) { return `<div class="crate">${list.map((c, i) => partCard(c.id, c.q, { act: 'pick', attrs: `data-i="${i}"`, desc: true })).join('')}</div>`; }
  function supplyModal(list) {
    snd('pickup');
    modal(`<h1>📦 보급 투하</h1><p>낙하산에 매달린 상자가 문 앞에 떨어졌다. 발신인 불명. 하나만 가져갈 수 있다. (나머지는 "규정상" 회수된다고 적혀 있다.)</p>${crateHTML(list)}`, {
      pick(d) { const c = list[+d.i]; Game.addPart(c.id, c.q); Game.s.morning.supply = null; Game.save(); snd('equip'); closeModal(); toast(`'${PARTS[c.id].name}' 획득!`); render(); },
    });
  }
  function eventModal(id) {
    const ev = EVENTS[id];
    if (!ev) { Game.s.morning.event = null; return; }
    snd('broadcast');
    modal(`<div class="big-em">${ev.emoji}</div><h1>${ev.title}</h1><p>${esc(ev.text)}</p><div class="choices">${ev.choices.map((c, i) => `<button class="btn" data-act="choose" data-i="${i}" ${c.can && !c.can(Game) ? 'disabled' : ''}>${esc(c.label)}${c.hint ? `<small>${esc(c.hint)}</small>` : ''}</button>`).join('')}</div>`, {
      choose(d) {
        const txt = ev.choices[+d.i].run(Game);
        Game.s.morning.event = null; Game.save();
        modal(`<div class="big-em">${ev.emoji}</div><h1>${ev.title}</h1><p>${esc(txt)}</p>${okFoot()}`, { ok() { closeModal(); render(); } });
      },
    });
  }

  /* ───────── 밤 / 전투 ───────── */
  function goNight() {
    const s = Game.s, n = Game.today().night;
    if (!Game.gunStats(0)) { toast('주무기에 몸통이 없습니다! 작업대에서 총을 조립하세요.', true); st.tab = 'bench'; st.gi = 0; render(); return; }
    const go = () => { closeModal(); if (!n.threat) quietNight(); else startCombat(); };
    const ev = Game.today().ev, rain = ev && ev.type === 'rain';
    if (s.morning && (s.morning.supply || s.morning.event)) { if (s.morning.supply) supplyModal(s.morning.supply); else eventModal(s.morning.event); return; }
    if (!n.threat) { if (s.ap > 0 && !rain) modal(`<h1>아직 해가 중천입니다</h1><p>활동력이 ⚡${s.ap} 남았습니다. 오늘 밤은 조용할 예정이지만, 원정이나 수리를 더 할 수 있습니다.</p><div class="foot"><button class="btn" data-act="no">조금 더 준비한다</button><button class="btn primary" data-act="yes">잠자리에 든다</button></div>`, { yes: go, no: closeModal }); else go(); return; }
    // 출격 전 점검: 오늘 밤의 적과 내 총의 역할이 맞는지 한눈에
    const gunRow = (gi, label) => { const g = Game.gunStats(gi); if (!g) return `<div class="eitem"><div style="width:120px" class="sub">${label}</div><div class="sub">— 비어 있음 —</div></div>`; let img = ''; try { const u = GunArt.gunURL(g.ids, 150, 50); if (u) img = `<img src="${u}" alt="" style="width:150px;height:50px;image-rendering:pixelated">`; } catch (e) { /* noop */ } return `<div class="eitem">${img}<div><div class="en">${label} · ${esc(g.name)}</div><div class="ed">🎯 대보스 ${Math.round(g.dpsElite)} · 🐜 대군중 ${Math.round(g.dpsSwarm)} · ${g.ammoCost ? `🧨 ${esc(g.ammoName)} ${g.ammoCost.toFixed(2)}/발 (${Math.floor(s.res.powder / g.ammoCost)}발분)` : '무료 탄약'}</div></div></div>`; };
    const th = THEMES[n.theme], hint = n.boss ? '🎯 대보스 화력 + 졸개 처리용 보조무기' : (th && th.hint) || '';
    modal(`<h1>🌙 ${s.day}일차 밤 — ${n.boss ? '보스: ' + ENEMIES[n.boss].name : th ? th.name : ''}</h1>
      <p style="margin:2px 0">위협도 <span class="skull">${(n.blood ? '🩸' : '💀').repeat(n.threat)}</span>${n.blood ? ' 블러드문' : ''}${n.fog ? ' · 🌫️ 안개' : ''}${s.heat ? ` · 🔥 악명 ${s.heat}` : ''}${hint ? ` &nbsp;—&nbsp; <span style="color:var(--teal)">추천: ${hint}</span>` : ''}</p>
      <div class="elist">${gunRow(0, '[1] 주무기')}${gunRow(1, '[2] 보조')}${s.up.turret ? gunRow(2, '🤖 포탑') : ''}</div>
      <p class="sub" style="margin-top:8px">보유 화약 🧨${s.res.powder}${s.ap > 0 && !rain ? ` · <span style="color:var(--amber)">활동력 ⚡${s.ap} 이 남았습니다 (원정·수리 가능)</span>` : ''}${s.quest ? ` · 📋 ${esc(QUESTS[s.quest.id].text(s.quest.n))}` : ''}</p>
      <div class="foot"><button class="btn" data-act="no">조금 더 준비한다</button><button class="btn primary big" data-act="yes">출격</button></div>`, { yes: go, no: closeModal });
  }
  function quietNight() {
    const lines = ['멀리서 뭔가 울부짖었지만, 문 앞까지 오지는 않았다.', '이장님의 코 고는 소리가 유일한 위협이었다.', '모처럼 깊이 잤다. 꿈에서도 총을 조립했다.', '주민들이 밤새 문을 조금 고쳐 놓았다.'];
    modal(`<div class="big-em">😴</div><h1>조용한 밤</h1><p>${U.pick(lines)}</p><p class="note">문 내구도가 조금 회복되었다.</p>${okFoot('아침이 밝았다')}`, { ok() { closeModal(); Game.nextDay(); showBase(); } });
  }
  function startCombat(rangeMode) {
    stopBg(); stopPreview();
    el('screen-base').classList.add('hidden');
    stage.classList.add('combat');
    const cfg = Game.combatConfig();
    if (rangeMode) {
      cfg.mode = 'range';
      const a = Game.gunStats(st.gi), others = [0, 1, 2].filter(i => i !== st.gi).map(i => Game.gunStats(i)).filter(Boolean);
      cfg.guns = [a].concat(others).slice(0, 2); cfg.turret = null;
      cfg.onEnd = () => showBase();
    } else cfg.onEnd = onCombatEnd;
    cfg.onPause = showPause;
    Combat.start(cfg);
  }
  function showPause(p) {
    const o = el('pause');
    if (!p) { o.classList.add('hidden'); return; }
    o.classList.remove('hidden');
    o.innerHTML = `<div class="modal" style="text-align:center"><h1>⏸ 일시정지</h1>${volHTML()}<div class="foot" style="justify-content:center"><button class="btn primary big" data-act="resume">계속하기</button><button class="btn danger" data-act="giveup">${Game.s && el('stage').classList.contains('combat') ? '나가기 / 포기' : '포기'}</button></div><p class="sub">포기하면 함락으로 처리됩니다 (시험 사격장은 그냥 나갑니다).</p></div>`;
  }
  function onCombatEnd(res) {
    const s = Game.s, out = Game.applyCombat(res);
    const stats = `<div class="rs"><div><div class="n">${res.kills}</div><div class="l">처치</div></div><div><div class="n">${res.acc}%</div><div class="l">명중률</div></div><div><div class="n">${res.heads}</div><div class="l">헤드샷</div></div><div><div class="n">${res.maxCombo}</div><div class="l">최대 연속</div></div></div>`;
    const loot = `<div class="loot"><span>🔩 +${res.finalNuts}${res.clearBonus ? ` <small class="sub">(+방어 수당 ${res.clearBonus})</small>` : ''}${res.spent ? ` <small class="sub">(과금탄 -${res.spent})</small>` : ''}</span>${lootHTML(res.mats)}${res.powderSpent ? `<span style="color:var(--red)">🧨 -${res.powderSpent} <small class="sub">(탄약값)</small></span>` : ''}</div>`;
    const next = () => { closeModal(); if (s.over) return gameOver(); if (out.victory) return victory(); Game.nextDay(); showBase(); };
    if (res.win) {
      snd('victory');
      const gradeTxt = { S: '무결점 방어! 너트 +30%', A: '훌륭한 방어. 너트 +15%', B: '무난한 방어. 너트 +5%', C: '아슬아슬했다.', D: '문이 너덜너덜하다.' }[res.grade];
      const parcels = out.parcels.length ? `<h3>📦 택배 상자</h3><div class="grid2">${out.parcels.map(i => partCard(i.id, i.q, {})).join('')}</div>` : '';
      modal(`<div class="row" style="align-items:center"><div class="grade ${res.grade}">${res.grade}</div><div><h1>${s.day}일차 밤 방어 성공</h1><p class="sub" style="margin:0">${gradeTxt}</p></div></div>${stats}${loot}${parcels}
        ${out.heatDelta > 0 ? `<p class="note" style="color:var(--amber2)">🔥 악명 ${out.heat}단계 — 흠집 하나 없는 방어에 놈들이 이를 간다. 다음 무리가 커지고 너트도 늘어난다.</p>` : out.heatDelta < 0 ? `<p class="note">🔥 악명이 ${out.heat}단계로 가라앉았다. 놈들이 방심한다.</p>` : ''}
        ${out.quest ? `<p class="note" style="font-size:16px;color:${out.quest.ok ? 'var(--green)' : 'var(--mute)'}">📋 의뢰 「${esc(out.quest.text)}」 — ${out.quest.ok ? `달성! 🔩+${out.quest.nuts}${out.quest.part ? ` · 📦 ${esc(PARTS[out.quest.part.id].name)}` : ''}` : '실패'}</p>` : ''}
        <h3>🎁 전리품 상자 — 하나를 고르세요</h3>${crateHTML(out.crate)}`, {
        pick(d) { const c = out.crate[+d.i]; Game.addPart(c.id, c.q); snd('equip'); toast(`'${PARTS[c.id].name}' 획득!`); next(); },
      });
    } else {
      modal(`<div class="row" style="align-items:center"><div class="grade F">F</div><div><h1>함락!</h1><p class="sub" style="margin:0">${U.pick(DEATH_QUIPS)}</p></div></div>${stats}${loot}
        <h3 style="color:var(--red)">놈들이 창고를 털어 갔다</h3><div class="loot">${lootHTML(Object.fromEntries(Object.entries(out.lost).map(([k, v]) => [k, -v]))) || '<span class="sub">털어갈 것도 없었다.</span>'}</div>
        ${out.rematch ? '<p style="color:var(--amber)">조합장이 확성기로 외친다. "내일 다시 온다! 도장 준비해 놔라!" — 내일 밤 재대결.</p>' : ''}
        <p>남은 목숨: <span style="color:#ff5a6a">${'❤'.repeat(Math.max(0, s.lives)) || '없음'}</span></p>${okFoot(s.over ? '...' : '비상 격벽을 내린다', 'danger')}`, { ok: next });
    }
  }
  function gameOver() {
    const s = Game.s;
    snd('sad_trombone'); music('title');
    stage.classList.remove('combat');
    modal(`<div class="big-em">🪦</div><h1>대피소 404: 찾을 수 없음</h1><p>${s.day}일차, 마지막 격벽이 무너졌다. 이장님의 마지막 방송은 "에- 또..." 로 시작해서 끝나지 않았다.</p>
      <div class="rs"><div><div class="n">${s.day}</div><div class="l">버틴 날</div></div><div><div class="n">${s.stats.kills}</div><div class="l">총 처치</div></div><div><div class="n">${s.stats.heads}</div><div class="l">헤드샷</div></div><div><div class="n">${Object.keys(s.bp).length}</div><div class="l">발견한 파츠</div></div></div>${okFoot('타이틀로')}`,
      { ok() { closeModal(); Game.wipe(); Game.s = null; showTitle(); } });
  }
  // adv: 이미 다음 날로 넘어간 상태(결과창에서 새로고침한 경우)에서 엔딩만 보여 줄 때
  function victory(adv) {
    snd('victory'); snd('airhorn');
    modal(`<div class="big-em">🏆</div><h1>대피소 404 를 지켜냈다!</h1><p>재개발 조합장의 포크레인은 고철 ${Game.s.res.scrap}개 중 일부가 되었다. 이장님은 이 날을 '총포상의 날'로 선포하고 사흘 내내 방송으로 자랑했다.</p>
      <p>정부 기록에 이 대피소는 여전히 "404: 찾을 수 없음" 이다. 하지만 돌연변이들 사이에서는 이제 다른 이름으로 불린다 — <b style="color:var(--amber)">"절대 가지 마"</b>.</p>
      <div class="rs"><div><div class="n">${Game.s.stats.kills}</div><div class="l">총 처치</div></div><div><div class="n">${Game.s.stats.heads}</div><div class="l">헤드샷</div></div><div><div class="n">${Game.s.stats.bestCombo}</div><div class="l">최대 연속</div></div><div><div class="n">${Object.keys(Game.s.bp).length}/${PART_LIST.length}</div><div class="l">파츠 수집</div></div></div>
      <p class="sub">31일차부터는 무한 모드입니다. 놈들은 계속 강해집니다. 당신의 총도 그렇습니다.</p>${okFoot('계속 지킨다 (무한 모드)')}`, { ok() { closeModal(); Game.s.pendingVictory = false; if (adv) Game.save(); else Game.nextDay(); showBase(); } });
  }

  /* ───────── 용어 사전 ───────── */
  function glossary(i) {
    const G = window.GLOSSARY;
    if (!G || !G.length) { modal(HOWTO + okFoot(), { ok: closeModal }); return; }
    i = Math.max(0, Math.min(G.length - 1, i || 0));
    const sec = G[i];
    modal(`<h1>📖 용어 사전</h1><div class="filters">${G.map((x, k) => `<button class="btn small ${k === i ? 'sel' : ''}" data-act="gsec" data-i="${k}">${x.icon || ''} ${esc(x.title)}</button>`).join('')}</div>
      <div class="gloss">${sec.items.map(it => `<div class="gi"><b>${esc(it.k)}</b><span>${esc(it.v)}</span></div>`).join('')}</div>${okFoot('닫기')}`,
      { ok: closeModal, gsec(d) { glossary(+d.i); } }, 'wide');
  }

  /* ───────── 설정 ───────── */
  function volHTML() {
    const v = k => { try { return Math.round(Sound.getVolume(k) * 100); } catch (e) { return 80; } };
    return ['master', 'sfx', 'music'].map(k => `<div class="vol"><span style="width:80px">${{ master: '전체', sfx: '효과음', music: '음악' }[k]}</span><input type="range" min="0" max="100" value="${v(k)}" data-vol="${k}"></div>`).join('');
  }
  function settings() {
    modal(`<h1>⚙️ 설정</h1>${volHTML()}<div class="foot"><button class="btn danger small" data-act="wipe">저장 데이터 삭제</button>${fsBtn()}<button class="btn primary" data-act="ok">닫기</button></div>`, {
      ok: closeModal, fullscreen: toggleFS,
      wipe() { modal(`<h1>정말 삭제할까요?</h1><p>모든 진행 상황이 사라집니다. 이장님도 사라집니다.</p><div class="foot"><button class="btn" data-act="no">취소</button><button class="btn danger" data-act="yes">삭제</button></div>`, { no: closeModal, yes() { Game.wipe(); Game.s = null; closeModal(); showTitle(); } }); },
    });
  }

  // 전체화면 (지원하는 브라우저에서만 버튼이 보인다. 아이폰 사파리는 미지원 → 홈 화면에 추가하면 전체화면)
  const fsRoot = document.documentElement;
  const fsOK = () => !!(fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen);
  function toggleFS() {
    const d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      const p = (fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen).call(fsRoot);
      const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* noop */ } };
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } catch (e) { /* noop */ }
  }
  const fsBtn = cls => fsOK() ? `<button class="btn small ${cls || ''}" data-act="fullscreen">⛶ 전체화면</button>` : '';

  /* ───────── 액션 ───────── */
  const ACT = {
    fullscreen: toggleFS,
    diff(d) { st.diff = d.d; showTitle(); },
    newgame() {
      const go = () => { closeModal(); Game.newGame(st.diff); st.tab = 'bench'; st.gi = 0; st.slot = 'barrel'; st.calSel = null; st.calMonth = null; showBase(); };
      if (Game.hasSave()) modal(`<h1>새 게임</h1><p>기존 저장 데이터를 덮어씁니다. 괜찮습니까?</p><div class="foot"><button class="btn" data-act="no">취소</button><button class="btn primary" data-act="yes">새로 시작</button></div>`, { yes: go, no: closeModal });
      else go();
    },
    continue() { if (Game.load()) { st.calSel = null; st.calMonth = null; if (Game.s.over) { Game.wipe(); Game.s = null; showTitle(); return; } showBase(); } else toast('저장 데이터를 읽을 수 없습니다.', true); },
    howto() { modal(HOWTO + `<div class="foot"><button class="btn" data-act="gl">📖 용어 사전</button><button class="btn primary" data-act="ok">확인</button></div>`, { ok: closeModal, gl() { glossary(0); } }); },
    glossary() { glossary(0); },
    settings,
    totitle() { Game.save(); showTitle(); },
    tab(d) { if (d.tab === 'shop' && !Game.s.shop) { toast('오늘은 상인이 없습니다.', true); return; } st.tab = d.tab; snd('ui_tab'); if (d.tab === 'cal') { st.calSel = Game.s.day; st.calMonth = Math.floor((Game.s.day - 1) / 30); } render(); },
    gun(d) { st.gi = +d.gi; render(); },
    slot(d) { st.slot = d.slot; render(); },
    equip(d) {
      const uid = +d.uid, g = Game.s.guns[st.gi];
      if (g.slots[st.slot] === uid) { Game.unequip(st.gi, st.slot); snd('unequip'); }
      else if (Game.equip(st.gi, st.slot, uid)) { snd('equip'); pvFlash = 0.5; }
      Game.save(); render();
    },
    rename() {
      const g = Game.s.guns[st.gi], gs = Game.gunStats(st.gi);
      if (!gs) return;
      modal(`<h1>✎ 총 이름 짓기</h1><p class="sub">비워 두면 파츠 구성에 따라 자동으로 지어집니다.</p><input id="gname-in" maxlength="24" value="${esc(g.name || gs.name)}" style="width:100%;font-size:20px;padding:8px 10px;background:#12100d;color:var(--amber);border:2px solid var(--line2);border-radius:6px;font-family:var(--f-head)"><div class="foot"><button class="btn" data-act="auto">자동 이름</button><button class="btn primary" data-act="ok">확정</button></div>`, {
        ok() { const v = el('gname-in').value.trim().slice(0, 24); g.name = v && v !== Gun.autoName(gs) ? v : null; closeModal(); Game.save(); render(); },
        auto() { g.name = null; closeModal(); Game.save(); render(); },
      });
      setTimeout(() => { const i = el('gname-in'); if (i) { i.focus(); i.select(); } }, 30);
    },
    randgun() {
      const s = Game.s, g = s.guns[st.gi];
      for (const sl of SLOTS) {
        const pool = s.inv.filter(i => PARTS[i.id].slot === sl.type && (!Game.equippedOn(i.uid) || Game.equippedOn(i.uid).gi === st.gi && Game.equippedOn(i.uid).slot === sl.id));
        if (!pool.length) continue;
        if (sl.id !== 'receiver' && Math.random() < 0.08) { Game.unequip(st.gi, sl.id); continue; }
        Game.equip(st.gi, sl.id, U.pick(pool).uid);
      }
      g.name = null; snd('equip'); snd('craft'); pvFlash = 0.6;
      const gs = Game.gunStats(st.gi);
      if (gs) toast(`🎲 '${gs.name}' 완성. 이게... 총?`);
      Game.save(); render();
    },
    psave() {
      const gs = Game.gunStats(st.gi);
      if (!gs) return;
      modal(`<h1>💾 프리셋 저장</h1><p class="sub">예: "대보스용", "바퀴 잡이", "월급날". 나중에 한 번에 불러올 수 있습니다.</p><input id="pname-in" maxlength="20" value="${esc(gs.name.slice(0, 20))}" style="width:100%;font-size:20px;padding:8px 10px;background:#12100d;color:var(--amber);border:2px solid var(--line2);border-radius:6px;font-family:var(--f-head)"><div class="foot"><button class="btn" data-act="no">취소</button><button class="btn primary" data-act="ok">저장</button></div>`, {
        no: closeModal,
        ok() { Game.savePreset(st.gi, el('pname-in').value.trim()); closeModal(); snd('equip'); toast('프리셋 저장 완료'); render(); },
      });
      setTimeout(() => { const i = el('pname-in'); if (i) { i.focus(); i.select(); } }, 30);
    },
    pload(d) {
      const pr = Game.s.presets[+d.i], r = Game.loadPreset(st.gi, +d.i);
      if (!r) return;
      snd('equip'); pvFlash = 0.6;
      toast(`'${pr.name}' 불러옴` + (r.miss ? ` · 없어진 파츠 ${r.miss}개는 비워 둠` : ''), r.miss > 0 && r.ok === 0);
      render();
    },
    pdel(d) { Game.delPreset(+d.i); render(); },
    mkpowder() { if (Game.makePowder()) { snd('craft'); toast('화약 🧨+4'); render(); } },
    dryfire() { const gs = Game.gunStats(st.gi); if (!gs) return; pvFlash = 1; try { Sound.gun(gs.snd); } catch (e) { /* noop */ } },
    range() { if (Game.gunStats(st.gi)) startCombat(true); },
    filter(d) { st.filter = d.f; render(); },
    rolef(d) { st.roleF = d.f; render(); },
    invtab(d) { st.invTab = d.t; render(); },
    invsel(d) { st.invSel = +d.uid; const i = Game.inst(st.invSel); if (i) i.isNew = false; render(); },
    enhance(d) {
      const inst = Game.inst(+d.uid), r = Game.enhance(+d.uid);
      if (!r) return;
      const name = PARTS[inst.id].name;
      if (r.ok) { snd(r.great ? 'upgrade_great' : 'upgrade_ok'); toast(r.great ? `✨ 대성공!! ${name} +${inst.q} ✨` : `강화 성공! ${name} +${inst.q}`); }
      else { snd('upgrade_fail'); toast(r.down ? `강화 실패... ${name} 이(가) +${inst.q} 로 하락했다` : `강화 실패. 장인의 혼이 부족했다.`, true); }
      Game.save(); render();
    },
    dismantle(d) { const inst = Game.inst(+d.uid); if (!inst) return; const y = Game.dismantle(+d.uid); snd('dismantle'); toast('분해: ' + Object.keys(y).map(k => RES[k].icon + '+' + y[k]).join(' ')); st.invSel = null; Game.save(); render(); },
    bulk() {
      const list = Game.s.inv.filter(i => !Game.equippedOn(i.uid) && PARTS[i.id].tier === 0 && PARTS[i.id].r === 0 && !i.q);
      if (!list.length) { toast('분해할 미장착 고물 파츠가 없습니다.', true); return; }
      modal(`<h1>일괄 분해</h1><p>미장착 '고물' 등급 파츠 ${list.length}개를 분해합니다.</p><div class="foot"><button class="btn" data-act="no">취소</button><button class="btn danger" data-act="yes">분해</button></div>`, { no: closeModal, yes() { const tot = {}; for (const i of list) { const y = Game.dismantle(i.uid); for (const k in y) tot[k] = (tot[k] || 0) + y[k]; } snd('dismantle'); closeModal(); toast('분해: ' + Object.keys(tot).map(k => RES[k].icon + '+' + tot[k]).join(' ')); Game.save(); render(); } });
    },
    craft(d) { const inst = Game.craft(d.id); if (inst) { snd('craft'); toast(`'${PARTS[d.id].name}' 제작 완료`); Game.save(); render(); } },
    buy(d) {
      const o = Game.s.shop.offers[+d.i], r = Game.buyOffer(+d.i);
      if (!r) return;
      if (r.scam) {
        snd('sad_trombone');
        modal(`<div class="big-em">🧱</div><h1>택배 상자를 열어 보니...</h1><p>'${PARTS[r.wanted].name}' 대신 <b>벽돌</b>이 들어 있었다. 판매자는 이미 채팅방을 나갔다.</p><p class="sub">(벽돌은 의외로 개머리판으로 쓸 수 있습니다. 진짜로.)</p>${okFoot('...당했다')}`, { ok() { closeModal(); render(); } });
      } else { snd('buy'); toast(`'${PARTS[o.id].name}' 구매!`); render(); }
    },
    buymat(d) { if (Game.buyMat(+d.i)) { snd('buy'); Game.save(); render(); } },
    sell(d) { const inst = Game.inst(+d.uid); if (!inst) return; const n = PARTS[inst.id].name, v = Game.sell(+d.uid); snd('sell'); toast(`'${n}' 판매 🔩+${v}`); Game.save(); render(); },
    gacha(d) {
      const n = +d.n, mc = el('gmachine');
      if (!Game.s.shop || Game.s.res.nuts < Game.s.shop.gachaPrice * (n >= 10 ? 9 : n)) return;
      if (mc) mc.classList.add('shake');
      snd('gacha_roll');
      curModal = { acts: {} }; // 연타 방지
      setTimeout(() => {
        curModal = null;
        const list = Game.gacha(n);
        if (!list) { render(); return; }
        const best = Math.max(...list.map(i => PARTS[i.id].r === 5 ? 3.5 : PARTS[i.id].tier));
        snd(best >= 4 ? 'gacha_legend' : best >= 3 ? 'gacha_rare' : 'gacha_common');
        if (best >= 4) snd('airhorn', { vol: 0.5 });
        modal(`<h1>${best >= 4 ? '🎉 유물이다!! 🎉' : best >= 3 ? '✨ 괜찮은데? ✨' : '삐빅. 이용해 주셔서 감사합니다.'}</h1><div class="pulls" style="grid-template-columns:repeat(${Math.min(5, list.length)},1fr)">${list.map((i, k) => `<div class="pull r${PARTS[i.id].r}" style="animation-delay:${k * 0.08}s">${iconURL(i.id) ? `<img src="${iconURL(i.id)}" alt="">` : ''}<div class="n">${esc(PARTS[i.id].name)}</div><div class="sub">${RARITY[PARTS[i.id].r].name}</div></div>`).join('')}</div>${okFoot()}`, { ok() { closeModal(); render(); } });
      }, 850);
    },
    scav(d) {
      const r = Game.scavenge(d.id);
      if (!r) return;
      snd(r.mishap ? 'gate_hit' : 'pickup');
      modal(`<div class="big-em">${r.loc.emoji}</div><h1>${r.loc.name} 원정</h1><p>${esc(r.line)}</p><div class="loot">${lootHTML(r.loot)}</div>
        ${r.part ? `<h3>파츠 발견!</h3>${partCard(r.part.id, r.part.q, { desc: true })}` : ''}${r.jackpot ? `<h3 style="color:var(--amber)">✨ 대박! 숨겨진 금고를 찾았다</h3>${partCard(r.jackpot.id, r.jackpot.q, { desc: true })}` : ''}
        ${r.mishap ? `<p style="color:var(--red)">⚠ ${esc(r.mishap)}</p>` : ''}${okFoot()}`, { ok() { closeModal(); render(); } });
    },
    upg(d) { if (Game.buyUpgrade(d.id)) { snd('craft'); toast('건설 완료!'); render(); } },
    repair() { if (Game.repair()) { snd('craft'); toast('문을 수리했다.'); render(); } },
    pet() { Game.s.stats.pets++; snd('bark'); snd('pet'); toast(U.pick(['🐕 멍! (꼬리가 프로펠러처럼 돈다)', '🐕 사공사가 배를 보여 준다', '🐕 헥헥헥', '🐕 사공사가 당신의 손을 핥았다. 살짝 따끔하다.'])); Game.save(); render(); },
    calsel(d) { st.calSel = +d.d; render(); },
    calmon(d) { st.calMonth = Math.max(0, st.calMonth + (+d.m)); st.calSel = st.calMonth * 30 + 1; if (Math.floor((Game.s.day - 1) / 30) === st.calMonth) st.calSel = Game.s.day; render(); },
    night: goNight,
    resume() { Combat.setPaused(false); },
    giveup() { el('pause').classList.add('hidden'); Combat.abort(); },
  };

  function fit() {
    const k = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = `scale(${k})`;
    stage.style.left = Math.round((window.innerWidth - 1280 * k) / 2) + 'px';
    stage.style.top = Math.round((window.innerHeight - 720 * k) / 2) + 'px';
    // 터치 기기를 세로로 들면 '가로로 돌려 주세요' 안내가 덮으므로 전투는 멈춰 둔다
    try { if (window.innerHeight > window.innerWidth && matchMedia('(hover: none) and (pointer: coarse)').matches && Combat.isRunning() && !Combat.isPaused()) Combat.setPaused(true); } catch (e) { /* noop */ }
  }
  function init() {
    stage = el('stage');
    try { if (matchMedia('(hover: none) and (pointer: coarse)').matches) { stage.classList.add('touch'); lastPT = 'touch'; } } catch (e) { /* noop */ }
    document.addEventListener('gesturestart', ev => ev.preventDefault()); // iOS 핀치 확대 막기
    fit(); window.addEventListener('resize', fit);
    document.addEventListener('pointerdown', () => { try { if (window.Sound) Sound.init(); } catch (e) { /* noop */ } });
    document.addEventListener('click', ev => {
      const t = ev.target.closest('[data-act]');
      if (!t || t.disabled) return;
      const act = t.dataset.act;
      if (curModal) { if (curModal.acts[act]) { snd('ui_click'); curModal.acts[act](t.dataset, t); } return; }
      if (act === 'equip' && lastPT === 'touch' && t.dataset.cmp && st.tab === 'bench') { // 터치: 첫 탭은 비교만
        const box = el('statbox');
        if (box && box.dataset.cmp !== t.dataset.uid) {
          box.dataset.cmp = t.dataset.uid; box.innerHTML = statsHTML(Game.gunStats(st.gi), cmpStats(+t.dataset.uid));
          document.querySelectorAll('.pc.cmping').forEach(x => x.classList.remove('cmping')); t.classList.add('cmping');
          snd('ui_click'); return;
        }
      }
      if (ACT[act]) { if (!['equip', 'dryfire', 'gacha', 'buy', 'sell', 'craft', 'enhance', 'dismantle', 'pet', 'tab'].includes(act)) snd('ui_click'); ACT[act](t.dataset, t); }
    });
    document.addEventListener('input', ev => { const k = ev.target.dataset && ev.target.dataset.vol; if (k) { try { Sound.setVolume(k, ev.target.value / 100); } catch (e) { /* noop */ } } });
    document.addEventListener('keydown', ev => {
      // Enter 만 확인으로 쓴다 (Space 는 전투에서 수류탄 키라 결과창을 실수로 넘기기 쉽다). 키 반복·방금 뜬 창은 무시.
      if (ev.repeat || ev.key !== 'Enter') return;
      if (curModal && curModal.acts.ok && performance.now() - (curModal.t || 0) > 400 && !el('overlay').classList.contains('hidden')) { ev.preventDefault(); snd('ui_click'); curModal.acts.ok({}); }
    });
    window.addEventListener('beforeunload', () => { if (Game.s && !Game.s.over && !stage.classList.contains('combat')) Game.save(); });
    // 호버 설명: 브라우저 기본 title 말풍선(느림) 대신 게임 안 말풍선을 즉시 띄운다
    const tip = document.createElement('div'); tip.id = 'tip'; tip.className = 'hidden'; stage.appendChild(tip);
    let tipEl = null;
    const tipHide = () => { tipEl = null; tip.classList.add('hidden'); };
    const tipMove = ev => {
      const r = stage.getBoundingClientRect(), k = r.width / 1280;
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let x = (ev.clientX - r.left) / k + 14, y = (ev.clientY - r.top) / k + 18;
      if (ev.above) { x = (ev.clientX - r.left) / k - w / 2; y = (ev.clientY - r.top) / k - h - 56; if (y < 8) y = (ev.clientY - r.top) / k + 56; }
      x = Math.max(8, x);
      if (x + w > 1272) x = Math.max(8, x - w - 24);
      if (y + h > 712) y = Math.max(8, y - h - 30);
      tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
    };
    const tipOf = t => { if (t.hasAttribute('title')) { const v = t.getAttribute('title'); t.removeAttribute('title'); if (v) t.dataset.tip = v; } return t.dataset.tip; };
    const tipShow = (t, ev) => { tipEl = t; tip.textContent = t.dataset.tip; tip.classList.remove('hidden'); tipMove(ev); };
    document.addEventListener('pointerover', ev => {
      if (ev.pointerType !== 'mouse') return;
      const t = ev.target.closest && ev.target.closest('[title],[data-tip]');
      if (!t || !tipOf(t) || stage.classList.contains('combat')) { tipHide(); return; }
      if (t !== tipEl) tipShow(t, ev);
    });
    document.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse' || !tipEl) return; if (!tipEl.isConnected) { tipHide(); return; } tipMove(ev); });
    // 터치: 길게 누르면 설명이 뜨고, 그때 손을 떼도 클릭으로 치지 않는다
    let lpT = 0, lpX = 0, lpY = 0, eatClick = false;
    document.addEventListener('pointerdown', ev => {
      tipHide(); clearTimeout(lpT); eatClick = false;
      lastPT = ev.pointerType;
      stage.classList.toggle('touch', ev.pointerType === 'touch');
      if (ev.pointerType !== 'touch' || stage.classList.contains('combat')) return;
      const t = ev.target.closest && ev.target.closest('[title],[data-tip]');
      if (!t || !tipOf(t)) return;
      lpX = ev.clientX; lpY = ev.clientY;
      lpT = setTimeout(() => { if (!t.isConnected) return; tipShow(t, { clientX: lpX, clientY: lpY, above: true }); eatClick = true; }, 420);
    }, true);
    document.addEventListener('pointermove', ev => { if (ev.pointerType === 'touch' && lpT && Math.hypot(ev.clientX - lpX, ev.clientY - lpY) > 12) clearTimeout(lpT); }, true);
    document.addEventListener('pointercancel', () => clearTimeout(lpT), true);
    document.addEventListener('pointerup', () => clearTimeout(lpT), true);
    document.addEventListener('click', ev => { if (eatClick) { eatClick = false; ev.stopPropagation(); ev.preventDefault(); } }, true);
    document.addEventListener('contextmenu', ev => { if (lastPT === 'touch') ev.preventDefault(); });
    document.documentElement.addEventListener('mouseleave', tipHide);
    window.addEventListener('blur', tipHide);
    // 작업대 후보 호버 → 스탯 비교
    el('main').addEventListener('pointerover', ev => {
      if (ev.pointerType === 'touch') return;
      const c = ev.target.closest('[data-cmp]');
      const box = el('statbox');
      if (!box || st.tab !== 'bench') return;
      if (c) { if (box.dataset.cmp === c.dataset.uid) return; box.dataset.cmp = c.dataset.uid; box.innerHTML = statsHTML(Game.gunStats(st.gi), cmpStats(+c.dataset.uid)); }
      else if (box.dataset.cmp) { box.dataset.cmp = ''; box.innerHTML = statsHTML(Game.gunStats(st.gi), null); }
    });
    showTitle();
  }
  return { init, render, toast, showBase, showTitle, st };
})();
