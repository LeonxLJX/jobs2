// 分类更新与删除接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
  });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  try {
    const { name, description } = await request.json();
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ category });
  } catch (err) {
    return NextResponse.json(
      { error: "更新失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

// 删除分类（关联文章 categoryId 置空）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
  });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
