import { SetMetadata } from '@nestjs/common';

// 公开接口标记（无需登录）/ Public route marker (no auth required)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
