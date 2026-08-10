/* ============================================================
 * Sign API
 * ============================================================ */
import request from './request';
import type { SignTodayStatus, SignLog } from '@/types';

export function checkin() {
  return request.post('/sign/checkin');
}

export function getTodayStatus() {
  return request.get<any, SignTodayStatus>('/sign/today');
}

export function getSignHistory(days = 30) {
  return request.get<any, SignLog[]>('/sign/history', { params: { days } });
}
