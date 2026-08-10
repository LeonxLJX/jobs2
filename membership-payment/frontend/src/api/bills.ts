/* ============================================================
 * Bills API
 * ============================================================ */
import request from './request';
import type { Bill } from '@/types';

export function listBills() {
  return request.get<any, Bill[]>('/bills');
}

export function getBillDetail(id: string) {
  return request.get<any, Bill>(`/bills/${id}`);
}
