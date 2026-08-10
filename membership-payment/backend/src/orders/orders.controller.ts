/* ============================================================
 * Orders 控制器 / Orders Controller
 * ============================================================ */
import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
  ) {
    const data = await this.ordersService.list(userId, status);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async detail(
    @CurrentUser('sub') userId: string,
    @Param('id') orderId: string,
  ) {
    const data = await this.ordersService.detail(userId, orderId);
    return ApiResponse.ok(data);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('id') orderId: string,
  ) {
    const data = await this.ordersService.cancel(userId, orderId);
    return ApiResponse.ok(data, '订单已取消 / Order cancelled');
  }
}
