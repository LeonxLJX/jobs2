/* ============================================================
 * Auth 服务 / Auth Service
 * 注册 / 登录 / 登出 / 修改密码
 * ============================================================ */
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { JwtPayload } from '../common/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 注册 / Register
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('邮箱已被注册 / Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.email)}`,
        plan: 'free',
        points: 50, // 注册赠送 50 积分 / 50 points signup bonus
      },
    });

    // 记录积分赠送 / Log points bonus
    await this.prisma.pointsLog.create({
      data: {
        userId: user.id,
        change: 50,
        reason: '注册赠送 / Signup bonus',
        balance: 50,
      },
    });

    const token = await this.signToken(user.id, user.email, user.role);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // 登录 / Login
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误 / Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('邮箱或密码错误 / Invalid email or password');
    }
    const token = await this.signToken(user.id, user.email, user.role);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // 登出（无状态 JWT，前端清除即可）/ Logout (stateless JWT, frontend clears token)
  async logout() {
    return { message: '已登出 / Logged out' };
  }

  // 修改密码 / Change Password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在 / User not found');
    }
    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) {
      throw new UnauthorizedException('旧密码错误 / Old password incorrect');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: '密码修改成功 / Password changed' };
  }

  // 签发 JWT / Sign JWT
  private async signToken(userId: string, email: string, role: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email, role };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    return this.jwtService.sign(payload, { expiresIn });
  }

  // 移除敏感字段 / Remove sensitive fields
  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
