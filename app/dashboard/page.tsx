import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
<DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <TopProducts />
      </div>

      <RecentOrders />
    </div>
  )
}
