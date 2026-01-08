"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Settings2, Package } from "lucide-react"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { useInventoryCalculations } from "@/hooks/use-inventory-calculations"
import { DemandPeriodSelector } from "@/components/inventory/demand-period-selector"
import { ColumnConfigModal } from "@/components/inventory/column-config-modal"

export function InventoryTab({ warehouseData }: { warehouseData: any }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const { preferences, savePreferences, loading: prefsLoading } = useUserPreferences()
  const { demandData, loading: demandLoading } = useInventoryCalculations(
    warehouseData.products,
    preferences.demandPeriodDays,
  )

  const filteredStock = (warehouseData.inventoryStock || []).filter(
    (stock: any) =>
      stock?.productoNombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock?.almacenNombre?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExport = () => {
    const headers = ["SKU", "Producto", "Almacén", "Stock", "Disponible", "Costo Promedio", "Valor Total"]
    const rows = filteredStock.map((s: any) => [
      s.sku || "",
      s.productoNombre || "",
      s.almacenNombre || "",
      s.cantidadActual || 0,
      s.cantidadDisponible || 0,
      (s.costoPromedio || 0).toFixed(2),
      ((s.cantidadActual || 0) * (s.costoPromedio || 0)).toFixed(2),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `inventario_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  const handlePeriodChange = async (newPeriod: number) => {
    await savePreferences({
      ...preferences,
      demandPeriodDays: newPeriod,
    })
  }

  const cols = preferences.visibleColumns
  const isLoading = warehouseData.loading || prefsLoading || demandLoading

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Consulta de Inventario</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar producto..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="icon" onClick={() => {}}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport} title="Exportar a CSV">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setConfigModalOpen(true)} title="Configurar columnas">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cols.avgDemand && (
          <div className="mb-4 flex items-center justify-end">
            <DemandPeriodSelector
              value={preferences.demandPeriodDays}
              onChange={handlePeriodChange}
              disabled={isLoading}
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando inventario...</div>
        ) : filteredStock.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? "No se encontraron productos" : "No hay inventario registrado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {cols.sku && <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">SKU</th>}
                  {cols.name && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                  )}
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Almacén</th>
                  {cols.stock && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                  )}
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Disponible</th>
                  {cols.minStock && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock Mín.</th>
                  )}
                  {cols.price && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Costo Prom.</th>
                  )}
                  {cols.avgDemand && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Demanda Prom. ({preferences.demandPeriodDays}d)
                    </th>
                  )}
                  {cols.suggestedOrder && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pedido Sugerido</th>
                  )}
                  {cols.status && (
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((stock: any) => {
                  const demand = demandData[stock.productoId]
                  const isLowStock = stock.cantidadActual <= (stock.minimoStock || 0)
                  const suggestedQty = demand?.suggestedOrder || 0
                  const suggestedAmount = suggestedQty * (stock.costoPromedio || 0)

                  return (
                    <tr key={stock.id} className="border-b last:border-0 hover:bg-muted/50">
                      {cols.sku && <td className="py-3 px-2 text-sm font-medium">{stock.sku || "-"}</td>}
                      {cols.name && <td className="py-3 px-2 text-sm font-medium">{stock.productoNombre}</td>}
                      <td className="py-3 px-2 text-sm text-muted-foreground">{stock.almacenNombre}</td>
                      {cols.stock && (
                        <td className="py-3 px-2">
                          <span className={`text-sm font-medium ${isLowStock ? "text-orange-600" : "text-foreground"}`}>
                            {stock.cantidadActual || 0}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-2 text-sm text-muted-foreground">{stock.cantidadDisponible || 0}</td>
                      {cols.minStock && (
                        <td className="py-3 px-2 text-sm text-muted-foreground">{stock.minimoStock || 0}</td>
                      )}
                      {cols.price && (
                        <td className="py-3 px-2 text-sm font-medium">${(stock.costoPromedio || 0).toFixed(2)}</td>
                      )}
                      {cols.avgDemand && (
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {demand ? demand.avgDemand30Days.toFixed(2) : "0.00"}
                        </td>
                      )}
                      {cols.suggestedOrder && (
                        <td className="py-3 px-2">
                          {suggestedQty > 0 ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {suggestedQty} unidades
                              </Badge>
                              <span className="text-xs text-muted-foreground">${suggestedAmount.toFixed(2)}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                OK
                              </Badge>
                              <span className="text-xs text-muted-foreground">$0.00</span>
                            </div>
                          )}
                        </td>
                      )}
                      {cols.status && (
                        <td className="py-3 px-2">
                          {isLowStock ? (
                            <Badge variant="destructive">Bajo Stock</Badge>
                          ) : (
                            <Badge variant="outline">Disponible</Badge>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <ColumnConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        preferences={preferences}
        onSave={savePreferences}
      />
    </Card>
  )
}
