// 登出接口 / Logout endpoint
import { TOKEN_COOKIE } from '@/lib/auth';
import { ok } from '@/lib/api';

export async function POST() {
  const res = ok({ message: '已登出' });
  res.cookies.set(TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
