// 种子数据脚本：1 个用户、3 个分类、5 篇文章（含各状态）、若干每日统计
import "../scripts/loadEnv"; // 必须最先导入，加载 .env 环境变量
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth-core";
import { toDateKey } from "../lib/publish";

async function main() {
  console.log("🌱 开始写入种子数据...");

  // 清空旧数据
  await prisma.publishLog.deleteMany();
  await prisma.statDaily.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  const password = await hashPassword("author123");
  const user = await prisma.user.create({
    data: {
      email: "author@example.com",
      password,
      name: "示例作者",
      notifyEmail: "author@example.com",
    },
  });

  // 创建 3 个分类
  const [tech, life, notes] = await Promise.all([
    prisma.category.create({
      data: { userId: user.id, name: "技术", description: "技术分享相关文章" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "生活", description: "日常生活随笔" },
    }),
    prisma.category.create({
      data: { userId: user.id, name: "笔记", description: "学习笔记" },
    }),
  ]);

  // 创建 5 篇文章，覆盖 draft / scheduled / published
  const now = new Date();
  const inTwoMinutes = new Date(now.getTime() + 2 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  await prisma.article.create({
    data: {
      userId: user.id,
      categoryId: tech.id,
      title: "Next.js 14 全栈开发入门",
      content:
        "# Next.js 14\n\nNext.js 14 引入了 **App Router**，让全栈开发更简单。\n\n- 服务端组件\n- 路由处理器\n- 流式渲染\n\n```js\nexport default function Page() {\n  return <h1>Hello</h1>;\n}\n```",
      excerpt: "介绍 Next.js 14 App Router 的核心概念",
      status: "published",
      publishedAt: yesterday,
      views: 128,
      likes: 12,
    },
  });

  await prisma.article.create({
    data: {
      userId: user.id,
      categoryId: tech.id,
      title: "使用 Prisma 操作 SQLite 数据库",
      content:
        "## Prisma ORM\n\nPrisma 是一个现代 ORM，支持 SQLite、PostgreSQL 等。\n\n1. 定义 schema\n2. 生成 client\n3. 查询数据\n\n> 简单易用，类型安全。",
      excerpt: "Prisma ORM 基础用法",
      status: "published",
      publishedAt: twoDaysAgo,
      views: 86,
      likes: 7,
    },
  });

  await prisma.article.create({
    data: {
      userId: user.id,
      categoryId: notes.id,
      title: "TypeScript 类型体操笔记（草稿）",
      content:
        "# 类型体操\n\n- 条件类型\n- 映射类型\n- 模板字面量类型\n\n待补充更多内容...",
      excerpt: "TypeScript 高级类型学习笔记",
      status: "draft",
      views: 0,
      likes: 0,
    },
  });

  await prisma.article.create({
    data: {
      userId: user.id,
      categoryId: life.id,
      title: "周末徒步记",
      content:
        "# 周末徒步\n\n今天去爬了山，风景很美。\n\n**装备清单：**\n- 登山鞋\n- 水壶\n- 防晒霜",
      excerpt: "记录一次周末徒步经历",
      status: "draft",
      views: 0,
      likes: 0,
    },
  });

  // 一篇定时发布的文章，发布时间设为 2 分钟后，便于验证 cron
  await prisma.article.create({
    data: {
      userId: user.id,
      categoryId: tech.id,
      title: "定时发布测试文章（2 分钟后自动发布）",
      content:
        "# 定时发布测试\n\n这篇文章被设置为 **scheduled** 状态，发布时间在 2 分钟后。\n\n运行 `npm run cron` 后，到点会自动变为已发布，并写入发布日志、发送邮件通知。",
      excerpt: "用于验证定时发布功能",
      status: "scheduled",
      publishAt: inTwoMinutes,
      views: 5,
      likes: 1,
    },
  });

  // 写入若干每日统计数据（最近 3 天）
  const dateKey1 = toDateKey(yesterday);
  const dateKey2 = toDateKey(twoDaysAgo);
  await prisma.statDaily.create({
    data: { userId: user.id, date: dateKey1, publishedCount: 1, totalViews: 128 },
  });
  await prisma.statDaily.create({
    data: { userId: user.id, date: dateKey2, publishedCount: 1, totalViews: 86 },
  });

  console.log("✅ 种子数据写入完成：");
  console.log(`   用户：${user.email} / author123`);
  console.log("   分类：技术、生活、笔记");
  console.log("   文章：5 篇（2 已发布 / 2 草稿 / 1 定时中）");
  console.log("   统计：最近 2 天发布趋势数据");
}

main()
  .catch((err) => {
    console.error("❌ 种子数据写入失败：", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
