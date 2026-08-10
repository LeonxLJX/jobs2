import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 用户列表（分页+搜索）/ User list (paginated + searchable)
  @Get()
  @RequirePermissions('system:user')
  findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
    @Query('deptId') deptId: string,
    @Query('status') status: number,
  ) {
    return this.usersService.findAll({ page, pageSize, keyword, deptId, status });
  }

  // 用户详情 / User detail
  @Get(':id')
  @RequirePermissions('system:user')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 新增用户 / Create user
  @Post()
  @RequirePermissions('system:user:add')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // 编辑用户 / Update user
  @Put(':id')
  @RequirePermissions('system:user:edit')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // 删除用户 / Delete user
  @Delete(':id')
  @RequirePermissions('system:user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 重置密码 / Reset password
  @Post(':id/reset-password')
  @RequirePermissions('system:user:reset')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }

  // 分配角色 / Assign roles
  @Post(':id/roles')
  @RequirePermissions('system:user:assign')
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.usersService.assignRoles(id, dto);
  }
}
