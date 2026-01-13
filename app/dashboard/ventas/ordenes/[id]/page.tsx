"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { SalesOrderForm } from "@/components/sales/sales-order-form"

export default function EditSalesOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
</div>

      <SalesOrderForm
        salesOrderId={id}
        onSuccess={(orderId) => {
          router.push(`/dashboard/ventas/ordenes/${orderId}`)
        }}
        onCancel={() => {
          router.push("/dashboard/ventas/ordenes")
        }}
      />
    </div>
  )
}
