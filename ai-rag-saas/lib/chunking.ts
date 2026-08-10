// 文本分块工具：按段落 + 固定字数分块
// Text chunking: split by paragraphs with fallback to fixed-size window

const CHUNK_SIZE = 500; // 每块约 500 字 / ~500 chars per chunk
const CHUNK_OVERLAP = 50; // 块间重叠字数，保证上下文连续性

// 主分块函数：先按段落切，超长段落再按字数切
export function chunkText(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const paragraphs = cleaned.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';

  for (const para of paragraphs) {
    // 段落本身超长：按字数滑窗切
    if (para.length > CHUNK_SIZE) {
      if (buffer) {
        chunks.push(buffer);
        buffer = '';
      }
      const pieces = slideWindow(para, CHUNK_SIZE, CHUNK_OVERLAP);
      chunks.push(...pieces);
      continue;
    }

    // 累积到约 CHUNK_SIZE
    if (buffer.length + para.length + 1 > CHUNK_SIZE) {
      chunks.push(buffer);
      buffer = para;
    } else {
      buffer = buffer ? `${buffer}\n${para}` : para;
    }
  }
  if (buffer) chunks.push(buffer);

  return chunks;
}

// 滑窗切分：用于超长段落
function slideWindow(text: string, size: number, overlap: number): string[] {
  const result: string[] = [];
  const step = Math.max(1, size - overlap);
  for (let i = 0; i < text.length; i += step) {
    result.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return result;
}
