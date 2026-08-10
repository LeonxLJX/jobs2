// 来源溯源卡片组件 / Source citation card
import type { Source } from '@/lib/types';

interface SourceCardProps {
  sources: Source[];
}

export default function SourceCard({ sources }: SourceCardProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-gray-500">📚 来源溯源</div>
      {sources.map((s, i) => (
        <div
          key={s.chunkId}
          className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {i + 1}. {s.documentTitle}
              <span className="ml-1 text-gray-400">#{s.chunkIndex}</span>
            </span>
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-600">
              相似度 {s.score}
            </span>
          </div>
          <p className="line-clamp-3 text-gray-600">{s.content}</p>
        </div>
      ))}
    </div>
  );
}
