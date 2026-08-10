// 配额进度条组件 / Quota progress bar
interface QuotaBarProps {
  used: number;
  limit: number; // -1 表示无限
}

export default function QuotaBar({ used, limit }: QuotaBarProps) {
  if (limit === -1) {
    return (
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">今日提问</span>
          <span className="font-medium text-amber-600">
            Pro 会员 · 无限提问（已用 {used}）
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400" />
      </div>
    );
  }

  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const remaining = Math.max(0, limit - used);
  const color =
    pct >= 100
      ? 'bg-red-500'
      : pct >= 80
        ? 'bg-orange-500'
        : 'bg-brand-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">今日提问配额</span>
        <span className="font-medium text-gray-700">
          {used} / {limit}（剩余 {remaining}）
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
