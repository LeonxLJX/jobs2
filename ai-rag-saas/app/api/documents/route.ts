// 文档列表 & 上传接口 / Documents list & upload
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, fail, unauthorized } from '@/lib/api';
import { parseFileContent } from '@/lib/documentProcessor';
import { initQueue } from '@/lib/queue-init';
import { queue } from '@/lib/queue';

// 获取当前用户的文档列表
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  const docs = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      title: true,
      status: true,
      chunkCount: true,
      createdAt: true,
    },
  });
  return ok({ documents: docs });
}

// 上传文档：multipart/form-data，字段 file
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('authorization'));
  if (!user) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return fail('请上传文件（字段名 file）');
    }

    // 读取文本内容
    const rawText = await file.text();
    const { content, supported } = parseFileContent(file.name, file.type, rawText);

    // 文档标题：用文件名（去扩展名）
    const title = file.name.replace(/\.[^.]+$/, '');

    // 创建文档记录（status: processing）
    const doc = await prisma.document.create({
      data: {
        userId: user.id,
        filename: file.name,
        title,
        content,
        status: 'processing',
      },
    });

    // 注册队列 handler 并异步分块入库
    initQueue();
    queue.enqueue({
      id: doc.id,
      type: 'process_document',
      payload: { documentId: doc.id },
    });

    return ok(
      {
        document: {
          id: doc.id,
          filename: doc.filename,
          title: doc.title,
          status: doc.status,
        },
        supported,
        message: supported
          ? '文档已上传，正在后台分块处理'
          : '文档已接收，但当前版本仅支持 .txt / .md 全文解析',
      },
      201
    );
  } catch (err) {
    console.error('[documents POST]', err);
    return fail('上传失败', 500);
  }
}
