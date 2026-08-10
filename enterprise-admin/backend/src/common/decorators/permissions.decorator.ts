import { SetMetadata } from '@nestjs/common';

// 权限装饰器（按钮/接口级）/ Permission decorator (button/api level)
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
