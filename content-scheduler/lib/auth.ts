// 认证模块：在 auth-core 基础上增加基于 Next.js cookie 的会话获取
import { cookies } from "next/headers";

export {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  TOKEN_COOKIE,
  COOKIE_MAX_AGE,
} from "./auth-core";

// 从请求 cookie 中获取当前登录用户
export async function getSession() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    // 动态引用避免在此模块顶层引入循环
    const { verifyToken } = await import("./auth-core");
    const payload = await verifyToken(token);
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
