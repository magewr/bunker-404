// BUNKER 404 — 파츠 확장 E: 조준기 22종 + 부착물 34종
// 역할이 뚜렷하다: 대군중(swarm·opener·momentum·overkill·blast) ↔ 대보스(elite·head·focus·sunder·execute)
'use strict';

/* ───────────── 조준기 ───────────── */
// T0
P('sight_pipe', 'sight', '배관 엘보 가늠자', 0, ['pipe', 'junk'], { m: { spread: -0.07, head: 0.1 } }, '구부러진 배관 구멍으로 본다. 보이는 건 대체로 녹이다.');
P('sight_goggles', 'sight', '물안경', 0, ['sport'], { m: { crit: 5, spread: 0.06 } }, '물은 없지만 눈은 보호된다. 김이 좀 서린다.');
P('sight_scarecrow', 'sight', '허수아비 십자', 0, ['farm'], { m: { swarm: 8 } }, '밀짚으로 엮은 십자선. 참새는 확실히 쫓는다.');
P('sight_toybinoc', 'sight', '장난감 쌍안경', 0, ['toy'], { m: { head: 0.25, spread: 0.06 } }, "'배율 8배' 라고 적혀 있다. 거짓말이다.");
// T1
P('sight_archery', 'sight', '양궁 조준핀', 1, ['sport'], { m: { head: 0.5, spread: -0.15, swarm: -10 } }, '10점이 아니면 실망한다. 과녁이 많으면 더 실망한다.');
P('sight_level', 'sight', '수평계', 1, ['farm'], { m: { recoil: -0.22, spread: -0.1, rpm: -0.06 } }, '기포가 가운데 올 때만 쏜다. 농막 지을 때 쓰던 것.');
P('sight_tractor', 'sight', '경운기 백미러', 1, ['farm'], { m: { swarm: 18, crit: 4, elite: -12 } }, '뒤따라오는 놈들이 전부 보인다. 큰 놈은 거울에 다 안 들어온다.');
P('sight_periscope', 'sight', '우유팩 잠망경', 1, ['toy'], { m: { head: 0.4, crit: 3, reload: 0.08 } }, '우유팩 두 개와 거울 두 장. 방학 숙제 최우수상.');
P('sight_racket', 'sight', '배드민턴 라켓', 5, ['sport', 'meme'], { tier: 1, m: { swarm: 25, head: -0.4, spread: 0.1 } }, '줄 사이로 보이는 건 전부 표적이다. 약수터 20년 경력.');
P('sight_colander', 'sight', '채반', 5, ['kitchen', 'meme'], { tier: 1, m: { swarm: 15, crit: 5, spread: 0.15, head: -0.2 } }, '구멍마다 한 놈씩 보인다. 원래는 국수 건지던 것.');
// T2
P('sight_golf', 'sight', '골프 거리측정기', 2, ['sport'], { m: { head: 0.7, elite: 20, rpm: -0.08, swarm: -15 } }, '핀까지 152미터. 놈의 미간까지 38미터.');
P('sight_plumb', 'sight', '다림추', 2, ['farm'], { m: { pen: 25, head: 0.5, rpm: -0.08, swarm: -12 } }, '중력은 거짓말을 안 한다. 맨홀 뚜껑의 빈틈을 정확히 짚는다.');
P('sight_spyglass', 'sight', '해적 망원경', 2, ['toy'], { m: { head: 0.9, elite: 10, rpm: -0.1, swarm: -10 } }, '쭉 늘어난다. 저 멀리 보물... 아니, 머리가 보인다.');
P('sight_ring', 'sight', '광각 링 조준기', 2, ['mil'], { m: { swarm: 22, rpm: 0.06, head: -0.4, elite: -10 } }, '크게 뚫린 고리. 대충 넣고 당기면 누군가는 맞는다.');
P('sight_kaleido', 'sight', '만화경', 5, ['toy', 'meme'], { tier: 2, m: { pellets: 1, dmg: -0.05, spread: 0.45, head: -0.4, swarm: 15 } }, '표적이 여섯 개로 보인다. 그래서 여섯 군데로 쏜다.');
// T3
P('sight_iris', 'sight', '사격 선수용 조리개 안경', 3, ['sport'], { m: { head: 1.0, crit: 8, swarm: -25, rpm: -0.1 }, sp: { focus: 3 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +3% (최대 10중첩)' }, '결선 마지막 한 발의 심박수로 쏜다.');
P('sight_vane', 'sight', '수탉 풍향계', 3, ['farm'], { m: { swarm: 20, head: -0.4, elite: -15 }, sp: { momentum: 6 }, note: '처치할 때마다 3초간 피해 +6% (최대 5중첩)' }, '닭이 가리키는 쪽에 놈들이 있다. 대체로.');
P('sight_blaster', 'sight', '삐용삐용 광선총 조준기', 5, ['toy', 'meme'], { tier: 3, m: { rpm: 0.12, swarm: 15, elite: -20, head: -0.3 }, sp: { momentum: 4 }, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩)' }, '삐용삐용 소리가 난다. 끌 수 없다. 건전지도 못 뺀다.');
P('sight_compound', 'sight', '이식한 겹눈', 3, ['bio'], { m: { swarm: 30, crit: 6, head: -0.6, elite: -20 } }, '수백 개의 눈이 수백 마리를 본다. 한 놈에게 집중하는 법은 잊었다.');
P('sight_microscope', 'sight', '현미경', 3, ['tech', 'office'], { m: { head: 1.2, rpm: -0.15, swarm: -30 }, fx: { sunder: 0.5 } }, '세포 단위로 약점을 찾는다. 찾는 동안 옆에서 물린다.');
// T4
P('sight_monocle', 'sight', '외알 안경', 4, ['office'], { m: { head: 1.0, crit: 15, elite: 30, swarm: -30, rpm: -0.1 }, fx: { gold: 20 } }, '신사는 한 번에 한 명만 상대한다. 그리고 반드시 팁을 받는다.');
P('sight_crystal', 'sight', '점집 수정구슬', 5, ['meme'], { tier: 4, m: { crit: 15, spread: 0.2, jam: 2 }, sp: { execute: 50, thermal: 1 }, note: '체력 35% 이하인 적에게 피해 +50% · 안개 너머를 본다' }, '"곧 죽을 상이로다." 복채는 선불. 가끔 헛것도 본다.');

/* ───────────── 부착물: 스포츠 ───────────── */
P('acc_sweatband', 'acc', '손목 아대', 0, ['sport'], { m: { recoil: -0.1 } }, '땀이 총에 떨어지지 않는다. 그게 전부다.');
P('acc_whistle', 'acc', '심판 호루라기', 1, ['sport'], { m: { swarm: 10, elite: -8 }, sp: { fear: 0.04 }, note: '4% 확률로 맞은 적이 반칙 선언에 놀라 도망친다' }, '삑! 반칙! 큰 놈들은 심판 말을 안 듣는다.');
P('acc_stopwatch', 'acc', '스톱워치', 1, ['sport'], { m: { reload: -0.18, rpm: 0.05, spread: 0.1 } }, '재장전 신기록에 도전한다. 서두르다 좀 흔들린다.');
P('acc_shuttle', 'acc', '셔틀콕', 5, ['sport', 'meme'], { tier: 1, m: { dmg: -0.12, vel: -0.1 }, fx: { bounce: 1 } }, '깃털을 달았더니 탄이 통통 튄다. 스매싱!');
P('acc_jumprope', 'acc', '줄넘기', 2, ['sport'], { m: { swarm: 10, elite: -15 }, sp: { momentum: 6 }, note: '처치할 때마다 3초간 피해 +6% (최대 5중첩)' }, '쌩쌩이. 리듬을 타면 멈출 수 없다. 걸리면 처음부터.');
P('acc_bowlingpin', 'acc', '볼링핀', 5, ['sport', 'meme'], { tier: 2, m: { knock: 30, elite: -15 }, sp: { overkill: 1 }, note: '스트라이크: 처치 시 남는 피해가 가까운 적에게 옮겨간다' }, '쓰러진 놈이 옆 놈을 친다. 스페어 처리는 셀프.');
P('acc_scoreboard', 'acc', '수동 점수판', 3, ['sport'], { m: { dmg: -0.08 }, sp: { overtime: 0.35 }, note: '9회말 역전: 남은 적이 30% 이하면 피해 +35%' }, '초반에는 몸이 덜 풀린다. 끝날 때까지 끝난 게 아니다.');
P('acc_medal', 'acc', '금메달', 3, ['sport'], { m: { elite: 25, crit: 8, swarm: -15 }, fx: { gold: 15 } }, '큰 경기에 강하다. 예선전에는 관심이 없다.');

/* ───────────── 부착물: 농기구 ───────────── */
P('acc_strawhat', 'acc', '밀짚모자', 0, ['farm'], { m: { loot: 5, jam: -1 } }, '총에 씌웠다. 총도 더위를 탄다.');
P('acc_hoe', 'acc', '호미', 0, ['farm'], { m: { knock: 10, crit: 2 } }, '세계가 인정한 K-원예용품. 총에 달 물건은 아니다.');
P('acc_sickle', 'acc', '낫', 1, ['farm'], { m: { reload: 0.06 }, sp: { execute: 30 }, note: '체력 35% 이하인 적에게 피해 +30%' }, '벼는 익을수록 고개를 숙인다. 고개 숙인 놈부터 벤다.');
P('acc_cowbell', 'acc', '워낭', 1, ['farm', 'music'], { m: { spread: 0.08, elite: -6 }, sp: { momentum: 4 }, note: '처치할 때마다 3초간 피해 +4% (최대 5중첩)' }, '소는 없지만 소리는 남았다. 딸랑딸랑.');
P('acc_scarecrow', 'acc', '꼬마 허수아비', 2, ['farm'], { m: { swarm: 18, spread: -0.05, elite: -12 } }, '놈들이 본능적으로 싫어한다. 까마귀의 피가 섞였나 보다.');
P('acc_fertilizer', 'acc', '비료 포대', 2, ['farm'], { m: { blast: 30, dmg: -0.1, jam: 2 }, fx: { explode: 10 } }, '질소 함량: 높음. 취급 주의: 매우 높음.');
P('acc_makgeolli', 'acc', '새참 주전자', 5, ['farm', 'meme'], { tier: 2, m: { dmg: 0.16, spread: 0.25, recoil: 0.15 } }, '새참 한 사발. 화력은 오르고 조준선은 춤춘다.');
P('acc_sprayer', 'acc', '농약 분무기', 3, ['farm'], { m: { swarm: 40, elite: -30 }, fx: { acid: 1 } }, '벌레에는 농약. 큰 놈한테는 그냥 샤워다.');
P('acc_rooster', 'acc', '수탉', 5, ['farm', 'meme'], { tier: 3, m: { elite: -15, recoil: 0.1 }, sp: { opener: 60 }, note: '새벽을 여는 첫 발: 체력이 가득 찬 적에게 피해 +60%' }, '꼬끼오. 첫 발에 모든 걸 건다. 두 번째 발에는 관심이 없다.');

/* ───────────── 부착물: 완구 ───────────── */
P('acc_top', 'acc', '팽이', 0, ['toy'], { m: { rpm: 0.05, spread: 0.05 } }, '돌아라 돌아라. 총도 같이 돈다.');
P('acc_yoyo', 'acc', '요요', 1, ['toy'], { m: { dmg: -0.08 }, fx: { bounce: 1 } }, '갔다가 돌아온다. 탄도 한 번 튄다.');
P('acc_capgun', 'acc', '딱총 화약', 1, ['toy'], { m: { dmg: -0.05 }, sp: { cheap: 0.3 }, note: '문방구 화약을 섞어 쓴다: 탄약값 -30%' }, '빨간 종이에 점점이 박힌 그것. 냄새가 추억이다.');
P('acc_slime', 'acc', '액체괴물', 5, ['toy', 'meme'], { tier: 1, m: { rpm: -0.05 }, fx: { freeze: 0.1 } }, '끈적하다. 맞은 놈도 끈적해진다. 카펫에 묻으면 끝이다.');
P('acc_blocks', 'acc', '블록 조각', 2, ['toy'], { m: { knock: 15, reload: 0.06 }, sp: { thorns: 22 }, note: '문 앞에 뿌려 둔다: 문을 때리는 적에게 초당 22 피해' }, '밟으면 아프다. 맨발의 돌연변이에게는 치명적이다.');
P('acc_teddy', 'acc', '곰인형', 2, ['toy'], { m: { recoil: -0.25, spread: -0.1, rpm: -0.08 }, fx: { leech: 0.5 } }, '꼭 안고 쏜다. 지켜야 할 것이 생기면 사람은 달라진다.');
P('acc_robot', 'acc', '태엽 로봇', 3, ['toy', 'tech'], { m: { swarm: 12, dmg: -0.08 }, fx: { homing: 0.4 } }, '태엽을 감으면 탄을 유도해 준다. "삐빅. 좌로 3도."');
P('acc_rc', 'acc', 'RC카 조종기', 3, ['toy'], { m: { swarm: -15, rpm: -0.05 }, sp: { focus: 4 }, note: '같은 적을 연속으로 맞힐 때마다 피해 +4% (최대 10중첩)' }, '한 놈만 끝까지 쫓아간다. 초등학교 운동장의 그 집념.');
P('acc_ttakji', 'acc', '전설의 딱지', 5, ['toy', 'meme'], { tier: 4, m: { elite: -30, reload: 0.1 }, sp: { opener: 80, overkill: 1 }, note: '체력이 가득 찬 적에게 피해 +80% · 처치 시 남는 피해가 옆 적에게 옮겨간다' }, '동네에서 한 번도 넘어간 적 없는 딱지. 넘기는 건 전문이다.');

/* ───────────── 부착물: 그 밖 ───────────── */
P('acc_ducttape', 'acc', '청테이프', 0, ['junk'], { m: { jam: -2, recoil: -0.04 } }, '안 붙는 게 없다. 고장도 붙여 버린다.');
P('acc_memo', 'acc', '접착 메모지', 0, ['office'], { m: { reload: -0.04, crit: 2 } }, "'장전할 것' 이라고 적혀 있다. 덕분에 안 까먹는다.");
P('acc_earplug', 'acc', '귀마개', 0, ['junk'], { m: { recoil: -0.05, spread: -0.04 } }, '총소리가 안 들린다. 이장님 방송도 안 들린다. 일석이조.');
P('acc_mixcoffee', 'acc', '믹스커피 스틱', 5, ['kitchen', 'meme'], { tier: 1, m: { rpm: 0.12, reload: -0.05, spread: 0.14 } }, '한국인의 연료. 손이 떨리는 건 정상이다.');
P('acc_metronome', 'acc', '메트로놈', 2, ['music'], { m: { rpm: -0.06, recoil: -0.1 }, sp: { sonic: 12 }, note: '12발마다 음파 충격 (광역 피해+넉백)' }, '똑, 딱, 똑, 딱. 열두 번째 박에 뭔가 터진다.');
P('acc_shredder', 'acc', '문서 세단기', 3, ['office'], { m: { elite: 10, swarm: -20, rpm: -0.08 }, fx: { sunder: 1.5 } }, '기밀문서도 보스도 잘게 썬다. 잡몹은 종이 걸림을 일으킨다.');
P('acc_thirdhand', 'acc', '세 번째 손', 4, ['bio'], { m: { reload: -0.4, rpm: 0.1, recoil: -0.15, dmg: -0.1, loot: -10 } }, '당신 것이 아닌 손이 탄창을 갈아 준다. 가끔 전리품도 슬쩍한다.');
P('acc_redbutton', 'acc', '빨간 버튼', 5, ['meme', 'tech'], { tier: 4, m: { blast: 40, elite: -25, jam: 2 }, sp: { popcorn: 0.5 }, note: "처치 시 50% 확률로 '펑' (연쇄 폭발 주의)" }, "'누르지 마시오' 라고 적혀 있다. 그래서 눌렀다.");
