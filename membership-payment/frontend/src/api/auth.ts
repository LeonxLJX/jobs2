/* ============================================================
 * Auth API
 * ============================================================ */
import request from './request';
import type { User } from '@/types';

export interface LoginResult {
  token: string;
  user: User;
}

// 注册 / Register
export function register(data: { email: string; password: string; name: string }) {
  return request.post<any, LoginResult>('/auth/register', data);
}

// 登录 / Login
export function login(data: { email: string; password: string }) {
  return request.post<any, LoginResult>('/auth/login', data);
}

// 登出 / Logout
export function logout() {
  return request.post('/auth/logout');
}

// 修改密码 / Change password
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.post('/auth/change-password', data);
}
