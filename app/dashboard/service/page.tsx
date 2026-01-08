"use client"

import { Suspense } from "react"
import { ServicePageContent } from "@/components/service/service-page-content"

export default function ServicePage() {
  return (
    <Suspense fallback={<ServicePageSkeleton />}>
      <ServicePageContent />
    </Suspense>
  )
}

function ServicePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[400px] bg-muted animate-pulse rounded" />
        <div className="h-[400px] bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
