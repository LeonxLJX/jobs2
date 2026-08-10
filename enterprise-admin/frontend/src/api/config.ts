import { get, post, put, del } from './request';
import type { PaginatedResult, SystemConfig } from '@/types';

export interface ConfigQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 系统配置列表 / System config list
export function getConfigs(params: ConfigQuery) {
  return get<PaginatedResult<SystemConfig>>('/system-configs', params);
}

// 新增 / Create
export function createConfig(data: { key: string; value: string; remark?: string }) {
  return post('/system-configs', data);
}

// 编辑 / Update
export function updateConfig(id: string, data: { key: string; value: string; remark?: string }) {
  return put(`/system-configs/${id}`, data);
}

// 删除 / Delete
export function deleteConfig(id: string) {
  return del(`/system-configs/${id}`);
}
