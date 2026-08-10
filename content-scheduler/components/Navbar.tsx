// 导航栏组件
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <a href="/" className="font-bold text-lg text-blue-600">
              ContentScheduler
            </a>
            {user && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <a href="/" className="text-gray-700 hover:text-blue-600">
                  仪表盘
                </a>
                <a href="/articles" className="text-gray-700 hover:text-blue-600">
                  文章
                </a>
                <a href="/categories" className="text-gray-700 hover:text-blue-600">
                  分类
                </a>
                <a href="/logs" className="text-gray-700 hover:text-blue-600">
                  日志
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  登出
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                登录
              </a>
            )}
            {/* 移动端菜单按钮 */}
            {user && (
              <button
                className="sm:hidden p-1"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* 移动端菜单 */}
        {user && menuOpen && (
          <div className="sm:hidden pb-3 space-y-1">
            <a href="/" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">仪表盘</a>
            <a href="/articles" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">文章</a>
            <a href="/categories" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">分类</a>
            <a href="/logs" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">日志</a>
          </div>
        )}
      </div>
    </nav>
  );
}
