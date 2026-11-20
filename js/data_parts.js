// BUNKER 404 — 총기 파츠 데이터
'use strict';

const RARITY = [
  { id: 0, name: '고물', color: '#9aa39a' },
  { id: 1, name: '일반', color: '#e6dfc8' },
  { id: 2, name: '군용', color: '#6fb7ff' },
  { id: 3, name: '시제품', color: '#c58bff' },
  { id: 4, name: '유물', color: '#ffb347' },
  { id: 5, name: '밈', color: '#ff6fb5' },
];

// 총 한 자루의 슬롯. acc1/acc2 는 slot 'acc' 파츠를 받는다.
const SLOTS = [
  { id: 'receiver', type: 'receiver', name: '몸통', icon: '🔫' },
  { id: 'barrel', type: 'barrel', name: '총열', icon: '📏' },
  { id: 'mag', type: 'mag', name: '탄창', icon: '🔋' },
  { id: 'stock', type: 'stock', name: '개머리판', icon: '🪵' },
  { id: 'sight', type: 'sight', name: '조준기', icon: '🔭' },
  { id: 'muzzle', type: 'muzzle', name: '총구', icon: '📢' },
  { id: 'ammo', type: 'ammo', name: '탄약', icon: '💊' },
  { id: 'acc1', type: 'acc', name: '부착물 1', icon: '🧷' },
  { id: 'acc2', type: 'acc', name: '부착물 2', icon: '🧷' },
];
const SLOT_TYPE_NAME = { receiver: '몸통', barrel: '총열', mag: '탄창', stock: '개머리판', sight: '조준기', muzzle: '총구', ammo: '탄약', acc: '부착물' };

// 스탯 메타. mul: 배율(+0.15 = +15%), add: 가산. good: 1 = 높을수록 좋음, -1 = 낮을수록 좋음
const STATS = {
  dmg: { name: '피해', mul: 1, good: 1 },
  rpm: { name: '연사', mul: 1, good: 1 },
  mag: { name: '장탄', mul: 1, good: 1 },
  reload: { name: '재장전 시간', mul: 1, good: -1 },
  spread: { name: '탄퍼짐', mul: 1, good: -1 },
  recoil: { name: '반동', mul: 1, good: -1 },
  vel: { name: '탄속', mul: 1, good: 1 },
  pellets: { name: '탄환 수', good: 1, unit: '' },
  pierce: { name: '관통', good: 1, unit: '' },
  head: { name: '약점 배율', good: 1, unit: 'x', dec: 1 },
  crit: { name: '치명타', good: 1, unit: '%' },
  pen: { name: '방어 관통', good: 1, unit: '%' },
  knock: { name: '넉백', good: 1, unit: '' },
  jam: { name: '걸림', good: -1, unit: '%', dec: 1 },
  loot: { name: '전리품', good: 1, unit: '%' },
  // ── 역할 특화 스탯 ──
  elite: { name: '정예·보스 피해', good: 1, unit: '%' },   // 정예(elite)·보스·헬창(heavy) 상대 피해
  swarm: { name: '일반 적 피해', good: 1, unit: '%' },     // 그 외 잡몹 상대 피해
  blast: { name: '폭발 반경', good: 1, unit: '%' },
};
/* 특수 효과 키 (파츠의 sp: {...}). 값은 같은 키끼리 합산된다. 반드시 note 로 설명을 적을 것.
   focus: 같은 적을 연속으로 맞힐 때마다 피해 +N% (최대 10중첩, 대상이 바뀌면 초기화)  → 대보스
   opener: 체력이 가득 찬 적에게 피해 +N%                                          → 대군중(한 방 컷)
   execute: 체력 35% 이하인 적에게 피해 +N%
   momentum: 처치할 때마다 3초간 피해 +N% (최대 5중첩)                              → 대군중
   overkill: 1 이면 처치 시 남는 피해가 가까운 적에게 옮겨간다                         → 대군중
   cheap: 탄약값 배율 감소 (0.5 = 반값)
   기존: screech fear salt popcorn plague mint p2w tax stamp thorns duck horn coupon regen washer thermal 등
   탄약 파츠(slot 'ammo')의 cost: 한 발당 화약 소모량(몸통 구경에 따라 자동 보정). 0 이면 무료.
   화약이 떨어지면 그 전투에서는 탄약 파츠 효과가 꺼지고 무료 '재생탄'으로 쏜다. */
const FX = {
  burn: { name: '화상', icon: '🔥', color: '#ff8a3c', desc: v => `명중 시 화상 (초당 ${v.toFixed(0)} × 중첩)` },
  shock: { name: '감전', icon: '⚡', color: '#7fe9ff', desc: v => `주변 적 ${Math.round(v)}체에게 연쇄 감전` },
  acid: { name: '산성', icon: '🧪', color: '#b6ff3c', desc: v => `방어력 부식 ${Math.round(v)}중첩` },
  explode: { name: '폭발', icon: '💥', color: '#ffd23c', desc: v => `명중 지점 폭발 (반경 ${Math.round(v)})` },
  freeze: { name: '빙결', icon: '❄️', color: '#9fd8ff', desc: v => `냉기 ${Math.round(v * 100)}% (가득 차면 얼어붙음)` },
  rad: { name: '피폭', icon: '☢️', color: '#d6ff5c', desc: v => `표식 ${Math.round(v)}중첩 (받는 피해 증가)` },
  bounce: { name: '도탄', icon: '🎱', color: '#ffb0e0', desc: v => `다른 적에게 ${Math.round(v)}회 튕김` },
  homing: { name: '유도', icon: '🎯', color: '#ff7070', desc: v => `탄이 적을 향해 휜다` },
  leech: { name: '수리', icon: '🔧', color: '#8effa0', desc: v => `처치 시 문 수리 +${v.toFixed(1)}` },
  gold: { name: '황금', icon: '🔩', color: '#ffd76a', desc: v => `처치 시 너트 +${Math.round(v)}%` },
  sunder: { name: '절삭', icon: '🪓', color: '#ff9a7a', desc: v => `명중 시 대상 최대 체력의 ${v.toFixed(1)}% 추가 피해 (보스는 1/5)` },
};

const TAGS = {
  junk: { name: '고물', icon: '🗑️', color: '#a9a38f' },
  pipe: { name: '배관', icon: '🚰', color: '#6fc3b8' },
  mil: { name: '군용', icon: '🪖', color: '#7fa86a' },
  kitchen: { name: '주방', icon: '🍳', color: '#ffb36a' },
  office: { name: '사무', icon: '📎', color: '#9fb4d9' },
  tech: { name: '하이테크', icon: '💾', color: '#6fe0ff' },
  bio: { name: '생체', icon: '🧠', color: '#d98fb2' },
  music: { name: '악기', icon: '🎺', color: '#ffd76a' },
  meme: { name: '밈', icon: '🤡', color: '#ff6fb5' },
  sport: { name: '스포츠', icon: '⚾', color: '#7fd08a' },
  farm: { name: '농기구', icon: '🌾', color: '#c9b05a' },
  toy: { name: '완구', icon: '🧸', color: '#ff9fd0' },
};

// 세트 효과 (같은 태그 파츠 n개 이상)
const SETS = {
  junk: [
    { n: 3, name: '아나바다', text: '걸림 없음 · 처치 시 15% 확률로 고철 +1', m: { jam: -99 }, sp: { scrapper: 0.15 } },
    { n: 5, name: '고물 대통합', text: '피해 +30%', m: { dmg: 0.3 } },
  ],
  pipe: [
    { n: 3, name: '수압', text: '관통 +1 · 넉백 +30 · 탄속 +20%', m: { pierce: 1, knock: 30, vel: 0.2 } },
    { n: 5, name: '전설의 배관공', text: '피해 +30%', m: { dmg: 0.3 } },
  ],
  mil: [
    { n: 3, name: '제식 규격', text: '재장전 -20% · 반동 -15%', m: { reload: -0.2, recoil: -0.15 } },
    { n: 5, name: '특등사수', text: '약점 배율 +0.8 · 치명타 +5%', m: { head: 0.8, crit: 5 } },
  ],
  kitchen: [
    { n: 3, name: '손맛', text: '화상·산성·빙결 효과 +50%', sp: { fxMul: 1.5 } },
    { n: 5, name: '장인의 한 상', text: '피해 +15% · 처치 시 10% 확률로 문 수리 +3', m: { dmg: 0.15 }, sp: { feast: 0.1 } },
  ],
  office: [
    { n: 3, name: '칼퇴 본능', text: '남은 적이 30% 이하면 피해 +40%', sp: { overtime: 0.4 } },
    { n: 5, name: '야근 수당', text: '전리품 +30% · 연사 +10%', m: { loot: 30, rpm: 0.1 } },
  ],
  tech: [
    { n: 3, name: '오버클럭', text: '연사 +12% · 감전 연쇄 +1', m: { rpm: 0.12 }, fx: { shock: 1 } },
    { n: 5, name: '특이점', text: '25% 확률로 탄을 소모하지 않음', sp: { freeAmmo: 0.25 } },
  ],
  bio: [
    { n: 3, name: '공생', text: '피해 +8% · 처치 시 문 수리 +1', m: { dmg: 0.08 }, fx: { leech: 1 } },
    { n: 5, name: '포식자', text: '처치 후 3초간 피해 +25%', sp: { predator: 0.25 } },
  ],
  music: [
    { n: 3, name: '합주', text: '8발마다 음파 충격 (광역 피해+넉백)', sp: { sonic: 8 } },
    { n: 5, name: '앙코르', text: '음파 충격이 4발마다 발동', sp: { sonic: 4 } },
  ],
  sport: [
    { n: 3, name: '풀스윙', text: '넉백 +40 · 치명타 +8%', m: { knock: 40, crit: 8 } },
    { n: 5, name: '끝내기 홈런', text: '약점 배율 +0.7 · 정예·보스 피해 +20%', m: { head: 0.7, elite: 20 } },
  ],
  farm: [
    { n: 3, name: '품앗이', text: '일반 적 피해 +25%', m: { swarm: 25 } },
    { n: 5, name: '풍년', text: '전리품 +30% · 처치 시 10% 확률로 문 수리 +3', m: { loot: 30 }, sp: { feast: 0.1 } },
  ],
  toy: [
    { n: 3, name: '동심', text: '연사 +15% · 탄약값 반값', m: { rpm: 0.15 }, sp: { cheap: 0.5 } },
    { n: 5, name: '장난이 아님', text: '피해 +30%', m: { dmg: 0.3 } },
  ],
  meme: [
    { n: 3, name: '떡상', text: '7% 확률로 피해 ×5', sp: { moon: 0.07 } },
    { n: 5, name: '투 더 문', text: '떡상 확률 2배 · 떡상 시 폭발', sp: { moon: 0.14, moonBoom: 1 } },
  ],
};

const PARTS = {};
const PART_LIST = [];
function P(id, slot, name, r, tags, data, desc) {
  const p = Object.assign({ id, slot, name, r, tags, desc: desc || '' }, data);
  if (p.tier == null) p.tier = r === 5 ? 2 : r;
  PARTS[id] = p;
  PART_LIST.push(p);
}

/* ───────────── 몸통 (리시버) ─────────────
   base: dmg(발당 피해) rpm mag reload(초) spread(도) recoil(발당 벌어짐) vel(px/s)
   mode: semi | auto | burst | charge | beam      proj: bullet | nail | lob | flame | beam | arc | saw | orb | can | wave | rail
*/
P('pipe_pistol', 'receiver', '파이프 권총', 0, ['junk', 'pipe'], { base: { dmg: 14, rpm: 300, mag: 8, reload: 1.3, spread: 2.2, recoil: 1.6, vel: 950, mode: 'semi', proj: 'bullet', snd: { power: 0.3, kind: 'bullet' } } }, '배관 파이프에 방아쇠를 달았다. 그게 전부다.');
P('nailgun', 'receiver', '네일건', 0, ['junk'], { m: { swarm: 10 }, base: { dmg: 6, rpm: 520, mag: 30, reload: 1.8, spread: 3.8, recoil: 0.5, vel: 800, mode: 'auto', proj: 'nail', snd: { power: 0.15, kind: 'nail' } } }, '원래는 집을 짓던 물건. 이제는 집을 지킨다.');
P('slingshot', 'receiver', '새총', 0, ['junk'], { m: { elite: 10 }, base: { dmg: 46, rpm: 200, mag: 1, reload: 0.25, spread: 1.0, recoil: 0.5, vel: 850, mode: 'charge', charge: 0.7, proj: 'bullet', snd: { power: 0.1, kind: 'nail' } }, note: '꾹 눌러 모아 쏜다. 완충 시 관통 +1' }, '초등학교 때 압수당했던 바로 그것.');

P('revolver', 'receiver', '육혈포 리볼버', 1, ['mil'], { m: { elite: 15 }, base: { dmg: 36, rpm: 160, mag: 6, reload: 2.0, spread: 1.2, recoil: 3.2, vel: 1200, head: 2.5, mode: 'semi', proj: 'bullet', snd: { power: 0.55, kind: 'bullet' } } }, '여섯 발이면 충분하다. 일곱 마리가 오면 곤란하다.');
P('pump', 'receiver', '펌프 샷건', 1, ['junk'], { m: { elite: -15, swarm: 20 }, base: { dmg: 9, pellets: 7, rpm: 72, mag: 5, reload: 2.3, spread: 7.5, recoil: 4, vel: 900, mode: 'semi', cyc: 'pump', proj: 'bullet', snd: { power: 0.7, kind: 'shotgun' } } }, "'철컥' 소리가 절반은 한다.");
P('boltrifle', 'receiver', '볼트액션 소총', 1, ['mil'], { m: { elite: 25, swarm: -10 }, base: { dmg: 75, rpm: 48, mag: 5, reload: 2.2, spread: 0.3, recoil: 4, vel: 1500, pierce: 1, head: 3.0, mode: 'semi', cyc: 'bolt', proj: 'bullet', snd: { power: 0.75, kind: 'bullet' } } }, '할아버지의 사냥총. 한 발 한 발이 유언처럼 무겁다.');
P('smg', 'receiver', '용접 기관단총', 1, ['junk'], { m: { swarm: 15 }, base: { dmg: 8, rpm: 660, mag: 25, reload: 1.6, spread: 4, recoil: 0.7, vel: 900, mode: 'auto', proj: 'bullet', snd: { power: 0.3, kind: 'bullet' } } }, '용접 자국이 곧 일련번호다.');
P('stapler', 'receiver', '대형 스테이플러', 1, ['office'], { m: { swarm: 10 }, base: { dmg: 11, rpm: 330, mag: 20, reload: 1.5, spread: 3, recoil: 0.8, vel: 800, mode: 'auto', proj: 'nail', freeze: 0.15, snd: { power: 0.2, kind: 'nail' } }, note: '맞은 적의 발을 바닥에 철한다 (둔화)' }, '서류 대신 돌연변이를 철한다.');
P('potato', 'receiver', '감자 대포', 5, ['kitchen', 'meme'], { m: { swarm: 10 }, tier: 1, base: { dmg: 55, rpm: 42, mag: 1, reload: 1.5, spread: 1.5, recoil: 5, vel: 420, explode: 30, mode: 'semi', proj: 'lob', snd: { power: 0.6, kind: 'launcher' } } }, '탄수화물은 죄가 없다. 맞는 쪽이 죄다.');

P('ar', 'receiver', '돌격소총 K-404', 2, ['mil'], { base: { dmg: 16, rpm: 600, mag: 30, reload: 1.9, spread: 1.8, recoil: 1.0, vel: 1300, mode: 'auto', proj: 'bullet', snd: { power: 0.5, kind: 'bullet' } } }, "군수 창고에서 '분실' 처리된 물건. 무난함의 극치.");
P('autoshotgun', 'receiver', '전투 샷건', 2, ['mil'], { m: { elite: -15, swarm: 25 }, base: { dmg: 9, pellets: 8, rpm: 200, mag: 8, reload: 2.6, spread: 8, recoil: 3, vel: 950, mode: 'semi', proj: 'bullet', snd: { power: 0.75, kind: 'shotgun' } } }, '문 따는 용도였는데, 이제는 문을 지킨다.');
P('dmr', 'receiver', '반자동 저격총', 2, ['mil'], { m: { elite: 20 }, base: { dmg: 88, rpm: 120, mag: 10, reload: 2.3, spread: 0.25, recoil: 3, vel: 1700, pierce: 2, head: 3.0, mode: 'semi', proj: 'bullet', snd: { power: 0.8, kind: 'bullet' } } }, '멀리서 인사하는 가장 정중한 방법.');
P('lmg', 'receiver', '경기관총', 2, ['mil'], { m: { swarm: 10 }, base: { dmg: 15, rpm: 720, mag: 100, reload: 4.2, spread: 3.6, recoil: 1.2, vel: 1200, mode: 'auto', proj: 'bullet', snd: { power: 0.6, kind: 'bullet' } } }, '탄띠가 길면 인생이 편하다. 재장전만 빼고.');
P('gl', 'receiver', '유탄발사기', 2, ['mil'], { m: { elite: -20, swarm: 20 }, base: { dmg: 110, rpm: 55, mag: 6, reload: 3.0, spread: 1.5, recoil: 5, vel: 460, explode: 44, mode: 'semi', proj: 'lob', snd: { power: 0.7, kind: 'launcher' } } }, "'대충 저쯤' 쏘면 되는 무기.");
P('burstrifle', 'receiver', '3점사 소총', 2, ['mil'], { m: { elite: 10 }, base: { dmg: 22, rpm: 840, mag: 30, reload: 1.8, spread: 1.2, recoil: 1.1, vel: 1400, mode: 'burst', burst: 3, burstDelay: 0.3, proj: 'bullet', snd: { power: 0.5, kind: 'bullet' } } }, '탕탕탕. 세 번 말해야 알아듣는 놈들이 있다.');
P('keyboard', 'receiver', '기계식 키보드 (청축)', 5, ['office', 'meme'], { m: { swarm: 15 }, tier: 2, base: { dmg: 9, rpm: 900, mag: 104, reload: 3.0, spread: 5, recoil: 0.5, vel: 850, mode: 'auto', proj: 'key', snd: { power: 0.12, kind: 'nail' } } }, '키보드 워리어의 최종 진화. 104키 전부 실탄.');

P('gauss', 'receiver', '가우스 소총', 3, ['tech'], { m: { elite: 30, swarm: -20 }, base: { dmg: 280, rpm: 200, mag: 4, reload: 2.4, spread: 0.1, recoil: 6, vel: 3000, pierce: 99, head: 2.5, mode: 'charge', charge: 0.9, proj: 'rail', snd: { power: 0.9, kind: 'energy' } }, note: '모아서 쏜다 · 모든 적 관통' }, '줄 서 있는 놈들을 한 번에 꿴다.');
P('tesla', 'receiver', '테슬라 건', 3, ['tech'], { m: { elite: -15, swarm: 20 }, base: { dmg: 24, rpm: 280, mag: 40, reload: 2.4, spread: 2, recoil: 0.4, vel: 2000, shock: 3, mode: 'auto', proj: 'arc', snd: { power: 0.5, kind: 'arc' } } }, '전기세는 돌연변이가 낸다.');
P('flamer', 'receiver', '화염방사기', 3, ['kitchen'], { m: { elite: -25, swarm: 30 }, base: { dmg: 5, rpm: 1200, mag: 160, reload: 3.0, spread: 9, recoil: 0.1, vel: 330, burn: 4, range: 200, mode: 'auto', proj: 'flame', snd: { power: 0.3, kind: 'flame' } }, note: '사거리가 짧다 · 닿는 모든 적을 태운다' }, '소독은 고열이 기본이다.');
P('minigun', 'receiver', '미니건', 3, ['mil'], { m: { elite: -10, swarm: 20 }, base: { dmg: 11, rpm: 1500, mag: 300, reload: 5.0, spread: 5, recoil: 0.5, vel: 1300, spin: 0.8, mode: 'auto', proj: 'bullet', snd: { power: 0.45, kind: 'bullet' } }, note: '예열(회전)이 필요하다' }, "이름만 '미니'다.");
P('laser', 'receiver', '레이저 소총', 3, ['tech'], { base: { dmg: 9, rpm: 1800, mag: 100, reload: 2.0, spread: 0, recoil: 0, vel: 9999, pierce: 2, mode: 'beam', proj: 'beam', snd: { power: 0.3, kind: 'beam' } } }, '빛의 속도로 예의를 가르친다.');
P('microwave', 'receiver', '전자레인지 건', 5, ['kitchen', 'tech', 'meme'], { m: { elite: 25, swarm: -15 }, tier: 3, base: { dmg: 4, rpm: 1800, mag: 120, reload: 2.5, spread: 0, recoil: 0, vel: 9999, pierce: 1, ramp: 4, mode: 'beam', proj: 'beam', beamColor: '#ffb347', snd: { power: 0.3, kind: 'beam' } }, note: '같은 적을 오래 쬘수록 피해 최대 4배 · 처치 시 "띵!"' }, '3분이면 뭐든 익는다.');
P('sawgun', 'receiver', '원형톱 발사기', 3, ['junk'], { m: { swarm: 20 }, base: { dmg: 55, rpm: 100, mag: 6, reload: 2.6, spread: 1, recoil: 3, vel: 420, pierce: 6, mode: 'semi', proj: 'saw', snd: { power: 0.5, kind: 'saw' } }, note: '톱날이 바닥을 타고 달리며 적을 벤다' }, '목공소의 악몽.');
P('tuba', 'receiver', '튜바 음파포', 3, ['music'], { m: { elite: -20, swarm: 25 }, base: { dmg: 42, rpm: 85, mag: 8, reload: 2.2, spread: 0, recoil: 4, vel: 520, pierce: 99, knock: 90, range: 330, mode: 'semi', proj: 'wave', snd: { power: 0.8, kind: 'sonic' } }, note: '부채꼴 음파 · 전부 관통 · 강한 넉백' }, '대피소 관악단 유일의 생존 악기.');
P('heartgun', 'receiver', '살아있는 총', 3, ['bio'], { base: { dmg: 26, rpm: 380, mag: 30, reload: 2.5, spread: 2.5, recoil: 1, vel: 1000, leech: 0.5, regen: 0.14, mode: 'auto', proj: 'bio', snd: { power: 0.35, kind: 'can' } }, note: '쏘지 않으면 탄이 저절로 찬다' }, '재장전이 필요 없다. 대신 가끔 트림을 한다.');

P('railcannon', 'receiver', "궤도포 '천둥'", 4, ['tech', 'mil'], { m: { elite: 40, swarm: -20 }, base: { dmg: 520, rpm: 32, mag: 3, reload: 3.2, spread: 0.1, recoil: 10, vel: 4000, pierce: 99, explode: 30, head: 2.5, mode: 'semi', proj: 'rail', snd: { power: 1, kind: 'energy' } } }, '발사 후 3초간 귀가 안 들리는 건 정상입니다.');
P('blackhole', 'receiver', "블랙홀 발생기 '월요일'", 4, ['tech'], { m: { elite: -30, swarm: 30 }, base: { dmg: 70, rpm: 15, mag: 1, reload: 4.0, spread: 0.5, recoil: 6, vel: 260, mode: 'semi', proj: 'orb', snd: { power: 0.9, kind: 'energy' } }, note: '3초간 적을 빨아들이는 특이점 생성 (초당 피해)' }, '모든 것을 빨아들인다. 의욕까지.');
P('kimchi', 'receiver', '김장독 박격포', 5, ['kitchen', 'meme'], { m: { elite: -20, swarm: 25 }, tier: 4, base: { dmg: 220, rpm: 30, mag: 1, reload: 2.6, spread: 2, recoil: 8, vel: 380, explode: 64, acid: 3, pool: 4, mode: 'semi', proj: 'lob', snd: { power: 1, kind: 'launcher' } }, note: '착탄 지점에 산성 김칫국물 웅덩이' }, '3년 묵은 묵은지가 하늘에서 내린다. 국제법 위반 소지 있음.');
P('vending', 'receiver', '자판기 건', 5, ['tech', 'meme'], { tier: 3, base: { dmg: 44, rpm: 250, mag: 24, reload: 2.4, spread: 3, recoil: 1.5, vel: 800, mode: 'auto', proj: 'can', snd: { power: 0.4, kind: 'can' } }, note: '쏠 때마다 무작위 속성 (화염/빙결/감전/폭발/산성)' }, '뭐가 나올지는 자판기 마음.');

/* ───────────── 총열 ───────────── */
P('barrel_pvc', 'barrel', 'PVC 배관 총열', 0, ['junk', 'pipe'], { m: { dmg: -0.05, spread: 0.2, vel: 0.1, rpm: 0.1 } }, '가볍다. 가끔 녹는다.');
P('barrel_rust', 'barrel', '녹슨 수도관', 0, ['junk', 'pipe'], { m: { dmg: 0.1, spread: 0.3, jam: 1.5 } }, '파상풍 추가 피해는 기분 탓이다.');
P('barrel_short', 'barrel', '톱질한 단총열', 1, ['junk'], { m: { elite: -10, swarm: 8, dmg: 0.14, spread: 0.5, rpm: 0.06, recoil: 0.2 } }, '가까이서 쏘면 된다는 철학.');
P('barrel_long', 'barrel', '장총열', 1, ['mil'], { m: { dmg: 0.1, vel: 0.25, spread: -0.25, rpm: -0.05 } }, '길다. 그만큼 정확하다.');
P('barrel_double', 'barrel', '쌍열 총열', 1, ['junk'], { pm: 2, m: { swarm: 6, dmg: -0.38, spread: 0.25, reload: 0.1 }, note: '한 번에 두 발씩 나간다' }, '두 배로 쏘면 두 배로 좋다는 가설.');
P('barrel_hose', 'barrel', '소방 호스', 1, ['pipe'], { m: { dmg: 0.18, spread: 0.6, knock: 25, elite: -10 } }, '탄이 휘청거리며 나간다. 수압만큼은 진짜.');
P('barrel_heavy', 'barrel', '중(重)총열', 2, ['mil'], { m: { elite: 5, dmg: 0.2, recoil: -0.2, rpm: -0.08 } }, '묵직함이 곧 신뢰다.');
P('barrel_rifled', 'barrel', '정밀 강선 총열', 2, ['mil'], { m: { elite: 8, spread: -0.45, head: 0.4, vel: 0.15, rpm: -0.06 } }, '탄이 빙글빙글 돌며 곧게 나간다.');
P('barrel_trumpet', 'barrel', '트럼펫 총열', 2, ['music'], { m: { dmg: 0.06, spread: 0.3, knock: 40, crit: 5 } }, '쏠 때마다 팡파르가 울린다.');
P('barrel_bone', 'barrel', '대퇴골 총열', 2, ['bio'], { m: { dmg: 0.16, spread: 0.1 }, fx: { leech: 0.5 } }, '칼슘이 풍부하다.');
P('barrel_gatling', 'barrel', '6연장 회전 총열', 3, ['mil'], { m: { elite: -10, swarm: 15, rpm: 0.5, spread: 0.4, dmg: -0.12, recoil: -0.1 }, spin: 0.4, note: '예열 시간 +0.4초' }, '돌리고 돌리고.');
P('barrel_coil', 'barrel', '코일 가속기', 3, ['tech'], { m: { elite: 15, dmg: 0.25, vel: 0.6, rpm: -0.1, pierce: 1, swarm: -10 } }, '자석으로 탄을 민다. 냉장고 자석은 아니다.');
P('barrel_lamp', 'barrel', '가로등 기둥', 4, ['junk', 'meme'], { m: { elite: 25, swarm: -10, dmg: 0.6, spread: -0.3, rpm: -0.3, recoil: 0.5, vel: 0.3 } }, '길면 좋다고 누가 그랬다. 문을 못 지나가는 게 흠.');
P('barrel_gold', 'barrel', '황금 총열', 4, ['meme'], { m: { dmg: -0.2 }, fx: { gold: 60 } }, '성능은 떨어지지만 기분이 좋다.');
P('barrel_recorder', 'barrel', '리코더', 5, ['music', 'meme'], { tier: 1, m: { rpm: 0.15, dmg: -0.1 }, sp: { screech: 0.05 }, note: "삑사리: 5% 확률로 주변 적 기절" }, '초등학교 음악 시간의 트라우마를 무기화했다.');
P('barrel_straw', 'barrel', '버블티 빨대', 5, ['kitchen', 'meme'], { tier: 1, m: { elite: -15, swarm: 15, dmg: -0.35, rpm: 0.5, spread: -0.5 } }, '후루룩. 굵어서 펄도 지나간다.');

/* ───────────── 탄창 ───────────── */
P('mag_tape', 'mag', '테이프 감은 탄창', 0, ['junk'], { m: { reload: -0.15, jam: 1.5 } }, '두 개를 거꾸로 붙였다. 영화에서 봤다.');
P('mag_pet', 'mag', '페트병 탄창', 0, ['junk'], { m: { mag: 0.25, jam: 2 } }, '분리수거는 잊어라.');
P('mag_lunch', 'mag', '양은 도시락 탄창', 1, ['kitchen'], { m: { mag: 0.35, reload: 0.05 } }, '흔들어 먹어야 제맛.');
P('mag_ext', 'mag', '대용량 탄창', 2, ['mil'], { m: { mag: 0.6, reload: 0.15 } }, '많이 들어간다. 그게 장점의 전부이자 충분한 이유.');
P('mag_quick', 'mag', '퀵 탄창', 2, ['mil'], { m: { reload: -0.35, mag: -0.1 } }, '고리에 손가락만 걸면 빠진다.');
P('mag_kimchi', 'mag', '김치통 탄창', 2, ['kitchen'], { m: { mag: 0.4 }, fx: { acid: 1 } }, '뚜껑 열 때 주의. 발효가 끝났다.');
P('mag_drum', 'mag', '드럼 탄창', 3, ['mil'], { m: { swarm: 8, mag: 1.5, reload: 0.4 } }, '둥글고 무겁고 든든하다.');
P('mag_belt', 'mag', '탄띠 급탄기', 3, ['mil'], { m: { swarm: 10, elite: -15, mag: 2.5, reload: 0.8, rpm: 0.1, spread: 0.1 } }, '끝이 안 보인다. 재장전도 끝이 안 보인다.');
P('mag_cell', 'mag', '융합 배터리', 3, ['tech'], { m: { mag: 0.3, reload: 0.15, elite: -10 }, fx: { shock: 1 } }, '만지면 찌릿하다. 핥지 말 것.');
P('mag_gland', 'mag', '맥동하는 분비샘', 3, ['bio'], { m: { mag: 0.3, reload: -0.2 }, fx: { acid: 1, leech: 0.3 } }, '찌걱. 찌걱. 따뜻하다.');
P('mag_buffet', 'mag', '무한리필 탄창', 4, ['kitchen'], { m: { reload: 0.3 }, sp: { regen: 0.1 }, note: '쏘지 않는 동안 탄이 차오른다 (초당 10%)' }, '사장님이 싫어합니다.');
P('mag_washer', 'mag', '드럼 세탁기 탄창', 5, ['meme'], { tier: 3, m: { mag: 3, reload: 0.9, rpm: 0.06 }, sp: { washer: 1 }, note: '재장전 완료 시 멜로디 + 5초간 피해 +30%' }, "'드럼' 탄창을 주문했더니 이게 왔다.");
P('mag_piggy', 'mag', '돼지 저금통', 5, ['meme'], { tier: 1, m: { mag: 0.5, reload: 0.15 }, fx: { gold: 25 } }, '쏠 때마다 짤랑거린다.');

/* ───────────── 개머리판 ───────────── */
P('stock_crutch', 'stock', '목발', 0, ['junk'], { m: { recoil: -0.15 } }, '전 주인은 더 이상 필요 없다고 했다.');
P('stock_wrench', 'stock', '파이프 렌치', 1, ['pipe'], { m: { recoil: -0.2, knock: 20 } }, '조이고 기름치자.');
P('stock_spring', 'stock', '침대 스프링', 1, ['junk'], { m: { recoil: 0.3, rpm: 0.15 } }, '반동으로 다음 발을 쏜다. 과학이다.');
P('stock_wood', 'stock', '나무 개머리판', 1, ['mil'], { m: { recoil: -0.25, spread: -0.08, reload: 0.05 } }, '클래식은 영원하다.');
P('stock_bat', 'stock', '야구 방망이', 1, ['junk'], { m: { recoil: -0.1, knock: 30, crit: 3 } }, '9회말 2아웃의 마음가짐.');
P('stock_chair', 'stock', '사무용 의자', 2, ['office'], { m: { recoil: -0.3, rpm: 0.08 } }, '허리는 편하다. 바퀴 때문에 가끔 뒤로 밀린다.');
P('stock_guitar', 'stock', '통기타', 2, ['music'], { m: { recoil: -0.2, crit: 6, loot: 10 } }, '버스킹 수익 포함.');
P('stock_tactical', 'stock', '전술 개머리판', 2, ['mil'], { m: { recoil: -0.4, spread: -0.15, mag: -0.05 } }, "이름에 '전술'이 붙으면 20% 비싸진다.");
P('stock_spine', 'stock', '척추 개머리판', 3, ['bio'], { m: { recoil: -0.35, dmg: 0.08 }, fx: { leech: 0.5 } }, '누구 건지는 묻지 말자.');
P('stock_gyro', 'stock', '자이로 안정기', 3, ['tech'], { m: { recoil: -0.6, spread: -0.25 } }, '웅웅거리며 총을 붙잡아 준다.');
P('stock_pillow', 'stock', '메모리폼 베개', 5, ['meme'], { tier: 1, m: { recoil: -0.7, rpm: -0.05 } }, '어깨가 편안하다. 졸리다.');
P('stock_brick', 'stock', '벽돌', 5, ['meme', 'junk'], { tier: 1, m: { recoil: -0.5, dmg: 0.1, reload: 0.15 } }, "순무마켓에서 '미개봉 새 개머리판'을 샀더니 이게 왔다.");

/* ───────────── 조준기 ───────────── */
P('sight_nail', 'sight', '못 가늠쇠', 0, ['junk'], { m: { spread: -0.08 } }, '못 하나 박았다. 없는 것보단 낫다.');
P('sight_tp', 'sight', '휴지심 스코프', 0, ['junk'], { m: { head: 0.2, spread: -0.05 } }, '배율 1배, 감성 100배.');
P('sight_binoc', 'sight', '반쪽 쌍안경', 1, ['junk'], { m: { elite: 8, head: 0.5, rpm: -0.04 } }, '나머지 반쪽은 옆 대피소에 있다.');
P('sight_mirror', 'sight', '룸미러', 1, ['junk'], { m: { crit: 8 } }, '뒤는 아주 잘 보인다.');
P('sight_magnify', 'sight', '돋보기', 1, ['office'], { m: { head: 0.3, rpm: -0.05 }, fx: { burn: 1.5 } }, '개미 태우던 실력 어디 안 간다.');
P('sight_laserp', 'sight', '레이저 포인터', 1, ['office'], { m: { spread: -0.15 } }, '발표용. 고양이 주의.');
P('sight_reddot', 'sight', '레드닷', 2, ['mil'], { m: { swarm: 10, spread: -0.18, crit: 5, head: -0.2 } }, '빨간 점을 놈에게 올리고 당긴다. 끝.');
P('sight_scope', 'sight', '4배율 조준경', 2, ['mil'], { m: { elite: 10, head: 0.8, spread: -0.2, rpm: -0.05 } }, '모공까지 보인다.');
P('sight_sniper', 'sight', '12배율 조준경', 3, ['mil'], { m: { elite: 20, swarm: -10, head: 1.5, spread: -0.3, rpm: -0.12 } }, '모공 속까지 보인다.');
P('sight_thermal', 'sight', '열화상 조준경', 3, ['tech'], { m: { crit: 12, head: 0.5 }, sp: { thermal: 1 }, note: '안개를 꿰뚫어 본다' }, '따뜻한 놈부터 쏜다.');
P('sight_eye', 'sight', '박힌 눈알', 3, ['bio'], { m: { crit: 10, head: 0.6, spread: -0.1 } }, '깜빡인다. 가끔 눈이 마주친다.');
P('sight_aimbot', 'sight', "AI 조준보조 '에임핵'", 4, ['tech'], { m: { spread: -0.3 }, fx: { homing: 1 } }, '탄이 알아서 휜다. 신고는 받지 않습니다.');
P('sight_glasses', 'sight', '할머니 돋보기안경', 5, ['meme'], { tier: 1, m: { elite: 10, swarm: -10, head: 0.9, spread: 0.25 } }, '멀리는 잘 보이는데 가까운 게 안 보인다.');
P('sight_selfie', 'sight', '셀카봉', 5, ['meme'], { tier: 1, m: { loot: 25, crit: 3 } }, "'좋아요'와 '구독'이 전리품이 된다.");

/* ───────────── 총구 ───────────── */
P('muz_fork', 'muzzle', '포크 총검', 0, ['kitchen'], { m: { dmg: 0.05, crit: 3 } }, '찌르는 용도는 아니다. 아마도.');
P('muz_oil', 'muzzle', '오일필터 소음기', 1, ['junk'], { m: { recoil: -0.1, spread: -0.1, dmg: -0.05 }, suppressed: 1 }, '카센터 표 정숙성.');
P('muz_funnel', 'muzzle', '깔때기', 1, ['kitchen'], { m: { elite: -15, swarm: 15, pellets: 2, dmg: -0.2, spread: 0.8 } }, '탄을 넓게 뿌린다. 원래는 참기름용.');
P('muz_brake', 'muzzle', '머즐 브레이크', 2, ['mil'], { m: { recoil: -0.35 } }, '옆 사람 귀는 책임지지 않는다.');
P('muz_comp', 'muzzle', '보정기', 2, ['mil'], { m: { spread: -0.2, recoil: -0.15 } }, '총구가 얌전해진다.');
P('muz_supp', 'muzzle', '군용 소음기', 2, ['mil'], { m: { crit: 10, dmg: -0.03 }, suppressed: 1 }, '조용히 다가가 조용히 보낸다.');
P('muz_choke', 'muzzle', '초크', 2, ['mil'], { m: { spread: -0.35 } }, '퍼지는 걸 모아준다. 산탄의 단짝.');
P('muz_shower', 'muzzle', '샤워기 헤드', 2, ['pipe'], { m: { elite: -20, swarm: 20, pellets: 4, dmg: -0.35, spread: 1.0 } }, '수압 조절: 강.');
P('muz_torch', 'muzzle', '가스 토치', 2, ['kitchen'], { m: { spread: 0.15 }, fx: { burn: 3 } }, '불맛을 입힌다.');
P('muz_megaphone', 'muzzle', '확성기', 2, ['music'], { m: { swarm: 10, elite: -10, knock: 60 }, sp: { fear: 0.06 }, note: '6% 확률로 맞은 적이 겁먹고 도망친다' }, '아아, 마이크 테스트.');
P('muz_tesla', 'muzzle', '테슬라 코일', 3, ['tech'], { m: { elite: -10 }, fx: { shock: 1 } }, '탄에 정전기를 입힌다. 겨울 니트의 원리.');
P('muz_stinger', 'muzzle', '독침', 3, ['bio'], { m: { dmg: 0.05 }, fx: { rad: 1, acid: 1 } }, '뭔가의 꼬리에서 뽑았다.');
P('muz_firework', 'muzzle', '폭죽 어댑터', 5, ['meme'], { tier: 2, m: { dmg: -0.15 }, fx: { explode: 18 } }, '명중할 때마다 작은 축제가 열린다.');
P('muz_bubble', 'muzzle', '비눗방울 채', 5, ['meme'], { tier: 1, m: { vel: -0.5, dmg: 0.2, elite: -10, spread: 0.2 } }, '느리지만 아프다. 그리고 예쁘다.');

/* ───────────── 탄약 ───────────── */
P('ammo_nail', 'ammo', '못 탄약', 0, ['junk'], { m: { dmg: 0.08, spread: 0.1, jam: 1 } }, '철물점 재고 처리.');
P('ammo_acid', 'ammo', '폐배터리 산성탄', 1, ['junk'], { cost: 0.02, m: { dmg: -0.05 }, fx: { acid: 1 } }, '환경부가 알면 큰일 난다. 환경부는 이제 없다.');
P('ammo_rubber', 'ammo', '탱탱볼탄', 1, ['junk'], { m: { dmg: -0.15 }, fx: { bounce: 2 } }, '문방구 앞 뽑기에서 나왔다.');
P('ammo_salt', 'ammo', '굵은 소금탄', 1, ['kitchen'], { m: { dmg: 0.1, pen: -20, crit: 5 }, sp: { salt: 1 }, note: '젤리 계열에 2배 피해' }, '액막이 효과는 미검증.');
P('ammo_popcorn', 'ammo', '팝콘 옥수수탄', 1, ['kitchen'], { cost: 0.02, m: {}, sp: { popcorn: 0.25 }, note: "처치 시 25% 확률로 '펑' (작은 폭발)" }, '영화관 냄새가 난다.');
P('ammo_fmj', 'ammo', '철갑탄', 2, ['mil'], { cost: 0.06, m: { elite: 10, swarm: -8, dmg: -0.05, pen: 50, pierce: 1 } }, '맨홀 뚜껑쯤은 종이다.');
P('ammo_hp', 'ammo', '할로포인트', 2, ['mil'], { cost: 0.05, m: { elite: -10, swarm: 12, dmg: 0.25, pen: -30 } }, '물렁한 놈들에게 특효.');
P('ammo_fire', 'ammo', '소이탄', 2, ['mil'], { cost: 0.06, m: { dmg: -0.1, elite: -15 }, fx: { burn: 5 } }, '맞으면 뜨겁다. 맞고 나서도 뜨겁다.');
P('ammo_shock', 'ammo', '건전지탄', 2, ['tech'], { cost: 0.05, m: { dmg: -0.08 }, fx: { shock: 1 } }, 'AA 사이즈. 충전식 아님.');
P('ammo_explosive', 'ammo', '고폭탄', 3, ['mil'], { cost: 0.15, m: { elite: -15, swarm: 15, dmg: -0.15, rpm: -0.1 }, fx: { explode: 22 } }, '뭉쳐 있으면 손해라는 걸 알려준다.');
P('ammo_cryo', 'ammo', '냉매탄', 3, ['tech'], { cost: 0.1, m: { dmg: -0.05 }, fx: { freeze: 0.35 } }, '에어컨 실외기에서 뽑았다.');
P('ammo_du', 'ammo', '열화우라늄탄', 3, ['mil'], { cost: 0.2, m: { elite: 10, swarm: -15, dmg: 0.08, pen: 25 }, fx: { rad: 1 } }, '건강에 해롭다. 맞는 쪽이.');
P('ammo_spore', 'ammo', '포자탄', 3, ['bio'], { cost: 0.1, m: { dmg: -0.05 }, fx: { rad: 1 }, sp: { plague: 1 }, note: '처치 시 주변 적에게 독이 옮겨 붙는다' }, '버섯은 죽지 않는다. 이사할 뿐이다.');
P('ammo_hot', 'ammo', '핵불맛 소스탄', 5, ['kitchen', 'meme'], { cost: 0.08, tier: 2, m: { dmg: -0.05, elite: -15 }, fx: { burn: 4 }, sp: { fear: 0.05 }, note: '5% 확률로 맞은 적이 우유를 찾아 도망친다' }, '매운맛 5단계. 도전 실패 시 환불 불가.');
P('ammo_mint', 'ammo', '민트초코탄', 5, ['kitchen', 'meme'], { cost: 0.05, tier: 2, m: {}, sp: { mint: 1 }, note: '맞은 적의 절반은 좋아서 얼어붙고, 절반은 격분한다 (이속↑ · 받는 피해 +50%)' }, '호불호가 갈린다. 돌연변이도 마찬가지.');
P('ammo_p2w', 'ammo', '과금탄', 5, ['meme'], { tier: 2, m: { dmg: 0.8 }, sp: { p2w: 1 }, note: '한 발에 너트 1개 소모 · 너트가 없으면 피해 -50%' }, '자본주의의 맛.');
P('ammo_glitter', 'ammo', '반짝이탄', 5, ['meme'], { cost: 0.03, tier: 1, m: { dmg: -0.1 }, fx: { rad: 2 } }, '한번 묻으면 절대 안 지워진다.');

/* ───────────── 부착물 ───────────── */
P('acc_keyring', 'acc', '대피소 열쇠고리', 0, ['junk'], { m: { loot: 5, crit: 2 } }, "'404호' 라고 적혀 있다.");
P('acc_sticker', 'acc', "'초보운전' 스티커", 5, ['meme'], { tier: 0, m: { recoil: -0.08, spread: -0.05 } }, '양보 부탁드립니다. 저도 제가 무서워요.');
P('acc_cup', 'acc', '컵홀더', 1, ['office'], { m: { reload: -0.12 } }, '재장전 중에도 커피는 식지 않는다.');
P('acc_dice', 'acc', '주사위 인형', 1, ['junk'], { m: { crit: 8 } }, '룸미러에 걸려 있던 것. 운이 좋아지는 기분.');
P('acc_flash', 'acc', '손전등', 1, ['junk'], { m: { crit: 5, spread: -0.05 }, sp: { thermal: 1 }, note: '안개를 걷어낸다' }, '어둠 속에서 놈들의 눈이 반짝인다.');
P('acc_energy', 'acc', '에너지 드링크', 1, ['kitchen'], { m: { rpm: 0.08, reload: -0.08, recoil: 0.1 } }, '심장이 뛴다. 너무.');
P('acc_dumbbell', 'acc', '덤벨', 1, ['junk'], { m: { recoil: -0.2, dmg: 0.05, reload: 0.1 } }, '쏘면서 근성장.');
P('acc_gauge', 'acc', '압력계', 2, ['pipe'], { m: { dmg: 0.08, vel: 0.1 } }, '바늘이 빨간 구역에 있다. 원래 그렇다.');
P('acc_bipod', 'acc', '양각대', 2, ['mil'], { m: { elite: 10, recoil: -0.3, spread: -0.15 } }, '다리가 둘이면 안정적이다.');
P('acc_lasersight', 'acc', '레이저 사이트', 2, ['mil'], { m: { spread: -0.22 } }, '빨간 선 끝에 탄이 간다.');
P('acc_charm', 'acc', '삼재 부적', 2, ['meme'], { m: { crit: 10, jam: -3 } }, '삼재를 막아준다. 걸림도 막아준다.');
P('acc_blackbox', 'acc', '블랙박스', 2, ['tech'], { m: { loot: 20 } }, '증거 영상은 비싸게 팔린다.');
P('acc_protein', 'acc', '프로틴 쉐이커', 2, ['kitchen'], { m: { dmg: 0.12, reload: 0.05 } }, '근손실 방지.');
P('acc_tax', 'acc', '세금 고지서', 2, ['office'], { m: { swarm: -10 }, sp: { tax: 0.3 }, note: '누진세: 정예·보스에게 피해 +30% (서민에게는 -10%)' }, '죽음과 세금은 피할 수 없다.');
P('acc_stamp', 'acc', '결재 도장', 3, ['office'], { m: {}, sp: { stamp: 10 }, note: "10발마다 '결재 완료': 확정 치명타 (피해 ×2.5)" }, '쾅.');
P('acc_letter', 'acc', '어머니의 손편지', 3, [], { m: {}, fx: { leech: 1.5 } }, "'밥은 먹고 다니냐.'");
P('acc_chainsaw', 'acc', '전기톱 총검', 3, ['junk'], { m: {}, sp: { thorns: 30 }, note: '문을 때리는 적에게 초당 30 피해' }, '부릉부릉.');
P('acc_wifi', 'acc', '와이파이 공유기', 3, ['tech'], { m: { vel: 0.2 }, fx: { homing: 0.5 } }, '5G 유도탄. 비밀번호는 1234.');
P('acc_fridge', 'acc', '미니 냉장고', 3, ['kitchen', 'tech'], { m: { reload: -0.05 }, fx: { freeze: 0.15 } }, '탄을 시원하게 보관한다.');
P('acc_parasite', 'acc', '공생 기생충', 3, ['bio'], { m: { dmg: 0.1, rpm: 0.08 }, fx: { leech: 0.3 } }, '당신의 팔과 총을 연결한다. 떼어낼 수 있... 겠지?');
P('acc_rgb', 'acc', 'RGB LED 스트립', 5, ['tech', 'meme'], { tier: 1, m: { rpm: 0.12 } }, 'RGB는 성능이다. 과학적으로 증명됨(아님).');
P('acc_duck', 'acc', '고무 오리', 5, ['meme'], { tier: 2, m: {}, sp: { duck: 0.03 }, note: '명중 시 3% 확률로 하늘에서 거대 오리가 떨어진다' }, '디버깅 완료.');
P('acc_spinner', 'acc', '피젯 스피너', 5, ['meme'], { tier: 1, m: { elite: -10, swarm: 10, rpm: 0.2, spread: 0.2 } }, '한때 세상을 지배했던 유물.');
P('acc_horn', 'acc', '배달 오토바이 경적', 5, ['meme', 'music'], { tier: 1, m: {}, sp: { horn: 1 }, note: "재장전할 때마다 '빵빵': 문 앞의 적을 밀쳐낸다" }, '빵빵.');
P('acc_coupon', 'acc', '치킨 쿠폰 10장', 5, ['meme', 'kitchen'], { tier: 2, m: { loot: 15 }, sp: { coupon: 10 }, note: '10마리 처치마다 문 수리 +6' }, '열 마리 잡으면 한 마리 서비스.');

// 가격/제작비
const TIER_PRICE = [14, 40, 120, 320, 800];
function partPrice(p) {
  let v = TIER_PRICE[p.tier] * (p.slot === 'receiver' ? 1.7 : 1);
  if (p.r === 5) v *= 1.15;
  return Math.round(v);
}
function partCraftCost(p) {
  const t = p.tier;
  const base = [
    { scrap: 6 },
    { scrap: 12, powder: 3 },
    { scrap: 22, powder: 8, circuit: 2 },
    { scrap: 34, powder: 12, circuit: 9, goo: 4 },
    { scrap: 60, powder: 24, circuit: 20, goo: 10, core: 1 },
  ][t];
  const c = Object.assign({}, base);
  const k = p.slot === 'receiver' ? 1.6 : 1;
  for (const key in c) if (key !== 'core') c[key] = Math.ceil(c[key] * k);
  if (p.tags.includes('tech')) c.circuit = (c.circuit || 0) + 2 + t * 2;
  if (p.tags.includes('bio')) c.goo = (c.goo || 0) + 3 + t * 2;
  if (p.tags.includes('meme')) c.goo = (c.goo || 0) + 1;
  return c;
}
function partDismantle(p, q) {
  const c = partCraftCost(p), out = {};
  for (const key in c) {
    if (key === 'core') continue;
    const v = Math.floor(c[key] * (0.4 + 0.1 * (q || 0)));
    if (v > 0) out[key] = v;
  }
  if (!out.scrap) out.scrap = 2;
  return out;
}
