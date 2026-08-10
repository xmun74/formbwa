# 코치 음성 (mp3) — M4

코치 대사를 사전 생성 mp3로 서빙한다. **없으면 Web Speech로 자동 폴백**하므로,
mp3와 매니페스트를 여기 드롭하면 코드 변경 없이 mp3 재생으로 전환된다.

## 배치

```
public/audio/
├── pt/
│   ├── manifest.json
│   ├── knee_shallow-1.mp3
│   └── ...
└── busan/
    ├── manifest.json
    └── ...
```

## manifest.json 형식

`clipKey`(= 판정 이벤트 타입) → mp3 파일명 후보 배열. 재생 시 랜덤 1개.

```json
{
  "clips": {
    "knee_shallow": ["knee_shallow-1.mp3", "knee_shallow-2.mp3"],
    "back_bent": ["back_bent-1.mp3"],
    "knee_over_toe": ["knee_over_toe-1.mp3"],
    "tempo_too_fast": ["tempo_too_fast-1.mp3"],
    "good_rep": ["good_rep-1.mp3", "good_rep-2.mp3"]
  }
}
```

- `clipKey`는 `@repo/core`의 `JudgeEventType`과 일치 (`rep_counted` 제외 — 무음).
- 대사 텍스트는 `views/workout/model/mnemonics.ts`. mp3 녹음 스크립트는 이 텍스트를 쓴다.
  단 **음성(mp3)과 자막(text)은 독립**이라 파일명만 맞으면 된다 (§6.1).

## 소비 경로

- 재생: `shared/lib/audio` `playClip({ coachId, clipKey, text })` — mp3 우선, 폴백 `speak(text)`
- 프리로드: `/start` 코치 선택 → `preloadCoachAudio(coachId)`
- 이름 호명(임의 텍스트)은 mp3로 못 만들어 세트 경계 런타임 TTS 유지 (§6.1)
