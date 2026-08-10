import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

// JWT 算法与密钥编码
const ALG = 'HS256';
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me-in-production'
);
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT payload 类型
export interface JWTPayload {
  userId: string;
  email: string;
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 校验密码
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// 签发 JWT
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

// 校验并解析 JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// Cookie 名称
export const TOKEN_COOKIE = 'ai_rag_token';

// 从请求头获取当前用户（用于 API 路由鉴权）
// 返回 null 表示未登录或 token 无效
export async function getCurrentUser(
  authHeader?: string | null
): Promise<{ id: string; email: string; plan: string } | null> {
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    // 从 cookie 读取（SSR 场景）
    const cookieStore = cookies();
    token = cookieStore.get(TOKEN_COOKIE)?.value;
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // 从数据库确认用户仍然存在并取得最新 plan
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, plan: true },
  });

  return user;
}

// 获取 Bearer token（供 API 路由使用）
export function extractToken(authHeader?: string | null): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}
