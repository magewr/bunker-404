# dev/

게임에는 포함되지 않는 개발용 파일들입니다.

## 개발 도구

### 헤드리스 시뮬레이터 — `dev/headless.js`

브라우저 없이 Node 만으로 전투·캠페인 시뮬레이션을 돌립니다 (Node 코어 모듈만 사용).
게임 스크립트를 vm 컨텍스트 하나에 올리고, 캔버스·DOM 은 아무것도 그리지 않는 스텁으로 대체한 뒤 `dev/sim.js` 의 봇을 실행합니다.
`js/data_parts_*.js`, `js/gunart_ext_*.js`, `js/data_world2.js` 는 있으면 자동으로 함께 올립니다 (문법 오류가 있는 파일은 경고만 내고 건너뜁니다).

```bash
node dev/headless.js waves 1,4,7,10 1 1
```

정해진 장비 구성(`LOAD`)으로 해당 일차의 밤 전투를 봇이 플레이합니다. 인자: `<일차 목록> [skill=1] [repeats=1]`.
`skill` 은 봇의 서투름입니다 (1 = 준수한 플레이어, 1.7 = 조준이 서툰 플레이어). `LOAD` 에 없는 일차는 그 이전의 가장 가까운 장비로 돌리고 줄 끝에 표시합니다.
출력: `d10 WIN t=56 k=87 gate=50/220 dps=317/340 nuts=611` → 승패 · 소요 초 · 처치 · 남은 문 내구도 · 실제 DPS/표기 DPS · 획득 너트.

```bash
node dev/headless.js autoplay 30 1 1
```

1일차부터 캠페인 전체를 자동 플레이합니다 (원정·상점·뽑기·시설·강화·장비 교체·전투). 인자: `[days=30] [skill=1] [runs=1]`.
날짜별 한 줄 로그 뒤에 요약(승/패, 남은 목숨, 등급 분포, 소요 시간)이 붙습니다. 30일 한 판에 약 5~10초.

```bash
node dev/headless.js eval "Waves.hpMul(20)"
```

게임 컨텍스트 안에서 식을 평가해 출력합니다. `Game`, `Combat`, `PARTS`, `Waves`, `simWave`, `autoplay` 등 전역을 그대로 쓸 수 있습니다.
예: `node dev/headless.js eval "Game.newGame('normal'); Game.gunStats(0).dps"`

밸런스 수치는 주로 `js/data_enemies.js` 의 `Waves` (hpMul, budget, nutRate) 와 보스 hp, `js/game.js` 의 `tierCap`/`TIER_CURVE` 에 있습니다.

### 그 밖의 파일

- `dev/sim.js` — 봇과 장비 구성. 브라우저 콘솔에서도 쓸 수 있습니다 (`<script>` 로 주입 후 `runAll([...], 1)`).
- `dev/validate.js` — 파츠 데이터·그림 검증. `node dev/validate.js [b c d ...]`
- `dev/server.py` — 캐시를 끈 정적 서버. `python3 dev/server.py` → http://localhost:8404

### 파츠 검증기 — `dev/validate.js`

```bash
node dev/validate.js
```

모든 파츠(`js/data_parts.js` + `js/data_parts_*.js`)의 id 중복·슬롯·태그·스탯 키·몸통 base 필드를 검사하고, 파츠마다 그림(`gunart.js` + `gunart_ext_*.js`)이 등록되어 있고 실제로 그려지는지 확인합니다. 파츠를 추가하면 반드시 돌리세요. 마지막 줄이 `통과` 여야 합니다.

### 파츠 밸런스 감사 — `dev/audit.js`

```bash
node dev/audit.js --flags
```

파츠를 기준 총 여러 자루에 하나씩 끼워 보고 대보스/대군중 화력 변화를 재서, 등급에 비해 너무 강한 파츠·단점 없는 파츠·아무도 안 쓸 파츠·값과 성능이 안 맞는 탄약을 표시합니다.

### 브라우저 안에서 돌리는 시뮬레이터 — `dev/sim.js`

페이지 콘솔에서 `<script src="dev/sim.js">` 로 주입한 뒤 `runAll([1,4,7,10], 1)` / `autoplay(1, 10)`. 화면이 숨겨져 애니메이션 프레임이 돌지 않을 때는 `Combat.debug.step(프레임 수, dt)` 로 전투를 손으로 진행합니다.

### 캐시 없는 개발 서버 — `dev/server.py`

```bash
python3 dev/server.py
```
