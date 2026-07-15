# TRD-BE — 폼봐 (formbwa)

> BE 기술명세서. API 서버(apps/be), 인증, DB, 인프라를 정의한다.
>
> 관련 문서: 제품 요구사항(F-ID)은 [PRD.md](./PRD.md), 클라이언트·코어 엔진은 [TRD-FE.md](./TRD-FE.md), 작업 분해는 [TASKS.md](./TASKS.md) 참조.

## 1. 원칙

1. **서버는 경량**: 무거운 추론은 전부 클라이언트(TRD-FE 참조). 서버는 인증, 수치 기록 저장, LLM 프록시만 담당. GPU 서버 없음
2. **직접 구축**: BaaS 대신 NestJS + 자체 인프라. 인증·서버 보안을 직접 관리하는 트레이드오프를 감수하고 학습·통제권을 선택 (§6 체크리스트 준수 전제)
3. **인증의 단일 소유자**: 웹·RN 모두 동일한 토큰 플로우 — 앱 추가 시 인증 재작업 없음
4. **영상 데이터를 받지 않는다**: 수신하는 것은 각도·횟수 등 수치 JSON뿐

```
[apps/web — Vercel]  [apps/mobile — 4단계]
        │ HTTPS (JWT)
        ▼
[AWS EC2 1대 — Docker Compose]
├── nginx (HTTPS 종단, 리버스 프록시, 443만 개방)
├── be: NestJS + Prisma (인증/JWT, 기록, 집계, OpenAI 프록시)
└── db: Postgres (내부 네트워크 전용, named volume)
```

## 2. 기술 스택

| 레이어     | 선택                                          | 비고                                                    |
| ---------- | --------------------------------------------- | ------------------------------------------------------- |
| 프레임워크 | NestJS + TypeScript                           |                                                         |
| 인증       | passport-google-oauth20 + passport-jwt        | access 15분 + refresh 로테이션 (§4)                     |
| ORM        | Prisma                                        | 마이그레이션은 `prisma migrate`로만 (DB 직접 변경 금지) |
| DB         | Postgres 16 (Docker)                          | 개발·운영 동일 compose 구조                             |
| 검증       | class-validator (+ FE와 Zod 스키마 공유 검토) |                                                         |
| LLM        | OpenAI gpt-4o-mini                            | 리포트 생성 전용, 서버에서만 호출                       |
| 인프라     | AWS EC2 프리티어 1대 + Docker Compose         | 12개월 한정 (§7)                                        |
| CI/CD      | GitHub Actions → GHCR → compose pull          | §7                                                      |

## 3. 레포 내 위치

```
apps/be/
├── src/                      # NestJS 모듈: auth, records, reports
└── prisma/
    ├── schema.prisma
    └── migrations/
docker-compose.yml            # 개발용 (db)
docker-compose.prod.yml       # EC2 운영용 (nginx + be + db)
```

- 워크스페이스 이름은 `be` (`--filter=be`, compose 서비스명도 `be`). **공개 URL은 `api.도메인` 유지** — 폴더명과 서브도메인은 별개다 (§4)
- 모노레포 유지 이유: `packages/core`의 타입(RepMetric 등)과 API DTO를 FE와 공유
- be Dockerfile은 `turbo prune be --docker`로 be+의존성만 추린 최소 컨텍스트 빌드
- EC2에는 소스코드가 올라가지 않음 (빌드된 이미지만) — BE 레포 분리 불필요

## 4. 인증 설계 (NestJS 소유 JWT — 웹/앱 공통)

```
[웹 — 2단계]
로그인 클릭 → /auth/google (passport-google-oauth20 리다이렉트 플로우)
→ 콜백에서 JWT 발급: access(15분) + refresh(14일, 로테이션)
→ httpOnly 쿠키, Domain=.서비스도메인 (web·api 서브도메인 공유)

[RN 앱 — 4단계, 추가만]
expo-auth-session 구글 로그인 → idToken → /auth/google/token
→ 서버가 구글에 idToken 검증 → 동일한 JWT 발급 (secure storage 보관)
```

- 토큰 정책: refresh 로테이션 + 재사용 감지 시 전체 무효화. 로그아웃 = refresh 폐기
- CORS: 웹 오리진 화이트리스트 + credentials는 해당 오리진만
- **전제 조건**: web·api가 같은 루트 도메인의 서브도메인 (`app.x.com` + `api.x.com`) — 커스텀 도메인 필수 (§7 비용)
- 게스트 정책: 인증 없는 사용자는 API를 호출하지 않음 (기록 저장 시점에 로그인 — PRD F2-1)

## 5. 데이터 모델 (Prisma)

```prisma
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  name      String?
  createdAt DateTime    @default(now())
  records   SetRecord[]
}

model SetRecord {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  exercise       String   @default("squat")
  coachId        String
  startedAt      DateTime
  durationSec    Int
  repCount       Int
  reps           Json     // RepMetric[] (타입 원본은 packages/core)
  feedbackCounts Json     // { "knee_shallow": 4, ... }
  reportText     String?  // LLM 총평 (1회 생성 후 저장, 재생성 안 함)
  createdAt      DateTime @default(now())

  @@index([userId, startedAt])
}
```

- 세트당 수 KB. **영상·이미지 필드는 만들지 않는다** (스키마 차원에서 금지)

## 6. API 설계 및 보안

### 6.1 엔드포인트

| 엔드포인트             | 메서드 | 역할                       | 접근                  |
| ---------------------- | ------ | -------------------------- | --------------------- |
| `/auth/google` (+콜백) | GET    | 구글 OAuth, JWT 발급       | 공개                  |
| `/auth/google/token`   | POST   | (4단계) RN idToken 교환    | 공개                  |
| `/auth/refresh`        | POST   | access 갱신 (로테이션)     | refresh 쿠키          |
| `/records`             | POST   | 세트 기록 저장             | JWT 가드              |
| `/records`             | GET    | 기록 목록/대시보드 집계    | JWT 가드              |
| `/reports`             | POST   | 기록 ID 기반 LLM 총평 생성 | JWT 가드 + rate limit |

- 리포트 프롬프트에는 **구조화된 수치만** 삽입 (프롬프트 인젝션 차단)

### 6.2 보안 체크리스트 (직접 구축이므로 전부 우리 책임)

| 항목         | 조치                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| 소유권 검증  | 모든 쿼리에 userId 조건 필수 — 공용 리포지토리 패턴으로 강제                                   |
| 토큰 관리    | JWT 시크릿 별도 관리, access 단명, refresh 로테이션+재사용 감지, httpOnly·Secure·SameSite 쿠키 |
| CORS         | 웹 오리진 화이트리스트                                                                         |
| 키 관리      | OpenAI 키·시크릿은 EC2 환경변수/SSM. 레포 커밋 금지                                            |
| LLM 남용     | 리포트 세트당 1회 + 사용자별 일 상한. OpenAI 월 지출 캡 ($5~)                                  |
| 입력 검증    | class-validator, 비정상 수치 거부                                                              |
| 공통         | helmet, rate limit(@nestjs/throttler)                                                          |
| 서버 운영    | HTTPS(nginx+certbot), 보안그룹 443만 개방, OS 자동 보안 패치, SSH 키 인증만                    |
| DB 노출 차단 | Postgres는 compose 내부 네트워크 전용 — **호스트 포트 바인딩 금지**                            |

## 7. 배포·운영·비용

### 7.1 배포 파이프라인

- GitHub Actions → 이미지 빌드/푸시(GHCR) → EC2에서 `docker compose pull && up -d`
- 마이그레이션: 배포 단계에서 `prisma migrate deploy`

### 7.2 EC2 동거 구성 리스크와 대응

| 리스크                                    | 대응                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| 인스턴스 장애 = DB 소실                   | named volume은 EBS라 재부팅 안전. **일일 pg_dump → S3 cron 필수** (~0원) |
| 프리티어 1GB 메모리에 nginx+Node+Postgres | Node heap 제한, Postgres `shared_buffers` 하향, 스왑 2GB                 |
| 프리티어 12개월 만료                      | 만료 전 재검토: EC2 유료(~$8/월) or DB 관리형 분리                       |

### 7.3 비용

| 항목           | 1~2단계                                                         | 상업화 시                                  |
| -------------- | --------------------------------------------------------------- | ------------------------------------------ |
| be + db        | EC2 프리티어 1대 + S3 백업 (~0원)                               | EC2 소형 유료(~$8/월), DB 관리형 분리 검토 |
| LLM            | 종량제, 리포트당 1~3원, 월 캡 $5                                | 캡 상향                                    |
| 도메인         | **필수** (~1.5만원/년) — 쿠키 공유 위해 web/api 서브도메인 (§4) |                                            |
| 스토어 (4단계) | —                                                               | Apple $99/년, Google $25 (1회)             |

## 8. 개인정보 구현 원칙 (BE)

- 영상·이미지를 받는 엔드포인트를 만들지 않는다 (스키마·API 차원 금지)
- 저장 데이터는 수치·식별자뿐 — 생체인식정보 해당 소지 차단
- 로그에 요청 본문 전체 기록 금지 (수치라도 최소화)
- 회원 탈퇴 시 기록 완전 삭제 (soft delete 아닌 hard delete)
