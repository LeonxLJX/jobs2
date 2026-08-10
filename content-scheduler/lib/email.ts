// 邮件通知工具：未配置 SMTP 时使用控制台 mock 输出
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;
let smtpConfigured = false;

// 初始化邮件传输器
function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // SMTP 未配置时返回 null，使用控制台 mock
  if (!host || !user || !pass) {
    return null;
  }

  smtpConfigured = true;
  transporter = nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: (Number(port) || 587) === 465,
    auth: { user, pass },
  });
  return transporter;
}

// 发送邮件：SMTP 未配置时打印到控制台
export async function sendMail(to: string, subject: string, text: string) {
  const from = process.env.NOTIFY_FROM || "noreply@content-scheduler.local";
  const transport = getTransporter();

  if (!transport) {
    // mock 模式：输出到控制台
    console.log("──────────────────────────────────────────────");
    console.log("[MOCK MAIL] 邮件未发送（SMTP 未配置）");
    console.log(`  收件人 : ${to}`);
    console.log(`  发件人 : ${from}`);
    console.log(`  主题   : ${subject}`);
    console.log(`  正文   : ${text}`);
    console.log("──────────────────────────────────────────────");
    return { mock: true };
  }

  await transport.sendMail({ from, to, subject, text });
  return { mock: false };
}

// 发布成功通知
export async function sendPublishSuccessEmail(
  to: string,
  articleTitle: string
) {
  return sendMail(
    to,
    "【内容发布工具】文章发布成功",
    `您的文章《${articleTitle}》已成功发布。`
  );
}

// 发布失败通知
export async function sendPublishFailureEmail(
  to: string,
  articleTitle: string,
  reason: string
) {
  return sendMail(
    to,
    "【内容发布工具】文章发布失败",
    `您的文章《${articleTitle}》发布失败，原因：${reason}`
  );
}
