'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ClientsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
