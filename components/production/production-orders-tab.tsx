"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { ProductionOrder } from "@/lib/types"

interface ProductionOrdersTabProps {
  orders: ProductionOrder[]
  searchQuery: string
  statusFilter: string
  priorityFilter: string
  onCreate: (order: Omit<ProductionOrder, "id">) => Promise<ProductionOrder>
  onUpdate: (id: string, updates: Partial<ProductionOrder>) => Promise<ProductionOrder | null>
  onDelete: (id: string) => Promise<boolean>
}

export function ProductionOrdersTab({
  orders,
  searchQuery,
  statusFilter,
  priorityFilter,
  onCreate,
  onUpdate,
  onDelete,
}: ProductionOrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || order.status === statusFilter
      const matchesPriority = !priorityFilter || order.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [orders, searchQuery, statusFilter, priorityFilter])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "outline"
      case "in_process":
        return "default"
      case "on_hold":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "in_process":
        return "En Proceso"
      case "completed":
        return "Completado"
      case "on_hold":
        return "Pausado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleCreate = () => {
    alert("Abrir modal para crear nueva orden de producción")
  }

  const handleEdit = (order: ProductionOrder) => {
    setSelectedOrder(order)
    alert(`Abrir modal para editar orden ${order.folio}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta orden?")) {
      await onDelete(id)
    }
  }

  const handleUpdateStatus = async (order: ProductionOrder, newStatus: ProductionOrder["status"]) => {
    await onUpdate(order.id, { status: newStatus })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Programación de Órdenes de Producción</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay órdenes de producción</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Orden</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Producto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cantidad</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Progreso</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prioridad</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const percentage = (order.completed / order.quantity) * 100
                  return (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 px-2 text-sm font-medium">{order.folio}</td>
                      <td className="py-3 px-2 text-sm">{order.productName}</td>
                      <td className="py-3 px-2 text-sm">
                        {order.completed} / {order.quantity}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{order.priority}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
