// 文档处理：解析上传文本 → 分块 → 生成 embedding → 入库
// Document processing: parse → chunk → embed → store

import { prisma } from './db';
import { chunkText } from './chunking';
import { embed } from './rag/embedding';
import { incrementUploadCount } from './usage';

// 解析文件内容为纯文本
// 支持类型：text/plain, text/markdown, .txt, .md
// PDF 等其他类型返回 mock 提示（保留接口，不真实解析）
export function parseFileContent(
  filename: string,
  mimeType: string,
  rawText: string
): { content: string; supported: boolean } {
  const lower = filename.toLowerCase();
  if (
    mimeType.startsWith('text/') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.md')
  ) {
    return { content: rawText, supported: true };
  }
  if (lower.endsWith('.pdf')) {
    // PDF mock：保留接口，提示用户使用文本类文件
    return {
      content: `[PDF 文件 "${filename}" 已接收，当前 MVP 版本暂未集成 PDF 解析库，请上传 .txt 或 .md 文件以获得完整问答能力。]`,
      supported: false,
    };
  }
  // 其他类型同样 mock
  return {
    content: `[文件 "${filename}" 已接收，当前 MVP 版本仅支持 .txt / .md 文件的全文解析。]`,
    supported: false,
  };
}

// 处理文档：分块 + 生成 embedding + 入库
// 由内存队列异步调用
export async function processDocument(documentId: string): Promise<void> {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return;

  try {
    // 1. 分块
    const chunks = chunkText(doc.content);
    // 2. 为每个 chunk 生成 embedding 并入库
    for (let i = 0; i < chunks.length; i++) {
      const vec = await embed(chunks[i]);
      await prisma.chunk.create({
        data: {
          documentId: doc.id,
          index: i,
          content: chunks[i],
          embedding: JSON.stringify(vec),
        },
      });
    }
    // 3. 更新文档状态为 ready
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ready', chunkCount: chunks.length },
    });
    // 4. 统计上传数
    await incrementUploadCount(doc.userId);
  } catch (err) {
    console.error('[processDocument] 处理失败', documentId, err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    });
  }
}
