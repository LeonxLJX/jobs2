import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // 全部权限（平铺列表）/ All permissions (flat list)
  async findAll() {
    return this.prisma.permission.findMany({ orderBy: [{ sort: 'asc' }] });
  }

  // 权限树 / Permission tree
  async findTree() {
    const list = await this.prisma.permission.findMany({ orderBy: [{ sort: 'asc' }] });
    return this.buildTree(list, null);
  }

  // 详情 / Detail
  async findOne(id: string) {
    const perm = await this.prisma.permission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException('权限不存在 / Permission not found');
    return perm;
  }

  // 新增 / Create
  async create(dto: CreatePermissionDto) {
    const exists = await this.prisma.permission.findUnique({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException('权限编码已存在 / Permission code already exists');
    }
    return this.prisma.permission.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        parentId: dto.parentId || null,
        path: dto.path,
        component: dto.component,
        icon: dto.icon,
        sort: dto.sort ?? 0,
      },
    });
  }

  // 更新 / Update
  async update(id: string, dto: CreatePermissionDto) {
    await this.findOne(id);
    return this.prisma.permission.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        parentId: dto.parentId || null,
        path: dto.path,
        component: dto.component,
        icon: dto.icon,
        sort: dto.sort ?? 0,
      },
    });
  }

  // 删除 / Delete
  async remove(id: string) {
    await this.findOne(id);
    // 检查子节点 / Check children
    const children = await this.prisma.permission.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException('存在子节点，请先删除子节点 / Has children, delete them first');
    }
    await this.prisma.permission.delete({ where: { id } });
    return { success: true };
  }

  // 构建树 / Build tree
  private buildTree(list: any[], parentId: string | null): any[] {
    return list
      .filter((item) => (item.parentId || null) === (parentId || null))
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        type: item.type,
        parentId: item.parentId,
        path: item.path,
        component: item.component,
        icon: item.icon,
        sort: item.sort,
        children: this.buildTree(list, item.id),
      }))
      .sort((a, b) => a.sort - b.sort);
  }
}
