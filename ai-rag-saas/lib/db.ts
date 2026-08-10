import { PrismaClient } from '@prisma/client';

// 全局单例 PrismaClient，避免开发模式下热重载创建多个连接
// Global singleton PrismaClient to avoid multiple connections on hot reload
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
