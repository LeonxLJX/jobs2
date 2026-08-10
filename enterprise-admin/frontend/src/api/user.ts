import { get, post, put, del } from './request';
import type { PaginatedResult, Role } from '@/types';

// 用户列表项 / User list item
export interface UserListItem {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  deptId?: string;
  status: number;
  createdAt: string;
  roles: { id: string; name: string; code: string }[];
}

export interface UserQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  deptId?: string;
  status?: number | string;
}

// 用户列表 / User list
export function getUsers(params: UserQuery) {
  return get<PaginatedResult<UserListItem>>('/users', params);
}

// 用户详情 / User detail
export function getUser(id: string) {
  return get<UserListItem>(`/users/${id}`);
}

// 新增用户 / Create user
export function createUser(data: any) {
  return post('/users', data);
}

// 编辑用户 / Update user
export function updateUser(id: string, data: any) {
  return put(`/users/${id}`, data);
}

// 删除用户 / Delete user
export function deleteUser(id: string) {
  return del(`/users/${id}`);
}

// 重置密码 / Reset password
export function resetPassword(id: string, newPassword: string) {
  return post(`/users/${id}/reset-password`, { newPassword });
}

// 分配角色 / Assign roles
export function assignUserRoles(id: string, roleIds: string[]) {
  return post(`/users/${id}/roles`, { roleIds });
}

// 全部角色（下拉用）/ All roles for dropdown
export function getAllRolesSimple() {
  return get<Role[]>('/roles/all/simple');
}
