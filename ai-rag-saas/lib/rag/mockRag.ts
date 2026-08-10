// Mock RAG 检索：用户提问 → 检索相关 chunk → 拼接上下文
// Mock RAG retrieval: question → retrieve chunks → assemble context

import { prisma } from '../db';
import { embed, cosineSimilarity, isRealEmbeddingEnabled } from './embedding';
import { generateAnswer } from './chat';

// 来源标注类型
export interface Source {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkIndex: number;
  content: string; // 命中的 chunk 片段（截断）
  score: number; // 相似度得分
}

// RAG 检索 + 生成回答的结果
export interface RagResult {
  answer: string;
  sources: Source[];
}

// 检索用户所有 ready 文档的 chunk，按相似度排序，取 top-k
const TOP_K = 4;

export async function retrieveAndGenerate(
  userId: string,
  question: string
): Promise<RagResult> {
  // 1. 取用户所有 ready 文档及其 chunk
  const documents = await prisma.document.findMany({
    where: { userId, status: 'ready' },
    include: { chunks: true },
  });

  if (documents.length === 0 || documents.every((d) => d.chunks.length === 0)) {
    return {
      answer:
        '当前没有可用的文档。请先在「文档」页面上传 .txt 或 .md 文件，上传完成后即可提问。',
      sources: [],
    };
  }

  // 2. 对问题做 embedding
  const questionVec = await embed(question);

  // 3. 计算每个 chunk 的相似度
  const scored: Array<{ chunk: (typeof documents)[0]['chunks'][0]; doc: (typeof documents)[0]; score: number }> = [];
  for (const doc of documents) {
    for (const chunk of doc.chunks) {
      let chunkVec: number[];
      try {
        chunkVec = JSON.parse(chunk.embedding);
      } catch {
        continue;
      }
      const score = cosineSimilarity(questionVec, chunkVec);
      scored.push({ chunk, doc, score });
    }
  }

  // 4. 取 top-k
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, TOP_K);

  if (top.length === 0 || top[0].score <= 0) {
    return {
      answer: '未能在已上传文档中找到与该问题相关的内容，请尝试更换提问方式或上传更多文档。',
      sources: [],
    };
  }

  // 5. 组装来源
  const sources: Source[] = top.map((t) => ({
    documentId: t.doc.id,
    documentTitle: t.doc.title,
    chunkId: t.chunk.id,
    chunkIndex: t.chunk.index,
    content: t.chunk.content.slice(0, 300),
    score: Number(t.score.toFixed(4)),
  }));

  // 6. 拼接上下文
  const context = top
    .map((t, i) => `[片段${i + 1} - 来源：${t.doc.title}#${t.chunk.index}]\n${t.chunk.content}`)
    .join('\n\n');

  // 7. 生成回答（mock 或真实 chat API）
  const answer = await generateAnswer(question, context, sources);

  return { answer, sources };
}

// 对外暴露是否使用真实模型，供调试
export function ragMode(): 'mock' | 'real' {
  return isRealEmbeddingEnabled() ? 'real' : 'mock';
}
