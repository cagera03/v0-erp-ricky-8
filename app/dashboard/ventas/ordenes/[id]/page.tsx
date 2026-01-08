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
        <div>
          <h1 className="text-3xl font-bold">Orden de Venta</h1>
          <p className="text-muted-foreground mt-1">Ver y editar orden de venta</p>
        </div>
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
