'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import type { DocumentItem } from '@/lib/types';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 加载文档列表
  async function loadDocs() {
    const res = await apiFetch<{ documents: DocumentItem[] }>('/api/documents');
    if (res.success && res.data) {
      setDocs(res.data.documents);
      setLoading(false);
    } else if (res.error?.includes('未登录') || res.error?.includes('401')) {
      router.push('/login');
    }
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 上传文件
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage(json.data.message || '上传成功');
        // 刷新列表
        await loadDocs();
        // 处理是异步的，2 秒后再刷新一次状态
        setTimeout(loadDocs, 2000);
      } else {
        setError(json.error || '上传失败');
      }
    } catch {
      setError('上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // 删除文档
  async function handleDelete(id: string) {
    if (!confirm('确定删除该文档？')) return;
    const res = await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.success) loadDocs();
    else setError(res.error || '删除失败');
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">加载中…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">文档管理</h1>

      {/* 上传区 */}
      <form
        onSubmit={handleUpload}
        className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-3 text-lg font-semibold">上传文档</h2>
        <p className="mb-3 text-sm text-gray-500">
          支持 .txt / .md 文件（PDF 暂为 mock 提示）。文件内容将被分块并向量化。
        </p>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown"
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {uploading ? '上传中…' : '上传'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </form>

      {/* 文档列表 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-semibold">我的文档（{docs.length}）</h2>
        </div>
        {docs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            还没有文档，上传一个开始吧
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-gray-800">
                      {doc.title}
                    </span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {doc.filename} · {doc.chunkCount} 个分块 ·{' '}
                    {new Date(doc.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="ml-3 text-sm text-gray-400 hover:text-red-500"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    processing: { text: '处理中', cls: 'bg-yellow-100 text-yellow-700' },
    ready: { text: '就绪', cls: 'bg-green-100 text-green-700' },
    failed: { text: '失败', cls: 'bg-red-100 text-red-700' },
  };
  const m = map[status] || { text: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${m.cls}`}>{m.text}</span>
  );
}
