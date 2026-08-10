/* ============================================================
 * Points 模块 / Points Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';

@Module({
  providers: [PointsService],
  controllers: [PointsController],
  exports: [PointsService],
})
export class PointsModule {}
