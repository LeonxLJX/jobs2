/* ============================================================
 * Bills 服务 / Bills Service
 * 账单列表、详情
 * ============================================================ */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  // 账单列表 / Bill list
  async list(userId: string) {
    return this.prisma.bill.findMany({
      where: { userId },
      include: {
        order: {
          include: { plan: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // 账单详情 / Bill detail
  async detail(userId: string, billId: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, userId },
      include: {
        order: {
          include: { plan: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!bill) {
      throw new NotFoundException('账单不存在 / Bill not found');
    }
    return bill;
  }
}
