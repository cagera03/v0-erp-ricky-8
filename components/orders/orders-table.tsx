"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, Search, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useFirestore } from "@/hooks/use-firestore"
import { COLLECTIONS } from "@/lib/firestore"
import type { Order } from "@/lib/types"
import { Timestamp } from "firebase/firestore"
import { OrderDetailDrawer } from "@/components/dashboard/order-detail-drawer"

const statusConfig = {
  pending: { label: "Pendiente", variant: "secondary" as const },
  processing: { label: "En Proceso", variant: "default" as const },
  completed: { label: "Completado", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
}

export function OrdersTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { items: orders, loading } = useFirestore<Order>(COLLECTIONS.orders, [], true)

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      (order.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (order.customer?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (order.product?.toLowerCase() || "").includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Timestamp | string | undefined) => {
    if (!date) return "N/A"
    try {
      const d = date instanceof Timestamp ? date.toDate() : new Date(date)
      if (isNaN(d.getTime())) return "N/A"
      return d.toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
      return "N/A"
    }
  }

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== "number") return "$0.00"
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDrawerOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Lista de Órdenes</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar órdenes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">En Proceso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all" ? "No se encontraron órdenes" : "Aún no hay órdenes registradas"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cantidad</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Entrega</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm font-medium">{order.id || "N/A"}</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium">{order.customer || "N/A"}</p>
                          {order.customerEmail && (
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">{order.product || "N/A"}</td>
                      <td className="py-3 px-2 text-sm text-center">{order.quantity || 0}</td>
                      <td className="py-3 px-2 text-sm font-medium">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-2">
                        <Badge variant={statusConfig[order.status]?.variant || "secondary"}>
                          {statusConfig[order.status]?.label || "Desconocido"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{formatDate(order.date)}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{formatDate(order.deliveryDate)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailDrawer orderId={selectedOrderId} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
