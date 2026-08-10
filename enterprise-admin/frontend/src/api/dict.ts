import { get, post, put, del } from './request';
import type { PaginatedResult, DictType, DictItem } from '@/types';

export interface DictTypeQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface DictItemQuery {
  dictTypeId?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// ===== 字典类型 / Dict type =====
export function getDictTypes(params: DictTypeQuery) {
  return get<PaginatedResult<DictType>>('/dict-types', params);
}

export function createDictType(data: { name: string; code: string; status?: number }) {
  return post('/dict-types', data);
}

export function updateDictType(id: string, data: { name: string; code: string; status?: number }) {
  return put(`/dict-types/${id}`, data);
}

export function deleteDictType(id: string) {
  return del(`/dict-types/${id}`);
}

// ===== 字典项 / Dict item =====
export function getDictItems(params: DictItemQuery) {
  return get<PaginatedResult<DictItem>>('/dict-items', params);
}

// 按编码取启用项（下拉用）/ Items by code (for dropdown)
export function getDictItemsByCode(code: string) {
  return get<DictItem[]>(`/dict-items/code/${code}`);
}

export function createDictItem(data: any) {
  return post('/dict-items', data);
}

export function updateDictItem(id: string, data: any) {
  return put(`/dict-items/${id}`, data);
}

export function deleteDictItem(id: string) {
  return del(`/dict-items/${id}`);
}
