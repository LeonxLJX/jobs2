import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';

@Injectable()
export class ConfigsService {
  constructor(private prisma: PrismaService) {}

  // 列表 / List
  async findAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim();
    const where: any = {};
    if (keyword) {
      where.OR = [{ key: { contains: keyword } }, { remark: { contains: keyword } }];
    }
    const [list, total] = await Promise.all([
      this.prisma.systemConfig.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemConfig.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findOne(id: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('配置不存在 / Config not found');
    return config;
  }

  async create(dto: CreateConfigDto) {
    const exists = await this.prisma.systemConfig.findUnique({ where: { key: dto.key } });
    if (exists) throw new BadRequestException('配置键已存在 / Config key already exists');
    return this.prisma.systemConfig.create({ data: { key: dto.key, value: dto.value, remark: dto.remark } });
  }

  async update(id: string, dto: CreateConfigDto) {
    await this.findOne(id);
    return this.prisma.systemConfig.update({
      where: { id },
      data: { key: dto.key, value: dto.value, remark: dto.remark },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.systemConfig.delete({ where: { id } });
    return { success: true };
  }
}
