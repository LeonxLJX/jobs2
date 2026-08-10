/* ============================================================
 * Refunds 控制器 / Refunds Controller
 * - POST   /refunds        用户申请退款
 * - GET    /refunds        用户查看自己的退款 / 管理员查看全部（role=admin 且无 userId 过滤）
 * - PUT    /refunds/:id/approve  管理员通过
 * - PUT    /refunds/:id/reject   管理员拒绝
 * ============================================================ */
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('refunds')
@UseGuards(JwtAuthGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  // 申请退款
  @Post()
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateRefundDto) {
    const data = await this.refundsService.create(userId, dto);
    return ApiResponse.ok(data, '退款申请已提交 / Refund request submitted');
  }

  // 列表：管理员可看全部，普通用户看自己
  @Get()
  async list(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Query('status') status?: string,
    @Query('scope') scope?: string, // scope=all 仅管理员可用
  ) {
    if (role === 'admin' && scope === 'all') {
      const data = await this.refundsService.listAll(status);
      return ApiResponse.ok(data);
    }
    const data = await this.refundsService.listByUser(userId);
    return ApiResponse.ok(data);
  }

  // 管理员通过
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approve(
    @Param('id') refundId: string,
    @CurrentUser('sub') reviewerId: string,
  ) {
    const data = await this.refundsService.approve(refundId, reviewerId);
    return ApiResponse.ok(data, '退款已通过 / Refund approved');
  }

  // 管理员拒绝
  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async reject(
    @Param('id') refundId: string,
    @CurrentUser('sub') reviewerId: string,
  ) {
    const data = await this.refundsService.reject(refundId, reviewerId);
    return ApiResponse.ok(data, '退款已拒绝 / Refund rejected');
  }
}
