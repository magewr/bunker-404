// BUNKER 404 — 파츠 확장 D: 탄창 22종 + 개머리판 22종
// 역할 표기: [군중] 잡몹 떼거리용 / [보스] 정예·보스용 / [기타] 경제·편의·밈
'use strict';

/* ───────────── 탄창 ───────────── */
// T0
P('mag_seedbag', 'mag', '씨앗 봉지', 0, ['farm'], { m: { mag: 0.3, spread: 0.1, swarm: 5 } }, '봄에 뿌리려던 건데, 지금 뿌린다.');
P('mag_capsule', 'mag', '뽑기 캡슐', 0, ['toy'], { m: { mag: -0.2, reload: -0.25, loot: 5 } }, '돌려서 나온 건 또 꽝이었다. 캡슐이라도 쓰자.');
P('mag_tennis', 'mag', '테니스공 통', 0, ['sport'], { m: { mag: 0.2, knock: 10, reload: 0.08 } }, "뚜껑을 딸 때 '뽁' 소리가 난다. 그게 제일 좋다.");
P('mag_sock', 'mag', '짝 잃은 양말', 5, ['meme', 'junk'], { tier: 0, m: { mag: 0.25, jam: 2 } }, '나머지 한 짝은 세탁기가 먹었다. 탄은 발가락 쪽에 모인다.');
// T1
P('mag_ricesack', 'mag', '쌀 포대 20kg', 1, ['farm'], { m: { mag: 0.9, reload: 0.6, swarm: 8 } }, '어깨에 메면 든든하다. 허리는 책임 못 진다.');
P('mag_shuttle', 'mag', '셔틀콕 통', 1, ['sport'], { m: { mag: 0.3, reload: -0.2, vel: -0.15, dmg: -0.06 } }, '깃털 때문에 탄이 살짝 느리다. 대신 갈아 끼우는 건 스매싱만큼 빠르다.');
P('mag_bbbottle', 'mag', '비비탄 2000발 통', 1, ['toy'], { m: { mag: 1.2, dmg: -0.2, swarm: 10, elite: -10 } }, '6mm 0.2g. 문방구 부동의 판매 1위. 주의: 사람을 향해 쏘지 마시오.');
P('mag_cassette', 'mag', '카세트테이프', 1, ['music'], { m: { mag: 0.2, reload: -0.15, rpm: 0.06, jam: 1.5 } }, 'A면을 다 쏘면 뒤집어서 B면. 가끔 테이프가 씹힌다.');
P('mag_eggtray', 'mag', '계란판 30구', 1, ['farm', 'kitchen'], { m: { mag: 0.25, reload: 0.2 }, sp: { opener: 25 }, note: '체력이 가득 찬 적에게 피해 +25% (첫 타는 날계란)' }, '떨어뜨리면 재장전이 아니라 청소다.');
// T2
P('mag_match', 'mag', '매치 등급 5발 탄창', 2, ['mil'], { m: { mag: -0.55, dmg: 0.18, spread: -0.12, elite: 20, swarm: -10 } }, '한 발 한 발 저울에 달아 넣었다. 다섯 발이 전부다. 아껴 써라.');
P('mag_hopper', 'mag', '페인트볼 호퍼', 2, ['sport'], { m: { mag: 1.3, reload: 0.2, spread: 0.2, dmg: -0.1, swarm: 15 } }, '통에서 중력으로 굴러떨어진다. 흔들면 더 잘 나온다.');
P('mag_seedhopper', 'mag', '파종기 호퍼', 2, ['farm'], { m: { mag: 1.6, reload: 0.65, rpm: 0.08, swarm: 14, elite: -15 } }, '한 줄로 고르게 뿌려 준다. 올해는 돌연변이 밭이다.');
P('mag_gumball', 'mag', '풍선껌 자판기', 5, ['toy', 'meme'], { tier: 2, m: { mag: 0.8, dmg: -0.12, reload: 0.15 }, fx: { bounce: 1 } }, '알록달록한 탄이 통통 튄다. 씹던 껌은 넣지 마시오.');
P('mag_filecab', 'mag', '서류 캐비닛 서랍', 2, ['office'], { m: { mag: 0.9, reload: 0.45, jam: 1 }, sp: { execute: 30 }, note: '체력 35% 이하인 적에게 피해 +30% (마감 임박 건부터 처리)' }, '결재 대기 서류처럼 쌓여 있다. 서랍이 가끔 안 열린다.');
P('mag_tank', 'mag', '압력 탱크', 2, ['pipe'], { m: { mag: 0.3, vel: 0.25, dmg: 0.08, knock: 25, reload: 0.3, recoil: 0.15 } }, '바늘이 빨간 구역을 넘었다. 정상이다. 아마도.');
// T3
P('mag_single', 'mag', "단발 장전구 '일발필중'", 3, ['mil'], { m: { mag: -0.8, dmg: 0.45, reload: -0.3, elite: 25, swarm: -25 } }, '한 발이면 된다. 두 발이 필요하다면 그건 실력 문제다.');
P('mag_backpack', 'mag', '등짐 급탄 배낭', 3, ['mil'], { m: { mag: 4.0, reload: 1.2, rpm: 0.05, recoil: 0.1, swarm: 10, elite: -15 } }, '등에 500발을 지고 쏜다. 재장전은 내일 하자.');
P('mag_eggsac', 'mag', '알집', 3, ['bio'], { m: { mag: 0.3, reload: 0.2, elite: -15 }, sp: { momentum: 5 }, note: '처치할 때마다 3초간 피해 +5% (최대 5중첩)' }, '안에서 뭔가 꿈틀댄다. 한 놈을 잡으면 다음 놈이 더 맛있어진다.');
P('mag_bowling', 'mag', '볼링공 가방', 5, ['sport', 'meme'], { tier: 3, m: { mag: -0.6, dmg: 0.5, knock: 50, reload: 0.1, rpm: -0.1, elite: 20 } }, '16파운드. 한 발 한 발이 스트라이크다. 손가락 구멍에 탄이 낀다.');
P('mag_arcade', 'mag', '오락실 코인 탄창', 5, ['toy', 'meme'], { tier: 3, m: { mag: 0.2, reload: 0.3 }, sp: { freeAmmo: 0.2 }, note: "20% 확률로 탄을 소모하지 않는다 ('한 판 더!')" }, '동전을 넣고 스타트 버튼을 누른다. 컨티뉴는 10초 안에.');
// T4
P('mag_quantum', 'mag', '양자 중첩 탄창', 4, ['tech'], { m: { mag: -0.3, dmg: 0.1, jam: 2 }, sp: { freeAmmo: 0.35 }, note: '35% 확률로 탄을 소모하지 않는다 (쏜 탄과 안 쏜 탄이 겹쳐 있다)' }, '열어 보기 전까지는 탄이 있는지 없는지 모른다. 그래서 안 연다.');
P('mag_cornucopia', 'mag', '풍요의 뿔', 4, ['farm'], { m: { mag: 2.0, reload: 0.7, loot: 25, swarm: 15, elite: -15 }, sp: { feast: 0.08 }, note: '처치 시 8% 확률로 문 수리 +3 (수확의 기쁨)' }, '끝없이 쏟아진다. 추수감사절이 매일이다.');

/* ───────────── 개머리판 ───────────── */
// T0
P('stock_shovel', 'stock', '삽자루', 0, ['farm'], { m: { recoil: -0.12, knock: 10 } }, '이장님이 빌려주셨다. 돌려 달라는 말은 아직 없다.');
P('stock_hanger', 'stock', '세탁소 옷걸이', 0, ['junk'], { m: { recoil: -0.05, reload: -0.08 } }, '펴서 감았다. 가볍다. 그게 장점의 전부다.');
P('stock_jumprope', 'stock', '줄넘기 손잡이', 0, ['sport'], { m: { recoil: -0.06, rpm: 0.05 } }, '2단 뛰기의 리듬으로 쏜다. 쌩쌩.');
P('stock_hobbyhorse', 'stock', '말머리 막대', 0, ['toy'], { m: { recoil: -0.1, loot: 4 } }, '이랴! ...부끄러움은 종말과 함께 사라졌다.');
// T1
P('stock_rake', 'stock', '갈퀴', 1, ['farm'], { m: { recoil: -0.15, swarm: 12, elite: -8 } }, '긁어모으는 건 낙엽이나 돌연변이나 매한가지.');
P('stock_hockey', 'stock', '하키 스틱', 1, ['sport'], { m: { recoil: -0.18, knock: 30, spread: 0.08 } }, '보디체크는 반칙이 아니다. 여기서는.');
P('stock_teddy', 'stock', '곰인형', 5, ['toy', 'meme'], { tier: 1, m: { recoil: -0.4, dmg: -0.06 }, fx: { leech: 0.6 } }, '꼭 껴안고 쏜다. 솜이 반동을 먹고, 곰이 대신 무서워해 준다.');
P('stock_wire', 'stock', '접이식 철사 개머리판', 1, ['mil'], { m: { reload: -0.08, rpm: 0.03, recoil: 0.25, swarm: 4 } }, '있으나 마나 하지만, 없는 것보다는 가볍다.');
P('stock_ruler', 'stock', '30cm 쇠자', 1, ['office'], { m: { spread: -0.15, recoil: -0.08, rpm: -0.04 } }, '정확히 30센티미터. 손등을 맞던 기억이 집중력을 올려 준다.');
P('stock_plunger', 'stock', '뚫어뻥', 1, ['pipe'], { m: { recoil: -0.28, knock: 15, reload: 0.1 } }, '어깨에 딱 붙는다. 뗄 때 소리가 좀 난다. 원래 용도는 잊자.');
// T2
P('stock_cheek', 'stock', '저격용 칙패드 개머리판', 2, ['mil'], { m: { spread: -0.25, recoil: -0.2, head: 0.4, elite: 15, rpm: -0.1, swarm: -10 } }, '뺨을 대는 순간 세상이 조용해진다. 옆에서 몰려오는 놈들 소리까지.');
P('stock_scythe', 'stock', '낫자루', 2, ['farm'], { m: { recoil: -0.15, swarm: 20, elite: -15 }, sp: { momentum: 4 }, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩)' }, '벼 베듯 벤다. 올해는 풍년이다.');
P('stock_golf', 'stock', '골프 드라이버', 2, ['sport'], { m: { dmg: 0.1, crit: 8, recoil: -0.12, rpm: -0.08 } }, '힘 빼고 쳐야 멀리 간다. 총도 마찬가지다.');
P('stock_hula', 'stock', '훌라후프', 5, ['toy', 'meme'], { tier: 2, m: { rpm: 0.18, recoil: 0.25, spread: 0.15 } }, '허리로 돌리면서 쏜다. 왜 연사가 빨라지는지는 아무도 모른다.');
P('stock_ironing', 'stock', '다리미판', 5, ['meme', 'kitchen'], { tier: 2, m: { recoil: -0.55, spread: -0.2, reload: 0.15, rpm: -0.04, elite: 10 } }, '펼치면 사격대가 된다. 주름 하나 없는 탄도.');
// T3
P('stock_tentacle', 'stock', '감기는 촉수', 3, ['bio'], { m: { recoil: -0.45, jam: 1.5, swarm: -12 }, sp: { focus: 3 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +3% (최대 10중첩)' }, '팔을 감고 놓아 주지 않는다. 한 놈만 노려보는 버릇이 있다.');
P('stock_anvil', 'stock', '모루', 3, ['junk'], { m: { recoil: -0.8, spread: -0.2, dmg: 0.1, reload: 0.5, rpm: -0.15, elite: 20, swarm: -15 } }, '움직이지 않는다. 총도, 사수도, 재장전하는 손도.');
P('stock_trophy', 'stock', '사격 대회 우승 트로피', 3, ['sport'], { m: { crit: 12, head: 0.4, elite: 15, recoil: 0.15, swarm: -10 } }, '작년 대피소 사격 대회 우승자의 것. 작년 참가자는 한 명이었다.');
P('stock_rc', 'stock', 'RC카 조종기', 3, ['toy', 'tech'], { m: { spread: -0.15, dmg: -0.03 }, fx: { homing: 0.4 } }, '조이스틱으로 탄을 몬다. 건전지 별매.');
P('stock_recliner', 'stock', '안마의자', 5, ['meme'], { tier: 3, m: { recoil: -0.6, spread: -0.15, crit: 10, reload: 0.2, rpm: -0.06 } }, '쏘는 동안 어깨를 주물러 준다. 15분 코스. 중간에 못 일어난다.');
// T4
P('stock_scarecrow', 'stock', '허수아비', 4, ['farm'], { m: { recoil: -0.4, swarm: 25, elite: -20 }, sp: { fear: 0.08 }, note: '8% 확률로 맞은 적이 겁먹고 도망친다' }, '참새를 쫓던 실력으로 돌연변이를 쫓는다. 큰 놈들은 안 속는다.');
P('stock_ancestor', 'stock', '조상님의 장총 개머리판', 4, ['mil'], { m: { dmg: 0.2, head: 0.6, elite: 15, recoil: -0.3, rpm: -0.15, swarm: -15 }, sp: { focus: 3 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +3% (최대 10중첩)' }, "3대째 내려온 물건. 쏠 때마다 어디선가 '숨 참아라' 소리가 들린다.");
