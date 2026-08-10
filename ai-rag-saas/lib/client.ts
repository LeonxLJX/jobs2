// 前端 fetch 封装：自动携带 cookie（token）
// Client-side fetch wrapper: auto-include credentials

export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      return { success: false, error: json.error || `请求失败 (${res.status})` };
    }
    return { success: true, data: json.data as T };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '网络错误',
    };
  }
}
