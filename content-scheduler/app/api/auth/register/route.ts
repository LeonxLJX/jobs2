// 注册接口
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, TOKEN_COOKIE, COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, notifyEmail } = await request.json();

    // 参数校验
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "邮箱、密码、用户名均为必填" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少 6 位" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    // 创建用户
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        notifyEmail: notifyEmail || email,
      },
    });

    // 签发 token 并设置 cookie
    const token = await signToken({ userId: user.id, email: user.email });
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "注册失败：" + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
