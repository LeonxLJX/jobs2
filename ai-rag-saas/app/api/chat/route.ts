// 问答接口 / Chat endpoint
// POST body: { conversationId?, question } → { answer, sources, conversationId }
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, fail, unauthorized, notFound, forbidden, tooManyRequests } from '@/lib/api';
import { retrieveAndGenerate } from '@/lib/rag/mockRag';
import { checkQuota, incrementQuestionCount } from '@/lib/usage';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const question = String(body.question || '').trim();
    const conversationId = body.conversationId ? String(body.conversationId) : null;

    if (!question) {
      return fail('请输入问题');
    }

    // 检查配额
    const quota = await checkQuota(user.id);
    if (!quota.allowed) {
      return tooManyRequests(
        `今日提问次数已用尽（${quota.used}/${quota.limit}），升级到 Pro 可解锁无限提问`
      );
    }

    // 校验会话归属
    let conversation = null;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation) return notFound('会话不存在');
      if (conversation.userId !== user.id) return forbidden();
    } else {
      // 创建新会话，标题取问题前 20 字
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: question.slice(0, 20),
        },
      });
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: question,
        sources: '[]',
      },
    });

    // RAG 检索 + 生成回答
    const { answer, sources } = await retrieveAndGenerate(user.id, question);

    // 保存助手消息（含来源标注）
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: answer,
        sources: JSON.stringify(sources),
      },
    });

    // 增加提问计数
    await incrementQuestionCount(user.id);

    return ok({
      answer,
      sources,
      conversationId: conversation.id,
      quota: { ...quota, used: quota.used + 1 },
    });
  } catch (err) {
    console.error('[chat]', err);
    return fail('问答处理失败', 500);
  }
}
