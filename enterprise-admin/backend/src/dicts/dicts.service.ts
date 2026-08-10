import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { CreateDictItemDto } from './dto/create-dict-item.dto';

@Injectable()
export class DictsService {
  constructor(private prisma: PrismaService) {}

  // ===== 字典类型 / Dict type =====
  async findTypesAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim();
    const where: any = {};
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }];
    }
    const [list, total] = await Promise.all([
      this.prisma.dictType.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      }),
      this.prisma.dictType.count({ where }),
    ]);
    return {
      list: list.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        status: t.status,
        createdAt: t.createdAt,
        itemCount: t._count.items,
      })),
      total,
      page,
      pageSize,
    };
  }

  async findTypeOne(id: string) {
    const type = await this.prisma.dictType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('字典类型不存在 / Dict type not found');
    return type;
  }

  async createType(dto: CreateDictTypeDto) {
    const exists = await this.prisma.dictType.findUnique({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('字典编码已存在 / Dict code already exists');
    return this.prisma.dictType.create({ data: { name: dto.name, code: dto.code, status: dto.status ?? 1 } });
  }

  async updateType(id: string, dto: CreateDictTypeDto) {
    await this.findTypeOne(id);
    return this.prisma.dictType.update({
      where: { id },
      data: { name: dto.name, code: dto.code, status: dto.status ?? 1 },
    });
  }

  async removeType(id: string) {
    await this.findTypeOne(id);
    await this.prisma.dictType.delete({ where: { id } });
    return { success: true };
  }

  // ===== 字典项 / Dict item =====
  async findItems(query: { dictTypeId?: string; page?: number; pageSize?: number; keyword?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const where: any = {};
    if (query.dictTypeId) where.dictTypeId = query.dictTypeId;
    if (query.keyword) where.label = { contains: query.keyword };
    const [list, total] = await Promise.all([
      this.prisma.dictItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sort: 'asc' }],
      }),
      this.prisma.dictItem.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  // 按字典编码取全部启用项（前端下拉用）/ Get enabled items by dict code (for dropdown)
  async findItemsByCode(code: string) {
    const type = await this.prisma.dictType.findUnique({ where: { code } });
    if (!type) throw new NotFoundException('字典类型不存在 / Dict type not found');
    return this.prisma.dictItem.findMany({
      where: { dictTypeId: type.id, status: 1 },
      orderBy: [{ sort: 'asc' }],
    });
  }

  async findItemOne(id: string) {
    const item = await this.prisma.dictItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('字典项不存在 / Dict item not found');
    return item;
  }

  async createItem(dto: CreateDictItemDto) {
    return this.prisma.dictItem.create({
      data: {
        dictTypeId: dto.dictTypeId,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
      },
    });
  }

  async updateItem(id: string, dto: CreateDictItemDto) {
    await this.findItemOne(id);
    return this.prisma.dictItem.update({
      where: { id },
      data: {
        dictTypeId: dto.dictTypeId,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
      },
    });
  }

  async removeItem(id: string) {
    await this.findItemOne(id);
    await this.prisma.dictItem.delete({ where: { id } });
    return { success: true };
  }
}
