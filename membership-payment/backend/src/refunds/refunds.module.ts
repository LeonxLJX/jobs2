/* ============================================================
 * Refunds 模块 / Refunds Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';

@Module({
  providers: [RefundsService],
  controllers: [RefundsController],
})
export class RefundsModule {}
