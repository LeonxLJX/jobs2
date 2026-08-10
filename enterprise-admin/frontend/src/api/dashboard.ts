import { get } from './request';

// 数字卡片统计 / Number card stats
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  todayActive: number;
  todayOps: number;
}

// 图表数据 / Chart data
export interface DashboardCharts {
  trend: { days: string[]; data: number[] };
  roleDistribution: { name: string; value: number }[];
}

export function getStats() {
  return get<DashboardStats>('/dashboard/stats');
}

export function getCharts() {
  return get<DashboardCharts>('/dashboard/charts');
}
