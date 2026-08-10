/* ============================================================
 * Payment 控制器 / Payment Controller
 * - POST /payment/checkout
 * - POST /payment/mock-webhook
 * - POST /payment/webhook (真实 Stripe)
 * - GET  /payment/mock-session/:sessionId
 * ============================================================ */
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CheckoutDto, MockWebhookDto } from './dto';
import { ApiResponse } from '../common/api-response';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 创建 checkout session
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser('sub') userId: string, @Body() dto: CheckoutDto) {
    const data = await this.paymentService.checkout(userId, dto);
    return ApiResponse.ok(data, '已创建支付会话 / Checkout session created');
  }

  // Mock 模式手动触发支付成功
  @Post('mock-webhook')
  async mockWebhook(@Body() dto: MockWebhookDto) {
    const data = await this.paymentService.mockWebhook(dto);
    return ApiResponse.ok(data, data.message);
  }

  // 查询 mock session 状态（供前端支付页使用）
  @Get('mock-session/:sessionId')
  async getMockSession(@Param('sessionId') sessionId: string) {
    const data = await this.paymentService.getMockSession(sessionId);
    return ApiResponse.ok(data);
  }

  // 真实 Stripe webhook（需要原始 body + 签名头）
  @Post('webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = req.rawBody as Buffer;
    const data = await this.paymentService.stripeWebhook(raw, signature || '');
    return ApiResponse.ok(data, 'Webhook 处理完成 / Webhook processed');
  }
}
