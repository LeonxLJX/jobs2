import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('system-configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get()
  @RequirePermissions('system:config')
  findAll(@Query('page') page: number, @Query('pageSize') pageSize: number, @Query('keyword') keyword: string) {
    return this.configsService.findAll({ page, pageSize, keyword });
  }

  @Get(':id')
  @RequirePermissions('system:config')
  findOne(@Param('id') id: string) {
    return this.configsService.findOne(id);
  }

  @Post()
  @RequirePermissions('system:config:add')
  create(@Body() dto: CreateConfigDto) {
    return this.configsService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('system:config:edit')
  update(@Param('id') id: string, @Body() dto: CreateConfigDto) {
    return this.configsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('system:config:delete')
  remove(@Param('id') id: string) {
    return this.configsService.remove(id);
  }
}
