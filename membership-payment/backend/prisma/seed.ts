/* ============================================================
 * 种子数据 / Seed Data
 * 生成初始用户、套餐、订单、账单
 * 运行：npm run seed
 * ============================================================ */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始写入种子数据 / Seeding...');

  // 清空旧数据 / Clean old data
  await prisma.pointsLog.deleteMany();
  await prisma.signLog.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.order.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.user.deleteMany();

  // ---- 用户 / Users ----
  const userPwd = await bcrypt.hash('user123', 10);
  const adminPwd = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPwd,
      name: '普通用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      role: 'user',
      plan: 'free',
      points: 120,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPwd,
      name: '管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
      plan: 'enterprise',
      points: 9999,
    },
  });

  // ---- 套餐 / Plans ----
  const freePlan = await prisma.membershipPlan.create({
    data: {
      name: '免费版',
      code: 'free',
      price: 0,
      currency: 'usd',
      billingType: 'oneshot',
      interval: 'lifetime',
      features: JSON.stringify([
        '基础功能 / Basic features',
        '每日签到 / Daily check-in',
        '最多 100 条记录 / Max 100 records',
      ]),
      active: true,
    },
  });

  const proPlan = await prisma.membershipPlan.create({
    data: {
      name: '专业版 Pro',
      code: 'pro',
      price: 9.9,
      currency: 'usd',
      billingType: 'subscription',
      interval: 'month',
      features: JSON.stringify([
        '所有基础功能 / All basic features',
        '无限记录 / Unlimited records',
        '优先客服 / Priority support',
        '每月 200 积分 / 200 points per month',
      ]),
      active: true,
    },
  });

  const enterprisePlan = await prisma.membershipPlan.create({
    data: {
      name: '企业版 Enterprise',
      code: 'enterprise',
      price: 199,
      currency: 'usd',
      billingType: 'oneshot',
      interval: 'lifetime',
      features: JSON.stringify([
        '所有专业版功能 / All Pro features',
        '终身授权 / Lifetime license',
        '专属客户经理 / Dedicated account manager',
        'API 接入 / API access',
        '团队 10 席位 / 10 team seats',
      ]),
      active: true,
    },
  });

  // ---- 历史订单 / Historical Orders ----
  // 用户的一个已支付 Pro 订单 / A paid Pro order for the user
  const paidOrder = await prisma.order.create({
    data: {
      userId: user.id,
      planId: proPlan.id,
      amount: 9.9,
      currency: 'usd',
      status: 'paid',
      type: 'subscription',
      stripeSessionId: 'mock_session_seed_001',
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    },
  });

  // 一个待支付订单 / A pending order
  await prisma.order.create({
    data: {
      userId: user.id,
      planId: enterprisePlan.id,
      amount: 199,
      currency: 'usd',
      status: 'pending',
      type: 'oneshot',
      stripeSessionId: 'mock_session_seed_002',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  // ---- 账单 / Bills ----
  await prisma.bill.create({
    data: {
      userId: user.id,
      orderId: paidOrder.id,
      amount: 9.9,
      currency: 'usd',
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    },
  });

  // ---- 历史签到记录 / Historical Sign Logs ----
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
  yesterday.setHours(0, 0, 0, 0);
  await prisma.signLog.create({
    data: {
      userId: user.id,
      date: yesterday,
      pointsAwarded: 1,
    },
  });

  const dayBefore = new Date(Date.now() - 1000 * 60 * 60 * 48);
  dayBefore.setHours(0, 0, 0, 0);
  await prisma.signLog.create({
    data: {
      userId: user.id,
      date: dayBefore,
      pointsAwarded: 2,
    },
  });

  // ---- 积分记录 / Points Logs ----
  await prisma.pointsLog.create({
    data: {
      userId: user.id,
      change: 50,
      reason: '注册赠送 / Signup bonus',
      balance: 50,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
    },
  });
  await prisma.pointsLog.create({
    data: {
      userId: user.id,
      change: 1,
      reason: '每日签到 / Daily check-in',
      balance: 51,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  });
  await prisma.pointsLog.create({
    data: {
      userId: user.id,
      change: 1,
      reason: '每日签到 / Daily check-in',
      balance: 120,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });

  console.log('种子数据写入完成 / Seeding completed');
  console.log(`- 普通用户 / User: user@example.com / user123`);
  console.log(`- 管理员 / Admin: admin@example.com / admin123`);
}

main()
  .catch((e) => {
    console.error('种子数据写入失败 / Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
