/* ============================================================
 * Points 服务 / Points Service
 * 积分记录查询、积分扣减（mock 抵扣订单用）
 * ============================================================ */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  // 积分历史 / Points history
  async getHistory(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.prisma.pointsLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.pointsLog.count({ where: { userId } }),
    ]);
    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 消耗积分（mock 抵扣订单）/ Spend points (mock deduction)
  // 返回扣减后的余额 / Return new balance
  async spendPoints(userId: string, amount: number, reason: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在 / User not found');
    }
    if (user.points < amount) {
      throw new Error('积分不足 / Insufficient points');
    }
    const newBalance = user.points - amount;
    await this.prisma.$transaction([
      this.prisma.pointsLog.create({
        data: {
          userId,
          change: -amount,
          reason,
          balance: newBalance,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { points: newBalance },
      }),
    ]);
    return newBalance;
  }

  // 增加积分 / Add points
  async addPoints(userId: string, amount: number, reason: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在 / User not found');
    }
    const newBalance = user.points + amount;
    await this.prisma.$transaction([
      this.prisma.pointsLog.create({
        data: {
          userId,
          change: amount,
          reason,
          balance: newBalance,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { points: newBalance },
      }),
    ]);
    return newBalance;
  }
}
