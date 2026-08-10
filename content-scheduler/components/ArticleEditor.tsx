// 文章编辑器组件：标题 + 分类 + 内容 + markdown 预览 + 状态操作
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";

interface Category {
  id: string;
  name: string;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  categoryId: string | null;
  status: string;
  publishAt: string | null;
  views: number;
  likes: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  scheduled: "定时中",
  published: "已发布",
};

export default function ArticleEditor({
  articleId,
}: {
  articleId?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(articleId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishAt, setPublishAt] = useState("");
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 加载分类列表
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCategories(d.categories))
      .catch(() => {});
  }, []);

  // 编辑模式加载文章
  useEffect(() => {
    if (!articleId) return;
    fetch(`/api/articles/${articleId}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.article) {
          const a: ArticleData = d.article;
          setTitle(a.title);
          setContent(a.content);
          setExcerpt(a.excerpt || "");
          setCategoryId(a.categoryId || "");
          setStatus(a.status);
          setViews(a.views);
          setLikes(a.likes);
          if (a.publishAt) {
            // 转为 datetime-local 可用格式
            const dt = new Date(a.publishAt);
            const pad = (n: number) => String(n).padStart(2, "0");
            setPublishAt(
              `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
                dt.getDate()
              )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
            );
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [articleId, router]);

  // markdown 预览 HTML
  const previewHtml = useMemo(() => markdownToHtml(content), [content]);

  // 保存草稿 / 更新
  const save = async (overrideStatus?: string) => {
    setError("");
    setMessage("");
    if (!title.trim() || !content.trim()) {
      setError("标题和内容为必填");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title,
        content,
        excerpt,
        categoryId: categoryId || null,
        status: overrideStatus || status,
      };
      const res = await fetch(
        isEdit ? `/api/articles/${articleId}` : "/api/articles",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }
      if (!isEdit && data.article) {
        // 新建后跳转到编辑页
        router.push(`/articles/${data.article.id}/edit`);
        return;
      }
      if (overrideStatus) setStatus(overrideStatus);
      setMessage("保存成功");
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  // 立即发布
  const publishNow = async () => {
    if (!articleId) {
      // 新建时先保存为草稿再发布
      await save("draft");
      // articleId 此时未知，提示先保存
      setError("请先保存文章后再发布");
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发布失败");
        return;
      }
      setStatus("published");
      setMessage("已立即发布");
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  // 设置定时发布
  const schedule = async () => {
    if (!articleId) {
      setError("请先保存文章为草稿后再设置定时");
      return;
    }
    if (!publishAt) {
      setError("请选择定时发布时间");
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "设置定时失败");
        return;
      }
      setStatus("scheduled");
      setMessage("定时发布已设置，等待 cron 执行");
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  // 点赞 +1
  const handleLike = async () => {
    if (!articleId) return;
    const res = await fetch(`/api/articles/${articleId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setLikes(data.likes);
    }
  };

  if (loading) {
    return <p className="text-gray-500">加载中...</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}
      {message && (
        <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
          {message}
        </div>
      )}

      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 分类 + 摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">无分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            摘要
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="一句话摘要（可选）"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 状态信息 */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          当前状态：
          <span className="font-medium">{STATUS_LABELS[status] || status}</span>
        </span>
        {isEdit && (
          <>
            <span>浏览：{views}</span>
            <button
              onClick={handleLike}
              className="text-pink-600 hover:underline"
            >
              点赞 {likes}
            </button>
          </>
        )}
      </div>

      {/* 内容编辑 + 预览切换 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            内容（Markdown）
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showPreview ? "切换到编辑" : "切换到预览"}
          </button>
        </div>
        {showPreview ? (
          <div
            className="prose-preview w-full min-h-[320px] px-3 py-2 border rounded-md bg-gray-50 overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# 标题&#10;&#10;正文内容，支持 **粗体**、*斜体*、`代码`、- 列表等 Markdown 语法"
            rows={14}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        )}
      </div>

      {/* 定时发布时间 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          定时发布时间
        </label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          设置后点击「设置定时」按钮，需另开终端运行 npm run cron
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => save("draft")}
          disabled={saving}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
        >
          {saving ? "保存中..." : "保存草稿"}
        </button>
        <button
          onClick={schedule}
          disabled={saving}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 text-sm"
        >
          设置定时
        </button>
        <button
          onClick={publishNow}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          立即发布
        </button>
        <button
          onClick={() => router.push("/articles")}
          className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          返回列表
        </button>
      </div>
    </div>
  );
}
