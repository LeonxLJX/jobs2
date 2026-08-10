/* ============================================================
 * Refunds 服务 / Refunds Service
 * 退款申请、列表、管理员审核（approve/reject）
 * 审核通过：订单状态 refunded + 撤销会员升级（简化：降回 free）
 * ============================================================ */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  // 申请退款 / Apply for refund
  async create(userId: string, dto: CreateRefundDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
    });
    if (!order) {
      throw new NotFoundException('订单不存在 / Order not found');
    }
    if (order.status !== 'paid') {
      throw new BadRequestException('仅已支付订单可申请退款 / Only paid orders can be refunded');
    }

    // 检查是否已有 pending 退款 / Check existing pending refund
    const existing = await this.prisma.refundRequest.findFirst({
      where: { orderId: dto.orderId, status: 'pending' },
    });
    if (existing) {
      throw new BadRequestException('该订单已有待审核的退款申请 / Refund already pending');
    }

    return this.prisma.refundRequest.create({
      data: {
        userId,
        orderId: dto.orderId,
        reason: dto.reason,
        status: 'pending',
      },
      include: { order: { include: { plan: true } } },
    });
  }

  // 用户的退款列表 / User's refund list
  async listByUser(userId: string) {
    return this.prisma.refundRequest.findMany({
      where: { userId },
      include: {
        order: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 管理员查看全部退款 / Admin: list all
  async listAll(status?: string) {
    return this.prisma.refundRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        order: { include: { plan: true } },
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 审核通过 / Approve
  async approve(refundId: string, reviewerId: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: { order: true },
    });
    if (!refund) {
      throw new NotFoundException('退款申请不存在 / Refund request not found');
    }
    if (refund.status !== 'pending') {
      throw new BadRequestException('该退款申请已审核 / Refund already reviewed');
    }

    // 事务：更新退款 + 订单 + 用户降级 / Transaction
    const [updated] = await this.prisma.$transaction([
      this.prisma.refundRequest.update({
        where: { id: refundId },
        data: {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
        include: {
          order: { include: { plan: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      // 订单状态变 refunded / Order -> refunded
      this.prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'refunded' },
      }),
      // 用户降级为 free（简化逻辑）/ Downgrade to free
      this.prisma.user.update({
        where: { id: refund.userId },
        data: {
          plan: 'free',
          planExpireAt: null,
        },
      }),
    ]);

    return updated;
  }

  // 审核拒绝 / Reject
  async reject(refundId: string, reviewerId: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
    });
    if (!refund) {
      throw new NotFoundException('退款申请不存在 / Refund request not found');
    }
    if (refund.status !== 'pending') {
      throw new BadRequestException('该退款申请已审核 / Refund already reviewed');
    }

    return this.prisma.refundRequest.update({
      where: { id: refundId },
      data: {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        order: { include: { plan: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
