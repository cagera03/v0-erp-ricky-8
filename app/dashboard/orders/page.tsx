import { redirect } from "next/navigation"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrdersStats } from "@/components/orders/orders-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function OrdersPage() {
  redirect("/dashboard/ventas/ordenes")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
<Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <OrdersStats />
      <OrdersTable />
    </div>
  )
}
