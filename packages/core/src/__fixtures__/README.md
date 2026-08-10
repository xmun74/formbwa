# 판정 회귀 fixture (TRD-FE §5.4)

`runSquatPipeline`에 넣을 랜드마크 시퀀스. 스냅샷 테스트(`pipeline.test.ts`)가 이걸 돌려
기대 이벤트를 고정하므로, 판정 튜닝 시 **회귀(의도치 않은 변화)를 잡는다.**

## 형식

```jsonc
{
  "name": "설명",
  "standingKneeAngle": 172,   // (선택) 캘리브 기립각. 없으면 프레임에서 추정
  "expect": {                 // (선택) 이 fixture가 만족해야 할 판정 기대
    "repCount": 3,            //   세어야 할 rep 수
    "mustInclude": ["knee_over_toe"],  // 반드시 나와야 할 이벤트(결함 fixture)
    "mustExclude": ["back_bent"]       // 절대 나오면 안 될 이벤트(정상 fixture)
  },
  "frames": [
    { "landmarks": [ { "x": 0.5, "y": 0.6, "z": 0, "visibility": 1 }, ... 33개 ], "timestampMs": 0 },
    ...
  ]
}
```

- `landmarks`는 MediaPipe Pose 33개 순서. 정규화 좌표(0~1), y는 아래로 증가.
- `timestampMs`는 프레임 시각(단조 증가).
- **`expect`(선택)** — 촬영자가 아는 의도를 선언한다. 스냅샷은 "변했나(회귀)"만 잡지만
  `expect`는 "옳은가(의도)"까지 잡는다. 예: 정상 fixture엔 `mustExclude`로 오탐 방지,
  무릎 안쪽 fixture엔 `mustInclude: ["knee_over_toe"]`. 검증 로직은 `checkFixture()`(core).

## 실제 fixture 추가법

1. 정상/불량 스쿼트를 **측면 45°**로 촬영 (M3·M4 겸용 — 촬영은 한 번)
2. 웹 `/dev/extract` 도구에 영상을 넣어 프레임별 랜드마크 JSON을 추출(다운로드)
3. 이 폴더에 `정상-01.json`, `무릎안쪽-01.json` 등으로 저장하고, **찍을 때 안 의도를 `expect`에 적는다**
4. **`__fixtures__/index.ts`의 `FIXTURES` 배열에 한 줄 추가** → 회귀 하네스(`fixture.test.ts`)에 자동 포함
5. `pnpm --filter @repo/core test` — 첫 실행 시 스냅샷 생성 → **사람이 눈으로 검수**(기대대로인지).
   이후 판정 튜닝은 이 스냅샷·`expect`와 자동 비교

`sample-squat.json`은 합성 데이터(형식·`expect` 예시)라 실제 촬영본이 생기면 대체·보강한다.
