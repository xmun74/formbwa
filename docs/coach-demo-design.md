# 코치 시범 시스템 설계 (F1-8 재설계) — 오프라인 렌더 파이프라인

- **작성일:** 2026-08-11 · **갱신:** 2026-08-20
- **상태:** ✅ **구현 완료** — Phase 0(렌더 화질 게이트)·Phase 1(character1×스쿼트)·Phase 2(character2 팩터링 실증) 완료. Track A(플레이어)·Track B(`packages/coach-assets` 렌더 파이프라인) 구현·커밋(PR #1). **남음**: Phase 3(운동 카탈로그 확장·최종 코치-얼굴 캐릭터 정식화) — M6/사투리 게이트 후.
- **범위:** 운동 화면 우측 "코치 시범"을, 캐릭터×운동이 확장돼도 **저작은 N+M**으로 끝나고 **opengraph 화질**을 보장하는 시스템으로 재설계
- **관련:** PRD F1-8, TRD-FE §6.2, `docs/TASKS.md` M4, 기존 `3d-assets/`, `apps/web/app/opengraph-image.png`(아트 레퍼런스)

---

## 1. 문제 (왜 재설계인가)

기존 TRD는 "사전 렌더 mp4 루프"였으나 **손으로 하나씩** 만드는 전제였다. 이는 **캐릭터 N개 × 운동 M개** 매트릭스에서 스케일하지 않는다:

- 운동은 **계속 확장**된다 (지금 스쿼트 1개 → N개).
- 캐릭터는 **2개(열정 여코치 / 부산 사투리 남코치) → 추후 추가**.
- 사용자가 **루틴을 직접 조립**한다 (서로 다른 운동이 임의 순서로 결합).

조합마다 영상을 손으로 만들면 N×M개를 제작·재작업해야 한다. 동시에 아트 요구는 **opengraph 수준 클레이 화질**(하드 요구).

## 2. 핵심 결정 — 오프라인 렌더 + 팩터링

두 하드 요구(확장성 + opengraph 화질)를 동시에 만족하는 유일한 조합:

- **저작은 N+M** — 캐릭터 리그 N개 + 운동 클립 M개 + 공용 클레이 렌더 셋업 1개.
- **파이프라인이 조합을 오프라인 렌더** — 리그×클립을 Blender로 렌더해 **N×M mp4 루프 자동 생성**.
- **재생은 가벼운 `<video loop muted playsinline>`** — TRD 원안 그대로. 포즈 추론과 GPU 경합 없음(디코드는 HW 가속·별도).

**왜 오프라인 렌더인가:** opengraph 화질(진짜 SSS·부드러운 GI 그림자·AA)은 무제한 GPU·시간을 쓰는 오프라인 렌더라야 **보장**된다. 런타임 3D(r3f)는 포즈 추론과 GPU를 나눠 실시간을 노려 근사만 가능(보장 불가, 저사양 위험). 코칭 앱 특성상 **시범은 정확한 폼**이 생명인데, 결정적 mocap/Mixamo 클립을 렌더하면 매 루프 정확·일관된 폼이 나온다.

## 3. 아키텍처

다섯 조각:

1. **캐릭터 리그** — Mixamo 호환 휴머노이드 GLB(리깅됨). 정체성(형상·베이스컬러)만.
2. **운동 모션 클립** — 운동별 휴머노이드 애니(캐릭터 무관).
3. **공용 클레이 렌더 셋업** — Blender 씬(클레이 머티리얼·조명·환경·카메라). opengraph 룩을 여기 한 번 세팅, 전 조합 재사용.
4. **렌더 파이프라인** (`packages/coach-assets`) — 리그+클립+클레이셋업 → 프레임 렌더 → mp4 인코딩 → 매니페스트 생성. 증분(변경된 조합만).
5. **런타임 플레이어** (`shared/lib/coach-demo`) — `<CoachDemo characterId exerciseId>` = 매니페스트로 mp4 골라 `<video>` 루프. three.js 없음.

### 결정 1 — 클립은 운동당 1개, 캐릭터와 분리 (저작 N+M)

스쿼트 동작은 누가 하든 같다 → 운동당 클립 1개를 저작하고, 렌더 시 각 리그에 적용. (모든 캐릭터가 같은 Mixamo 스켈레톤이라 클립이 아무 리그에나 먹힘. `busan-optimized.glb`=28 joints "mixamo.com" 애니로 검증됨.)

### 결정 2 — 클레이 룩은 렌더 셋업에서 균일, 정체성만 per-캐릭터

"지점토 느낌"은 공용 Blender 렌더 셋업(머티리얼·조명)에 **한 번** 세팅 → 모든 캐릭터×운동 렌더가 재사용. 캐릭터 파일엔 정체성만. 클레이 톤 변경 = 셋업 한 곳 수정 후 재렌더(자동).

- **아트 목표(경로 A):** opengraph는 AI 이미지 생성으로 만든 것 확인됨 → **픽셀 매치가 아니라 같은 클레이 계열·완성도**를 지향. Blender 클레이 셋업으로 달성(일반적 3D 작업). AI 이미지 정확 재현(경로 B)은 기각(§11).

### 데이터 흐름

```
저작:  리그 N개 + 클립 M개 + 클레이셋업 1개
빌드:  파이프라인이 N×M 조합을 Blender 렌더 → public/coach-3d/videos/*.mp4 + manifest
런타임: 루틴의 각 운동 → <CoachDemo characterId exerciseId>
          → manifest 조회(characterId×exerciseId → mp4) → <video> 루프
```

## 4. 식별자 규칙

- **`characterId` 불투명·고정** — `character1`, `character2`, … (특징 이름 금지). 특징(사투리·외형)이 바뀌어도 id는 거짓이 안 됨. **바뀌는 정체성은 매니페스트 데이터**에 담음: `character1 → { displayName, dialect?, … }`.
- **`exerciseId` 의미 있는 고정 slug** — `squat`, `lunge`, … . **루틴·판정 엔진(core)·시범이 같은 slug를 공유**해야 "스쿼트 루틴 → 스쿼트 판정 → 스쿼트 시범"이 맞물림.
  - 현황: 앱은 지금 운동을 `exerciseName: "스쿼트"`(표시용 한글)로만 구분 — **안정 id 없음.** 이 작업에서 `exerciseId` slug를 도입해 셋을 통일(스쿼트만 존재하니 지금은 단순).
- **coach↔characterId 매핑 선반영** — 코치 레지스트리에 안정 `characterId` 추가(현 2코치 → character1/character2). **기존 audio/webp 경로(`/audio/busan/`·`busan.webp`)는 유지**(전면 마이그레이션은 범위 밖). id 경계만 세움.

## 5. 에셋 소싱 & 라이선스

**하드 규칙:** 모든 리그·클립은 **Mixamo 휴머노이드 스켈레톤**(본 이름 표준) 공유.

- **캐릭터:** 클레이 인체 메시 → Mixamo 오토리그 → 리그 GLB. 정체성(외형)만 담고 클레이는 공용 셋업(결정 2).
  - **character1 (열정 PT쌤) 디자인 확정 = `opengraph-image.png`의 클레이 여성.** 제작: 2D AI 이미지 → 3D 클레이 모델(AI 이미지→3D, `sample*.glb` 방식 or 스컬프) → Mixamo 리그. ⚠️ 2D AI 이미지를 앵글·애니에 견디는 리그드 3D로 옮기는 게 실질 아트 난제 → Phase 0에서 가늠.
  - character2 (부산 남코치)는 사투리 게이트(PRD §12)에서 바뀔 수 있어 확정 보류.
  - 기존 `sample*.glb`는 미리깅 단일 메시(AI 이미지→3D) → 쓰려면 리깅 필요.
- **모션:** Mixamo 애니 라이브러리 → 운동별 클립. 없으면 직접 촬영→마커리스 모캡(M3 fixture 겸용)/손작업.
- **Mixamo 라이선스 (2026-08 확인):** 상업/비상업 무제한·로열티 없음. 제약 = 원본을 에셋 팩으로 **재판매·재배포 금지**(완성 프로젝트에 embed면 OK — 우리 케이스 허용). ⚠️ Adobe가 더 이상 적극 지원 안 하는 **레거시** → 파이프라인은 원본을 `3d-assets/`에 받아두고 **오프라인 가공**(라이브 서비스 비의존, 우리 설계 부합).

## 6. 모노레포 폴더 구조

3존: 원본+렌더셋업(안 배포) → 파이프라인(렌더) → 배포본(서빙) + 런타임(재생).

```
formbwa/
├─ 3d-assets/                              # ① 원본 + 렌더셋업 (루트, gitignored 로컬 — 산출물만 커밋)
│  ├─ characters/{character1,character2}/  #    Mixamo 리그 GLB
│  ├─ motions/                             #    Mixamo 클립 원본(squat.fbx …)
│  └─ render/                              #    공용 Blender 클레이 셋업(.blend/스크립트)
│
├─ packages/coach-assets/                  # ② 렌더 파이프라인 (새 워크스페이스 패키지)
│  ├─ src/render.py                        #    Blender 헤드리스: 리그+클립+클레이셋업 → mp4
│  ├─ src/build.ts                         #    조합 나열·증분·스켈레톤 검증·매니페스트 생성
│  └─ package.json                         #    turbo task: "render-demos"
│
└─ apps/web/
   ├─ public/coach-3d/                     # ③ 배포본 (파이프라인 산출물, 정적 서빙)
   │  ├─ videos/character1-squat.mp4 …     #    N×M mp4 루프 (자동 생성)
   │  └─ manifest.json                     #    characterId×exerciseId→mp4 + 정체성 데이터
   │
   └─ src/shared/lib/coach-demo/           # ④ 런타임 (pose·audio와 같은 자리)
      ├─ CoachDemo.tsx                      #    <CoachDemo characterId exerciseId> = <video loop>
      └─ manifest.ts                        #    manifest 로더 (audio 매니페스트와 동형)
```

**새 의존성:** web = **없음**(네이티브 `<video>`). 파이프라인 = Blender(외부 툴) + ffmpeg(인코딩, Blender 내장 가능) + `@gltf-transform/core`(스켈레톤 검증, 선택).

## 7. 성능 (더 이상 리스크 아님)

재생 = `<video>` 디코드, 하드웨어 가속·포즈 추론(GPU 컴퓨트)과 대체로 별개 → **경합 거의 없음, 저사양도 무난.** 완화책: 운동별 mp4 lazy 로드 + 현재 운동 프리로드(TRD §9.1 패턴, audio 프리로드와 동형) + `loop muted playsinline`. 비용은 런타임이 아니라 **빌드**(렌더 시간)·**저장**(N×M 파일, 예: 150조합×~500KB≈75MB, 유저는 자기 루틴 몇 개만 다운로드)로 이동.

## 8. 단계별 실행

### Phase 0 — 렌더 화질 스파이크 (검증 게이트)

질문: **"Blender 클레이 셋업으로 opengraph와 같은 클레이 계열·완성도를 뽑을 수 있나?"** (opengraph=AI 생성이라 픽셀 매치는 목표 아님 — 경로 A.)

- 기존 리그+Mixamo 스쿼트 클립을 Blender에 → 클레이 머티리얼·조명·환경 세팅 → 짧은 루프 렌더 → **opengraph와 스타일 계열·완성도 육안 비교.**
- 선택: opengraph 여성 **image→3D 빠른 테스트**(`sample*.glb` 방식)로 character1 제작·리깅 난도 가늠.
- 게이트: 같은 계열·완성도 도달 → Phase 1. 미달 → 셋업 반복.
- 리스크는 "AI 이미지 정확 재현"이 아니라 "좋은 클레이 머티리얼·조명 세팅"으로 축소됨 — 일반적 3D 작업이라 달성 가능성 높음.

### Phase 1 — 수직 슬라이스 (1캐릭터 × 스쿼트)

- `packages/coach-assets` v1: 리그+스쿼트클립+클레이셋업 → character1-squat.mp4 + manifest.
- `shared/lib/coach-demo`: manifest 로더 + `<CoachDemo>`(video).
- WorkoutView 우측 플레이스홀더 → `<CoachDemo characterId="character1" exerciseId="squat">` 교체.
- `exerciseId` slug 도입(entities/routine·core와 통일) + coach→characterId 매핑.

### Phase 2 — 두 번째 축 팩터링 증명 (2캐릭터)

- character2(여코치) 리그 드롭 → 파이프라인이 **같은 스쿼트 클립으로 렌더** → character2-squat.mp4 자동. (결정 1·2 실증: 클립 재사용 + 클레이 균일)

### Phase 3 — 확장 마감 (N운동 + DX)

- 2번째 운동 클립(런지) → 두 캐릭터 렌더 자동. (운동 축 실증)
- 파이프라인 DX: `pnpm render-demos` 증분 렌더 · 스켈레톤 호환 검증 에러 · "캐릭터/운동 추가법" README · CI 렌더(or 로컬) 결정.

## 9. 테스트 전략 (레이어별)

| 레이어                                    | 방법                                                     | 자동화                        |
| ----------------------------------------- | -------------------------------------------------------- | ----------------------------- |
| 파이프라인 오케스트레이션 (build.ts)      | 조합 나열·증분 판단·매니페스트 생성·스켈레톤 본이름 검증 | ✅ vitest                     |
| 런타임 (manifest resolver, `<CoachDemo>`) | id→mp4 URL 해석, video 마운트 스모크                     | ✅ vitest + Storybook         |
| 렌더 화질 (Blender 산출물)                | Phase 0 육안 비교(opengraph) + mp4 존재·해상도·길이 체크 | ❌ 화질 자동불가 / △ 파일속성 |

## 10. 시퀀싱 / 게이트

- TASKS상 **[게이트 후]** 작업. **Phase 0 스파이크는 지금 착수 OK**(기존 리그+클립). 최종 코치-얼굴 클레이 캐릭터·풀 운동 카탈로그는 **M6/사투리 게이트 후.**
- **완료 정의:** 파이프라인이 2캐릭터 × (스쿼트+1운동)을 opengraph 근접 화질로 자동 렌더하고, 웹이 매니페스트로 재생하며, 확장(캐릭터·운동 추가 = 원본 드롭 + 렌더)이 실증됨.

## 11. 기각한 대안

- **런타임 3D (r3f):** opengraph 화질 보장 불가 + 포즈 추론과 GPU 경합(저사양 위험). 상호작용 장점은 시범(루프)에 불필요.
- **AI 영상 생성 (image→video):** 프레임 간 일관성·운동 폼 정확성 보장 안 됨 → 코칭 시범(정확한 폼이 생명)에 부적합. 조합별 생성 비용·비결정성.
- **3D 렌더 + AI 스타일 전이 (경로 B, opengraph 정확 매치):** Blender 폼 + 프레임별 AI img2img로 AI 룩 근접. 프레임 일관성(깜빡임)·파이프라인 복잡. 코칭 시범엔 "같은 클레이 계열·완성도"(경로 A)면 충분 → 보류.

## 12. 열린 리스크

- **클레이 룩 완성도** — opengraph는 AI 생성 확인됨. 픽셀 매치 아닌 **같은 클레이 계열·완성도**를 Blender 클레이 셋업으로 목표(경로 A). Phase 0에서 판정 — 리스크 낮아짐.
- **Blender 헤드리스 CI vs 로컬 렌더** — 인프라·렌더시간 트레이드오프, Phase 3에서 결정.
- **클레이 렌더 셋업 저작** — opengraph 매칭은 실질 3D/아트 작업(내가 스크립트·파이프라인은 구축, 실제 Blender 렌더 실행·아트 튜닝은 사용자 몫).
- **캐릭터 확정 상태** — character1(열정 PT쌤)=opengraph 여성으로 **확정**. character2(부산 남)만 사투리 게이트(PRD §12) 리스크로 보류. 시스템은 확정 캐릭터로 먼저.
- **2D AI 이미지 → 리그드 3D 변환** — 단일 뷰 생성물의 지오/텍스처 정합·앵글 견고성이 character1 제작의 실질 리스크. Phase 0의 image→3D 테스트로 가늠.
