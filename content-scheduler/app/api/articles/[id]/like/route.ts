// 点赞接口（+1）
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 点赞无需登录即可模拟访客点赞
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
  });
  if (!article) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: { likes: { increment: 1 } },
  });

  return NextResponse.json({ likes: updated.likes });
}
