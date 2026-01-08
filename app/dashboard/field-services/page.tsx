"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import FieldServicesContent from "@/components/field-services/field-services-content"

export default function FieldServicesPage() {
  return (
    <Suspense fallback={<FieldServicesLoading />}>
      <FieldServicesContent />
    </Suspense>
  )
}

function FieldServicesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
