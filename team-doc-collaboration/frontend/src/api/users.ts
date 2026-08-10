import request from './request';
import type { User } from './types';

// 获取当前用户信息 / Get current user profile
export function getMe() {
  return request.get<unknown, User>('/users/me');
}
