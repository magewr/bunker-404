// BUNKER 404 — 돌연변이 도감 & 웨이브 생성
'use strict';

const ENEMIES = {
  shambler: { name: '꾸물이', w: 16, h: 30, hp: 30, spd: 22, dmg: 1.6, atk: 1.2, cost: 1, nuts: 2, unlock: 1, blood: '#7bd94a', desc: '한때 회계사였다. 지금도 뭔가를 세고 있다.' },
  runner: { name: '뜀박이', w: 14, h: 26, hp: 18, spd: 62, dmg: 1, atk: 0.7, cost: 1.3, nuts: 2, unlock: 2, blood: '#7bd94a', desc: '생전에 지각을 밥 먹듯 했다. 이제는 안 늦는다.' },
  roach: { name: '바퀴', w: 10, h: 6, hp: 6, spd: 78, dmg: 0.4, atk: 0.6, cost: 0.35, nuts: 0.5, unlock: 3, noHead: true, group: [4, 7], blood: '#c9a05a', desc: '한 마리가 보이면 백 마리가 있다. 진짜로.' },
  spitter: { name: '침뱉이', w: 16, h: 28, hp: 40, spd: 26, cost: 3, nuts: 6, unlock: 4, ranged: { range: 330, dmg: 2.6, cd: 2.4, kind: 'spit' }, blood: '#b6ff3c', desc: '멀리서 산성 침을 뱉는다. 예의가 없다. 먼저 잡자.' },
  bloater: { name: '뚱보', w: 26, h: 32, hp: 95, spd: 16, dmg: 3, atk: 1.5, cost: 3, nuts: 6, unlock: 5, boom: { r: 48, gate: 13 }, blood: '#d9e04a', desc: '죽으면 터진다. 문 앞에서 터지면 곤란하다. 멀리서 터뜨리면 이득.' },
  pigeon: { name: '변이 비둘기', w: 16, h: 12, hp: 22, spd: 52, cost: 2, nuts: 4, unlock: 6, fly: true, noHead: true, ranged: { dmg: 2.2, cd: 2.2, kind: 'poop' }, blood: '#e8e8e8', desc: '눈이 세 개. 똥은 여전히 정확하다.' },
  shell: { name: '철갑이', w: 22, h: 26, hp: 110, spd: 18, dmg: 3.2, atk: 1.3, cost: 4, nuts: 8, unlock: 7, armor: 0.6, blood: '#9aa39a', desc: '맨홀 뚜껑을 둘렀다. 철갑탄이나 산성, 혹은 머리를 노려라.' },
  jelly: { name: '젤리', w: 20, h: 18, hp: 60, spd: 24, dmg: 2, atk: 1.0, cost: 3, nuts: 5, unlock: 9, noHead: true, slime: true, split: 2, blood: '#6fe0c0', desc: '죽으면 둘로 갈라진다. 소금에 약하다.' },
  burrower: { name: '땅굴이', w: 18, h: 20, hp: 55, spd: 50, dmg: 2.6, atk: 1.0, cost: 3, nuts: 6, unlock: 11, burrow: true, blood: '#a07850', desc: '땅속으로 와서 문 근처에서 튀어나온다. 안전모 착용.' },
  shield: { name: '문짝병', w: 20, h: 30, hp: 70, spd: 20, dmg: 3, atk: 1.2, cost: 4, nuts: 8, unlock: 12, shield: 140, blood: '#7bd94a', desc: '차 문짝을 방패로 든다. 머리를 쏘거나, 관통·폭발로 뚫어라.' },
  howler: { name: '응원단장', w: 16, h: 32, hp: 50, spd: 22, dmg: 4, atk: 1.4, cost: 4, nuts: 9, unlock: 14, aura: { r: 95, spd: 1.45 }, blood: '#ff8fd0', desc: '주변 돌연변이의 사기를 올린다 (이속 +45%). 최우선 처치 대상.' },
  brute: { name: '헬창', w: 30, h: 44, hp: 320, spd: 19, dmg: 9, atk: 1.6, cost: 8, nuts: 18, unlock: 16, heavy: true, blood: '#d94a4a', desc: '종말 이후에도 헬스장을 지켰다. 머리가 작아서 맞히기 어렵다.' },
  rat: { name: '변이 쥐', w: 9, h: 6, hp: 4, spd: 92, dmg: 0.3, atk: 0.5, cost: 0.22, nuts: 0.3, unlock: 5, noHead: true, group: [6, 10], blood: '#8a7a6a', desc: '바퀴보다 빠르고 훨씬 많다. 한 발씩 쏘다간 날이 샌다. 산탄·폭발·화염이 답.' },
  sniper: { name: '새총 저격수', w: 14, h: 28, hp: 34, spd: 24, cost: 4, nuts: 7, unlock: 9, ranged: { range: 470, dmg: 7, cd: 3.4, kind: 'rock' }, blood: '#7bd94a', desc: '아주 멀리서 돌을 쏜다. 다가오지 않으니 정확한 총으로 찾아가야 한다.' },
  balloon: { name: '풍선 뚱보', w: 24, h: 28, hp: 55, spd: 30, cost: 3, nuts: 6, unlock: 8, fly: true, noHead: true, boom: { r: 50, gate: 16 }, ranged: { dmg: 3, cd: 3, kind: 'poop' }, blood: '#d9e04a', desc: '가스로 부풀어 날아온다. 문 위에서 터지면 문이 상한다. 멀리 있을 때 터뜨려라.' },
  knight: { name: '맨홀 기사', w: 24, h: 34, hp: 240, spd: 15, dmg: 6, atk: 1.5, cost: 7, nuts: 14, unlock: 10, armor: 0.75, heavy: true, blood: '#9aa39a', desc: '온몸에 맨홀 뚜껑을 둘렀다. 방어 관통·산성·절삭 없이는 총알이 튕긴다. 대보스 화력의 시험대.' },
  medic: { name: '보건 선생', w: 16, h: 30, hp: 60, spd: 22, dmg: 0, atk: 1.4, cost: 5, nuts: 10, unlock: 13, aura: { r: 100, spd: 1 }, heal: 0.06, blood: '#ff8fd0', desc: '뒤에서 주변 돌연변이를 치료한다 (초당 최대 체력의 6%). 안 잡으면 끝이 없다.' },
  gnat: { name: '하루살이 떼', w: 8, h: 6, hp: 3, spd: 66, cost: 0.28, nuts: 0.3, unlock: 7, fly: true, noHead: true, group: [5, 8], ranged: { dmg: 0.3, cd: 2.6, kind: 'spit' }, blood: '#c8d0a0', desc: '한 마리는 우습다. 문제는 쉰 마리라는 것. 하늘에서 침을 뱉는다. 산탄·폭발·연사로 쓸어 담아라.' },
  bomber: { name: '가스통 배달부', w: 16, h: 28, hp: 45, spd: 74, dmg: 0, atk: 1, cost: 3, nuts: 6, unlock: 9, boom: { r: 46, gate: 11 }, blood: '#ff8a3c', desc: '가스통을 메고 전속력으로 달려온다. 문에 닿으면 터진다. 멀리서 쏘면 주변 놈들까지 날려 준다.' },
  helmet: { name: '헬멧 비둘기', w: 16, h: 13, hp: 30, spd: 48, cost: 3, nuts: 6, unlock: 12, fly: true, noHead: true, armor: 0.6, ranged: { dmg: 3, cd: 2.4, kind: 'poop' }, blood: '#e8e8e8', desc: '공사장 안전모를 쓴 비둘기. 보통 탄은 튕긴다. 방어 관통이나 산성을 준비하라.' },
  fridge: { name: '냉장고 골렘', w: 30, h: 40, hp: 420, spd: 13, dmg: 12, atk: 1.8, cost: 9, nuts: 20, unlock: 15, armor: 0.45, heavy: true, blood: '#9fd8ff', desc: '양문형. 느리지만 총알을 튕겨 내고 문을 찌그러뜨린다. 대보스 화력이 아니면 날이 샌다.' },
  courier: { name: '총알배송', w: 16, h: 30, hp: 70, spd: 118, cost: 0, nuts: 25, unlock: 3, courier: true, blood: '#7bd94a', desc: '잡으면 택배(파츠 상자)를 떨어뜨린다. 놓치면 부재중 스티커만 남는다.' },
  dummy: { name: '허수아비', w: 18, h: 34, hp: 1e9, spd: 0, cost: 0, nuts: 0, unlock: 99, dummy: true, blood: '#d9c07a', desc: '맞는 게 직업.' },
  // 보스
  boss_roach: { name: '바선생', title: '곤충학 명예교수', boss: true, w: 90, h: 50, hp: 9500, spd: 13, dmg: 10, atk: 1.5, nuts: 300, heavy: true, blood: '#c9a05a',
    abilities: [{ type: 'summon', every: 7, list: [['roach', 6]] }, { type: 'phase', at: [0.5] }],
    desc: '모두가 이름 부르기를 꺼리는 그분. 체력이 절반 이하가 되면 난다. 그렇다. 난다.' },
  boss_gym: { name: '3대 500', title: '종말 헬스장 관장', boss: true, w: 60, h: 90, hp: 20000, spd: 11, dmg: 20, atk: 1.8, nuts: 700, heavy: true, blood: '#d94a4a',
    abilities: [{ type: 'throw', every: 5.5, kind: 'barbell', dmg: 12, hp: 60 }, { type: 'heal', every: 15, dur: 3.2, pct: 0.07, need: 0.035 }, { type: 'summon', every: 16, list: [['runner', 3], ['brute', 1]] }, { type: 'phase', at: [0.4] }],
    desc: "주기적으로 프로틴을 마셔 회복한다. 그때 쉐이커(빛나는 약점)를 집중 사격하면 사레들린다." },
  boss_redev: { name: '재개발 조합장', title: '강제집행 전문', boss: true, w: 120, h: 110, hp: 80000, spd: 9, dmg: 28, atk: 2.2, nuts: 2000, heavy: true, blood: '#ff8a3c', armor: 0.25,
    abilities: [{ type: 'throw', every: 6, kind: 'notice', dmg: 6, hp: 30, n: 3 }, { type: 'summon', every: 10, list: [['shield', 2], ['brute', 1], ['shambler', 4]] }, { type: 'phase', at: [0.6, 0.3] }],
    desc: '포크레인을 타고 대피소를 밀어버리러 왔다. 조종석 유리(머리 쪽)가 약점. 철거 통지서는 쏴서 떨어뜨릴 수 있다.' },
};
for (const k in ENEMIES) ENEMIES[k].id = k;

// 밤의 테마 — 달력 예보에 표시된다
const THEMES = {
  horde: { name: '좀비 떼', hint: '🐜 대군중 화력', types: { shambler: 6, runner: 2 }, min: 1 },
  rush: { name: '출근길 러시', hint: '🐜 대군중 화력 · 연사', types: { runner: 6, shambler: 2, roach: 2, bomber: 2 }, min: 2 },
  swarm: { name: '바퀴 대이동', hint: '🐜 대군중 화력 · 산탄/폭발/화염', types: { roach: 7, runner: 2, shambler: 2 }, min: 3 },
  siege: { name: '공성전', hint: '혼합 · 침뱉이 저격용 정밀 무기', types: { spitter: 4, bloater: 3, shambler: 3 }, min: 5 },
  sky: { name: '하늘의 공포', hint: '🐜 대군중 화력 · 정확도', types: { pigeon: 6, runner: 2, spitter: 2, gnat: 3, helmet: 2 }, min: 6 },
  armor: { name: '철갑 행진', hint: '방어 관통 · 산성 · 🎯 대보스 화력', types: { shell: 5, shambler: 3, spitter: 2, shield: 3 }, min: 7 },
  ooze: { name: '끈적한 밤', hint: '🐜 대군중 화력 · 소금탄', types: { jelly: 5, bloater: 3, shambler: 2 }, min: 9 },
  tunnel: { name: '지하 침투', hint: '🐜 대군중 화력 · 문 앞 방어시설', types: { burrower: 5, roach: 3, runner: 2 }, min: 11 },
  pep: { name: '광란의 응원전', hint: '혼합 · 응원단장 저격', types: { howler: 2, runner: 5, shambler: 4, brute: 1 }, min: 14 },
  heavy: { name: '헬스장 단체 회식', hint: '🎯 대보스 화력', types: { brute: 3, shell: 3, howler: 1, shambler: 3, fridge: 2 }, min: 16 },
  duel: { name: '정예 결투', hint: '🎯 대보스 화력 (수는 적지만 전부 정예)', types: { shell: 3, brute: 3, shield: 2, spitter: 2, shambler: 2 }, min: 8, allElite: true },
  flood: { name: '인해전술', hint: '🐜 대군중 화력 (약하지만 끝없이 온다)', types: { roach: 6, shambler: 6, runner: 5 }, min: 6, flood: true },
  plague: { name: '쥐떼 창궐', hint: '🐜 대군중 화력 · 산탄/폭발/화염 (한 발씩 쏘면 진다)', types: { rat: 8, runner: 2, shambler: 2 }, min: 5 },
  airraid: { name: '공습 경보', hint: '정확도 · 풍선은 문에서 멀 때 터뜨릴 것', types: { balloon: 4, pigeon: 4, runner: 2, helmet: 2, gnat: 2 }, min: 8 },
  iron: { name: '철의 장벽', hint: '🎯 방어 관통 · 산성 · 절삭 (맨홀 기사)', types: { knight: 3, shell: 3, shield: 2, sniper: 2, fridge: 2, helmet: 1 }, min: 10 },
  backline: { name: '후방 지원', hint: '정밀 저격 · 보건 선생과 저격수부터', types: { sniper: 3, medic: 2, spitter: 3, shambler: 5 }, min: 13 },
  gnats: { name: '하루살이 구름', hint: '🐜 대군중 화력 · 하늘을 쓸 산탄/폭발/연사', types: { gnat: 9, pigeon: 2, runner: 2 }, min: 7 },
  delivery: { name: '폭탄 배달', hint: '멀리서 터뜨릴 정확도와 연사 · 뭉쳐 있을 때 쏘면 이득', types: { bomber: 5, runner: 3, bloater: 2, shambler: 3 }, min: 9 },
  mixed: { name: '총출동', hint: '혼합 (주무기·보조무기 역할 분담)', types: { shambler: 4, runner: 3, roach: 2, spitter: 2, bloater: 2, pigeon: 2, shell: 2, jelly: 2, burrower: 2, shield: 2, howler: 1, brute: 1, rat: 2, balloon: 1, knight: 1, sniper: 1, medic: 1, gnat: 1, bomber: 1, helmet: 1, fridge: 1 }, min: 4 },
};
const THREAT_MUL = [0, 0.6, 0.8, 1.0, 1.25, 1.55];
const DIFFS = {
  easy: { name: '순한맛', hp: 0.75, dmg: 0.75, desc: '총 만드는 재미 위주. 적 체력·공격력 -25%' },
  normal: { name: '보통맛', hp: 1, dmg: 1, desc: '권장. 준비한 만큼 살아남는다.' },
  hard: { name: '핵불맛', hp: 1.35, dmg: 1.3, desc: '적 체력 +35%, 공격력 +30%. 전리품은 그대로. 왜 하는가.' },
};

const Waves = {
  hpMul(day) { const e = Math.max(0, day - 2); return 1 + 0.21 * e + 0.0022 * e * e; },
  dmgMul(day) { return 1 + 0.04 * (day - 1); },
  nutMul(day) { return 1 + 0.045 * (day - 1); },
  // 웨이브 한 판의 목표 수입(30+28×일차)을 적 '비용' 단위로 나눈 값 — 적이 늘어도 수입이 폭주하지 않게 한다
  nutRate(day) { return (24 + 17 * day) / Waves.budget(day); },
  budget(day) { return 12 + 5 * day + 0.42 * day * day; },
  duration(day) { return Math.min(100, 40 + day * 2); },
  bossFor(day) { const i = Math.round(day / 10) - 1; return ['boss_roach', 'boss_gym', 'boss_redev'][i % 3]; },
  bossScale(day) { // 31일 이후 무한 모드 보스 강화
    if (day < 40) return 1; // 30일차 보스에게 지고 치르는 재대결(31일차~)은 강화하지 않는다. 무한 모드 첫 보스는 40일차.
    return Waves.hpMul(day) / Waves.hpMul(day - 30) * 1.4;
  },
  // 밤 정의 → 스폰 목록
  plan(day, night, heat) {
    const theme = THEMES[night.theme] || THEMES.horde;
    const weights = [];
    for (const t in theme.types) if (ENEMIES[t].unlock <= day) weights.push({ t, w: theme.types[t] });
    if (!weights.length) weights.push({ t: 'shambler', w: 1 });
    let budget = Waves.budget(day) * THREAT_MUL[night.threat] * (night.boss ? 0.55 : 1) * (night.blood ? 1.15 : 1);
    budget *= 1 + 0.08 * (heat || 0);       // 악명
    if (theme.flood) budget *= 1.5;      // 인해전술: 수가 1.5배 (체력은 전투에서 0.6배)
    if (theme.allElite) budget *= 1.25;  // 정예 결투: 정예는 비용 3배라 수는 적다
    const dur = Waves.duration(day) * (night.boss ? 1.25 : 1);
    const list = [];
    const eliteP = day >= 4 ? 0.015 + day * 0.004 : 0;
    let guard = 0;
    while (budget > 0.3 && guard++ < 2000) {
      const pick = U.wpick(weights).t, def = ENEMIES[pick];
      const n = def.group ? U.randi(def.group[0], def.group[1]) : 1;
      const elite = !def.group && (theme.allElite || U.chance(theme.flood ? 0 : eliteP));
      list.push({ type: pick, n, elite });
      budget -= def.cost * n * (elite ? 3 : 1);
    }
    // 시간 배치: 몇 번의 파도로 몰려온다
    const pulses = 3 + Math.floor(day / 6);
    const out = [];
    for (const g of list) {
      const pi = U.randi(0, pulses - 1);
      const c = dur * (pi + 0.5) / pulses;
      let t = c + (Math.random() + Math.random() + Math.random() - 1.5) * dur / pulses * 0.55;
      t = U.clamp(t, 1.2, dur);
      for (let i = 0; i < g.n; i++) out.push({ t: t + i * 0.18, type: g.type, elite: g.elite });
    }
    if (day >= 3 && !night.boss && U.chance(0.45)) out.push({ t: U.rand(dur * 0.2, dur * 0.8), type: 'courier' });
    if (night.boss) out.push({ t: 5, type: night.boss, boss: true });
    out.sort((a, b) => a.t - b.t);
    // 첫 적은 빨리 나오게
    if (out.length && out[0].t > 3) { const sh = out[0].t - 2; for (const s of out) s.t -= sh; }
    return { list: out, dur };
  },
};
