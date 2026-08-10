/* ============================================================
 * Users 服务 / Users Service
 * 个人信息、会员状态、头像
 * ============================================================ */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 获取个人信息（含会员权益）/ Get profile with plan info
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        points: true,
        planExpireAt: true,
        lastSignDate: true,
        signStreak: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在 / User not found');
    }

    // 查询当前套餐权益 / Get plan features
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { code: user.plan },
    });

    return {
      ...user,
      planFeatures: plan ? JSON.parse(plan.features) : [],
      planName: plan?.name || user.plan,
    };
  }

  // 更新个人信息 / Update profile
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        points: true,
        planExpireAt: true,
        lastSignDate: true,
        signStreak: true,
        createdAt: true,
      },
    });
    return user;
  }

  // 更新头像（mock：直接保存 URL）/ Update avatar (mock: store URL)
  async updateAvatar(userId: string, avatar: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: { id: true, avatar: true },
    });
  }
}
