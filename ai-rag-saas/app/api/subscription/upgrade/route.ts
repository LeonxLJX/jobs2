// 升级订阅接口（mock）/ Subscription upgrade (mock)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/api';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  // mock 升级：直接将 plan 标记为 pro，不接入真实支付
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { plan: 'pro' },
    select: { id: true, email: true, plan: true },
  });

  return ok({
    user: updated,
    message: '已升级为 Pro 会员，享受无限提问配额',
  });
}
