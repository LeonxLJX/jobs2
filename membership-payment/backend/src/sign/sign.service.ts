/* ============================================================
 * Sign 服务 / Sign Service
 * 每日签到：7 天循环奖励 +1/+1/+2/+2/+3/+3/+5
 * 连续签到逻辑：断签则重置为第 1 天
 * ============================================================ */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 7 天奖励表 / 7-day reward table
const REWARD_TABLE = [1, 1, 2, 2, 3, 3, 5];

@Injectable()
export class SignService {
  constructor(private prisma: PrismaService) {}

  // 根据连续签到天数计算当日奖励 / Compute today's reward by streak
  private computeReward(streakDay: number): number {
    // streakDay 是 1-based，循环周期 7 天
    const idx = (streakDay - 1) % REWARD_TABLE.length;
    return REWARD_TABLE[idx];
  }

  // 获取用户今日签到状态 / Today status
  async getTodayStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastSignDate: true, signStreak: true, points: true },
    });
    const today = this.startOfDay(new Date());
    const lastSign = user?.lastSignDate ? this.startOfDay(new Date(user.lastSignDate)) : null;
    const signedToday = lastSign ? lastSign.getTime() === today.getTime() : false;

    // 预测下一次签到的天数和奖励 / Predict next streak & reward
    let nextStreakDay: number;
    if (signedToday) {
      // 今天已签，下次是明天，需要判断明天会不会断签
      nextStreakDay = user.signStreak + 1;
    } else if (lastSign) {
      // 判断是否昨天签到过 / Whether signed yesterday
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      nextStreakDay = lastSign.getTime() === yesterday.getTime() ? (user.signStreak + 1) : 1;
    } else {
      nextStreakDay = 1;
    }

    return {
      signedToday,
      signStreak: user?.signStreak || 0,
      points: user?.points || 0,
      nextReward: this.computeReward(nextStreakDay),
      nextStreakDay,
      rewardTable: REWARD_TABLE,
    };
  }

  // 执行签到 / Check-in
  async checkin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, lastSignDate: true, signStreak: true, points: true },
    });

    const today = this.startOfDay(new Date());
    const lastSign = user.lastSignDate ? this.startOfDay(new Date(user.lastSignDate)) : null;

    if (lastSign && lastSign.getTime() === today.getTime()) {
      throw new BadRequestException('今日已签到 / Already signed in today');
    }

    // 计算连续签到天数 / Compute streak day
    let streakDay: number;
    if (lastSign) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (lastSign.getTime() === yesterday.getTime()) {
        // 连续 / Consecutive
        streakDay = user.signStreak + 1;
      } else {
        // 断签重置 / Streak broken, reset
        streakDay = 1;
      }
    } else {
      streakDay = 1;
    }

    const reward = this.computeReward(streakDay);
    const newPoints = user.points + reward;

    // 事务：写签到日志、积分日志、更新用户 / Transaction
    const [signLog] = await this.prisma.$transaction([
      // 签到日志 / Sign log
      this.prisma.signLog.create({
        data: {
          userId,
          date: today,
          pointsAwarded: reward,
        },
      }),
      // 积分日志 / Points log
      this.prisma.pointsLog.create({
        data: {
          userId,
          change: reward,
          reason: `每日签到 第 ${streakDay} 天 / Daily check-in day ${streakDay}`,
          balance: newPoints,
        },
      }),
      // 更新用户 / Update user
      this.prisma.user.update({
        where: { id: userId },
        data: {
          lastSignDate: today,
          signStreak: streakDay,
          points: newPoints,
        },
      }),
    ]);

    return {
      signLog,
      reward,
      streakDay,
      newPoints,
      message: `签到成功，获得 ${reward} 积分 / Check-in success, +${reward} points`,
    };
  }

  // 签到历史 / Sign history
  async getHistory(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const logs = await this.prisma.signLog.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      orderBy: { date: 'desc' },
    });
    return logs;
  }

  // 把日期截断到当天 0 点 / Truncate to start of day
  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
}
