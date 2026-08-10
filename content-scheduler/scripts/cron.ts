// 定时任务脚本：使用 node-cron 每分钟扫描到点的定时文章并发布
// 运行方式：npm run cron（需另开一个终端）
import "./loadEnv"; // 必须最先导入，加载 .env 环境变量
import cron from "node-cron";
import { prisma } from "../lib/db";
import { publishDueArticles } from "../lib/publish";

const schedule = process.env.CRON_SCHEDULE || "* * * * *";

// 单次扫描任务
async function runOnce() {
  const startedAt = new Date();
  console.log(
    `[${startedAt.toLocaleString("zh-CN")}] cron 开始扫描定时文章...`
  );

  try {
    const result = await publishDueArticles(startedAt);
    console.log(
      `✅ 扫描完成：发现 ${result.scanned} 篇待发布文章`
    );
    for (const r of result.results) {
      const icon = r.success ? "✅" : "❌";
      console.log(
        `  ${icon} 文章《${r.title}》：${r.message}`
      );
    }
  } catch (err) {
    console.error("❌ cron 执行出错：", err);
  }
}

// 立即执行一次，便于启动后即时检查
runOnce();

// 按 CRON_SCHEDULE 定时执行（默认每分钟一次）
cron.schedule(schedule, () => {
  runOnce();
});

console.log(`🚀 cron 服务已启动，调度表达式：${schedule}`);
console.log("   按 Ctrl+C 停止");

// 保持进程运行
process.on("SIGINT", async () => {
  console.log("\n⏹  正在停止 cron 服务...");
  await prisma.$disconnect();
  process.exit(0);
});
