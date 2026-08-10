import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DeptsModule } from './depts/depts.module';
import { ConfigsModule } from './configs/configs.module';
import { DictsModule } from './dicts/dicts.module';
import { LogsModule } from './logs/logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { OperationLogMiddleware } from './common/middlewares/operation-log.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    DeptsModule,
    ConfigsModule,
    DictsModule,
    LogsModule,
    DashboardModule,
  ],
  // 全局开启 JWT 守卫与权限守卫 / Global JWT & permission guards
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 操作日志中间件应用于所有路由 / Apply operation log middleware to all routes
    consumer.apply(OperationLogMiddleware).forRoutes('*');
  }
}
