// 立即发布接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/email";
import { toDateKey } from "@/lib/publish";

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
    include: { user: true },
  });
  if (!article || article.userId !== session.userId) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  try {
    const now = new Date();
    await prisma.article.update({
      where: { id: params.id },
      data: { status: "published", publishedAt: now, publishAt: null },
    });

    // 记录发布日志
    await prisma.publishLog.create({
      data: {
        articleId: params.id,
        status: "success",
        message: `文章《${article.title}》手动立即发布成功`,
      },
    });

    // 更新每日统计
    const dateKey = toDateKey(now);
    await prisma.statDaily.upsert({
      where: { userId_date: { userId: session.userId, date: dateKey } },
      update: { publishedCount: { increment: 1 } },
      create: { userId: session.userId, date: dateKey, publishedCount: 1 },
    });

    // 发送邮件通知
    const to = article.user.notifyEmail || article.user.email;
    if (to) {
      await sendMail(
        to,
        "【内容发布工具】文章发布成功",
        `您的文章《${article.title}》已成功发布。`
      );
    }

    return NextResponse.json({ ok: true, status: "published" });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.publishLog.create({
      data: {
        articleId: params.id,
        status: "failed",
        message: `手动发布失败：${reason}`,
      },
    });
    return NextResponse.json({ error: "发布失败：" + reason }, { status: 500 });
  }
}
