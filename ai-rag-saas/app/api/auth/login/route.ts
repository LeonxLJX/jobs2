// 登录接口 / Login endpoint
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signToken, TOKEN_COOKIE } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return fail('请填写邮箱和密码');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return fail('邮箱或密码错误', 401);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return fail('邮箱或密码错误', 401);
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const res = ok({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      token,
    });
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[login]', err);
    return fail('登录失败，请稍后重试', 500);
  }
}
