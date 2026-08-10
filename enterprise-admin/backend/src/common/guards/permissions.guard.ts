import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

// 权限守卫（按用户角色判断是否拥有权限码）/ Permission guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('未登录 / Not logged in');
    }

    // 超级管理员直接放行 / Super admin bypass
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!userWithRoles) {
      throw new ForbiddenException('用户不存在 / User not found');
    }
    const isSuper = userWithRoles.userRoles.some((ur) => ur.role.code === 'super_admin');
    if (isSuper) {
      return true;
    }

    // 收集该用户所有角色的权限码 / Collect permission codes of all user roles
    const roleIds = userWithRoles.userRoles.map((ur) => ur.roleId);
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });
    const codes = new Set(rolePerms.map((rp) => rp.permission.code));

    const ok = required.every((code) => codes.has(code));
    if (!ok) {
      throw new ForbiddenException('权限不足 / Insufficient permissions');
    }
    return true;
  }
}
