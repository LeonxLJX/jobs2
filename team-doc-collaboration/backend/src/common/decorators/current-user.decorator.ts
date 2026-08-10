import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 从请求中提取当前登录用户 / Extract current user from request
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // 支持取单个字段 / Support extracting a single field
    return data ? user?.[data] : user;
  },
);
