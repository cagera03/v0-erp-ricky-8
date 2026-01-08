"use client"

import { useRouter } from "next/navigation"
import { SalesOrderForm } from "@/components/sales/sales-order-form"

export default function NewSalesOrderPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nueva Orden de Venta</h1>
          <p className="text-muted-foreground mt-1">Crear cotización u orden de venta</p>
        </div>
      </div>

      <SalesOrderForm
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
