import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

// 전역 모듈 — records/reports 등 모든 모듈이 주입받는다 (TRD-BE §6.2 공용 리포지토리 패턴의 토대)
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
