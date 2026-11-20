// BUNKER 404 — 파츠 확장 H (2차): 총열 10 · 총구 10 · 탄창 10 · 개머리판 10 · 조준기 10 · 부착물 20
// 1차보다 더 괴상하고 더 치우친 파츠들. 그림은 gunart_ext_h.js.
'use strict';

/* ───────────── 총열 ───────────── */
P('barrel_chimney', 'barrel', '난로 연통', 0, ['pipe', 'junk'], { m: { dmg: 0.08, spread: 0.25, vel: -0.1 } }, '연탄난로에서 뽑아 왔다. 그을음은 서비스.');
P('barrel_ballpen', 'barrel', '볼펜심 다발', 0, ['office'], { m: { rpm: 0.12, dmg: -0.04 } }, '다 쓴 볼펜심 서른 개. 잉크는 안 나오고 탄은 나온다.');
P('barrel_xylophone', 'barrel', '실로폰 건반', 5, ['music', 'toy'], { tier: 1, m: { rpm: 0.14, dmg: -0.08, spread: 0.15 }, sp: { screech: 0.03 }, note: '3% 확률로 불협화음: 주변 적 기절' }, '쏠 때마다 도레미. 음정은 탄속에 따라 다르다.');
P('barrel_pogo', 'barrel', '스카이콩콩', 5, ['toy', 'sport'], { tier: 1, m: { dmg: -0.12, recoil: 0.35 }, fx: { bounce: 2 } }, '탄이 통통 튄다. 총도 튄다. 어깨도 튄다.');
P('barrel_trombone', 'barrel', '트롬본 슬라이드', 2, ['music'], { m: { swarm: 18, knock: 35, elite: -15, spread: 0.2 } }, '슬라이드를 당기면 사거리가 달라진다는 설이 있다.');
P('barrel_irrigation', 'barrel', '관개 파이프', 2, ['farm', 'pipe'], { m: { pierce: 2, swarm: 15, dmg: -0.15, elite: -12 } }, '논에 물 대던 관. 이제는 줄 선 놈들에게 탄을 댄다.');
P('barrel_ski', 'barrel', '스키 폴', 2, ['sport'], { m: { spread: -0.35, vel: 0.25, head: 0.3, dmg: -0.08, swarm: -12 } }, '활강 선수의 유품. 일직선밖에 모른다.');
P('barrel_rebar', 'barrel', '철근 다발', 3, ['junk'], { m: { dmg: 0.45, elite: 20, rpm: -0.3, recoil: 0.4, swarm: -15 } }, '아파트 공사장에서 뜯어 왔다. 준공은 영원히 미뤄졌다.');
P('barrel_intestine', 'barrel', '창자 총열', 3, ['bio'], { m: { dmg: 0.1, mag: 0.2, spread: 0.3, vel: -0.2 }, fx: { acid: 1, leech: 0.4 } }, '꿈틀거리며 탄을 밀어낸다. 가는 길에 조금 소화도 시킨다.');
P('barrel_horizon', 'barrel', '사건의 지평선 포신', 4, ['tech'], { m: { dmg: 1.2, elite: 25, rpm: -0.45, mag: -0.4, swarm: -30, recoil: 0.3 } }, '들어간 탄은 분명 나온다. 같은 탄인지는 아무도 모른다.');

/* ───────────── 총구 ───────────── */
P('muz_popgun', 'muzzle', '코르크 마개', 5, ['toy'], { tier: 0, m: { knock: 30, dmg: -0.02 } }, "'뽕!' 소리가 난다. 그게 전부고, 그게 좋다.");
P('muz_holepunch', 'muzzle', '2공 펀치', 1, ['office'], { m: { pierce: 1, pen: 12, dmg: -0.1, rpm: -0.04 } }, '탄이 구멍을 뚫는 건지, 구멍 뚫린 탄이 나가는 건지.');
P('muz_harmonica', 'muzzle', '하모니카', 1, ['music'], { m: { pellets: 2, swarm: 10, dmg: -0.15, spread: 0.5, elite: -10 } }, '구멍마다 탄이 나온다. 블루스가 흐른다.');
P('muz_cleats', 'muzzle', '축구화 스터드', 1, ['sport'], { m: { knock: 15, spread: 0.1 }, sp: { thorns: 14 }, note: '문을 때리는 적에게 초당 14 피해 (밟는다)' }, '문 앞까지 온 놈은 밟는다. 옐로카드는 감수한다.');
P('muz_pinwheel', 'muzzle', '바람개비', 5, ['toy'], { tier: 2, m: { rpm: 0.2, spread: 0.35, elite: -10 }, sp: { momentum: 4 }, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩)' }, '돌수록 신난다. 신날수록 돈다.');
P('muz_cymbal', 'muzzle', '심벌즈', 5, ['music'], { tier: 2, m: { knock: 20, recoil: 0.25 }, sp: { sonic: 12 }, note: '12발마다 음파 충격 (광역 피해+넉백)' }, '챙! 하는 순간 앞줄이 눕는다. 귀도 눕는다.');
P('muz_gasket', 'muzzle', '배관 플랜지', 2, ['pipe'], { m: { recoil: -0.3, vel: 0.15, rpm: -0.03 } }, '볼트 여덟 개로 조였다. 절대 안 샌다. 반동도 안 샌다.');
P('muz_beehive', 'muzzle', '벌통', 3, ['farm', 'bio'], { m: { dmg: -0.1, elite: -12 }, fx: { rad: 1 }, sp: { plague: 1 }, note: '처치 시 벌떼가 주변 적에게 옮겨 붙는다 (독·표식)' }, '양봉은 이제 공격적인 산업이다.');
P('muz_syringe', 'muzzle', '대바늘 주사기', 3, ['bio'], { m: { elite: 25, pen: 30, swarm: -25, rpm: -0.05 }, fx: { sunder: 0.5 } }, "'따끔합니다~' 는 예나 지금이나 거짓말이다.");
P('muz_jakdu', 'muzzle', '작두', 4, ['farm'], { m: { elite: 15, rpm: -0.15, swarm: -10 }, sp: { execute: 60 }, note: '체력 35% 이하인 적에게 피해 +60%' }, '여물 썰던 물건. 마무리 하나는 확실하다.');

/* ───────────── 탄창 ───────────── */
P('mag_can', 'mag', '참치 캔', 0, ['kitchen', 'junk'], { m: { mag: -0.2, reload: -0.25 } }, '작아서 금방 갈아 끼운다. 기름은 따라 버릴 것.');
P('mag_pencilcase', 'mag', '철제 필통', 0, ['office', 'toy'], { m: { mag: 0.2, jam: 1.5 } }, '지우개 가루가 같이 장전된다.');
P('mag_waterbottle', 'mag', '스포츠 물통', 1, ['sport'], { m: { mag: 0.25, rpm: 0.06, dmg: -0.06 } }, '꾹 짜면 나온다. 이온음료 맛이 난다.');
P('mag_seedtray', 'mag', '모판', 2, ['farm'], { m: { mag: 0.9, swarm: 12, reload: 0.35, elite: -10 } }, '한 판에 200구. 모내기하듯 꽂아 넣는다.');
P('mag_musicbox', 'mag', '오르골 태엽통', 5, ['music', 'toy'], { tier: 2, m: { mag: -0.15, reload: 0.1 }, sp: { regen: 0.06 }, note: '쏘지 않는 동안 태엽이 탄을 감아 올린다 (초당 6%)' }, '자장가와 함께 탄이 올라온다. 듣다가 졸면 안 된다.');
P('mag_manifold', 'mag', '배관 매니폴드', 2, ['pipe'], { m: { mag: 0.5, rpm: 0.12, spread: 0.15, reload: 0.2 } }, '밸브가 여섯 개. 뭐가 뭔지는 아무도 모른다.');
P('mag_icebox', 'mag', '아이스박스', 2, ['sport', 'kitchen'], { m: { mag: 0.7, reload: 0.3 }, fx: { freeze: 0.1 } }, '낚시터에서 주웠다. 미끼가 아직 들어 있다.');
P('mag_stomach', 'mag', '위장', 3, ['bio'], { m: { mag: 0.6, reload: 0.3 }, fx: { acid: 1 }, sp: { feast: 0.06 }, note: '처치 시 6% 확률로 소화 흡수: 문 수리 +3' }, '꼬르륵 소리가 장전 완료 신호다.');
P('mag_coffin', 'mag', '관짝 탄창', 5, ['meme'], { tier: 3, m: { dmg: 0.35, elite: 20, mag: -0.6, swarm: -20 } }, '한 발 한 발에 장례를 치른다. 조문객은 받지 않는다.');
P('mag_printer', 'mag', '3D 프린터', 4, ['tech', 'office'], { m: { mag: -0.2, rpm: -0.1, jam: 2 }, sp: { freeAmmo: 0.3, regen: 0.04 }, note: '30% 확률로 탄 소모 없음 · 쏘지 않으면 탄을 출력한다 (초당 4%)' }, '쏘는 동안 다음 탄을 출력한다. 가끔 필라멘트가 엉킨다.');

/* ───────────── 개머리판 ───────────── */
P('stock_broom', 'stock', '싸리 빗자루', 0, ['junk', 'farm'], { m: { recoil: -0.12, knock: 10 } }, '마당 쓸던 것. 이제는 돌연변이를 쓴다.');
P('stock_valve', 'stock', '대형 밸브 핸들', 0, ['pipe'], { m: { recoil: -0.15, vel: 0.05 } }, '돌리면 뭔가 잠긴다. 뭐가 잠기는지는 모른다.');
P('stock_trike', 'stock', '세발자전거 핸들', 5, ['toy'], { tier: 0, m: { rpm: 0.1, recoil: -0.05, spread: 0.12 } }, '따릉따릉. 벨은 아직 울린다.');
P('stock_tennis', 'stock', '테니스 라켓', 1, ['sport'], { m: { recoil: -0.15, rpm: 0.08, spread: 0.1 }, fx: { bounce: 1 } }, '반동을 받아넘긴다. 탄도 가끔 받아넘긴다.');
P('stock_binder', 'stock', '3공 바인더', 1, ['office'], { m: { recoil: -0.2, reload: -0.1, crit: 3, dmg: -0.05 } }, '결재 서류 300장이 반동을 흡수한다.');
P('stock_yoke', 'stock', '지게', 2, ['farm'], { m: { recoil: -0.45, mag: 0.3, rpm: -0.05, reload: 0.1 } }, '등에 지면 든든하다. 무릎은 안 든든하다.');
P('stock_claw', 'stock', '집게발', 2, ['bio'], { m: { recoil: -0.25, knock: 30, spread: 0.1 }, sp: { thorns: 12 }, note: '문을 때리는 적에게 초당 12 피해 (꼬집는다)' }, '어깨를 꽉 문다. 놓아 달라고 해도 안 놓는다.');
P('stock_sawedoff', 'stock', '잘라 낸 자리', 5, ['meme', 'junk'], { tier: 2, m: { rpm: 0.2, dmg: 0.1, recoil: 0.8, spread: 0.4 } }, '개머리판을 톱으로 잘라 냈다. 총은 가벼워졌고 어깨는 무거워졌다.');
P('stock_cello', 'stock', '첼로 울림통', 3, ['music'], { m: { recoil: -0.5, crit: 10, head: 0.4, rpm: -0.15, swarm: -10 } }, '울림통이 반동을 삼킨다. 저음이 뼈에 좋다.');
P('stock_exo', 'stock', '외골격 팔', 4, ['tech'], { m: { recoil: -0.7, dmg: 0.15, reload: 0.25, swarm: -25 }, sp: { focus: 5 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +5% (최대 10중첩)' }, '팔이 대신 조준한다. 한 놈만 팬다.');

/* ───────────── 조준기 ───────────── */
P('sight_gumring', 'sight', '반지 사탕', 5, ['toy'], { tier: 0, m: { crit: 4, spread: 0.05 } }, '보석 반지 사탕. 다 먹으면 그냥 반지다.');
P('sight_protractor', 'sight', '각도기', 1, ['office'], { m: { spread: -0.15, head: 0.2, rpm: -0.04 } }, '45도. 정확히 45도. 그 이상은 묻지 마라.');
P('sight_3dglasses', 'sight', '3D 안경', 5, ['toy', 'meme'], { tier: 1, m: { pellets: 1, crit: 5, spread: 0.2, head: -0.2 } }, '빨강 파랑. 탄이 두 겹으로 보인다. 실제로 두 발이 나간다.');
P('sight_birdtape', 'sight', '새 쫓는 반짝이 줄', 1, ['farm'], { m: { swarm: 15, head: -0.2 }, sp: { fear: 0.03 }, note: '3% 확률로 맞은 적이 눈이 부셔 도망친다' }, '반짝이면 참새가 도망간다. 돌연변이도 가끔.');
P('sight_antenna', 'sight', '더듬이', 2, ['bio'], { m: { crit: 5, dmg: -0.08 }, fx: { homing: 0.4 } }, '적이 있는 쪽으로 저절로 떨린다. 간지럽다.');
P('sight_dartboard', 'sight', '다트판', 2, ['sport'], { m: { head: 0.7, crit: 6, swarm: -15, spread: 0.05 } }, '불스아이만 인정한다. 나머지는 0점.');
P('sight_tuner', 'sight', '클립 조율기', 2, ['music', 'tech'], { m: { spread: -0.1, rpm: -0.05 }, sp: { stamp: 8 }, note: "8발마다 '정확한 음': 확정 치명타" }, '440Hz 에 맞춰야 맞는다.');
P('sight_sightglass', 'sight', '배관 점검창', 2, ['pipe'], { m: { crit: 8, pen: 15, spread: -0.08, rpm: -0.05 } }, '안에 뭐가 흐르는지 보인다. 약점도 보인다.');
P('sight_cctv', 'sight', '돔형 CCTV', 3, ['tech', 'office'], { m: { loot: 15, elite: 10, swarm: -10 }, sp: { thermal: 1 }, note: '안개를 꿰뚫어 본다' }, '녹화 중. 보관 기간은 30일.');
P('sight_blueprint', 'sight', '해부 도면', 4, ['office'], { m: { head: 1.6, elite: 30, swarm: -30, rpm: -0.15 }, fx: { sunder: 0.4 } }, '돌연변이 해부도. 어디를 쏘면 아픈지 형광펜으로 칠해 놨다.');

/* ───────────── 부착물 ───────────── */
P('acc_chalk', 'acc', '탄마 가루', 0, ['sport'], { m: { recoil: -0.1, jam: -1 } }, '손에 바른다. 땀은 안 난다. 긴장은 난다.');
P('acc_gloves', 'acc', '빨간 목장갑', 0, ['farm', 'junk'], { m: { reload: -0.08, jam: -1 } }, '코팅된 쪽이 손바닥이다. 헷갈리면 반대로 낀 거다.');
P('acc_balloon', 'acc', '헬륨 풍선', 5, ['toy'], { tier: 0, m: { recoil: -0.2, vel: -0.1 } }, '총이 가벼워진다. 목소리도 가벼워진다.');
P('acc_paperclip', 'acc', '클립 사슬', 0, ['office'], { m: { mag: 0.1, jam: 1 } }, '탄창에 몇 발 더 매단다. 인사팀에는 비밀이다.');
P('acc_pedometer', 'acc', '만보기', 1, ['sport', 'tech'], { m: { reload: 0.05 }, sp: { momentum: 4 }, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩)' }, '처치할 때마다 걸음 수가 올라간다. 오늘의 목표: 만 마리.');
P('acc_pepper', 'acc', '말린 고추', 1, ['farm', 'kitchen'], { m: { swarm: 5, dmg: -0.05 }, fx: { burn: 2 } }, '처마에 걸어 두던 것. 매운 내가 탄에 밴다.');
P('acc_slinky', 'acc', '무지개 용수철', 5, ['toy'], { tier: 1, m: { rpm: 0.06, spread: 0.12 }, fx: { bounce: 1 } }, '계단을 내려가듯 탄이 넘어간다.');
P('acc_ptrap', 'acc', 'U자 트랩', 1, ['pipe'], { m: { reload: -0.15, jam: -2, vel: -0.08 } }, '막힐 건 여기 다 고인다. 냄새는 묻지 마라.');
P('acc_tambourine', 'acc', '탬버린', 5, ['music'], { tier: 1, m: { rpm: 0.1, loot: 8, spread: 0.12 } }, '노래방 필수품. 박자는 틀려도 된다.');
P('acc_bell', 'acc', '라운드 벨', 2, ['sport'], { m: { elite: -10 }, sp: { opener: 50 }, note: '체력이 가득 찬 적에게 피해 +50% (선빵)' }, '땡! 1라운드는 내가 먼저다.');
P('acc_fence', 'acc', '전기 울타리', 2, ['farm', 'tech'], { m: { reload: 0.08 }, fx: { shock: 1 }, sp: { thorns: 18 }, note: '문을 때리는 적에게 초당 18 피해 (감전)' }, '멧돼지용이었다. 지금 오는 건 멧돼지보다 크다.');
P('acc_puzzle', 'acc', '큐브 퍼즐', 2, ['toy', 'office'], { m: { rpm: -0.06 }, sp: { focus: 3 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +3% (최대 10중첩)' }, '맞추는 동안 집중력이 올라간다. 아직 한 면만 맞췄다.');
P('acc_calculator', 'acc', '공학용 계산기', 2, ['office', 'tech'], { m: { crit: 8, spread: -0.12, rpm: -0.06 }, sp: { tax: 0.15 }, note: '정예·보스에게 피해 +15% (정밀 계산)' }, '탄도를 계산한다. 가끔 8008 이 찍혀 있다.');
P('acc_leech', 'acc', '거머리', 2, ['bio'], { m: { dmg: -0.08 }, fx: { leech: 1 } }, '피는 놈들 걸 빤다. 아마도. 대체로.');
P('acc_redcard', 'acc', '레드카드', 5, ['sport', 'meme'], { tier: 2, m: { swarm: -10 }, sp: { execute: 45 }, note: '체력 35% 이하인 적에게 피해 +45% (퇴장)' }, '퇴장. 항의는 받지 않는다.');
P('acc_almanac', 'acc', '농사 달력', 2, ['farm', 'office'], { m: { loot: 18, rpm: -0.05 }, sp: { overtime: 0.2 }, note: '남은 적이 30% 이하면 피해 +20% (막바지 수확)' }, "절기마다 할 일이 적혀 있다. 오늘은 '잡초 제거'.");
P('acc_receipt', 'acc', '영수증 뭉치', 3, ['office'], { m: { loot: -10 }, sp: { cheap: 0.4 }, note: '탄약값 -40% (경비 처리)' }, '전부 경비 처리했다. 감사는 아직 안 나왔다.');
P('acc_net', 'acc', '새 그물', 3, ['farm', 'sport'], { m: { swarm: 30, elite: -25 }, sp: { overkill: 1 }, note: '처치 시 남는 피해가 가까운 적에게 옮겨간다' }, '한 번 던지면 여럿이 걸린다. 큰 놈은 찢고 나온다.');
P('acc_tumor', 'acc', '증식하는 살점', 3, ['bio'], { m: { mag: 0.4, dmg: 0.12, jam: 2, spread: 0.1 }, sp: { regen: 0.04 }, note: '쏘지 않는 동안 탄이 자라난다 (초당 4%)' }, '탄창 옆에서 자란다. 탄도 같이 자란다. 떼면 다시 난다.');
P('acc_deadline', 'acc', '마감 시한폭탄', 5, ['office', 'meme'], { tier: 4, m: { dmg: -0.15 }, sp: { overtime: 0.8 }, note: '남은 적이 30% 이하면 피해 +80% (마감 버프)' }, '마감이 다가올수록 능률이 오른다. 그 전에는 안 오른다.');
