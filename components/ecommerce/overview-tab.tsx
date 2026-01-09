"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface OverviewTabProps {
  data: {
    orders: any[]
  }
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { orders } = data

  const statusConfig = {
    pendiente: { label: "Pendiente", variant: "secondary" as const },
    confirmado: { label: "Confirmado", variant: "default" as const },
    pagado: { label: "Pagado", variant: "default" as const },
    procesando: { label: "Procesando", variant: "default" as const },
    enviado: { label: "Enviado", variant: "outline" as const },
    entregado: { label: "Entregado", variant: "outline" as const },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes Online</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay pedidos registrados</p>
            <p className="text-sm text-muted-foreground mt-2">
              Los pedidos aparecerán aquí cuando los clientes realicen compras
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Productos</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Método Pago</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 px-2 text-sm font-medium">{order.folio || order.id}</td>
                    <td className="py-3 px-2 text-sm">{order.clienteNombre || "N/A"}</td>
                    <td className="py-3 px-2 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3 px-2 text-sm font-medium">${Number(order.total || 0).toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={statusConfig[order.estadoPedido as keyof typeof statusConfig]?.variant || "secondary"}
                      >
                        {statusConfig[order.estadoPedido as keyof typeof statusConfig]?.label || order.estadoPedido}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm">{order.metodoPago || "N/A"}</td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
