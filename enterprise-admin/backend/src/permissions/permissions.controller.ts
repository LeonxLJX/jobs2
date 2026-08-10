import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // 全部权限（平铺）/ All permissions (flat)
  @Get()
  @RequirePermissions('system:permission')
  findAll() {
    return this.permissionsService.findAll();
  }

  // 权限树 / Permission tree
  @Get('tree')
  @RequirePermissions('system:permission')
  findTree() {
    return this.permissionsService.findTree();
  }

  // 详情 / Detail
  @Get(':id')
  @RequirePermissions('system:permission')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  // 新增 / Create
  @Post()
  @RequirePermissions('system:permission:add')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  // 更新 / Update
  @Put(':id')
  @RequirePermissions('system:permission:edit')
  update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  // 删除 / Delete
  @Delete(':id')
  @RequirePermissions('system:permission:delete')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
