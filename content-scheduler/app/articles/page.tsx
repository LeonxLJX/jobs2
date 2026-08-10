// 文章列表页：筛选 + 分页
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

interface Article {
  id: string;
  title: string;
  status: string;
  publishAt: string | null;
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  category: { name: string } | null;
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

export default function ArticlesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  const load = (p: number, s: string) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      pageSize: String(pageSize),
    });
    if (s) params.set("status", s);
    fetch(`/api/articles?${params}`)
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
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定删除《${title}》吗？`)) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      load(page, status);
    } else {
      alert("删除失败");
    }
  };

  const changeStatus = (s: string) => {
    setStatus(s);
    setPage(1);
    load(1, s);
  };

  const changePage = (p: number) => {
    setPage(p);
    load(p, status);
  };

  const statusFilters = [
    { value: "", label: "全部" },
    { value: "draft", label: "草稿" },
    { value: "scheduled", label: "定时中" },
    { value: "published", label: "已发布" },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {total} 篇文章</p>
        </div>
        <a
          href="/articles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          + 新建文章
        </a>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => changeStatus(f.value)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              status === f.value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">加载中...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            暂无文章，点击右上角新建一篇
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="py-3 px-4">标题</th>
                  <th className="py-3 px-4">分类</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">定时时间</th>
                  <th className="py-3 px-4">发布时间</th>
                  <th className="py-3 px-4">浏览</th>
                  <th className="py-3 px-4">点赞</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a
                        href={`/articles/${a.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        {a.title}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {a.category?.name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          STATUS_COLORS[a.status]
                        }`}
                      >
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {a.publishAt
                        ? new Date(a.publishAt).toLocaleString("zh-CN")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {a.publishedAt
                        ? new Date(a.publishedAt).toLocaleString("zh-CN")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{a.views}</td>
                    <td className="py-3 px-4 text-gray-600">{a.likes}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 text-xs">
                        <a
                          href={`/articles/${a.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          编辑
                        </a>
                        <button
                          onClick={() => handleDelete(a.id, a.title)}
                          className="text-red-600 hover:underline"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 分页 */}
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
