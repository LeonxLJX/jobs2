import { get, post, put, del } from './request';
import type { Dept } from '@/types';

// 部门树 / Dept tree
export function getDeptTree() {
  return get<Dept[]>('/depts');
}

// 新增 / Create
export function createDept(data: any) {
  return post('/depts', data);
}

// 编辑 / Update
export function updateDept(id: string, data: any) {
  return put(`/depts/${id}`, data);
}

// 删除 / Delete
export function deleteDept(id: string) {
  return del(`/depts/${id}`);
}
