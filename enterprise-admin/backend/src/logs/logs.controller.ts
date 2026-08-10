import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  // 操作日志列表 / Operation log list
  @Get()
  @RequirePermissions('system:log')
  findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('action') action: string,
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.logsService.findAll({ page, pageSize, keyword, action, userId, startDate, endDate });
  }
}
