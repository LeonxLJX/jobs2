import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/api/types';
import * as authApi from '@/api/auth';
import { getMe } from '@/api/users';

// 认证 store / Auth store
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string>(localStorage.getItem('accessToken') || '');
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '');

  const isLoggedIn = computed(() => !!accessToken.value);
  const role = computed(() => user.value?.role || '');
  const isSuperAdmin = computed(() => role.value === 'super_admin');

  // 设置 token / Set tokens
  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  // 设置用户 / Set user
  function setUser(u: User | null) {
    user.value = u;
  }

  // 登录 / Login
  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    return res;
  }

  // 注册 / Register
  async function register(email: string, password: string, name: string) {
    const res = await authApi.register({ email, password, name });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    return res;
  }

  // 登出 / Logout
  async function logout() {
    try {
      await authApi.logout();
    } catch (e) {
      // 忽略登出接口错误 / Ignore logout API error
    }
    accessToken.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // 拉取当前用户信息 / Fetch current user profile
  async function fetchProfile() {
    if (!accessToken.value) return null;
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch (e) {
      setUser(null);
      return null;
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoggedIn,
    role,
    isSuperAdmin,
    setTokens,
    setUser,
    login,
    register,
    logout,
    fetchProfile,
  };
});
