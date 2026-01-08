import { redirect } from "next/navigation"
import { SalesStats } from "@/components/sales/sales-stats"
import { SalesChart } from "@/components/sales/sales-chart"
import { SalesTable } from "@/components/sales/sales-table"
import { CategorySales } from "@/components/sales/category-sales"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SalesPage() {
  redirect("/dashboard/ventas/ordenes")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ventas</h1>
          <p className="text-muted-foreground mt-2">Analiza el rendimiento de ventas de tu florería</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Venta
        </Button>
      </div>

      <SalesStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <CategorySales />
      </div>

      <SalesTable />
    </div>
  )
}
