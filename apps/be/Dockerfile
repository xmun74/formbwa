# turbo prune으로 be와 그 의존성만 추린 최소 컨텍스트 빌드 (TRD-BE §3)
# 빌드는 레포 루트에서: docker build -f apps/be/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS pruner
COPY . .
# out/json: 의존성 설치용 매니페스트만 / out/full: 소스 포함
RUN pnpm dlx turbo@2.10.5 prune be --docker

FROM base AS builder
# 매니페스트만 먼저 복사해 install 레이어를 캐시한다 (소스가 바뀌어도 재설치 안 함)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
# 생성 클라이언트는 gitignore라 이미지 안에서 만들어야 한다
RUN pnpm --filter be exec prisma generate
RUN pnpm turbo build --filter=be

FROM base AS runner
ENV NODE_ENV=production
# root로 돌리지 않는다
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=builder --chown=nestjs:nodejs /app .
USER nestjs
EXPOSE 4000
CMD ["node", "apps/be/dist/main"]
