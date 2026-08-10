import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // 角色列表 / Role list
  async findAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim();
    const where: any = {};
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }];
    }
    const [list, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 全部角色（下拉用）/ All roles (for dropdown)
  async findAllSimple() {
    return this.prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // 详情 / Detail
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在 / Role not found');
    return role;
  }

  // 新增 / Create
  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException('角色编码已存在 / Role code already exists');
    }
    return this.prisma.role.create({ data: { name: dto.name, code: dto.code, description: dto.description } });
  }

  // 更新 / Update
  async update(id: string, dto: CreateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: { name: dto.name, code: dto.code, description: dto.description },
    });
  }

  // 删除 / Delete
  async remove(id: string) {
    await this.findOne(id);
    // 检查是否还有用户绑定 / Check if users are still bound
    const count = await this.prisma.userRole.count({ where: { roleId: id } });
    if (count > 0) {
      throw new BadRequestException('该角色仍有用户绑定，无法删除 / Role still has users bound');
    }
    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }

  // 获取角色已分配的权限 ID / Get permission ids assigned to the role
  async getPermissions(id: string) {
    await this.findOne(id);
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId: id },
      include: { permission: true },
    });
    return {
      permissionIds: rolePerms.map((rp) => rp.permissionId),
      permissions: rolePerms.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        code: rp.permission.code,
        type: rp.permission.type,
      })),
    };
  }

  // 分配权限 / Assign permissions
  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    await this.findOne(id);
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (dto.permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        skipDuplicates: true,
      });
    }
    return { success: true };
  }
}
