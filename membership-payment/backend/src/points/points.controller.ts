/* ============================================================
 * Points 控制器 / Points Controller
 * ============================================================ */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('history')
  async history(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.pointsService.getHistory(
      userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
    return ApiResponse.ok(data);
  }
}
