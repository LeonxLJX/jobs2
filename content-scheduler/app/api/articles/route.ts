// 文章列表与创建接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 获取文章列表（分页 + 按状态筛选）
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") || "10"))
  );
  const status = searchParams.get("status") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  const where = {
    userId: session.userId,
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// 创建文章
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, categoryId, status, publishAt } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容为必填" },
        { status: 400 }
      );
    }

    const finalStatus = status || "draft";
    if (!["draft", "scheduled", "published"].includes(finalStatus)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    // 定时发布需校验时间
    if (finalStatus === "scheduled" && !publishAt) {
      return NextResponse.json(
        { error: "定时发布必须设置 publishAt" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        userId: session.userId,
        categoryId: categoryId || null,
        title,
        content,
        excerpt: excerpt || null,
        status: finalStatus,
        publishAt: publishAt ? new Date(publishAt) : null,
        publishedAt: finalStatus === "published" ? new Date() : null,
      },
      include: { category: true },
    });

    // 立即发布时写入统计
    if (finalStatus === "published") {
      const dateKey = new Date().toISOString().slice(0, 10);
      await prisma.statDaily.upsert({
        where: { userId_date: { userId: session.userId, date: dateKey } },
        update: { publishedCount: { increment: 1 } },
        create: {
          userId: session.userId,
          date: dateKey,
          publishedCount: 1,
        },
      });
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "创建失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
