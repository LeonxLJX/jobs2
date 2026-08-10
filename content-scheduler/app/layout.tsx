// 根布局
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Scheduler - 内容定时发布工具",
  description: "内容管理与定时发布工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
