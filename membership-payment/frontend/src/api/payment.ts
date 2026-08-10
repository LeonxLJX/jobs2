/* ============================================================
 * Payment API
 * ============================================================ */
import request from './request';
import type { CheckoutResult, MockSessionStatus } from '@/types';

// 创建 checkout session
export function createCheckout(data: { planId: string; pointsUsed?: number }) {
  return request.post<any, CheckoutResult>('/payment/checkout', data);
}

// Mock 模式手动触发支付成功
export function mockWebhook(sessionId: string) {
  return request.post('/payment/mock-webhook', { sessionId });
}

// 查询 mock session 状态
export function getMockSession(sessionId: string) {
  return request.get<any, MockSessionStatus>(`/payment/mock-session/${sessionId}`);
}
