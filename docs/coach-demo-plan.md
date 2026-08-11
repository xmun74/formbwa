# 코치 시범 3D 시스템 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 운동 화면 우측 "코치 시범"을, 캐릭터×운동이 늘어도 저작은 N+M으로 끝나는 시스템으로 구현 — 지금은 런타임 플레이어를 선(先)구축하고, 오프라인 렌더 mp4는 파일만 드롭하면 자동 재생되게 한다.

**Architecture:** 오프라인 Blender 렌더가 리그×클립을 N×M mp4로 생성(Track B, Phase 0 게이트 후) → 웹은 매니페스트로 mp4를 골라 `<video loop>` 재생(Track A, 지금). 매니페스트가 계약. 설계: `docs/coach-demo-design.md`.

**Tech Stack:** Next.js(App Router)·React·Zustand(기존) / 네이티브 `<video>`(web 신규 의존성 0) / Track B: Blender(외부)·`@gltf-transform/core`·ffmpeg.

## Global Constraints

- **web 신규 의존성 0** — three.js/r3f 금지, 네이티브 `<video>`만 (spec §2·§7).
- **characterId 불투명·고정** — `character1`·`character2` (특징 이름 금지). 바뀌는 정체성은 매니페스트 데이터에 (spec §4).
- **exerciseId 의미 slug** — `squat` 등. 루틴·core·시범이 같은 slug 공유 (spec §4).
- **Mixamo 휴머노이드 스켈레톤 표준** — 모든 리그·클립 공유 (spec §5).
- **클레이 = Path A** — opengraph 같은 계열·완성도(픽셀 매치 아님), 공용 Blender 셋업 (spec §3 결정2).
- **원본 = `3d-assets/` 로컬 gitignored, 산출물(`public/coach-3d/`)만 커밋** (spec §6).
- **선구축 원칙** — 매니페스트/영상 없으면 플레이스홀더 유지(폴백), audio 인프라와 동형.
- **커밋 규칙** — 사용자가 직접 커밋. 각 태스크 끝 커밋은 *메시지 추천*이며 실행은 사용자.

## 프로세스 현실 (읽고 시작)

- **apps/web엔 테스트 러너 없음**(vitest·RTL 부재). Track A(web 글루)는 기존 audio 패턴대로 **타입체크 + 앱 실행**으로 검증. 강제 테스트 인프라 도입은 범위 밖.
- **Phase 0(렌더 스파이크)은 사용자 Blender/에셋 작업 = 게이트.** 코드 태스크 아님(아래 별도 섹션). Track A와 **병렬 가능**(플레이어는 렌더 결과에 무관).
- **Track B(렌더 파이프라인)** 는 Phase 0 통과 후 **별도 계획**으로 상세화(진짜 유닛테스트는 여기 집중). 이 문서는 Track A를 완결한다.

---

## Phase 0 — 렌더 화질 게이트 (사용자 에셋 작업, 코드 아님)

**목표:** "Blender 클레이 셋업으로 opengraph 같은 클레이 계열·완성도가 나오나?" + "opengraph 여성을 리그드 3D로 옮길 수 있나?"

- [ ] 기존 리그(`3d-assets/`의 busan 리그 등) + Mixamo 스쿼트 클립을 Blender로.
- [ ] 클레이 머티리얼·조명·환경 셋업 → 짧은 루프 렌더 → opengraph와 **스타일 계열·완성도 육안 비교**.
- [ ] `opengraph-image.png` 여성 **image→3D 빠른 테스트**(sample\*.glb 방식) → character1 제작·리깅 난도 가늠.
- **게이트 판정:** 같은 계열·완성도 도달 → Track B 상세화 진행. 미달 → 셋업 반복(또는 아트 방향 재논의).

> Track A는 이 게이트와 **독립**이라 지금 착수 가능.

---

## Track A — 런타임 플레이어 + 통합 (지금 착수)

### 파일 구조

- Create: `apps/web/src/shared/lib/coach-demo/manifest.ts` — 매니페스트 타입 + 로더 + 리졸버 (audio/manifest.ts 미러)
- Create: `apps/web/src/shared/lib/coach-demo/CoachDemo.tsx` — `<video loop>` 컴포넌트
- Create: `apps/web/src/shared/lib/coach-demo/index.ts` — 배럴
- Create: `apps/web/public/coach-3d/manifest.json` — 플레이스홀더 매니페스트(videos 비어있음)
- Create: `apps/web/public/coach-3d/README.md` — 캐릭터·운동 추가법 (public/audio/README.md 미러)
- Modify: `apps/web/src/entities/workout/model/workout.ts` — `WorkoutCoach.characterId` + `exerciseId` 추가
- Modify: `apps/web/src/views/workout/ui/WorkoutView.tsx:315-323` — 우측 플레이스홀더를 `<CoachDemo>`로 감쌈

### Task 1: 매니페스트 모듈 (타입 + 로더 + 리졸버)

**Files:**

- Create: `apps/web/src/shared/lib/coach-demo/manifest.ts`

**Interfaces (Produces):**

- `CoachDemoManifest`, `loadDemoManifest(): Promise<CoachDemoManifest|null>`, `resolveDemoVideo(m, characterId, exerciseId): string|null`

- [ ] **Step 1: manifest.ts 작성** (audio/manifest.ts 패턴 그대로)

```ts
/**
 * 코치 시범 영상 매니페스트 로더. `public/coach-3d/manifest.json`을 읽어
 * characterId×exerciseId → mp4로 매핑. 매니페스트/영상 없으면 null → 플레이스홀더 유지
 * (선구축, audio 폴백과 동형). 캐릭터 정체성(displayName 등)은 id가 아니라 여기에(spec §4).
 */
export interface DemoCharacter {
  displayName: string;
}
export interface CoachDemoManifest {
  characters: Record<string, DemoCharacter>; // characterId → 정체성
  videos: Record<string, Record<string, string>>; // characterId → (exerciseId → 파일명)
}

let cache: CoachDemoManifest | null | undefined;

/** 1회 fetch 후 캐시. 없거나 실패하면 null(폴백). */
export const loadDemoManifest = async (): Promise<CoachDemoManifest | null> => {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const res = await fetch("/coach-3d/manifest.json");
    if (!res.ok) {
      cache = null;
      return null;
    }
    cache = (await res.json()) as CoachDemoManifest;
    return cache;
  } catch {
    cache = null;
    return null;
  }
};

/** characterId×exerciseId → mp4 URL. 없으면 null. */
export const resolveDemoVideo = (
  manifest: CoachDemoManifest,
  characterId: string,
  exerciseId: string,
): string | null => {
  const file = manifest.videos[characterId]?.[exerciseId];
  return file ? `/coach-3d/videos/${file}` : null;
};
```

- [ ] **Step 2: 타입체크** — `pnpm --filter web check-types` → PASS
- [ ] **Step 3: 커밋** (추천 메시지) — `feat(web): 코치 시범 매니페스트 로더 (audio 패턴 미러)`

### Task 2: `<CoachDemo>` 비디오 컴포넌트

**Files:**

- Create: `apps/web/src/shared/lib/coach-demo/CoachDemo.tsx`
- Create: `apps/web/src/shared/lib/coach-demo/index.ts`

**Interfaces:**

- Consumes: Task 1의 `loadDemoManifest`·`resolveDemoVideo`
- Produces: `<CoachDemo characterId exerciseId className children />`

- [ ] **Step 1: CoachDemo.tsx 작성**

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { loadDemoManifest, resolveDemoVideo } from "./manifest";

/**
 * 코치 시범 루프. characterId×exerciseId로 매니페스트에서 mp4를 골라 <video> 재생.
 * mp4/매니페스트 없으면 children(플레이스홀더) 유지 — 선구축, audio 폴백과 동형.
 * 판정과 동기화 안 함(독립 루프, TRD-FE §6.2).
 */
export function CoachDemo({
  characterId,
  exerciseId,
  className,
  children,
}: {
  characterId: string;
  exerciseId: string;
  className?: string;
  children?: ReactNode; // 폴백 플레이스홀더
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void loadDemoManifest().then((m) => {
      if (alive)
        setSrc(m ? resolveDemoVideo(m, characterId, exerciseId) : null);
    });
    return () => {
      alive = false;
    };
  }, [characterId, exerciseId]);

  if (!src) return <>{children}</>;
  return (
    <video
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
}
```

- [ ] **Step 2: index.ts 배럴**

```ts
export { CoachDemo } from "./CoachDemo";
export {
  loadDemoManifest,
  resolveDemoVideo,
  type CoachDemoManifest,
  type DemoCharacter,
} from "./manifest";
```

- [ ] **Step 3: 타입체크** — `pnpm --filter web check-types` → PASS
- [ ] **Step 4: 커밋** — `feat(web): <CoachDemo> 시범 영상 플레이어 (없으면 플레이스홀더 폴백)`

### Task 3: characterId + exerciseId 레지스트리

**Files:**

- Modify: `apps/web/src/entities/workout/model/workout.ts`

**Interfaces (Produces):**

- `WorkoutCoach.characterId: "character1" | "character2"`, store의 `exerciseId: string`

- [ ] **Step 1: WorkoutCoach에 characterId 추가** (`workout.ts:9-13`)

```ts
export interface WorkoutCoach {
  id: "pt" | "busan";
  characterId: "character1" | "character2"; // 불투명 안정 id (spec §4). 정체성은 매니페스트에
  name: string;
  emoji: string;
}
```

- [ ] **Step 2: DEFAULT_COACH에 characterId** (`workout.ts:54-58`)

```ts
const DEFAULT_COACH: WorkoutCoach = {
  id: "pt",
  characterId: "character1",
  name: "열정 PT쌤",
  emoji: "🔥",
};
```

- [ ] **Step 3: store에 exerciseId 필드 추가** — `WorkoutState`에 `exerciseId: string;` 선언, 초기값 `exerciseId: "squat"`, `reset`에도 `exerciseId: "squat"` 포함. (현재 `exerciseName`은 표시용으로 유지, `exerciseId`는 slug — spec §4)

- [ ] **Step 4: 다른 코치(busan) 정의처에도 characterId 반영** — `setCoach`로 busan을 넣는 곳(예: `views/workout-setup` 캐릭터 카드) 검색 후 `characterId: "character2"` 추가. Run: `grep -rn "busan" apps/web/src` 로 정의처 확인 → 누락 없이 반영.

- [ ] **Step 5: 타입체크** — `pnpm --filter web check-types` → PASS (WorkoutCoach 리터럴 누락 시 에러로 잡힘)
- [ ] **Step 6: 커밋** — `feat(web): 코치 characterId(불투명) + exerciseId(slug) 도입`

### Task 4: WorkoutView 우측 패널 통합

**Files:**

- Modify: `apps/web/src/views/workout/ui/WorkoutView.tsx` (import 추가 + `:315-323` 우측 패널)

**Interfaces:**

- Consumes: Task 2 `<CoachDemo>`, Task 3 `coach.characterId`·`exerciseId`

- [ ] **Step 1: import 추가** (파일 상단 import 블록)

```tsx
import { CoachDemo } from "@/shared/lib/coach-demo";
```

- [ ] **Step 2: store에서 exerciseId 구독** — `useWorkoutStore()` 구조분해에 `exerciseId` 추가.

- [ ] **Step 3: 우측 실루엣 플레이스홀더를 `<CoachDemo>`로 감쌈** — 현재 실루엣 span(`WorkoutView.tsx:323`)을 CoachDemo의 폴백 children으로:

```tsx
{
  /* 우: 코치 시범 (mp4 있으면 재생, 없으면 실루엣 플레이스홀더) */
}
<CoachDemo
  characterId={coach.characterId}
  exerciseId={exerciseId}
  className="absolute inset-0 size-full object-cover"
>
  <span className="bg-dark-surface-2/60 absolute bottom-0 left-1/2 h-72 w-30 -translate-x-1/2 rounded-t-[60px]" />
</CoachDemo>;
```

- [ ] **Step 4: 타입체크 + 앱 실행 검증** — `pnpm --filter web check-types` → PASS. `pnpm --filter web dev` → `/workout` 우측이 여전히 실루엣(영상 없으니 폴백)으로 보이고 콘솔 에러 없음. (web 테스트 러너 없음 → 앱 실행으로 검증)
- [ ] **Step 5: 커밋** — `feat(web): 운동 화면 우측을 <CoachDemo>로 교체 (플레이스홀더 폴백)`

### Task 5: 플레이스홀더 매니페스트 + 드롭인 문서

**Files:**

- Create: `apps/web/public/coach-3d/manifest.json`
- Create: `apps/web/public/coach-3d/README.md`

- [ ] **Step 1: 플레이스홀더 manifest.json** — videos 비어 있어 리졸버가 null → 폴백 유지. 영상 생기면 여기 한 줄 추가로 자동 재생.

```json
{
  "characters": {
    "character1": { "displayName": "열정 PT쌤" },
    "character2": { "displayName": "부산 코치" }
  },
  "videos": {}
}
```

- [ ] **Step 2: README.md** (public/audio/README.md 미러) — "① `videos/`에 `<characterId>-<exerciseId>.mp4` 드롭 ② manifest `videos`에 `characterId → { exerciseId: 파일명 }` 추가. 없으면 플레이스홀더 폴백." + characterId/exerciseId 규칙(spec §4) 요약.

- [ ] **Step 3: 앱 재실행 검증** — manifest.json이 200으로 로드되고(네트워크 탭), videos 비어 있으니 폴백 유지, 콘솔 에러 없음.
- [ ] **Step 4: 커밋** — `feat(web): 코치 시범 플레이스홀더 매니페스트 + 드롭인 README`

> **Track A 완료 정의:** `/workout` 우측이 `<CoachDemo>`로 구동되고, `public/coach-3d/`에 mp4 + manifest 한 줄만 드롭하면 **코드 변경 0으로** 시범 영상이 재생된다(선구축 완료).

---

## Track B — 렌더 파이프라인 (Phase 0 통과 후, 별도 계획)

Phase 0에서 클레이 셋업이 확정돼야 render.py 세부가 정해지므로, 통과 후 별도 계획으로 상세화. 개요만:

- `packages/coach-assets` 워크스페이스 패키지 생성 (vitest 가능 = **진짜 유닛테스트 여기 집중**).
- `src/render.py` — Blender 헤드리스: 리그+클립+클레이셋업 → 프레임 → mp4(ffmpeg).
- `src/build.ts` — 조합 나열·증분 판단·스켈레톤 본이름 호환 검증·manifest 생성 → `public/coach-3d/`. (이 순수 로직들이 유닛테스트 대상)
- turbo task `render-demos`. 로컬 렌더 → 산출물 커밋(원본은 로컬 gitignored).
- 테스트 대상(예): 조합 열거(N×M), manifest 생성 형태, 스켈레톤 본이름 불일치 검증기.

---

## Self-Review (스펙 대조)

- **§2·§7 web 의존성 0:** Track A는 네이티브 `<video>`만 ✓
- **§3 팩터링:** 매니페스트 = characterId × exerciseId → mp4, Track B가 N×M 생성 ✓
- **§4 식별자:** characterId 불투명(Task 3)·exerciseId slug(Task 3)·정체성은 매니페스트(Task 1 DemoCharacter) ✓
- **§4 coach↔characterId 매핑 선반영:** Task 3 ✓
- **§6 폴더:** public/coach-3d/(산출물, Task 1·5), 원본 gitignored ✓
- **§8 Phase 0:** 게이트 섹션으로 명시(코드 아님) ✓
- **§8 Phase 1(수직 슬라이스):** Track A = 플레이어+통합 = Phase 1의 웹 측. 렌더 측은 Track B ✓
- **선구축(§ audio 동형):** manifest 없으면 폴백(Task 1·2) ✓
- **타입 일관성:** `loadDemoManifest`/`resolveDemoVideo`/`CoachDemoManifest`/`characterId`/`exerciseId` — Task 1→2→4 전반 일치 ✓
- **갭:** 렌더 파이프라인 실제 구현(Track B)은 Phase 0 게이트 후 별도 계획 — 의도된 분리.
