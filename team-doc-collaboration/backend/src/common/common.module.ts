import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';

// 全局通用模块：提供守卫等通用能力
// Global common module providing guards and shared utilities
@Global()
@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
