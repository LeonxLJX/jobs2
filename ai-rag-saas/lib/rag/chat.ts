// 回答生成：Mock 模式（拼接相关片段 + 来源标注）+ 可选真实 Chat API
// Answer generation: mock (concatenate chunks + sources) + optional real chat API

import type { Source } from './mockRag';

// 判断是否启用真实 Chat API
export function isRealChatEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ===== Mock 回答生成 =====
// 拼接最相关的 chunk 片段作为答案，并标注来源
export function mockGenerateAnswer(
  question: string,
  context: string,
  sources: Source[]
): string {
  const lines: string[] = [];
  lines.push(`针对您的问题「${question}」，根据已上传文档检索到以下相关内容：`);
  lines.push('');
  lines.push(context);
  lines.push('');
  lines.push('—— 以上内容来源于您上传的文档片段，可作为参考。');
  return lines.join('\n');
}

// ===== 真实 Chat API（OpenAI 兼容）=====
export async function realGenerateAnswer(
  question: string,
  context: string,
  sources: Source[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.CHAT_MODEL || 'gpt-4o-mini';

  const systemPrompt = `你是一个基于 RAG 的文档问答助手。请严格根据下方提供的文档片段回答用户问题。若文档中没有相关信息，请说明"未在文档中找到相关内容"。回答末尾请简要说明依据的文档片段。
文档片段：
${context}`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat API 失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

// 统一入口：根据配置自动选择 mock 或真实
export async function generateAnswer(
  question: string,
  context: string,
  sources: Source[]
): Promise<string> {
  if (isRealChatEnabled()) {
    try {
      return await realGenerateAnswer(question, context, sources);
    } catch (err) {
      console.warn('[chat] 真实 API 失败，回退到 mock', err);
      return mockGenerateAnswer(question, context, sources);
    }
  }
  return mockGenerateAnswer(question, context, sources);
}
