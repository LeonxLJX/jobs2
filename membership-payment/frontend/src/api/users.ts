/* ============================================================
 * Users API
 * ============================================================ */
import request from './request';
import type { User } from '@/types';

export function getProfile() {
  return request.get<any, User>('/users/profile');
}

export function updateProfile(data: { name?: string; avatar?: string }) {
  return request.put<any, User>('/users/profile', data);
}
