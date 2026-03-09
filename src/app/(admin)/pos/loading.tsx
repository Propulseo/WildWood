import { Skeleton } from '@/components/ui/skeleton'

export default function PosLoading() {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-4 h-full">
      {/* Product grid skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Cart sidebar skeleton */}
      <div className="border-l border-border p-4 flex flex-col">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-3 mt-4 flex-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
        <div className="pt-4 border-t border-border">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
