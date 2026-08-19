# 코치 시범 영상 (mp4) — F1-8

코치 시범을 사전 렌더 mp4 루프로 서빙한다. **없으면 실루엣 플레이스홀더로 폴백**하므로,
mp4와 매니페스트 항목을 여기 드롭하면 코드 변경 없이 시범 재생으로 전환된다(선구축).

렌더는 오프라인 Blender 파이프라인(`packages/coach-assets`, Phase 0 게이트 후)이 생성한다.
원본(리그·클립·클레이 셋업)은 `3d-assets/`(로컬 gitignored), **여기엔 산출물(mp4)만 커밋한다.**

## 배치

```
public/coach-3d/
├── manifest.json
└── videos/
    ├── character1-squat.mp4
    ├── character2-squat.mp4
    └── ...
```

파일명 규칙: `<characterId>-<exerciseId>.mp4`.

## manifest.json 형식

```json
{
  "characters": {
    "character1": { "displayName": "열정 PT쌤" },
    "character2": { "displayName": "부산 코치" }
  },
  "videos": {
    "character1": { "squat": "character1-squat.mp4" },
    "character2": { "squat": "character2-squat.mp4" }
  }
}
```

- **`characterId`(`character1`…)는 불투명·고정** — 특징(이름·사투리·외형)이 바뀌어도 불변.
  바뀌는 정체성(`displayName` 등)은 id가 아니라 `characters`에 담는다.
- **`exerciseId`(`squat`…)는 의미 slug** — 루틴·`@repo/core`(판정)·시범이 같은 slug를 공유한다.
- `videos`가 비어 있으면(현재) 전부 플레이스홀더 폴백. 조합을 추가하려면 mp4를 `videos/`에
  드롭하고 여기 한 줄 추가하면 된다.

## 소비 경로

- 재생: `shared/lib/coach-demo` `<CoachDemo characterId exerciseId>` — mp4 우선, 없으면 children(플레이스홀더)
- 매니페스트 로더: `loadDemoManifest()` / 리졸버: `resolveDemoVideo(manifest, characterId, exerciseId)`
- 판정과 동기화하지 않는 독립 루프 (TRD-FE §6.2)
