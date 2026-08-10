/* ============================================================
 * Orders 服务 / Orders Service
 * 订单列表、详情、取消
 * ============================================================ */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 订单列表 / Order list
  async list(userId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 订单详情 / Order detail
  async detail(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        plan: true,
        bill: true,
        refundRequests: true,
      },
    });
    if (!order) {
      throw new NotFoundException('订单不存在 / Order not found');
    }
    return order;
  }

  // 取消未支付订单 / Cancel pending order
  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) {
      throw new NotFoundException('订单不存在 / Order not found');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('仅未支付订单可取消 / Only pending orders can be cancelled');
    }
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    // 如果使用了积分抵扣，返还积分 / Refund points if used
    if (order.pointsUsed > 0) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const newBalance = (user?.points || 0) + order.pointsUsed;
      await this.prisma.$transaction([
        this.prisma.pointsLog.create({
          data: {
            userId,
            change: order.pointsUsed,
            reason: `订单取消返还 / Order cancelled refund (${order.id})`,
            balance: newBalance,
          },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { points: newBalance },
        }),
      ]);
    }

    return updated;
  }

  // 创建订单 / Create order
  async createOrder(data: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    type: string;
    stripeSessionId?: string;
    pointsUsed?: number;
  }) {
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        type: data.type,
        stripeSessionId: data.stripeSessionId || null,
        pointsUsed: data.pointsUsed || 0,
      },
      include: { plan: true },
    });
  }

  // 按 sessionId 查询订单 / Find by session id
  async findBySessionId(sessionId: string) {
    return this.prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
      include: { plan: true, user: true },
    });
  }

  // 按 id 查询订单（管理端用）/ Find by id (admin)
  async findById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { plan: true, user: true, bill: true },
    });
  }
}
