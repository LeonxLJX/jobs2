import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from '../common/interfaces/common.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 登录 / Login
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误 / Invalid credentials');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用 / Account disabled');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误 / Invalid credentials');
    }

    // 收集用户角色 / Collect user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });
    const roles = userRoles.map((ur) => ur.role.code);

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: '',
        roles,
      },
    };
  }

  // 登出（前端丢弃 token 即可，此处返回成功）/ Logout
  async logout() {
    return { success: true };
  }

  // 获取当前用户信息（含角色）/ Get current user profile
  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在 / User not found');
    }
    const roles = user.userRoles.map((ur) => ur.role.code);
    // 收集该用户所有权限码 / Collect all permission codes
    const roleIds = user.userRoles.map((ur) => ur.roleId);
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });
    const permissions = Array.from(new Set(rolePerms.map((rp) => rp.permission.code)));
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: '',
      roles,
      permissions,
    };
  }

  // 获取用户菜单树 / Get user menu tree
  async menus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在 / User not found');
    }
    const isSuper = user.userRoles.some((ur) => ur.role.code === 'super_admin');

    let menus: any[];
    if (isSuper) {
      // 超管：全部菜单 / Super admin: all menus
      menus = await this.prisma.permission.findMany({
        where: { type: 'menu' },
        orderBy: [{ sort: 'asc' }],
      });
    } else {
      const roleIds = user.userRoles.map((ur) => ur.roleId);
      const rolePerms = await this.prisma.rolePermission.findMany({
        where: { roleId: { in: roleIds }, permission: { type: 'menu' } },
        include: { permission: true },
      });
      menus = rolePerms.map((rp) => rp.permission);
      // 去重 / Deduplicate
      const seen = new Set<string>();
      menus = menus.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
    }

    // 同时返回该用户的按钮权限码 / Also return button permission codes
    let buttonCodes: string[] = [];
    if (isSuper) {
      const btns = await this.prisma.permission.findMany({ where: { type: 'button' } });
      buttonCodes = btns.map((b) => b.code);
    } else {
      const roleIds = user.userRoles.map((ur) => ur.roleId);
      const rolePerms = await this.prisma.rolePermission.findMany({
        where: { roleId: { in: roleIds }, permission: { type: 'button' } },
        include: { permission: true },
      });
      buttonCodes = Array.from(new Set(rolePerms.map((rp) => rp.permission.code)));
    }

    // 构建菜单树 / Build menu tree
    const tree = this.buildTree(menus, null);
    return { menus: tree, permissions: buttonCodes };
  }

  // 递归构建菜单树 / Build menu tree recursively
  private buildTree(list: any[], parentId: string | null): any[] {
    return list
      .filter((item) => (item.parentId || null) === (parentId || null))
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        type: item.type,
        path: item.path,
        component: item.component,
        icon: item.icon,
        sort: item.sort,
        children: this.buildTree(list, item.id),
      }))
      .sort((a, b) => a.sort - b.sort);
  }

  // 修改密码 / Change password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在 / User not found');
    }
    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) {
      throw new BadRequestException('原密码错误 / Old password incorrect');
    }
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { success: true };
  }
}
