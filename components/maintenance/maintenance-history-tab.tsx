"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Wrench, Gauge, Clock } from "lucide-react"
import type { Equipment, WorkOrder, EquipmentReading } from "@/lib/types"
import { Timestamp } from "firebase/firestore"

interface MaintenanceHistoryTabProps {
  equipment: Equipment[]
  getEquipmentHistory: (equipoId: string) => {
    workOrders: WorkOrder[]
    readings: EquipmentReading[]
  }
}

export function MaintenanceHistoryTab({ equipment, getEquipmentHistory }: MaintenanceHistoryTabProps) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("")
  const [viewMode, setViewMode] = useState<"timeline" | "workorders" | "readings">("timeline")

  const history = useMemo(() => {
    if (!selectedEquipmentId) return { workOrders: [], readings: [], timeline: [] }

    const { workOrders, readings } = getEquipmentHistory(selectedEquipmentId)

    // Create unified timeline
    const timeline: Array<{ type: "wo" | "reading"; date: Date; item: WorkOrder | EquipmentReading }> = []

    workOrders.forEach((wo) => {
      const date = wo.fechaFinalizacion
        ? wo.fechaFinalizacion instanceof Timestamp
          ? wo.fechaFinalizacion.toDate()
          : new Date(wo.fechaFinalizacion)
        : wo.fechaCreacion instanceof Timestamp
          ? wo.fechaCreacion.toDate()
          : new Date(wo.fechaCreacion)

      timeline.push({ type: "wo", date, item: wo })
    })

    readings.forEach((reading) => {
      const date = reading.fecha instanceof Timestamp ? reading.fecha.toDate() : new Date(reading.fecha)
      timeline.push({ type: "reading", date, item: reading })
    })

    timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

    return { workOrders, readings, timeline }
  }, [selectedEquipmentId, getEquipmentHistory])

  const selectedEquipment = equipment.find((e) => e.id === selectedEquipmentId)

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Timestamp ? date.toDate() : new Date(date)
    return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatDateTime = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Timestamp ? date.toDate() : new Date(date)
    return d.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Seleccionar Equipo</label>
          <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar equipo..." />
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
        {selectedEquipmentId && (
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Línea de Tiempo</SelectItem>
              <SelectItem value="workorders">Solo OTs</SelectItem>
              <SelectItem value="readings">Solo Lecturas</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {!selectedEquipmentId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Selecciona un equipo para ver su historial</p>
          </CardContent>
        </Card>
      ) : selectedEquipment ? (
        <div className="space-y-6">
          {/* Equipment Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total OTs</p>
                  <p className="text-2xl font-bold">{history.workOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">OTs Completadas</p>
                  <p className="text-2xl font-bold">
                    {history.workOrders.filter((wo) => wo.estado === "completada").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lecturas Registradas</p>
                  <p className="text-2xl font-bold">{history.readings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lectura Actual</p>
                  <p className="text-2xl font-bold">
                    {selectedEquipment.lecturaActual} {selectedEquipment.unidadLectura}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historial Completo</h3>
              {history.timeline.map((event, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    {event.type === "wo" ? (
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{(event.item as WorkOrder).folio}</h4>
                            <Badge variant="outline">{(event.item as WorkOrder).tipo}</Badge>
                            <Badge
                              variant={(event.item as WorkOrder).estado === "completada" ? "outline" : "secondary"}
                            >
                              {(event.item as WorkOrder).estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{formatDateTime(event.date)}</p>
                          {(event.item as WorkOrder).descripcionProblema && (
                            <p className="text-sm mb-2">{(event.item as WorkOrder).descripcionProblema}</p>
                          )}
                          {(event.item as WorkOrder).estado === "completada" && (
                            <div className="flex gap-4 text-sm">
                              <span>
                                <Clock className="w-4 h-4 inline mr-1" />
                                {(event.item as WorkOrder).tiempoReal} min
                              </span>
                              <span className="font-medium">
                                {formatCurrency((event.item as WorkOrder).costoTotal)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Gauge className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Lectura Registrada</h4>
                          <p className="text-sm text-muted-foreground mb-2">{formatDateTime(event.date)}</p>
                          <p className="text-lg font-bold">
                            {(event.item as EquipmentReading).lectura} {(event.item as EquipmentReading).unidad}
                          </p>
                          {(event.item as EquipmentReading).observaciones && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {(event.item as EquipmentReading).observaciones}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Work Orders Only */}
          {viewMode === "workorders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Órdenes de Trabajo ({history.workOrders.length})</h3>
              {history.workOrders.map((wo) => (
                <Card key={wo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{wo.folio}</h4>
                          <Badge variant="outline">{wo.tipo}</Badge>
                          <Badge variant={wo.estado === "completada" ? "outline" : "secondary"}>{wo.estado}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Creado: {formatDate(wo.fechaCreacion)} | Programado: {formatDate(wo.fechaProgramada)}
                        </p>
                      </div>
                    </div>

                    {wo.descripcionProblema && <p className="text-sm mb-3">{wo.descripcionProblema}</p>}

                    {wo.estado === "completada" && (
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">Tiempo Real</p>
                          <p className="text-sm font-semibold">{wo.tiempoReal} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mano de Obra</p>
                          <p className="text-sm font-semibold">{formatCurrency(wo.costoManoObra)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Refacciones</p>
                          <p className="text-sm font-semibold">{formatCurrency(wo.costoRefacciones)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-sm font-semibold text-primary">{formatCurrency(wo.costoTotal)}</p>
                        </div>
                      </div>
                    )}

                    {wo.observaciones && (
                      <p className="text-sm text-muted-foreground mt-3 italic">{wo.observaciones}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Readings Only */}
          {viewMode === "readings" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lecturas ({history.readings.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Lectura</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Registrado Por</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.readings.map((reading) => (
                      <tr key={reading.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm">{formatDateTime(reading.fecha)}</td>
                        <td className="py-3 px-2 text-sm font-semibold">
                          {reading.lectura} {reading.unidad}
                        </td>
                        <td className="py-3 px-2 text-sm">{reading.registradoPorNombre}</td>
                        <td className="py-3 px-2">
                          {reading.estadoEquipo && (
                            <Badge
                              variant={
                                reading.estadoEquipo === "operativo"
                                  ? "outline"
                                  : reading.estadoEquipo === "alerta"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {reading.estadoEquipo}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{reading.observaciones || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
