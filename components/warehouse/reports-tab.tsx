"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, BarChart3, TrendingUp, Package, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export function ReportsTab({ warehouseData }: { warehouseData: any }) {
  const {
    almacenesActivos,
    productosTotales,
    bajoPuntoReorden,
    valorTotalInventario,
    movimientosRecientes,
    inventoryStock,
    warehouses,
  } = warehouseData

  const inventoryValuationData = useMemo(() => {
    return (inventoryStock || []).map((stock: any) => ({
      sku: stock.sku,
      producto: stock.productoNombre,
      almacen: stock.almacenNombre,
      cantidad: stock.cantidadActual,
      costoPromedio: stock.costoPromedio,
      valorTotal: stock.cantidadActual * stock.costoPromedio,
    }))
  }, [inventoryStock])

  const reorderPointData = useMemo(() => {
    return (inventoryStock || [])
      .filter((stock: any) => {
        const puntoReorden = stock.puntoReorden || stock.minimoStock || 0
        return stock.cantidadActual <= puntoReorden
      })
      .map((stock: any) => ({
        sku: stock.sku,
        producto: stock.productoNombre,
        almacen: stock.almacenNombre,
        cantidadActual: stock.cantidadActual,
        puntoReorden: stock.puntoReorden || stock.minimoStock || 0,
        cantidadSugerida: (stock.maximoStock || 0) - stock.cantidadActual,
      }))
  }, [inventoryStock])

  const warehousePerformanceData = useMemo(() => {
    return (warehouses || []).map((warehouse: any) => {
      const warehouseStock = (inventoryStock || []).filter((s: any) => s.almacenId === warehouse.id)
      const valorInventario = warehouseStock.reduce(
        (sum: number, s: any) => sum + (s.cantidadActual || 0) * (s.costoPromedio || 0),
        0,
      )
      const ocupacion = warehouse.capacidadMaxima
        ? ((warehouseStock.length / warehouse.capacidadMaxima) * 100).toFixed(1)
        : "N/A"

      return {
        codigo: warehouse.codigo,
        nombre: warehouse.nombre,
        tipo: warehouse.tipo,
        productos: warehouseStock.length,
        valorInventario,
        ocupacion,
      }
    })
  }, [warehouses, inventoryStock])

  const handleExportInventoryValuation = () => {
    console.log("[v0] Exporting inventory valuation report")
    const headers = ["SKU", "Producto", "Almacén", "Cantidad", "Costo Promedio", "Valor Total"]
    const rows = inventoryValuationData.map((item: any) => [
      item.sku,
      item.producto,
      item.almacen,
      item.cantidad,
      item.costoPromedio.toFixed(2),
      item.valorTotal.toFixed(2),
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `valuacion-inventario-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const handleExportStockMovements = () => {
    console.log("[v0] Exporting stock movements report")
    const headers = ["Folio", "Fecha", "Tipo", "Almacén", "Producto", "Cantidad", "Motivo"]
    const rows = (movimientosRecientes || []).map((m: any) => [
      m.folio,
      m.fecha ? format(new Date(m.fecha), "dd/MM/yyyy HH:mm") : "",
      m.tipo,
      m.almacenNombre,
      m.productoNombre,
      m.cantidad,
      m.motivo || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `movimientos-stock-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const handleExportReorderPoint = () => {
    console.log("[v0] Exporting reorder point report")
    const headers = ["SKU", "Producto", "Almacén", "Cantidad Actual", "Punto Reorden", "Cantidad Sugerida"]
    const rows = reorderPointData.map((item: any) => [
      item.sku,
      item.producto,
      item.almacen,
      item.cantidadActual,
      item.puntoReorden,
      item.cantidadSugerida,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `punto-reorden-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const handleExportWarehousePerformance = () => {
    console.log("[v0] Exporting warehouse performance report")
    const headers = ["Código", "Nombre", "Tipo", "Productos", "Valor Inventario", "Ocupación %"]
    const rows = warehousePerformanceData.map((item: any) => [
      item.codigo,
      item.nombre,
      item.tipo,
      item.productos,
      item.valorInventario.toFixed(2),
      item.ocupacion,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `desempeno-almacenes-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const reports = [
    {
      id: "inventory-valuation",
      title: "Valuación de Inventario",
      description: "Reporte del valor total del inventario por almacén y producto",
      icon: TrendingUp,
      color: "text-green-500",
      count: inventoryValuationData.length,
      onExport: handleExportInventoryValuation,
    },
    {
      id: "stock-movements",
      title: "Movimientos de Stock",
      description: "Historial completo de entradas, salidas y transferencias",
      icon: Package,
      color: "text-blue-500",
      count: movimientosRecientes?.length || 0,
      onExport: handleExportStockMovements,
    },
    {
      id: "reorder-point",
      title: "Punto de Reorden",
      description: "Productos que necesitan reabastecimiento",
      icon: AlertCircle,
      color: "text-yellow-500",
      count: reorderPointData.length,
      onExport: handleExportReorderPoint,
    },
    {
      id: "warehouse-performance",
      title: "Desempeño por Almacén",
      description: "Análisis de rotación y ocupación de cada almacén",
      icon: BarChart3,
      color: "text-purple-500",
      count: warehousePerformanceData.length,
      onExport: handleExportWarehousePerformance,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Almacenes Activos</p>
            <p className="text-2xl font-bold">{almacenesActivos || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Productos Totales</p>
            <p className="text-2xl font-bold">{productosTotales || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bajo Punto Reorden</p>
            <p className="text-2xl font-bold">{bajoPuntoReorden || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">
              ${(valorTotalInventario || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-8 h-8 ${report.color}`} />
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <p className="text-sm font-medium mt-2">{report.count} registros</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={report.onExport}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Reporte
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={report.onExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {(movimientosRecientes || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay movimientos recientes</div>
          ) : (
            <div className="space-y-2">
              {(movimientosRecientes || []).slice(0, 5).map((movement: any) => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{movement.productoNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.tipo} - {movement.almacenNombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{movement.cantidad} unidades</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.fecha ? format(new Date(movement.fecha), "dd/MM/yyyy") : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
