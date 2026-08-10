/* ============================================================
 * Orders API
 * ============================================================ */
import request from './request';
import type { Order } from '@/types';

export function listOrders(status?: string) {
  return request.get<any, Order[]>('/orders', { params: status ? { status } : {} });
}

export function getOrderDetail(id: string) {
  return request.get<any, Order>(`/orders/${id}`);
}

export function cancelOrder(id: string) {
  return request.post(`/orders/${id}/cancel`);
}
