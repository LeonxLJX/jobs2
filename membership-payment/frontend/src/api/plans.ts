/* ============================================================
 * Plans API
 * ============================================================ */
import request from './request';
import type { Plan } from '@/types';

export function listPlans() {
  return request.get<any, Plan[]>('/plans');
}
