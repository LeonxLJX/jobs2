import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/interfaces/common.interface';

// JWT 策略 / JWT strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-please-change-in-production',
    });
  }

  // 校验通过后将 user 挂到 request.user / Attach user to request after validation
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在 / User not found');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用 / Account disabled');
    }
    return {
      userId: user.id,
      username: user.username,
      name: user.name,
    };
  }
}
