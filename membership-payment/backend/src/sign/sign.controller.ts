/* ============================================================
 * Sign 控制器 / Sign Controller
 * ============================================================ */
import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SignService } from './sign.service';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('sign')
@UseGuards(JwtAuthGuard)
export class SignController {
  constructor(private readonly signService: SignService) {}

  @Post('checkin')
  async checkin(@CurrentUser('sub') userId: string) {
    const data = await this.signService.checkin(userId);
    return ApiResponse.ok(data, data.message);
  }

  @Get('today')
  async today(@CurrentUser('sub') userId: string) {
    const data = await this.signService.getTodayStatus(userId);
    return ApiResponse.ok(data);
  }

  @Get('history')
  async history(
    @CurrentUser('sub') userId: string,
    @Query('days') days?: string,
  ) {
    const data = await this.signService.getHistory(userId, days ? parseInt(days) : 30);
    return ApiResponse.ok(data);
  }
}
