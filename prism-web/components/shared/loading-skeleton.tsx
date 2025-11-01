export function TableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-12 bg-gray-200 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-[300px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero metrics skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
