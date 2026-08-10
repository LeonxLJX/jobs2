import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TeamsModule } from './teams/teams.module';
import { DocumentsModule } from './documents/documents.module';
import { FilesModule } from './files/files.module';
import { TrashModule } from './trash/trash.module';
import { UsersModule } from './users/users.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // 环境变量加载 / Load .env
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    DocumentsModule,
    FilesModule,
    TrashModule,
  ],
  providers: [
    // 全局统一响应拦截器 / Global response interceptor
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // 全局异常过滤器 / Global exception filter
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
