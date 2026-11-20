// BUNKER 404 — 세계 데이터: 자원, 상인, 원정지, 시설, 사건, 이장님 방송
'use strict';

const RES = {
  nuts: { name: '너트', icon: '🔩', desc: '대피소 공용 화폐. 볼트는 인정 안 한다.' },
  scrap: { name: '고철', icon: '⚙️', desc: '모든 것의 재료.' },
  powder: { name: '화약', icon: '🧨', desc: '탄약과 폭발물의 재료.' },
  circuit: { name: '회로', icon: '🔌', desc: '하이테크 파츠의 재료.' },
  goo: { name: '점액', icon: '🧪', desc: '돌연변이에서 나온 그것. 만지지 마시오.' },
  core: { name: '코어', icon: '💠', desc: '보스에게서만 나오는 결정. 유물 제작에 필요.' },
};
const RES_KEYS = ['nuts', 'scrap', 'powder', 'circuit', 'goo', 'core'];

const MERCHANTS = {
  scrap: { name: '고물상 김씨', emoji: '🧔', min: 1, tiers: [0, 1], n: 7, priceMul: 0.9, mats: [['scrap', 10, 14], ['powder', 5, 16]],
    greet: ['"고물~ 고물 삽니다~ 냉장고, 세탁기, 총열~"', '"이건 진짜 좋은 고물이여. 내가 보증혀."', '"세상이 망해도 고물은 돈이 되는 법이지."'] },
  turnip: { name: '순무마켓 직거래', emoji: '🥕', min: 3, tiers: [1, 2, 3], n: 3, priceMul: 0.5, scam: 0.25,
    greet: ['"순무이세요? 네고는 안 됩니다."', '"쿨거래 시 덤 드려요. (안 드림)"', '"미개봉 새 상품이에요. 박스만 좀 눌렸어요."'] },
  vending: { name: '걸어다니는 자판기', emoji: '🤖', min: 4, gacha: true,
    greet: ['"삐빅. 확률형 아이템을 판매합니다. 확률은 공개되어 있습니다. 삐빅."', '"삐빅. 이번엔 나올 것 같은 기분이 들지 않으십니까? 삐빅."'] },
  ammo: { name: '탄약 장수 탄 씨', emoji: '🎒', min: 4, tiers: [0, 1, 1, 2, 2, 3], slot: 'ammo', n: 7, priceMul: 0.9, mats: [['powder', 10, 22], ['powder', 30, 58]],
    greet: ['"탄 팝니다~ 싼 탄, 비싼 탄, 이상한 탄~"', '"비싼 탄은 보스한테 쓰쇼. 바퀴한테 쏘면 내가 다 아깝소."', '"화약은 넉넉히 사 두쇼. 떨어지면 재생탄으로 버텨야 하니까."', '"성이 탄 씨요. 진짜요."'] },
  broker: { name: "군납 브로커 '박 상사'", emoji: '🪖', min: 6, tiers: [2, 2, 3], tags: ['mil'], n: 6, priceMul: 1.05, mats: [['powder', 10, 28]],
    greet: ['"쉿. 이건 장부에 없는 물건이야."', '"전역할 때 좀 챙겨 나왔지. 한 트럭 정도."', '"현금? 너트만 받아."'] },
  doc: { name: '떠돌이 과학자 닥터 오', emoji: '👩‍🔬', min: 9, tiers: [2, 3, 3], tags: ['tech', 'bio'], n: 5, priceMul: 1.1, mats: [['circuit', 5, 40], ['goo', 6, 30]],
    greet: ['"윤리위원회? 그게 아직 있나요?"', '"이건 시제품이에요. 부작용은... 써 보면 알겠죠."', '"과학의 이름으로! 그리고 너트의 이름으로!"'] },
  relic: { name: '유물 수집가 마담 조', emoji: '🧙‍♀️', min: 16, tiers: [3, 4, 4], n: 4, priceMul: 1.15,
    greet: ['"이건 종말 이전의 물건이란다. 값은... 네 형편에 달렸지."', '"좋은 물건은 주인을 알아본단다. 지갑도 알아보고."'] },
};

const LOCATIONS = [
  { id: 'junkyard', name: '폐차장', emoji: '🚗', ap: 1, unlock: 1, danger: 0.08, loot: { scrap: [8, 14], nuts: [3, 8], powder: [0, 2] }, partChance: 0.3, tiers: [0, 0, 1], tags: ['junk', 'pipe'],
    desc: '고철의 바다. 가끔 쓸 만한 게 굴러다닌다.', lines: ['트렁크에서 누군가의 비상금을 찾았다.', '엔진룸에 둥지를 튼 바퀴 가족과 눈이 마주쳤다. 서로 못 본 척했다.', '폐차 더미가 무너져 하마터면 깔릴 뻔했다.'] },
  { id: 'mart', name: '폐허 마트', emoji: '🛒', ap: 1, unlock: 1, danger: 0.1, loot: { nuts: [10, 18], scrap: [2, 5], goo: [0, 2] }, partChance: 0.3, tiers: [0, 1, 1], tags: ['kitchen', 'office', 'meme'],
    desc: '1+1 행사는 끝났지만 주방 코너는 아직 쓸 만하다.', lines: ['시식 코너의 돌연변이가 아직도 시식을 권한다.', "'카트는 제자리에' 안내문을 무시했다. 죄책감이 든다.", '계산대에 너트를 두고 나왔다. 양심은 지켰다.'] },
  { id: 'checkpoint', name: '군 검문소', emoji: '🚧', ap: 1, unlock: 4, danger: 0.22, loot: { powder: [5, 10], scrap: [3, 7], nuts: [2, 6] }, partChance: 0.38, tiers: [1, 2, 2], tags: ['mil'],
    desc: '화약과 군용 부품의 보고. 놈들도 그걸 안다.', lines: ['초소에 "근무 중 이상 무" 라고 적힌 일지가 있었다. 마지막 날짜는 3년 전.', '탄약고 자물쇠를 네일건으로 땄다.', 'PX 냉동고에 만두가 남아 있었다. 먹지는 않았다.'] },
  { id: 'subway', name: '지하철 역사', emoji: '🚇', ap: 1, unlock: 7, danger: 0.25, loot: { circuit: [2, 5], goo: [3, 7], nuts: [5, 12] }, partChance: 0.32, tiers: [1, 2, 2], tags: ['tech', 'bio', 'music'],
    desc: '어둡고 축축하다. 회로와 점액이 풍부하다.', lines: ['"이번 역은 종말, 종말역입니다." 안내방송이 아직 나온다.', '개찰구를 뛰어넘었다. 요금은 내지 않았다.', '버스킹하던 악기가 그대로 남아 있었다.'] },
  { id: 'pcbang', name: 'PC방 폐허', emoji: '🖥️', ap: 1, unlock: 10, danger: 0.15, loot: { circuit: [4, 8], nuts: [4, 10] }, partChance: 0.45, tiers: [1, 2, 3], tags: ['tech', 'meme', 'office'],
    desc: 'RGB가 아직 깜빡인다. 누군가의 랭크 게임은 영원히 끝나지 않았다.', lines: ['"자리 있어요?" 라고 물었지만 대답이 없었다.', '컵라면 국물이 화석이 되어 있었다.', '누군가의 모니터에 "GG" 가 떠 있었다.'] },
  { id: 'lab', name: '지하 연구소', emoji: '🧬', ap: 2, unlock: 14, danger: 0.35, loot: { circuit: [7, 13], goo: [7, 13], powder: [4, 8] }, partChance: 0.7, tiers: [2, 3, 3], tags: ['tech', 'bio'],
    desc: '모든 것이 시작된 곳. 위험하지만 시제품이 굴러다닌다. (활동력 2)', lines: ['"실험체 404: 폐기 실패" 라는 메모를 봤다. 못 본 걸로 하자.', '배양조 안의 무언가가 손을 흔들었다. 같이 흔들어 줬다.', '연구 일지 마지막 줄: "괜찮겠지."'] },
];

// 시설 업그레이드
const UPGRADES = [
  { id: 'gate', name: '철문 보강', emoji: '🚪', max: 5, desc: lv => `문 최대 내구도 ${100 + 60 * lv} → ${100 + 60 * (lv + 1)}`, cost: lv => ({ scrap: 20 + 22 * lv, nuts: 20 * lv }) },
  { id: 'turret', name: '자동 포탑', emoji: '🤖', max: 2, desc: lv => lv === 0 ? "작업대의 '포탑' 총을 자동으로 쏴 준다 (연사 50%)" : '포탑 연사 50% → 85%', cost: lv => lv === 0 ? { scrap: 40, circuit: 5, nuts: 50 } : { scrap: 90, circuit: 22, nuts: 220 } },
  { id: 'wire', name: '가시 철조망', emoji: '➰', max: 3, desc: lv => `문 앞의 적 둔화 ${[0, 25, 35, 45][lv]}% → ${[25, 35, 45][lv]}% + 지속 피해`, cost: lv => ({ scrap: 25 + 30 * lv, nuts: 15 * lv }) },
  { id: 'mines', name: '지뢰밭', emoji: '💣', max: 3, desc: lv => `매 전투마다 지뢰 ${lv * 2}개 → ${(lv + 1) * 2}개 자동 매설`, cost: lv => ({ powder: 14 + 16 * lv, scrap: 10 + 10 * lv }) },
  { id: 'light', name: '탐조등', emoji: '🔦', max: 1, desc: () => '안개 무효 · 모든 총 치명타 +5%', cost: () => ({ scrap: 30, circuit: 8 }) },
  { id: 'tower', name: '감시탑', emoji: '🗼', max: 3, desc: lv => `달력의 적 구성 예보 ${2 + lv * 3}일 → ${2 + (lv + 1) * 3}일`, cost: lv => ({ scrap: 18 + 20 * lv, circuit: 2 + 4 * lv }) },
  { id: 'bench', name: '작업대 확장', emoji: '🔧', max: 3, desc: lv => `강화 성공률 +${lv * 8}% → +${(lv + 1) * 8}% · 분해 수율 증가`, cost: lv => ({ scrap: 30 + 35 * lv, circuit: 3 + 6 * lv, nuts: 30 + 40 * lv }) },
  { id: 'coffee', name: '믹스커피 자판기', emoji: '☕', max: 2, desc: lv => `하루 활동력 ${3 + lv} → ${4 + lv}`, cost: lv => lv === 0 ? { scrap: 35, circuit: 6, nuts: 80 } : { scrap: 90, circuit: 25, nuts: 350 } },
  { id: 'recycle', name: '분리수거장', emoji: '♻️', max: 3, desc: lv => `매일 아침 고철 +${lv * 5} → +${(lv + 1) * 5}`, cost: lv => ({ scrap: 20 + 20 * lv, nuts: 40 + 50 * lv }) },
  { id: 'bulkhead', name: '비상 격벽', emoji: '❤️', max: 2, desc: () => '함락 허용 횟수(목숨) +1', cost: lv => ({ scrap: 80 + 60 * lv, core: 1 }) },
];

// 아침 사건. run(G) 은 결과 문장을 반환한다.
const EVENTS = {
  dog: { emoji: '🐕', title: '떠돌이 개', text: '문 앞에 꾀죄죄한 개 한 마리가 앉아 있다. 당신을 보더니 꼬리를 흔든다. 방사능 때문인지 꼬리가 조금 빛난다.',
    choices: [
      { label: '받아준다', hint: '너트 -10', can: G => G.s.res.nuts >= 10, run: G => { G.addRes('nuts', -10); G.s.flags.dog = true; return "개는 '사공사'라는 이름을 얻었다. 매일 아침 어디선가 고철을 물어온다. 그리고 쓰다듬을 수 있다. (기지 화면에서)"; } },
      { label: '내쫓는다', run: () => '개는 슬픈 눈으로 사라졌다. 이장님이 당신을 3초간 말없이 바라봤다.' },
    ] },
  can: { emoji: '🥫', title: '수상한 통조림', text: '창고 구석에서 통조림을 발견했다. 유통기한은 한참 전. 뚜껑이 빵빵하게 부풀어 있다.',
    choices: [
      { label: '먹는다', hint: '도박', run: G => { if (U.chance(0.6)) { G.s.ap += 2; return '의외로 멀쩡했다! 힘이 솟는다. (오늘 활동력 +2)'; } G.s.ap = Math.max(0, G.s.ap - 1); return '화장실에서 반나절을 보냈다. (오늘 활동력 -1)'; } },
      { label: '탄약 재료로 쓴다', hint: '점액 +6', run: G => { G.addRes('goo', 6); return '내용물은 훌륭한 생화학 재료였다. 뭐가 들어 있었는지는 알고 싶지 않다.'; } },
    ] },
  cult: { emoji: '🙏', title: '방문 전도', text: '"도를 믿으십니까?" 문 앞에 누군가 서 있다. 사람인지 돌연변이인지 애매하다.',
    choices: [
      { label: '얘기를 들어본다', hint: '너트 -15', can: G => G.s.res.nuts >= 15, run: G => { G.addRes('nuts', -15); G.addPart('acc_charm', 0); return "두 시간짜리 설교는 지루했지만 '삼재 부적'을 받았다."; } },
      { label: '총을 보여준다', run: G => { if (U.chance(0.5)) { G.addRes('nuts', 20); return '혼비백산 도망치며 시주함을 떨어뜨렸다. (너트 +20)'; } return '"총에도 도가 깃들어 있군요." 감탄하고는 그냥 갔다.'; } },
      { label: '문을 닫는다', run: () => '철컥. 문틈으로 전단지가 한 장 들어왔다.' },
    ] },
  noise: { emoji: '😤', title: '주민 민원', text: '"밤마다 총소리 때문에 잠을 못 자겠어요!" 주민 대표가 서명 용지를 들고 찾아왔다.',
    choices: [
      { label: '소음기를 달았다고 보여준다', hint: '주무기에 소음기 필요', can: G => { const g = G.gunStats(0); return g && g.suppressed; }, run: G => { G.addRes('nuts', 45); return '주민들이 감동해 너트를 모아 줬다. (너트 +45) 배려는 돈이 된다.'; } },
      { label: '귀마개를 만들어 돌린다', hint: '고철 -10', can: G => G.s.res.scrap >= 10, run: G => { G.addRes('scrap', -10); return '고철로 만든 귀마개는 무겁지만 효과는 확실했다.'; } },
      { label: '"그럼 직접 싸우시든가요"', run: G => { G.s.flags.apPenalty = 1; return '주민 대표가 단단히 삐졌다. 내일 아침 식사가 안 나온다. (내일 활동력 -1)'; } },
    ] },
  sos: { emoji: '📻', title: '이웃 대피소의 무전', text: '"치직... 여기는 403 대피소... 문이 버티질 못한다... 고철이 급하다... 치직..."',
    choices: [
      { label: '고철을 보낸다', hint: '고철 -25', can: G => G.s.res.scrap >= 25, run: G => { G.addRes('scrap', -25); G.s.flags.sosDay = G.s.day + 3; return '드론에 고철을 실어 보냈다. "은혜는 잊지 않겠다... 치직..."'; } },
      { label: '못 들은 척한다', run: () => '무전기를 껐다. 종말에는 각자도생이다. ...아마도.' },
    ] },
  blackout: { emoji: '🔌', title: '정전', text: '발전기가 덜컹거리더니 멈췄다. 대피소가 어둠에 잠겼다. 탐조등도 꺼졌다.',
    choices: [
      { label: '회로를 갈아 끼운다', hint: '회로 -3', can: G => G.s.res.circuit >= 3, run: G => { G.addRes('circuit', -3); return '발전기가 다시 돌기 시작했다. 믹스커피 자판기도 무사하다.'; } },
      { label: '발로 찬다', hint: '50%', run: G => { if (U.chance(0.5)) return '쾅! 발전기가 돌아왔다. 역시 기계는 때려야 한다.'; G.today().night.fog = true; return '발가락만 아프다. 오늘 밤은 칠흑같이 어둡다. (오늘 밤 안개)'; } },
    ] },
  kid: { emoji: '🧒', title: '꼬마 발명가', text: '대피소 꼬마가 뭔가를 내민다. "아저씨! 제가 총 부품 만들었어요!" 딱 봐도 수상하다.',
    choices: [
      { label: '고맙게 받는다', run: G => { const id = G.rollPart({ rarity: 5 }); G.addPart(id, 0); return `꼬마가 준 건 '${PARTS[id].name}' 였다. ...이걸 어디에 쓰지?`; } },
      { label: '재료를 주고 더 잘 만들어 오라고 한다', hint: '고철 -8', can: G => G.s.res.scrap >= 8, run: G => { G.addRes('scrap', -8); const id = G.rollPart({ rarity: 5 }); G.addPart(id, 2); return `한 시간 뒤 꼬마가 돌아왔다. '${PARTS[id].name} +2'! 이 아이, 재능이 있다.`; } },
    ] },
  rat: { emoji: '🐀', title: '창고의 불청객', text: '창고에서 찍찍 소리가 난다. 고양이만 한 변이 쥐가 너트 자루를 갉고 있다.',
    choices: [
      { label: '직접 잡는다', hint: '활동력 -1 · 점액 +7', can: G => G.s.ap >= 1, run: G => { G.s.ap -= 1; G.addRes('goo', 7); return '30분의 추격전 끝에 잡았다. 쥐는 훌륭한 점액 공급원이 되었다.'; } },
      { label: '덫을 놓는다', hint: '고철 -5 · 점액 +3', can: G => G.s.res.scrap >= 5, run: G => { G.addRes('scrap', -5); G.addRes('goo', 3); return '덫에 꼬리만 남기고 도망갔다. 꼬리라도 건졌다.'; } },
      { label: '내버려 둔다', run: G => { const n = Math.ceil(G.s.res.nuts * 0.1); G.addRes('nuts', -n); return `쥐가 너트 ${n}개를 물고 사라졌다. 어디다 쓰려는 걸까.`; } },
    ] },
  gamble: { emoji: '🎲', title: '떠돌이 도박사', text: '"홀이냐 짝이냐, 딱 한 판만 하고 가쇼." 수상한 남자가 주사위 컵을 흔든다.',
    choices: [
      { label: '20 너트 건다', can: G => G.s.res.nuts >= 20, run: G => { if (U.chance(0.5)) { G.addRes('nuts', 20); return '짝! 이겼다. (너트 +20) "한 판 더?" 는 정중히 거절했다.'; } G.addRes('nuts', -20); return '홀. 졌다. (너트 -20) 남자가 씩 웃는다.'; } },
      { label: '60 너트 건다', can: G => G.s.res.nuts >= 60, run: G => { if (U.chance(0.48)) { G.addRes('nuts', 60); return '이겼다!! (너트 +60) 남자의 표정이 굳었다.'; } G.addRes('nuts', -60); return '졌다. (너트 -60) 인생은 실전이다.'; } },
      { label: '도박은 패가망신의 지름길', run: () => '"재미없는 양반이네." 남자는 다음 대피소로 떠났다.' },
    ] },
  mutant: { emoji: '🧟', title: '말하는 돌연변이', text: '"나... 안 싸워... 거래... 하자..." 돌연변이 하나가 점액 덩어리를 내밀며 고철을 가리킨다.',
    choices: [
      { label: '거래한다', hint: '고철 -15 · 점액 +14', can: G => G.s.res.scrap >= 15, run: G => { G.addRes('scrap', -15); G.addRes('goo', 14); return '"고마워... 단골... 될게..." 의외로 매너가 좋다.'; } },
      { label: '쏜다', hint: '점액 +5', run: G => { G.addRes('goo', 5); const n = G.today().night; if (n.threat > 0 && n.threat < 5) n.threat++; return '소문이 퍼졌다. 오늘 밤 놈들이 더 화가 나 있다. (오늘 밤 위협 +1)'; } },
      { label: '정중히 거절한다', run: () => '"아쉽다... 다음에... 또 올게..." 꾸벅 인사하고 갔다.' },
    ] },
  birthday: { emoji: '🎂', title: '이장님 생신', text: '오늘은 이장님 생신이다. 본인이 아침 방송으로 세 번이나 알렸다.',
    choices: [
      { label: '선물을 드린다', hint: '너트 -30', can: G => G.s.res.nuts >= 30, run: G => { G.addRes('nuts', -30); const id = G.rollPart({ day: G.s.day + 6, luck: 1 }); G.addPart(id, 1); return `이장님이 감동해 장롱 속 가보를 꺼내 주셨다. '${PARTS[id].name} +1' 획득!`; } },
      { label: '축하 노래를 불러 드린다', run: G => { G.s.ap += 1; return '음정은 틀렸지만 미역국을 얻어먹었다. (오늘 활동력 +1)'; } },
    ] },
  contest: { emoji: '🎯', title: '대피소 사격 대회', text: '주민들이 심심풀이로 사격 대회를 열었다. 상품은 너트 자루. 참가 조건: 자기 총.',
    choices: [
      { label: '주무기로 참가한다', hint: '정확도 70 이상이면 우승', run: G => { const g = G.gunStats(0); if (g && g.acc >= 70) { G.addRes('nuts', 60); return `'${g.name}'(으)로 과녁 한가운데를 뚫었다. 우승! (너트 +60)`; } return '탄이 과녁 대신 이장님 화분을 맞혔다. 참가상으로 박수를 받았다.'; } },
      { label: '구경만 한다', run: G => { G.addRes('scrap', 6); return '구경하다가 바닥의 탄피를 주웠다. (고철 +6)'; } },
    ] },
};

// 이장님 아침 방송
const BROADCAST = {
  intro: ['아아, 마이크 테스트. 하나, 둘. 이장입니다.', '아아, 주민 여러분께 알립니다. 이장입니다.', '에- 또, 아침 방송 시작하겠습니다. 이장입니다.', '아아. 들리십니까. 안 들리면 손 드세요. 이장입니다.'],
  quiet: ['오늘 밤은 조용할 예정이니, 총포상 양반은 딴짓 말고 총이나 고치세요.', '오늘 밤은 놈들이 안 온답니다. 그렇다고 문을 열어 두진 마세요.', '모처럼 조용한 밤입니다. 내일을 준비하기 좋은 날이지요.'],
  wave: [
    ['오늘 밤 손님이 좀 옵니다. 대단치는 않아요.', '오늘 밤은 몇 마리 얼쩡거리는 수준입니다.'],
    ['오늘 밤 돌연변이가 몰려올 예정이오니 빨래는 미리 걷어 주세요.', '오늘 밤 놈들이 옵니다. 늘 있는 일이지요.'],
    ['오늘 밤은 꽤 많이 옵니다. 총포상 양반, 준비 단단히 하세요.', '감시탑에서 꽤 큰 무리를 봤답니다. 탄창 넉넉히 챙기세요.'],
    ['오늘 밤은 심상치 않습니다. 노약자는 지하 2층으로 대피하세요.', '큰 무리가 옵니다. 총포상 양반만 믿습니다. 부담 주려는 건 아니고요.'],
    ['오늘 밤은... 에... 유서는 서랍 두 번째 칸에 넣어 주세요.', '역대급 무리입니다. 이장도 오늘은 삽 들고 나갑니다.'],
  ],
  blood: ['그리고 오늘은 블러드문입니다. 놈들이 평소보다 사납고, 전리품은 1.5배랍니다.', '달이 붉습니다. 불길하지만 솔직히 벌이는 좋은 날이지요.'],
  fog: ['밤안개가 짙게 낀답니다. 가까이 올 때까지 안 보일 테니 조심하세요.'],
  boss: {
    boss_roach: '오늘 밤... 그분이 오십니다. 이름은 말하지 않겠습니다. 다들 아시죠. 바로 그... 선생님.',
    boss_gym: "오늘 밤은 '3대 500' 관장이 온답니다. 회원 가입 권유는 정중히 거절하세요.",
    boss_redev: '오늘 밤, 재개발 조합장이 포크레인을 끌고 옵니다. 우리 대피소는 재개발 구역이 아닙니다! 끝까지 지킵시다!',
  },
  merchant: id => `오늘은 ${MERCHANTS[id].name}가 찾아옵니다. 지갑 단속 잘하세요.`,
  supply: ['오늘은 보급품이 투하된답니다. 누가 보내는지는 아무도 모릅니다.'],
  rain: ['오늘은 산성비가 내립니다. 원정은 못 나가니 우산 쓰지 말고 그냥 나가지 마세요.'],
  recycle: ['오늘은 분리수거의 날입니다. 파츠 분해 수율이 두 배! 페트병 라벨은 떼고 버리세요.'],
  tips: [
    '적의 머리를 맞히면 훨씬 아픕니다. 이장도 젊을 땐 명사수였지요.',
    '같은 계열 파츠를 3개 이상 모으면 세트 효과가 생긴답니다.',
    '철갑이한테는 철갑탄이나 산성이 좋다고 합니다. 아니면 머리를 쏘세요.',
    '뚱보는 멀리서 터뜨리세요. 문 앞에서 터지면 청소는 총포상 양반 몫입니다.',
    '달력을 미리 봐 두면 어떤 총을 준비할지 알 수 있지요.',
    '안 쓰는 파츠는 분해하세요. 고철은 거짓말을 안 합니다.',
    '한 번 가져 본 파츠는 도면이 등록돼서 다시 만들 수 있답니다.',
    '강화는 +3부터 실패하면 등급이 떨어질 수 있습니다. 욕심이 화를 부르지요.',
    '포탑을 지으면 세 번째 총이 알아서 쏴 줍니다. 세상 참 좋아졌어요.',
    '총알배송 놈을 잡으면 택배 상자를 떨굽니다. 놓치면 부재중 딱지만 남고요.',
    '응원단장이 보이면 그놈부터 잡으세요. 주변 놈들이 신나서 뛰어옵니다.',
    '젤리 놈들은 소금에 약하답니다. 김장철 생각이 나는군요.',
    '보스 전날 밤은 대체로 조용합니다. 그때 준비하세요.',
    '시험 사격장에서 총을 미리 쏴 볼 수 있습니다. 화분은 쏘지 마시고요.',
  ],
  outro: ['이상입니다. 오늘도 무사히.', '이상, 이장이었습니다.', '끝. 아, 그리고 3층 화장실 막혔습니다.', '이상입니다. 분리수거는 목요일입니다.'],
};

// 전투 중 연속 처치 외침
const COMBO_SHOUTS = [[5, '손맛 좋고!'], [10, '이게 되네?'], [18, '이장님이 보고 계셔!'], [28, '대피소의 자랑!'], [40, '학살 맛집'], [60, '재난 그 자체'], [90, '전설의 총포상'], [130, '종말을 끝내는 자']];
const DEATH_QUIPS = ['문이 뚫렸다. 이장님이 삽을 들었다.', '대피소 404: 찾을 수 없음.', '놈들이 믹스커피 자판기를 털어 갔다.', '주민들이 당신의 총을 원망스럽게 바라본다.'];

// 오늘의 의뢰 (주민 게시판) — 밤 전투의 추가 목표. check(결과, 목표치, 주무기 스탯)
const QUESTS = {
  heads: { text: n => `헤드샷 ${n}회`, n: d => Math.round(5 + d * 0.8), prog: r => r.heads, check: (r, n) => r.heads >= n, who: '사격 동호회' },
  combo: { text: n => `${n}연속 처치`, n: d => Math.round(6 + d * 0.9), prog: r => r.maxCombo, check: (r, n) => r.maxCombo >= n, who: '이장님' },
  perfect: { text: () => '문에 흠집 없이 방어 (S등급)', n: () => 0, check: r => r.grade === 'S', who: '시설 관리인' },
  acc: { text: n => `명중률 ${n}% 이상`, n: () => 55, check: (r, n) => r.acc >= n, who: '탄약 창고지기' },
  meme: { text: () => '밈 파츠 3개 이상인 주무기로 방어', n: () => 0, check: (r, n, g) => !!g && (g.tagCount.meme || 0) >= 3, who: '대피소 꼬마들' },
  junk: { text: () => '고물 파츠 4개 이상인 주무기로 방어', n: () => 0, check: (r, n, g) => !!g && (g.tagCount.junk || 0) >= 4, who: '고물상 김씨' },
  second: { text: n => `보조무기로 ${n}마리 처치`, n: d => Math.round(4 + d * 0.5), prog: r => (r.wkills && r.wkills[1]) || 0, check: (r, n) => ((r.wkills && r.wkills[1]) || 0) >= n, who: '무기 평론가 할머니' },
  quiet: { text: () => '소음기 단 주무기로 방어', n: () => 0, check: (r, n, g) => !!g && g.suppressed, who: '주민 대표' },
};
