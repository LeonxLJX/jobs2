/* ============================================================
 * 全局类型定义 / Global Types
 * ============================================================ */

// 统一响应结构 / Unified response
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 用户 / User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  points: number;
  planExpireAt: string | null;
  lastSignDate: string | null;
  signStreak: number;
  createdAt: string;
  planFeatures?: string[];
  planName?: string;
}

// 套餐 / Plan
export interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingType: 'subscription' | 'oneshot';
  interval: string | null;
  features: string[];
  active: boolean;
}

// 订单 / Order
export interface Order {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  type: 'subscription' | 'oneshot';
  stripeSessionId: string | null;
  pointsUsed: number;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  plan?: Plan;
  bill?: Bill | null;
  refundRequests?: RefundRequest[];
}

// 账单 / Bill
export interface Bill {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  issuedAt: string;
  order?: Order;
  user?: { id: string; name: string; email: string };
}

// 退款申请 / Refund Request
export interface RefundRequest {
  id: string;
  userId: string;
  orderId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  order?: Order;
  user?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string } | null;
}

// 签到记录 / Sign Log
export interface SignLog {
  id: string;
  userId: string;
  date: string;
  pointsAwarded: number;
  createdAt: string;
}

// 签到状态 / Sign Today Status
export interface SignTodayStatus {
  signedToday: boolean;
  signStreak: number;
  points: number;
  nextReward: number;
  nextStreakDay: number;
  rewardTable: number[];
}

// 积分记录 / Points Log
export interface PointsLog {
  id: string;
  userId: string;
  change: number;
  reason: string;
  balance: number;
  createdAt: string;
}

// 支付会话 / Checkout session
export interface CheckoutResult {
  sessionId: string;
  checkoutUrl: string;
  orderId: string;
  mode: 'mock' | 'stripe';
  amount: number;
  currency: string;
  pointsUsed: number;
  pointsDeduction: number;
}

// Mock session 查询结果 / Mock session status
export interface MockSessionStatus {
  sessionId: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  planName: string;
  planCode: string;
  mode: 'mock' | 'stripe';
}
