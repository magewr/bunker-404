// BUNKER 404 — 추가 탄약 36종 (탄약 경제)
// cost = 한 발당 화약 소모량 (몸통 구경 보정 전). 화약이 떨어지면 그 전투에서는 무료 '재생탄'으로 바뀐다.
//   무료 0  ·  저가 0.01~0.04 (연사·잡몹용)  ·  표준 0.05~0.1  ·  고급 0.15~0.3 (대보스)  ·  특수 0.4~0.8 (보스 킬러)
'use strict';

/* ───────────── 무료: 주워 쓰는 것들. 약하거나 제멋대로다 ───────────── */
P('ammo_bearing', 'ammo', '볼베어링', 0, ['pipe'], { m: { pierce: 1, dmg: -0.1, spread: 0.15, jam: 1 } }, '배관 밸브에서 빼 왔다. 그 밸브는 이제 안 잠긴다.');
P('ammo_screw', 'ammo', '녹슨 나사', 0, ['junk'], { m: { pen: 15, dmg: 0.05, jam: 2 } }, '돌려 박는 대신 쏴서 박는다. 나사산은 장식이 됐다.');
P('ammo_rice', 'ammo', '묵은쌀 산탄', 0, ['farm'], { m: { pellets: 2, dmg: -0.15, swarm: 5, spread: 0.7 } }, '3년 묵었다. 밥으로는 못 먹어도 뿌리기엔 좋다. 코앞의 잡것들용.');
P('ammo_bean', 'ammo', '서리태', 0, ['farm'], { m: { swarm: 12, elite: -15 } }, '밥에 넣으면 몸에 좋다. 총에 넣으면 놈들 몸에 나쁘다. 큰 놈은 콩을 무시한다.');
P('ammo_marble', 'ammo', '유리구슬', 0, ['toy'], { m: { dmg: -0.12, crit: 5 }, fx: { bounce: 1 } }, '구슬치기 통산 312승. 그때 딴 것들이다.');
P('ammo_tooth', 'ammo', '빠진 이빨', 0, ['bio'], { m: { dmg: -0.08, jam: 1 }, fx: { leech: 0.3 } }, '누구 건지는 모른다. 충치가 있다.');
P('ammo_pingpong', 'ammo', '탁구공', 5, ['sport', 'meme'], { tier: 0, m: { dmg: -0.4, rpm: 0.15 }, fx: { bounce: 3 } }, '똑딱똑딱 세 번 튕긴다. 아프지는 않고 기분이 나쁘다. 떼로 올 때만 쓸모 있다.');
P('ammo_bb', 'ammo', '비비탄', 1, ['toy'], { m: { dmg: -0.25, rpm: 0.3, mag: 0.5, recoil: -0.3 } }, '0.2그램. 한 발은 간지럽지만 많이, 빨리 나간다. 속성 묻히기용.');
P('ammo_golf', 'ammo', '골프공', 1, ['sport'], { m: { dmg: 0.15, knock: 30, rpm: -0.15, spread: 0.15 } }, '"포어!" 라고 외쳐도 놈들은 안 피한다.');
P('ammo_shuttle', 'ammo', '셔틀콕', 1, ['sport'], { m: { head: 0.4, spread: -0.25, vel: -0.4, dmg: -0.1 } }, '느리게 날아가 정확히 꽂힌다. 동네 체육관 에이스의 스매싱.');

/* ───────────── 저가 (0.01~0.04): 연사해도 버틸 만한 값. 떼거리 청소용, 큰 놈에겐 약하다 ───────────── */
P('ammo_buck', 'ammo', '산탄 개조탄', 1, ['mil'], { cost: 0.03, m: { pellets: 3, dmg: -0.25, swarm: 12, elite: -12, spread: 0.6, pen: -20 } }, '어떤 총이든 산탄총으로 만든다. 총의 의견은 묻지 않았다. 근거리 떼거리용.');
P('ammo_birdshot', 'ammo', '새 쫓는 산탄', 1, ['farm'], { cost: 0.02, m: { pellets: 5, dmg: -0.4, spread: 0.9, pen: -40, swarm: 10, elite: -25 } }, '참새 쫓던 물건. 비둘기와 바퀴 떼엔 특효, 큰 놈에겐 간지럼.');
P('ammo_garlic', 'ammo', '육쪽마늘탄', 1, ['farm', 'kitchen'], { cost: 0.02, m: { swarm: 15, elite: -15, dmg: -0.05 }, sp: { fear: 0.04 }, note: '4% 확률로 맞은 적이 냄새에 질려 도망친다' }, '국내산. 흡혈귀는 모르겠고 잡것들에겐 통한다.');
P('ammo_waterballoon', 'ammo', '물풍선', 1, ['toy'], { cost: 0.01, m: { dmg: -0.15, vel: -0.3 }, fx: { explode: 14, freeze: 0.08 } }, '터지면 주변이 다 젖는다. 젖은 놈은 굼뜨다. 맞아서 죽는 놈은 드물다.');
P('ammo_coin', 'ammo', '저금통 동전탄', 5, ['meme'], { tier: 1, cost: 0.02, m: { dmg: -0.15, spread: 0.15 }, fx: { gold: 25 } }, '돈을 쏴서 돈을 번다. 이것이 투자다.');
P('ammo_confetti', 'ammo', '색종이 폭죽탄', 5, ['toy', 'meme'], { tier: 1, cost: 0.01, m: { pellets: 2, dmg: -0.6, spread: 0.5, loot: 20 } }, '생일 축하합니다. 맞은 놈 말고.');
P('ammo_flechette', 'ammo', '플레셰트 화살탄', 2, ['mil'], { cost: 0.04, m: { pierce: 3, pen: 15, dmg: -0.2, elite: -10 } }, '줄 서서 오는 놈들을 꼬치로 꿴다. 한 놈만 있으면 손해.');
P('ammo_frag', 'ammo', '파편탄', 2, ['mil'], { cost: 0.04, m: { dmg: -0.2, blast: 20, elite: -20 }, fx: { explode: 14 } }, '작게, 자주, 여러 놈에게. 큰 놈은 따끔해할 뿐이다.');
P('ammo_pesticide', 'ammo', '농약탄', 2, ['farm'], { cost: 0.03, m: { swarm: 25, elite: -25 }, fx: { acid: 1 } }, '마을 창고 맨 안쪽에 있던 것. "희석해서 쓸 것" 이라고 적혀 있었다.');
P('ammo_scythe', 'ammo', '낫날 탄두', 2, ['farm'], { cost: 0.04, m: { pierce: 1, elite: -20 }, sp: { opener: 40 }, note: '체력이 가득 찬 적에게 피해 +40% (잡몹 한 방 컷)' }, '벼 베듯 벤다. 첫 낫질이 제일 깊다.');
P('ammo_domino', 'ammo', '도미노탄', 5, ['toy', 'meme'], { tier: 3, cost: 0.04, m: { elite: -30 }, sp: { overkill: 1, momentum: 4 }, note: '처치 시 남는 피해가 옆의 적에게 옮겨간다 · 처치마다 3초간 피해 +4% (최대 5중첩)' }, '하나가 쓰러지면 다 쓰러진다. 큰 놈은 안 쓰러진다.');

/* ───────────── 표준 (0.05~0.1): 쓰임새가 뚜렷한 기능탄 ───────────── */
P('ammo_tracer', 'ammo', '예광탄', 2, ['mil'], { cost: 0.05, m: { spread: -0.2, crit: 6, dmg: -0.08 }, fx: { burn: 2 } }, '탄이 어디로 가는지 보인다. 어디서 왔는지도 보인다.');
P('ammo_subsonic', 'ammo', '아음속탄', 2, ['mil'], { cost: 0.05, m: { crit: 14, recoil: -0.2, vel: -0.35, pen: -15 } }, '소리보다 느리다. 그래서 조용하고, 그래서 늦게 도착한다.');
P('ammo_match', 'ammo', '경기용 정밀탄', 2, ['sport'], { cost: 0.08, m: { head: 0.6, spread: -0.3, rpm: -0.1, swarm: -10 } }, '사격 대표팀 창고에서 나왔다. 한 발씩 무게를 달아 놨다. 머리를 노릴 때만 값을 한다.');
P('ammo_billiard', 'ammo', '쓰리쿠션탄', 5, ['sport', 'meme'], { tier: 2, cost: 0.06, m: { dmg: -0.1, knock: 15, elite: -15 }, fx: { bounce: 3 } }, '당구장 사장님의 유산. 세 번 튕겨야 한 점.');
P('ammo_tuning', 'ammo', '소리굽쇠탄', 2, ['music'], { cost: 0.06, m: { dmg: -0.1, knock: 10 }, sp: { screech: 0.03 }, note: '3% 확률로 "삐—": 주변 적 기절' }, '정확히 라(A) 음. 놈들의 고막에는 재앙.');
P('ammo_laststeal', 'ammo', '막타 스틸탄', 5, ['meme'], { tier: 2, cost: 0.08, m: { dmg: -0.1 }, sp: { execute: 70 }, note: '체력 35% 이하인 적에게 피해 +70%' }, '남이 다 깎아 놓은 걸 먹는다. 포탑이 째려본다.');
P('ammo_magnet', 'ammo', '자석 유도탄', 3, ['tech'], { cost: 0.1, m: { dmg: -0.04, vel: -0.15, head: -0.3 }, fx: { homing: 0.8 } }, '알아서 찾아간다. 어디를 맞힐지는 못 고른다.');

/* ───────────── 고급 (0.15~0.3): 대보스·정예용. 느린 대구경 총에 물려야 수지가 맞는다 ───────────── */
P('ammo_grudge', 'ammo', '인사고과탄', 3, ['office'], { cost: 0.15, m: { swarm: -25 }, sp: { focus: 5 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +5% (최대 10중첩) · 대상이 바뀌면 초기화' }, '한번 찍힌 놈은 계속 찍힌다. 조직의 원리. 큰 놈 하나를 오래 팰 때 쓴다.');
P('ammo_am', 'ammo', '대물탄', 3, ['mil'], { cost: 0.25, m: { elite: 40, pen: 40, swarm: -30, rpm: -0.12, recoil: 0.3 } }, '원래는 장갑차용. 바퀴벌레에게 쓰면 화약이 운다.');
P('ammo_sabot', 'ammo', '분리철갑탄', 3, ['mil'], { cost: 0.18, m: { dmg: 0.1, elite: 20, vel: 0.6, head: 0.8, spread: -0.2, mag: -0.2, swarm: -15 } }, '껍데기는 버리고 알맹이만 간다. 인생도 그랬으면.');
P('ammo_cleaver', 'ammo', '정육점 탄두', 3, ['kitchen'], { cost: 0.2, m: { elite: 20, swarm: -20 }, fx: { sunder: 1.5 } }, '체력이 많은 놈일수록 많이 썰린다. 근육은 결 반대로.');

/* ───────────── 특수 (0.4~0.8): 보스 킬러. 잡몹에게 쏘면 그날로 파산 ───────────── */
P('ammo_slug', 'ammo', '텅스텐 슬러그', 4, ['mil'], { cost: 0.5, m: { dmg: 0.6, pen: 30, elite: 25, rpm: -0.25, recoil: 0.5, swarm: -40 } }, '한 발이 탄창 하나 값. 큰 놈에게만 쓰자. 제발.');
P('ammo_audit', 'ammo', '세무조사탄', 5, ['office', 'meme'], { tier: 4, cost: 0.5, m: { dmg: 0.1, swarm: -40, rpm: -0.1 }, fx: { gold: 30 }, sp: { tax: 0.7 }, note: '누진세: 정예·보스에게 피해 +70%' }, '털어서 먼지 안 나는 놈 없다. 큰 놈일수록 많이 나온다.');
P('ammo_onechamber', 'ammo', '단 한 발', 5, ['meme'], { tier: 4, cost: 0.6, m: { dmg: 1.0, elite: 28, mag: -0.6, reload: 0.2, swarm: -40 } }, '약실에 한 발. 그걸로 충분해야 한다. 잡것들에게 쓰면 파산한다.');
P('ammo_antimatter', 'ammo', '반물질 캡슐', 4, ['tech'], { cost: 0.5, m: { dmg: 0.25, elite: 35, rpm: -0.2, swarm: -30, jam: 2 }, fx: { sunder: 2, explode: 16 } }, '취급 주의. 떨어뜨리면 대피소 번호가 진짜로 없어진다.');
