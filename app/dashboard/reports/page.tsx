import { ReportsOverview } from "@/components/reports/reports-overview"
import { FinancialReport } from "@/components/reports/financial-report"
import { InventoryReport } from "@/components/reports/inventory-report"
import { PerformanceReport } from "@/components/reports/performance-report"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
<ReportsOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialReport />
        <InventoryReport />
      </div>

      <PerformanceReport />
    </div>
  )
}
