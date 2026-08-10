import { SetMetadata } from '@nestjs/common';

// 角色元数据 key / Role metadata key
export const ROLES_KEY = 'roles';

// 标记接口所需的全局角色 / Marks required global roles for an endpoint
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
