/* ============================================================
 * Axios 请求封装 / HTTP Request Wrapper
 * 统一携带 JWT、统一处理 { code, message, data }
 * ============================================================ */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from '@/types';

const baseURL = '/api';

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

// 请求拦截：携带 token / Request interceptor: attach token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截：统一解包 / Response interceptor: unwrap {code, message, data}
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 兼容非标准响应（如 webhook 裸返回）/ Fallback for non-standard responses
    if (res && typeof res.code !== 'undefined') {
      if (res.code === 0) {
        return res.data;
      }
      // 业务错误 / Business error
      ElMessage.error(res.message || '请求失败 / Request failed');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res as any;
  },
  (error) => {
    // HTTP 错误 / HTTP error
    const msg = error?.response?.data?.message || error.message || '网络错误 / Network error';
    ElMessage.error(msg);

    // 401 跳登录 / 401 redirect to login
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 避免在登录页循环 / Avoid redirect loop on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default request;
