import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth';
import { getToken, setToken, removeToken } from '@/utils/auth';
import type { UserInfo } from '@/types';

// 用户状态 / User store
export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken());
  const userInfo = ref<UserInfo | null>(null);

  // 登录 / Login
  async function login(username: string, password: string) {
    const res = await loginApi({ username, password });
    token.value = res.token;
    userInfo.value = res.user;
    setToken(res.token);
    return res;
  }

  // 登出 / Logout
  async function logout() {
    try {
      await logoutApi();
    } catch (e) {
      // 忽略登出接口错误 / Ignore logout api error
    }
    reset();
  }

  // 拉取用户信息 / Fetch profile
  async function fetchProfile() {
    const res = await getProfile();
    userInfo.value = res;
    return res;
  }

  // 重置 / Reset
  function reset() {
    token.value = null;
    userInfo.value = null;
    removeToken();
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchProfile,
    reset,
  };
});
