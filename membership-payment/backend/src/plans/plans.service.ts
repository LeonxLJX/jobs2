/* ============================================================
 * Plans 服务 / Plans Service
 * 套餐列表
 * ============================================================ */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  // 获取所有上架套餐 / List active plans
  async listPlans() {
    const plans = await this.prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
    return plans.map((p) => ({
      ...p,
      features: JSON.parse(p.features),
    }));
  }

  // 按 code 查找 / Find by code
  async findByCode(code: string) {
    return this.prisma.membershipPlan.findUnique({ where: { code } });
  }

  // 按 id 查找 / Find by id
  async findById(id: string) {
    return this.prisma.membershipPlan.findUnique({ where: { id } });
  }
}
