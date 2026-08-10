// API 通用响应工具
// Common API response helpers

import { NextResponse } from 'next/server';

// 成功响应
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// 失败响应
export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    { status }
  );
}

// 未认证
export function unauthorized(message = '未登录或登录已过期') {
  return fail(message, 401);
}

// 禁止访问
export function forbidden(message = '无权访问该资源') {
  return fail(message, 403);
}

// 未找到
export function notFound(message = '资源不存在') {
  return fail(message, 404);
}

// 限流 / 配额超限
export function tooManyRequests(message = '已达到今日提问配额，请升级到 Pro 解锁无限提问') {
  return fail(message, 429);
}
