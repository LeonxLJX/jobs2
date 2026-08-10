// 配额与使用统计工具
// Quota & usage stats utilities

import { prisma } from './db';

// 免费用户每日提问配额（可通过 .env 调整）
export const FREE_DAILY_QUOTA = Number(process.env.FREE_DAILY_QUOTA) || 10;

// 获取今日日期字符串（本地时区，YYYY-MM-DD）
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 重置用户每日提问计数（如果跨天）
export async function resetDailyQuotaIfNeeded(userId: string): Promise<void> {
  const today = todayStr();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  if (user.lastResetDate !== today) {
    await prisma.user.update({
      where: { id: userId },
      data: { questionsToday: 0, lastResetDate: today },
    });
  }
}

// 检查用户是否还能提问；返回 { allowed, used, limit }
export async function checkQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number; // -1 表示无限制（pro）
}> {
  await resetDailyQuotaIfNeeded(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, used: 0, limit: 0 };
  if (user.plan === 'pro') {
    return { allowed: true, used: user.questionsToday, limit: -1 };
  }
  const limit = FREE_DAILY_QUOTA;
  return {
    allowed: user.questionsToday < limit,
    used: user.questionsToday,
    limit,
  };
}

// 增加用户今日提问计数
export async function incrementQuestionCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { questionsToday: { increment: 1 } },
  });
  // 同时更新按日统计表
  const today = todayStr();
  await prisma.usageStat.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, questionCount: 1 },
    update: { questionCount: { increment: 1 } },
  });
}

// 增加用户上传计数（统计用）
export async function incrementUploadCount(userId: string): Promise<void> {
  const today = todayStr();
  await prisma.usageStat.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, uploadCount: 1 },
    update: { uploadCount: { increment: 1 } },
  });
}
