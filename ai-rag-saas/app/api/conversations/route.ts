// 会话列表接口 / Conversations list
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/api';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { messages: true } },
    },
  });

  return ok({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      messageCount: c._count.messages,
    })),
  });
}
