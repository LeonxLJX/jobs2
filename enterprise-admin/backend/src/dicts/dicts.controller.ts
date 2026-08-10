import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DictsService } from './dicts.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { CreateDictItemDto } from './dto/create-dict-item.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

// 字典类型控制器 / Dict type controller
@Controller('dict-types')
export class DictTypesController {
  constructor(private readonly dictsService: DictsService) {}

  // 字典类型列表 / Dict type list
  @Get()
  @RequirePermissions('system:dict')
  findAll(@Query('page') page: number, @Query('pageSize') pageSize: number, @Query('keyword') keyword: string) {
    return this.dictsService.findTypesAll({ page, pageSize, keyword });
  }

  @Get(':id')
  @RequirePermissions('system:dict')
  findOne(@Param('id') id: string) {
    return this.dictsService.findTypeOne(id);
  }

  @Post()
  @RequirePermissions('system:dict:add')
  create(@Body() dto: CreateDictTypeDto) {
    return this.dictsService.createType(dto);
  }

  @Put(':id')
  @RequirePermissions('system:dict:edit')
  update(@Param('id') id: string, @Body() dto: CreateDictTypeDto) {
    return this.dictsService.updateType(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('system:dict:delete')
  remove(@Param('id') id: string) {
    return this.dictsService.removeType(id);
  }
}

// 字典项控制器 / Dict item controller
@Controller('dict-items')
export class DictItemsController {
  constructor(private readonly dictsService: DictsService) {}

  // 按字典编码取启用项（下拉用，登录用户均可访问）/ Items by dict code (for dropdown)
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.dictsService.findItemsByCode(code);
  }

  // 字典项分页 / Dict items paginated
  @Get()
  @RequirePermissions('system:dict')
  findAll(
    @Query('dictTypeId') dictTypeId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
  ) {
    return this.dictsService.findItems({ dictTypeId, page, pageSize, keyword });
  }

  @Get(':id')
  @RequirePermissions('system:dict')
  findOne(@Param('id') id: string) {
    return this.dictsService.findItemOne(id);
  }

  @Post()
  @RequirePermissions('system:dict:add')
  create(@Body() dto: CreateDictItemDto) {
    return this.dictsService.createItem(dto);
  }

  @Put(':id')
  @RequirePermissions('system:dict:edit')
  update(@Param('id') id: string, @Body() dto: CreateDictItemDto) {
    return this.dictsService.updateItem(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('system:dict:delete')
  remove(@Param('id') id: string) {
    return this.dictsService.removeItem(id);
  }
}
