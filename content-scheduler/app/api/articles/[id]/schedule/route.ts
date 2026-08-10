// 设置定时发布接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const article = await prisma.article.findUnique({
    where: { id: params.id },
  });
  if (!article || article.userId !== session.userId) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  try {
    const { publishAt } = await request.json();
    if (!publishAt) {
      return NextResponse.json(
        { error: "必须提供 publishAt 时间" },
        { status: 400 }
      );
    }

    const publishDate = new Date(publishAt);
    if (isNaN(publishDate.getTime())) {
      return NextResponse.json({ error: "时间格式无效" }, { status: 400 });
    }
    if (publishDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "定时发布时间必须晚于当前时间" },
        { status: 400 }
      );
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: { status: "scheduled", publishAt: publishDate },
      include: { category: true },
    });

    return NextResponse.json({ article: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "设置定时失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
