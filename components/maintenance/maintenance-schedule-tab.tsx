"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Wrench, AlertCircle } from "lucide-react"
import type { PreventiveMaintenance, Equipment } from "@/lib/types"
import { Timestamp } from "firebase/firestore"

interface MaintenanceScheduleTabProps {
  preventivos: PreventiveMaintenance[]
  equipment: Equipment[]
  onGenerateAutomatic: () => Promise<number>
}

export function MaintenanceScheduleTab({ preventivos, equipment, onGenerateAutomatic }: MaintenanceScheduleTabProps) {
  const [generating, setGenerating] = useState(false)

  const upcomingMaintenance = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return preventivos
      .filter((pm) => {
        if (pm.estado !== "activo") return false

        if (pm.tipo === "calendario" && pm.proximaFechaEjecucion) {
          const proximaFecha =
            pm.proximaFechaEjecucion instanceof Timestamp
              ? pm.proximaFechaEjecucion.toDate()
              : new Date(pm.proximaFechaEjecucion)
          return proximaFecha >= now && proximaFecha <= thirtyDaysFromNow
        } else if (pm.tipo === "lectura" && pm.proximaLectura) {
          const equipo = equipment.find((e) => e.id === pm.equipoId)
          if (equipo) {
            const diff = pm.proximaLectura - equipo.lecturaActual
            return diff >= 0 && diff <= (pm.periodicidadLectura || 0) * 0.2 // 20% threshold
          }
        }

        return false
      })
      .sort((a, b) => {
        if (a.tipo === "calendario" && b.tipo === "calendario") {
          const dateA =
            a.proximaFechaEjecucion instanceof Timestamp
              ? a.proximaFechaEjecucion.toMillis()
              : new Date(a.proximaFechaEjecucion || 0).getTime()
          const dateB =
            b.proximaFechaEjecucion instanceof Timestamp
              ? b.proximaFechaEjecucion.toMillis()
              : new Date(b.proximaFechaEjecucion || 0).getTime()
          return dateA - dateB
        }
        return 0
      })
  }, [preventivos, equipment])

  const overduePreventive = useMemo(() => {
    const now = new Date()

    return preventivos.filter((pm) => {
      if (pm.estado !== "activo") return false

      if (pm.tipo === "calendario" && pm.proximaFechaEjecucion) {
        const proximaFecha =
          pm.proximaFechaEjecucion instanceof Timestamp
            ? pm.proximaFechaEjecucion.toDate()
            : new Date(pm.proximaFechaEjecucion)
        return proximaFecha < now
      } else if (pm.tipo === "lectura" && pm.proximaLectura) {
        const equipo = equipment.find((e) => e.id === pm.equipoId)
        return equipo && equipo.lecturaActual >= pm.proximaLectura
      }

      return false
    })
  }, [preventivos, equipment])

  const handleGenerateAutomatic = async () => {
    setGenerating(true)
    await onGenerateAutomatic()
    setGenerating(false)
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Timestamp ? date.toDate() : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Próximos Mantenimientos (30 días)</h3>
          <p className="text-sm text-muted-foreground">{upcomingMaintenance.length} mantenimientos programados</p>
        </div>
        <Button onClick={handleGenerateAutomatic} disabled={generating}>
          {generating ? "Generando..." : "Generar OTs Automáticas"}
        </Button>
      </div>

      {overduePreventive.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h4 className="font-semibold text-destructive">Mantenimientos Vencidos ({overduePreventive.length})</h4>
            </div>
            <div className="space-y-2">
              {overduePreventive.map((pm) => {
                const equipo = equipment.find((e) => e.id === pm.equipoId)
                return (
                  <div key={pm.id} className="p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {pm.codigo} - {pm.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">Equipo: {pm.equipoNombre}</p>
                      </div>
                      <Badge variant="destructive">{pm.tipo}</Badge>
                    </div>
                    {pm.tipo === "calendario" && (
                      <p className="text-sm mt-2">Vencido el: {formatDate(pm.proximaFechaEjecucion)}</p>
                    )}
                    {pm.tipo === "lectura" && equipo && (
                      <p className="text-sm mt-2">
                        Lectura actual: {equipo.lecturaActual} / {pm.proximaLectura} {equipo.unidadLectura}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {upcomingMaintenance.map((pm) => {
          const equipo = equipment.find((e) => e.id === pm.equipoId)
          return (
            <Card key={pm.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold mb-1">
                      {pm.codigo} - {pm.nombre}
                    </h4>
                    <p className="text-sm text-muted-foreground">{pm.equipoNombre}</p>
                  </div>
                  <Badge variant="outline">{pm.tipo}</Badge>
                </div>

                {pm.descripcion && <p className="text-sm text-muted-foreground mb-3">{pm.descripcion}</p>}

                <div className="space-y-2 text-sm">
                  {pm.tipo === "calendario" && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Próxima ejecución: {formatDate(pm.proximaFechaEjecucion)}</span>
                    </div>
                  )}
                  {pm.tipo === "lectura" && equipo && (
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Lectura: {equipo.lecturaActual} / {pm.proximaLectura} {equipo.unidadLectura}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Duración estimada: {pm.tiempoEstimadoTotal} min</span>
                  </div>
                  {pm.tecnicoAsignadoNombre && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Técnico:</span>
                      <span className="font-medium">{pm.tecnicoAsignadoNombre}</span>
                    </div>
                  )}
                </div>

                {pm.actividades && pm.actividades.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Actividades ({pm.actividades.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pm.actividades.slice(0, 3).map((act, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {act.descripcion.substring(0, 20)}...
                        </Badge>
                      ))}
                      {pm.actividades.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{pm.actividades.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {pm.refacciones && pm.refacciones.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Refacciones requeridas ({pm.refacciones.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pm.refacciones.slice(0, 3).map((ref, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ref.nombre} ({ref.cantidad})
                        </Badge>
                      ))}
                      {pm.refacciones.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pm.refacciones.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {upcomingMaintenance.length === 0 && overduePreventive.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay mantenimientos programados para los próximos 30 días</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
