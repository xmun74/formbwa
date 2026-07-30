# apps/be — 백엔드

- NestJS + Prisma 기반 API 서버. **계정, 기록, 리포트(2단계)**를 담당한다.
- 현재(1단계)는 배포, 인증 전으로, **헬스체크 + DB 스키마 골격**까지 로컬에서 도는 상태.
- 상세 설계는 [docs/TRD-BE.md](../../docs/TRD-BE.md).

## 스택

- **NestJS**, TypeScript
- **Prisma 7** — 드라이버 어댑터 필수(`@prisma/adapter-pg`), 클라이언트는 `src/generated/prisma`에 생성
- **PostgreSQL** — 로컬은 `docker-compose.yml`
- **class-validator** — 입력 검증 파이프
- 포트 **4000** (web dev 서버가 3000 점유)

## 폴더 구조

```
apps/be/
├── src/
│   ├── main.ts            # 부트스트랩 (포트 4000, 검증 파이프)
│   ├── health/            # 헬스체크 — $queryRaw로 DB까지 왕복 확인
│   ├── prisma/            # PrismaService (어댑터 연결)
│   └── generated/prisma/  # Prisma 생성 클라이언트 (gitignore)
├── prisma/                # schema.prisma, 마이그레이션
├── prisma.config.ts       # datasource URL
├── test/                  # e2e
└── Dockerfile             # turbo prune 기반 (빌드 확인용, 배포는 2단계)
```

## Quick Start

```sh
# 레포 루트에서 의존성 설치 (postinstall이 prisma generate 실행)
pnpm install

# 1) 로컬 Postgres 기동
docker compose up -d

# 2) .env 에 DATABASE_URL 설정 후 마이그레이션
pnpm --filter be exec prisma migrate dev

# 3) 개발 서버 (http://localhost:4000)
pnpm --filter be start:dev

# 헬스체크
curl http://localhost:4000/health   # DB 죽어 있으면 500
```

> `postinstall: prisma generate`가 필수 — 생성물이 gitignore라 CI엔 없으므로 install 때 생성한다.

## 명령어

| 명령                             | 설명                             |
| -------------------------------- | -------------------------------- |
| `pnpm --filter be start:dev`     | 개발 서버 (watch, 4000)          |
| `pnpm --filter be build`         | 빌드 (`nest build`)              |
| `pnpm --filter be start:prod`    | 빌드 결과 실행                   |
| `pnpm --filter be lint`          | ESLint                           |
| `pnpm --filter be test`          | 유닛 테스트 (Jest)               |
| `pnpm --filter be exec prisma …` | Prisma CLI(마이그레이션, studio) |
