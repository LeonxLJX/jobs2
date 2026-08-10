// 分类列表与创建接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 获取当前用户所有分类
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json({ categories });
}

// 创建分类
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "分类名称为必填" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        userId: session.userId,
        name,
        description: description || null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "创建失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
