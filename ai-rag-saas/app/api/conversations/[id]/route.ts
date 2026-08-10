// 单个会话详情接口 / Conversation detail (含消息历史)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, unauthorized, notFound, forbidden } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) return notFound('会话不存在');
  if (conversation.userId !== user.id) return forbidden();

  return ok({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: JSON.parse(m.sources || '[]'),
        createdAt: m.createdAt,
      })),
    },
  });
}
