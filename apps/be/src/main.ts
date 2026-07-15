import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // DTO에 없는 필드는 제거 — 비정상 입력 거부 (TRD-BE §6.2)
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // web dev 서버가 3000을 하드코딩으로 점유한다 (apps/web의 dev 스크립트)
  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
