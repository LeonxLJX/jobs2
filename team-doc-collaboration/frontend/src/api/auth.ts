import request from './request';
import type { AuthResult, User } from './types';

// 注册 / Register
export function register(data: { email: string; password: string; name: string }) {
  return request.post<unknown, AuthResult>('/auth/register', data);
}

// 登录 / Login
export function login(data: { email: string; password: string }) {
  return request.post<unknown, AuthResult>('/auth/login', data);
}

// 登出 / Logout
export function logout() {
  return request.post<unknown, { message: string }>('/auth/logout');
}

// 修改密码 / Change password
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.post<unknown, { message: string }>('/auth/change-password', data);
}
