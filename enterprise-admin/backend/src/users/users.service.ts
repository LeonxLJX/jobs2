import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 分页查询用户列表 / Paginated user list
  async findAll(query: { page?: number; pageSize?: number; keyword?: string; deptId?: string; status?: number }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim();

    const where: any = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }
    if (query.deptId) where.deptId = query.deptId;
    if (query.status !== undefined && query.status !== null && query.status !== '') {
      where.status = Number(query.status);
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: { include: { role: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list: list.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        deptId: u.deptId,
        status: u.status,
        createdAt: u.createdAt,
        roles: u.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name, code: ur.role.code })),
      })),
      total,
      page,
      pageSize,
    };
  }

  // 详情 / Detail
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('用户不存在 / User not found');
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      deptId: user.deptId,
      status: user.status,
      createdAt: user.createdAt,
      roles: user.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name, code: ur.role.code })),
    };
  }

  // 新增 / Create
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (exists) {
      throw new BadRequestException('用户名已存在 / Username already exists');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hash,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        deptId: dto.deptId,
        status: dto.status ?? 1,
      },
    });
    // 分配角色 / Assign roles
    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: user.id, roleId })),
        skipDuplicates: true,
      });
    }
    return this.findOne(user.id);
  }

  // 更新 / Update
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        deptId: dto.deptId,
        status: dto.status,
      },
    });
    // 同步角色 / Sync roles
    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      if (dto.roleIds.length > 0) {
        await this.prisma.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
          skipDuplicates: true,
        });
      }
    }
    return this.findOne(id);
  }

  // 删除 / Delete
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  // 重置密码 / Reset password
  async resetPassword(id: string, dto: ResetPasswordDto) {
    await this.findOne(id);
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hash } });
    return { success: true };
  }

  // 分配角色 / Assign roles
  async assignRoles(id: string, dto: AssignRolesDto) {
    await this.findOne(id);
    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    if (dto.roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        skipDuplicates: true,
      });
    }
    return this.findOne(id);
  }
}
