import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // 数字卡片统计 / Number card stats
  async stats() {
    // 总用户数 / Total users
    const totalUsers = await this.prisma.user.count();
    // 今日活跃用户（今日有操作日志的用户数）/ Today's active users
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayActive = await this.prisma.operationLog.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { userId: true },
      distinct: ['userId'],
    });
    // 总订单数（mock，因为没有订单表）/ Total orders (mock, no order table)
    const totalOrders = 1280;
    // 今日操作日志数 / Today's operations
    const todayOps = await this.prisma.operationLog.count({
      where: { createdAt: { gte: todayStart } },
    });

    return {
      totalUsers,
      totalOrders,
      todayActive: todayActive.length,
      todayOps,
    };
  }

  // 图表数据 / Chart data
  async charts() {
    // 近 7 天操作趋势（折线图）/ Last 7 days operation trend (line chart)
    const days: string[] = [];
    const trendData: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      const count = await this.prisma.operationLog.count({
        where: { createdAt: { gte: start, lte: end } },
      });
      days.push(`${start.getMonth() + 1}/${start.getDate()}`);
      trendData.push(count);
    }

    // 角色用户分布（饼图）/ User distribution by role (pie chart)
    const roles = await this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    });
    const roleDistribution = roles.map((r) => ({ name: r.name, value: r._count.users }));

    return {
      trend: { days, data: trendData },
      roleDistribution,
    };
  }
}
