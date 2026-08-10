// 单个文档详情接口 / Document detail
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, fail, unauthorized, notFound, forbidden } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      chunks: {
        select: { id: true, index: true, content: true },
        orderBy: { index: 'asc' },
      },
    },
  });

  if (!doc) return notFound('文档不存在');
  if (doc.userId !== user.id) return forbidden();

  return ok({
    document: {
      id: doc.id,
      filename: doc.filename,
      title: doc.title,
      content: doc.content,
      status: doc.status,
      chunkCount: doc.chunkCount,
      createdAt: doc.createdAt,
      chunks: doc.chunks,
    },
  });
}

// 删除文档
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return notFound('文档不存在');
  if (doc.userId !== user.id) return forbidden();

  await prisma.document.delete({ where: { id: params.id } });
  return ok({ message: '文档已删除' });
}
