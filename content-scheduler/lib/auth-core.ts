// 认证核心：纯函数实现，不依赖 Next.js（可被独立脚本 cron/seed 安全引用）
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// 编码后的 JWT 密钥
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-fallback-secret-change-me"
);

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 密码比对
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 签发 JWT
export async function signToken(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secret);
}

// 校验 JWT
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; email: string };
}

// Cookie 名称与有效期
export const TOKEN_COOKIE = "token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 天
