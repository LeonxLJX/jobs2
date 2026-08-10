'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/client';
import type { UsageData } from '@/lib/types';
import QuotaBar from '@/components/QuotaBar';

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch<UsageData>('/api/usage').then((res) => {
      if (res.success && res.data) {
        setUsage(res.data);
      } else {
        // 未登录则跳转登录
        router.push('/login');
      }
      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) {
    return <div className="p-8 text-center text-gray-400">加载中…</div>;
  }
  if (!usage) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">控制台</h1>

      {/* 配额卡片 */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <QuotaBar used={usage.quota.used} limit={usage.quota.limit} />
        {usage.quota.limit !== -1 && usage.quota.remaining === 0 && (
          <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-600">
            今日免费配额已用尽，{' '}
            <Link href="/subscription" className="underline">
              升级到 Pro
            </Link>{' '}
            解锁无限提问。
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="今日提问" value={usage.today.questionCount} />
        <StatCard label="今日上传" value={usage.today.uploadCount} />
        <StatCard label="文档总数" value={usage.totals.documentCount} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="累计提问次数" value={usage.totals.questionCount} />
        <StatCard label="累计上传次数" value={usage.totals.uploadCount} />
      </div>

      {/* 最近 7 天趋势 */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">最近 7 天提问趋势</h2>
        {usage.recent7.length === 0 ? (
          <p className="text-sm text-gray-400">暂无数据</p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {usage.recent7.map((d) => {
              const max = Math.max(
                ...usage.recent7.map((x) => x.questionCount),
                1
              );
              const h = (d.questionCount / max) * 100;
              return (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-1 text-xs text-gray-500">
                    {d.questionCount}
                  </span>
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${Math.max(h, 2)}%` }}
                  />
                  <span className="mt-1 text-xs text-gray-400">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 快捷入口 */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/documents"
          className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          上传文档
        </Link>
        <Link
          href="/chat"
          className="rounded border border-brand-600 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50"
        >
          开始问答
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
