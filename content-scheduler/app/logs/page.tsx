// 发布日志页面
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

interface LogItem {
  id: string;
  articleId: string;
  status: string;
  message: string;
  executedAt: string;
  article: { title: string } | null;
}

export default function LogsPage() {
  const router = useRouter();
  const [items, setItems] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const load = (p: number) => {
    setLoading(true);
    fetch(`/api/logs?page=${p}&pageSize=${pageSize}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setItems(d.items);
          setTotal(d.total);
          setTotalPages(d.totalPages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePage = (p: number) => {
    setPage(p);
    load(p);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">发布日志</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {total} 条记录（cron 与手动发布都会记录）
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">加载中...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-gray-500">暂无日志记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="py-3 px-4">文章</th>
                  <th className="py-3 px-4">结果</th>
                  <th className="py-3 px-4">消息</th>
                  <th className="py-3 px-4">执行时间</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a
                        href={`/articles/${l.articleId}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        {l.article?.title || "（已删除）"}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          l.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {l.status === "success" ? "成功" : "失败"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{l.message}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(l.executedAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">
              第 {page} / {totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => changePage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
