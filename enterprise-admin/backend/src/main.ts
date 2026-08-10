import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀 / Global prefix
  app.setGlobalPrefix('api');

  // 全局管道（参数校验）/ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 全局拦截器（统一响应）/ Global interceptor (unified response)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器 / Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 跨域 / CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 后端已启动 / Backend running on http://localhost:${port}`);
}
bootstrap();
