/* ============================================================
 * Sign 模块 / Sign Module
 * ============================================================ */
import { Module } from '@nestjs/common';
import { SignService } from './sign.service';
import { SignController } from './sign.controller';

@Module({
  providers: [SignService],
  controllers: [SignController],
})
export class SignModule {}
