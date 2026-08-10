import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// 操作日志中间件（记录关键写操作）/ Operation log middleware
@Injectable()
export class OperationLogMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    // 仅记录写操作 / Only log write operations
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next();
    }

    // 登录接口需要特殊处理（此时无 user）/ Login endpoint handled specially
    const isLogin = req.path.endsWith('/auth/login');
    const user = (req as any).user;
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';

    res.on('finish', () => {
      const status = res.statusCode;
      if (status >= 200 && status < 400) {
        const action = this.resolveAction(method, isLogin);
        const detail = isLogin ? '用户登录' : `${method} ${req.originalUrl}`;
        this.prisma.operationLog
          .create({
            data: {
              userId: user?.userId || null,
              username: user?.username || (isLogin ? (req.body?.username as string) : null),
              action,
              target: req.originalUrl,
              ip: String(ip),
              detail,
            },
          })
          .catch(() => void 0);
      }
    });

    next();
  }

  // 推断操作类型 / Resolve action type
  private resolveAction(method: string, isLogin: boolean): string {
    if (isLogin) return 'login';
    if (method === 'POST') return 'create';
    if (method === 'PUT') return 'update';
    if (method === 'DELETE') return 'delete';
    return 'other';
  }
}
