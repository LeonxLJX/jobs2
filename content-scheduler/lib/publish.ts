// 发布逻辑：扫描到点文章并发布，记录日志、发邮件、更新统计
import { prisma } from "./db";
import { sendMail } from "./email";

// 格式化日期为 YYYY-MM-DD（本地时区）
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 单篇文章发布流程
export async function publishArticle(articleId: string, now: Date = new Date()) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { user: true },
  });

  if (!article) {
    return { success: false, message: "文章不存在" };
  }

  try {
    // 更新文章状态为已发布
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: "published",
        publishedAt: now,
      },
    });

    // 记录发布日志
    await prisma.publishLog.create({
      data: {
        articleId,
        status: "success",
        message: `文章《${article.title}》定时发布成功`,
      },
    });

    // 更新每日统计
    const dateKey = toDateKey(now);
    await prisma.statDaily.upsert({
      where: { userId_date: { userId: article.userId, date: dateKey } },
      update: { publishedCount: { increment: 1 } },
      create: {
        userId: article.userId,
        date: dateKey,
        publishedCount: 1,
      },
    });

    // 发送邮件通知（发送到用户的 notifyEmail 或邮箱）
    const to = article.user.notifyEmail || article.user.email;
    if (to) {
      await sendMail(
        to,
        "【内容发布工具】文章发布成功",
        `您的文章《${article.title}》已成功发布。`
      );
    }

    return { success: true, message: "发布成功" };
  } catch (err) {
    // 发布失败：记录失败日志并发邮件
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.publishLog.create({
      data: {
        articleId,
        status: "failed",
        message: `发布失败：${reason}`,
      },
    });

    if (article.user.notifyEmail || article.user.email) {
      const to = article.user.notifyEmail || article.user.email;
      await sendMail(
        to,
        "【内容发布工具】文章发布失败",
        `您的文章《${article.title}》发布失败，原因：${reason}`
      );
    }

    return { success: false, message: reason };
  }
}

// 扫描所有到点需发布的定时文章
export async function publishDueArticles(now: Date = new Date()) {
  const due = await prisma.article.findMany({
    where: {
      status: "scheduled",
      publishAt: { lte: now },
    },
  });

  const results = [];
  for (const article of due) {
    const res = await publishArticle(article.id, now);
    results.push({ articleId: article.id, title: article.title, ...res });
  }

  return {
    scanned: due.length,
    results,
  };
}
