import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryStats } from "@/components/inventory/inventory-stats"
export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
</div>

      <InventoryStats />
      <InventoryTable />
    </div>
  )
}
