import { get, post } from './request';
import type { MenuItem, UserInfo } from '@/types';

// 登录参数 / Login params
export interface LoginParams {
  username: string;
  password: string;
}

// 登录返回 / Login result
export interface LoginResult {
  token: string;
  user: UserInfo;
}

// 登录 / Login
export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data);
}

// 登出 / Logout
export function logout() {
  return post('/auth/logout');
}

// 修改密码 / Change password
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return post('/auth/change-password', data);
}

// 获取当前用户信息 / Get profile
export function getProfile() {
  return get<UserInfo>('/auth/profile');
}

// 获取当前用户菜单与权限码 / Get menus & permission codes
export function getMenus() {
  return get<{ menus: MenuItem[]; permissions: string[] }>('/auth/menus');
}
