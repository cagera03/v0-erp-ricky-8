"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, CheckCircle2, CreditCard, Truck } from "lucide-react"

interface OnlineOrdersTabProps {
  data: {
    orders: any[]
    ordenesPendientes: number
    ventasDelMes: number
  }
}

export function OnlineOrdersTab({ data }: OnlineOrdersTabProps) {
  const { orders, ordenesPendientes, ventasDelMes } = data

  const statusConfig = {
    pendiente: { label: "Pendiente", variant: "secondary" as const },
    confirmado: { label: "Confirmado", variant: "default" as const },
    pagado: { label: "Pagado", variant: "default" as const },
    procesando: { label: "Procesando", variant: "default" as const },
    enviado: { label: "Enviado", variant: "outline" as const },
    entregado: { label: "Entregado", variant: "outline" as const },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendientes</p>
                <p className="text-2xl font-bold">{ordenesPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas del Mes</p>
                <p className="text-2xl font-bold">${ventasDelMes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Pedidos Online</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos registrados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pedido</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pago</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{order.folio || order.id}</td>
                        <td className="py-3 px-2 text-sm">{order.clienteNombre || "N/A"}</td>
                        <td className="py-3 px-2 text-sm">{order.items?.length || 0}</td>
                        <td className="py-3 px-2 text-sm font-medium">${Number(order.total || 0).toLocaleString()}</td>
                        <td className="py-3 px-2 text-sm">{order.metodoPago || "N/A"}</td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              statusConfig[order.estadoPedido as keyof typeof statusConfig]?.variant || "secondary"
                            }
                          >
                            {statusConfig[order.estadoPedido as keyof typeof statusConfig]?.label || order.estadoPedido}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Cotización de Envío Automática</p>
                    <p className="text-sm text-blue-700 mt-1">
                      El sistema cotiza automáticamente con Estafeta y otras mensajerías el costo de envío para cada
                      pedido.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
