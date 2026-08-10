/* ============================================================
 * 根模块 / Root Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { SignModule } from './sign/sign.module';
import { PointsModule } from './points/points.module';
import { PaymentModule } from './payment/payment.module';
import { OrdersModule } from './orders/orders.module';
import { BillsModule } from './bills/bills.module';
import { RefundsModule } from './refunds/refunds.module';

@Module({
  imports: [
    // 全局环境变量 / Global env config
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlansModule,
    SignModule,
    PointsModule,
    PaymentModule,
    OrdersModule,
    BillsModule,
    RefundsModule,
  ],
})
export class AppModule {}
