import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeptDto } from './dto/create-dept.dto';

@Injectable()
export class DeptsService {
  constructor(private prisma: PrismaService) {}

  // 部门树 / Dept tree
  async findTree() {
    const list = await this.prisma.dept.findMany({ orderBy: [{ sort: 'asc' }] });
    return this.buildTree(list, null);
  }

  // 详情 / Detail
  async findOne(id: string) {
    const dept = await this.prisma.dept.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('部门不存在 / Dept not found');
    return dept;
  }

  // 新增 / Create
  async create(dto: CreateDeptDto) {
    return this.prisma.dept.create({
      data: {
        name: dto.name,
        parentId: dto.parentId || null,
        sort: dto.sort ?? 0,
        leader: dto.leader,
        status: dto.status ?? 1,
      },
    });
  }

  // 更新 / Update
  async update(id: string, dto: CreateDeptDto) {
    await this.findOne(id);
    if (dto.parentId === id) {
      throw new BadRequestException('上级部门不能是自己 / Parent cannot be itself');
    }
    return this.prisma.dept.update({
      where: { id },
      data: {
        name: dto.name,
        parentId: dto.parentId || null,
        sort: dto.sort ?? 0,
        leader: dto.leader,
        status: dto.status ?? 1,
      },
    });
  }

  // 删除 / Delete
  async remove(id: string) {
    await this.findOne(id);
    const children = await this.prisma.dept.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException('存在子部门，请先删除子部门 / Has children, delete them first');
    }
    await this.prisma.dept.delete({ where: { id } });
    return { success: true };
  }

  private buildTree(list: any[], parentId: string | null): any[] {
    return list
      .filter((item) => (item.parentId || null) === (parentId || null))
      .map((item) => ({
        id: item.id,
        name: item.name,
        parentId: item.parentId,
        sort: item.sort,
        leader: item.leader,
        status: item.status,
        children: this.buildTree(list, item.id),
      }))
      .sort((a, b) => a.sort - b.sort);
  }
}
