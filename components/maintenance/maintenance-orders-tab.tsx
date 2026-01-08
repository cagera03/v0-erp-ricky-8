"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Play, CheckCircle, FileText } from "lucide-react"
import type { WorkOrder, Equipment, MaintenanceTechnician } from "@/lib/types"
import { Timestamp } from "firebase/firestore"

interface MaintenanceOrdersTabProps {
  workOrders: WorkOrder[]
  equipment: Equipment[]
  technicians: MaintenanceTechnician[]
  searchQuery: string
  statusFilter: string
  onCreate: (order: Omit<WorkOrder, "id">) => Promise<WorkOrder>
  onUpdate: (id: string, updates: Partial<WorkOrder>) => Promise<WorkOrder | null>
  onComplete: (
    orderId: string,
    data: {
      observaciones?: string
      tiempoReal: number
      costoManoObra: number
      lecturaEquipo?: number
      completadoPor: string
      completadoPorNombre: string
    },
  ) => Promise<any>
}

export function MaintenanceOrdersTab({
  workOrders,
  equipment,
  technicians,
  searchQuery,
  statusFilter,
  onCreate,
  onUpdate,
  onComplete,
}: MaintenanceOrdersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)

  // Form state for new work order
  const [formData, setFormData] = useState({
    tipo: "correctivo",
    equipoId: "",
    prioridad: "media",
    fechaProgramada: "",
    tecnicoAsignadoId: "",
    descripcionProblema: "",
  })

  // Complete form state
  const [completeData, setCompleteData] = useState({
    observaciones: "",
    tiempoReal: 0,
    costoManoObra: 0,
    lecturaEquipo: 0,
  })

  const filteredOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.equipoNombre.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || statusFilter === "Todos" || order.estado === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [workOrders, searchQuery, statusFilter])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completada":
        return "outline"
      case "en_proceso":
        return "default"
      case "cancelada":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      programada: "Programada",
      en_proceso: "En Proceso",
      completada: "Completada",
      cancelada: "Cancelada",
    }
    return labels[status] || status
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "destructive"
      case "alta":
        return "destructive"
      case "media":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleCreate = () => {
    setSelectedOrder(null)
    setFormData({
      tipo: "correctivo",
      equipoId: "",
      prioridad: "media",
      fechaProgramada: "",
      tecnicoAsignadoId: "",
      descripcionProblema: "",
    })
    setDialogOpen(true)
  }

  const handleStart = async (order: WorkOrder) => {
    await onUpdate(order.id!, {
      estado: "en_proceso",
      fechaInicio: Timestamp.now(),
    })
  }

  const handleCompleteOpen = (order: WorkOrder) => {
    setSelectedOrder(order)
    const equipo = equipment.find((e) => e.id === order.equipoId)
    setCompleteData({
      observaciones: "",
      tiempoReal: order.tiempoEstimado || 0,
      costoManoObra: 0,
      lecturaEquipo: equipo?.lecturaActual || 0,
    })
    setCompleteDialogOpen(true)
  }

  const handleComplete = async () => {
    if (!selectedOrder) return

    await onComplete(selectedOrder.id!, {
      ...completeData,
      completadoPor: "current-user-id", // TODO: Get from auth
      completadoPorNombre: "Usuario Actual", // TODO: Get from auth
    })

    setCompleteDialogOpen(false)
    setSelectedOrder(null)
  }

  const handleSave = async () => {
    const equipo = equipment.find((e) => e.id === formData.equipoId)
    const tecnico = technicians.find((t) => t.id === formData.tecnicoAsignadoId)

    if (!equipo) return

    const newOrder: Omit<WorkOrder, "id" | "companyId" | "createdAt" | "updatedAt"> = {
      folio: `WO-${Date.now()}`,
      tipo: formData.tipo as "preventivo" | "correctivo" | "predictivo" | "mejora",
      equipoId: equipo.id!,
      equipoNombre: equipo.nombre,
      equipoCodigo: equipo.codigo,
      equipoPlanta: equipo.planta,
      estado: "draft",
      prioridad: formData.prioridad as "baja" | "media" | "alta" | "urgente",
      fechaCreacion: Timestamp.now(),
      fechaProgramada: Timestamp.fromDate(new Date(formData.fechaProgramada)),
      tecnicoAsignadoId: tecnico?.id,
      tecnicoAsignadoNombre: tecnico?.nombre,
      descripcionProblema: formData.descripcionProblema,
      actividades: [],
      refacciones: [],
      requiereAprobacion: equipo.criticidad === "critica",
      costoManoObra: 0,
      costoRefacciones: 0,
      costoParo: 0,
      costoTotal: 0,
    }

    await onCreate(newOrder)
    setDialogOpen(false)
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Timestamp ? date.toDate() : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
  }

  if (filteredOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No hay órdenes de trabajo</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden de Trabajo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{order.folio}</h3>
                    <Badge variant={getStatusVariant(order.estado)}>{getStatusLabel(order.estado)}</Badge>
                    <Badge variant={getPriorityVariant(order.prioridad)}>{order.prioridad}</Badge>
                    <Badge variant="outline">{order.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.equipoCodigo} - {order.equipoNombre}
                  </p>
                  <p className="text-xs text-muted-foreground">Planta: {order.equipoPlanta}</p>
                </div>
                <div className="flex gap-2">
                  {order.estado === "programada" && (
                    <Button size="sm" onClick={() => handleStart(order)}>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                  {order.estado === "en_proceso" && (
                    <Button size="sm" onClick={() => handleCompleteOpen(order)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completar
                    </Button>
                  )}
                </div>
              </div>

              {order.preventivo && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Mantenimiento Preventivo</p>
                  <p className="text-xs text-muted-foreground">
                    {order.preventivo.preventivoCodigo} - {order.preventivo.preventivoNombre}
                  </p>
                  {order.preventivo.generadoAutomaticamente && (
                    <Badge variant="secondary" className="mt-1">
                      Generado automáticamente
                    </Badge>
                  )}
                </div>
              )}

              {order.descripcionProblema && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Descripción del Problema</p>
                  <p className="text-sm text-muted-foreground">{order.descripcionProblema}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Programado</p>
                  <p className="text-sm">{formatDate(order.fechaProgramada)}</p>
                </div>
                {order.tecnicoAsignadoNombre && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Técnico</p>
                    <p className="text-sm">{order.tecnicoAsignadoNombre}</p>
                  </div>
                )}
                {order.tiempoEstimado && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tiempo Estimado</p>
                    <p className="text-sm">{order.tiempoEstimado} min</p>
                  </div>
                )}
                {order.tiempoReal && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tiempo Real</p>
                    <p className="text-sm">{order.tiempoReal} min</p>
                  </div>
                )}
              </div>

              {order.estado === "completada" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mano de Obra</p>
                    <p className="text-sm font-semibold">{formatCurrency(order.costoManoObra)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Refacciones</p>
                    <p className="text-sm font-semibold">{formatCurrency(order.costoRefacciones)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Paro</p>
                    <p className="text-sm font-semibold">{formatCurrency(order.costoParo)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-semibold text-primary">{formatCurrency(order.costoTotal)}</p>
                  </div>
                </div>
              )}

              {order.actividades && order.actividades.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Actividades</p>
                  <div className="space-y-1">
                    {order.actividades.map((act, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {act.completada ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                        )}
                        <span className="text-sm">{act.descripcion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correctivo">Correctivo</SelectItem>
                    <SelectItem value="preventivo">Preventivo</SelectItem>
                    <SelectItem value="predictivo">Predictivo</SelectItem>
                    <SelectItem value="mejora">Mejora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridad</Label>
                <Select value={formData.prioridad} onValueChange={(v) => setFormData({ ...formData, prioridad: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Equipo *</Label>
              <Select value={formData.equipoId} onValueChange={(v) => setFormData({ ...formData, equipoId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id!}>
                      {eq.codigo} - {eq.nombre} ({eq.planta})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Técnico Asignado</Label>
              <Select
                value={formData.tecnicoAsignadoId}
                onValueChange={(v) => setFormData({ ...formData, tecnicoAsignadoId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians
                    .filter((t) => t.disponible)
                    .map((tech) => (
                      <SelectItem key={tech.id} value={tech.id!}>
                        {tech.nombre} - {tech.especialidades.join(", ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha Programada *</Label>
              <Input
                type="datetime-local"
                value={formData.fechaProgramada}
                onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
              />
            </div>

            <div>
              <Label>Descripción del Problema</Label>
              <Textarea
                value={formData.descripcionProblema}
                onChange={(e) => setFormData({ ...formData, descripcionProblema: e.target.value })}
                rows={4}
                placeholder="Describe el problema o la tarea a realizar..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.equipoId || !formData.fechaProgramada}>
              Crear Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Completar Orden de Trabajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tiempo Real (minutos) *</Label>
                <Input
                  type="number"
                  value={completeData.tiempoReal}
                  onChange={(e) => setCompleteData({ ...completeData, tiempoReal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Costo Mano de Obra *</Label>
                <Input
                  type="number"
                  value={completeData.costoManoObra}
                  onChange={(e) => setCompleteData({ ...completeData, costoManoObra: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Lectura del Equipo</Label>
              <Input
                type="number"
                value={completeData.lecturaEquipo}
                onChange={(e) => setCompleteData({ ...completeData, lecturaEquipo: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Observaciones</Label>
              <Textarea
                value={completeData.observaciones}
                onChange={(e) => setCompleteData({ ...completeData, observaciones: e.target.value })}
                rows={4}
                placeholder="Describe lo realizado, hallazgos, recomendaciones..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleComplete}>Completar Orden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
