/* ============================================================
 * Bills 控制器 / Bills Controller
 * ============================================================ */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BillsService } from './bills.service';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  async list(@CurrentUser('sub') userId: string) {
    const data = await this.billsService.list(userId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async detail(
    @CurrentUser('sub') userId: string,
    @Param('id') billId: string,
  ) {
    const data = await this.billsService.detail(userId, billId);
    return ApiResponse.ok(data);
  }
}
