/* ============================================================
 * Points API
 * ============================================================ */
import request from './request';
import type { PointsLog } from '@/types';

export interface PointsHistoryResult {
  list: PointsLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function getPointsHistory(page = 1, pageSize = 20) {
  return request.get<any, PointsHistoryResult>('/points/history', {
    params: { page, pageSize },
  });
}
