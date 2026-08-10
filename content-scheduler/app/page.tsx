// 仪表盘页面：统计卡片 + 趋势图 + 最近文章
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import TrendChart from "@/components/TrendChart";

interface Summary {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  totalViews: number;
  totalLikes: number;
}

interface Article {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  views: number;
  likes: number;
  category: { name: string } | null;
}

interface StatsData {
  summary: Summary;
  trend: { date: string; publishedCount: number; totalViews: number }[];
  recentArticles: Article[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  scheduled: "定时中",
  published: "已发布",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: "总文章数", value: data.summary.total, color: "text-blue-600" },
    { label: "已发布", value: data.summary.published, color: "text-green-600" },
    { label: "草稿", value: data.summary.draft, color: "text-gray-600" },
    { label: "定时中", value: data.summary.scheduled, color: "text-yellow-600" },
    { label: "总浏览量", value: data.summary.totalViews, color: "text-purple-600" },
    { label: "总点赞数", value: data.summary.totalLikes, color: "text-pink-600" },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <a
          href="/articles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          + 新建文章
        </a>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 趋势图 */}
      <div className="mb-8">
        <TrendChart data={data.trend} />
      </div>

      {/* 最近文章 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近文章</h2>
          <a href="/articles" className="text-sm text-blue-600 hover:underline">
            查看全部
          </a>
        </div>
        {data.recentArticles.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            暂无文章，点击右上角新建一篇吧
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">标题</th>
                  <th className="py-2 pr-4">分类</th>
                  <th className="py-2 pr-4">状态</th>
                  <th className="py-2 pr-4">浏览</th>
                  <th className="py-2 pr-4">点赞</th>
                  <th className="py-2 pr-4">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {data.recentArticles.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <a
                        href={`/articles/${a.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        {a.title}
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {a.category?.name || "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          STATUS_COLORS[a.status]
                        }`}
                      >
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{a.views}</td>
                    <td className="py-2 pr-4 text-gray-600">{a.likes}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(a.createdAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
