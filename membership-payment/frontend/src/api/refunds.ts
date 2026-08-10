/* ============================================================
 * Refunds API
 * ============================================================ */
import request from './request';
import type { RefundRequest } from '@/types';

// 用户申请退款
export function createRefund(data: { orderId: string; reason: string }) {
  return request.post('/refunds', data);
}

// 查询退款列表（管理员带 scope=all 看全部）
export function listRefunds(scope?: 'all', status?: string) {
  return request.get<any, RefundRequest[]>('/refunds', {
    params: { ...(scope ? { scope } : {}), ...(status ? { status } : {}) },
  });
}

// 管理员通过
export function approveRefund(id: string) {
  return request.put(`/refunds/${id}/approve`);
}

// 管理员拒绝
export function rejectRefund(id: string) {
  return request.put(`/refunds/${id}/reject`);
}
