// 统计接口：汇总数据 + 发布趋势 + 最近文章
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStatsSummary, getPublishTrend } from "@/lib/stats";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const [summary, trend, recentArticles] = await Promise.all([
    getStatsSummary(session.userId),
    getPublishTrend(session.userId, 14),
    prisma.article.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
  ]);

  return NextResponse.json({ summary, trend, recentArticles });
}
