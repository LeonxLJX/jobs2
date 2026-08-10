// 向量嵌入：Mock 模式（关键词哈希向量）+ 可选真实 OpenAI 兼容 API
// Embedding: mock (keyword hash vector) + optional real OpenAI-compatible API

const VECTOR_DIM = 256; // mock 向量维度

// 判断是否启用真实 Embedding API
export function isRealEmbeddingEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ===== Mock Embedding =====
// 将文本转为固定维度向量：对每个 token 哈希到某一维度并累加，最后归一化
export function mockEmbed(text: string): number[] {
  const vec = new Array(VECTOR_DIM).fill(0);
  const tokens = tokenize(text);
  for (const tok of tokens) {
    // 简单字符串哈希
    let hash = 0;
    for (let i = 0; i < tok.length; i++) {
      hash = (hash * 31 + tok.charCodeAt(i)) >>> 0;
    }
    const idx = hash % VECTOR_DIM;
    // 用 token 长度加权，提升有意义词的权重
    vec[idx] += 1 + Math.log(tok.length);
  }
  // L2 归一化
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

// 分词：英文按空格/标点，中文按单字
export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  // 提取英文单词（>=2 字符）和中文字符
  const enWords = lower.match(/[a-z]{2,}/g) || [];
  const cnChars = lower.match(/[\u4e00-\u9fa5]/g) || [];
  // 中文按相邻字符组成 bi-gram，提升语义匹配
  const cnBigrams: string[] = [];
  for (let i = 0; i < cnChars.length - 1; i++) {
    cnBigrams.push(cnChars[i] + cnChars[i + 1]);
  }
  return [...enWords, ...cnChars, ...cnBigrams];
}

// ===== 真实 Embedding API =====
export async function realEmbed(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Embedding API 失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.data[0].embedding as number[];
}

// 统一入口：根据配置自动选择 mock 或真实
export async function embed(text: string): Promise<number[]> {
  if (isRealEmbeddingEnabled()) {
    try {
      return await realEmbed(text);
    } catch (err) {
      console.warn('[embed] 真实 API 失败，回退到 mock', err);
      return mockEmbed(text);
    }
  }
  return mockEmbed(text);
}

// 余弦相似度
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
