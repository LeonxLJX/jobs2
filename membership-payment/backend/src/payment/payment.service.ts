/* ============================================================
 * Payment 服务 / Payment Service
 * 支持 mock 与 stripe 双模式 / Supports mock & stripe modes
 * ============================================================ */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { OrdersService } from '../orders/orders.service';
import { PointsService } from '../points/points.service';
import { CheckoutDto, MockWebhookDto } from './dto';

// 积分兑换比率：1 积分 = 0.01 货币 / 1 point = 0.01 currency
const POINTS_TO_CURRENCY = 0.01;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly mode: 'mock' | 'stripe';
  private stripe: Stripe | null = null;
  // 内存存储 mock session 元数据 / In-memory mock session store
  private mockSessions = new Map<string, { orderId: string; createdAt: number }>();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private plansService: PlansService,
    private ordersService: OrdersService,
    private pointsService: PointsService,
  ) {
    const m = (this.configService.get<string>('PAYMENT_MODE') || 'mock').toLowerCase();
    this.mode = m === 'stripe' ? 'stripe' : 'mock';

    // 若配置了 Stripe 密钥则初始化 / Init Stripe if key configured
    const key = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (key && key.trim().length > 0) {
      this.stripe = new Stripe(key);
    }
  }

  // 当前模式 / Current mode
  getMode() {
    return this.mode;
  }

  // 创建 checkout session / Create checkout session
  async checkout(userId: string, dto: CheckoutDto) {
    const plan = await this.plansService.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException('套餐不存在 / Plan not found');
    }
    if (plan.code === 'free') {
      throw new BadRequestException('免费套餐无需购买 / Free plan requires no payment');
    }

    // 处理积分抵扣 / Handle points deduction
    let pointsUsed = 0;
    let pointsDeduction = 0;
    if (dto.pointsUsed && dto.pointsUsed > 0) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('用户不存在 / User not found');
      }
      if (user.points < dto.pointsUsed) {
        throw new BadRequestException('积分不足 / Insufficient points');
      }
      pointsUsed = dto.pointsUsed;
      pointsDeduction = +(pointsUsed * POINTS_TO_CURRENCY).toFixed(2);
    }

    const finalAmount = Math.max(0, +(plan.price - pointsDeduction).toFixed(2));

    // 创建订单 / Create order
    const order = await this.ordersService.createOrder({
      userId,
      planId: plan.id,
      amount: finalAmount,
      currency: plan.currency,
      type: plan.billingType,
      pointsUsed,
    });

    // 若使用积分，立即扣减（取消时返还）/ Deduct points immediately (refund on cancel)
    if (pointsUsed > 0) {
      await this.pointsService.spendPoints(
        userId,
        pointsUsed,
        `订单抵扣 / Order deduction (${order.id})`,
      );
    }

    let sessionId: string;
    let checkoutUrl: string;

    if (this.mode === 'stripe' && this.stripe) {
      // 真实 Stripe 模式 / Real Stripe mode
      const successUrl = (this.configService.get<string>('STRIPE_SUCCESS_URL') || '')
        .replace('{SESSION_ID}', '{CHECKOUT_SESSION_ID}');
      const cancelUrl = this.configService.get<string>('STRIPE_CANCEL_URL') || '';

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: plan.billingType === 'subscription' ? 'subscription' : 'payment',
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: { name: plan.name },
              unit_amount: Math.round(finalAmount * 100),
              ...(plan.billingType === 'subscription'
                ? { recurring: { interval: 'month' as const } }
                : {}),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: order.id,
        metadata: { orderId: order.id, userId, planId: plan.id, pointsUsed: String(pointsUsed) },
      });

      sessionId = session.id;
      checkoutUrl = session.url || '';

      // 更新订单 sessionId / Update order session id
      await this.prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: sessionId },
      });
    } else {
      // Mock 模式 / Mock mode
      sessionId = `mock_session_${order.id}_${Date.now()}`;
      checkoutUrl = `http://localhost:5173/payment/mock-pay?session=${sessionId}`;

      // 更新订单 sessionId / Update order session id
      await this.prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: sessionId },
      });

      // 缓存 mock session / Cache mock session
      this.mockSessions.set(sessionId, { orderId: order.id, createdAt: Date.now() });
    }

    return {
      sessionId,
      checkoutUrl,
      orderId: order.id,
      mode: this.mode,
      amount: finalAmount,
      currency: plan.currency,
      pointsUsed,
      pointsDeduction,
    };
  }

  // Mock webhook：手动触发支付成功 / Mock webhook: manual trigger
  async mockWebhook(dto: MockWebhookDto) {
    if (this.mode === 'stripe' && this.stripe) {
      throw new BadRequestException('当前为 Stripe 真实模式，请使用真实 webhook / Stripe mode active, use real webhook');
    }

    // 优先从内存查 / Try in-memory first
    const cached = this.mockSessions.get(dto.sessionId);
    let orderId: string;

    if (cached) {
      orderId = cached.orderId;
    } else {
      // 兼容直接通过 sessionId 找订单 / Fallback: find order by sessionId
      const order = await this.ordersService.findBySessionId(dto.sessionId);
      if (!order) {
        throw new NotFoundException('Mock session 不存在 / Mock session not found');
      }
      orderId = order.id;
    }

    return this.handlePaymentSuccess(orderId, dto.sessionId);
  }

  // 真实 Stripe webhook / Real Stripe webhook
  async stripeWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe 未配置 / Stripe not configured');
    }
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err: any) {
      this.logger.error(`Webhook 签名验证失败 / Signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook 签名验证失败 / Invalid signature: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id || session.metadata?.orderId;
      if (orderId) {
        return this.handlePaymentSuccess(orderId, session.id);
      }
    }

    return { received: true, type: event.type };
  }

  // 支付成功核心处理 / Handle payment success (shared)
  // 1. 更新订单为 paid 2. 升级用户 plan 3. 生成账单
  async handlePaymentSuccess(orderId: string, sessionId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { plan: true, user: true },
    });
    if (!order) {
      throw new NotFoundException('订单不存在 / Order not found');
    }
    if (order.status === 'paid') {
      return { message: '订单已支付，无需重复处理 / Order already paid', order };
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('订单已取消，无法支付 / Order cancelled');
    }

    // 计算套餐到期时间 / Compute plan expiry
    let planExpireAt: Date | null = null;
    if (order.type === 'subscription') {
      // 月付 / Monthly
      planExpireAt = new Date();
      planExpireAt.setMonth(planExpireAt.getMonth() + 1);
    } else {
      // 终身 / Lifetime
      planExpireAt = null;
    }

    // 事务：更新订单 + 用户 + 账单 / Transaction
    const [updatedOrder] = await this.prisma.$transaction([
      // 1. 订单状态变 paid / Order -> paid
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          stripeSessionId: sessionId,
        },
        include: { plan: true },
      }),
      // 2. 用户升级 plan / Upgrade user plan
      this.prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: order.plan.code,
          ...(planExpireAt ? { planExpireAt } : { planExpireAt: null }),
        },
      }),
      // 3. 生成账单（若不存在）/ Create bill if not exists
      this.prisma.bill.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          userId: order.userId,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          issuedAt: new Date(),
        },
      }),
    ]);

    // 清理 mock session / Clean mock session
    this.mockSessions.delete(sessionId);

    this.logger.log(`支付成功 / Payment success: order ${orderId}, plan ${order.plan.code}`);

    return {
      message: '支付成功 / Payment success',
      order: updatedOrder,
      planUpgraded: order.plan.code,
    };
  }

  // 查询 mock session 状态（供前端支付页用）/ Get mock session status
  async getMockSession(sessionId: string) {
    const order = await this.ordersService.findBySessionId(sessionId);
    if (!order) {
      throw new NotFoundException('Session 不存在 / Session not found');
    }
    return {
      sessionId,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      planName: order.plan.name,
      planCode: order.plan.code,
      mode: this.mode,
    };
  }
}
