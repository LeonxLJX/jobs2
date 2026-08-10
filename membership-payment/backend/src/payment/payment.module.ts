/* ============================================================
 * Payment 模块 / Payment Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module';
import { PlansModule } from '../plans/plans.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [OrdersModule, PlansModule, PointsModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
