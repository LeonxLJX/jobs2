// 发布日志接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") || "20"))
  );

  // 只返回当前用户文章的日志
  const where = {
    article: { userId: session.userId },
  };

  const [items, total] = await Promise.all([
    prisma.publishLog.findMany({
      where,
      orderBy: { executedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { article: { select: { title: true } } },
    }),
    prisma.publishLog.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
