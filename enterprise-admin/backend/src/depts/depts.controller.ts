import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DeptsService } from './depts.service';
import { CreateDeptDto } from './dto/create-dept.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('depts')
export class DeptsController {
  constructor(private readonly deptsService: DeptsService) {}

  // 部门树 / Dept tree
  @Get()
  @RequirePermissions('system:dept')
  findTree() {
    return this.deptsService.findTree();
  }

  // 详情 / Detail
  @Get(':id')
  @RequirePermissions('system:dept')
  findOne(@Param('id') id: string) {
    return this.deptsService.findOne(id);
  }

  // 新增 / Create
  @Post()
  @RequirePermissions('system:dept:add')
  create(@Body() dto: CreateDeptDto) {
    return this.deptsService.create(dto);
  }

  // 更新 / Update
  @Put(':id')
  @RequirePermissions('system:dept:edit')
  update(@Param('id') id: string, @Body() dto: CreateDeptDto) {
    return this.deptsService.update(id, dto);
  }

  // 删除 / Delete
  @Delete(':id')
  @RequirePermissions('system:dept:delete')
  remove(@Param('id') id: string) {
    return this.deptsService.remove(id);
  }
}
