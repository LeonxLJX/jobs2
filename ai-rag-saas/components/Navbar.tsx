'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import type { User } from '@/lib/types';

// 顶部导航栏：根据登录态展示不同菜单
export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 获取当前用户
  useEffect(() => {
    apiFetch<{ user: User }>('/api/me').then((res) => {
      if (res.success && res.data) setUser(res.data.user);
      setLoading(false);
    });
  }, [pathname]);

  // 登出
  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  }

  const links = [
    { href: '/', label: '首页' },
    { href: '/documents', label: '文档' },
    { href: '/chat', label: '问答' },
    { href: '/subscription', label: '会员' },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-brand-600">
            AI RAG SaaS
          </Link>
          {user &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm hover:text-brand-600 ${
                  pathname === l.href ? 'text-brand-600 font-medium' : 'text-gray-600'
                }`}
              >
                {l.label}
              </Link>
            ))}
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-gray-400">加载中…</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.email}
                <span
                  className={`ml-2 rounded px-2 py-0.5 text-xs ${
                    user.plan === 'pro'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {user.plan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-brand-600"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
