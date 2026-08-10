import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from './types';

// 基础地址 / Base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

// 请求拦截器：注入 token / Request interceptor: inject token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：解包统一响应 + 错误处理 / Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // code === 0 表示成功 / code 0 means success
    if (res.code === 0) {
      return res.data as any;
    }
    // 业务错误 / Business error
    ElMessage.error(res.message || 'Request failed');
    return Promise.reject(new Error(res.message || 'Request failed'));
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Network error';
    if (status === 401) {
      // 未授权，清除 token 并跳转登录 / Unauthorized, clear token and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      ElMessage.error('Session expired, please login again');
      // 避免在登录页重复跳转 / Avoid redirect loop on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      ElMessage.error(message);
    }
    return Promise.reject(error);
  },
);

export default request;
