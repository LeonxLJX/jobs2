import { get } from './request';
import type { PaginatedResult, OperationLog } from '@/types';

export interface LogQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// 操作日志列表 / Operation log list
export function getLogs(params: LogQuery) {
  return get<PaginatedResult<OperationLog>>('/logs', params);
}
