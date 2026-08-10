import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AI RAG SaaS - 智能文档问答',
  description:
    '基于 RAG 的 AI 文档问答 SaaS 系统 / RAG-based AI document Q&A SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
            AI RAG SaaS · MVP Demo · {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
