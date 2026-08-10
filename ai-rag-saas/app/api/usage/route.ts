// 使用统计接口 / Usage stats
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/api';
import { checkQuota, todayStr } from '@/lib/usage';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  // 配额信息
  const quota = await checkQuota(user.id);

  // 文档数
  const documentCount = await prisma.document.count({
    where: { userId: user.id },
  });

  // 今日统计
  const today = todayStr();
  const todayStat = await prisma.usageStat.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  // 总提问数 / 总上传数（聚合历史）
  const agg = await prisma.usageStat.aggregate({
    where: { userId: user.id },
    _sum: { questionCount: true, uploadCount: true },
  });

  // 最近 7 天统计
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = await prisma.usageStat.findMany({
    where: {
      userId: user.id,
      date: { gte: todayStr7(sevenDaysAgo) },
    },
    orderBy: { date: 'asc' },
  });

  return ok({
    plan: user.plan,
    quota: {
      used: quota.used,
      limit: quota.limit,
      remaining:
        quota.limit === -1 ? -1 : Math.max(0, quota.limit - quota.used),
    },
    today: {
      questionCount: todayStat?.questionCount ?? 0,
      uploadCount: todayStat?.uploadCount ?? 0,
    },
    totals: {
      documentCount,
      questionCount: agg._sum.questionCount ?? 0,
      uploadCount: agg._sum.uploadCount ?? 0,
    },
    recent7: recent.map((r) => ({
      date: r.date,
      questionCount: r.questionCount,
      uploadCount: r.uploadCount,
    })),
  });
}

// 辅助：取 7 天前的日期字符串
function todayStr7(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
