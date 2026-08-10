import { get, post, put, del } from './request';
import type { PaginatedResult, Role } from '@/types';

export interface RoleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 角色列表 / Role list
export function getRoles(params: RoleQuery) {
  return get<PaginatedResult<Role>>('/roles', params);
}

// 角色详情 / Role detail
export function getRole(id: string) {
  return get<Role>(`/roles/${id}`);
}

// 新增 / Create
export function createRole(data: { name: string; code: string; description?: string }) {
  return post('/roles', data);
}

// 编辑 / Update
export function updateRole(id: string, data: { name: string; code: string; description?: string }) {
  return put(`/roles/${id}`, data);
}

// 删除 / Delete
export function deleteRole(id: string) {
  return del(`/roles/${id}`);
}

// 获取角色已分配权限 / Get assigned permissions
export function getRolePermissions(id: string) {
  return get<{ permissionIds: string[] }>(`/roles/${id}/permissions`);
}

// 分配权限 / Assign permissions
export function assignRolePermissions(id: string, permissionIds: string[]) {
  return put(`/roles/${id}/permissions`, { permissionIds });
}
