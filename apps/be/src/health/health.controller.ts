import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    // DB까지 실제로 왕복시킨다 — 프로세스만 살아있고 DB가 죽은 상태를 ok로 보고하지 않도록
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
