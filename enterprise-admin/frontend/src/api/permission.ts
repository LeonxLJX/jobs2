import { get, post, put, del } from './request';
import type { Permission } from '@/types';

// 全部权限（平铺）/ All permissions (flat)
export function getPermissions() {
  return get<Permission[]>('/permissions');
}

// 权限树 / Permission tree
export function getPermissionTree() {
  return get<Permission[]>('/permissions/tree');
}

// 新增 / Create
export function createPermission(data: any) {
  return post('/permissions', data);
}

// 编辑 / Update
export function updatePermission(id: string, data: any) {
  return put(`/permissions/${id}`, data);
}

// 删除 / Delete
export function deletePermission(id: string) {
  return del(`/permissions/${id}`);
}
