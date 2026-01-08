"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Calendar, CheckCircle, AlertTriangle, Settings, Gauge, FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMaintenanceData } from "@/hooks/use-maintenance-data"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const {
    equipment,
    preventivos,
    workOrders,
    readings,
    otsTotales,
    otsProgramadas,
    otsCompletadas,
    cumplimientoPercentage,
    otsVencidas,
    loading,
  } = useMaintenanceData()

  const formatCurrency = (value: number | undefined) => {
    if (!value || isNaN(value)) return "$0.00"
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date: any) => {
    if (!date) return "-"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString("es-MX")
  }

  const filteredEquipment = equipment.filter(
    (eq) =>
      eq.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.planta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.categoria?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground mt-2">
            Gestión integral de mantenimiento preventivo y correctivo de equipos
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva OT
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <Wrench className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">OT's Totales</p>
            <p className="text-2xl font-bold mt-1">{otsTotales}</p>
            <p className="text-xs text-muted-foreground mt-1">Este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Programadas</p>
            <p className="text-2xl font-bold mt-1">{otsProgramadas}</p>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-sm text-muted-foreground">Completadas</p>
            <p className="text-2xl font-bold mt-1">{otsCompletadas}</p>
            <p className="text-xs text-green-600 mt-1">{cumplimientoPercentage}% cumplimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-sm text-muted-foreground">Vencidas</p>
            <p className="text-2xl font-bold mt-1">{otsVencidas}</p>
            <p className="text-xs text-yellow-600 mt-1">{otsVencidas > 0 ? "Requiere atención" : "Al corriente"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipos">
            <Settings className="w-4 h-4 mr-2" />
            Catálogo de Equipos
          </TabsTrigger>
          <TabsTrigger value="preventivos">
            <Calendar className="w-4 h-4 mr-2" />
            Mantenimientos Preventivos
          </TabsTrigger>
          <TabsTrigger value="ordenes">
            <Wrench className="w-4 h-4 mr-2" />
            Órdenes de Trabajo
          </TabsTrigger>
          <TabsTrigger value="lecturas">
            <Gauge className="w-4 h-4 mr-2" />
            Lecturas
          </TabsTrigger>
          <TabsTrigger value="reportes">
            <FileText className="w-4 h-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Equipos por Planta</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Equipo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando equipos...</div>
              ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay equipos registrados. Agrega tu primer equipo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Equipo</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Planta</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Categoría</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Modelo/Serie</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Lectura</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Próximo Mant.</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2 text-sm font-medium">{item.id?.substring(0, 6).toUpperCase()}</td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm font-medium">{item.nombre}</p>
                              <p className="text-xs text-muted-foreground">
                                Frec: {item.frecuenciaMantenimiento} {item.unidadLectura}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">{item.planta}</td>
                          <td className="py-3 px-2 text-sm">{item.categoria}</td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm">{item.modelo}</p>
                              <p className="text-xs text-muted-foreground">{item.serie}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            {item.lecturaActual} {item.unidadLectura}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {formatDate(item.proximoMantenimiento)}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                item.estado === "operativo"
                                  ? "outline"
                                  : item.estado === "alerta"
                                    ? "destructive"
                                    : "default"
                              }
                            >
                              {item.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preventivos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Mantenimientos Preventivos</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Preventivo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventivos.map((pm) => (
                  <div key={pm.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {pm.id} - {pm.equipment}
                          </h3>
                          <Badge variant="outline">{pm.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{pm.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Frecuencia</p>
                        <p className="text-sm">{pm.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Tiempo Estimado</p>
                        <p className="text-sm">{pm.estimatedTime}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Última Ejecución</p>
                        <p className="text-sm">{pm.lastExecution}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Tareas a Realizar</p>
                      <div className="flex flex-wrap gap-2">
                        {pm.tasks.map((task, idx) => (
                          <Badge key={idx} variant="secondary">
                            {task}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Refacciones Necesarias</p>
                      <div className="flex flex-wrap gap-2">
                        {pm.spareParts.map((part, idx) => (
                          <Badge key={idx} variant="outline">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordenes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Visualizador de Órdenes de Trabajo</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Generar Automáticas
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva OT Manual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {wo.id} - {wo.equipment}
                          </h3>
                          <Badge variant={wo.type === "Preventivo" ? "default" : "destructive"}>{wo.type}</Badge>
                          <Badge
                            variant={
                              wo.priority === "Alta" ? "destructive" : wo.priority === "Media" ? "default" : "secondary"
                            }
                          >
                            {wo.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Programado: {wo.scheduledDate} | Técnico: {wo.technician}
                        </p>
                        {wo.failureCause && (
                          <p className="text-sm text-red-600 mt-1">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Causa: {wo.failureCause}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          wo.status === "Completado" ? "outline" : wo.status === "En Proceso" ? "default" : "secondary"
                        }
                      >
                        {wo.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Costo Total</p>
                        <p className="text-sm font-semibold">{formatCurrency(wo.estimatedCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Mano de Obra</p>
                        <p className="text-sm">{formatCurrency(wo.laborCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Refacciones</p>
                        <p className="text-sm">{formatCurrency(wo.spareCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Costo de Paro</p>
                        <p className="text-sm">{formatCurrency(wo.downtimeCost)}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Tareas</p>
                      <div className="flex flex-wrap gap-2">
                        {wo.tasks.map((task, idx) => (
                          <Badge key={idx} variant="secondary">
                            {task}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Refacciones a Utilizar</p>
                      <div className="flex flex-wrap gap-2">
                        {wo.spareParts.map((part, idx) => (
                          <Badge key={idx} variant="outline">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lecturas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registro de Lecturas por Equipo</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Actualizar Lectura
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Equipo</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Lectura Actual</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Última Actualización
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Próxima Lectura</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading) => (
                      <tr key={reading.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm font-medium">{reading.id?.substring(0, 6).toUpperCase()}</td>
                        <td className="py-3 px-2 text-sm">{reading.equipment}</td>
                        <td className="py-3 px-2 text-sm font-semibold">{reading.currentReading}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{formatDate(reading.lastUpdate)}</td>
                        <td className="py-3 px-2 text-sm">{reading.nextReading}</td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm">
                            Actualizar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de OT's</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Semana 1 (Ene 15-21)</p>
                      <p className="text-sm text-muted-foreground">5 OT's programadas</p>
                    </div>
                    <Badge>5</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Semana 2 (Ene 22-28)</p>
                      <p className="text-sm text-muted-foreground">7 OT's programadas</p>
                    </div>
                    <Badge>7</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Semana 3 (Ene 29-Feb 4)</p>
                      <p className="text-sm text-muted-foreground">6 OT's programadas</p>
                    </div>
                    <Badge>6</Badge>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Ver Calendario Completo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Costos de Mantenimiento por Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.slice(0, 4).map((eq) => (
                    <div key={eq.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{eq.nombre}</p>
                        <p className="text-sm font-semibold">{formatCurrency(eq.cost)}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${Math.random() * 60 + 40}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Total Acumulado</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(40700)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pronóstico de Costos Preventivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div>
                      <p className="font-medium">Próximos 30 días</p>
                      <p className="text-sm text-muted-foreground">12 mantenimientos</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(8450)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div>
                      <p className="font-medium">Próximos 90 días</p>
                      <p className="text-sm text-muted-foreground">35 mantenimientos</p>
                    </div>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(22300)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <div>
                      <p className="font-medium">Anual (proyección)</p>
                      <p className="text-sm text-muted-foreground">140 mantenimientos</p>
                    </div>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(95800)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requisiciones Generadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Requisiciones de compra generadas automáticamente basadas en OT's programadas
                  </p>
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">REQ-2024-015</p>
                      <Badge variant="default">Pendiente</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Refacciones para OT's semana 3</p>
                    <p className="text-sm font-semibold mt-2">{formatCurrency(3450)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">REQ-2024-016</p>
                      <Badge variant="outline">Aprobada</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Filtros y lubricantes varios</p>
                    <p className="text-sm font-semibold mt-2">{formatCurrency(1890)}</p>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Ver Todas las Requisiciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
