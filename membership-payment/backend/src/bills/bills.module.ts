/* ============================================================
 * Bills 模块 / Bills Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';

@Module({
  providers: [BillsService],
  controllers: [BillsController],
})
export class BillsModule {}
