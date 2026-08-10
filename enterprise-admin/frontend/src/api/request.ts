import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { getToken, removeToken } from '@/utils/auth';
import router from '@/router';
import type { ApiResponse } from '@/types';

// axios 实例 / axios instance
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// 请求拦截器：携带 token / Request interceptor: attach token
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一解包 / Response interceptor: unified unwrap
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 业务错误码：0 成功 / Business code: 0 success
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败 / Request failed');
      // 401 未授权跳登录 / 401 redirect to login
      if (res.code === 401) {
        removeToken();
        router.push('/login');
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data as any;
  },
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message || '网络异常 / Network error';
    ElMessage.error(msg);
    // 401 跳登录 / 401 redirect to login
    if (status === 401) {
      removeToken();
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

// 封装请求方法 / Wrapped request methods
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, { params, ...config });
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config);
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config);
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config);
}

export default service;
