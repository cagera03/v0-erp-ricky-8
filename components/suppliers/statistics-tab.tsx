"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, ShoppingCart, Star } from "lucide-react"
import { useSuppliersData } from "@/hooks/use-suppliers-data"

export function StatisticsTab() {
  const { topProveedores, ordenesCompraEstadisticas, loading } = useSuppliersData()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando estadísticas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Purchase Order Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Borrador</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.borrador}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Autorizada</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.autorizada}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Enviada</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.enviada}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Parcial</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.recibida_parcial}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completa</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.recibida_completa}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cancelada</p>
              <p className="text-2xl font-bold">{ordenesCompraEstadisticas.cancelada}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Proveedores por Volumen de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {!topProveedores || topProveedores.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProveedores.map((supplier, index) => (
                <Card key={supplier.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{supplier.nombre}</p>
                          <Badge variant={supplier.estadoProveedor === "activo" ? "default" : "secondary"}>
                            {supplier.estadoProveedor}
                          </Badge>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            <span>
                              ${(supplier.comprasTotales || 0).toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>{supplier.productosSuministrados?.length || 0} productos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{(supplier.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
