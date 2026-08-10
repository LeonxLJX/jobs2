// 统计工具：汇总数据和发布趋势
import { prisma } from "./db";
import { toDateKey } from "./publish";

// 获取用户的数据统计汇总
export async function getStatsSummary(userId: string) {
  const [total, published, draft, scheduled] = await Promise.all([
    prisma.article.count({ where: { userId } }),
    prisma.article.count({ where: { userId, status: "published" } }),
    prisma.article.count({ where: { userId, status: "draft" } }),
    prisma.article.count({ where: { userId, status: "scheduled" } }),
  ]);

  // 总浏览量和总点赞
  const agg = await prisma.article.aggregate({
    where: { userId },
    _sum: { views: true, likes: true },
  });

  return {
    total,
    published,
    draft,
    scheduled,
    totalViews: agg._sum.views || 0,
    totalLikes: agg._sum.likes || 0,
  };
}

// 获取最近 N 天的发布趋势
export async function getPublishTrend(userId: string, days: number = 14) {
  const now = new Date();
  const results: { date: string; publishedCount: number; totalViews: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = toDateKey(d);
    const stat = await prisma.statDaily.findUnique({
      where: { userId_date: { userId, date: dateKey } },
    });
    results.push({
      date: dateKey,
      publishedCount: stat?.publishedCount || 0,
      totalViews: stat?.totalViews || 0,
    });
  }

  return results;
}
