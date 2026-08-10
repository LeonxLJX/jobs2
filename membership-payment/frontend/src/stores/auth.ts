/* ============================================================
 * Auth Store / 认证状态
 * ============================================================ */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/api/auth';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  );

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // 设置登录态 / Set auth state
  function setAuth(t: string, u: User) {
    token.value = t;
    user.value = u;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }

  // 登录 / Login
  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password });
    setAuth(res.token, res.user);
    return res;
  }

  // 注册 / Register
  async function register(email: string, password: string, name: string) {
    const res = await authApi.register({ email, password, name });
    setAuth(res.token, res.user);
    return res;
  }

  // 登出 / Logout
  async function logout() {
    try {
      await authApi.logout();
    } catch (e) {
      // 忽略登出接口错误 / Ignore logout API error
    }
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 更新本地用户信息 / Update local user
  function updateUser(u: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...u };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    setAuth,
    login,
    register,
    logout,
    updateUser,
  };
});
