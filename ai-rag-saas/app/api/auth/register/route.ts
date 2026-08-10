// 注册接口 / Register endpoint
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, TOKEN_COOKIE } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim() || null;

    if (!email || !password) {
      return fail('请填写邮箱和密码');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail('邮箱格式不正确');
    }
    if (password.length < 6) {
      return fail('密码长度至少 6 位');
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return fail('该邮箱已注册', 409);
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    const token = await signToken({ userId: user.id, email: user.email });

    const res = ok({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      token,
    });
    // 设置 cookie
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[register]', err);
    return fail('注册失败，请稍后重试', 500);
  }
}
