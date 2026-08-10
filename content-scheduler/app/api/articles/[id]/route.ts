// 文章详情/更新/删除接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 获取文章详情（浏览量 mock 自增）
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!article || article.userId !== session.userId) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // 浏览量 mock 自增
  const updated = await prisma.article.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
    include: { category: true },
  });

  return NextResponse.json({ article: updated });
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, excerpt, categoryId, status, publishAt } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt || null;
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (status !== undefined) {
      if (!["draft", "scheduled", "published"].includes(status)) {
        return NextResponse.json({ error: "无效状态" }, { status: 400 });
      }
      data.status = status;
      // 从草稿/定时切换为已发布时记录发布时间
      if (status === "published" && existing.status !== "published") {
        data.publishedAt = new Date();
      }
    }
    if (publishAt !== undefined) {
      data.publishAt = publishAt ? new Date(publishAt) : null;
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    // 若通过更新变为已发布，写入每日统计
    if (
      status === "published" &&
      existing.status !== "published"
    ) {
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

    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json(
      { error: "更新失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const existing = await prisma.article.findUnique({
    where: { id: params.id },
  });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
