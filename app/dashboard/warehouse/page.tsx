"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Warehouse, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useWarehouseData } from "@/hooks/use-warehouse-data"
import { InventoryTab } from "@/components/warehouse/inventory-tab"
import { WarehousesTab } from "@/components/warehouse/warehouses-tab"
import { MovementsTab } from "@/components/warehouse/movements-tab"
import { TransfersTab } from "@/components/warehouse/transfers-tab"
import { PhysicalCountTab } from "@/components/warehouse/physical-count-tab"
import { ReportsTab } from "@/components/warehouse/reports-tab"

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState("inventory")
  const warehouseData = useWarehouseData()

  const { almacenesActivos, productosTotales, bajoPuntoReorden, valorTotalInventario, loading } = warehouseData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Almacén</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de múltiples almacenes, control de inventario y movimientos
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <Warehouse className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Almacenes Activos</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : almacenesActivos || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Package className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Productos Totales</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : productosTotales || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-sm text-muted-foreground">Bajo Punto Reorden</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : bajoPuntoReorden || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-sm text-muted-foreground">Valor Total Inventario</p>
            <p className="text-2xl font-bold mt-1">
              {loading
                ? "..."
                : `$${(valorTotalInventario || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="warehouses">Almacenes</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
          <TabsTrigger value="physical">Inv. Físico</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTab warehouseData={warehouseData} />
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <WarehousesTab warehouseData={warehouseData} />
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <MovementsTab warehouseData={warehouseData} />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <TransfersTab warehouseData={warehouseData} />
        </TabsContent>

        <TabsContent value="physical" className="space-y-4">
          <PhysicalCountTab warehouseData={warehouseData} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab warehouseData={warehouseData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
