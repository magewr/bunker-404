// BUNKER 404 — 파츠 확장 C: 총열 24종 + 총구 22종
// 역할이 뚜렷하다: 대군중(swarm·탄환 수·관통·폭발) vs 대보스(elite·약점·절삭·집중). 얻는 만큼 잃는다.
'use strict';

/* ───────────── 총열 ───────────── */
// T0
P('barrel_drain', 'barrel', '빗물 홈통', 0, ['junk', 'pipe'], { m: { pellets: 1, dmg: -0.05, swarm: 8, spread: 0.5, jam: 1.5 } }, '지붕에서 뜯어 왔다. 비 오는 날 이장님 댁에 물이 새는 건 비밀이다.');
P('barrel_bamboo', 'barrel', '대나무 통', 0, ['farm'], { m: { vel: 0.15, spread: -0.1, jam: 1 } }, '뒷산에서 베어 왔다. 마디마다 탄이 덜컹거린다.');
P('barrel_hoe', 'barrel', '괭이 자루', 0, ['farm'], { m: { dmg: 0.08, swarm: 8, elite: -10 } }, '밭 매던 손맛 그대로. 잡초 같은 놈들에게 잘 듣는다.');
P('barrel_waterpistol', 'barrel', '물총 총열', 0, ['toy'], { m: { rpm: 0.12, dmg: -0.06, spread: 0.1 } }, '문방구에서 천 원. 압력은 펌프질 나름이다.');
P('barrel_poolnoodle', 'barrel', '수영 누들', 5, ['toy', 'meme'], { tier: 0, m: { recoil: -0.5, spread: -0.1, vel: -0.2 } }, '반동을 흡수한다. 위엄도 흡수한다.');
// T1
P('barrel_vacuum', 'barrel', '청소기 호스', 1, ['junk'], { m: { swarm: 20, rpm: 0.08, elite: -15, spread: 0.25 } }, '빨아들이던 물건이 뱉기 시작했다. 먼지 같은 놈들 전문.');
P('barrel_golf', 'barrel', '골프채 샤프트', 1, ['sport'], { m: { vel: 0.3, head: 0.3, elite: 12, rpm: -0.06, swarm: -10 } }, '7번 아이언. 비거리는 훌륭한데 연사가 안 된다. 매너 운동이라.');
P('barrel_fishing', 'barrel', '낚싯대', 1, ['sport'], { m: { spread: -0.25, dmg: -0.1, swarm: -10 }, sp: { focus: 2 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +2% (최대 10중첩)' }, '한 놈만 문다. 대신 물면 안 놓는다.');
P('barrel_sprayer', 'barrel', '농약 분무기 대', 1, ['farm'], { m: { pellets: 2, dmg: -0.15, spread: 0.7, swarm: 12, elite: -20 } }, '해충 방제용. 큰 놈한테는 영양제 수준이다.');
P('barrel_telescope', 'barrel', '장난감 망원경', 1, ['toy'], { m: { spread: -0.2, crit: 6, dmg: -0.08, vel: -0.1 } }, '3단으로 늘어난다. 달의 분화구는 안쪽에 붙은 스티커다.');
P('barrel_baguette', 'barrel', '사흘 묵은 바게트', 5, ['kitchen', 'meme'], { tier: 1, m: { dmg: 0.16, knock: 30, vel: -0.2, jam: 2 } }, '하루 지나면 흉기가 되고, 사흘 지나면 총열이 된다.');
// T2
P('barrel_triple', 'barrel', '삼연장 총열', 2, ['mil'], { m: { pellets: 2, dmg: -0.05, swarm: 12, spread: 0.4, recoil: 0.3, head: -0.3 } }, '세 발이 한꺼번에 나간다. 어디로 갈지는 세 발이 각자 정한다.');
P('barrel_fluted', 'barrel', '경기용 플루트 총열', 2, ['mil', 'sport'], { m: { dmg: 0.1, spread: -0.35, head: 0.5, elite: 10, rpm: -0.12, swarm: -15 } }, '사격 선수용. 홈을 파서 가볍고, 가벼워서 비싸다.');
P('barrel_organ', 'barrel', '파이프 오르간 관', 2, ['music'], { m: { pierce: 1, knock: 30, swarm: 12, recoil: 0.25, elite: -15 } }, '성당에서 가져왔다. 쏠 때마다 장엄하다. 용서는 나중에 구하자.');
P('barrel_tentacle', 'barrel', '촉수 총열', 2, ['bio'], { m: { dmg: 0.1, spread: 0.25, rpm: -0.08, jam: 1 }, fx: { homing: 0.4, leech: 0.3 } }, '스스로 꿈틀대며 표적을 찾는다. 밥은 안 줘도 된다. 아마.');
P('barrel_dart', 'barrel', '스펀지 다트 총열', 2, ['toy'], { m: { rpm: 0.3, dmg: -0.22, swarm: 25, elite: -25, pen: -20 } }, '아프지는 않다. 대신 많이 맞는다.');
P('barrel_cone', 'barrel', '라바콘', 5, ['meme', 'junk'], { tier: 2, m: { pellets: 3, dmg: -0.2, spread: 1.0, swarm: 20, elite: -30 } }, '주차 금지. 접근도 금지.');
// T3
P('barrel_rail', 'barrel', '전자기 레일', 3, ['tech'], { m: { dmg: 0.45, vel: 0.8, pen: 30, elite: 25, rpm: -0.3, recoil: 0.3, swarm: -20 } }, '탄이 나간 다음에 소리가 난다. 전기 요금 고지서는 그다음에 온다.');
P('barrel_harvester', 'barrel', '콤바인 탈곡통', 3, ['farm'], { m: { rpm: 0.15, swarm: 5, pierce: 1, spread: 0.5, elite: -30, recoil: 0.2 }, sp: { momentum: 4 }, spin: 0.3, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩) · 예열 시간 +0.3초' }, '가을걷이용. 벼 대신 돌연변이를 턴다.');
P('barrel_proboscis', 'barrel', '변이 모기 주둥이', 3, ['bio'], { m: { pierce: 2, pen: 25, dmg: -0.1, rpm: -0.1, swarm: -10 }, fx: { leech: 1, sunder: 0.4 } }, '찌르고, 빨고, 그걸로 문을 고친다. 어떻게 고치는지는 묻지 말자.');
P('barrel_javelin', 'barrel', '투창', 3, ['sport'], { m: { dmg: 0.5, pierce: 1, vel: 0.2, rpm: -0.35, recoil: 0.3 }, sp: { opener: 30 }, note: '체력이 가득 찬 적에게 피해 +30%' }, '올림픽 규격. 한 줄로 선 놈들을 꼬치로 만든다.');
P('barrel_kaleido', 'barrel', '만화경', 5, ['toy', 'meme'], { tier: 3, m: { pellets: 3, dmg: -0.15, swarm: 8, spread: 0.6, head: -0.5 }, fx: { bounce: 1 } }, '탄이 일곱 빛깔로 갈라진다. 어지럽다. 쏘는 쪽도.');
// T4
P('barrel_templebell', 'barrel', '범종 포신', 4, ['music'], { m: { dmg: 0.7, knock: 80, blast: 40, rpm: -0.4, recoil: 0.6, vel: -0.2 }, sp: { opener: 50 }, note: '체력이 가득 찬 적에게 피해 +50%' }, '한 번 울리면 온 골짜기가 운다. 맞은 놈은 더 운다.');
P('barrel_lens', 'barrel', '중력 렌즈 포신', 4, ['tech'], { m: { dmg: 0.25, elite: 22, head: 0.5, spread: -0.4, rpm: -0.25, swarm: -35 }, sp: { focus: 3 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +3% (최대 10중첩)' }, '빛도 휘는데 탄이 안 휠 리 없다. 한 놈만 팬다.');

/* ───────────── 총구 ───────────── */
// T0
P('muz_whistle', 'muzzle', '호루라기', 0, ['sport'], { m: { knock: 15, crit: 2 } }, '삑! 반칙이다. 돌연변이는 규칙을 모른다.');
P('muz_sickle', 'muzzle', '낫 총검', 0, ['farm'], { m: { swarm: 8, dmg: 0.04 } }, '벼 베던 낫을 묶었다. 기역 자는 몰라도 쓸 줄은 안다.');
P('muz_partyhorn', 'muzzle', '파티 피리', 5, ['toy', 'meme'], { tier: 0, m: { knock: 10, loot: 5, spread: 0.1 } }, '쏠 때마다 뿌우- 하고 펴진다. 축하할 일은 없다.');
P('muz_petbottle', 'muzzle', '페트병 소음기', 0, ['junk'], { m: { recoil: -0.08, dmg: -0.06, jam: 1 }, suppressed: 1 }, '세 발쯤 쏘면 녹는다. 그때 갈아 끼우면 된다.');
// T1
P('muz_duckbill', 'muzzle', '오리주둥이 확산기', 1, ['mil'], { m: { pellets: 1, dmg: -0.05, spread: 0.6, swarm: 15, head: -0.2 } }, '탄을 옆으로 납작하게 편다. 몰려오는 놈들에게는 재앙, 한 놈에게는 간지럼.');
P('muz_flashhider', 'muzzle', '소염기', 1, ['mil'], { m: { spread: -0.15, crit: 5, dmg: -0.04 } }, '불꽃이 안 보인다. 밤눈 밝은 놈들한테 덜 들킨다.');
P('muz_sprinkler', 'muzzle', '스프링클러 헤드', 1, ['farm'], { m: { pellets: 3, dmg: -0.25, swarm: 10, spread: 0.9, elite: -20 } }, '잔디밭 대신 문 앞에 뿌린다. 물 대신 납으로.');
P('muz_dimple', 'muzzle', '골프공 딤플 캡', 1, ['sport'], { m: { vel: 0.25, spread: -0.15, rpm: -0.06 } }, '공기 저항을 줄인다. 과학이다. 골프장 아저씨가 그랬다.');
P('muz_kazoo', 'muzzle', '카주', 1, ['toy', 'music'], { m: { rpm: 0.1, knock: 10, dmg: -0.08 } }, '부웅- 하는 소리가 난다. 진지한 분위기를 원천 봉쇄한다.');
P('muz_dart', 'muzzle', '다트 핀 총검', 1, ['sport'], { m: { head: 0.3, pen: 10, swarm: -8 } }, '불스아이는 50점. 미간은 그 이상.');
// T2
P('muz_mower', 'muzzle', '예초기 날', 2, ['farm'], { m: { swarm: 25, elite: -20, recoil: 0.2 }, sp: { thorns: 18 }, note: '문을 때리는 적에게 초당 18 피해' }, '벌초 철이 아니어도 돈다. 가까이 온 놈은 잔디 신세.');
P('muz_hoop', 'muzzle', '농구 골대', 5, ['sport', 'meme'], { tier: 2, m: { crit: 12, head: 0.4, spread: 0.2, rpm: -0.08 }, sp: { execute: 20 }, note: '체력 35% 이하인 적에게 피해 +20%' }, '림을 통과한 탄만 득점으로 인정된다. 마무리는 덩크로.');
P('muz_vuvuzela', 'muzzle', '부부젤라', 2, ['music', 'sport'], { m: { knock: 35, swarm: 16, spread: 0.35, head: -0.3 }, sp: { screech: 0.04 }, note: '4% 확률로 주변 적을 기절시킨다' }, '경기장의 악몽이 돌아왔다. 귀마개는 각자 준비.');
P('muz_drill', 'muzzle', '드릴 비트', 2, ['junk'], { m: { pen: 25, rpm: -0.1, swarm: -15 }, fx: { sunder: 0.5 } }, '탄이 돌면서 파고든다. 두꺼운 놈일수록 손해를 본다.');
P('muz_nozzle', 'muzzle', '고압 세척기 노즐', 2, ['pipe'], { m: { vel: 0.3, pierce: 1, knock: 25, dmg: -0.1, recoil: 0.25 } }, '세차장 표 수압. 묵은 때와 돌연변이를 함께 벗긴다.');
// T3
P('muz_plasma', 'muzzle', '플라스마 렌즈', 3, ['tech'], { m: { dmg: 0.1, elite: 10, pen: 20, recoil: 0.15, swarm: -15 }, fx: { burn: 3 } }, '탄을 한 번 구워서 내보낸다. 겉은 바삭, 속은 관통.');
P('muz_cluster', 'muzzle', '집속 분사구', 3, ['mil'], { m: { blast: 40, swarm: 20, dmg: -0.15, elite: -25 }, fx: { explode: 14 } }, '한 발이 여러 발이 된다. 뒷정리는 여러 배가 된다.');
P('muz_fang', 'muzzle', '송곳니 총검', 3, ['bio'], { m: { crit: 8, swarm: -15, recoil: 0.15 }, fx: { sunder: 0.6, leech: 0.5 }, sp: { execute: 30 }, note: '체력 35% 이하인 적에게 피해 +30%' }, '뭔가의 이빨이다. 아직 자란다.');
P('muz_scarecrow', 'muzzle', '허수아비 머리', 5, ['farm', 'meme'], { tier: 3, m: { swarm: 20, knock: 20, elite: -15 }, sp: { fear: 0.1 }, note: '10% 확률로 맞은 적이 겁먹고 도망친다' }, '새는 못 쫓는데 돌연변이는 쫓는다. 눈이 마주치면 사람도 쫓는다.');
P('muz_yoyo', 'muzzle', '요요', 3, ['toy'], { m: { swarm: 15, dmg: -0.12, vel: -0.15, elite: -15 }, fx: { bounce: 2 } }, '나갔다가 돌아오... 지는 않고 옆 놈한테 간다.');
// T4
P('muz_eclipse', 'muzzle', '개기일식 조리개', 4, ['tech'], { m: { elite: 35, head: 0.6, crit: 10, rpm: -0.2, swarm: -30 }, sp: { focus: 4 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +4% (최대 10중첩)' }, '조리개를 조이면 세상에 표적 하나만 남는다.');
P('muz_confetti', 'muzzle', '컨페티 캐논', 5, ['toy', 'meme'], { tier: 4, m: { pellets: 3, dmg: -0.5, spread: 0.8, blast: 30, elite: -30 }, fx: { explode: 16 }, sp: { momentum: 6 }, note: '처치할 때마다 3초간 피해 +6% (최대 5중첩)' }, '축하합니다! 무엇을 축하하는지는 터지고 나서 생각합시다.');
