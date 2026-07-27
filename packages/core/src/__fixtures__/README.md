# 판정 회귀 fixture (TRD-FE §5.4)

`runSquatPipeline`에 넣을 랜드마크 시퀀스. 스냅샷 테스트(`pipeline.test.ts`)가 이걸 돌려
기대 이벤트를 고정하므로, 판정 튜닝 시 **회귀(의도치 않은 변화)를 잡는다.**

## 형식

```jsonc
{
  "name": "설명",
  "standingKneeAngle": 172,   // (선택) 캘리브 기립각. 없으면 프레임에서 추정
  "frames": [
    { "landmarks": [ { "x": 0.5, "y": 0.6, "z": 0, "visibility": 1 }, ... 33개 ], "timestampMs": 0 },
    ...
  ]
}
```

- `landmarks`는 MediaPipe Pose 33개 순서. 정규화 좌표(0~1), y는 아래로 증가.
- `timestampMs`는 프레임 시각(단조 증가).

## 실제 fixture 추가법

1. 정상/불량 스쿼트를 **측면 45°**로 촬영 (M3·M4 겸용 — 촬영은 한 번)
2. 그 영상을 `PoseLandmarker`로 돌려 프레임별 랜드마크를 위 형식 JSON으로 추출
   (웹 `useCameraPose` 경로를 오프라인 스크립트로 재사용하면 됨)
3. 이 폴더에 `정상-01.json`, `무릎안쪽-01.json` 등으로 저장
4. `pipeline.test.ts`에 로드+스냅샷 케이스 추가 → `pnpm --filter @repo/core test`
5. 첫 실행 시 스냅샷 생성 → **사람이 눈으로 검수**(기대대로인지). 이후 튜닝은 이 스냅샷과 비교

`sample-squat.json`은 합성 데이터(형식 예시)라 실제 촬영본이 생기면 대체·보강한다.
