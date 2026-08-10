import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // 数字卡片统计 / Number card stats
  @Get('stats')
  stats() {
    return this.dashboardService.stats();
  }

  // 图表数据 / Chart data
  @Get('charts')
  charts() {
    return this.dashboardService.charts();
  }
}
