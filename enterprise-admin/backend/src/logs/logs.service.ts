import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  // 操作日志分页查询 / Operation log paginated query
  async findAll(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword?.trim();
    const where: any = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { action: { contains: keyword } },
        { target: { contains: keyword } },
        { detail: { contains: keyword } },
      ];
    }
    if (query.action) where.action = query.action;
    if (query.userId) where.userId = query.userId;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    const [list, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.operationLog.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }
}
