// 种子数据：1 个 free 用户 + 1 个示例文档 + 若干 chunk
// Seed data: 1 free user + 1 sample document + chunks

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { chunkText } from '../lib/chunking';
import { mockEmbed } from '../lib/rag/embedding';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始写入种子数据…');

  // 1. 创建 free 用户（user@example.com / user123）
  const hashed = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashed,
      name: '示例用户',
      plan: 'free',
    },
  });
  console.log(`✅ 用户已创建：${user.email}`);

  // 2. 示例文档内容（关于 RAG 的介绍）
  const content = `# RAG 检索增强生成简介

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合信息检索与生成模型的AI技术。它的核心思想是：在生成回答前，先从外部知识库中检索相关文档，然后将检索到的内容作为上下文输入给大语言模型，从而生成更准确、更可靠的回答。

## RAG 的工作流程

RAG 系统通常包含三个主要步骤。第一步是文档处理：将原始文档切分为较小的文本块（chunk），并为每个块生成向量嵌入（embedding）。第二步是检索：当用户提问时，将问题同样转化为向量，然后在向量数据库中检索最相关的文本块。第三步是生成：将检索到的文本块与原始问题一起拼接，作为上下文输入给大语言模型，生成最终回答。

## 向量嵌入的作用

向量嵌入是 RAG 系统的基础。它将文本转化为高维向量，使得语义相近的文本在向量空间中距离更近。常用的嵌入模型包括 OpenAI 的 text-embedding 系列、Cohere 的 embed 系列等。在 Mock 模式下，可以使用简单的关键词哈希向量来模拟这一过程，便于在没有 API Key 的情况下本地运行。

## 文本分块策略

文本分块（chunking）的质量直接影响检索效果。常见的分块策略包括：按段落分块、按固定字数分块、按句子分块等。一般每个块的大小在 300 到 800 字之间，块与块之间可以有一定的重叠，以保证上下文的连续性。本系统默认按段落分块，每块约 500 字。

## 来源溯源的重要性

RAG 系统的一个重要优势是可溯源。每个回答都可以标注其依据的文档片段，让用户能够验证答案的可靠性。这在企业知识库问答、法律文档检索等场景中尤为重要。本系统会在每个回答后附上来源文档名称和具体的分块编号。

## RAG 的应用场景

RAG 技术广泛应用于企业内部知识库问答、客服机器人、文档助手、智能搜索等场景。相比纯大模型，RAG 能够利用企业私有数据，回答更专业、更准确，同时避免模型幻觉问题。`;

  // 3. 分块
  const chunks = chunkText(content);
  console.log(`📄 文档分块数：${chunks.length}`);

  // 4. 删除旧的同名文档（便于重复 seed）
  const existing = await prisma.document.findFirst({
    where: { userId: user.id, filename: 'rag-intro.md' },
  });
  if (existing) {
    await prisma.document.delete({ where: { id: existing.id } });
  }

  // 5. 创建文档
  const doc = await prisma.document.create({
    data: {
      userId: user.id,
      filename: 'rag-intro.md',
      title: 'RAG 检索增强生成简介',
      content,
      status: 'ready',
      chunkCount: chunks.length,
    },
  });

  // 6. 为每个 chunk 生成 mock embedding 并入库
  for (let i = 0; i < chunks.length; i++) {
    const vec = mockEmbed(chunks[i]);
    await prisma.chunk.create({
      data: {
        documentId: doc.id,
        index: i,
        content: chunks[i],
        embedding: JSON.stringify(vec),
      },
    });
  }
  console.log(`✅ 文档已创建：${doc.title}（${chunks.length} 个分块）`);

  // 7. 创建一条示例会话
  const conv = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'RAG 是什么？',
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      role: 'user',
      content: 'RAG 是什么？',
      sources: '[]',
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      role: 'assistant',
      content:
        '针对您的问题「RAG 是什么？」，根据已上传文档检索到以下相关内容：RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合信息检索与生成模型的AI技术，核心思想是先检索再生成。',
      sources: JSON.stringify([
        {
          documentId: doc.id,
          documentTitle: doc.title,
          chunkId: 'seed-chunk-0',
          chunkIndex: 0,
          content: chunks[0].slice(0, 300),
          score: 0.85,
        },
      ]),
    },
  });
  console.log('✅ 示例会话已创建');

  console.log('\n🎉 种子数据写入完成！');
  console.log('   登录账号：user@example.com');
  console.log('   登录密码：user123');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据写入失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
