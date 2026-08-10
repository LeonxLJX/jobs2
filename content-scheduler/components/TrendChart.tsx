// 发布趋势图：使用纯 CSS 柱状图展示
"use client";

interface TrendItem {
  date: string;
  publishedCount: number;
  totalViews: number;
}

export default function TrendChart({ data }: { data: TrendItem[] }) {
  const max = Math.max(1, ...data.map((d) => d.publishedCount));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">最近 14 天发布趋势</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">暂无数据</p>
      ) : (
        <div className="flex items-end gap-1 h-48 border-b border-gray-200">
          {data.map((item) => {
            const height = (item.publishedCount / max) * 100;
            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                {/* 悬浮提示 */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {item.date}: {item.publishedCount} 篇
                </div>
                <div
                  className={`w-full max-w-[24px] rounded-t transition-all ${
                    item.publishedCount > 0
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${item.date}: ${item.publishedCount} 篇`}
                />
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{data[0]?.date?.slice(5) || ""}</span>
        <span>{data[data.length - 1]?.date?.slice(5) || ""}</span>
      </div>
    </div>
  );
}
