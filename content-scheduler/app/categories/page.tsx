// 分类管理页面
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { articles: number };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/categories")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setItems(d.categories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("分类名称为必填");
      return;
    }
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    setName("");
    setDescription("");
    load();
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description || "");
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      setError("更新失败");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除分类「${name}」吗？关联文章将变为无分类`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      setError("删除失败");
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">分类管理</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 新建分类 */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">新建分类</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              创建
            </button>
          </form>
        </div>

        {/* 分类列表 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">分类列表</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">加载中...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无分类</p>
          ) : (
            <div className="space-y-3">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-md p-4 flex items-start justify-between"
                >
                  {editingId === c.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(c.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border rounded text-xs"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {c.description || "无描述"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {c._count.articles} 篇文章 ·{" "}
                          {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-blue-600 hover:underline"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="text-red-600 hover:underline"
                        >
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
