'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import type { User } from '@/lib/types';

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    apiFetch<{ user: User }>('/api/me').then((res) => {
      if (res.success && res.data) setUser(res.data.user);
      else router.push('/login');
      setAuthChecked(true);
    });
  }, [router]);

  async function handleUpgrade() {
    setUpgrading(true);
    const res = await apiFetch<{ user: User }>('/api/subscription/upgrade', {
      method: 'POST',
    });
    setUpgrading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      setMessage('🎉 升级成功！您现在是 Pro 会员，享受无限提问');
    } else {
      setMessage(res.error || '升级失败');
    }
  }

  if (!authChecked) {
    return <div className="p-8 text-center text-gray-400">加载中…</div>;
  }
  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">会员订阅</h1>
      <p className="mb-6 text-sm text-gray-500">
        当前方案：
        <span
          className={`ml-1 rounded px-2 py-0.5 text-xs ${
            user.plan === 'pro'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {user.plan === 'pro' ? 'Pro' : 'Free'}
        </span>
      </p>

      {message && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Free 免费版</h2>
          <div className="mt-3 text-3xl font-bold">
            ¥0<span className="text-sm font-normal text-gray-400">/月</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✓ 每日 10 次提问</li>
            <li>✓ 文档上传与分块</li>
            <li>✓ 基础 RAG 检索</li>
            <li>✓ 来源溯源标注</li>
            <li className="text-gray-400">✗ 无限提问</li>
          </ul>
          <div className="mt-6">
            <button
              disabled
              className="w-full cursor-not-allowed rounded border border-gray-300 py-2 text-sm text-gray-400"
            >
              当前方案
            </button>
          </div>
        </div>

        {/* Pro */}
        <div className="relative rounded-lg border-2 border-amber-400 bg-white p-6 shadow-sm">
          <span className="absolute -top-3 right-4 rounded bg-amber-400 px-2 py-0.5 text-xs text-white">
            推荐
          </span>
          <h2 className="text-lg font-semibold text-amber-600">Pro 专业版</h2>
          <div className="mt-3 text-3xl font-bold">
            ¥39<span className="text-sm font-normal text-gray-400">/月</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✓ 无限提问</li>
            <li>✓ 文档上传与分块</li>
            <li>✓ 高级 RAG 检索</li>
            <li>✓ 来源溯源标注</li>
            <li>✓ 优先支持</li>
          </ul>
          <div className="mt-6">
            {user.plan === 'pro' ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded bg-amber-100 py-2 text-sm text-amber-600"
              >
                已是 Pro 会员
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full rounded bg-amber-500 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {upgrading ? '升级中…' : '升级到 Pro（Mock）'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        * 当前为 MVP 演示版，升级为 mock 标记，不接入真实支付。
      </p>
    </div>
  );
}
