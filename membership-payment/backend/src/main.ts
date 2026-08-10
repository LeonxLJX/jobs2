/* ============================================================
 * 应用入口 / Application Entry
 * ============================================================ */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  // 启用 rawBody 以支持 Stripe webhook 签名验证 / Enable rawBody for Stripe webhook
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173';

  // 全局前缀 / Global prefix
  app.setGlobalPrefix('api');

  // 跨域 / CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // 全局校验管道 / Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 全局异常过滤器 / Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  Logger.log(`🚀 后端服务已启动 / Backend running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`🔧 支付模式 / Payment mode: ${configService.get('PAYMENT_MODE') || 'mock'}`, 'Bootstrap');
}
bootstrap();
