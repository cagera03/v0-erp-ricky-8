import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al sistema de gestión de tu florería</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <TopProducts />
      </div>

      <RecentOrders />
    </div>
  )
}
