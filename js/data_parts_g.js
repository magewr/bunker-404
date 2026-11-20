// BUNKER 404 — 파츠 확장 G: 몸통 18종 + 탄약 16종 (2차 확장)
'use strict';

/* ═════════════ 몸통 ═════════════ */
/* ── T0 ── */
P('homi', 'receiver', '호미 투척기', 0, ['farm', 'junk'], { base: { dmg: 42, rpm: 70, mag: 4, reload: 2.0, spread: 1.5, recoil: 2.5, vel: 700, pierce: 1, head: 2.5, mode: 'semi', proj: 'nail', snd: { power: 0.25, kind: 'nail' } }, m: { elite: 10 }, sp: { execute: 30 }, note: '김매기: 체력 35% 이하인 적에게 피해 +30% · 느리고 네 자루뿐' }, '밭 매던 손놀림 그대로 던진다. 잡초와 잡것은 뿌리째.');
P('topgun', 'receiver', '팽이 발사기', 0, ['toy'], { base: { dmg: 24, rpm: 90, mag: 6, reload: 2.0, spread: 1, recoil: 1, vel: 360, pierce: 3, mode: 'semi', proj: 'saw', snd: { power: 0.2, kind: 'saw' } }, m: { swarm: 15, elite: -15 }, note: '팽이가 바닥을 타고 돌며 셋까지 벤다 · 하늘의 적은 못 맞힌다' }, '줄을 감고, 당기고, 기도한다. 쇠팽이라 맞으면 진짜 아프다.');
P('tambourine', 'receiver', '노래방 탬버린', 5, ['music', 'toy', 'meme'], { tier: 0, base: { dmg: 12, rpm: 140, mag: 12, reload: 1.8, spread: 0, recoil: 0.5, vel: 440, pierce: 99, knock: 40, range: 190, mode: 'auto', proj: 'wave', snd: { power: 0.4, kind: 'sonic' } }, m: { swarm: 10, elite: -30 }, note: '짧은 부채꼴 음파 · 전부 밀쳐낸다 · 피해는 박수 수준' }, '서비스 30분 추가의 주역. 흔들면 놈들이 물러난다. 흥은 아니고 소음 때문에.');

/* ── T1 ── */
P('putter', 'receiver', '골프 퍼터건', 1, ['sport'], { base: { dmg: 52, rpm: 75, mag: 5, reload: 2.0, spread: 0.6, recoil: 2, vel: 900, bounce: 1, knock: 35, head: 2.6, mode: 'semi', proj: 'bullet', snd: { power: 0.3, kind: 'launcher' } }, sp: { opener: 40 }, note: '홀인원: 체력이 가득 찬 적에게 피해 +40% · 공이 한 번 튕긴다' }, '18홀 내내 조용히 해 달라. 치는 중이다.');
P('printer', 'receiver', '사무실 프린터', 5, ['office', 'meme'], { tier: 1, base: { dmg: 5, rpm: 780, mag: 90, reload: 2.8, spread: 5, recoil: 0.3, vel: 760, mode: 'auto', proj: 'nail', snd: { power: 0.15, kind: 'nail' } }, m: { swarm: 15, jam: 3 }, note: 'A4 를 연사한다 · 용지 걸림이 잦다 (걸림 +3%)' }, '"용지가 걸렸습니다." 세상이 망해도 이 메시지는 살아남았다.');
P('sewerpump', 'receiver', '하수구 펌프', 1, ['pipe'], { base: { dmg: 12, rpm: 300, mag: 30, reload: 2.4, spread: 4, recoil: 0.8, vel: 620, acid: 1, knock: 15, mode: 'auto', proj: 'bio', snd: { power: 0.3, kind: 'can' } }, m: { elite: 10 }, note: '정체불명의 오수 덩어리 · 맞은 적의 방어력을 부식시킨다' }, '무엇을 퍼 올리는지는 묻지 않기로 했다. 냄새가 먼저 도착한다.');
P('scarecrowbow', 'receiver', '허수아비 석궁', 5, ['farm', 'meme'], { tier: 1, base: { dmg: 70, rpm: 200, mag: 3, reload: 1.8, spread: 0.5, recoil: 1.5, vel: 1200, pierce: 1, mode: 'charge', charge: 0.6, proj: 'nail', snd: { power: 0.15, kind: 'nail' } }, sp: { fear: 0.25 }, note: '당겨서 쏜다 · 25% 확률로 맞은 적이 겁먹고 도망친다' }, '참새는 안 속지만 돌연변이는 속는다. 지능의 문제다.');

/* ── T2 ── */
P('compoundbow', 'receiver', '컴파운드 보우', 2, ['sport'], { base: { dmg: 175, rpm: 200, mag: 6, reload: 2.4, spread: 0.2, recoil: 1, vel: 1800, pierce: 2, head: 3.2, mode: 'charge', charge: 0.8, proj: 'nail', snd: { power: 0.2, kind: 'nail' } }, m: { elite: 20, swarm: -15 }, sp: { focus: 4 }, note: '끝까지 당겨서 쏜다 · 같은 적을 연속으로 맞히면 피해 +4%씩 (최대 10중첩)' }, '양궁 강국의 유산. 도르래가 힘을 대신 써 준다.');
P('bowling', 'receiver', '볼링공 발사기', 5, ['sport', 'meme'], { tier: 2, base: { dmg: 95, rpm: 50, mag: 3, reload: 2.6, spread: 1, recoil: 5, vel: 380, pierce: 9, knock: 50, mode: 'semi', proj: 'saw', snd: { power: 0.6, kind: 'launcher' } }, m: { swarm: 30, elite: -20 }, sp: { overkill: 1 }, note: '스트라이크: 공이 바닥을 굴러 줄지은 적을 쓰러뜨린다 · 처치 시 남는 피해가 옆 적에게' }, '15파운드. 손가락 구멍은 장식이 아니다. 거터는 없다.');
P('papershredder', 'receiver', '서류 파쇄기', 2, ['office'], { base: { dmg: 4.5, rpm: 1200, mag: 150, reload: 2.8, spread: 8, recoil: 0.1, vel: 320, range: 180, mode: 'auto', proj: 'flame', snd: { power: 0.25, kind: 'flame' } }, m: { swarm: 20 }, sp: { execute: 50 }, note: '사거리가 짧다 · 체력 35% 이하인 적은 파쇄된다 (피해 +50%)' }, '기밀 서류와 돌연변이를 같은 굵기로 썬다. 세로 2mm.');
P('amp', 'receiver', '전자기타 앰프', 2, ['music', 'tech'], { base: { dmg: 30, rpm: 200, mag: 20, reload: 2.4, spread: 2, recoil: 0.4, vel: 2000, shock: 2, mode: 'auto', proj: 'arc', snd: { power: 0.6, kind: 'arc' } }, m: { swarm: 15, elite: -15 }, sp: { screech: 0.04 }, note: '하울링이 주변 2체에게 번진다 · 4% 확률로 삑—: 주변 적 기절' }, '볼륨은 11까지 있다. 층간소음 민원은 받지 않는다.');
P('tiller', 'receiver', '경운기 엔진포', 2, ['farm'], { base: { dmg: 34, rpm: 240, mag: 40, reload: 3.6, spread: 3.5, recoil: 2.5, vel: 1000, pierce: 1, knock: 20, spin: 0.7, mode: 'auto', proj: 'bullet', snd: { power: 0.65, kind: 'bullet' } }, note: '시동이 걸려야 쏜다 (예열) · 탈탈탈 묵직한 연사 · 반동이 크다' }, '탈탈탈탈. 이장님이 아끼던 물건. 새참 싣던 자리에 탄통을 실었다.');

/* ── T3 ── */
P('pressurecooker', 'receiver', '압력밥솥 저격총', 3, ['kitchen'], { base: { dmg: 520, rpm: 200, mag: 2, reload: 2.8, spread: 0.15, recoil: 8, vel: 2400, pierce: 2, head: 3.0, burn: 8, mode: 'charge', charge: 1.2, proj: 'bullet', snd: { power: 0.95, kind: 'launcher' } }, m: { elite: 35, swarm: -30 }, note: '압력이 찰 때까지 모아서 쏜다 · 맞은 적은 김에 덴다 · 두 발뿐' }, '칙칙 소리가 멎으면 쏠 때다. 뜸 들이기가 제일 중요하다.');
P('dronehive', 'receiver', '드론 군집 통제기', 3, ['tech'], { base: { dmg: 12, pellets: 3, rpm: 300, mag: 60, reload: 3.4, spread: 12, recoil: 0.3, vel: 520, homing: 1, mode: 'auto', proj: 'key', snd: { power: 0.2, kind: 'energy' } }, m: { swarm: 20, elite: -20 }, note: '초소형 드론 3기가 알아서 적을 찾아간다 · 느리고 한 방은 약하다' }, '택배용이었다. 이제는 받는 쪽이 원하지 않는 것을 배송한다.');
P('organ', 'receiver', '파이프 오르간', 3, ['music', 'pipe'], { base: { dmg: 70, rpm: 70, mag: 6, reload: 3.0, spread: 0, recoil: 5, vel: 560, pierce: 99, knock: 70, range: 340, mode: 'semi', proj: 'wave', snd: { power: 0.9, kind: 'sonic' } }, m: { swarm: 25, elite: -25 }, note: '장엄한 화음 한 번에 전방의 모든 적을 밀어낸다 · 느리다' }, '성당에서 떼어 왔다. 토카타와 푸가, 그리고 넉백.');
P('railtrain', 'receiver', '장난감 기차포', 5, ['toy', 'meme'], { tier: 3, base: { dmg: 150, rpm: 60, mag: 5, reload: 3.0, spread: 0.3, recoil: 4, vel: 4000, pierce: 99, mode: 'semi', proj: 'rail', snd: { power: 0.7, kind: 'energy' } }, m: { swarm: 20 }, note: '칙칙폭폭: 일직선 위의 모든 적을 관통한다 · 한 칸씩 느리게' }, '선로는 직선뿐이다. 정차역은 없다.');

/* ── T4 ── */
P('satellite', 'receiver', '위성 레이저 포인터', 4, ['tech'], { base: { dmg: 9, rpm: 1800, mag: 150, reload: 3.2, spread: 0, recoil: 0, vel: 9999, burn: 2, ramp: 2.5, mode: 'beam', proj: 'beam', beamColor: '#ff4a4a', snd: { power: 0.4, kind: 'beam' } }, m: { elite: 30, swarm: -25 }, note: '궤도에서 내려오는 빛 · 같은 적을 오래 비출수록 피해 최대 2.5배 · 한 놈씩만' }, '발표용 포인터인 줄 알고 눌렀다. 3초 뒤 하늘에서 대답이 왔다.');
P('spinewhip', 'receiver', '척추 채찍', 4, ['bio'], { base: { dmg: 110, rpm: 90, mag: 6, reload: 2.6, spread: 0, recoil: 3, vel: 600, pierce: 99, knock: 40, range: 190, leech: 1, sunder: 0.6, mode: 'semi', proj: 'wave', snd: { power: 0.6, kind: 'saw' } }, m: { elite: 15, swarm: -15 }, note: '짧은 사거리를 휩쓴다 · 큰 놈일수록 깊이 벤다 (절삭) · 처치 시 문 수리' }, '마디마디가 살아서 꿈틀댄다. 휘두르면 스스로 방향을 고친다.');

/* ═════════════ 탄약 ═════════════ */
/* ── 무료 ── */
P('ammo_gravel', 'ammo', '마당 자갈', 0, ['junk'], { m: { knock: 20, spread: 0.2, dmg: 0.04 } }, '주차장에 깔려 있던 것. 맞으면 아프고 밟아도 아프다.');
P('ammo_acorn', 'ammo', '도토리', 0, ['farm'], { m: { mag: 0.25, dmg: -0.04 } }, '다람쥐 창고를 압수 수색했다. 작아서 많이 들어간다.');
P('ammo_gonggi', 'ammo', '공깃돌', 5, ['toy', 'meme'], { tier: 0, m: { dmg: -0.06, rpm: 0.14, crit: 4 } }, '다섯 알 한 벌. 꺾기 5단의 손놀림으로 쏜다. 한 알 한 알은 가볍다.');

/* ── 저가 ── */
P('ammo_mugwort', 'ammo', '쑥뜸탄', 1, ['farm'], { cost: 0.02, m: { dmg: -0.1, swarm: 6, elite: -10 }, fx: { burn: 2 } }, '모깃불 피우던 쑥을 뭉쳤다. 벌레 떼에는 특효, 큰 놈은 찜질로 여긴다.');
P('ammo_puck', 'ammo', '하키 퍽', 1, ['sport'], { cost: 0.02, m: { pierce: 1, knock: 20, head: -0.4 } }, '낮게 깔려 가서 다리 사이를 뚫는다. 머리는 못 노린다.');
P('ammo_gum', 'ammo', '풍선껌탄', 5, ['toy', 'meme'], { tier: 1, cost: 0.02, m: { dmg: -0.08, vel: -0.2 }, fx: { freeze: 0.22 } }, '씹던 것이다. 맞으면 발이 안 떨어진다. 머리카락에 붙으면 끝장이다.');
P('ammo_tack', 'ammo', '압정', 1, ['office'], { cost: 0.01, m: { pellets: 1, dmg: -0.1, pen: -15, spread: 0.3, swarm: 10 } }, '게시판에서 뽑아 왔다. 두 갈래로 흩어져 잡것들 발바닥을 노린다.');

/* ── 표준 ── */
P('ammo_seedbomb', 'ammo', '씨앗 폭탄', 2, ['farm'], { cost: 0.04, m: { dmg: -0.2, elite: -15 }, fx: { explode: 16, rad: 1 } }, '터진 자리에 싹이 튼다. 싹 튼 놈은 뭘 맞아도 더 아프다.');
P('ammo_epee', 'ammo', '펜싱 칼끝', 2, ['sport'], { cost: 0.06, m: { crit: 12, head: 0.3, dmg: -0.1, mag: -0.15 } }, '찌르기 한 점. 맞으면 심판 기계가 삑 하고 운다. 급소가 아니면 무효.');
P('ammo_reject', 'ammo', '불합격 통지서탄', 5, ['office', 'meme'], { tier: 2, cost: 0.06, m: { dmg: -0.1 }, sp: { opener: 30, execute: 30 }, note: '서류 탈락: 체력이 가득 찬 적 +30% · 최종 탈락: 체력 35% 이하인 적 +30%' }, '귀하의 뛰어난 역량에도 불구하고. 처음과 끝에만 아프다.');
P('ammo_snapper', 'ammo', '콩알탄', 2, ['toy'], { cost: 0.03, m: { dmg: -0.25, elite: -20 }, fx: { explode: 10 }, sp: { fear: 0.05 }, note: '딱! 작게 터진다 · 5% 확률로 맞은 적이 놀라 도망친다' }, '문방구 500원어치. 바닥에 던지던 그것을 총에 넣었다.');

/* ── 고급 ── */
P('ammo_scalpel', 'ammo', '메스 탄두', 3, ['bio'], { cost: 0.2, m: { dmg: 0.1, pen: 20, elite: 20, swarm: -20 }, fx: { leech: 0.5 }, sp: { execute: 45 }, note: '수술 마무리: 체력 35% 이하인 적에게 피해 +45%' }, '보건 선생 서랍에서 나왔다. 절개는 깔끔하게, 봉합은 없다.');
P('ammo_shotput', 'ammo', '포환', 3, ['sport'], { cost: 0.18, m: { dmg: 0.3, pen: 20, knock: 30, rpm: -0.2, mag: -0.25, vel: -0.2, elite: 25, swarm: -10 } }, '7.26킬로그램. 한 발이 무겁고 느리다. 맞은 놈은 기록이 된다.');
P('ammo_hive', 'ammo', '말벌집탄', 3, ['farm', 'bio'], { cost: 0.12, m: { pellets: 1, dmg: -0.05, swarm: 10, elite: -15 }, fx: { homing: 0.6, acid: 1 } }, '처마 밑에서 조심히 떼어 왔다. 나온 놈들이 알아서 쫓아간다.');

/* ── 특수 ── */
P('ammo_meteor', 'ammo', '운석 파편탄', 4, ['tech'], { cost: 0.3, m: { dmg: 0.15, blast: 20, rpm: -0.25, recoil: 0.4, elite: -10 }, fx: { explode: 26, burn: 4 } }, '떼거리 전용 초호화탄. 한 발에 한 무리가 사라지고, 화약 한 통도 사라진다.');
P('ammo_lotto', 'ammo', '로또탄', 5, ['meme'], { tier: 4, cost: 0.2, m: { dmg: -0.1, swarm: -20 }, sp: { moon: 0.12 }, note: '12% 확률로 떡상 (피해 ×5) · 나머지 88%는 꽝' }, '매주 토요일 저녁의 희망을 탄두에 담았다. 당첨 확률은 실제보다 훨씬 높다.');
