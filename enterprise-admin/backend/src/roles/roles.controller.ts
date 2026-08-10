import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // 角色列表 / Role list
  @Get()
  @RequirePermissions('system:role')
  findAll(@Query('page') page: number, @Query('pageSize') pageSize: number, @Query('keyword') keyword: string) {
    return this.rolesService.findAll({ page, pageSize, keyword });
  }

  // 全部角色（下拉用）/ All roles for dropdown
  @Get('all/simple')
  findAllSimple() {
    return this.rolesService.findAllSimple();
  }

  // 角色详情 / Role detail
  @Get(':id')
  @RequirePermissions('system:role')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  // 新增 / Create
  @Post()
  @RequirePermissions('system:role:add')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  // 更新 / Update
  @Put(':id')
  @RequirePermissions('system:role:edit')
  update(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  // 删除 / Delete
  @Delete(':id')
  @RequirePermissions('system:role:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  // 获取角色已分配的权限 / Get assigned permissions of role
  @Get(':id/permissions')
  @RequirePermissions('system:role')
  getPermissions(@Param('id') id: string) {
    return this.rolesService.getPermissions(id);
  }

  // 分配权限 / Assign permissions
  @Put(':id/permissions')
  @RequirePermissions('system:role:assign')
  assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(id, dto);
  }
}
