import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Inventario</h1>
          <p className="text-muted-foreground mt-2">Gestiona el inventario de productos de tu florería</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <InventoryStats />
      <InventoryTable />
    </div>
  )
}
